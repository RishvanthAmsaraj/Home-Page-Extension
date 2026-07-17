/* ════════════════════════════════════════════════
   Horizon Tab v3.0 — Premium drawer + SVG logos
   ════════════════════════════════════════════════ */

const LAT=40.7982,LON=-77.8599;

const SE={
  google:"https://www.google.com/search?q=",
  duckduckgo:"https://duckduckgo.com/?q=",
  brave:"https://search.brave.com/search?q=",
  bing:"https://www.bing.com/search?q=",
  startpage:"https://www.startpage.com/do/dsearch?query=",
  kagi:"https://kagi.com/search?q=",
  qwant:"https://www.qwant.com/?q=",
  searxng:"https://searx.be/search?q="
};

const AI={
  perplexity:"https://www.perplexity.ai/search?q=",
  grok:"https://grok.com/?q=",
  gemini:"https://aistudio.google.com/prompts/new_chat?prompt=",
  chatgpt:"https://chatgpt.com/?q=",
  claude:"https://claude.ai/new?q=",
  deepseek:"https://chat.deepseek.com/?q="
};
const AI_L={perplexity:"Perplexity",grok:"Grok",gemini:"Gemini",chatgpt:"ChatGPT",claude:"Claude",deepseek:"DeepSeek"};
const AI_AUTO=new Set(["perplexity","grok","gemini"]);
const AI_ORDER=["perplexity","grok","gemini","chatgpt","claude","deepseek"];

/* ── SVG Logo Icons ──
   Brand-accurate single-color (or minimal-multi-color) glyphs sized
   to a 24×24 grid. Each is one path or a small set of primitive
   shapes — no large duplicated geometry, no clipping hacks. */
const LOGOS={
  // ── Web search engines ──────────────────────────────────────────
  // Google "G" — the four-color ring + bar from the current brand mark.
  google:`<svg viewBox="0 0 24 24"><path fill="#4285F4" d="M22.5 12.2c0-.7-.1-1.5-.2-2.2H12v4.2h5.9c-.3 1.4-1.1 2.5-2.3 3.3v2.7h3.7c2.2-2 3.4-5 3.4-8z"/><path fill="#34A853" d="M12 23c2.9 0 5.4-1 7.2-2.6l-3.7-2.7c-1 .7-2.3 1.1-3.5 1.1-2.7 0-5-1.8-5.9-4.3H2.3v2.7C4.1 20.5 7.8 23 12 23z"/><path fill="#FBBC05" d="M6.1 14.5c-.2-.6-.4-1.3-.4-2s.1-1.4.4-2V7.7H2.3C1.5 9.1 1 10.5 1 12s.5 2.9 1.3 4.3l3.8-2.8z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3 .6 4.2 1.6l3.1-3.1C17.4 2.1 14.9 1 12 1 7.8 1 4.1 3.5 2.3 7.7l3.8 2.8c.9-2.5 3.2-4.3 5.9-4.3z"/></svg>`,

  // DuckDuckGo — orange disc with the white "duck head" silhouette.
  duckduckgo:`<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#DE5833"/><path fill="#FFF" d="M7 10.5c0-.7.6-1.3 1.3-1.3s1.3.6 1.3 1.3v.6c.4-.3.9-.5 1.4-.5h.5c.3 0 .5.2.5.5s-.2.5-.5.5h-.5c-.8 0-1.4.6-1.4 1.4v1.3c0 .9-.5 1.7-1.3 2-.3.1-.6.2-.9.2-.8 0-1.5-.4-1.9-1-.4-.6-.5-1.4-.3-2.1.2-.7.7-1.2 1.4-1.5.1 0 .2-.1.3-.1v-1.3zm9 0c0-.7.6-1.3 1.3-1.3s1.3.6 1.3 1.3v1.3c.1 0 .2.1.3.1.7.3 1.2.8 1.4 1.5.2.7.1 1.5-.3 2.1-.4.6-1.1 1-1.9 1-.3 0-.6-.1-.9-.2-.8-.3-1.3-1.1-1.3-2v-1.3c0-.8-.6-1.4-1.4-1.4h-.5c-.3 0-.5-.2-.5-.5s.2-.5.5-.5h.5c.5 0 1 .2 1.4.5v-.6z"/><path fill="#FFF" d="M9.5 14.5c-.3.3-.6.5-1 .6-.4.1-.8 0-1.1-.3-.3-.3-.4-.7-.3-1.1.1-.4.4-.7.8-.8.4-.1.9 0 1.2.3.3.3.5.7.4 1.3z"/></svg>`,

  // Brave — lion-head shield in orange.
  brave:`<svg viewBox="0 0 24 24"><path fill="#FB542B" d="M12 1.5L3 5.4v6.5c0 5.6 4 9.7 9 10.6 5-.9 9-5 9-10.6V5.4L12 1.5z"/><path fill="#FFF" d="M12 4.5L6.7 7.1l.9 4.4L12 14l4.4-2.5.9-4.4L12 4.5z"/><path fill="#FB542B" d="M9.2 13l2.8 1.6 2.8-1.6L12 16.2 9.2 13z"/></svg>`,

  // Bing — teal "b" letterform.
  bing:`<svg viewBox="0 0 24 24"><path fill="#008373" d="M3 3l9 2.2v15.6L3 18.5V3z"/><path fill="#0066CC" d="M12 5.2l9-2.2v15.6l-9 2.4V5.2z"/><path fill="#FFF" d="M14.5 9.8c1.6-.5 3.2.3 3.6 1.8.4 1.5-.5 3-2.1 3.5l-2.4.7-1.5-1.4 2.4-.6zm-3 4.7l1.5 1.4-1.2.4-1.8-.4 1.5-1.4z" opacity=".95"/></svg>`,

  // Startpage — three concentric rings (target).
  startpage:`<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#7B68EE"/><circle cx="12" cy="12" r="7" fill="none" stroke="#FFF" stroke-width="1.5"/><circle cx="12" cy="12" r="4.2" fill="#FFF"/><circle cx="12" cy="12" r="2" fill="#7B68EE"/></svg>`,

  // Kagi — yellow shield with stylized "K" centered.
  kagi:`<svg viewBox="0 0 24 24"><path fill="#FFB300" d="M12 1.5L3 5.4v6.4c0 5.4 4.1 9.4 9 10.2 4.9-.8 9-4.8 9-10.2V5.4L12 1.5z"/><path fill="#FFF" d="M8.5 7h2v4.2L14.5 7h2.5l-4.5 5 4.8 5h-2.6L10.5 12.4V17h-2V7z"/></svg>`,

  // Qwant — cyan ring + magenta heart.
  qwant:`<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#4CC2FF"/><path fill="#FF596A" d="M12 16.5s-4.5-2.7-4.5-6.2c0-1.8 1.4-3.3 3.2-3.3 1 0 1.9.5 2.3 1.3.4-.8 1.3-1.3 2.3-1.3 1.8 0 3.2 1.5 3.2 3.3 0 3.5-4.5 6.2-4.5 6.2z"/></svg>`,

  // SearXNG — blue card with magnifying glass + "S".
  searxng:`<svg viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2.5" fill="#3056D3"/><path fill="#FFF" d="M7 8.5h7v1.6H7zm0 3h7v1.6H7zm0 3h4.5v1.6H7z"/><circle cx="17" cy="15" r="2.6" fill="none" stroke="#F3C623" stroke-width="1.6"/><path stroke="#F3C623" stroke-width="1.6" stroke-linecap="round" d="M19 17l2 2"/></svg>`,

  // ── AI providers ────────────────────────────────────────────────
  // Perplexity — dark card with the brand teal "perplexity" mark.
  perplexity:`<svg viewBox="0 0 24 24"><rect width="24" height="24" rx="3.5" fill="#1F1F1F"/><path fill="none" stroke="#20808D" stroke-width="2" stroke-linecap="round" d="M5 8l3.5 4-3.5 4M19 8l-3.5 4 3.5 4M9.5 17l5-10"/></svg>`,

  // Grok — black circle, the white "G" slash from xAI.
  grok:`<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#000"/><path fill="#FFF" d="M5 6.5h3l4 5.5V6.5h3v11h-3l-4-5.5v5.5H5v-11z"/></svg>`,

  // Gemini — the four-point star, two-color gradient.
  gemini:`<svg viewBox="0 0 24 24"><defs><linearGradient id="gG" x1="0" x2="1"><stop offset="0" stop-color="#4796E3"/><stop offset="1" stop-color="#9177C7"/></linearGradient></defs><path fill="url(#gG)" d="M12 2l1.8 8.2L22 12l-8.2 1.8L12 22l-1.8-8.2L2 12l8.2-1.8L12 2z"/></svg>`,

  // ChatGPT — green circle, the spiral "flower" shape.
  chatgpt:`<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#10A37F"/><path fill="#FFF" d="M15.4 8.6c.5-1.3.1-2.7-1-3.4-1.1-.8-2.6-.7-3.6.2-1-.9-2.5-1-3.6-.2-1.1.7-1.5 2.1-1 3.4-1.3.5-2 1.7-1.8 3 .2 1.3 1.2 2.3 2.5 2.5.2 1.3 1.2 2.3 2.5 2.5.5 0 1-.1 1.5-.3.5.2 1 .3 1.5.3 1.3-.2 2.3-1.2 2.5-2.5 1.3-.2 2.3-1.2 2.5-2.5.2-1.3-.5-2.5-1.8-3zm-3.4 7c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>`,

  // Claude — orange circle, the Claude "C" mark (asterisk-style).
  claude:`<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#D97757"/><path fill="#FFF" d="M16.4 8.5c-.6-.9-1.6-1.5-2.7-1.5H11c-.4 0-.8.1-1.1.3-.3-.5-.9-.8-1.5-.8-1 0-1.8.8-1.8 1.8 0 .4.1.7.3 1-.6.6-1 1.5-1 2.4 0 1.9 1.5 3.4 3.4 3.4.6 0 1.2-.2 1.7-.5.5.3 1.1.5 1.7.5 1.9 0 3.4-1.5 3.4-3.4 0-1.4-.8-2.5-2-3 .4-.1.6-.4.6-.7 0-.3-.1-.5-.3-.5zm-5.9 5.5c-.7 0-1.3-.6-1.3-1.3 0-.4.2-.7.4-.9.2.1.5.2.8.2.1.3.2.5.4.7-.1.7-.3 1.3-.3 1.3zm3.2-2c-.4 0-.7-.3-.7-.7s.3-.7.7-.7.7.3.7.7-.3.7-.7.7z"/></svg>`,

  // DeepSeek — blue circle, the "whale" simplified to a stylized D.
  deepseek:`<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#4D6BFE"/><path fill="#FFF" d="M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm-1 4h2v6h-2V8zm0 7h2v2h-2v-2z"/></svg>`
};

