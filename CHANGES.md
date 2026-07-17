# Horizon Tab 1.10.0 — Full Review & Fix Changelog

Every file was reviewed: `manifest.json`, `tab.html`, `tab.js`, `tab.css`, and the whole `aiscan/` module. The AI-Signal scorer was rebuilt with a measurable calibration harness, the extension's injection model now matches what the README promises, and a set of real correctness/security bugs are fixed. All JS passes `node --check`; the scorer passes 13/13 calibration fixtures at all three sensitivities plus determinism and low-sensitivity invariants (`node aiscan/test-score.node.js [low|med|high]`).

---

## 1. Critical fixes

- **Misinformation sites scored as high-trust publications.** The "known human publications" whitelist in `score.js` had accidentally absorbed a large block of misinformation/conspiracy domains (infowars, naturalnews, mercola, beforeitsnews, prisonplanet, zerohedge, and ~40 more — it looks like a "sites to avoid" list got pasted into the "trusted" list). Measured: `infowars.com` got **trust 89 and a −30 AI-score reduction**. The list is rebuilt (curated, deduped, misinformation domains removed), and matching now uses the parsed hostname instead of substring-anywhere — `evil-site.xyz/nytimes.com-review` used to score trust 85–95; it now scores 20.
- **Stored XSS in quick links.** Link labels, URLs, and image URLs were injected into `innerHTML` unescaped in both the links grid and the settings editor, and `javascript:` URLs were accepted as hrefs. A label like `"><img src=x onerror=…>` executed in the new-tab page. All user content is now HTML-escaped and hrefs are sanitized to http(s)-only (`esc()` / `safeHref()`).
- **Changing any setting wiped your dismissed domains.** The SERP script stored dismissals and ✓Human/✗AI marks inside the same `hz` object that `tab.js` rewrites *without* those keys — so touching any setting on the new tab erased them all. They now live in their own sync key (`hzAI`) with read-modify-write persistence and a one-time migration of existing data.
- **You couldn't type `/` or `?` in the search box.** The global keyboard shortcuts intercepted those keys even while typing — `/` was swallowed, and `?` opened the settings panel mid-query. Shortcuts now ignore keystrokes while an input/textarea/contenteditable is focused.
- **Arrow keys couldn't move the text cursor.** With the drawer open (i.e., whenever the input was focused), ←/→ were hijacked to switch drawer tabs, so the caret couldn't move within your query. Only ↓ now leaves the input (to the drawer); ←/→/↑ stay with the caret.
- **Trust scores were random.** `scoreTrust()` mixed `Math.random()` into every band — the same URL returned 92, 85, 91, 86, 86 on consecutive calls. Now deterministic.
- **Page-detector burstiness was inverted.** High burstiness (varied sentence lengths) is a *human* signal, but the detector **added** it to the AI score — the most human-sounding pages ate a ~25-point penalty. Polarity fixed.
- **The page detector ran on every website, default-on, with no off switch.** See §3.

## 2. AI Signal scorer v2 (`aiscan/score.js`)

Measured failure modes, before → after (all reproducible via the probes in this session / the harness):

| Failure mode | v1 | v2 |
|---|---|---|
| Casual human text ("my family… everyone… I mean…") | **71% "Likely AI"** | **0%** |
| Duplicate lexicon entries double-counting one phrase | **100%** | 21% |
| Same human paragraph repeated 1×/4×/8× (length inflation) | 18 / 29 / 43 | 0 / 0 / 0 |
| Extreme AI sludge at *Low* sensitivity | 46 (band ≥65 mathematically unreachable) | 60 mixed; corroborated extreme case **80** — Low can still flag the obvious |
| `"by using these tips"` treated as a human byline (`/i` flag on a name-shape regex) | author 5 | neutral 25 |
| InfoWars trust | 89 | 50 |
| Whitelist substring attack (`…xyz/nytimes.com-review`) | 85–95 | 20 |
| Same-URL trust, 5 calls | 92, 85, 91, 86, 86 | 90 × 5 |

