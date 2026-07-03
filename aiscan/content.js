/* ════════════════════════════════════════════════════════════════════
   Horizon AI Signal — SERP content script
   ════════════════════════════════════════════════════════════════════ */

(function () {
  "use strict";
  
  const STORAGE_KEY = "hz";  // Same key as tab.js uses
  
  // Check if we're on a search page
  const hostname = location.hostname || "";
  const isGoogle = hostname.includes("google.");
  const isDuckDuckGo = hostname.includes("duckduckgo.");
  const isBrave = hostname.includes("search.brave.");
  
  if (!isGoogle && !isDuckDuckGo && !isBrave) {
    console.log("[AI Signal] Not a search page, skipping");
    return;
  }

  console.log("[AI Signal] Loaded on", hostname);

  // Default prefs
  let prefs = {
    aiSignal: false,
    aiSensitivity: "med",
    aiHideAbove: 0,
    aiDismissed: {},
    aiUserMarks: {}
  };

  // Load prefs from storage
  function loadPrefs() {
    try {
      chrome.storage.sync.get([STORAGE_KEY], (data) => {
        console.log("[AI Signal] Raw storage data:", data);
        const stored = (data && data[STORAGE_KEY]) || {};
        console.log("[AI Signal] Stored prefs:", stored);
        prefs = { ...prefs, ...stored };
        console.log("[AI Signal] Merged prefs:", prefs);
        console.log("[AI Signal] aiSignal =", prefs.aiSignal);
        
        // Always init - if aiSignal is false, badges just won't show
        init();
      });
    } catch (e) {
      console.log("[AI Signal] Storage error, using defaults:", e);
      init();
    }
  }

  // Extract hostname from URL
  function extractHostname(href) {
    try {
      return new URL(href).hostname.replace(/^www\./, "");
    } catch (e) {
      return "";
    }
  }

  // Get band from percentage
  function bandFor(pct) {
    if (pct < 35) return "low";
    if (pct < 65) return "med";
    return "high";
  }

  function bandLabel(band) {
    return band === "low" ? "Human-like" : band === "med" ? "Mixed" : "Likely AI";
  }

  // Escape HTML
  function escapeHtml(s) {
    const div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  // Find all search result cards
  function findResults() {
    const results = [];
    const seen = new Set();
    
    if (isGoogle) {
      // Try multiple selectors for Google
      // Google's DOM changes frequently - use broad selectors
      const selectors = [
        "#rso .g",
        "#rso > div",
        "#rso > div > div",
        "#search .g",
        "[data-sokoban-container]",
        "div[data-ved]"
      ];
      
      for (const sel of selectors) {
        const cards = document.querySelectorAll(sel);
        cards.forEach(card => {
          // Skip duplicates
          if (seen.has(card)) return;
          seen.add(card);
          
          // Skip if already processed
          if (card.dataset.hzDone) return;
          
          // Skip containers (elements that contain other results)
          if (card.querySelector(".g, [data-sokoban-container]")) return;
          
          // Must have a link and title
          const link = card.querySelector("a[href^='http']");
          const title = card.querySelector("h3");
          if (!link || !title) return;
          
          // Must have some text content
          if (card.textContent.length < 50) return;
          
          results.push(card);
        });
      }
    }
    
    console.log("[AI Signal] findResults found:", results.length, "cards");
    return results;
  }

  // Extract data from a result card
  function extractData(card) {
    const link = card.querySelector("a[href^='http']");
    const title = card.querySelector("h3");
    const snippet = card.querySelector(".VwiC3b, .yXK7lf, [data-content-feature], .st");
    
    if (!link || !title) return null;
    
    const url = link.getAttribute("href");
    const hostname = extractHostname(url);
    
    // Skip if dismissed
    if (prefs.aiDismissed && prefs.aiDismissed[hostname]) return null;
    
    return {
      url,
      hostname,
      title: title.textContent.trim(),
      snippet: snippet ? snippet.textContent.trim() : ""
    };
  }

  // Create badge element
  function createBadge(score, hostname) {
    const band = bandFor(score.overall);
    const badge = document.createElement("span");
    badge.className = "hz-ai-badge";
    badge.dataset.band = band;
    badge.dataset.hostname = hostname;
    
    badge.innerHTML = `
      <span class="hz-ai-dot"></span>
      <span class="hz-ai-pct">${score.overall}%</span>
      <button class="hz-ai-dismiss" title="Hide for this domain">✕</button>
    `;
    
    // Click to expand
    badge.addEventListener("click", (e) => {
      if (e.target.closest(".hz-ai-dismiss")) return;
      e.stopPropagation();
      
      // Close others
      document.querySelectorAll(".hz-ai-badge.hz-expanded").forEach(b => {
        if (b !== badge) b.classList.remove("hz-expanded");
      });
      
      badge.classList.toggle("hz-expanded");
    });
    
    // Dismiss
    badge.querySelector(".hz-ai-dismiss").addEventListener("click", (e) => {
      e.stopPropagation();
      badge.remove();
      prefs.aiDismissed = prefs.aiDismissed || {};
      prefs.aiDismissed[hostname] = true;
      try {
        chrome.storage.sync.set({ [STORAGE_KEY]: prefs });
      } catch (err) {}
    });
    
    return badge;
  }

  // Create panel element
  function createPanel(score, hostname) {
    const band = bandFor(score.overall);
    const panel = document.createElement("div");
    panel.className = "hz-ai-panel";
    
    const reasonsText = score.reasons.length > 0 
      ? escapeHtml(score.reasons.slice(0, 3).join(" · "))
      : "No strong signals";
    
    panel.innerHTML = `
      <div class="hz-panel-header">
        <span class="hz-panel-dot" data-band="${band}"></span>
        <strong>${score.overall}% · ${bandLabel(band)}</strong>
      </div>
      <div class="hz-panel-reasons">${reasonsText}</div>
      <div class="hz-panel-actions">
        <button class="hz-btn hz-btn-human" data-mark="human">✓ Human</button>
        <button class="hz-btn hz-btn-ai" data-mark="ai">✗ AI</button>
      </div>
      <div class="hz-panel-foot">Heuristic estimate</div>
    `;
    
    // Mark buttons
    panel.querySelectorAll(".hz-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const mark = btn.dataset.mark;
        prefs.aiUserMarks = prefs.aiUserMarks || {};
        prefs.aiUserMarks[hostname] = mark;
        try {
          chrome.storage.sync.set({ [STORAGE_KEY]: prefs });
        } catch (err) {}
        
        // Show feedback
        const foot = panel.querySelector(".hz-panel-foot");
        foot.textContent = `Marked as ${mark === 'human' ? 'Human' : 'AI'}`;
        foot.style.color = mark === 'human' ? '#22c55e' : '#ef4444';
      });
    });
    
    return panel;
  }

  // Process a single result card
  function processCard(card) {
    if (card.dataset.hzDone) return;
    card.dataset.hzDone = "1";
    
    const data = extractData(card);
    if (!data) return;
    
    // Score the content
    const text = [data.title, data.snippet].filter(Boolean).join(" ");
    let score;
    try {
      score = AIScore.score(text, { url: data.url });
    } catch (e) {
      console.log("[AI Signal] Scoring error:", e);
      return;
    }
    
    console.log("[AI Signal] Scored:", data.hostname, score.overall + "%");
    
    // Add visual border
    const band = bandFor(score.overall);
    card.classList.add("hz-ai-border", `hz-ai-${band}`);
    
    // Create and inject badge
    const badge = createBadge(score, data.hostname);
    const titleEl = card.querySelector("h3");
    if (titleEl) {
      titleEl.appendChild(badge);
    }
    
    // Create and inject panel (inside badge)
    const panel = createPanel(score, data.hostname);
    badge.appendChild(panel);
    
    // Apply hide threshold
    if (prefs.aiHideAbove > 0 && score.overall >= prefs.aiHideAbove) {
      card.classList.add("hz-ai-collapsed");
    }
  }

  // Process all results
  function processAll() {
    if (!prefs.aiSignal) {
      console.log("[AI Signal] Feature disabled, skipping");
      return;
    }
    
    const cards = findResults();
    console.log("[AI Signal] Found", cards.length, "results");
    
    cards.forEach(processCard);
  }

  // Click outside to close expanded badges
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".hz-ai-badge")) {
      document.querySelectorAll(".hz-ai-badge.hz-expanded").forEach(b => {
        b.classList.remove("hz-expanded");
      });
    }
  });

  // Watch for new results
  let observer = null;
  function startObserver() {
    if (observer) return;
    
    observer = new MutationObserver((mutations) => {
      let shouldRescan = false;
      
      for (const m of mutations) {
        if (m.addedNodes && m.addedNodes.length) {
          for (const n of m.addedNodes) {
            if (n.nodeType === 1) {
              // Check if it's a result or contains results
              if (n.matches && (n.matches("#rso > div") || n.querySelector("h3"))) {
                shouldRescan = true;
              }
            }
          }
        }
      }
      
      if (shouldRescan) {
        setTimeout(processAll, 200);
      }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // Initialize
  function init() {
    console.log("[AI Signal] Initializing...");
    processAll();
    startObserver();
    
    // Rescan after a delay (for dynamic content)
    setTimeout(processAll, 1000);
    setTimeout(processAll, 3000);
  }

  // Start
  loadPrefs();
})();