const AI_FREE_PARAMS={
  google:"&udm=14",duckduckgo:"&ia=web",brave:"&source=web",
  bing:"&adlt=strict&qft=interval%3d%22%22",kagi:"&ai_mode=off",
};


/* Filters, split by mechanism:
     TYPE_TEXT  — search operators appended to the query text (encoded with it)
     MEDIA_URL  — engine-specific News / Video / Images endpoints, %s = encoded query
   v1 appended "&tbm=nws" to the query text and then encodeURIComponent'd
   the whole thing, so the News/Video/Images filters literally searched
   for the text "&tbm=nws" — and tbm is Google-only anyway. */
const TYPE_TEXT={all:"",reddit:" site:reddit.com",pdf:" filetype:pdf"};
const TYPE_L={all:"All",reddit:"Reddit",article:"News",pdf:"PDF",video:"Video",images:"Images"};
const MEDIA_URL={
  google:{article:"https://www.google.com/search?q=%s&tbm=nws",video:"https://www.google.com/search?q=%s&tbm=vid",images:"https://www.google.com/search?q=%s&tbm=isch"},
  duckduckgo:{article:"https://duckduckgo.com/?q=%s&iar=news&ia=news",video:"https://duckduckgo.com/?q=%s&iax=videos&ia=videos",images:"https://duckduckgo.com/?q=%s&iax=images&ia=images"},
  brave:{article:"https://search.brave.com/news?q=%s",video:"https://search.brave.com/videos?q=%s",images:"https://search.brave.com/images?q=%s"},
  bing:{article:"https://www.bing.com/news/search?q=%s",video:"https://www.bing.com/videos/search?q=%s",images:"https://www.bing.com/images/search?q=%s"},
  startpage:{article:"https://www.startpage.com/sp/search?query=%s&cat=news",video:"https://www.startpage.com/sp/search?query=%s&cat=video",images:"https://www.startpage.com/sp/search?query=%s&cat=images"},
  kagi:{article:"https://kagi.com/news?q=%s",video:"https://kagi.com/videos?q=%s",images:"https://kagi.com/images?q=%s"},
  qwant:{article:"https://www.qwant.com/?q=%s&t=news",video:"https://www.qwant.com/?q=%s&t=videos",images:"https://www.qwant.com/?q=%s&t=images"},
  searxng:{article:"https://searx.be/search?q=%s&categories=news",video:"https://searx.be/search?q=%s&categories=videos",images:"https://searx.be/search?q=%s&categories=images"}
};

const DL=[
  {id:"l1",label:"ChatGPT",url:"https://chatgpt.com",emoji:"",image:"https://www.google.com/s2/favicons?domain=chatgpt.com&sz=64"},
  {id:"l2",label:"GitHub",url:"https://github.com",emoji:"",image:"https://www.google.com/s2/favicons?domain=github.com&sz=64"},
  {id:"l3",label:"Calendar",url:"https://calendar.google.com",emoji:"",image:"https://www.google.com/s2/favicons?domain=google.com&sz=64"},
  {id:"l4",label:"Mail",url:"https://mail.google.com",emoji:"",image:"https://www.google.com/s2/favicons?domain=google.com&sz=64"},
  {id:"l5",label:"Canvas",url:"https://canvas.psu.edu",emoji:"",image:"https://www.google.com/s2/favicons?domain=psu.edu&sz=64"},
  {id:"l6",label:"OpenClaw",url:"https://openclaw.ai",emoji:"",image:"https://www.google.com/s2/favicons?domain=openclaw.ai&sz=64"}
];

const DS={
  theme:"slate",searchEngine:"google",aiProvider:"perplexity",
  links:DL,showLinks:true,glassOpacity:0.04,searchType:"all",
  customBg:"#0d0d0d",customAccent:"#7a8a9a",customLight:false,aiFreeOn:false,
  aiSignal:false,aiSensitivity:"med",aiHideAbove:0,
  aiPageDetector:false,weatherLat:null,weatherLon:null
};
let state={...DS},linkId=100;

/* ── Cached element lookups ──
   Ids in the static tab.html shell are never re-created, so their
   lookups are cached after first hit. Ids born inside renderSettings /
   showMethodology are re-created every render and pass straight
   through to an uncached lookup. */
const STATIC_IDS=new Set(["bgLayer","glassOrb","greeting","time","date","weather","weatherIcon","weatherTemp","weatherDesc","weatherHiLo","searchSection","searchForm","searchInput","searchArrow","modeTag","searchBody","searchDrawer","drawerTabbar","drawerGrid","drawerFooter","filterBar","aiModeHint","links","settingsToggle","settingsBackdrop","settingsPanel","settingsTitle","settingsBody","settingsClose","bgUpload"]);
const _elCache={};
function $(id){
  if(!STATIC_IDS.has(id))return document.getElementById(id);
  return _elCache[id]||(_elCache[id]=document.getElementById(id));
}

