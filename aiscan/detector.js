/* ════════════════════════════════════════════════════════════════════
   Horizon AI Signal — In-Page Detector
   Analyzes article content on a webpage for AI-generated text.

   v2.1 changes:
   • OPT-IN. The detector used to default ON for every website with no
     settings toggle at all. It now defaults OFF, is controlled by the
     "Page detector" toggle in settings, and (via background.js) the
     script isn't even injected outside search pages unless the user
     enables it and grants the optional <all_urls> permission.
   • Never runs in iframes, on non-http(s) schemes, or on non-HTML
     documents (PDF viewer, XML, …).
   • Skips thin pages (< 400 chars / < 80 words) instead of scoring
     navigation chrome.
   • Respects the user's AI Signal sensitivity setting.
   • "Perplexity" replaced with MATTR (moving-average type-token
     ratio). The old proxy divided total words by unique words, which
     mechanically penalizes longer articles (vocabulary always repeats
     as length grows). MATTR uses a sliding 50-word window, so it's
     length-invariant.
   • Burstiness polarity fixed: high burstiness (varied sentence
     lengths) is a HUMAN signal, but v1 ADDED it to the AI score —
     the most human-sounding pages were penalized ~25 points.
   • Reacts live to settings changes (panel removed / re-scored).
   ════════════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  const DEBUG = false;
  const log = (...a) => { if (DEBUG) console.log("[AI Detector]", ...a); };

  // ── Hard guards ────────────────────────────────────────────────────
  if (window.top !== window) return;                       // never in iframes
  if (!/^https?:$/.test(location.protocol)) return;        // http(s) only
  if (document.contentType && document.contentType !== "text/html") return;
  if (location.hostname.includes("google.") ||
      location.hostname.includes("duckduckgo.") ||
      location.hostname.includes("search.brave.")) {
    return; // SERPs are handled by content.js
  }

  const STORAGE_KEY = "hz";
  const MIN_CHARS = 400;
  const MIN_WORDS = 80;

  let prefs = { aiPageDetector: false, aiSensitivity: "med" };
  let detectorPanel = null;
  let analyzed = false;

  function readPrefs(s) {
    return {
      aiPageDetector: !!s.aiPageDetector,
      aiSensitivity: s.aiSensitivity || "med",
    };
  }

  function applyCalibration() {
    if (typeof AIScore !== "undefined") AIScore.setCalibration(prefs.aiSensitivity);
  }

  // Load preferences, then run only if the user opted in.
  try {
    chrome.storage.sync.get([STORAGE_KEY], (data) => {
      prefs = readPrefs((data && data[STORAGE_KEY]) || {});
      applyCalibration();
      if (prefs.aiPageDetector) initDetector();
    });
  } catch (e) {
    log("storage error:", e);
  }

  // React live: disabling removes the panel; sensitivity changes rescore.
  try {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== "sync" || !changes[STORAGE_KEY]) return;
      const next = readPrefs(changes[STORAGE_KEY].newValue || {});
      const sensChanged = next.aiSensitivity !== prefs.aiSensitivity;
      const toggled = next.aiPageDetector !== prefs.aiPageDetector;
      prefs = next;
      applyCalibration();
      if (!prefs.aiPageDetector) {
        removePanel();
        return;
      }
      if (toggled || (sensChanged && analyzed)) {
        analyzed = false;
        initDetector();
      }
    });
  } catch (e) { /* no-op */ }

  function initDetector() {
    if (analyzed) return;
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => setTimeout(analyzePage, 1000), { once: true });
    } else {
      // Small delay to let dynamic content load
      setTimeout(analyzePage, 1000);
    }
  }

  function removePanel() {
    if (detectorPanel) {
      detectorPanel.remove();
      detectorPanel = null;
    }
  }

  // ── Content extraction ─────────────────────────────────────────────
  function extractArticleText() {
    const selectors = [
      "article",
      "[role='main']",
      "main",
      ".article-content",
      ".post-content",
      ".entry-content",
      "#article-content",
      ".content",
      ".story",
      ".post",
    ];

    let contentEl = null;
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) {
        const text = el.innerText.trim();
        if (text.length > 500) {
          contentEl = el;
          break;
        }
      }
    }

    // Fallback: find the element with the most text
    if (!contentEl) {
      const paragraphs = document.querySelectorAll("p");
      let bestEl = null;
      let bestScore = 0;

      paragraphs.forEach((p) => {
        const parent = p.parentElement;
        if (!parent) return;
        const text = parent.innerText.trim();
        const score = text.length;
        const tag = parent.tagName.toLowerCase();
        if (!["nav", "header", "footer", "aside"].includes(tag) && score > bestScore) {
          bestScore = score;
          bestEl = parent;
        }
      });

      contentEl = bestEl || document.body;
    }

    return contentEl.innerText.trim();
  }

  function splitIntoSections(text) {
    const sections = [];
    const chunks = text.split(/\n\n+/);

    let currentSection = "";
    chunks.forEach((chunk) => {
      const trimmed = chunk.trim();
      if (trimmed.length < 20) return;

      if (trimmed.length > 200) {
        if (currentSection.length > 100) {
          sections.push(currentSection.trim());
          currentSection = trimmed;
        } else {
          currentSection += "\n\n" + trimmed;
        }
      } else {
        currentSection += "\n\n" + trimmed;
      }
    });

    if (currentSection.length > 50) {
      sections.push(currentSection.trim());
    }

    return sections.slice(0, 5);
  }

  // ── Statistical measures ───────────────────────────────────────────

  /* MATTR — moving-average type-token ratio over 50-word windows.
     Length-invariant vocabulary-variety measure:
       fluent human prose ≈ 0.72–0.86, formulaic/templated ≈ 0.55–0.70.
     Returned as 0–100 where HIGHER = more varied = more human-like. */
  function vocabVariety(text) {
    const words = text.toLowerCase().match(/[a-z][a-z'’-]*/g) || [];
    const W = 50, STEP = 25;
    if (words.length < W) return 50; // not enough signal → neutral
    let sum = 0, n = 0;
    for (let i = 0; i + W <= words.length; i += STEP) {
      const win = words.slice(i, i + W);
      sum += new Set(win).size / W;
      n++;
    }
    const mattr = sum / n;
    // Map 0.55 → 0 and 0.86 → 100, clamp.
    return Math.round(Math.max(0, Math.min(100, ((mattr - 0.55) / 0.31) * 100)));
  }

  /* Burstiness — coefficient of variation of sentence lengths.
     HIGHER = more varied = more human-like. */
  function calculateBurstiness(text) {
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 5);
    if (sentences.length < 3) return 50;

    const lengths = sentences.map((s) => s.split(/\s+/).filter(Boolean).length);
    const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance = lengths.reduce((a, b) => a + (b - mean) ** 2, 0) / lengths.length;
    const cv = Math.sqrt(variance) / Math.max(mean, 1);

    return Math.round(Math.min(100, Math.max(0, cv * 200)));
  }

  // ── Analysis ───────────────────────────────────────────────────────
  function analyzePage() {
    if (analyzed || !prefs.aiPageDetector) return;

    const text = extractArticleText();
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    if (text.length < MIN_CHARS || wordCount < MIN_WORDS) {
      log("not enough content to analyze", text.length, "chars /", wordCount, "words");
      return;
    }
    analyzed = true;

    log("analyzing:", location.hostname, text.length, "chars");

    const pageScore = AIScore.score(text, { url: location.href });
    const vocab = vocabVariety(text);
    const burstiness = calculateBurstiness(text);

    // Combine — heuristic 50%, vocabulary 25%, burstiness 25%.
    // Both statistical measures are "higher = human", so both are
    // inverted here. (v1 ADDED burstiness, penalizing human prose.)
    const combinedScore = Math.round(
      pageScore.overall * 0.5 +
      (100 - vocab) * 0.25 +
      (100 - burstiness) * 0.25
    );

    const sections = splitIntoSections(text);
    const sectionScores = sections.map((section, i) => {
      const score = AIScore.score(section, { url: location.href });
      return {
        index: i + 1,
        preview: section.substring(0, 60) + "...",
        score: score.overall,
      };
    });

    showDetectorPanel({
      overall: Math.max(0, Math.min(100, combinedScore)),
      heuristic: pageScore.overall,
      vocab,
      burstiness,
      sections: sectionScores,
      wordCount,
    });
  }

  // ── Panel UI ───────────────────────────────────────────────────────
  let outsideCloseBound = false;

  function showDetectorPanel(data) {
    removePanel();

    const band = data.overall < 35 ? "low" : data.overall < 65 ? "med" : "high";
    const bandColor = band === "low" ? "#22c55e" : band === "med" ? "#f59e0b" : "#ef4444";
    const bandLabel = data.overall < 35 ? "Human-like" : data.overall < 65 ? "Mixed" : "Likely AI";

    detectorPanel = document.createElement("div");
    detectorPanel.className = "hz-page-detector";
    // Panel content lives INSIDE the badge div so the pill expands
    // inline (matching the SERP pill UX).
    detectorPanel.innerHTML = `
      <div class="hz-page-detector-badge">
        <div class="hz-detector-header-row">
          <span class="hz-detector-dot" style="--dot-c:${bandColor}"></span>
          <span class="hz-detector-score">${data.overall}%</span>
        </div>
        <button class="hz-detector-close" type="button" aria-label="Close">✕</button>
        <div class="hz-detector-panel">
          <div class="hz-detector-panel-header">
            <span class="hz-detector-dot" style="--dot-c:${bandColor}"></span>
            <strong>AI Signal: ${data.overall}% · ${bandLabel}</strong>
          </div>
          <div class="hz-detector-bar">
            <div class="hz-detector-bar-fill" style="width:${data.overall}%;background:${bandColor}"></div>
          </div>
          <div class="hz-detector-stats">
            <div class="hz-detector-stat">
              <span class="hz-detector-stat-value" style="color:${data.heuristic < 35 ? "#22c55e" : data.heuristic < 65 ? "#f59e0b" : "#ef4444"}">${data.heuristic}%</span>
              <span class="hz-detector-stat-label">Pattern Match</span>
            </div>
            <div class="hz-detector-stat">
              <span class="hz-detector-stat-value" style="color:${data.vocab > 50 ? "#22c55e" : "#f59e0b"}">${data.vocab}</span>
              <span class="hz-detector-stat-label">Vocab Variety</span>
            </div>
            <div class="hz-detector-stat">
              <span class="hz-detector-stat-value" style="color:${data.burstiness > 50 ? "#22c55e" : "#f59e0b"}">${data.burstiness}</span>
              <span class="hz-detector-stat-label">Burstiness</span>
            </div>
            <div class="hz-detector-stat">
              <span class="hz-detector-stat-value">${data.wordCount}</span>
              <span class="hz-detector-stat-label">Words</span>
            </div>
          </div>
          ${data.sections.length > 0 ? `
          <div class="hz-detector-section-breakdown-title">Section breakdown</div>
          <div class="hz-detector-sections">
            ${data.sections.map((s) => `
              <div class="hz-detector-section">
                <span class="hz-detector-section-score" style="color:${s.score < 35 ? "#22c55e" : s.score < 65 ? "#f59e0b" : "#ef4444"}">${s.score}%</span>
                <span class="hz-detector-section-preview">${escapeHtml(s.preview)}</span>
              </div>
            `).join("")}
          </div>
          ` : ""}
          <div class="hz-detector-foot">
            Heuristic estimate — not definitive. Vocab variety &amp; burstiness are statistical approximations.
          </div>
        </div>
      </div>
    `;

    // Toggle on badge click — pointerdown capture so we beat page handlers.
    const badge = detectorPanel.querySelector(".hz-page-detector-badge");
    badge.addEventListener("pointerdown", (e) => {
      if (e.target.closest(".hz-detector-close")) return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      detectorPanel.classList.toggle("hz-expanded");
    }, true);

    const closeBtn = detectorPanel.querySelector(".hz-detector-close");
    if (closeBtn) {
      closeBtn.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        removePanel(); // ✕ now closes the pill entirely for this page
      }, true);
    }

    // Close-on-outside-click — bound once per page, not once per panel.
    if (!outsideCloseBound) {
      outsideCloseBound = true;
      document.addEventListener("pointerdown", (e) => {
        if (detectorPanel && !detectorPanel.contains(e.target)) {
          detectorPanel.classList.remove("hz-expanded");
        }
      }, true);
    }

    document.body.appendChild(detectorPanel);
    log("panel shown:", data.overall + "%", bandLabel);
    checkSafeBrowsing();
  }

  /* Ask the background worker to run the (optional, user-keyed) Google
     Safe Browsing check for this hostname. No key configured → the
     worker skips silently and nothing is shown. */
  function checkSafeBrowsing() {
    try {
      chrome.runtime.sendMessage(
        { action: "checkSafeBrowsing", hostname: location.hostname },
        (resp) => {
          if (chrome.runtime.lastError) return; // worker asleep/unavailable — fine
          const result = resp && resp.ok && resp.result;
          if (!result || !result.checked || !result.threats || !result.threats.length) return;
          if (!detectorPanel) return;
          const panel = detectorPanel.querySelector(".hz-detector-panel");
          if (!panel || panel.querySelector(".hz-detector-sb-warning")) return;
          const types = [...new Set(result.threats.map((t) => String(t.threatType || "THREAT").replace(/_/g, " ").toLowerCase()))].join(", ");
          const warn = document.createElement("div");
          warn.className = "hz-detector-sb-warning";
          warn.textContent = `⚠ Google Safe Browsing flags this site (${types})`;
          panel.insertBefore(warn, panel.firstChild);
          log("safe browsing threats:", result.threats);
        }
      );
    } catch (e) { /* no-op */ }
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
})();
