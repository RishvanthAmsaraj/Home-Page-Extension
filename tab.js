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
function aiFreeURL(base,q,engine){
  return base+encodeURIComponent(q)+(AI_FREE_PARAMS[engine]||"");
}

const TYPE_PARAMS={all:"",reddit:" site:reddit.com",article:"&tbm=nws",pdf:" filetype:pdf",video:"&tbm=vid",images:"&tbm=isch"};
const TYPE_L={all:"All",reddit:"Reddit",article:"News",pdf:"PDF",video:"Video",images:"Images"};

const DL=[
  {id:"l1",label:"ChatGPT",url:"https://chatgpt.com",emoji:"🤖",image:""},
  {id:"l2",label:"GitHub",url:"https://github.com",emoji:"💻",image:""},
  {id:"l3",label:"Calendar",url:"https://calendar.google.com",emoji:"📅",image:""},
  {id:"l4",label:"Mail",url:"https://mail.google.com",emoji:"📧",image:""},
  {id:"l5",label:"Canvas",url:"https://canvas.psu.edu",emoji:"📚",image:""},
  {id:"l6",label:"OpenClaw",url:"https://openclaw.ai",emoji:"⚡",image:""}
];

/* ── Schema versioning.
   Bump SCHEMA_VERSION when the shape of state changes (new fields,
   renamed fields, removed fields). On load, if the saved blob is
   missing the version stamp (or has an older one), we run a
   migration function that knows how to bring it forward. Old
   fields are stripped; missing fields get defaults from DS. */
const SCHEMA_VERSION = 1;

const DS={
  theme:"slate",searchEngine:"google",aiProvider:"perplexity",
  links:DL,showLinks:true,glassOpacity:0.04,searchType:"all",
  customBg:"#0d0d0d",customAccent:"#7a8a9a",customLight:false,aiFreeOn:false,
  aiSignal:false,aiSensitivity:"med",aiHideAbove:0
};

/* Migrate a raw saved blob to the current schema. Returns a clean
   state object. Each version step handles its own deltas — never
   edit an old step, always ADD a new one. */
function migrateState(raw){
  let v = raw && typeof raw._v === "number" ? raw._v : 0;
  if (v < 1) v = 1;
  const clean = {};
  for (const k of Object.keys(DS)) {
    clean[k] = raw && Object.prototype.hasOwnProperty.call(raw, k)
      ? raw[k]
      : DS[k];
  }
  clean._v = SCHEMA_VERSION;
  return clean;
}
let state={...DS},linkId=100;

/* ── Storage ── */
const SYS="hz",BG_KEY="***";

async function loadState(){
  try{
    const s=await chrome.storage.sync.get([SYS]);
    if(s[SYS])state=migrateState(s[SYS]);
  }catch{try{const s=localStorage.getItem(SYS);if(s)state=migrateState(JSON.parse(s))}catch{}}
  try{
    const b=await chrome.storage.local.get([BG_KEY]);
    if(b[BG_KEY])state.bg=b[BG_KEY];
  }catch{try{const b=localStorage.getItem(BG_KEY);if(b)state.bg=b}catch{}}
}
function saveState(){
  /* _v is a schema stamp; we write it as the very first key so
     load-time sees it immediately. loadState handles migration
     if _v is missing or older. */
  const o={_v:SCHEMA_VERSION,theme:state.theme,searchEngine:state.searchEngine,aiProvider:state.aiProvider,
    links:state.links,showLinks:state.showLinks,glassOpacity:state.glassOpacity,searchType:state.searchType,
    customBg:state.customBg,customAccent:state.customAccent,customLight:state.customLight,aiFreeOn:state.aiFreeOn,
    aiSignal:state.aiSignal,aiSensitivity:state.aiSensitivity,aiHideAbove:state.aiHideAbove};
  const bg=state.bg;delete o.bg;
  try{chrome.storage.sync.set({[SYS]:o})}catch{try{localStorage.setItem(SYS,JSON.stringify(o))}catch{}}
  if(bg){try{chrome.storage.local.set({[BG_KEY]:bg})}catch{try{localStorage.setItem(BG_KEY,bg)}catch{}}}
  else{try{chrome.storage.local.remove(BG_KEY)}catch{}}
}

/* ── Clock ── */
function greet(){return["good morning","good afternoon","good evening","good night"][Math.min(Math.floor(new Date().getHours()/6),3)]}
function updateClock(){
  const n=new Date();
  document.getElementById("time").textContent=`${n.getHours()%12||12}:${String(n.getMinutes()).padStart(2,"0")} ${n.getHours()>=12?"PM":"AM"}`;
  document.getElementById("greeting").textContent=greet();
  document.getElementById("date").textContent=n.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});
}

