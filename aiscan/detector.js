/* ════════════════════════════════════════════════════════════════════
   Horizon AI Signal — In-Page Detector
   Analyzes article content on any webpage for AI-generated text
   ════════════════════════════════════════════════════════════════════ */

(function () {
  "use strict";
  
  // Only run on actual content pages, not search results
  if (location.hostname.includes("google.") || 
      location.hostname.includes("duckduckgo.") || 
      location.hostname.includes("search.brave.")) {
    return;
  }

  const STORAGE_KEY = "hz";
  let prefs = { aiPageDetector: true };
  let detectorPanel = null;

  // Load preferences
  try {
    chrome.storage.sync.get([STORAGE_KEY], (data) => {
      const s = (data && data[STORAGE_KEY]) || {};
      prefs = { ...prefs, ...s };
      if (prefs.aiPageDetector) {
        initDetector();
      }
    });
  } catch (e) {
    console.log("[AI Detector] storage error:", e);
  }

  function initDetector() {
    // Wait for page to settle
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", analyzePage);
    } else {
      // Small delay to let dynamic content load
      setTimeout(analyzePage, 1000);
    }
  }

  function extractArticleText() {
    // Try to find main content area
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
      ".post"
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
      
      paragraphs.forEach(p => {
        const parent = p.parentElement;
        if (!parent) return;
        const text = parent.innerText.trim();
        const score = text.length;
        // Prefer elements that aren't nav/header/footer
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
    // Split by paragraphs or headers
    const sections = [];
    const chunks = text.split(/\n\n+/);
    
    let currentSection = "";
    chunks.forEach(chunk => {
      const trimmed = chunk.trim();
      if (trimmed.length < 20) return; // Skip very short lines
      
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
    
    return sections.slice(0, 5); // Top 5 sections
  }

  function calculatePerplexity(text) {
    // Simplified perplexity calculation
    // Real perplexity needs a language model, but we can approximate
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    if (sentences.length < 2) return 50;
    
    // Measure word predictability via repetition patterns
    const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const uniqueWords = new Set(words);
    const repetition = words.length / uniqueWords.size;
    
    // Higher repetition = lower perplexity = more AI-like
    // Human text typically has more varied vocabulary
    const perplexity = Math.min(100, Math.max(0, 100 - (repetition - 1) * 30));
    
    return Math.round(perplexity);
  }

  function calculateBurstiness(text) {
    // Measure sentence length variation
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 5);
    if (sentences.length < 3) return 50;
    
    const lengths = sentences.map(s => s.split(/\s+/).length);
    const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance = lengths.reduce((a, b) => a + (b - mean) ** 2, 0) / lengths.length;
    const stdev = Math.sqrt(variance);
    const cv = stdev / mean; // coefficient of variation
    
    // Higher CV = more burstiness = more human-like
    // AI tends to have more uniform sentence lengths
    const burstiness = Math.min(100, Math.max(0, cv * 200));
    
    return Math.round(burstiness);
  }

  function analyzePage() {
    const text = extractArticleText();
    if (text.length < 200) {
      console.log("[AI Detector] Not enough content to analyze");
      return;
    }
    
    console.log("[AI Detector] Analyzing page:", location.hostname, text.length, "chars");
    
    // Overall page score using existing heuristic
    const pageScore = AIScore.score(text, { url: location.href });
    
    // Statistical measures
    const perplexity = calculatePerplexity(text);
    const burstiness = calculateBurstiness(text);
    
    // Combine scores
    // Heuristic: 50%, Perplexity: 25%, Burstiness: 25%
    const combinedScore = Math.round(
      pageScore.overall * 0.5 + 
      (100 - perplexity) * 0.25 + 
      burstiness * 0.25
    );
    
    // Analyze sections
    const sections = splitIntoSections(text);
    const sectionScores = sections.map((section, i) => {
      const score = AIScore.score(section, { url: location.href });
      return {
        index: i + 1,
        preview: section.substring(0, 60) + "...",
        score: score.overall
      };
    });
    
    showDetectorPanel({
      overall: combinedScore,
      heuristic: pageScore.overall,
      perplexity,
      burstiness,
      sections: sectionScores,
      wordCount: text.split(/\s+/).length
    });
  }

  function showDetectorPanel(data) {
    // Remove existing panel
    if (detectorPanel) {
      detectorPanel.remove();
      detectorPanel = null;
    }

    const band = data.overall < 35 ? "low" : data.overall < 65 ? "med" : "high";
    const bandColor = band === "low" ? "#22c55e" : band === "med" ? "#f59e0b" : "#ef4444";
    const bandLabel = data.overall < 35 ? "Human-like" : data.overall < 65 ? "Mixed" : "Likely AI";
    const statColor = (v, threshold) => v < threshold ? "#22c55e" : v < threshold * 2 ? "#f59e0b" : "#ef4444";

    detectorPanel = document.createElement("div");
    detectorPanel.className = "hz-page-detector";
    // v2.0.9: panel content now lives INSIDE the badge div so the
    // pill expands inline (matching the SERP pill UX), instead of
    // a separate absolutely-positioned panel opening above.
    detectorPanel.innerHTML = `
      <div class="hz-page-detector-badge">
        <div class="hz-detector-header-row">
          <span class="hz-detector-dot" style="background:${bandColor}"></span>
          <span class="hz-detector-score">${data.overall}%</span>
          <span class="hz-detector-label">${bandLabel}</span>
        </div>
        <button class="hz-detector-close" type="button" aria-label="Close">✕</button>
        <div class="hz-detector-panel">
          <div class="hz-detector-panel-header">
            <span class="hz-detector-dot" style="background:${bandColor};width:10px;height:10px"></span>
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
              <span class="hz-detector-stat-value" style="color:${data.perplexity > 50 ? "#22c55e" : "#f59e0b"}">${data.perplexity}</span>
              <span class="hz-detector-stat-label">Perplexity</span>
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
            ${data.sections.map(s => `
              <div class="hz-detector-section">
                <span class="hz-detector-section-score" style="color:${s.score < 35 ? "#22c55e" : s.score < 65 ? "#f59e0b" : "#ef4444"}">${s.score}%</span>
                <span class="hz-detector-section-preview">${escapeHtml(s.preview)}</span>
              </div>
            `).join("")}
          </div>
          ` : ""}
          <div class="hz-detector-foot">
            Heuristic estimate — not definitive. Perplexity &amp; burstiness are statistical approximations.
          </div>
        </div>
      </div>
    `;

    // Toggle on badge click — pointerdown capture so we beat page handlers.
    // The whole badge area is the trigger now (panel lives inside it).
    const badge = detectorPanel.querySelector(".hz-page-detector-badge");
    badge.addEventListener("pointerdown", (e) => {
      // If the click was on the close button or inside the panel
      // content, let the inner click handlers do their thing; we
      // still want to STOP link navigation in either state.
      if (e.target.closest(".hz-detector-close")) return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      detectorPanel.classList.toggle("hz-expanded");
    }, true);

    // Close button — same capture-phase treatment.
    const closeBtn = detectorPanel.querySelector(".hz-detector-close");
    if (closeBtn) {
      closeBtn.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        detectorPanel.classList.remove("hz-expanded");
      }, true);
    }

    // Close when clicking outside — capture phase, fire on every page click.
    document.addEventListener("pointerdown", (e) => {
      if (detectorPanel && !detectorPanel.contains(e.target)) {
        detectorPanel.classList.remove("hz-expanded");
      }
    }, true);

    document.body.appendChild(detectorPanel);
    console.log("[AI Detector] Panel shown:", data.overall + "%", bandLabel);
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

})();