What changed inside:

- **Lexicon rebuilt.** ~60 noise patterns removed — entries like `y'all/folks` (which matched "people" and "everyone"), `fam/squad` (matched "family", "team"), `i mean/you know` (matched "like", "literally", "honestly"), slang lists, and the duplicated entries ("that being said", "at the end of the day", "long story short", "fast forward", "mic drop", "it is what it is" each appeared twice and double-counted). Genuinely strong tells added: *"as an AI language model"* (w20), *"as of my last knowledge update"*, *"vibrant tapestry"*, *"underscores the importance"*, *"plays a crucial role"*, travel-filler tells (*nestled/boasts/hidden gem/must-visit*), and more.
- **Per-pattern hit cap (×2)** — one repeated phrase can no longer max the score (v1 referenced `maxHits` but never defined it anywhere).
- **Length normalization** — raw evidence becomes a density per ~45 words, squashed through a logistic curve. Long pages don't inflate; short snippets don't starve; zero evidence maps to 0.
- **Structure signals hardened** — uniformity needs ≥4 sentences with mean length ≥6; transition density needs count *and* density; new *"Firstly… Secondly… Finally"* scaffold detector; transition/adjective regexes precompiled once (v1 rebuilt **58 RegExp objects per scored result**).
- **Calibration is a gamma curve** (low γ1.45 / med 1.0 / high 0.78), anchored at 0 and 100 — Low compresses the middle instead of capping the top.
- **New calibration harness** — `aiscan/test-score.node.js`: 13 labeled fixtures (human news, casual forum, Wikipedia-style, press release, SEO sludge, listicles, ChatGPT-style explainer, travel filler…), band assertions per sensitivity, determinism check, and a Low-sensitivity "extreme case must still flag" invariant. Currently 13/13 at low, med, and high.

## 3. Injection model now matches the README (`manifest.json`, `background.js`, `detector.js`)

The README promises the AI module loads "only on Google / DDG / Brave search pages… not on every page." In reality a second content-script block injected `score.js` + `detector.js` + `badge.css` (~65 KB) into **every page you visited**, and `detector.js` defaulted `aiPageDetector: true` with **no settings toggle at all** — a floating AI% pill on every article, always.