/* ── Security helpers ── */
function esc(s){return String(s??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}
/* Only http(s) URLs come back from here — javascript:/data: links a user
   (or imported settings) might put in a quick link are neutralized. */
function safeHref(u){
  const raw=String(u||"").trim();
  try{const p=new URL(raw);if(p.protocol==="http:"||p.protocol==="https:")return p.href}catch{}
  try{const p=new URL("https://"+raw.replace(/^\/+/,""));if(p.hostname.includes("."))return p.href}catch{}
  return "#";
}

/* ── Storage ── */
const SYS="hz",BG_KEY="***";
const KNOWN_KEYS=["theme","searchEngine","aiProvider","links","showLinks","glassOpacity","searchType",
  "customBg","customAccent","customLight","aiFreeOn","aiSignal","aiSensitivity","aiHideAbove",
  "aiPageDetector","weatherLat","weatherLon"];
let extraState={};      // keys under "hz" owned by other parts of the extension — preserved verbatim on save
let lastSavedJSON="";   // diff guard: identical snapshots never hit storage (sync quota: 120 writes/min)
let lastSavedBG=null;   // the bg data-URL (up to ~500 KB) is only written when it actually changes
let saveTimer=null;

async function loadState(){
  try{
    const s=await chrome.storage.sync.get([SYS]);
    if(s[SYS]){
      state={...DS,...s[SYS],links:s[SYS].links||DL};
      for(const k of Object.keys(s[SYS]))if(!KNOWN_KEYS.includes(k))extraState[k]=s[SYS][k];
    }
  }catch{try{const s=localStorage.getItem(SYS);if(s)state={...DS,...JSON.parse(s),links:JSON.parse(s).links||DL}}catch{}}
  try{
    const b=await chrome.storage.local.get([BG_KEY]);
    if(b[BG_KEY])state.bg=b[BG_KEY];
  }catch{try{const b=localStorage.getItem(BG_KEY);if(b)state.bg=b}catch{}}
  lastSavedBG=state.bg||null;
  lastSavedJSON=JSON.stringify(snapshotState());
}
function snapshotState(){
  const o={...extraState};
  for(const k of KNOWN_KEYS)o[k]=state[k];
  return o;
}
/* Debounced + diffed: rapid slider drags / typing coalesce into one
   write 250 ms after the last change, and no-op saves don't write at
   all. v1 wrote to chrome.storage.sync on every keystroke and every
   slider pixel — hitting the 120 writes/min quota was easy. */
function saveState(){
  clearTimeout(saveTimer);
  saveTimer=setTimeout(saveStateNow,250);
}
function saveStateNow(){
  clearTimeout(saveTimer);saveTimer=null;
  const o=snapshotState(),j=JSON.stringify(o);
  if(j!==lastSavedJSON){
    lastSavedJSON=j;
    try{const p=chrome.storage.sync.set({[SYS]:o});if(p&&p.catch)p.catch(()=>{})}
    catch{try{localStorage.setItem(SYS,j)}catch{}}
  }
  const bg=state.bg||null;
  if(bg!==lastSavedBG){
    lastSavedBG=bg;
    if(bg){try{const p=chrome.storage.local.set({[BG_KEY]:bg});if(p&&p.catch)p.catch(()=>{})}catch{try{localStorage.setItem(BG_KEY,bg)}catch{}}}
    else{try{chrome.storage.local.remove(BG_KEY)}catch{}}
  }
}
// A pending debounced save must not be lost when the tab navigates
// (e.g. changing a filter and pressing Enter within 250 ms).
window.addEventListener("pagehide",()=>{if(saveTimer)saveStateNow()});

/* ── Clock ── */
function greet(){return["good morning","good afternoon","good evening","good night"][Math.min(Math.floor(new Date().getHours()/6),3)]}
function updateClock(){
  const n=new Date();
  $("time").textContent=`${n.getHours()%12||12}:${String(n.getMinutes()).padStart(2,"0")} ${n.getHours()>=12?"PM":"AM"}`;
  $("greeting").textContent=greet();
  $("date").textContent=n.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});
  if(state.theme==="modern"&&!state.bg)swModern(); // keep auto day/night correct on long-lived tabs
}
/* The display has minute resolution, so tick once per minute (aligned
   to the minute boundary) instead of every second — 60× fewer wakeups.
   visibilitychange re-syncs a tab restored from the background. */
let clockTimer=null;
function scheduleClock(){
  clearTimeout(clockTimer);
  updateClock();
  const n=new Date();
  clockTimer=setTimeout(scheduleClock,Math.max(250,(60-n.getSeconds())*1000-n.getMilliseconds()));
}

/* ── Weather ── */
const WEATHER_KEY="hzWeather",WEATHER_TTL=10*60*1000;
function weatherCoords(){
  const lat=parseFloat(state.weatherLat),lon=parseFloat(state.weatherLon);
  return Number.isFinite(lat)&&Number.isFinite(lon)?[lat,lon]:[LAT,LON];
}
function renderWeather(d){
  $("weatherIcon").textContent=d.icon;
  $("weatherTemp").textContent=d.temp;
  $("weatherDesc").textContent=d.desc;
  $("weatherHiLo").textContent=d.hilo;
}
/* Cached in chrome.storage.local: opening ten tabs in a row costs one
   NWS round-trip, not ten. Stale data renders instantly, then refreshes
   in the background. 8 s abort so a slow API never hangs the badge. */
async function fetchWeather(){
  const[lat,lon]=weatherCoords();
  let cached=null;
  try{const c=await chrome.storage.local.get([WEATHER_KEY]);cached=c[WEATHER_KEY]}catch{}
  if(cached&&cached.lat===lat&&cached.lon===lon&&cached.d){
    renderWeather(cached.d);
    if(Date.now()-cached.t<WEATHER_TTL)return;
  }
  try{
    const ac=new AbortController();const to=setTimeout(()=>ac.abort(),8000);
    const p=await(await fetch(`https://api.weather.gov/points/${lat},${lon}`,{signal:ac.signal})).json();
    const f=await(await fetch(p.properties.forecast,{signal:ac.signal})).json(),ps=f.properties.periods;
    clearTimeout(to);
    const c=ps[0],nx=ps[1],t=c.temperature,d=c.isDaytime;
    let hi=nx&&nx.isDaytime?nx.temperature:t,lo=nx&&!nx.isDaytime?nx.temperature:t;
    if(!d){lo=t;const td=ps[2]&&ps[2].isDaytime?ps[2]:null;hi=td?td.temperature:nx?nx.temperature:t}
    const data={icon:wi(c.shortForecast,d),temp:`${t}°`,desc:c.shortForecast,hilo:`H ${hi}° L ${lo}°`};
    renderWeather(data);
    try{const pr=chrome.storage.local.set({[WEATHER_KEY]:{t:Date.now(),lat,lon,d:data}});if(pr&&pr.catch)pr.catch(()=>{})}catch{}
  }catch{if(!cached)$("weatherDesc").textContent="unavailable"}
}
function wi(f,d){
  const F=f.toLowerCase();
  if(F.includes("sunny")||F.includes("clear"))return d?"☀️":"🌙";
  if(F.includes("cloud")||F.includes("overcast"))return"☁️";
  if(F.includes("partly"))return d?"⛅":"🌙";
  if(F.includes("rain")||F.includes("shower")||F.includes("drizzle"))return"🌧️";
  if(F.includes("thunder")||F.includes("storm"))return"⛈️";
  if(F.includes("snow")||F.includes("flurr")||F.includes("blizzard"))return"❄️";
  if(F.includes("fog")||F.includes("mist")||F.includes("haze"))return"🌫️";
  if(F.includes("wind")||F.includes("breez"))return"💨";
  return d?"☀️":"🌙";
}