/* ── Weather ── */
async function fetchWeather(){
  try{
    const p=await(await fetch(`https://api.weather.gov/points/${LAT},${LON}`)).json();
    const f=await(await fetch(p.properties.forecast)).json(),ps=f.properties.periods;
    const c=ps[0],nx=ps[1],t=c.temperature,d=c.isDaytime;
    let hi=nx&&nx.isDaytime?nx.temperature:t,lo=nx&&!nx.isDaytime?nx.temperature:t;
    if(!d){lo=t;const td=ps[2]&&ps[2].isDaytime?ps[2]:null;hi=td?td.temperature:nx?nx.temperature:t}
    document.getElementById("weatherIcon").textContent=wi(c.shortForecast,d);
    document.getElementById("weatherTemp").textContent=`${t}°`;
    document.getElementById("weatherDesc").textContent=c.shortForecast;
    document.getElementById("weatherHiLo").textContent=`H ${hi}° L ${lo}°`;
  }catch{document.getElementById("weatherDesc").textContent="unavailable"}
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
function swModern(){document.documentElement.setAttribute("data-theme",new Date().getHours()>=6&&new Date().getHours()<20?"modern-day":"modern")}
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
    const el=document.getElementById("bgLayer");el.style.setProperty("--user-bg",`url(${data})`);el.style.setProperty("--overlay-c",oc);el.classList.add("has-image");
    document.getElementById("glassOrb").style.display="none";document.documentElement.setAttribute("data-theme",dark?"darkbg":"lightbg");document.documentElement.classList.add("has-bg");
    state.bg=data;saveState();
  };img.onerror=clearBg;img.src=data;
}
function clearBg(){
  const el=document.getElementById("bgLayer");el.classList.remove("has-image");el.style.removeProperty("--user-bg");el.style.removeProperty("--overlay-c");
  document.getElementById("glassOrb").style.display="";document.documentElement.classList.remove("has-bg");
  const t=state.theme||"slate";if(t==="custom")applyCustomTheme();else if(t==="modern")swModern();else document.documentElement.setAttribute("data-theme",t);
  delete state.bg;saveState();
}

/* ── Links ── */
function renderLinks(){
  const linksEl=document.getElementById("links");linksEl.style.display=state.showLinks?"":"none";linksEl.innerHTML=state.links.map(l=>`<a href="${l.url}" class="link-item" title="${l.url}"><span class="link-icon">${l.image?`<img src="${l.image}" alt="" loading="lazy">`:l.emoji||"🌐"}</span><span class="link-label">${l.label}</span></a>`).join("");
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
  const tag=document.getElementById("modeTag");
  const icon = isAI() ? svgIcon(state.aiProvider)
                      : svgIcon(state.searchEngine);
  const label = isAI() ? AI_L[state.aiProvider]
                       : state.searchEngine.charAt(0).toUpperCase()+state.searchEngine.slice(1);
  // Wrap label in a span so the compact (icon-only) state can fade
  // the label out independently of the icon.
  tag.innerHTML = icon + ' <span class="mode-label">' + label + '</span>';
}
function tagOnInput(){
  const i=document.getElementById("searchInput");
  // Compact the chip to icon-only while typing so the input gets more
  // room without losing the brand indicator entirely.
  document.getElementById("modeTag").classList.toggle("compact",i.value.length>0);
}

function isDrawerOpen(){return document.getElementById("searchSection").classList.contains("open")}
function openDrawer(){
  const sec = document.getElementById("searchSection");
  sec.classList.add("open");
  sec.setAttribute("aria-expanded", "true");
  // Save which element had focus so closeDrawer() can restore it.
  const inp = document.getElementById("searchInput");
  _drawerReturnFocus = (document.activeElement && document.activeElement !== document.body)
    ? document.activeElement
    : inp;
  // Close the recent-searches dropdown so the user isn't looking
  // at two overlapping panels — the drawer is the active surface.
  try { closeSearchHistory(); } catch (_) {}
}
function closeDrawer(){
  const sec=document.getElementById("searchSection");
  sec.classList.remove("open");
  sec.setAttribute("aria-expanded","false");
  sec.style.marginBottom=""; // restore resting margin (1rem from CSS)
  // Restore focus to the element that had it before we opened,
  // if that element is still in the DOM and focusable.
  if (_drawerReturnFocus && document.contains(_drawerReturnFocus)) {
    try { _drawerReturnFocus.focus({ preventScroll: true }); } catch (_) {}
  }
  _drawerReturnFocus = null;
}
function toggleDrawer(){isDrawerOpen()?closeDrawer():openDrawer()}

/* ── Tab bar ── */
function renderTabs(){
  const bar=document.getElementById("drawerTabbar");
  bar.innerHTML='<button class="drawer-tab'+(isAI()?'':' active')+'" data-mode="web">Web Search</button><button class="drawer-tab'+(isAI()?' active':'')+'" data-mode="ai">AI Chat</button>';
  bar.querySelectorAll(".drawer-tab").forEach(tab=>{
    tab.addEventListener("click",e=>{
      e.stopPropagation();
      const mode=tab.dataset.mode;
      if(mode==="web"&&isAI()){state.searchType="all";refreshUI()}
      else if(mode==="ai"&&!isAI()){state.searchType="ai";refreshUI()}
    });
  });
}

