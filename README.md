# Horizon Tab 🌅

A minimal, beautiful, customizable new tab page for Chromium browsers (Brave, Chrome, Edge, Opera, etc.) and Firefox.

Replace your browser's new tab with something that's actually nice to look at — clean typography, liquid glass effects, and useful info at a glance without the clutter.

## Features

- **🕐 Clean clock & greeting** — big beautiful time with ambient-aware greeting
- **🌤️ Live weather** — current temp, conditions, and hi/lo from the National Weather Service (no API key needed)
- **🔍 Smart search bar** — type to search, paste a URL to navigate directly
- **🔗 Custom quick links** — add, edit, remove, name, and set emoji or image for each link
- **🎨 4 handcrafted themes** — Navy, Dark, Frost, and Amber
- **🔎 Search engine picker** — Google, DuckDuckGo, Brave Search, or Bing
- **🥃 Liquid glass effects** — subtle ambient glow and glass-morphism surfaces that breathe
- **⚡ Blazing fast** — pure vanilla JS, no frameworks, no dependencies
- **💾 Settings persist** — via `chrome.storage.sync`, syncs across devices

## Screenshots

*(Add your own!)*

## Installation

### Brave / Chrome / Edge / Opera (Chromium)

1. Download or clone this repo
2. Open `brave://extensions` (or `chrome://extensions`, `edge://extensions`)
3. Enable **Developer mode** (toggle in top-right)
4. Click **Load unpacked**
5. Select the `horizon-tab` folder
6. Open a new tab — 🎉

### Firefox

1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on**
3. Select the `manifest.json` file in the folder
4. Open a new tab

> **Note for Firefox:** `chrome.storage.sync` may not be available in temporary add-ons. The extension automatically falls back to `localStorage` if sync storage isn't available.

## Customization

Click the **⚙️** button in the bottom-right to open the settings panel:

- **Search Engine** — Pick your preferred search engine
- **Quick Links** — Add new links, edit existing ones (label, URL, emoji, image URL), or remove them
- **Theme** — Choose from Navy, Dark, Frost, or Amber

All settings are saved automatically and sync across devices signed into the same browser account.

## Themes

| Theme  | Vibe                                      |
|--------|-------------------------------------------|
| Navy   | Penn State-inspired, deep blue elegance   |
| Dark   | True black, minimal, high contrast        |
| Frost  | Cool blue-gray, serene and calm           |
| Amber  | Warm golden tones, cozy and rich          |

## Building from Source

No build step needed. The extension is pure HTML/CSS/JS. Edit any file and reload the extension to see changes.

## License

MIT
