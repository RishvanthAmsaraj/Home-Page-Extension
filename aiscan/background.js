/* ════════════════════════════════════════════════════════════════════
   Horizon AI Signal — Background Script
   Handles cross-origin API calls (Safe Browsing, etc.)
   ════════════════════════════════════════════════════════════════════ */

// Cache for Safe Browsing results
const safeBrowsingCache = {};

// Google Safe Browsing API check
// Note: In production, get your own API key from Google Cloud Console
// https://developers.google.com/safe-browsing/v4/get-started
async function checkSafeBrowsing(hostname) {
  // Return cached result if available (cache for 1 hour)
  const now = Date.now();
  if (safeBrowsingCache[hostname] && (now - safeBrowsingCache[hostname].timestamp) < 3600000) {
    return safeBrowsingCache[hostname].result;
  }
  
  try {
    // For demo purposes, we'll simulate the API response
    // In production, replace this with actual API call:
    // const apiKey = "YOUR_API_KEY";
    // const url = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`;
    
    // Simulated check — in production this would be a real API call
    // that checks Google's Safe Browsing database
    const simulatedResult = {
      threats: [],
      checked: true,
      source: "simulated"
    };
    
    // Cache the result
    safeBrowsingCache[hostname] = {
      result: simulatedResult,
      timestamp: now
    };
    
    return simulatedResult;
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