/* ── Render drawer grid ──
     In AI mode the grid uses the .ai-grid modifier so the 6 providers
     render as 4-on-top, 2-on-bottom (centered under cols 2-3).
     The 8 web search engines keep the auto-fill column layout. */
function renderDrawer(){
  renderTabs();
  const grid=document.getElementById("drawerGrid");
  const ai=isAI();
  const items=ai?AI_ORDER.map(k=>[k,AI_L[k],"ai",AI_AUTO.has(k)?"→ auto":"✎ prefill"]):Object.keys(SE).map(k=>[k,k.charAt(0).toUpperCase()+k.slice(1),"web","web"]);
  grid.classList.toggle("ai-grid",ai);
  grid.innerHTML=items.map(([key,label,kind,tag])=>{
    const act=(kind==="web"&&!ai&&state.searchEngine===key)||(kind==="ai"&&ai&&state.aiProvider===key);
    return `<button class="drawer-btn${act?" active":""}" data-kind="${kind}" data-key="${key}"><span class="db-svg">${svgIcon(key)}</span><span class="db-name">${label}</span><span class="db-tag">${tag}</span></button>`;
  }).join("");

  grid.querySelectorAll(".drawer-btn").forEach(btn=>{
    btn.addEventListener("click",e=>{
      e.stopPropagation();
      const kind=btn.dataset.kind,key=btn.dataset.key;
      if(kind==="web"){state.searchEngine=key;state.searchType="all";}
      else{state.aiProvider=key;state.searchType="ai";}
      // Remember which key was clicked so we can re-focus the
      // matching button AFTER refreshUI() tears down this DOM
      // and rebuilds it. Without this, focus would die and
      // arrow keys would no longer navigate the grid — the
      // user would have to press '/' again to get back in.
      e.currentTarget.dataset.hzRememberFocus = "1";
      refreshUI();
      // Re-focus the freshly-rendered active button so arrow
      // keys keep working without re-opening the drawer.
      const fresh = document.querySelector(`.drawer-btn[data-key="${key}"][data-kind="${kind}"]`);
      if (fresh) fresh.focus();
    });
  });
}

/* ── Filter bar + AI hint (inside drawer) ── */
function renderFilterBar(){
  const bar=document.getElementById("filterBar");
  const hint=document.getElementById("aiModeHint");
  if(isAI()){
    bar.classList.remove("visible");
    const ap=state.aiProvider;const auto=AI_AUTO.has(ap);
    hint.textContent=auto?"Opens directly to your query results":"Prefills the chat input — press Enter to send";
    hint.classList.add("active");
    return;
  }
  hint.classList.remove("active");
  bar.innerHTML=Object.keys(TYPE_PARAMS).map(k=>`<button class="filter-chip${state.searchType===k?" active":""}" data-filter="${k}">${TYPE_L[k]}</button>`).join("")+
    `<button class="filter-chip aifree${state.aiFreeOn?" active":""}" id="aiFreeChip">AI-Free</button>`;
  bar.classList.add("visible");
  bar.querySelectorAll(".filter-chip[data-filter]").forEach(chip=>{
    chip.addEventListener("click",e=>{e.stopPropagation();state.searchType=chip.dataset.filter;renderFilterBar();saveState();updatePlaceholder()});
  });
  document.getElementById("aiFreeChip")?.addEventListener("click",e=>{e.stopPropagation();state.aiFreeOn=!state.aiFreeOn;renderFilterBar();saveState();updatePlaceholder()});
}

