/* ════════════════════════════════════════════════════════════════════
   Horizon AI Signal — SERP content script
   ════════════════════════════════════════════════════════════════════ */

(function () {
  "use strict";
  
  const STORAGE_KEY = "***";
  
  // Check if we're on a search page
  const hostname = location.hostname || "";
  const isGoogle = hostname.includes("google.");
  const isDuckDuckGo = hostname.includes("duckduckgo.");
  const isBrave = hostname.includes("search.brave.");
  
  if (!isGoogle && !isDuckDuckGo && !isBrave) {
    return;
  }

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
        const stored = (data && data[STORAGE_KEY]) || {};
        prefs = { ...prefs, ...stored };
        init();
      });
    } catch (e) {
      init();
    }
  }

  function extractHostname(href) {
    try {
      return new URL(href).hostname.replace(/^www\./, "");
    } catch (e) {
      return "";
    }
  }

  function bandFor(pct) {
    if (pct < 35) return "low";
    if (pct < 65) return "med";
    return "high";
  }

  function bandLabel(band) {
    return band === "low" ? "Human-like" : band === "med" ? "Mixed" : "Likely AI";
  }

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
      // Find all h3 elements in search results and get their containers
      const titles = document.querySelectorAll("#search h3, #rso h3, #center_col h3");
      
      titles.forEach(title => {
        // Walk up to find the result container
        let card = title.closest("div[data-sokoban-container]") || 
                   title.closest(".g") ||
                   title.closest("[data-ved]") ||
                   title.parentElement?.parentElement;
        
        if (!card || seen.has(card)) return;
        seen.add(card);
        
        if (card.dataset.hzDone) return;
        
        // Must have a real link
        const link = card.querySelector("a[href^='http']");
        if (!link) return;
        
        results.push(card);
      });
    }
    
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
    
    // Click to expand - use mousedown to intercept before link click
    badge.addEventListener("mousedown", (e) => {
      if (e.target.closest(".hz-ai-dismiss")) return;
      e.preventDefault();
      e.stopPropagation();
      
      document.querySelectorAll(".hz-ai-badge.hz-expanded").forEach(b => {
        if (b !== badge) b.classList.remove("hz-expanded");
      });
      
      badge.classList.toggle("hz-expanded");
    });
    
    // Dismiss
    badge.querySelector(".hz-ai-dismiss").addEventListener("mousedown", (e) => {
      e.preventDefault();
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
    
    panel.querySelectorAll(".hz-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const mark = btn.dataset.mark;
        prefs.aiUserMarks = prefs.aiUserMarks || {};
        prefs.aiUserMarks[hostname] = mark;
        try {
          chrome.storage.sync.set({ [STORAGE_KEY]: prefs });
        } catch (err) {}
        
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
    
    const text = [data.title, data.snippet].filter(Boolean).join(" ");
    let score;
    try {
      score = AIScore.score(text, { url: data.url });
    } catch (e) {
      return;
    }
    
    // Create badge and inject AFTER the title (not inside it)
    const badge = createBadge(score, data.hostname);
    const panel = createPanel(score, data.hostname);
    badge.appendChild(panel);
    
    // Insert badge after the h3, not inside it
    const titleEl = card.querySelector("h3");
    if (titleEl && titleEl.parentElement) {
      titleEl.parentElement.insertBefore(badge, titleEl.nextSibling);
    }
    
    // Apply hide threshold
    if (prefs.aiHideAbove > 0 && score.overall >= prefs.aiHideAbove) {
      card.classList.add("hz-ai-collapsed");
    }
  }

  // Process all results
  function processAll() {
    if (!prefs.aiSignal) return;
    
    const cards = findResults();
    cards.forEach(processCard);
  }

  // Click outside to close expanded badges
  document.addEventListener("mousedown", (e) => {
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
            if (n.nodeType === 1 && n.querySelector && n.querySelector("h3")) {
              shouldRescan = true;
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
    processAll();
    startObserver();
    setTimeout(processAll, 1000);
    setTimeout(processAll, 3000);
  }

  // Start
  loadPrefs();
})();