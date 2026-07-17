# Horizon Tab — Privacy Policy

**Short version: Horizon Tab has no servers, no analytics, no tracking, and no accounts. Your data stays in your browser.**

## What the extension stores

- **Settings** (theme, quick links, search engine, AI Signal preferences, weather coordinates) are stored in `chrome.storage.sync`, which your browser may sync across your own devices through your browser account. Nothing is sent to the developer.
- **Custom background images** are stored in `chrome.storage.local` on your device only.
- **AI Signal dismissals and ✓ Human / ✗ AI marks** are stored in `chrome.storage.sync` under a separate key.

## Network requests the extension makes

- **Weather** — the new tab page requests the forecast from the U.S. National Weather Service (`api.weather.gov`) using the coordinates in your settings (default: State College, PA). No account or key is involved.
- **Quick-link icons** — when a quick link has no custom icon, its favicon is loaded from Google's public favicon service (`google.com/s2/favicons`), which necessarily sees the link's domain.
- **Google Safe Browsing (optional, off by default)** — only if you paste your own API key into settings does the extension check hostnames you visit against Google Safe Browsing. This sends the hostname (never the full URL, never page content) to Google under **your** key. Leave the field blank and no request is ever made.

## AI Signal

All AI-likelihood scoring — on search results and, if you opt in, on pages you visit — runs **entirely on your device**. No page content, search query, or score ever leaves your browser.

## Permissions

- The extension injects its scoring script only on Google, DuckDuckGo, and Brave **search pages**.
- The optional page detector requires the "read data on all websites" permission; it is requested only when you enable the toggle, and the script is unregistered again if you turn it off.

## Contact

Questions or concerns: open an issue on the GitHub repository.