function updatePlaceholder(){
  const i=document.getElementById("searchInput");
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
function submitSearch(q){
  if(!q)return;
  if(isAI()){
    window.location.href=(AI[state.aiProvider]||AI.perplexity)+encodeURIComponent(q);
    return;
  }
  const base=SE[state.searchEngine]||SE.google;
  if(q.includes(".")&&!q.includes(" ")&&(q.startsWith("http://")||q.startsWith("https://")||q.startsWith("localhost"))){
    window.location.href=q.startsWith("http")?q:`https://${q}`;return;
  }
  let query=q+(TYPE_PARAMS[state.searchType]||"");
  let url=state.aiFreeOn?aiFreeURL(base,query,state.searchEngine):base+encodeURIComponent(query);
  window.location.href=url;
}
/* ── Recent-searches dropdown ──
   Stored in chrome.storage.local (separate from prefs.sync so the
   quota isn't an issue). Max 12 entries, dedupe by query string,
   newest first. The dropdown shows when the input is focused AND
   empty AND we have entries. Up/Down arrow keys move within the
   list; Enter submits the highlighted one; Escape just closes. */
const HISTORY_KEY = "hzHistory";
const HISTORY_MAX = 12;
let searchHistory = []; // [{ q, t }]

/* Synchronous bootstrap loader. The page is auto-focused on
   load, so we need history entries ready BEFORE the first focus
   event fires — otherwise the dropdown shows nothing the first
   time. We read localStorage synchronously here, then chrome's
   async storage overwrites once it returns. */
function _loadSearchHistorySync(){
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) {
      const v = JSON.parse(raw);
      if (Array.isArray(v)) return v;
    }
  } catch {}
  return [];
}
async function loadSearchHistory(){
  // Start with whatever localStorage had (sync, instant)
  searchHistory = _loadSearchHistorySync();
  // Then asynchronously hydrate from chrome.storage.local and
  // prefer that if it has data.
  try {
    const r = await chrome.storage.local.get([HISTORY_KEY]);
    if (Array.isArray(r[HISTORY_KEY])) {
      searchHistory = r[HISTORY_KEY];
      // Mirror to localStorage so the next sync read is fresh
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(searchHistory)); } catch {}
    }
  } catch {}
}
async function saveSearchHistory(){
  const trimmed = searchHistory.slice(0, HISTORY_MAX);
  try { await chrome.storage.local.set({ [HISTORY_KEY]: trimmed }); }
  catch {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed)); } catch {}
  }
}
async function recordSearch(q){
  q = (q || '').trim();
  if (!q) return;
  // Dedupe case-insensitively; bump the existing entry to the top.
  searchHistory = [
    { q, t: Date.now() },
    ...searchHistory.filter(e => e.q.toLowerCase() !== q.toLowerCase()),
  ].slice(0, HISTORY_MAX);
  await saveSearchHistory();
}
async function deleteSearchEntry(q){
  searchHistory = searchHistory.filter(e => e.q !== q);
  await saveSearchHistory();
  renderSearchHistory();
}
async function clearSearchHistory(){
  searchHistory = [];
  await saveSearchHistory();
  renderSearchHistory();
}

/* Render the dropdown. Called whenever the visible state might
   have changed (focus, input, after mutation). */
function renderSearchHistory(){
  const list = document.getElementById('searchHistoryList');
  if (!list) return;
  list.innerHTML = searchHistory.map(e => `
    <li class="search-history-item" data-q="${escapeAttr(e.q)}" tabindex="0">
      <span class="search-history-q">${escapeHtml(e.q)}</span>
      <button type="button" class="search-history-x" aria-label="Remove">×</button>
    </li>
  `).join('');

  // Bind clicks + remove buttons
  list.querySelectorAll('.search-history-item').forEach(li => {
    li.addEventListener('click', (ev) => {
      // If the user clicked the small × button, remove the entry
      // and don't submit.
      if (ev.target.closest('.search-history-x')) {
        ev.stopPropagation();
        deleteSearchEntry(li.dataset.q);
        return;
      }
      const inp = document.getElementById('searchInput');
      inp.value = li.dataset.q;
      closeSearchHistory();
      submitSearch(inp.value);
    });
  });
}

/* Show / hide. Just toggle the .open class — the CSS handles
   the max-height + opacity + padding transition. No more
   [hidden] attribute, no more forced reflows, no more setTimeout
   for after-transition cleanup. */
function openSearchHistory(){
  const el = document.getElementById('searchHistory');
  if (!el) return;
  if (!searchHistory.length) return; // nothing to show
  el.classList.add('open');
}
function closeSearchHistory(){
  const el = document.getElementById('searchHistory');
  if (!el) return;
  el.classList.remove('open');
}

/* Up/Down arrow nav within the open dropdown. We track the active
   descendant via a class. */
function moveHistoryActive(delta){
  const list = document.getElementById('searchHistoryList');
  if (!list) return;
  const items = Array.from(list.querySelectorAll('.search-history-item'));
  if (!items.length) return;
  let i = items.findIndex(el => el.classList.contains('active'));
  if (i < 0) i = delta > 0 ? -1 : items.length;
  i = (i + delta + items.length) % items.length;
  items.forEach(el => el.classList.remove('active'));
  items[i].classList.add('active');
  items[i].scrollIntoView({ block: 'nearest' });
  items[i].focus();
}
function activeHistoryQ(){
  const list = document.getElementById('searchHistoryList');
  if (!list) return null;
  const active = list.querySelector('.search-history-item.active');
  return active ? active.dataset.q : null;
}

/* ── small HTML-escape helpers used in renderSearchHistory above */
function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, c => (
    { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]
  ));
}
function escapeAttr(s){ return escapeHtml(s); }



/* ══════════════════════════════════════════════════
   SETTINGS
   ══════════════════════════════════════════════════ */
function openSettings(){document.getElementById("settingsPanel").classList.add("open");document.getElementById("settingsBackdrop").classList.add("open");renderSettings()}
function closeSettings(){document.getElementById("settingsPanel").classList.remove("open");document.getElementById("settingsBackdrop").classList.remove("open")}

/* ── Methodology modal — shown when the user taps the "methodology"
     link in the AI Signal section of settings. We open a lightweight
     modal on top of the settings panel with full disclosure. */
