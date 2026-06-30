/* ══════════════════════════════════════════════════
   Horizon Tab v1.1 — Settings & Customization Engine
   ══════════════════════════════════════════════════ */

// ── Constants ──
const LAT = 40.7982;
const LON = -77.8599;

const SEARCH_ENGINES = {
  google:    "https://www.google.com/search?q=",
  duckduckgo:"https://duckduckgo.com/?q=",
  brave:     "https://search.brave.com/search?q=",
  bing:      "https://www.bing.com/search?q=",
};

const DEFAULT_LINKS = [
  { id: "l1", label: "ChatGPT",   url: "https://chatgpt.com",                  emoji: "🤖", image: "" },
  { id: "l2", label: "GitHub",    url: "https://github.com/RishvanthAmsaraj",  emoji: "💻", image: "" },
  { id: "l3", label: "Calendar",  url: "https://calendar.google.com",          emoji: "📅", image: "" },
  { id: "l4", label: "Mail",      url: "https://mail.google.com",              emoji: "📧", image: "" },
  { id: "l5", label: "Canvas",    url: "https://canvas.psu.edu",               emoji: "📚", image: "" },
  { id: "l6", label: "OpenClaw",  url: "https://openclaw.ai",                  emoji: "⚡", image: "" },
];

const DEFAULT_STATE = {
  theme: "navy",
  searchEngine: "google",
  links: DEFAULT_LINKS,
};

// ── State ──
let state = { ...DEFAULT_STATE };
let linkIdCounter = 100;

// ── DOM refs ──
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

const el = {
  time:       $("#time"),
  greeting:   $("#greeting"),
  date:       $("#date"),
  searchForm: $("#searchForm"),
  searchInput:$("#searchInput"),
  links:      $("#links"),
  weatherIcon:$("#weatherIcon"),
  weatherTemp:$("#weatherTemp"),
  weatherDesc:$("#weatherDesc"),
  weatherHiLo:$("#weatherHiLo"),

  settingsToggle:  $("#settingsToggle"),
  settingsPanel:   $("#settingsPanel"),
  settingsClose:   $("#settingsClose"),
  settingsBackdrop:$("#settingsBackdrop"),
  customLinks:     $("#customLinks"),
  addLinkBtn:      $("#addLinkBtn"),
  searchEngineOpts:$("#searchEngineOptions"),
  themeOpts:       $("#themeOptions"),
  ambient:         $("#ambient"),
  glassGlow:       $("#glassGlow"),
  html:            document.documentElement,
};

// ── Storage ──
async function loadState() {
  try {
    const stored = await chrome.storage.sync.get(["horizonState"]);
    if (stored.horizonState) {
      state = { ...DEFAULT_STATE, ...stored.horizonState };
      // Ensure links have all fields
      state.links = state.links.map((l) => ({
        ...DEFAULT_LINKS.find((d) => d.id === l.id) || { emoji: "🌐", image: "", label: "Link" },
        ...l,
      }));
    }
  } catch {
    // chrome.storage not available (local file open or FF extension context)
    try {
      const stored = localStorage.getItem("horizonState");
      if (stored) state = { ...DEFAULT_STATE, ...JSON.parse(stored) };
    } catch {}
  }
}

async function saveState() {
  // Strip non-serializable
  const toSave = {
    theme: state.theme,
    searchEngine: state.searchEngine,
    links: state.links,
  };
  try {
    await chrome.storage.sync.set({ horizonState: toSave });
  } catch {
    try {
      localStorage.setItem("horizonState", JSON.stringify(toSave));
    } catch {}
  }
}

// ── Greeting ──
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "good morning";
  if (h < 17) return "good afternoon";
  if (h < 21) return "good evening";
  return "good night";
}

// ── Clock ──
function updateClock() {
  const now = new Date();
  const h = now.getHours();
  const m = String(now.getMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  el.time.textContent = `${h12}:${m} ${ampm}`;
  el.greeting.textContent = getGreeting();
  el.date.textContent = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}
updateClock();
setInterval(updateClock, 1000);

// ── Weather ──
async function fetchWeather() {
  try {
    const ptRes = await fetch(`https://api.weather.gov/points/${LAT},${LON}`);
    if (!ptRes.ok) throw new Error("NWS points failed");
    const pt = await ptRes.json();
    const fRes = await fetch(pt.properties.forecast);
    if (!fRes.ok) throw new Error("NWS forecast failed");
    const f = await fRes.json();
    const periods = f.properties.periods;
    const current = periods[0];
    const next = periods.length > 1 ? periods[1] : null;
    const temp = current.temperature;
    const isDay = current.isDaytime;
    const short = current.shortForecast;

    let hi = next && next.isDaytime ? next.temperature : temp;
    let lo = next && !next.isDaytime ? next.temperature : temp;
    if (!isDay) {
      lo = temp;
      const tomorrowDay = periods[2] && periods[2].isDaytime ? periods[2] : null;
      hi = tomorrowDay ? tomorrowDay.temperature : next ? next.temperature : temp;
    }

    const emoji = weatherEmoji(current.shortForecast, isDay);
    el.weatherIcon.textContent = emoji;
    el.weatherTemp.textContent = `${temp}°`;
    el.weatherDesc.textContent = short;
    el.weatherHiLo.textContent = `H ${hi}° L ${lo}°`;
  } catch {
    el.weatherDesc.textContent = "unavailable";
  }
}

function weatherEmoji(forecast, isDay) {
  const f = forecast.toLowerCase();
  if (f.includes("sunny") || f.includes("clear")) return isDay ? "☀️" : "🌙";
  if (f.includes("cloudy") || f.includes("overcast")) return "☁️";
  if (f.includes("partly")) return isDay ? "⛅" : "🌙";
  if (f.includes("rain") || f.includes("shower") || f.includes("drizzle")) return "🌧️";
  if (f.includes("thunder") || f.includes("storm")) return "⛈️";
  if (f.includes("snow") || f.includes("flurr") || f.includes("blizzard")) return "❄️";
  if (f.includes("fog") || f.includes("mist") || f.includes("haze")) return "🌫️";
  if (f.includes("wind") || f.includes("breez")) return "💨";
  return isDay ? "☀️" : "🌙";
}

fetchWeather();
setInterval(fetchWeather, 30 * 60 * 1000);

// ── Search ──
el.searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const q = el.searchInput.value.trim();
  if (!q) return;
  const hasDot = q.includes(".") && !q.includes(" ");
  const isUrl = hasDot && (q.startsWith("http://") || q.startsWith("https://") || q.startsWith("localhost"));
  if (isUrl) {
    window.location.href = q.startsWith("http") ? q : `https://${q}`;
  } else {
    const engine = SEARCH_ENGINES[state.searchEngine] || SEARCH_ENGINES.google;
    window.location.href = engine + encodeURIComponent(q);
  }
});