- The static `<all_urls>` block is gone. The page detector is now **opt-in**: a settings toggle requests the optional `<all_urls>` permission, and `background.js` dynamically registers the detector via `chrome.scripting.registerContentScripts`. Turning it off (or revoking the permission) unregisters the script — zero bytes injected outside SERPs by default.
- `detector.js` also gained hard guards: never in iframes, never on non-http(s) schemes or non-HTML documents, skips thin pages (<400 chars / <80 words), respects your sensitivity setting, and reacts live to settings changes. Its "Perplexity" stat (a words÷unique-words proxy that mechanically penalized longer articles) is replaced with **MATTR** — a sliding 50-word type-token ratio that's length-invariant — relabeled honestly as "Vocab Variety."
- Manifest cleanups: the bogus `*://safebrowsing.googleapis.com/*` content-script match is removed (content scripts can't run on an API endpoint — it was a paste error), the unused `activeTab` permission is dropped, `scripting` + `optional_host_permissions` added.
- **Firefox:** the background now also declares `"scripts"` — Firefox has no MV3 service workers, so the background worker **never actually loaded on Firefox before**. `strict_min_version` set to 128 (needed for `optional_host_permissions`). Chrome ≥121 accepts both keys.
- Version bumped 1.9.0 → **1.10.0**.

## 4. SERP script (`aiscan/content.js`)

- **Sensitivity/threshold changes now actually apply.** The old rescan was a no-op because every card kept its "done" flag; settings changes now clear flags, remove badges, and rescore live.
- **✓ Human / ✗ AI marks persist visually** across reloads (they were stored but never displayed again), and a domain you marked Human is never auto-collapsed by the hide threshold.
- MutationObserver batches added nodes into a single rAF pass (Google's SERP mutates constantly; scoring inside the callback caused long tasks), and **disconnects entirely while AI Signal is off**.
- Dead code removed (`DISMISS_KEY`, the phantom `aiDismissedUrls` feature, an unused per-card `innerHTML` read), all `console.log` spam gated behind a `DEBUG` flag, and the methodology modal moved inside the IIFE (it previously worked only by accidental hoisting).
- The selector library is untouched — it's marked "known working" and I kept it verbatim.

## 5. Performance (`tab.js`)

- **Storage writes debounced (250 ms) + diffed.** v1 wrote to `chrome.storage.sync` on *every keystroke and every slider pixel* (the quota is 120 writes/min), re-wrote the up-to-500 KB background image on every save, and wrote once per new tab even with zero changes. Now: identical snapshots never write, the image writes only when it changes, unknown keys under `hz` are preserved, and a pending save is flushed on `pagehide` so pressing Enter right after a change can't lose it.
- **Weather is cached** (`chrome.storage.local`, 10-min TTL): opening ten tabs costs one NWS round-trip, not ten. Cached data renders instantly, then refreshes in the background; requests abort after 8 s.
- **Clock ticks once per minute** (aligned to the minute boundary) instead of every second — 60× fewer wakeups — with a `visibilitychange` resync. The Modern theme's day/night switch now updates on long-lived tabs (it was evaluated only at load).

## 6. Animations & UX (`tab.css`, `tab.html`)

- `transition: all` replaced with enumerated properties across 12 rules (weather chip, drawer tabs/buttons, filter chips, link cards, settings toggle/close, theme/engine/upload buttons, small buttons, methodology close). Transforms keep the spring curve; colors get the smooth curve — no more accidental animation of layout properties.
- **Settings panel slides on `transform`** (compositor-only) instead of animating `right` (layout every frame), gets `will-change`, and the closed panel is removed from the tab order via delayed `visibility`.
- **The engine-logo hover scale finally animates** — `.db-svg` had a `:hover` transform but no transition, so it snapped.
- The drawer gets a subtle settle (translateY −6→0 on the spring) layered on the `0fr→1fr` expand; the container no longer double-animates with its children (the compounded ~44 px drift is gone — children carry the stagger, the container just fades).
- The 640-px blurred glass orb gets its own compositor layer (`will-change: transform`); `backdrop-filter` removed from the 7 filter chips (redundant live-blur regions inside an already-frosted drawer).
- **`prefers-reduced-motion` is honored globally** (state changes become instant, the ambient orb stops drifting), and every drawer/settings control has a visible `:focus-visible` ring — the drawer was fully keyboard-navigable but mostly focus-invisible.
- Input focus is now deterministic: the `autofocus` attribute only kept the drawer closed because it happened to fire before the async boot attached the focus→open listener. The attribute is gone; boot focuses programmatically *before* attaching the listener.

## 7. Search fixes (`tab.js`)

- **News / Video / Images filters were broken on every engine.** v1 appended `&tbm=nws` to the query *text* and then `encodeURIComponent`'d the whole thing — so the filter literally searched for the text "&tbm=nws" (and `tbm` is Google-only anyway). Filters are now split into query-text operators (`site:reddit.com`, `filetype:pdf`) and engine-specific media endpoints for Google, DuckDuckGo, Brave, Bing, Startpage, Kagi, Qwant, and SearXNG.
- **URL detection rewritten.** Typing `example.com` now navigates (v1 required the string to already start with `http`, so bare domains searched instead), `localhost:3000` and IPv4 addresses work (v1's localhost branch demanded a dot and was unreachable), and bare domains only navigate when the last label is a real TLD — so `node.js` and `vue.js` search, while `svelte.dev` navigates. Behavior verified against a 10-case test matrix.

## 8. New settings

- **Weather Location** — latitude/longitude inputs (US / NWS coverage). The coordinates were hardcoded to State College, PA; that's still the default, but anyone else who installs the extension can now point it at their own campus.
- **Page detector** toggle — off by default, permission-gated (see §3).

## 9. Small fixes

- Settings link editor: `new URL()` no longer throws on half-typed URLs (which killed the input handler mid-edit); the favicon is only auto-filled when the image field is empty *and* the URL is valid.
- `spike.html`: `transform:scaleX:${…}` is invalid CSS — the signal bars in the methodology demo never rendered. Fixed (4 occurrences).
- Methodology text (in-page modal, settings modal, README) updated to describe the v2 scorer truthfully.
- README: the intro claimed **~35 KB** while the Lightweight section said **~125 KB** — reconciled; the calibration example table now shows fresh, *measured* numbers from the harness.

## Deliberately unchanged

- **`SELECTORS` in content.js** — marked "known working," kept byte-identical.
- **Safe Browsing relay in background.js** — kept as documented infrastructure, but note: nothing calls it yet. Making it live needs (a) a settings field for the user's API key (`hz_sb_key`) and (b) a caller (e.g., the page detector flagging hostnames). Happy to wire that up next if you want it.
- Badge/panel visual design in `badge.css` — untouched.

## Loading the update

Same load-unpacked flow as before. The new `scripting` permission doesn't trigger a Chrome warning prompt, and the `<all_urls>` access is *optional* — it's only requested if you flip on the page detector. Your existing settings carry over; dismissed domains migrate automatically on the first SERP visit.

---

# Round 2 — Pill polish + Safe Browsing goes live

## Pill visual fixes (`badge.css`, `content.js`, `detector.js`)

- **SERP pill dead space, diagnosed.** The compact pill always reserved a 16 px slot for the dismiss ✕ at 45% opacity — nearly invisible, so the dot + percentage looked shoved left with empty space on the right. Padding was also asymmetric (8 px left / 9 px right). The ✕ now exists only in the expanded card (top-right); the compact pill is dot + `NN%`, symmetric padding, `justify-content: center`, and a snugger width clamp. Dismissal is still one tap away — expand and hit ✕ (or ✓ Human / ✗ AI).
- **Detector pill truncation, diagnosed.** The minimized pill tried to fit dot + score + the band label ("Human-like", "Mixed", "Likely AI") inside a 160 px clamp with `overflow: hidden` — long labels clipped mid-word. Per your call, the minimized pill is now **dot + `NN%` only, centered**; the band name lives in the expanded panel header ("AI Signal: NN% · Likely AI"), so no information is lost.
- **The "signal light" clipping, diagnosed.** The detector dot's glow was a `box-shadow` — and box-shadows paint *outside* the element box, while the pill and panel need `overflow: hidden` for the grow animation. Result: the glow got sliced flat wherever the dot sat near an edge (compact pill edge, expanded panel header). The halo is now drawn *inside* a 13 px box with a radial gradient (core + soft falloff, colored via a `--dot-c` variable set by `detector.js`) — geometrically impossible to clip, in both the compact row and the expanded header.
- **Expanded layering made coherent.** The expanded SERP pill previously laid out the ✕ and the 100%-wide panel in a single flex **row**, fighting for space inside `overflow: hidden`. The badge is now a proper column — head row on top (hidden when expanded), ✕ aligned top-right, panel beneath at full width — and the SERP markup now mirrors the detector's proven header-row structure, so both pills behave identically.

## Safe Browsing is wired up (`tab.js`, `detector.js`, `badge.css`)

The dormant relay in `background.js` now has both halves it was missing:

- **Settings field** — "Safe Browsing key · optional" under AI Signal, stored as the `hz_sb_key` sync key the worker already reads (kept outside the main `hz` snapshot, so normal setting saves never touch it). Clearing the field removes the key.
- **Caller** — after the page detector renders its panel, it asks the background worker to check the current hostname (the worker caches per-hostname for an hour). If Google flags the site, a red **"⚠ Google Safe Browsing flags this site (…)"** row is prepended to the expanded panel. No key → the check is skipped silently, exactly as the worker's security model documents.
- **Honest disclosure** — configuring a key means hostnames are sent to Google, so the settings hint and README now say precisely that: *"sends only the hostname to Google, only if a key is set."* The page-detector hint was reworded from "nothing is sent anywhere" to "the text analysis itself stays on-device."

---

# Round 3 — Content-sized pills, settings copy, performance pass

## Why the dead space survived round 2 (and the real fix)

Both pills carry their expandable panel as a hidden flex child with `width: 100%`. During the browser's *intrinsic* (max-content) sizing pass, percentage widths resolve as `auto` — so the hidden panel quietly contributed its **content** width (the reasons text), pinning every pill at its `max-width` clamp no matter how short "45%" was. That clamp-width minus the actual dot+percent width *was* the dead space.

- Panels now use `width: 0; min-width: 100%` — the classic trick: contributes **zero** to intrinsic sizing, but still resolves to full container width at layout time. Both pills now hug their content exactly; the clamps remain only as safeguards.
- **Website pill off-center, diagnosed:** the collapsed detector badge was a flex **row** holding header-row (`width:100%`) *and* the panel (`width:100%`) — two 100% children splitting the row ~50/50, which shoved the number into the left half. The badge is now a column at all times.
- Phantom bottom padding removed: flex `gap` was still being applied between the visible head and the zero-height panel (5 px of invisible "content" below the number). Collapsed gap is now 0; the expanded states set their own gaps.
- Both pills also got slightly tighter padding (SERP 3×8, detector 5×10, max-height 26) — combined with content-sizing they're visibly smaller.

## Settings copy

- **"Hide results above —%"** (nonsensical when off) → **"Auto-hide results: Off"**, switching live to **"Auto-hide results: ≥ 75%"** as you drag. Hint rewritten: "Results scoring at or above the threshold collapse — hover one to reveal it. Slide left to turn off."
- Safe Browsing key placeholder was clipped by the input width → now **"Enter here"** (the label above it already says what it is).

## Performance (new-tab page)

- **Cached element lookups** — a `$()` helper memoizes the ~30 static-shell ids; 64 `document.getElementById` call sites now hit the cache (dynamic settings-panel ids deliberately pass through uncached).
- **Event delegation for the drawer** — the tab bar, engine grid, and filter bar each get **one** listener at boot; the render functions emit markup only. Previously every render re-attached ~20 listeners, and every engine click rebuilt the grid's innerHTML mid-animation. Picking an engine in the current mode is now a class swap + label update — no rebuild, no listener churn, no flash.
- **Six fewer live blur regions** — each quick-link card had its own `backdrop-filter`, and because the glass orb *animates* behind them, every one of those regions re-sampled its backdrop each frame, forever. Links keep their translucent surface (visually near-identical); the weather chip and settings button keep their blur (they're two small, static-backdrop regions).
- `contain: layout paint` on the settings panel isolates its layout/paint work from the rest of the page.

---

# Round 4 — Hotfix: expanded card collapsed into a skinny column

Round 3's intrinsic-zero panel (`width:0; min-width:100%`) removed the collapsed dead space — but it also removed the only thing telling the pill how wide to become when **expanded**. With the head row hidden, the badge's `max-content` width collapsed to its widest remaining child (the 14 px ✕ button), and the entire card wrapped into that column: the "tall, skinny, unreadable pill."

Fix: the expanded panel now has an **explicit, transitioned width** (`292px` = 320 card − padding, capped at `calc(100vw − 76px)` for narrow windows). An animating explicit child width feeds the badge's `max-content` size per frame, so the pill grows into the card — and shrinks back — with the same curve and timing as the original animation, while the collapsed pill stays content-hugging and centered. Applied to both the SERP pill and the page-detector pill.

---

# Round 5 — Pre-publication audit

## 🔴 Security finding you must act on before advertising the repo

**A real Google API key is in your git history — twice.** The Safe Browsing key was hardcoded in `aiscan/background.js` in v1.8.0 (commit `f7a1dcf`, Jul 2). The remediation commit `6046fc1` removed it from the file — but **quotes the full key verbatim in its own commit message**, so it lives on in history in both the old file blobs and that message. Since the repo is already public, treat the key as burned:

1. **Verify it's dead** in Google Cloud Console (Credentials → delete or regenerate that key). This is the step that actually matters — do it regardless of anything else.
2. **Purge it from history before the publicity push.** Two options:
   - *Cleanest:* start the public history fresh — new repo (or orphan branch) from the current tree as a single initial commit. You lose the commit log but there is nothing to scan.
   - *History-preserving:* `git filter-repo --replace-text` (or BFG) to scrub the string from blobs **and commit messages**, then force-push. Note GitHub can still serve old commits by hash until you contact support, which is why step 1 is the real mitigation.

## Verified clean

- **No secrets in the current tree** (pattern scan for Google/OpenAI/GitHub key shapes, bearer tokens, private keys: nothing).
- **No `eval` / `new Function` / `document.write` / remote code** anywhere.
- **Every `innerHTML` sink audited** (15 total): user-controlled values (quick-link labels/URLs/images, AI reasons, section previews, Safe Browsing threat types) are HTML-escaped or set via `textContent`; hrefs sanitized to http(s).
- **Permission posture is minimal**: `storage` + `scripting`, content scripts on the three SERP domains only, `<all_urls>` strictly optional and revocable, Safe Browsing host permission used only by the background fetch.
- All JS passes `node --check`; scorer harness 13/13 with determinism + low-flag invariants; manifest valid; CSS braces balanced.

## Fixed in this round

- **Hero spacing** — greeting↔time↔date↔weather now share one rhythm: a `--hero-gap` token (0.85rem) drives the hero's flex gap, and the weather pill is pulled into the same distance. The 5rem clock's font leading is trimmed (`text-box: trim-both cap alphabetic`, Chromium) so the measured gap is the visual gap; margins zeroed so nothing fights the token. Everything centered via the same flex axis.
- **README size claims** were stale (~125 KB) — now measured: ~200 KB code, ~315 KB installed, ~90 KB new-tab payload, ~84 KB on search pages, 0 KB elsewhere unless opted in.

## Added for publication

- **`PRIVACY.md`** — store listings that request host permissions need a privacy policy; this one is accurate to the code: no servers/analytics, weather→NWS, favicons→Google s2, Safe Browsing hostname→Google only with the user's own key, all AI scoring on-device.
- **Store-ready package** — `horizon-tab-1.10.0-store.zip` contains only runtime files (manifest, tab.*, icons, the five aiscan runtime files). Dev artifacts (test pages, bookmarklets, spike.html, node harness) stay in the repo but out of the reviewed package.

## Worth considering (your call)

- **No LICENSE file.** Before advertising, pick one (MIT is the common choice for this kind of project) — without it, others technically can't legally use or contribute to the code.
- **icon-128.png is 113 KB** — fine functionally; a run through a proper PNG optimizer (e.g., `oxipng`) could cut it, but it's your artwork so I left it untouched.
- The dual `background.service_worker` + `scripts` manifest keys are the documented cross-browser pattern (Chrome ≥121 accepts both); if a store reviewer ever objects, ship per-browser manifests instead.
- Favicon fetching via Google's s2 service means Google sees your quick-link domains — disclosed in PRIVACY.md; an offline alternative would be caching favicons as data URLs.