function showMethodology(){
  let modal=document.getElementById("aiMethodologyModal");
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
            <li><strong>Text patterns</strong> (65% weight) — weighted lexicon of 30+ AI-isms ("delve into", "navigate the complexities", "in today's digital landscape", "it's important to note", etc.), plus sentence-length uniformity and em-dash density.</li>
            <li><strong>Author / byline</strong> (15% weight) — looks for named humans ("By Jane Smith") in the snippet; penalizes self-disclosure ("AI-generated").</li>
            <li><strong>Domain signals</strong> (20% weight) — URL shape (TLD, hyphen slug, date-stamped path), with a small whitelist of known human-publication outlets (NYT, Atlantic, Wired, etc.) that override the score downward.</li>
          </ul>
          <p><strong>Calibration.</strong> Three sensitivities — Low (only obvious cases, multiplier 0.55), Medium (default, 1.0), High (sensitive, 1.35). The default is conservative on purpose: false positives — accusing a real journalist of being AI — are worse than false negatives.</p>
          <p><strong>Hide-above mode.</strong> When you set a hide threshold, results meeting/exceeding that score collapse to a single hover-to-expand line. We don't delete them from the DOM (that would break SERP pagination). Hover any collapsed result to expand it for that moment.</p>
          <p><strong>Per-result dismissal.</strong> Every badge has a "✕" that hides it for that domain. Your dismissed domains persist in chrome.storage.sync and never show the badge again.</p>
          <p><strong>What it will NOT do.</strong> It will not catch lightly-edited AI text. It will not catch a human who happens to write in a corporate / listicle style. It will not give you a definitive "this is AI" answer. Anyone who tells you they can do that from a browser extension is lying.</p>
          <p class="ai-methodology-foot">Score is computed locally. No page is fetched, no data is sent off-device. The whole module adds ~15KB to the extension.</p>
        </div>
      </div>`;
    document.body.appendChild(modal);
    document.getElementById("aiMethodologyClose").addEventListener("click",()=>{
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
  document.getElementById("settingsTitle").textContent="Horizon Settings";
  document.getElementById("settingsBody").innerHTML=`
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
          <label class="settings-label" style="font-size:.7rem;opacity:.75">Hide results above <span id="aiHideVal">${state.aiHideAbove||"\\u2014"}</span>%</label>
          <div class="glass-slider-row"><span>off</span><input type="range" class="glass-slider" id="aiHideSlider" min="0" max="95" step="5" value="${state.aiHideAbove}"><span>95%</span></div>
          <p class="settings-hint" style="margin-top:.25rem">Set to 0 to never hide. Hover a hidden result to expand it.</p>
        </div>
        <p class="settings-hint" style="margin-top:.4rem">
          <strong>Heuristic, not a verdict.</strong> False positives are possible — formal human writing can get flagged. Every result can be dismissed (\u2715) per-domain. Read the
          <a href="#" id="aiHowLink" style="color:var(--accent)">methodology</a> for details.
        </p>
        <div style="margin-top:.6rem;padding-top:.5rem;border-top:1px solid var(--border)">
          <label class="settings-label" style="font-size:.7rem;opacity:.75">
            Google Safe Browsing API key
            <span id="sbKeyStatus" style="margin-left:.4rem;font-size:.65rem;opacity:.6"></span>
          </label>
          <input type="password" id="sbKeyInput" class="link-editor le-url"
                 placeholder="Paste your API key (AIza...) \u2014 optional"
                 style="width:100%;font-family:monospace;font-size:.72rem"
                 autocomplete="off" />
          <p class="settings-hint" style="margin-top:.3rem">
            Optional. When set, each search result is checked against
            <a href="https://developers.google.com/safe-browsing/v4/get-started" target="_blank" style="color:var(--accent)">Google Safe Browsing</a>
            for malware / phishing. Get a key from Google Cloud Console
            \u2192 APIs &amp; Services \u2192 Credentials. Apply API
            restrictions (Safe Browsing API only) before saving.
          </p>
        </div>
      `:""}
    </div>
    <div class="settings-group">
      <label class="settings-label">Quick Links</label>
      <div class="custom-links" id="customLinksRendered">
        ${state.links.map((l,i)=>`<div class="link-editor" data-idx="${i}"><input class="le-emoji" value="${l.emoji||"🌐"}" maxlength="2" placeholder="🌐"><input class="le-label" value="${l.label}" placeholder="Label"><input class="le-url" value="${l.url}" placeholder="https://..."><input class="le-img" value="${l.image||""}" placeholder="Img URL"><button class="link-remove" title="Remove">✕</button></div>`).join("")}
      </div>
      <button class="btn-sm" id="addLinkBtn">+ Add Link</button>
      <button class="btn-sm" id="toggleLinksBtn">${state.showLinks?"✓ Visible":"⊟ Hidden"}</button>
    </div>`;

  const ci=document.getElementById("customBgInput"),ca=document.getElementById("customAccentInput");
  if(ci&&ca){ci.addEventListener("input",()=>{state.customBg=ci.value;applyCustomTheme()});ca.addEventListener("input",()=>{state.customAccent=ca.value;applyCustomTheme()})}
  document.getElementById("glassSlider")?.addEventListener("input",e=>applyGlassOpacity(e.target.value/100));
  document.querySelectorAll("#settingsBody .theme-btn").forEach(btn=>{btn.addEventListener("click",()=>{if(state.bg)clearBg();applyTheme(btn.dataset.theme);renderSettings()})});
  document.querySelectorAll("#settingsBody .engine-btn[data-engine]").forEach(btn=>{btn.addEventListener("click",()=>{state.searchEngine=btn.dataset.engine;renderSettings();saveState();refreshUI()})});
  document.querySelectorAll("#settingsBody .engine-btn[data-ai]").forEach(btn=>{btn.addEventListener("click",()=>{state.aiProvider=btn.dataset.ai;renderSettings();saveState();refreshUI()})});
  document.querySelectorAll("#customLinksRendered .link-editor").forEach(ed=>{const idx=parseInt(ed.dataset.idx);const save=()=>{state.links[idx]={...state.links[idx],emoji:ed.querySelector(".le-emoji").value||"🌐",label:ed.querySelector(".le-label").value||"Link",url:ed.querySelector(".le-url").value||"https://example.com",image:ed.querySelector(".le-img").value||""};saveState();renderLinks()};ed.querySelector(".le-emoji")?.addEventListener("input",save);ed.querySelector(".le-label")?.addEventListener("input",save);ed.querySelector(".le-url")?.addEventListener("input",save);ed.querySelector(".le-img")?.addEventListener("input",save);ed.querySelector(".link-remove")?.addEventListener("click",()=>{state.links.splice(idx,1);saveState();renderLinks();renderSettings()})});
  document.getElementById("toggleLinksBtn")?.addEventListener("click",()=>{state.showLinks=!state.showLinks;saveState();renderLinks();renderSettings()});
  document.getElementById("addLinkBtn")?.addEventListener("click",()=>{state.links.push({id:`lc${linkId++}`,label:"New Link",url:"https://example.com",emoji:"🌐",image:""});saveState();renderLinks();renderSettings();document.getElementById("settingsPanel").scrollTop=document.getElementById("settingsPanel").scrollHeight});
  document.getElementById("uploadBgBtn")?.addEventListener("click",()=>document.getElementById("bgUpload").click());
  document.getElementById("clearBgBtn")?.addEventListener("click",()=>{clearBg();renderSettings()});

  // AI Signal settings wiring
  document.getElementById("aiSignalToggle")?.addEventListener("click",()=>{state.aiSignal=!state.aiSignal;saveState();renderSettings()});
  document.querySelectorAll("[data-aisens]").forEach(b=>b.addEventListener("click",()=>{state.aiSensitivity=b.dataset.aisens;saveState();renderSettings()}));
  document.getElementById("aiHideSlider")?.addEventListener("input",e=>{
    state.aiHideAbove=parseInt(e.target.value,10)||0;
  /* v3.1 \u2014 Google Safe Browsing API key wiring.
     The user pastes their own key here. It's stored in
     chrome.storage.sync under "hz_sb_key" (never bundled with the
     extension). When set, the background service worker uses it
     to check each search result against Safe Browsing. When unset,
     the check is skipped silently. */
  try {
    const sbInput = document.getElementById('sbKeyInput');
    const sbStatus = document.getElementById('sbKeyStatus');
    if (sbInput && sbStatus) {
      chrome.storage.sync.get(['hz_sb_key'], (r) => {
        const k = r && r.hz_sb_key;
        if (k && k.length > 10) {
          sbInput.value = k;
          sbStatus.textContent = '\u2713 key configured';
          sbStatus.style.color = 'var(--accent)';
        } else {
          sbStatus.textContent = '(not set)';
          sbStatus.style.color = 'var(--text-muted)';
        }
      });
      let sbTimer = null;
      sbInput.addEventListener('input', () => {
        clearTimeout(sbTimer);
        sbTimer = setTimeout(() => {
          const v = sbInput.value.trim();
          if (v && v.length > 10) {
            chrome.storage.sync.set({ hz_sb_key: v });
            sbStatus.textContent = '\u2713 key saved';
            sbStatus.style.color = 'var(--accent)';
          } else {
            chrome.storage.sync.remove('hz_sb_key');
            sbStatus.textContent = v ? '(too short)' : '(not set)';
            sbStatus.style.color = v ? '#dc2626' : 'var(--text-muted)';
          }
        }, 250);
      });
    }
  } catch (_) {}

    document.getElementById("aiHideVal").textContent=state.aiHideAbove||"—";
    saveState();
  });
  document.getElementById("aiHowLink")?.addEventListener("click",e=>{
    e.preventDefault();
    showMethodology();
  });
}

