/* ════════════════════════════════════════════════════════════════════
   Horizon AI Signal — SERP content script
   ════════════════════════════════════════════════════════════════════

   Runs in the page's isolated world on Google / DuckDuckGo / Brave
   search results pages. For each organic result card, it:

     1. Extracts the URL, title, and snippet.
     2. Runs the AIScore heuristic (score.js, loaded before this file).
     3. Injects a small "AI: NN% · band" badge under the URL.
     4. Optionally collapses the card if the user has set a hide
        threshold and the score meets/exceeds it.
     5. Wires a "✕" on the badge to dismiss the result permanently
        (per-domain override in chrome.storage.sync).

   PRIVACY
   ───────
   Everything runs locally. No page is fetched, no data is sent
   anywhere. The heuristic operates on the title and snippet text
   that the SERP is already showing you, plus the URL string. We
   never see the article body.

   LIMITS
   ──────
   This is a heuristic, not a classifier. False positives are
   possible (formal human writing flagged) and false negatives
   are possible (lightly-edited AI text passing). The UI labels
   every score "estimate" and lets users dismiss per-result.
*/

(function () {
  "use strict";

  /* ── Storage key (shared with the new-tab page) ─────────────── */
  const STORAGE_KEY = "hz";

  /* ── Result selectors per search engine ───────────────────────
     Google organic results have been `div.g` for ~15 years; we
     add a few newer fallbacks for the latest layout. We avoid
     sponsored results (marked with "Sponsored" in the cite line)
     and AI Overview / SGE boxes (`.M8OgIe`, `[data-sgrd]`). */
  const SELECTORS = {
    google: {
      result: "div.g, div[jscontroller][data-hveid] div.g, [data-snf] .g",
      anchor: "a[href]:not([role='button'])",
      title: "h3",
      snippet: ".VwiC3b, .yXK7lf, [data-content-feature], .st, .yXK7lf.MB230",
      url: "cite, .tjvcx, .dyjrff",
      skipSponsored: 'div:has-text("Sponsored"), [aria-label*="Sponsored"]',
    },
    duckduckgo: {
      result: "article[data-testid='result'], .result",
      anchor: "a[data-testid='result-title-a'], h2 a",
      title: "h2 a, h2",
      snippet: "[data-result='snippet'], .result__snippet",
      url: "[data-testid='result-extras-url-link'], .result__url",
      skipSponsored: '.result--ad, [data-testid="result-ad"]',
    },
    brave: {
      result: ".snippet[data-type='web'], .snippet",
      anchor: "a.h, a.result-header, .title a",
      title: ".title, .snippet-title",
      snippet: ".snippet-description, .snippet-content",
      url: ".snippet-url, .url",
      skipSponsored: ".ad, [data-type='ad']",
    },
  };

  function detectEngine() {
    const h = location.hostname || "";
    // Test affordance: ?hz-engine=google forces engine detection. Only
    // active when the location is NOT one of the production hosts —
    // so this can never accidentally trigger in the wild.
    if (h && !h.includes("google.") && !h.includes("duckduckgo.") && !h.includes("search.brave.")) {
      try {
        const params = new URL(location.href).searchParams;
        const forced = params.get("hz-engine");
        if (forced && SELECTORS[forced]) return forced;
      } catch (e) { /* no-op */ }
    }
    if (h.includes("google.")) return "google";
    if (h.includes("duckduckgo.")) return "duckduckgo";
    if (h.includes("search.brave.")) return "brave";
    return null;
  }

  /* ── Settings (read from sync storage) ────────────────────────
     Defaults are deliberately conservative: feature off by default
     (user opt-in), threshold at 75% (only multi-signal cases), no
     hiding. */
  const DEFAULT_PREFS = {
    aiSignal: false,
    aiSensitivity: "med",   // "low" | "med" | "high"
    aiHideAbove: 0,         // 0 = don't hide, otherwise % threshold
    aiDismissed: {},        // { "domain.com": true }
  };

  let prefs = { ...DEFAULT_PREFS };

  function loadPrefs() {
    try {
      chrome.storage.sync.get([STORAGE_KEY], (data) => {
        const s = (data && data[STORAGE_KEY]) || {};
        prefs = { ...DEFAULT_PREFS, ...s };
        AIScore.setCalibration(prefs.aiSensitivity);
        // Re-score any cards already in the DOM after a settings change.
        rescanAll();
      });
    } catch (e) {
      // Storage might be unavailable in some test contexts.
    }
  }

  // React to changes from the new-tab settings page.
  try {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== "sync" || !changes[STORAGE_KEY]) return;
      const newVal = { ...DEFAULT_PREFS, ...(changes[STORAGE_KEY].newValue || {}) };
      prefs = newVal;
      AIScore.setCalibration(prefs.aiSensitivity);
      rescanAll();
    });
  } catch (e) { /* no-op */ }

  /* ── Extraction helpers ─────────────────────────────────────── */

  function extractHostname(href) {
    try {
      const u = new URL(href);
      return u.hostname.replace(/^www\./, "");
    } catch (e) {
      return "";
    }
  }

  function isExternalHref(href) {
    if (!href) return false;
    if (href.startsWith("/") || href.startsWith("#")) return false;
    if (href.startsWith("javascript:")) return false;
    return /^https?:\/\//i.test(href);
  }

  function extractResultData(card, sel) {
    // Find the first anchor that points off-site. Most SERPs have
    // a single such anchor inside the title element.
    const anchors = card.querySelectorAll(sel.anchor);
    let url = "";
    let titleEl = null;
    for (const a of anchors) {
      if (isExternalHref(a.getAttribute("href"))) {
        url = a.getAttribute("href");
        titleEl = a;
        break;
      }
    }
    if (!url) return null;

    const title =
      (card.querySelector(sel.title) || {}).textContent?.trim() ||
      (titleEl && titleEl.textContent?.trim()) ||
      "";

    const snippetEl = card.querySelector(sel.snippet);
    const snippet = (snippetEl && snippetEl.textContent.trim()) || "";

    if (!title && !snippet) return null;

    return { url, hostname: extractHostname(url), title, snippet };
  }

  /* ── Badge injection ──────────────────────────────────────────
     Returns true if a badge was added (or already exists). */

  function ensureBadgeRow(card) {
    let row = card.querySelector(".hz-ai-badge-row");
    if (row) return row;

    row = document.createElement("div");
    row.className = "hz-ai-badge-row";

    // Try to find a "URL row" to anchor next to. Google has the
    // <cite>; DDG has `.result__url`; Brave has `.snippet-url`.
    // If we can't find one, append to the end of the card.
    const candidates = card.querySelectorAll("cite, .tjvcx, [data-testid='result-extras-url-link'], .result__url, .snippet-url, .url");
    const anchor = candidates[0] || card;
    if (anchor.nextSibling) {
      anchor.parentNode.insertBefore(row, anchor.nextSibling);
    } else {
      anchor.appendChild(row);
    }
    return row;
  }

  function bandFor(pct) {
    if (pct < 35) return "low";
    if (pct < 65) return "med";
    return "high";
  }

  function bandLabel(band) {
    return band === "low" ? "Human-like" : band === "med" ? "Mixed signals" : "Likely AI";
  }

  function renderBadge(row, score, dismissed) {
    if (dismissed) {
      row.innerHTML = "";
      return;
    }
    const band = bandFor(score.overall);
    row.innerHTML = `
      <span class="hz-ai-badge" data-band="${band}" title="AI Signal · ${bandLabel(band)} (estimate from title & snippet)\n\nWhy: ${escapeAttr(score.reasons.join(" · ") || "no strong signals")}\n\nHeuristic only — not a definitive verdict.">
        <span class="hz-ai-dot" aria-hidden="true"></span>
        <span class="hz-ai-pct">AI: ${score.overall}%</span>
        <span class="hz-ai-label">${bandLabel(band)}</span>
      </span>
      <button class="hz-ai-dismiss" type="button" aria-label="Dismiss this AI signal" title="Hide this badge for this domain">✕</button>
    `;
    const dismiss = row.querySelector(".hz-ai-dismiss");
    if (dismiss) {
      dismiss.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        // Mark dismissed and remove badge. Persist per-domain override.
        const card = row.closest(SELECTORS[engine].result) || row.parentElement;
        const hostname = (card && card.dataset && card.dataset.hzHostname) || "";
        row.innerHTML = "";
        if (hostname) {
          prefs.aiDismissed = prefs.aiDismissed || {};
          prefs.aiDismissed[hostname] = true;
          try {
            chrome.storage.sync.set({ [STORAGE_KEY]: prefs });
          } catch (err) { /* no-op */ }
          // Mark all cards with this hostname as dismissed in this session too.
          document.querySelectorAll(`[data-hz-hostname="${cssEscape(hostname)}"]`)
            .forEach((c) => {
              const r = c.querySelector(".hz-ai-badge-row");
              if (r) r.innerHTML = "";
            });
        }
      });
    }
  }

  function escapeAttr(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function cssEscape(s) {
    if (window.CSS && CSS.escape) return CSS.escape(s);
    return String(s).replace(/[^a-zA-Z0-9_-]/g, (c) => "\\" + c);
  }

  /* ── Single-result scoring pipeline ─────────────────────────── */

  function processCard(card) {
    if (!prefs.aiSignal) return;
    if (card.dataset.hzAIDone === "1") return;

    const sel = SELECTORS[engine];
    if (!sel) return;

    // Skip sponsored / ad / AI-overview cards.
    if (sel.skipSponsored && card.matches(sel.skipSponsored)) return;

    const data = extractResultData(card, sel);
    if (!data) {
      card.dataset.hzAIDone = "1";
      return;
    }

    // Stash the hostname so the dismiss handler can find siblings.
    card.dataset.hzHostname = data.hostname;
    card.dataset.hzAIDone = "1";

    if (prefs.aiDismissed && prefs.aiDismissed[data.hostname]) {
      ensureBadgeRow(card); // reserve the row so hover state is consistent
      return;
    }

    const text = [data.title, data.snippet].filter(Boolean).join(" — ");
    const score = AIScore.score(text, { url: data.url });

    const row = ensureBadgeRow(card);
    renderBadge(row, score, false);

    // Optional: collapse the card if the user enabled hide-above threshold.
    if (prefs.aiHideAbove > 0 && score.overall >= prefs.aiHideAbove) {
      card.classList.add("hz-ai-collapsed");
    } else {
      card.classList.remove("hz-ai-collapsed");
    }
  }

  function rescanAll() {
    if (!prefs.aiSignal) {
      // Remove badges and un-collapse everything if the user disabled.
      document.querySelectorAll(".hz-ai-badge-row").forEach((r) => (r.innerHTML = ""));
      document.querySelectorAll(".hz-ai-collapsed").forEach((c) =>
        c.classList.remove("hz-ai-collapsed")
      );
      return;
    }
    const sel = SELECTORS[engine];
    if (!sel) return;
    document.querySelectorAll(sel.result).forEach(processCard);
  }

  /* ── MutationObserver — re-score on result changes ────────────
     Google re-renders the SERP on every filter / pagination /
     "People also ask" expansion. We re-process any new cards. */

  let observer = null;
  function startObserver() {
    if (observer) return;
    const root = document.body || document.documentElement;
    observer = new MutationObserver((mutations) => {
      if (!prefs.aiSignal) return;
      const sel = SELECTORS[engine];
      if (!sel) return;
      // Find any new cards by checking the whole tree periodically
      // (cheaper than scanning every mutation's added nodes).
      for (const m of mutations) {
        if (m.addedNodes && m.addedNodes.length) {
          for (const n of m.addedNodes) {
            if (n.nodeType !== 1) continue;
            if (n.matches && n.matches(sel.result)) processCard(n);
            const inner = n.querySelectorAll ? n.querySelectorAll(sel.result) : [];
            inner.forEach(processCard);
          }
        }
      }
    });
    observer.observe(root, { childList: true, subtree: true });
  }

  /* ── Boot ──────────────────────────────────────────────────── */

  const engine = detectEngine();
  if (!engine) return; // Not a supported SERP.

  loadPrefs();
  // Initial pass after DOM is idle.
  setTimeout(rescanAll, 200);
  setTimeout(rescanAll, 800);
  startObserver();
})();
