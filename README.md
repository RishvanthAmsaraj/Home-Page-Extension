# Horizon Tab 🌅

A minimal, beautiful, customizable new tab page for Chromium browsers (Brave, Chrome, Edge, Opera, etc.) and Firefox.

Replace your browser's new tab with something that's actually nice to look at — clean typography, smooth animations, liquid glass effects, and useful info without the clutter. **~35 KB total**, zero dependencies.

## Features

- **🕐 Clean clock & greeting** — big beautiful time with ambient-aware greeting
- **🌤️ Live weather** — current temp, conditions, and hi/lo from the National Weather Service (no API key needed)
- **🔍 Smart search bar** — type to search, paste a URL to navigate directly. Supports Google, DuckDuckGo, Brave, Bing, Startpage, Kagi, Qwant, and SearXNG
- **🔗 Custom quick links** — add, edit, remove, name, set emoji or **upload your own image** for each link
- **🎨 4 handcrafted themes** — Slate, Ivory, Navy, and Modern (auto day/night with `#ff6200` orange accents)
- **🖼️ Smart background** — upload any image; extension analyzes brightness and switches text/surface colors for best visibility
- **🥃 Liquid glass effects** — subtle glass-morphism surfaces, floating orb animation
- **✨ Smooth animations** — bouncy spring + smooth Apple curves, everything fades in and transitions buttery smooth
- **🤖 AI Signal** *(beta)* — heuristic AI-likelihood score on Google / DuckDuckGo / Brave search results. Shows an "AI: NN%" badge per result, optionally hides high-AI ones. **Pure client-side. No API. No fetch of result pages.** [Read the methodology →](aiscan/spike.html)
- **⚡ Blazing fast** — pure vanilla JS, no frameworks, ~125 KB total, zero dependencies
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

- **Theme** — Choose from Slate, Ivory, Navy, or Modern (auto day/night with `#ff6200` orange accents)
- **Background** — Upload your own PNG/JPEG image; text and elements automatically adjust for maximum readability
- **Glass Intensity** — surface translucency slider
- **Default Search Engine** — Pick from 8 search engines
- **Default AI Provider** — Perplexity, Grok, Gemini, ChatGPT, Claude, or DeepSeek
- **AI Signal** *(beta)* — toggle the search-result heuristic scorer, set sensitivity (Low/Med/High), set the hide-above threshold, read the methodology
- **Quick Links** — Add/edit/remove links with custom names, emojis, or uploaded images

All settings auto-save and sync.

## Themes

| Theme  | Preview | Vibe |
|--------|---------|------|
| Slate  | `#0d0d0d` | Deep charcoal, softer than true black, premium |
| Ivory  | `#f3f1ed` | Warm off-white, easy on the eyes |
| Navy   | `#001E44` | Penn State deep blue elegance |
| Modern | Day/Night | Ivory bg/orange accents by day, dark bg/orange by night — switches automatically |

## AI Signal (beta)

> A client-side "smell test" for AI-flavored search results. Honest about its limits: it's a heuristic, not a classifier.

**What it does.** When you enable AI Signal in settings, every Google / DuckDuckGo / Brave search result gets a small "AI: NN% · Human-like / Mixed / Likely AI" badge injected under the URL line. If you set a hide threshold (e.g. 75%), results that meet it collapse to a hover-to-expand line. Per-result ✕ dismisses a domain forever.

**What it looks at.** Just the title, snippet, and URL — the same text the search engine already shows you. **The article body is never fetched.** Your browsing history stays yours.

**Three signals, combined:**

- **Text patterns (65%)** — weighted lexicon of 30+ AI-isms (*"delve into"*, *"navigate the complexities"*, *"in today's digital landscape"*, *"it's important to note"*, …), plus sentence-length uniformity and em-dash density.
- **Author / byline (15%)** — looks for named humans (`"By Jane Smith"`) in the snippet; penalizes self-disclosure (`"AI-generated"`).
- **Domain signals (20%)** — URL shape (TLD, hyphen slug, date-stamped path) with a small whitelist of known human publications (NYT, Atlantic, Wired, etc.) that override the score downward.

**Calibration.** Low (×0.55, only flag obvious) / Medium (×1.0, default) / High (×1.35, sensitive). The default is conservative on purpose: false positives — accusing a real journalist of being AI — are worse than false negatives.

**Calibration examples (medium sensitivity, title + snippet):**

| Snippet | Score | Band |
|---|---|---|
| NYT investigative report on a donor network | 14% | Human-like |
| Substack cooking post about burning a roux | 11% | Human-like |
| Brené Brown personal essay | 11% | Human-like |
| Wikipedia disambiguation page | 5% | Human-like |
| SEO content farm listicle | 76% | Likely AI |
| AI-tool review blog (multifaceted / comprehensive / actionable) | 79% | Likely AI |

**What it will NOT do.** It will not catch lightly-edited AI text. It will not catch a human who happens to write in a corporate / listicle style. It will not give you a definitive "this is AI" answer. Anyone who tells you they can do that from a browser extension is lying. [Read the full methodology →](aiscan/spike.html)

## Lightweight

- **~125 KB** total for all files (CSS + JS + HTML + manifest + icons + screenshots)
- Zero frameworks, zero dependencies
- Vanilla CSS/JS only — no React, no build step
- The AI Signal module alone is ~20 KB; it's loaded only on Google / DDG / Brave search pages via `content_scripts`, not on every page

## License

MIT