/* ── Upload ── */
document.getElementById("bgUpload").addEventListener("change",e=>{
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

/* ── Global keyboard shortcuts
   "/"                  focus the search bar (when no input is focused)
   Cmd/Ctrl + K         same as "/"
   Escape               cascade close: AI methodology modal ->
                        settings panel -> drawer. Each level
                        captures Escape and stops it bubbling.
   Cmd/Ctrl + ,         open settings  (chrome standard shortcut)
   Up/Down/Left/Right   navigate the drawer grid (see below) */
let _drawerReturnFocus = null;

function isTypingTarget(el){
  if (!el) return false;
  const t = el.tagName;
  return t === "INPUT" || t === "TEXTAREA" || el.isContentEditable;
}

document.addEventListener("keydown",e=>{
  // Escape always wins — cascade close
  if (e.key === "Escape") {
    const aiModal = document.getElementById("aiMethodologyModal");
    if (aiModal && aiModal.classList.contains("open")) {
      aiModal.classList.remove("open");
      e.preventDefault(); e.stopPropagation();
      return;
    }
    const sp = document.getElementById("settingsPanel");
    if (sp && sp.classList.contains("open")) {
      closeSettings();
      e.preventDefault(); e.stopPropagation();
      return;
    }
    if (isDrawerOpen()) {
      closeDrawer();
      e.preventDefault(); e.stopPropagation();
      return;
    }
  }

  // "/" focuses search — only when not already in an input
  if (e.key === "/" && !isTypingTarget(e.target)) {
    const inp = document.getElementById("searchInput");
    if (inp) {
      e.preventDefault();
      inp.focus();
      inp.select();
    }
  }

  // Cmd/Ctrl+K focuses search (sublime-style)
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
    const inp = document.getElementById("searchInput");
    if (inp) {
      e.preventDefault();
      inp.focus();
      inp.select();
    }
  }

  // Cmd/Ctrl+, opens settings (works on Windows/Linux; Mac
  // reserves Cmd+, for the system so it never reaches the page).
  if ((e.metaKey || e.ctrlKey) && (e.key === ',' || e.code === 'Comma')) {
    e.preventDefault();
    openSettings();
    return;
  }
  // '?' (shift+/) is the universal "help / settings" shortcut that
  // DOES work on Mac. Only fires when not already in an input.
  if (e.key === '?' && !isTypingTarget(e.target)) {
    e.preventDefault();
    openSettings();
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

  updateClock();setInterval(updateClock,1000);
  fetchWeather();setInterval(fetchWeather,1800000);
  renderLinks();

  /* ── Search: click row toggles drawer, focus opens it ── */
  const sec=document.getElementById("searchSection");
  const input=document.getElementById("searchInput");

  // Clicking the search row (anywhere outside input) toggles drawer
  document.querySelector(".search-row").addEventListener("click",e=>{
    if(e.target===input||input.contains(e.target)){openDrawer();return}
    toggleDrawer();
    if(isDrawerOpen())input.focus();
  });
  input.addEventListener("focus",openDrawer);
  input.addEventListener("input",tagOnInput);

  // Close drawer on outside click — ignore clicks *inside* the drawer
  document.addEventListener("click",e=>{
    if(isDrawerOpen()&&!sec.contains(e.target)){
      // Only close if not clicking inside the search-section
      closeDrawer();
    }
  });

  // Form submit
  document.getElementById("searchForm").addEventListener("submit",e=>{
    e.preventDefault();
    const v = input.value.trim();
    if (v) { recordSearch(v); closeSearchHistory(); }
    submitSearch(v);
  });

  /* v3.2 — Recent-searches wiring.
     Hydrate history synchronously first (so the initial auto-focus
     finds entries even before chrome.storage resolves), then
     start the async chrome.storage hydrate in the background. */
  searchHistory = _loadSearchHistorySync();
  renderSearchHistory();
  // Fire-and-forget: chrome.storage will overwrite + re-render if
  // it had fresher data (e.g. synced from another device).
  loadSearchHistory().then(() => renderSearchHistory());
  // If the input is already focused (autofocus), open history now.
  // The autofocus event may have fired before the focus listener
  // was registered, so we trigger the open manually here.
  setTimeout(() => {
    if (document.activeElement === input && !input.value.length && !isDrawerOpen()) {
      openSearchHistory();
    }
  }, 0);
  input.addEventListener("focus", () => {
    if (!input.value.length) openSearchHistory();
  });
  input.addEventListener("blur", () => {
    // Delay so click on a history item can fire first.
    setTimeout(() => {
      const hist = document.getElementById('searchHistory');
      if (!hist) return;
      if (!hist.contains(document.activeElement)) closeSearchHistory();
    }, 120);
  });
  input.addEventListener("input", () => {
    if (input.value.length) closeSearchHistory();
    else openSearchHistory();
  });
  document.getElementById("searchHistoryClear")?.addEventListener("click", clearSearchHistory);

  /* Arrow keys: when the input has focus and history is open,
     Up/Down move the active descendant, Enter submits it.
     We intercept BEFORE the drawer-grid handler so the input
     context wins. */
  input.addEventListener("keydown", (e) => {
    if (!document.getElementById('searchHistory')?.classList.contains('open')) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); moveHistoryActive(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); moveHistoryActive(-1); }
    else if (e.key === 'Enter') {
      const q = activeHistoryQ();
      if (q) {
        e.preventDefault();
        input.value = q;
        recordSearch(q);
        closeSearchHistory();
        submitSearch(q);
      }
    } else if (e.key === 'Escape') {
      // First Escape closes the dropdown only, leaves drawer open.
      closeSearchHistory();
      e.stopPropagation();
    }
  });

  renderDrawer();refreshUI();

  // Settings
  document.getElementById("settingsToggle").addEventListener("click",openSettings);
  document.getElementById("settingsClose").addEventListener("click",closeSettings);
  document.getElementById("settingsBackdrop").addEventListener("click",closeSettings);
})();

