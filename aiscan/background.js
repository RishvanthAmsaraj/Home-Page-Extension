/* ════════════════════════════════════════════════════════════════════
   Horizon AI Signal — Background Service Worker
   Handles cross-origin fetches the content script can't make directly.

   SECURITY MODEL (v3.1):
     The Google Safe Browsing API requires an API key. In v2.x the
     key was hardcoded in this file, which put it in PUBLIC GIT
     HISTORY. GitHub's secret scanner flagged it; the key had to
     be rotated. The right pattern for a client-side extension is:
       - The user provides their own key via the extension's
         settings page.
       - The key is stored in chrome.storage.sync (per-browser
         sync, never bundled with the extension).
       - It is applied at request time, never committed to source.
     If the user has not provided a key, the Safe Browsing check
     is skipped silently — no network call, no warning spam.
   ════════════════════════════════════════════════════════════════════ */

// In-memory cache so we don't hammer the Safe Browsing API for the
// same hostname within an hour.
const safeBrowsingCache = {};
const SAFE_BROWSING_TTL_MS = 60 * 60 * 1000;

/* Read the user's Safe Browsing API key from chrome.storage.sync.
   Returns null if the user has not provided one. */
async function getSafeBrowsingKey() {
  try {
    const r = await chrome.storage.sync.get(["hz_sb_key"]);
    return typeof r.hz_sb_key === "string" && r.hz_sb_key.length > 10
      ? r.hz_sb_key
      : null;
  } catch {
    return null;
  }
}

/* Check a hostname against Google Safe Browsing. Returns:
     { skipped: true }            — no key configured, no check
     { checked: true, threats: [] } — clean
     { checked: true, threats: [...] } — flagged */
async function checkSafeBrowsing(hostname) {
  const now = Date.now();
  if (safeBrowsingCache[hostname] && (now - safeBrowsingCache[hostname].t) < SAFE_BROWSING_TTL_MS) {
    return safeBrowsingCache[hostname].result;
  }

  const apiKey = await getSafeBrowsingKey();
  if (!apiKey) {
    return { skipped: true, reason: "no api key configured" };
  }

  try {
    const url = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${encodeURIComponent(apiKey)}`;
    const body = {
      client: { clientId: "horizon-tab", clientVersion: "3.1" },
      threatInfo: {
        threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
        platformTypes: ["ANY_PLATFORM"],
        threatEntryTypes: ["URL"],
        threatEntries: [
          { url: `https://${hostname}` },
          { url: `http://${hostname}` },
        ],
      },
    };
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const result = { checked: true, threats: data.matches || [] };
    safeBrowsingCache[hostname] = { t: now, result };
    return result;
  } catch (err) {
    console.error("[AI Signal Background] Safe Browsing check failed:", err);
    return { skipped: true, reason: "request failed", error: String(err && err.message || err) };
  }
}

// Message router for content script -> background.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request && request.action === "checkSafeBrowsing" && request.hostname) {
    checkSafeBrowsing(request.hostname).then(result => {
      sendResponse({ ok: true, result });
    }).catch(err => {
      sendResponse({ ok: false, error: String(err && err.message || err) });
    });
    return true; // keep channel open for async response
  }
  sendResponse({ ok: false, reason: "no handler" });
  return true;
});

console.log("[AI Signal Background] Service worker loaded");
