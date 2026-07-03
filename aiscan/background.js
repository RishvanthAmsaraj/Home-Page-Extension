/* ════════════════════════════════════════════════════════════════════
   Horizon AI Signal — Background Script
   Handles cross-origin API calls (Safe Browsing, etc.)
   ════════════════════════════════════════════════════════════════════ */

// Cache for Safe Browsing results
const safeBrowsingCache = {};

// Google Safe Browsing API key
// Get your own: https://developers.google.com/safe-browsing/v4/get-started
const SAFE_BROWSING_API_KEY = "[REDACTED-SAFE-BROWSING-KEY]";

// Google Safe Browsing API check
async function checkSafeBrowsing(hostname) {
  // Return cached result if available (cache for 1 hour)
  const now = Date.now();
  if (safeBrowsingCache[hostname] && (now - safeBrowsingCache[hostname].timestamp) < 3600000) {
    return safeBrowsingCache[hostname].result;
  }
  
  try {
    const url = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${SAFE_BROWSING_API_KEY}`;
    
    const body = {
      client: {
        clientId: "horizon-tab",
        clientVersion: "1.8.0"
      },
      threatInfo: {
        threatTypes: [
          "MALWARE",
          "SOCIAL_ENGINEERING",
          "UNWANTED_SOFTWARE",
          "POTENTIALLY_HARMFUL_APPLICATION"
        ],
        platformTypes: ["ANY_PLATFORM"],
        threatEntryTypes: ["URL"],
        threatEntries: [
          { url: `https://${hostname}` },
          { url: `http://${hostname}` }
        ]
      }
    };
    
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    const result = {
      threats: data.matches || [],
      checked: true,
      source: "google_safe_browsing"
    };
    
    // Cache the result
    safeBrowsingCache[hostname] = {
      result: result,
      timestamp: now
    };
    
    return result;
  } catch (err) {
    console.error("[AI Signal Background] Safe Browsing check failed:", err);
    return null;
  }
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "checkSafeBrowsing") {
    checkSafeBrowsing(request.hostname).then(result => {
      sendResponse({ result });
    }).catch(err => {
      sendResponse({ error: err.message });
    });
    return true; // Keep channel open for async
  }
});

console.log("[AI Signal Background] Service worker loaded");