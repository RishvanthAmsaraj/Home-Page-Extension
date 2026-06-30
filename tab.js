/* ════════════════════════════════════════════════
   Horizon Tab v1.5
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

const DL=[
  {id:"l1",label:"ChatGPT",url:"https://chatgpt.com",emoji:"🤖",image:""},
  {id:"l2",label:"GitHub",url:"https://github.com",emoji:"💻",image:""},
  {id:"l3",label:"Calendar",url:"https://calendar.google.com",emoji:"📅",image:""},
  {id:"l4",label:"Mail",url:"https://mail.google.com",emoji:"📧",image:""},
  {id:"l5",label:"Canvas",url:"https://canvas.psu.edu",emoji:"📚",image:""},
  {id:"l6",label:"OpenClaw",url:"https://openclaw.ai",emoji:"⚡",image:""}
];

const DS={theme:"slate",searchEngine:"google",links:DL,glassOpacity:0.04};
let state={...DS},linkId=100;

/* ── Storage ── */
async function loadState(){
  try{
    const s=await chrome.storage.sync.get(["hz"]);
    if(s.hz)state={...DS,...s.hz,links:s.hz.links||DL};
  }catch{
    try{const s=localStorage.getItem("hz");if(s)state={...DS,...JSON.parse(s)}}catch{}
  }
}
function saveState(){
  const o={theme:state.theme,searchEngine:state.searchEngine,links:state.links,bg:state.bg,glassOpacity:state.glassOpacity};
  try{chrome.storage.sync.set({hz:o})}catch{try{localStorage.setItem("hz",JSON.stringify(o))}catch{}}
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

/* ── Glass intensity ── */
function applyGlassOpacity(val){
  state.glassOpacity=parseFloat(val);
  document.documentElement.style.setProperty("--surface-opacity",String(state.glassOpacity));
  saveState();
}

/* ── Theme ── */
function applyTheme(theme){
  state.theme=theme;
  const el=document.documentElement;
  if(theme==="modern"&&!state.bg){swModern();return}
  el.setAttribute("data-theme",theme);el.classList.remove("has-bg");
  saveState();
}
function swModern(){
  document.documentElement.setAttribute("data-theme",new Date().getHours()>=6&&new Date().getHours()<20?"modern-day":"modern");
}

/* ── Background ── */
function analyze(img){
  const c=document.createElement("canvas");c.width=1;c.height=1;
  const ctx=c.getContext("2d");ctx.drawImage(img,0,0,1,1);
  const [r,g,b]=ctx.getImageData(0,0,1,1).data;
  return(0.299*r+0.587*g+0.114*b)/255;
}
function applyBg(data){
  if(!data){clearBg();return}
  const img=new Image();
  img.onload=()=>{
    const lum=analyze(img),dark=lum<=0.5;
    const ov=dark?Math.min(.55,.35+lum*.4):Math.min(.60,.80-lum*.3);
    const oc=dark?`rgba(0,0,0,${ov.toFixed(2)})`:`rgba(255,255,255,${ov.toFixed(2)})`;
    const el=document.getElementById("bgLayer");
    el.style.setProperty("--user-bg",`url(${data})`);
    el.style.setProperty("--overlay-c",oc);
    el.classList.add("has-image");
    document.getElementById("glassOrb").style.display="none";
    const root=document.documentElement;
    root.setAttribute("data-theme",dark?"darkbg":"lightbg");
    root.classList.add("has-bg");
    state.bg=data;saveState();
  };
  img.onerror=clearBg;
  img.src=data;
}
function clearBg(){
  const el=document.getElementById("bgLayer");
  el.classList.remove("has-image");el.style.removeProperty("--user-bg");el.style.removeProperty("--overlay-c");
  document.getElementById("glassOrb").style.display="";
  const root=document.documentElement;root.classList.remove("has-bg");
  const t=state.theme||"slate";
  if(t==="modern"){swModern()}else{root.setAttribute("data-theme",t)}
}

/* ── Links ── */
function renderLinks(){
  document.getElementById("links").innerHTML=state.links.map(l=>
    `<a href="${l.url}" class="link-item" title="${l.url}">
      <span class="link-icon">${l.image?`<img src="${l.image}" alt="" loading="lazy">`:l.emoji||"🌐"}</span>
      <span class="link-label">${l.label}</span>
    </a>`
  ).join("");
}

/* ── Settings ── */
function openSettings(){
  document.getElementById("settingsPanel").classList.add("open");
  document.getElementById("settingsBackdrop").classList.add("open");
  renderSettings();
}
function closeSettings(){
  document.getElementById("settingsPanel").classList.remove("open");
  document.getElementById("settingsBackdrop").classList.remove("open");
}
function renderSettings(){
  const gi=Math.round((state.glassOpacity||0.04)*100);
  document.getElementById("settingsTitle").textContent="Horizon Settings";
  document.getElementById("settingsBody").innerHTML=`
    <div class="settings-group">
      <label class="settings-label">Theme</label>
      <div class="theme-grid">
        <button class="theme-btn${state.theme==="slate"?" active":""}" data-theme="slate">
          <span class="theme-swatch" style="background:#0d0d0d;border:1px solid #444"></span>Slate
        </button>
        <button class="theme-btn${state.theme==="ivory"?" active":""}" data-theme="ivory">
          <span class="theme-swatch" style="background:#f3f1ed;border:1px solid #ccc"></span>Ivory
        </button>
        <button class="theme-btn${state.theme==="navy"?" active":""}" data-theme="navy">
          <span class="theme-swatch" style="background:#001E44"></span>Navy
        </button>
        <button class="theme-btn${state.theme==="modern"?" active":""}" data-theme="modern">
          <span class="theme-swatch" style="background:linear-gradient(135deg,#0d0d0d 50%,#f8f6f0 50%);border:1px solid #666"></span>Modern
        </button>
      </div>
    </div>

    <div class="settings-group">
      <label class="settings-label">Background</label>
      <p class="settings-hint">Upload your own image.</p>
      <div style="display:flex;gap:0.4rem">
        <button class="upload-btn" id="uploadBgBtn">🖼️ Upload Image</button>
        ${state.bg?'<button class="upload-btn" id="clearBgBtn">✖ Clear</button>':''}
      </div>
    </div>

    <div class="settings-group">
      <label class="settings-label">Glass Intensity</label>
      <p class="settings-hint">Controls surface transparency for weather, search, and links.</p>
      <div class="glass-slider-row">
        <span>◻</span>
        <input type="range" class="glass-slider" id="glassSlider" min="0" max="15" value="${gi}">
        <span>◼</span>
      </div>
    </div>

    <div class="settings-group">
      <label class="settings-label">Search Engine</label>
      <div class="theme-grid">
        ${Object.keys(SE).map(k=>
          `<button class="engine-btn${state.searchEngine===k?" active":""}" data-engine="${k}">${k.charAt(0).toUpperCase()+k.slice(1)}</button>`
        ).join("")}
      </div>
    </div>

    <div class="settings-group">
      <label class="settings-label">Quick Links</label>
      <p class="settings-hint">Name, URL, emoji or image URL.</p>
      <div class="custom-links" id="customLinksRendered">
        ${state.links.map((l,i)=>`
          <div class="link-editor" data-idx="${i}">
            <input class="le-emoji" value="${l.emoji||"🌐"}" maxlength="2" placeholder="🌐">
            <input class="le-label" value="${l.label}" placeholder="Label">
            <input class="le-url" value="${l.url}" placeholder="https://...">
            <input class="le-img" value="${l.image||""}" placeholder="Img URL">
            <button class="link-remove" title="Remove">✕</button>
          </div>
        `).join("")}
      </div>
      <button class="btn-sm" id="addLinkBtn">+ Add Link</button>
    </div>
  `;

  // Glass slider
  document.getElementById("glassSlider")?.addEventListener("input",e=>{
    applyGlassOpacity(e.target.value/100);
  });

  // Theme
  document.querySelectorAll("#settingsBody .theme-btn").forEach(btn=>{
    btn.addEventListener("click",()=>{
      if(state.bg)clearBg();
      applyTheme(btn.dataset.theme);
      renderSettings();
    });
  });

  // Engine
  document.querySelectorAll("#settingsBody .engine-btn").forEach(btn=>{
    btn.addEventListener("click",()=>{
      state.searchEngine=btn.dataset.engine;
      renderSettings();saveState();
    });
  });

  // Links
  document.querySelectorAll("#customLinksRendered .link-editor").forEach(ed=>{
    const idx=parseInt(ed.dataset.idx);
    const save=()=>{
      state.links[idx]={...state.links[idx],
        emoji:ed.querySelector(".le-emoji").value||"🌐",
        label:ed.querySelector(".le-label").value||"Link",
        url:ed.querySelector(".le-url").value||"https://example.com",
        image:ed.querySelector(".le-img").value||""
      };
      saveState();renderLinks();
    };
    ed.querySelector(".le-emoji").addEventListener("input",save);
    ed.querySelector(".le-label").addEventListener("input",save);
    ed.querySelector(".le-url").addEventListener("input",save);
    ed.querySelector(".le-img").addEventListener("input",save);
    ed.querySelector(".link-remove").addEventListener("click",()=>{
      state.links.splice(idx,1);saveState();renderLinks();renderSettings();
    });
  });

  document.getElementById("addLinkBtn")?.addEventListener("click",()=>{
    state.links.push({id:`lc${linkId++}`,label:"New Link",url:"https://example.com",emoji:"🌐",image:""});
    saveState();renderLinks();renderSettings();
    document.getElementById("settingsPanel").scrollTop=document.getElementById("settingsPanel").scrollHeight;
  });

  document.getElementById("uploadBgBtn")?.addEventListener("click",()=>document.getElementById("bgUpload").click());
  document.getElementById("clearBgBtn")?.addEventListener("click",()=>{clearBg();renderSettings();});
}

/* ── Upload ── */
document.getElementById("bgUpload").addEventListener("change",e=>{
  const f=e.target.files[0];if(!f)return;
  const r=new FileReader();
  r.onload=()=>{
    const img=new Image();
    img.onload=()=>{
      let q=.85,w=img.width,h=img.height;
      const MD=1920;
      if(w>MD||h>MD){const R=Math.min(MD/w,MD/h);w=Math.round(w*R);h=Math.round(h*R)}
      const c=document.createElement("canvas");c.width=w;c.height=h;
      c.getContext("2d").drawImage(img,0,0,w,h);
      const comp=qu=>{const d=c.toDataURL("image/jpeg",qu);return d.length*.75>100*1024&&qu>.1?comp(qu-.1):d};
      applyBg(comp(q));renderSettings();
    };
    img.onerror=()=>{};
    img.src=r.result;
  };
  r.readAsDataURL(f);
  e.target.value="";
});

document.addEventListener("keydown",e=>{
  if(e.key==="Escape"&&document.getElementById("settingsPanel").classList.contains("open"))closeSettings();
});

(async function boot(){
  await loadState();

  // Apply stored glass opacity
  if(state.glassOpacity)document.documentElement.style.setProperty("--surface-opacity",String(state.glassOpacity));

  if(state.bg)applyBg(state.bg);
  else applyTheme(state.theme||"slate");

  updateClock();setInterval(updateClock,1000);
  fetchWeather();setInterval(fetchWeather,1800000);
  renderLinks();

  document.getElementById("searchForm").addEventListener("submit",e=>{
    e.preventDefault();
    const q=document.getElementById("searchInput").value.trim();if(!q)return;
    const h=q.includes(".")&&!q.includes(" "),u=h&&(q.startsWith("http://")||q.startsWith("https://")||q.startsWith("localhost"));
    window.location.href=u?(q.startsWith("http")?q:`https://${q}`):(SE[state.searchEngine]||SE.google)+encodeURIComponent(q);
  });

  document.getElementById("settingsToggle").addEventListener("click",openSettings);
  document.getElementById("settingsClose").addEventListener("click",closeSettings);
  document.getElementById("settingsBackdrop").addEventListener("click",closeSettings);
})();
