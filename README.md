# Horizon Tab 🌅

A minimal, beautiful, customizable new tab page for Chromium browsers (Brave, Chrome, Edge, Opera, etc.) and Firefox.

Replace your browser's new tab with something that's actually nice to look at — clean typography, smooth animations, liquid glass effects, and useful info without the clutter. **~200 KB of hand-written code**, zero dependencies.

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
- **⚡ Blazing fast** — pure vanilla JS, no frameworks, zero dependencies, one storage write per change (debounced + diffed)
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
> The optional page detector needs Firefox 128+ (for `optional_host_permissions`).

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
- **Weather Location** — set your own US coordinates for the NWS forecast (defaults to State College, PA)
- **AI Signal** *(beta)* — toggle the search-result heuristic scorer, set sensitivity (Low/Med/High), set the hide-above threshold, read the methodology
- **Page detector** *(optional, off by default)* — floating AI-likelihood pill (dot + percentage, expands to the full breakdown) on article pages you visit. Turning it on asks for permission to run on all sites; the text analysis is fully on-device
- **Safe Browsing key** *(optional)* — supply your own Google Safe Browsing API key and the page detector will warn on flagged sites. Sends only the hostname to Google, only if a key is set
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

- **Text patterns (65%)** — a curated lexicon of ~80 AI-isms (*"delve into"*, *"navigate the complexities"*, *"in today's digital landscape"*, …), each capped so repetition can't max the score, plus sentence-length uniformity, *"Firstly… Secondly… Finally"* scaffolding, transition-word density and em-dash density. Evidence is normalized as a density per ~45 words, so long text doesn't inflate the score and short snippets don't starve it.
- **Author / byline (15%)** — looks for named humans (`"By Jane Smith"`) in the snippet; self-disclosure (`"AI-generated"`) is a near-certain AI signal. A missing byline is **not** penalized — search engines truncate them constantly.
- **Domain signals (20%)** — URL shape (TLD, hyphen slug) plus a curated list of human-edited publications (NYT, Atlantic, Wired, …) matched on the parsed hostname, which pulls the score downward. A separate deterministic trust score rates domain reputation.

**Calibration.** The three sensitivities bend the score curve rather than multiplying it: **Low** compresses mid-range scores so only extreme evidence crosses the "Likely AI" line, **Medium** is the identity (default), **High** stretches scores upward. The default is conservative on purpose: false positives — accusing a real journalist of being AI — are worse than false negatives.

**Calibration examples (medium sensitivity, title + snippet):**

| Snippet | Score | Band |
|---|---|---|
| Investigative news lede (records request, quotes) | 4% | Human-like |
| Substack cooking post about burning a roux | 10% | Human-like |
| Wikipedia-style neutral prose | 4% | Human-like |
| Casual forum answer (Reddit) | 4% | Human-like |
| Corporate press release (formal but human) | 9% | Human-like |
| SEO marketing sludge ("in today's digital landscape…") | 71% | Likely AI |
| AI listicle intro ("comprehensive guide… actionable strategies") | 69% | Likely AI |
| ChatGPT-style explainer ("Firstly… Secondly… In conclusion") | 70% | Likely AI |

*(Reproducible: `node aiscan/test-score.node.js` runs these fixtures at any sensitivity.)*

**What it will NOT do.** It will not catch lightly-edited AI text. It will not catch a human who happens to write in a corporate / listicle style. It will not give you a definitive "this is AI" answer. Anyone who tells you they can do that from a browser extension is lying. [Read the full methodology →](aiscan/spike.html)

## Lightweight

- **~200 KB** of code total (JS + CSS + HTML + manifest), ~315 KB installed with icons
- The new tab page itself is ~90 KB; search pages load ~84 KB (scorer + badges); **other sites load 0 KB** unless you opt into the page detector
- Zero frameworks, zero dependencies
- Vanilla CSS/JS only — no React, no build step
- The AI Signal module is loaded **only** on Google / DDG / Brave search pages via `content_scripts` — never on every page
- The optional page detector is registered dynamically (`chrome.scripting`) only after you enable it in settings and grant the permission; turn it off and the script is unregistered again

## License

MIT
