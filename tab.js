/* ════════════════════════════════════════════════
   Horizon Tab v2.0 — Expandable search drawer
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

const DS={
  theme:"slate",searchEngine:"google",aiProvider:"perplexity",
  links:DL,glassOpacity:0.04,searchType:"all",
  customBg:"#0d0d0d",customAccent:"#7a8a9a",customLight:false,aiFreeOn:false
};
let state={...DS},linkId=100;

/* ── Storage ── */
const SYS="hz",BG_KEY="***";

async function loadState(){
  try{
    const s=await chrome.storage.sync.get([SYS]);
    if(s[SYS])state={...DS,...s[SYS],links:s[SYS].links||DL};
  }catch{try{const s=localStorage.getItem(SYS);if(s)state={...DS,...JSON.parse(s),links:JSON.parse(s).links||DL}}catch{}}
  try{
    const b=await chrome.storage.local.get([BG_KEY]);
    if(b[BG_KEY])state.bg=b[BG_KEY];
  }catch{try{const b=localStorage.getItem(BG_KEY);if(b)state.bg=b}catch{}}
}
function saveState(){
  const o={theme:state.theme,searchEngine:state.searchEngine,aiProvider:state.aiProvider,
    links:state.links,glassOpacity:state.glassOpacity,searchType:state.searchType,
    customBg:state.customBg,customAccent:state.customAccent,customLight:state.customLight,aiFreeOn:state.aiFreeOn};
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
  document.getElementById("links").innerHTML=state.links.map(l=>`<a href="${l.url}" class="link-item" title="${l.url}"><span class="link-icon">${l.image?`<img src="${l.image}" alt="" loading="lazy">`:l.emoji||"🌐"}</span><span class="link-label">${l.label}</span></a>`).join("");
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

/* ── Tag + drawer open/close ── */
function updateModeTag(){
  const tag=document.getElementById("modeTag");
  if(tag)tag.textContent=currentIcon()+" "+currentLabel();
}
function tagOnInput(){
  const i=document.getElementById("searchInput");
  document.getElementById("modeTag").classList.toggle("hidden",i.value.length>0);
}

function isDrawerOpen(){return document.getElementById("searchSection").classList.contains("open")}
function openDrawer(){document.getElementById("searchSection").classList.add("open")}
function closeDrawer(){document.getElementById("searchSection").classList.remove("open")}
function toggleDrawer(){isDrawerOpen()?closeDrawer():openDrawer()}

/* ── Render drawer buttons ── */
function renderDrawer(){
  // Web engines
  document.getElementById("drawerWeb").innerHTML=Object.keys(SE).map(k=>{
    const act=!isAI()&&state.searchEngine===k;
    return `<button class="drawer-btn${act?" active":""}" data-kind="web" data-key="${k}"><span class="db-icon">🌐</span><span class="db-name">${k.charAt(0).toUpperCase()+k.slice(1)}</span><span class="db-tag">web</span></button>`;
  }).join("");
  // AI providers
  document.getElementById("drawerAI").innerHTML=AI_ORDER.map(k=>{
    const act=isAI()&&state.aiProvider===k;
    const auto=AI_AUTO.has(k);const tag=auto?"→ auto":"✎ prefill";
    return `<button class="drawer-btn${act?" active":""}" data-kind="ai" data-key="${k}"><span class="db-icon">🤖</span><span class="db-name">${AI_L[k]}</span><span class="db-tag">${tag}</span></button>`;
  }).join("");

  document.querySelectorAll(".drawer-btn").forEach(btn=>{
    btn.addEventListener("click",e=>{
      e.stopPropagation();
      const kind=btn.dataset.kind,key=btn.dataset.key;
      if(kind==="web"){state.searchEngine=key;state.searchType="all";}
      else{state.aiProvider=key;state.searchType="ai";}
      refreshUI();
      // Don't close drawer — user may want to switch again
    });
  });
}

/* ── Filter bar ── */
function renderFilterBar(){
  const bar=document.getElementById("filterBar");
  if(isAI()){
    bar.classList.remove("visible");
    const hint=document.getElementById("aiModeHint");
    const ap=state.aiProvider;const auto=AI_AUTO.has(ap);
    hint.textContent=auto?"Opens directly to your query results":"Prefills the chat input — press Enter to send";
    hint.style.display="";
    return;
  }
  const hint=document.getElementById("aiModeHint");hint.style.display="none";
  bar.classList.add("visible");
  bar.innerHTML=Object.keys(TYPE_PARAMS).map(k=>`<button class="filter-chip${state.searchType===k?" active":""}" data-filter="${k}">${TYPE_L[k]}</button>`).join("")+
    `<button class="filter-chip aifree${state.aiFreeOn?" active":""}" id="aiFreeChip">AI-Free</button>`;
  bar.querySelectorAll(".filter-chip[data-filter]").forEach(chip=>{
    chip.addEventListener("click",()=>{state.searchType=chip.dataset.filter;renderFilterBar();saveState();updatePlaceholder()});
  });
  document.getElementById("aiFreeChip")?.addEventListener("click",()=>{state.aiFreeOn=!state.aiFreeOn;renderFilterBar();saveState();updatePlaceholder()});
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

/* ══════════════════════════════════════════════════
   SETTINGS
   ══════════════════════════════════════════════════ */
function openSettings(){document.getElementById("settingsPanel").classList.add("open");document.getElementById("settingsBackdrop").classList.add("open");renderSettings()}
function closeSettings(){document.getElementById("settingsPanel").classList.remove("open");document.getElementById("settingsBackdrop").classList.remove("open")}
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
      <label class="settings-label">Quick Links</label>
      <div class="custom-links" id="customLinksRendered">
        ${state.links.map((l,i)=>`<div class="link-editor" data-idx="${i}"><input class="le-emoji" value="${l.emoji||"🌐"}" maxlength="2" placeholder="🌐"><input class="le-label" value="${l.label}" placeholder="Label"><input class="le-url" value="${l.url}" placeholder="https://..."><input class="le-img" value="${l.image||""}" placeholder="Img URL"><button class="link-remove" title="Remove">✕</button></div>`).join("")}
      </div>
      <button class="btn-sm" id="addLinkBtn">+ Add Link</button>
    </div>`;

  const ci=document.getElementById("customBgInput"),ca=document.getElementById("customAccentInput");
  if(ci&&ca){ci.addEventListener("input",()=>{state.customBg=ci.value;applyCustomTheme()});ca.addEventListener("input",()=>{state.customAccent=ca.value;applyCustomTheme()})}
  document.getElementById("glassSlider")?.addEventListener("input",e=>applyGlassOpacity(e.target.value/100));
  document.querySelectorAll("#settingsBody .theme-btn").forEach(btn=>{btn.addEventListener("click",()=>{if(state.bg)clearBg();applyTheme(btn.dataset.theme);renderSettings()})});
  document.querySelectorAll("#settingsBody .engine-btn[data-engine]").forEach(btn=>{btn.addEventListener("click",()=>{state.searchEngine=btn.dataset.engine;renderSettings();saveState();refreshUI()})});
  document.querySelectorAll("#settingsBody .engine-btn[data-ai]").forEach(btn=>{btn.addEventListener("click",()=>{state.aiProvider=btn.dataset.ai;renderSettings();saveState();refreshUI()})});
  document.querySelectorAll("#customLinksRendered .link-editor").forEach(ed=>{const idx=parseInt(ed.dataset.idx);const save=()=>{state.links[idx]={...state.links[idx],emoji:ed.querySelector(".le-emoji").value||"🌐",label:ed.querySelector(".le-label").value||"Link",url:ed.querySelector(".le-url").value||"https://example.com",image:ed.querySelector(".le-img").value||""};saveState();renderLinks()};ed.querySelector(".le-emoji")?.addEventListener("input",save);ed.querySelector(".le-label")?.addEventListener("input",save);ed.querySelector(".le-url")?.addEventListener("input",save);ed.querySelector(".le-img")?.addEventListener("input",save);ed.querySelector(".link-remove")?.addEventListener("click",()=>{state.links.splice(idx,1);saveState();renderLinks();renderSettings()})});
  document.getElementById("addLinkBtn")?.addEventListener("click",()=>{state.links.push({id:`lc${linkId++}`,label:"New Link",url:"https://example.com",emoji:"🌐",image:""});saveState();renderLinks();renderSettings();document.getElementById("settingsPanel").scrollTop=document.getElementById("settingsPanel").scrollHeight});
  document.getElementById("uploadBgBtn")?.addEventListener("click",()=>document.getElementById("bgUpload").click());
  document.getElementById("clearBgBtn")?.addEventListener("click",()=>{clearBg();renderSettings()});
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

document.addEventListener("keydown",e=>{
  if(e.key==="Escape"&&document.getElementById("settingsPanel").classList.contains("open"))closeSettings();
  if(e.key==="Escape"&&isDrawerOpen())closeDrawer();
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

  // Close drawer on outside click
  document.addEventListener("click",e=>{
    if(isDrawerOpen()&&!sec.contains(e.target))closeDrawer();
  });

  // Form submit
  document.getElementById("searchForm").addEventListener("submit",e=>{e.preventDefault();submitSearch(input.value.trim())});

  renderDrawer();refreshUI();

  // Settings
  document.getElementById("settingsToggle").addEventListener("click",openSettings);
  document.getElementById("settingsClose").addEventListener("click",closeSettings);
  document.getElementById("settingsBackdrop").addEventListener("click",closeSettings);
})();