/* ── Theme ── */
function applyTheme(theme){
  state.theme=theme;const root=document.documentElement;root.classList.remove("has-bg");
  if(theme==="modern"&&!state.bg){swModern();saveState();return}
  if(theme==="custom"){applyCustomTheme();return}
  root.setAttribute("data-theme",theme);saveState();
}
function swModern(){
  const want=new Date().getHours()>=6&&new Date().getHours()<20?"modern-day":"modern";
  const root=document.documentElement;
  if(root.getAttribute("data-theme")!==want)root.setAttribute("data-theme",want);
}
function hexToRgb(h){return[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]}
function luminance(r,g,b){return(0.299*r+0.587*g+0.114*b)/255}
function applyCustomTheme(){
  const root=document.documentElement;root.setAttribute("data-theme","custom");
  const bg=state.customBg||"#0d0d0d",ac=state.customAccent||"#7a8a9a";
  const[br,bgG,bgB]=hexToRgb(bg);const[ar,ag,ab]=hexToRgb(ac);const l=luminance(br,bgG,bgB),isLight=l>.5;
  root.dataset.customMode=isLight?"light":"dark";
  root.style.setProperty("--user-bg",bg);root.style.setProperty("--user-bg2",isLight?darken(bg,8):lighten(bg,8));
  root.style.setProperty("--user-accent",ac);root.style.setProperty("--user-accent-glow",`rgba(${ar},${ag},${ab},${isLight?0.12:0.22})`);
  const tc=isLight?"#1e1e1e":"#E8EBED";root.style.setProperty("--user-text",tc);root.style.setProperty("--user-text-dim",isLight?"#606060":"#8a929a");
  root.style.setProperty("--user-text-muted",isLight?"#909090":"#5a626a");root.style.setProperty("--user-hero-text",isLight?"#111111":"#F0F2F4");
  root.style.setProperty("--user-hero-sub",isLight?"#404040":"#C0C6CC");saveState();
}
function lighten(h,p){const[r,g,b]=hexToRgb(h);const m=c=>Math.round(c+(255-c)*p/100);return`#${m(r).toString(16).padStart(2,"0")}${m(g).toString(16).padStart(2,"0")}${m(b).toString(16).padStart(2,"0")}`}
function darken(h,p){const[r,g,b]=hexToRgb(h);const m=c=>Math.round(c*(1-p/100));return`#${m(r).toString(16).padStart(2,"0")}${m(g).toString(16).padStart(2,"0")}${m(b).toString(16).padStart(2,"0")}`}

/* ── Glass / BG ── */
function applyGlassOpacity(val){state.glassOpacity=parseFloat(val);document.documentElement.style.setProperty("--surface-opacity",String(state.glassOpacity));saveState()}
function analyze(img){const c=document.createElement("canvas");c.width=c.height=1;c.getContext("2d").drawImage(img,0,0,1,1);const[r,g,b]=c.getContext("2d").getImageData(0,0,1,1).data;return luminance(r,g,b)}
function applyBg(data){
  if(!data){clearBg();return}
  const img=new Image();
  img.onload=()=>{
    const lum=analyze(img),dark=lum<=.5,ov=dark?Math.min(.55,.35+lum*.4):Math.min(.6,.8-lum*.3),oc=dark?`rgba(0,0,0,${ov.toFixed(2)})`:`rgba(255,255,255,${ov.toFixed(2)})`;
    const el=$("bgLayer");el.style.setProperty("--user-bg",`url(${data})`);el.style.setProperty("--overlay-c",oc);el.classList.add("has-image");
    $("glassOrb").style.display="none";document.documentElement.setAttribute("data-theme",dark?"darkbg":"lightbg");document.documentElement.classList.add("has-bg");
    state.bg=data;saveState();
  };img.onerror=clearBg;img.src=data;
}
function clearBg(){
  const el=$("bgLayer");el.classList.remove("has-image");el.style.removeProperty("--user-bg");el.style.removeProperty("--overlay-c");
  $("glassOrb").style.display="";document.documentElement.classList.remove("has-bg");
  const t=state.theme||"slate";if(t==="custom")applyCustomTheme();else if(t==="modern")swModern();else document.documentElement.setAttribute("data-theme",t);
  delete state.bg;saveState();
}

/* ── Links ── */
function renderLinks(){
  const linksEl=$("links");linksEl.style.display=state.showLinks?"":"none";
  linksEl.innerHTML=state.links.map(l=>{
    const href=safeHref(l.url);
    const icon=l.image?`<img src="${esc(l.image)}" alt="" loading="lazy">`:esc(l.emoji||"🌐");
    return `<a href="${esc(href)}" class="link-item" title="${esc(l.url)}"><span class="link-icon">${icon}</span><span class="link-label">${esc(l.label)}</span></a>`;
  }).join("");
}

/* ══════════════════════════════════════════════════
   SEARCH — Expandable drawer
   ══════════════════════════════════════════════════ */

function isAI(){return state.searchType==="ai"}
function currentLabel(){
  if(isAI())return AI_L[state.aiProvider]||"AI";
  return state.searchEngine.charAt(0).toUpperCase()+state.searchEngine.slice(1);
}
function currentIcon(){return isAI()?"🤖":"🌐"}

/* ── SVG icon for a key ── */
function svgIcon(key){return LOGOS[key]||LOGOS.google}

/* ── Tag + drawer open/close ── */
function updateModeTag(){
  const tag=$("modeTag");
  const icon = isAI() ? svgIcon(state.aiProvider)
                      : svgIcon(state.searchEngine);
  const label = isAI() ? AI_L[state.aiProvider]
                       : state.searchEngine.charAt(0).toUpperCase()+state.searchEngine.slice(1);
  // Wrap label in a span so the compact (icon-only) state can fade
  // the label out independently of the icon.
  tag.innerHTML = icon + ' <span class="mode-label">' + label + '</span>';
}
function tagOnInput(){
  const i=$("searchInput");
  // Compact the chip to icon-only while typing so the input gets more
  // room without losing the brand indicator entirely.
  $("modeTag").classList.toggle("compact",i.value.length>0);
}

function isDrawerOpen(){return $("searchSection").classList.contains("open")}
function openDrawer(){
  $("searchSection").classList.add("open");
  // Drawer expands absolutely below the search row.
  // Links stay fixed — no layout push needed.
}
function closeDrawer(){
  const sec=$("searchSection");
  sec.classList.remove("open");
  sec.style.marginBottom=""; // restore resting margin (1rem from CSS)
}
function toggleDrawer(){isDrawerOpen()?closeDrawer():openDrawer()}

/* ── Tab bar ── */
function renderTabs(){
  $("drawerTabbar").innerHTML='<button class="drawer-tab'+(isAI()?'':' active')+'" data-mode="web">Web Search</button><button class="drawer-tab'+(isAI()?' active':'')+'" data-mode="ai">AI Chat</button>';
}

/* ── Render drawer grid ──
     In AI mode the grid uses the .ai-grid modifier so the 6 providers
     render as 4-on-top, 2-on-bottom (centered under cols 2-3).
     The 8 web search engines keep the auto-fill column layout. */
function renderDrawer(){
  renderTabs();
  const grid=$("drawerGrid");
  const ai=isAI();
  const items=ai?AI_ORDER.map(k=>[k,AI_L[k],"ai",AI_AUTO.has(k)?"→ auto":"✎ prefill"]):Object.keys(SE).map(k=>[k,k.charAt(0).toUpperCase()+k.slice(1),"web","web"]);
  grid.classList.toggle("ai-grid",ai);
  grid.innerHTML=items.map(([key,label,kind,tag])=>{
    const act=(kind==="web"&&!ai&&state.searchEngine===key)||(kind==="ai"&&ai&&state.aiProvider===key);
    return `<button class="drawer-btn${act?" active":""}" data-kind="${kind}" data-key="${key}"><span class="db-svg">${svgIcon(key)}</span><span class="db-name">${label}</span><span class="db-tag">${tag}</span></button>`;
  }).join("");

}

