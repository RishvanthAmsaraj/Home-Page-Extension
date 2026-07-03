/* ════════════════════════════════════════════════════════════════════
   Horizon AI Signal — Background Service Worker
   Handles cross-origin fetches the content script can't make directly.

   SECURITY HISTORY (v3.0):
     The Google Safe Browsing feature was REMOVED entirely because:
       1. It was dead code (background.js had the message listener,
          but content.js never sent the message) — no user-facing
          behavior depended on the leaked API key.
       2. Hardcoding the API key in this repo put it in public git
          history. The owner MUST rotate the key in Google Cloud
          Console even though we've scrubbed it from history.
       3. The right pattern for client-side extensions is OAuth
          + chrome.identity, or a user-supplied API key stored
          in chrome.storage.sync (set via the options page).

   If/when Safe Browsing is reintroduced, it must be opt-in via
   settings with the user's own API key. Do NOT re-add the
   hardcoded key.
   ════════════════════════════════════════════════════════════════════ */

// Placeholder message router. Add handlers here when a feature
// needs background-only access. Always return true for async
// handlers so the message channel stays open.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  sendResponse({ ok: false, reason: "no handler registered" });
  return true;
});

console.log("[AI Signal Background] Service worker loaded");