// ── Links Rendering ──
function renderLinks() {
  const html = state.links
    .map(
      (l) => `
      <a href="${l.url}" class="link-item" title="${l.url}">
        <span class="link-icon">
          ${l.image ? `<img src="${l.image}" alt="" />` : l.emoji || "🌐"}
        </span>
        <span class="link-label">${l.label}</span>
      </a>
    `
    )
    .join("");
  el.links.innerHTML = html;
}

// ── Settings Panel ──
// Open / close
el.settingsToggle.addEventListener("click", () => openSettings());
el.settingsClose.addEventListener("click", () => closeSettings());
el.settingsBackdrop.addEventListener("click", () => closeSettings());

function openSettings() {
  el.settingsPanel.classList.add("open");
  el.settingsBackdrop.classList.add("open");
  renderLinkEditors();
}

function closeSettings() {
  el.settingsPanel.classList.remove("open");
  el.settingsBackdrop.classList.remove("open");
}

// ── Theme ──
function applyTheme(theme) {
  state.theme = theme;
  el.html.setAttribute("data-theme", theme);
  $$(".theme-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.theme === theme);
  });
  saveState();
}

// ── Search Engine ──
function applySearchEngine(engine) {
  state.searchEngine = engine;
  $$(".engine-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.engine === engine);
  });
  saveState();
}

// ── Settings UI render ──
function renderLinkEditors() {
  const html = state.links
    .map(
      (l, i) => `
      <div class="link-editor" data-index="${i}">
        <input class="link-emoji-input" value="${l.emoji || "🌐"}" maxlength="2" placeholder="🌐" />
        <input class="link-label-input" value="${l.label}" placeholder="Label" />
        <input class="link-url-input" value="${l.url}" placeholder="https://..." />
        <input class="link-img-input" value="${l.image || ""}" placeholder="Image URL (optional)" />
        <button class="link-remove" title="Remove link">✕</button>
      </div>
    `
    )
    .join("");
  el.customLinks.innerHTML = html;

  // Attach events
  el.customLinks.querySelectorAll(".link-editor").forEach((editor) => {
    const index = parseInt(editor.dataset.index);

    const emojiInput = editor.querySelector(".link-emoji-input");
    const labelInput = editor.querySelector(".link-label-input");
    const urlInput = editor.querySelector(".link-url-input");
    const imgInput = editor.querySelector(".link-img-input");
    const removeBtn = editor.querySelector(".link-remove");

    const save = () => {
      state.links[index] = {
        ...state.links[index],
        emoji: emojiInput.value || "🌐",
        label: labelInput.value || "Link",
        url: urlInput.value || "https://example.com",
        image: imgInput.value || "",
      };
      saveState();
      renderLinks();
    };

    emojiInput.addEventListener("input", save);
    labelInput.addEventListener("input", save);
    urlInput.addEventListener("input", save);
    imgInput.addEventListener("input", save);

    removeBtn.addEventListener("click", () => {
      state.links.splice(index, 1);
      saveState();
      renderLinks();
      renderLinkEditors();
    });
  });
}

// ── Add Link ──
el.addLinkBtn.addEventListener("click", () => {
  const id = `lc${linkIdCounter++}`;
  state.links.push({ id, label: "New Link", url: "https://example.com", emoji: "🌐", image: "" });
  saveState();
  renderLinks();
  renderLinkEditors();
  // Scroll to bottom of settings
  el.settingsPanel.scrollTop = el.settingsPanel.scrollHeight;
});

// ── Settings init ──
function initSettings() {
  // Theme buttons
  el.themeOpts.querySelectorAll(".theme-btn").forEach((btn) => {
    btn.addEventListener("click", () => applyTheme(btn.dataset.theme));
  });

  // Search engine buttons
  el.searchEngineOpts.querySelectorAll(".engine-btn").forEach((btn) => {
    btn.addEventListener("click", () => applySearchEngine(btn.dataset.engine));
  });

  // Apply current state
  applyTheme(state.theme);
  applySearchEngine(state.searchEngine);
}

// ── Keyboard shortcut: Escape to close settings ──
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && el.settingsPanel.classList.contains("open")) {
    closeSettings();
  }
});

// ── Boot ──
(async function boot() {
  await loadState();
  renderLinks();
  initSettings();
})();