/* ── Filter bar + AI hint (inside drawer) ── */
function renderFilterBar(){
  const bar=$("filterBar");
  const hint=$("aiModeHint");
  if(isAI()){
    bar.classList.remove("visible");
    const ap=state.aiProvider;const auto=AI_AUTO.has(ap);
    hint.textContent=auto?"Opens directly to your query results":"Prefills the chat input — press Enter to send";
    hint.classList.add("active");
    return;
  }
  hint.classList.remove("active");
  bar.innerHTML=Object.keys(TYPE_L).map(k=>`<button class="filter-chip${state.searchType===k?" active":""}" data-filter="${k}">${TYPE_L[k]}</button>`).join("")+
    `<button class="filter-chip aifree${state.aiFreeOn?" active":""}" id="aiFreeChip">AI-Free</button>`;
  bar.classList.add("visible");
}

function updatePlaceholder(){
  const i=$("searchInput");
  if(isAI()){
    i.placeholder=`Ask ${AI_L[state.aiProvider]||"AI"} anything...`;
  }else{
    let extra="";if(state.aiFreeOn)extra+=" AI-free";if(state.searchType!=="all")extra+=` ${TYPE_L[state.searchType]}`;
    i.placeholder=`Search${extra}...`;
  }
}

function refreshUI(){
  updateModeTag();renderDrawer();renderFilterBar();updatePlaceholder();saveState();
}

/* ── Submit ── */
/* URL detection: full URLs, bare domains ("github.com/user"),
   localhost[:port] and IPv4 addresses navigate directly; everything
   else searches. Bare domains only navigate when the last label is a
   real, common TLD — so "node.js" or "vue.js" search (as intended)
   while "svelte.dev" navigates.
   v1 required the string to ALREADY start with http, so typing
   "example.com" searched instead of navigating, and the localhost
   branch was unreachable (it also demanded a dot). */