/* ── Arrow-key navigation in the drawer engine/AI grid.
   When the drawer is open and a drawer-btn has focus, arrow keys
   move focus to neighbours. Left/Right move within the current
   row; Up/Down move by column count. Home/End jump to ends.
   Disabled when the drawer is closed or focus is elsewhere. */
(function setupDrawerArrowNav(){
  function colCount(grid){
    const cs = grid && getComputedStyle(grid);
    if (!cs) return 1;
    const m = cs.gridTemplateColumns && cs.gridTemplateColumns.match(/repeat\((\d+)/);
    if (m) return parseInt(m[1], 10) || 1;
    if (grid.classList.contains('ai-grid')) return 4;
    const w = grid.clientWidth;
    return Math.max(1, Math.floor(w / 100));
  }
  document.addEventListener('keydown', (e) => {
    if (!isDrawerOpen()) return;
    const t = e.target;
    if (!t) return;

    // Tab bar: Left/Right (and Up/Down) switch Web Search <-> AI Chat.
    const tab = t.closest && t.closest('.drawer-tab');
    if (tab) {
      const tabs = Array.from(document.querySelectorAll('.drawer-tab'));
      let targetMode = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const i = tabs.indexOf(tab);
        targetMode = tabs[(i + 1) % tabs.length].dataset.mode;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const i = tabs.indexOf(tab);
        targetMode = (i === 0 ? tabs[tabs.length - 1] : tabs[i - 1]).dataset.mode;
      } else {
        return;
      }
      // Click the target tab so refreshUI fires (and the grid
      // below updates). After refreshUI, the old tab buttons are
      // detached, so we re-query the DOM for the matching tab
      // and focus it. Use a microtask so refreshUI completes.
      const targetTab = document.querySelector(`.drawer-tab[data-mode="${targetMode}"]`);
      if (targetTab) targetTab.click();
      requestAnimationFrame(() => {
        const fresh = document.querySelector(`.drawer-tab[data-mode="${targetMode}"]`);
        if (fresh) fresh.focus();
      });
      return;
    }

    const isInput = t.id === 'searchInput';

    // From the search input: Up reaches the tab bar; Left/Right
    // ALSO switches tabs (more discoverable than just Up).
    if (isInput) {
      if (e.key === 'ArrowUp') {
        const activeTab = document.querySelector('.drawer-tab.active')
          || document.querySelector('.drawer-tab');
        if (activeTab) {
          e.preventDefault();
          activeTab.focus();
          return;
        }
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const tabs = Array.from(document.querySelectorAll('.drawer-tab'));
        if (tabs.length) {
          e.preventDefault();
          const i = tabs.findIndex(x => x.classList.contains('active'));
          const targetMode = (e.key === 'ArrowRight'
            ? tabs[(i + 1) % tabs.length]
            : tabs[(i - 1 + tabs.length) % tabs.length]
          ).dataset.mode;
          const targetTab = document.querySelector(`.drawer-tab[data-mode="${targetMode}"]`);
          if (targetTab) targetTab.click();
          requestAnimationFrame(() => {
            const fresh = document.querySelector(`.drawer-tab[data-mode="${targetMode}"]`);
            if (fresh) fresh.focus();
          });
          return;
        }
      }
    }

    // Grid navigation: drawer-btn OR input.
    const btn = t.closest && t.closest('.drawer-btn');
    if (!isInput && !btn) return;
    const grid = (btn ? btn.closest('.drawer-grid') : document.getElementById('drawerGrid'));
    if (!grid) return;
    const btns = Array.from(grid.querySelectorAll('.drawer-btn'));
    if (!btns.length) return;
    let idx = btn ? btns.indexOf(btn) : -1;
    if (idx < 0) {
      const active = grid.querySelector('.drawer-btn.active');
      idx = active ? btns.indexOf(active) : 0;
    }
    const cols = colCount(grid);
    let next = idx;
    switch (e.key) {
      case 'ArrowRight': next = (idx + 1) % btns.length; break;
      case 'ArrowLeft':  next = (idx - 1 + btns.length) % btns.length; break;
      case 'ArrowDown':  next = Math.min(btns.length - 1, idx + cols); break;
      case 'ArrowUp':    next = Math.max(0, idx - cols); break;
      case 'Home':       next = 0; break;
      case 'End':        next = btns.length - 1; break;
      default: return;
    }
    e.preventDefault();
    btns[next].focus();
  });
})();
