/* ════════════════════════════════════════════════════════════════════
   Horizon AI Signal — SERP content script
   ════════════════════════════════════════════════════════════════════ */

(function () {
  "use strict";
  console.log("[AI Signal] content script loaded on", location.hostname, location.pathname);

  const STORAGE_KEY = "hz";

  const SELECTORS = {
    google: {
      // Each result is a direct child of #rso or nested in data-sokoban-container
      // We target the INNER result divs, not the container
      // EXCLUDE: "What people are saying" / trending discussions (g-blk, g-section-with-header)
      result: "#rso > div > div.g:not(.g-blk), #rso > div.g:not(.g-blk), #rso .g:not(.g-blk), div[data-sokoban-container] .g:not(.g-blk), #search .g:not(.g-blk), [data-snf] .g:not(.g-blk), div.g[data-hveid]:not(.g-blk), div[jscontroller][data-hveid]:not(.g-blk)",
      anchor: "a[href]:not([role='button'])",
      title: "h3",
      snippet: ".VwiC3b, .yXK7lf, [data-content-feature], .st, .yXK7lf.MB230, span[data-st], div[data-sncf] > div > span, div.VwiC3b",
      url: "cite, .tjvcx, .dyjrff, div.TbwUpd, span.V6YFzc",
    },
    duckduckgo: {
      result: "article[data-testid='result'], .result",
      anchor: "a[data-testid='result-title-a'], h2 a",
      title: "h2 a, h2",
      snippet: "[data-result='snippet'], .result__snippet",
      url: "[data-testid='result-extras-url-link'], .result__url",
    },
    brave: {
      result: ".snippet[data-type='web'], .snippet",
      anchor: "a.h, a.result-header, .title a",
      title: ".title, .snippet-title",
      snippet: ".snippet-description, .snippet-content",
      url: ".snippet-url, .url",
    },
  };

  function detectEngine() {
    const h = location.hostname || "";
    if (h.includes("google.")) return "google";
    if (h.includes("duckduckgo.")) return "duckduckgo";
    if (h.includes("search.brave.")) return "brave";
    return null;
  }

  const DEFAULT_PREFS = {
    aiSignal: false,
    aiSensitivity: "med",
    aiHideAbove: 0,
    aiDismissed: {},
  };

  let prefs = { ...DEFAULT_PREFS };

  function loadPrefs() {
    try {
      chrome.storage.sync.get([STORAGE_KEY], (data) => {
        console.log("[AI Signal] storage raw:", data);
        const s = (data && data[STORAGE_KEY]) || {};
        prefs = { ...DEFAULT_PREFS, ...s };
        console.log("[AI Signal] prefs resolved:", prefs);
        if (typeof AIScore !== "undefined") {
          AIScore.setCalibration(prefs.aiSensitivity);
        }
        rescanAll();
      });
    } catch (e) {
      console.log("[AI Signal] storage error:", e);
    }
  }

  try {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== "sync" || !changes[STORAGE_KEY]) return;
      prefs = { ...DEFAULT_PREFS, ...(changes[STORAGE_KEY].newValue || {}) };
      if (typeof AIScore !== "undefined") {
        AIScore.setCalibration(prefs.aiSensitivity);
      }
      rescanAll();
    });
  } catch (e) { /* no-op */ }

  function extractHostname(href) {
    try {
      const u = new URL(href);
      return u.hostname.replace(/^www\./, "");
    } catch (e) {
      return "";
    }
  }

  function extractResultData(card, sel) {
    // For Google, try the direct link inside the card first
    let url = "";
    let titleEl = null;
    
    // Try to find the main result link
    const anchors = card.querySelectorAll(sel.anchor);
    for (const a of anchors) {
      const href = a.getAttribute("href");
      if (href && /^https?:\/\//i.test(href)) {
        url = href;
        titleEl = a;
        break;
      }
    }
    
    // Fallback: look for any link with http
    if (!url) {
      const allLinks = card.querySelectorAll("a[href^='http']");
      for (const a of allLinks) {
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

    // Try multiple snippet selectors and combine them
    const snippetEls = card.querySelectorAll(sel.snippet);
    let snippet = "";
    for (const el of snippetEls) {
      const text = el.textContent.trim();
      if (text.length > snippet.length) snippet = text;
    }

    if (!title && !snippet) return null;

    return { url, hostname: extractHostname(url), title, snippet };
  }

  function bandFor(pct) {
    if (pct < 35) return "low";
    if (pct < 65) return "med";
    return "high";
  }

  function bandLabel(band) {
    return band === "low" ? "Human-like" : band === "med" ? "Mixed signals" : "Likely AI";
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

  // Track currently open panel for click-outside-to-close
  let activePanel = null;
  let activeBadge = null;

  function closeAllPanels() {
    document.querySelectorAll(".hz-ai-panel.hz-visible").forEach(p => {
      p.classList.remove("hz-visible");
    });
    document.querySelectorAll(".hz-ai-badge.hz-expanded").forEach(b => {
      b.classList.remove("hz-expanded");
    });
    activePanel = null;
    activeBadge = null;
  }

  // Click outside to close
  document.addEventListener("click", (e) => {
    if (activePanel && !e.target.closest(".hz-ai-badge") && !e.target.closest(".hz-ai-panel")) {
      closeAllPanels();
    }
  });

  function injectBadge(card, score, hostname) {
    // Remove old badge if any
    const old = card.querySelector(".hz-ai-badge");
    if (old) old.remove();

    const band = bandFor(score.overall);
    const badge = document.createElement("span");
    badge.className = "hz-ai-badge";
    badge.dataset.band = band;
    badge.dataset.hostname = hostname;
    
    // Simple format: just AI% with color dot
    badge.innerHTML = `
      <span class="hz-ai-dot" aria-hidden="true"></span>
      <span class="hz-ai-pct">${score.overall}%</span>
      <button class="hz-ai-dismiss" type="button" aria-label="Dismiss" title="Hide for this domain">✕</button>
    `;

    // Try to insert after the title
    const titleEl = card.querySelector("h3");
    if (titleEl) {
      titleEl.appendChild(badge);
    } else {
      // Fallback: prepend to card
      card.insertBefore(badge, card.firstChild);
    }

    // Click handler to toggle panel
    badge.addEventListener("click", (e) => {
      // Don't toggle if clicking dismiss button
      if (e.target.closest(".hz-ai-dismiss")) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      const panel = card.querySelector(".hz-ai-panel");
      if (panel) {
        const isVisible = panel.classList.contains("hz-visible");
        
        // Close all other panels first
        closeAllPanels();
        
        if (!isVisible) {
          panel.classList.add("hz-visible");
          badge.classList.add("hz-expanded");
          activePanel = panel;
          activeBadge = badge;
        }
      }
    });

    // Dismiss handler
    badge.querySelector(".hz-ai-dismiss").addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      badge.remove();
      card.classList.remove("hz-ai-border", "hz-ai-low", "hz-ai-med", "hz-ai-high");
      const panel = card.querySelector(".hz-ai-panel");
      if (panel) panel.remove();
      prefs.aiDismissed = prefs.aiDismissed || {};
      prefs.aiDismissed[hostname] = true;
      try {
        chrome.storage.sync.set({ [STORAGE_KEY]: prefs });
      } catch (err) { /* no-op */ }
      document.querySelectorAll(`[data-hz-hostname="${cssEscape(hostname)}"]`)
        .forEach((c) => {
          const b = c.querySelector(".hz-ai-badge");
          if (b) b.remove();
          c.classList.remove("hz-ai-border", "hz-ai-low", "hz-ai-med", "hz-ai-high");
          const t = c.querySelector(".hz-ai-tooltip");
          if (t) t.remove();
        });
    });
  }

  // Cache for external trust checks
  const trustCache = {};
  
  // Google Safe Browsing API check
  // Uses background script to make cross-origin API calls
  async function checkSafeBrowsing(hostname) {
    // Return cached result if available
    if (trustCache[hostname] !== undefined) {
      return trustCache[hostname];
    }
    
    try {
      // Send message to background script
      const response = await chrome.runtime.sendMessage({
        action: "checkSafeBrowsing",
        hostname: hostname
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      trustCache[hostname] = response.result;
      return response.result;
    } catch (err) {
      console.log("[AI Signal] Safe Browsing check failed:", err);
      trustCache[hostname] = null;
      return null;
    }
  }

  function injectPanel(card, score, hostname) {
    const old = card.querySelector(".hz-ai-panel");
    if (old) old.remove();

    const band = bandFor(score.overall);
    const panel = document.createElement("div");
    panel.className = "hz-ai-panel";
    
    // Build reasons text
    const reasonsText = score.reasons.length > 0 
      ? escapeAttr(score.reasons.join(" · "))
      : "No strong AI signals detected";
    
    // Check if user has previously marked this domain
    const userMark = prefs.aiUserMarks && prefs.aiUserMarks[hostname];
    const userMarkText = userMark 
      ? `<div class="hz-user-mark">You marked this as: <strong>${userMark === 'human' ? 'Human' : 'AI'}</strong></div>`
      : '';
    
    panel.innerHTML = `
      <strong>AI Signal: ${score.overall}% · ${bandLabel(band)}</strong>
      <div class="hz-reasons">${reasonsText}</div>
      ${userMarkText}
      <div class="hz-actions">
        <button class="hz-mark-human" data-hostname="${escapeAttr(hostname)}">✓ Human</button>
        <button class="hz-mark-ai" data-hostname="${escapeAttr(hostname)}">✗ AI</button>
      </div>
      <div class="hz-trust-check">
        <button class="hz-check-trust" data-hostname="${escapeAttr(hostname)}">🔍 Check Trust Score</button>
        <span class="hz-trust-result"></span>
      </div>
      <div class="hz-foot">Heuristic estimate — not a definitive verdict</div>
    `;
    
    // Add feedback button handlers
    panel.querySelector(".hz-mark-human")?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      markDomain(hostname, "human");
    });
    panel.querySelector(".hz-mark-ai")?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      markDomain(hostname, "ai");
    });
    
    // Add trust check handler — uses Google Safe Browsing API
    panel.querySelector(".hz-check-trust")?.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const btn = e.target;
      const resultSpan = panel.querySelector(".hz-trust-result");
      
      btn.textContent = "Checking...";
      btn.disabled = true;
      
      try {
        const safeBrowsingResult = await checkSafeBrowsing(hostname);
        
        if (safeBrowsingResult === null) {
          resultSpan.innerHTML = `<em>Google Safe Browsing: Service unavailable<br>Get a free API key to enable checks</em>`;
        } else if (safeBrowsingResult.threats && safeBrowsingResult.threats.length > 0) {
          const threatTypes = safeBrowsingResult.threats.map(t => t.threatType).join(", ");
          resultSpan.innerHTML = `<span style="color:#ef4444">⚠️ UNSAFE: ${threatTypes}</span>`;
        } else {
          resultSpan.innerHTML = `<span style="color:#22c55e">✓ Safe — No threats detected by Google Safe Browsing</span>`;
        }
      } catch (err) {
        resultSpan.innerHTML = `<em>Error checking safety: ${err.message}</em>`;
      }
      
      btn.textContent = "🔍 Check Trust Score";
      btn.disabled = false;
    });
    
    card.appendChild(panel);
  }

  function markDomain(hostname, mark) {
    prefs.aiUserMarks = prefs.aiUserMarks || {};
    prefs.aiUserMarks[hostname] = mark;
    try {
      chrome.storage.sync.set({ [STORAGE_KEY]: prefs });
    } catch (err) { /* no-op */ }
    
    // Update all panels for this domain
    document.querySelectorAll(`[data-hz-hostname="${cssEscape(hostname)}"]`).forEach((c) => {
      const panel = c.querySelector(".hz-ai-panel");
      if (panel) {
        const markDiv = panel.querySelector(".hz-user-mark");
        if (markDiv) {
          markDiv.innerHTML = `You marked this as: <strong>${mark === 'human' ? 'Human' : 'AI'}</strong>`;
        } else {
          const reasonsDiv = panel.querySelector(".hz-reasons");
          if (reasonsDiv) {
            const newMark = document.createElement("div");
            newMark.className = "hz-user-mark";
            newMark.innerHTML = `You marked this as: <strong>${mark === 'human' ? 'Human' : 'AI'}</strong>`;
            reasonsDiv.after(newMark);
          }
        }
      }
    });
  }

  function shouldSkipCard(card) {
    // Skip "What people are saying" / trending discussions / forum sections
    const text = card.textContent || "";
    const html = card.innerHTML || "";
    
    // Check for discussion/forum indicators
    if (card.closest(".g-blk")) return true;
    if (card.querySelector("[data-attrid='kc:/discussion/forum']")) return true;
    if (text.includes("What people are saying") || text.includes("trending posts")) return true;
    if (card.querySelector("g-section-with-header")) return true;
    
    // Skip AI Overview / generated results
    if (card.closest("[data-attrid='wa:/description']")) return true;
    if (card.querySelector("[data-attrid='wa:/description']")) return true;
    if (text.includes("AI Overview") || text.includes("AI-generated")) return true;
    if (card.querySelector("g-generative-ai")) return true;
    if (card.closest("g-generative-ai")) return true;
    
    // Skip if it's a discussion card (has multiple nested results)
    const nestedResults = card.querySelectorAll(".g, article");
    if (nestedResults.length > 3) return true;
    
    return false;
  }

  function processCard(card) {
    if (!prefs.aiSignal) return;
    if (card.dataset.hzAIDone === "1") return;
    
    // Skip discussion/forum cards
    if (shouldSkipCard(card)) {
      card.dataset.hzAIDone = "1";
      return;
    }

    const sel = SELECTORS[engine];
    if (!sel) return;

    const data = extractResultData(card, sel);
    if (!data) {
      card.dataset.hzAIDone = "1";
      return;
    }

    card.dataset.hzHostname = data.hostname;
    card.dataset.hzAIDone = "1";

    if (prefs.aiDismissed && prefs.aiDismissed[data.hostname]) {
      return;
    }

    const text = [data.title, data.snippet].filter(Boolean).join(" — ");
    let score;
    try {
      score = AIScore.score(text, { url: data.url });
    } catch (e) {
      console.log("[AI Signal] scoring error:", e);
      return;
    }

    console.log("[AI Signal] scored:", data.hostname, score.overall + "%", bandLabel(bandFor(score.overall)));

    // Visual treatments
    const band = bandFor(score.overall);
    card.classList.add("hz-ai-border", "hz-ai-" + band);
    injectBadge(card, score, data.hostname);
    injectPanel(card, score, data.hostname);

    // Hide-above threshold
    if (prefs.aiHideAbove > 0 && score.overall >= prefs.aiHideAbove) {
      card.classList.add("hz-ai-collapsed");
    }
  }

  function rescanAll() {
    if (!prefs.aiSignal) {
      document.querySelectorAll(".hz-ai-badge").forEach((b) => b.remove());
      document.querySelectorAll(".hz-ai-tooltip").forEach((t) => t.remove());
      document.querySelectorAll(".hz-ai-collapsed").forEach((c) => c.classList.remove("hz-ai-collapsed"));
      document.querySelectorAll(".hz-ai-border").forEach((c) => c.classList.remove("hz-ai-border", "hz-ai-low", "hz-ai-med", "hz-ai-high"));
      return;
    }
    const sel = SELECTORS[engine];
    if (!sel) return;
    
    // Try primary selector first
    let cards = document.querySelectorAll(sel.result);
    
    // If no cards found with primary selector, try broader fallbacks for Google
    // BUT filter to only include elements that have an h3 or link (actual results, not containers)
    if (cards.length === 0 && engine === "google") {
      const candidates = document.querySelectorAll("#rso > div > div, [data-sokoban-container] > div");
      cards = Array.from(candidates).filter(el => el.querySelector("h3") || el.querySelector("a[href^='http']"));
    }
    
    console.log("[AI Signal] rescanning", cards.length, "cards on", engine);
    cards.forEach(processCard);
  }

  let observer = null;
  function startObserver() {
    if (observer) return;
    const root = document.body || document.documentElement;
    observer = new MutationObserver((mutations) => {
      if (!prefs.aiSignal) return;
      const sel = SELECTORS[engine];
      if (!sel) return;
      for (const m of mutations) {
        if (m.addedNodes && m.addedNodes.length) {
          for (const n of m.addedNodes) {
            if (n.nodeType !== 1) continue;
            
            // Try primary selector
            if (n.matches && n.matches(sel.result)) {
              processCard(n);
              continue;
            }
            
            // For Google, check if this is a result container that has inner results
            if (engine === "google" && n.matches && n.matches("#rso > div")) {
              // Process children of this container, not the container itself
              const innerResults = n.querySelectorAll(sel.result);
              innerResults.forEach(processCard);
              continue;
            }
            
            const inner = n.querySelectorAll ? n.querySelectorAll(sel.result) : [];
            inner.forEach(processCard);
          }
        }
      }
    });
    observer.observe(root, { childList: true, subtree: true });
  }

  const engine = detectEngine();
  console.log("[AI Signal] engine:", engine);
  if (!engine) {
    console.log("[AI Signal] unsupported host, bailing");
    return;
  }

  loadPrefs();
  setTimeout(() => { console.log("[AI Signal] first rescan"); rescanAll(); }, 400);
  setTimeout(() => { console.log("[AI Signal] second rescan"); rescanAll(); }, 1200);
  startObserver();
  console.log("[AI Signal] observer started");
})();