# Horizon Tab 🌅

A minimal, beautiful, customizable new tab page for Chromium browsers (Brave, Chrome, Edge, Opera, etc.) and Firefox.

Replace your browser's new tab with something that's actually nice to look at — clean typography, smooth animations, liquid glass effects, and useful info without the clutter. **~35 KB total**, zero dependencies.

## Features

- **🕐 Clean clock & greeting** — big beautiful time with ambient-aware greeting
- **🌤️ Live weather** — current temp, conditions, and hi/lo from the National Weather Service (no API key needed)
- **🔍 Smart search bar** — type to search, paste a URL to navigate directly. Supports Google, DuckDuckGo, Brave, Bing, Startpage, Kagi, Qwant, and SearXNG
- **🔗 Custom quick links** — add, edit, remove, name, set emoji or **upload your own image** for each link
- **🎨 4 handcrafted themes** — Black, White, Navy, and Amber (`#ff6200` orange)
- **🖼️ Smart background** — upload any image; extension analyzes brightness and switches text/surface colors for best visibility
- **🥃 Liquid glass effects** — subtle glass-morphism surfaces, floating orb animation
- **✨ Smooth animations** — everything fades in and transitions buttery smooth
- **⚡ Blazing fast** — pure vanilla JS, no frameworks, ~35 KB total, zero dependencies
- **💾 Settings persist** — via `chrome.storage.sync`, syncs across devices

## Installation

### Brave / Chrome / Edge / Opera / Vivaldi (Chromium)

1. Download or clone this repo
2. Open `brave://extensions` (or `chrome://extensions`, `edge://extensions`)
3. Enable **Developer mode** (toggle in top-right)
4. Click **Load unpacked**
5. Select the `horizon-tab` folder
6. Open a new tab

### Firefox

1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on**
3. Select the `manifest.json` file

> Firefox falls back to `localStorage` if `chrome.storage.sync` isn't available in temporary add-ons.

### Orion

Orion is WebKit-based (macOS/iOS) and supports Chrome extensions, but it **does not support `chrome_url_overrides`** (the API that replaces the new tab page). Workaround:

1. Load the extension via Orion's extension manager (same "Load unpacked" flow at `orion://extensions`)
2. Set the file path to `tab.html` as your homepage in Orion's Start Page settings

This means Horizon will open when you launch the browser or click the home button, but won't fully replace the native new tab. If Orion adds `chrome_url_overrides` support in a future update, it'll work natively.

## Customization

Click the **⚙️** button in the bottom-right to open the settings panel:

- **Theme** — Choose from Black, White, Navy, or Modern (auto day/night with `#ff6200` orange accents)
- **Background** — Upload your own PNG/JPEG image; text and elements automatically adjust for maximum readability
- **Search Engine** — Pick from 8 search engines
- **Quick Links** — Add/edit/remove links with custom names, emojis, or uploaded images

All settings auto-save and sync.

## Themes

| Theme  | Preview | Vibe |
|--------|---------|------|
| Black  | `#0a0a0a` | True black, high contrast, minimal |
| White  | `#f5f5f0` | Clean warm paper, light mode |
| Navy   | `#001E44` | Penn State deep blue elegance |
| Modern | Day/Night | White bg/orange accents by day, dark bg/orange by night — switches automatically |

## Lightweight

- **~35 KB** total for all files
- Zero frameworks, zero dependencies
- Vanilla CSS/JS only
- No unused re-renders, no React, no build step

## License

MIT