const NAV_TLDS=new Set(("com net org edu gov mil int io ai co dev app me us uk ca de fr jp cn in au br ru ch nl se no dk fi es it pl eu info biz tv gg sh xyz tech site online store blog news wiki to ly fm am so gl cc ws nz ie at be pt cz gr kr mx za ar cl tw hk sg my ph th vn id tr sa ae il pk").split(" "));
function navURL(q){
  if(/\s/.test(q))return null;
  if(/^https?:\/\//i.test(q)){try{return new URL(q).href}catch{return null}}
  if(/^localhost(:\d{1,5})?([\/?#]|$)/i.test(q))return "http://"+q;
  if(/^\d{1,3}(\.\d{1,3}){3}(:\d{1,5})?([\/?#]\S*)?$/.test(q))return "http://"+q;
  const m=q.match(/^[\w-]+(\.[\w-]+)*\.([a-z]{2,24})(:\d{1,5})?([\/?#]\S*)?$/i);
  if(m&&NAV_TLDS.has(m[2].toLowerCase())){
    try{return new URL("https://"+q).href}catch{return null}
  }
  return null;
}
function submitSearch(q){
  if(!q)return;
  if(isAI()){
    window.location.href=(AI[state.aiProvider]||AI.perplexity)+encodeURIComponent(q);
    return;
  }
  const nav=navURL(q);
  if(nav){window.location.href=nav;return}
  const engine=state.searchEngine,type=state.searchType;
  const enc=encodeURIComponent(q+(TYPE_TEXT[type]||""));
  const media=MEDIA_URL[engine]&&MEDIA_URL[engine][type];
  if(media){window.location.href=media.replace("%s",enc);return} // media tabs are already AI-overview-free
  let url=(SE[engine]||SE.google)+enc;
  if(state.aiFreeOn)url+=AI_FREE_PARAMS[engine]||"";
  window.location.href=url;
}

/* ══════════════════════════════════════════════════
   SETTINGS
   ══════════════════════════════════════════════════ */
function openSettings(){$("settingsPanel").classList.add("open");$("settingsBackdrop").classList.add("open");renderSettings()}
function closeSettings(){$("settingsPanel").classList.remove("open");$("settingsBackdrop").classList.remove("open")}

/* ── Methodology modal — shown when the user taps the "methodology"
     link in the AI Signal section of settings. We open a lightweight
     modal on top of the settings panel with full disclosure. */
function showMethodology(){
  let modal=$("aiMethodologyModal");
  if(!modal){
    modal=document.createElement("div");
    modal.id="aiMethodologyModal";
    modal.className="ai-methodology";
    modal.innerHTML=`
      <div class="ai-methodology-card">
        <div class="ai-methodology-head">
          <h3>How AI Signal works</h3>
          <button type="button" id="aiMethodologyClose" aria-label="Close">✕</button>
        </div>
        <div class="ai-methodology-body">
          <p><strong>What it is.</strong> A client-side "smell test" for AI-flavored writing. Every score is an <em>estimate</em>, not a verdict.</p>
          <p><strong>What it looks at.</strong> Each search result's title and snippet (the text Google / DuckDuckGo / Brave already shows you), plus the URL shape. We never fetch the article body — your browsing history stays yours.</p>
          <p><strong>Three signals, combined.</strong></p>
          <ul>
            <li><strong>Text patterns</strong> (65% weight) — a curated lexicon of ~80 AI-isms ("delve into", "navigate the complexities", "in today's digital landscape", etc.), each capped so repetition can't max the score, plus sentence-length uniformity, "Firstly…Secondly…Finally" scaffolding, transition-word and em-dash density. Evidence is normalized per ~45 words, so long text doesn't inflate the score.</li>
            <li><strong>Author / byline</strong> (15% weight) — looks for named humans ("By Jane Smith") in the snippet; penalizes self-disclosure ("AI-generated").</li>
            <li><strong>Domain signals</strong> (20% weight) — URL shape (TLD, hyphen slug), plus a curated list of human-edited publications (NYT, Atlantic, Wired, etc.) matched on the parsed hostname, which pulls the score downward.</li>
          </ul>
          <p><strong>Calibration.</strong> Three sensitivities that bend the score curve — Low compresses mid-range scores so only extreme evidence gets flagged, Medium is the default, High stretches scores upward. The default is conservative on purpose: false positives — accusing a real journalist of being AI — are worse than false negatives.</p>
          <p><strong>Hide-above mode.</strong> When you set a hide threshold, results meeting/exceeding that score collapse to a single hover-to-expand line. We don't delete them from the DOM (that would break SERP pagination). Hover any collapsed result to expand it for that moment.</p>
          <p><strong>Per-result dismissal.</strong> Every badge has a "✕" that hides it for that domain. Your dismissed domains persist in chrome.storage.sync and never show the badge again.</p>
          <p><strong>What it will NOT do.</strong> It will not catch lightly-edited AI text. It will not catch a human who happens to write in a corporate / listicle style. It will not give you a definitive "this is AI" answer. Anyone who tells you they can do that from a browser extension is lying.</p>
          <p class="ai-methodology-foot">Score is computed locally. No page is fetched, no data is sent off-device. The whole module adds ~15KB to the extension.</p>
        </div>
      </div>`;
    document.body.appendChild(modal);
    $("aiMethodologyClose").addEventListener("click",()=>{
      modal.classList.remove("open");
    });
    modal.addEventListener("click",(e)=>{
      if(e.target===modal)modal.classList.remove("open");
    });
  }
  modal.classList.add("open");
}
function renderSettings(){
  const gi=Math.round((state.glassOpacity||.04)*100);
  $("settingsTitle").textContent="Horizon Settings";
  $("settingsBody").innerHTML=`
    <div class="settings-group">
      <label class="settings-label">Theme</label>
      <div class="theme-grid">
        <button class="theme-btn${state.theme==="slate"?" active":""}" data-theme="slate"><span class="theme-swatch" style="background:#0d0d0d;border:1px solid #444"></span>Slate</button>
        <button class="theme-btn${state.theme==="ivory"?" active":""}" data-theme="ivory"><span class="theme-swatch" style="background:#f3f1ed;border:1px solid #ccc"></span>Ivory</button>
        <button class="theme-btn${state.theme==="navy"?" active":""}" data-theme="navy"><span class="theme-swatch" style="background:#001E44"></span>Navy</button>
        <button class="theme-btn${state.theme==="modern"?" active":""}" data-theme="modern"><span class="theme-swatch" style="background:linear-gradient(135deg,#0d0d0d 50%,#f8f6f0 50%);border:1px solid #666"></span>Modern</button>
        <button class="theme-btn${state.theme==="custom"?" active":""}" data-theme="custom" style="grid-column:1/-1"><span class="theme-swatch" style="background:${state.customBg||"#333"};border:1px solid ${state.customAccent||"#666"}"></span>Custom</button>
      </div>
      ${state.theme==="custom"?`<div class="color-pickers"><div class="color-pick-group"><label>Background</label><input type="color" class="color-input" id="customBgInput" value="${state.customBg||"#0d0d0d"}"></div><div class="color-pick-group"><label>Accent</label><input type="color" class="color-input" id="customAccentInput" value="${state.customAccent||"#7a8a9a"}"></div></div>`:""}
    </div>
    <div class="settings-group">
      <label class="settings-label">Background</label>
      <p class="settings-hint">Upload your own image. Persists across tabs.</p>
      <div style="display:flex;gap:.4rem">
        <button class="upload-btn" id="uploadBgBtn">🖼️ Upload Image</button>
        ${state.bg?'<button class="upload-btn" id="clearBgBtn">✖ Clear</button>':''}
      </div>
    </div>
    <div class="settings-group">
      <label class="settings-label">Glass Intensity</label>
      <div class="glass-slider-row"><span>◻</span><input type="range" class="glass-slider" id="glassSlider" min="0" max="15" value="${gi}"><span>◼</span></div>
    </div>
    <div class="settings-group">
      <label class="settings-label">Weather Location</label>
      <p class="settings-hint">US coordinates (National Weather Service). Leave blank for the default.</p>
      <div style="display:flex;gap:.4rem">
        <input type="text" class="coord-input" id="weatherLatInput" inputmode="decimal" placeholder="Latitude" value="${state.weatherLat??""}">
        <input type="text" class="coord-input" id="weatherLonInput" inputmode="decimal" placeholder="Longitude" value="${state.weatherLon??""}">
      </div>
    </div>
    <div class="settings-group">
      <label class="settings-label">Default Search Engine</label>
      <div class="theme-grid">${Object.keys(SE).map(k=>`<button class="engine-btn${state.searchEngine===k?" active":""}" data-engine="${k}">${k.charAt(0).toUpperCase()+k.slice(1)}</button>`).join("")}</div>
    </div>
    <div class="settings-group">
      <label class="settings-label">Default AI Provider</label>
      <div class="theme-grid">${AI_ORDER.map(k=>`<button class="engine-btn${state.aiProvider===k?" active":""}" data-ai="${k}">${AI_L[k]}</button>`).join("")}</div>
    </div>
    <div class="settings-group">
      <label class="settings-label">AI Signal<span style="font-weight:400;text-transform:none;letter-spacing:0;opacity:.65"> · beta</span></label>
      <p class="settings-hint">Heuristic score on Google / DuckDuckGo / Brave search results. Shows an "AI: NN%" badge per result, optionally hides high-AI ones. Pure client-side, no API.</p>
      <div class="theme-grid" style="grid-template-columns:1fr">
        <button class="engine-btn${state.aiSignal?" active":""}" id="aiSignalToggle" data-on="${state.aiSignal}">
          ${state.aiSignal?"✓ Enabled — showing AI % on search results":"○ Off — click to enable"}
        </button>
      </div>
      <div class="theme-grid" style="grid-template-columns:1fr;margin-top:.35rem">
        <button class="engine-btn${state.aiPageDetector?" active":""}" id="aiPageDetToggle">
          ${state.aiPageDetector?"✓ Page detector on — floating score on article pages":"○ Page detector off — click to score pages you visit"}
        </button>
      </div>
      <p class="settings-hint" style="margin-top:.25rem">Optional and off by default. Asks for permission to run on all sites; the text analysis itself stays on-device.</p>
      <div style="margin-top:.5rem">
        <label class="settings-label" style="font-size:.7rem;opacity:.75">Safe Browsing key<span style="font-weight:400;text-transform:none;letter-spacing:0;opacity:.65"> · optional</span></label>
        <input type="text" class="coord-input" id="sbKeyInput" placeholder="Enter here" spellcheck="false" autocomplete="off" style="margin-top:.25rem">
        <p class="settings-hint" style="margin-top:.25rem">If set, the page detector also checks sites against Google Safe Browsing and warns on flagged ones — this sends the hostname to Google. Leave blank to skip entirely. <a href="https://developers.google.com/safe-browsing/v4/get-started" target="_blank" rel="noopener" style="color:var(--accent)">Get a key</a></p>
      </div>
      ${state.aiSignal?`
        <div style="margin-top:.4rem">
          <label class="settings-label" style="font-size:.7rem;opacity:.75">Sensitivity</label>
          <div class="theme-grid" style="grid-template-columns:1fr 1fr 1fr;gap:.3rem">
            <button class="engine-btn${state.aiSensitivity==="low"?" active":""}" data-aisens="low">Low<br><span style="font-size:.6rem;opacity:.65">only flag obvious</span></button>
            <button class="engine-btn${state.aiSensitivity==="med"?" active":""}" data-aisens="med">Medium<br><span style="font-size:.6rem;opacity:.65">default</span></button>
            <button class="engine-btn${state.aiSensitivity==="high"?" active":""}" data-aisens="high">High<br><span style="font-size:.6rem;opacity:.65">sensitive</span></button>
          </div>
        </div>
        <div style="margin-top:.4rem">
          <label class="settings-label" style="font-size:.7rem;opacity:.75">Auto-hide results: <span id="aiHideVal">${state.aiHideAbove?`≥ ${state.aiHideAbove}%`:"Off"}</span></label>
          <div class="glass-slider-row"><span>off</span><input type="range" class="glass-slider" id="aiHideSlider" min="0" max="95" step="5" value="${state.aiHideAbove}"><span>95%</span></div>
          <p class="settings-hint" style="margin-top:.25rem">Results scoring at or above the threshold collapse — hover one to reveal it. Slide left to turn off.</p>
        </div>
        <p class="settings-hint" style="margin-top:.4rem">
          <strong>Heuristic, not a verdict.</strong> False positives are possible — formal human writing can get flagged. Every result can be dismissed (\u2715) per-domain. Read the
          <a href="#" id="aiHowLink" style="color:var(--accent)">methodology</a> for details.
        </p>
      `:""}
    </div>
    <div class="settings-group">
      <label class="settings-label">Quick Links</label>
      <div class="custom-links" id="customLinksRendered">
        ${state.links.map((l,i)=>`<div class="link-editor" data-idx="${i}"><input class="le-emoji" value="${esc(l.emoji||"🌐")}" maxlength="2" placeholder="🌐"><input class="le-label" value="${esc(l.label)}" placeholder="Label"><input class="le-url" value="${esc(l.url)}" placeholder="https://..."><input class="le-img" value="${esc(l.image||"")}" placeholder="Img URL"><button class="link-remove" title="Remove">✕</button></div>`).join("")}
      </div>
      <button class="btn-sm" id="addLinkBtn">+ Add Link</button>
      <button class="btn-sm" id="toggleLinksBtn">${state.showLinks?"✓ Visible":"⊟ Hidden"}</button>
    </div>`;

  const ci=$("customBgInput"),ca=$("customAccentInput");
  if(ci&&ca){ci.addEventListener("input",()=>{state.customBg=ci.value;applyCustomTheme()});ca.addEventListener("input",()=>{state.customAccent=ca.value;applyCustomTheme()})}
  $("glassSlider")?.addEventListener("input",e=>applyGlassOpacity(e.target.value/100));
  document.querySelectorAll("#settingsBody .theme-btn").forEach(btn=>{btn.addEventListener("click",()=>{if(state.bg)clearBg();applyTheme(btn.dataset.theme);renderSettings()})});
  document.querySelectorAll("#settingsBody .engine-btn[data-engine]").forEach(btn=>{btn.addEventListener("click",()=>{state.searchEngine=btn.dataset.engine;renderSettings();saveState();refreshUI()})});
  document.querySelectorAll("#settingsBody .engine-btn[data-ai]").forEach(btn=>{btn.addEventListener("click",()=>{state.aiProvider=btn.dataset.ai;renderSettings();saveState();refreshUI()})});
  document.querySelectorAll("#customLinksRendered .link-editor").forEach(ed=>{const idx=parseInt(ed.dataset.idx);const save=()=>{
    const newUrl=ed.querySelector(".le-url").value.trim()||"https://example.com";
    const newImg=ed.querySelector(".le-img").value.trim();
    let image=newImg;
    if(!image){
      // v1 called new URL(newUrl) unguarded — a half-typed URL threw and
      // killed the whole input handler. Now it just skips the favicon.
      try{image=`https://www.google.com/s2/favicons?domain=${new URL(safeHref(newUrl)).hostname}&sz=64`}catch{image=""}
    }
    state.links[idx]={...state.links[idx],emoji:ed.querySelector(".le-emoji").value||"🌐",label:ed.querySelector(".le-label").value||"Link",url:newUrl,image};
    saveState();renderLinks()
  };ed.querySelector(".le-emoji")?.addEventListener("input",save);ed.querySelector(".le-label")?.addEventListener("input",save);ed.querySelector(".le-url")?.addEventListener("input",save);ed.querySelector(".le-img")?.addEventListener("input",save);ed.querySelector(".link-remove")?.addEventListener("click",()=>{state.links.splice(idx,1);saveState();renderLinks();renderSettings()})});
  $("toggleLinksBtn")?.addEventListener("click",()=>{state.showLinks=!state.showLinks;saveState();renderLinks();renderSettings()});
  $("addLinkBtn")?.addEventListener("click",()=>{const newUrl = "https://example.com"; const newDomain = (new URL(newUrl)).hostname; state.links.push({id:`lc${linkId++}`,label:"New Link",url:newUrl,emoji:"",image:`https://www.google.com/s2/favicons?domain=${newDomain}&sz=64`});saveState();renderLinks();renderSettings();$("settingsPanel").scrollTop=$("settingsPanel").scrollHeight});
  $("uploadBgBtn")?.addEventListener("click",()=>$("bgUpload").click());
  $("clearBgBtn")?.addEventListener("click",()=>{clearBg();renderSettings()});

  // AI Signal settings wiring
  $("aiSignalToggle")?.addEventListener("click",()=>{state.aiSignal=!state.aiSignal;saveState();renderSettings()});
  $("aiPageDetToggle")?.addEventListener("click",async()=>{
    if(!state.aiPageDetector){
      // Turning ON: ask for the optional <all_urls> permission first.
      // background.js registers the detector script only when both the
      // setting and the permission are in place.
      let granted=false;
      try{granted=await chrome.permissions.request({origins:["<all_urls>"]})}catch{}
      if(!granted){renderSettings();return}
    }
    state.aiPageDetector=!state.aiPageDetector;
    saveState();renderSettings();
  });
  const sbInput=$("sbKeyInput");
  if(sbInput){
    try{chrome.storage.sync.get(["hz_sb_key"],r=>{if(r&&typeof r.hz_sb_key==="string")sbInput.value=r.hz_sb_key})}catch{}
    sbInput.addEventListener("change",()=>{
      const v=sbInput.value.trim();
      try{
        if(v){const p=chrome.storage.sync.set({hz_sb_key:v});if(p&&p.catch)p.catch(()=>{})}
        else{const p=chrome.storage.sync.remove("hz_sb_key");if(p&&p.catch)p.catch(()=>{})}
      }catch{}
    });
  }
  const wla=$("weatherLatInput"),wlo=$("weatherLonInput");
  if(wla&&wlo){
    const upd=()=>{
      const la=parseFloat(wla.value),lo=parseFloat(wlo.value);
      state.weatherLat=Number.isFinite(la)&&Math.abs(la)<=90?la:null;
      state.weatherLon=Number.isFinite(lo)&&Math.abs(lo)<=180?lo:null;
      saveState();fetchWeather();
    };
    wla.addEventListener("change",upd);wlo.addEventListener("change",upd);
  }
  document.querySelectorAll("[data-aisens]").forEach(b=>b.addEventListener("click",()=>{state.aiSensitivity=b.dataset.aisens;saveState();renderSettings()}));
  $("aiHideSlider")?.addEventListener("input",e=>{
    state.aiHideAbove=parseInt(e.target.value,10)||0;
    $("aiHideVal").textContent=state.aiHideAbove?`≥ ${state.aiHideAbove}%`:"Off";
    saveState();
  });
  $("aiHowLink")?.addEventListener("click",e=>{
    e.preventDefault();
    showMethodology();
  });
}

/* ── Upload ── */
$("bgUpload").addEventListener("change",e=>{
  const f=e.target.files[0];if(!f)return;
  const r=new FileReader();
  r.onload=()=>{
    const img=new Image();
    img.onload=()=>{
      let q=.85,w=img.width,h=img.height;const MD=1920;
      if(w>MD||h>MD){const R=Math.min(MD/w,MD/h);w=Math.round(w*R);h=Math.round(h*R)}
      const c=document.createElement("canvas");c.width=w;c.height=h;c.getContext("2d").drawImage(img,0,0,w,h);
      const comp=qu=>{const d=c.toDataURL("image/jpeg",qu);return d.length*.75>500*1024&&qu>.1?comp(qu-.05):d};
      applyBg(comp(q));renderSettings();
    };img.src=r.result;
  };r.readAsDataURL(f);e.target.value="";
});

document.addEventListener("keydown",e=>{
  const el=e.target;
  const typing=el&&(el.tagName==="INPUT"||el.tagName==="TEXTAREA"||el.isContentEditable);
  const settingsOpen=$("settingsPanel").classList.contains("open");

  // Cmd/Ctrl+K always focuses search; bare "/" only when not typing.
  // (v1 hijacked "/" and "?" even inside the search box — you couldn't
  // type a URL path or end a question with "?" without opening settings.)
  if(((e.key==="/"&&!typing)||(e.key==="k"&&(e.metaKey||e.ctrlKey)))&&!settingsOpen){
    e.preventDefault();
    $("searchInput").focus({preventScroll:true});
    return;
  }
  if(e.key==="?"&&!typing&&!isDrawerOpen()&&!settingsOpen){
    e.preventDefault();
    openSettings();
    return;
  }
  if(e.key==="Escape"&&$("settingsPanel").classList.contains("open"))closeSettings();
  if(e.key==="Escape"&&isDrawerOpen())closeDrawer();

  // Arrow navigation in the drawer grid
  if(isDrawerOpen()&&["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)){
    // While the caret is in the search input, Left/Right/Up must keep
    // moving the caret (v1 preventDefault'd them to switch drawer tabs,
    // so the text cursor couldn't move at all). Only ArrowDown hands
    // focus to the drawer.
    if(document.activeElement===$("searchInput")&&e.key!=="ArrowDown")return;
    e.preventDefault();
    const btns=[...document.querySelectorAll(".drawer-btn")];
    const tabs=[...document.querySelectorAll(".drawer-tab")];
    const active=document.activeElement;
    const activeIdx=btns.indexOf(active);
    const tabIdx=tabs.indexOf(active);

    if(active&&activeIdx>=0){
      // Currently on a grid button
      const perRow=Math.max(1,Math.floor((document.querySelector(":root").offsetWidth-80)/145));
      const col=activeIdx%perRow;
      const isFirstCol=col===0;
      const isLastCol=col===perRow-1||activeIdx===btns.length-1;
      // ArrowLeft from first column → switch to previous tab
      if(e.key==="ArrowLeft"&&isFirstCol){
        const tabs2=[...document.querySelectorAll(".drawer-tab")];
        const activeTab=document.querySelector(".drawer-tab.active");
        const tIdx=tabs2.indexOf(activeTab);
        if(tIdx>0){
          tabs2[tIdx-1].click();
          requestAnimationFrame(()=>{
            const nt=[...document.querySelectorAll(".drawer-tab")];
            if(nt[tIdx-1])nt[tIdx-1].focus();
          });
          return;
        }
      }
      // ArrowRight from last column → switch to next tab
      if(e.key==="ArrowRight"&&isLastCol){
        const tabs2=[...document.querySelectorAll(".drawer-tab")];
        const activeTab=document.querySelector(".drawer-tab.active");
        const tIdx=tabs2.indexOf(activeTab);
        if(tIdx<tabs2.length-1){
          tabs2[tIdx+1].click();
          requestAnimationFrame(()=>{
            const nt=[...document.querySelectorAll(".drawer-tab")];
            if(nt[tIdx+1])nt[tIdx+1].focus();
          });
          return;
        }
      }
      // Normal grid navigation
      if(e.key==="ArrowRight"&&activeIdx<btns.length-1){
        btns[activeIdx+1].focus();
      }else if(e.key==="ArrowLeft"&&activeIdx>0){
        btns[activeIdx-1].focus();
      }else if(e.key==="ArrowDown"&&activeIdx+perRow<btns.length){
        btns[activeIdx+perRow].focus();
      }else if(e.key==="ArrowUp"){
        if(activeIdx-perRow>=0){
          btns[activeIdx-perRow].focus();
        }else{
          // Jump to active tab
          const activeTab2=document.querySelector(".drawer-tab.active");
          if(activeTab2)activeTab2.focus();
        }
      }
    }else if(active&&tabIdx>=0){
      // Currently on a tab
      if(e.key==="ArrowRight"&&tabIdx<tabs.length-1){
        tabs[tabIdx+1].click();
        // After click the drawer re-renders, so re-query the new tab by index
        requestAnimationFrame(()=>{
          const newTabs=[...document.querySelectorAll(".drawer-tab")];
          if(newTabs[tabIdx+1])newTabs[tabIdx+1].focus();
        });
      }else if(e.key==="ArrowLeft"&&tabIdx>0){
        tabs[tabIdx-1].click();
        requestAnimationFrame(()=>{
          const newTabs=[...document.querySelectorAll(".drawer-tab")];
          if(newTabs[tabIdx-1])newTabs[tabIdx-1].focus();
        });
      }else if(e.key==="ArrowUp"||e.key==="ArrowDown"){
        // Jump to first engine of current tab
        const tab=active.dataset.mode;
        const firstBtn=btns.find(b=>b.dataset.kind===tab);
        if(firstBtn)firstBtn.focus();
        else if(btns.length>0)btns[0].focus();
      }
    }else if(active===$("searchInput")){
      // From the input, ArrowDown enters the drawer (Left/Right/Up
      // stay with the text caret and returned early above).
      if(e.key==="ArrowDown"){
        const activeTab=document.querySelector(".drawer-tab.active");
        if(activeTab)activeTab.focus();
      }
    }
  }
});

/* ══════════════════════════════════════════════════
   BOOT
   ══════════════════════════════════════════════════ */
(async function boot(){
  await loadState();
  if(state.glassOpacity)document.documentElement.style.setProperty("--surface-opacity",String(state.glassOpacity));
  if(state.searchMode&&!state.searchType){state.searchType=state.searchMode==="ai"?"ai":"all";delete state.searchMode;}
  if(!state.aiProvider)state.aiProvider="perplexity";

  if(state.bg)applyBg(state.bg);
  else applyTheme(state.theme||"slate");

  scheduleClock();
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)scheduleClock()});
  fetchWeather();setInterval(fetchWeather,1800000);
  renderLinks();

  /* ── Search: click row toggles drawer, focus opens it ── */
  const sec=$("searchSection");
  const input=$("searchInput");

  // Clicking the search row (anywhere outside input) toggles drawer
  document.querySelector(".search-row").addEventListener("click",e=>{
    if(e.target===input||input.contains(e.target)){openDrawer();return}
    toggleDrawer();
    if(isDrawerOpen())input.focus();
  });

  // Mode tag and arrow both toggle drawer directly
  $("modeTag").addEventListener("click",e=>{
    e.stopPropagation();
    toggleDrawer();
    if(isDrawerOpen())input.focus();
  });
  $("searchArrow").addEventListener("click",e=>{
    e.stopPropagation();
    toggleDrawer();
    if(isDrawerOpen())input.focus();
  });
  // Focus the input BEFORE attaching the focus→open listener, so a
  // fresh tab starts focused with the drawer closed. (v1 used the HTML
  // autofocus attribute, which only worked because it happened to fire
  // before the async boot attached this listener.)
  input.focus({preventScroll:true});
  input.addEventListener("focus",openDrawer);
  input.addEventListener("input",tagOnInput);

  // Event delegation for drawer controls — the render functions emit
  // markup only now, so re-renders never churn listeners, and picking
  // an engine in the current mode is a cheap class swap instead of an
  // innerHTML rebuild mid-animation.
  $("drawerTabbar").addEventListener("click",e=>{
    const tab=e.target.closest(".drawer-tab");if(!tab)return;
    e.stopPropagation();
    const mode=tab.dataset.mode;
    if(mode==="web"&&isAI()){state.searchType="all";refreshUI()}
    else if(mode==="ai"&&!isAI()){state.searchType="ai";refreshUI()}
  });
  $("drawerGrid").addEventListener("click",e=>{
    const btn=e.target.closest(".drawer-btn");if(!btn)return;
    e.stopPropagation();
    const kind=btn.dataset.kind,key=btn.dataset.key;
    if((kind==="ai")!==isAI()){ // stale grid from the other mode — full refresh
      if(kind==="web"){state.searchEngine=key;state.searchType="all"}
      else{state.aiProvider=key;state.searchType="ai"}
      refreshUI();return;
    }
    if(kind==="web")state.searchEngine=key;else state.aiProvider=key;
    $("drawerGrid").querySelector(".drawer-btn.active")?.classList.remove("active");
    btn.classList.add("active");
    updateModeTag();updatePlaceholder();
    if(kind==="ai")renderFilterBar(); // the hint line depends on the provider
    saveState();
  });
  $("filterBar").addEventListener("click",e=>{
    const chip=e.target.closest(".filter-chip");if(!chip)return;
    e.stopPropagation();
    if(chip.id==="aiFreeChip")state.aiFreeOn=!state.aiFreeOn;
    else if(chip.dataset.filter)state.searchType=chip.dataset.filter;
    else return;
    renderFilterBar();updatePlaceholder();saveState();
  });

  // Close drawer on outside click.
  // Use pointerdown (not click) so this fires BEFORE the focus
  // event, preventing the click target from receiving focus and
  // re-triggering openDrawer via the input focus listener.
  document.addEventListener("pointerdown",e=>{
    if(isDrawerOpen()&&!sec.contains(e.target)){
      closeDrawer();
    }
  });

  // Form submit
  $("searchForm").addEventListener("submit",e=>{e.preventDefault();submitSearch(input.value.trim())});

  renderDrawer();refreshUI();

  // Settings
  $("settingsToggle").addEventListener("click",openSettings);
  $("settingsClose").addEventListener("click",closeSettings);
  $("settingsBackdrop").addEventListener("click",closeSettings);
})();
