# Horizon Tab

A minimal, beautiful, zero-dependency new tab page for Chromium and Firefox browsers. Roughly 200 KB of hand-written vanilla JavaScript and CSS.

## Features

- **Clean clock & greeting** — large, beautiful typography with ambient-aware greeting
- **Live weather** — current conditions, temperature, and hi/lo from the National Weather Service (no API key required)
- **Smart search bar** — one pill-shaped surface for searching or navigating. Type a query, paste a URL, or enter a domain. Supports Google, DuckDuckGo, Brave, Bing, Startpage, Kagi, Qwant, and SearXNG
- **Custom quick links** — add, edit, remove, rename, set emoji, or upload custom images for each link
- **Four handcrafted themes** — Slate, Ivory, Navy, and Modern (auto day/night with orange accents)
- **Smart background** — upload any image; the extension automatically adjusts text and surface colors for readability
- **AI Signal** *(optional)* — a client-side heuristic that scores search results for AI-likelihood on Google, DuckDuckGo, and Brave. Pure client-side, no network requests for scoring. [See the methodology →](docs/methodology.html)
- **Page detector** *(optional, off by default)* — a floating AI-likelihood indicator on article pages you visit. All text analysis runs on-device
- **Safe Browsing** *(optional)* — supply your own Google Safe Browsing API key to check visited sites. Hostname-only, never page content
- **Settings sync** — all preferences persist via `chrome.storage.sync` across devices
- **No frameworks, no build step, zero dependencies**

## Quick start

### Chromium (Brave, Chrome, Edge, Opera, Vivaldi)

```
git clone https://github.com/RishvanthAmsaraj/Home-Page-Extension
```

1. Open `brave://extensions` (or `chrome://extensions`, `edge://extensions`)
2. Enable **Developer mode**
3. Click **Load unpacked** and select the cloned folder
4. Open a new tab

### Firefox

1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on**
3. Select `manifest.json`

> Firefox requires version 128+ for `optional_host_permissions`.

## Customization

Click the gear icon in the bottom-right to open settings:

- **Theme** — Slate, Ivory, Navy, or Modern (auto day/night)
- **Background** — upload an image; text and surfaces adjust automatically
- **Glass Intensity** — surface translucency slider
- **Default Search Engine** — pick from eight engines
- **Default AI Provider** — Perplexity, Grok, Gemini, ChatGPT, Claude, or DeepSeek
- **Weather Location** — set your coordinates (defaults to State College, PA)
- **AI Signal** — toggle scoring on SERPs, set sensitivity, set auto-hide threshold
- **Page Detector** — opt in to on-device AI-likelihood analysis on articles
- **Safe Browsing Key** — optional API key for hostname safety checks
- **Quick Links** — manage your link grid

All settings auto-save across sessions.

## Architecture

| File | Purpose |
|------|---------|
| `manifest.json` | Extension manifest (MV3) |
| `tab.html` | New tab page shell |
| `tab.css` | All styles — liquid glass, themes, animations |
| `tab.js` | Core logic — clock, weather, search, settings, links |
| `aiscan/` | AI Signal module (scorer, SERP injector, page detector, styles, calibration harness) |
| `icons/` | Extension icons (16, 48, 128 px) |

The AI Signal module is loaded **only** on search pages by default. The page detector is dynamically registered on first opt-in and never runs without explicit permission.

## AI Signal (optional)

AI Signal applies a heuristic to search result titles and snippets — text patterns, author/byline signals, and domain reputation — combined through a calibrated scoring function. It operates entirely on-device; no page content is fetched, no data leaves your browser.

Read the [full methodology](docs/methodology.html) and run the [calibration harness](docs/test-score.node.js):

```
node aiscan/test-score.node.js [low | med | high]
```

## Privacy

Horizon Tab has no servers, no analytics, no tracking, and no accounts. All data stays in your browser. See [PRIVACY.md](PRIVACY.md) for a full accounting of network requests.

## License

[MIT](LICENSE.md)
