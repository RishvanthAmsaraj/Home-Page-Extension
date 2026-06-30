/* ════════════════════════════════════════════════
   Horizon Tab v1.2.1 — Settings & Customization
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

const DS={theme:"black",searchEngine:"google",links:DL};
let state={...DS},linkId=100;

// ── Storage ──
async function loadState(){
  try{
    const s=await chrome.storage.sync.get(["hz"]);
    if(s.hz)state={...DS,...s.hz,links:s.hz.links||DL};
  }catch{
    try{const s=localStorage.getItem("hz");if(s)state={...DS,...JSON.parse(s)}}catch{}
  }
}
async function saveState(){
  const o={theme:state.theme,searchEngine:state.searchEngine,links:state.links,bg:state.bg};
  try{await chrome.storage.sync.set({hz:o})}catch{try{localStorage.setItem("hz",JSON.stringify(o))}catch{}}
}

// ── Clock ──
function getGreeting(){
  const h=new Date().getHours();
  return h<12?"good morning":h<17?"good afternoon":h<21?"good evening":"good night";
}
function updateClock(){
  const n=new Date(),h=n.getHours(),m=String(n.getMinutes()).padStart(2,"0");
  document.getElementById("time").textContent=`${h%12||12}:${m} ${h>=12?"PM":"AM"}`;
  document.getElementById("greeting").textContent=getGreeting();
  document.getElementById("date").textContent=n.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});
}

// ── Weather ──
async function fetchWeather(){
  try{
    const p=await(await fetch(`https://api.weather.gov/points/${LAT},${LON}`)).json();
    const f=await(await fetch(p.properties.forecast)).json(),ps=f.properties.periods;
    const c=ps[0],nxt=ps[1],t=c.temperature,d=c.isDaytime;
    let hi=nxt&&nxt.isDaytime?nxt.temperature:t,lo=nxt&&!nxt.isDaytime?nxt.temperature:t;
    if(!d){lo=t;const td=ps[2]&&ps[2].isDaytime?ps[2]:null;hi=td?td.temperature:nxt?nxt.temperature:t}
    document.getElementById("weatherIcon").textContent=weatherEmoji(c.shortForecast,d);
    document.getElementById("weatherTemp").textContent=`${t}°`;
    document.getElementById("weatherDesc").textContent=c.shortForecast;
    document.getElementById("weatherHiLo").textContent=`H ${hi}° L ${lo}°`;
  }catch{document.getElementById("weatherDesc").textContent="unavailable"}
}
function weatherEmoji(f,d){
  const F=f.toLowerCase();
  if(F.includes("sunny")||F.includes("clear"))return d?"☀️":"🌙";
  if(F.includes("cloudy")||F.includes("overcast"))return"☁️";
  if(F.includes("partly"))return d?"⛅":"🌙";
  if(F.includes("rain")||F.includes("shower")||F.includes("drizzle"))return"🌧️";
  if(F.includes("thunder")||F.includes("storm"))return"⛈️";
  if(F.includes("snow")||F.includes("flurr")||F.includes("blizzard"))return"❄️";
  if(F.includes("fog")||F.includes("mist")||F.includes("haze"))return"🌫️";
  if(F.includes("wind")||F.includes("breez"))return"💨";
  return d?"☀️":"🌙";
}

// ── Links render ──
function renderLinks(){
  document.getElementById("links").innerHTML=state.links.map(l=>
    `<a href="${l.url}" class="link-item" title="${l.url}">
      <span class="link-icon">${l.image?`<img src="${l.image}" alt="" loading="lazy">`:l.emoji||"🌐"}</span>
      <span class="link-label">${l.label}</span>
    </a>`
  ).join("");
}

// ── Background ──
function applyBg(bgData){
  state.bg=bgData;saveState();
  const bl=document.getElementById("bgLayer"),go=document.getElementById("glassOrb");
  if(bgData){
    bl.style.setProperty("--user-bg",`url(${bgData})`);
    bl.style.setProperty("--user-overlay","rgba(0,0,0,0.55)");
    bl.classList.add("has-image");
    go.style.display="none";
  }else{
    bl.classList.remove("has-image");
    bl.style.removeProperty("--user-bg");
    bl.style.removeProperty("--user-overlay");
    go.style.display="";
  }
}

// ── Settings panel ──
function openSettings(){
  document.getElementById("settingsPanel").classList.add("open");
  document.getElementById("settingsBackdrop").classList.add("open");
  renderSettings();
}
function closeSettings(){
  document.getElementById("settingsPanel").classList.remove("open");
  document.getElementById("settingsBackdrop").classList.remove("open");
}

// ── Settings content render ──
function renderSettings(){
  const b=state.bg;
  document.getElementById("settingsBody").innerHTML=`
    <div class="settings-group">
      <label class="settings-label">Theme</label>
      <div class="theme-grid">
        <button class="theme-btn${state.theme==="black"?" active":""}" data-theme="black">
          <span class="theme-swatch" style="background:#0a0a0a;border:1px solid #333"></span>Black
        </button>
        <button class="theme-btn${state.theme==="white"?" active":""}" data-theme="white">
          <span class="theme-swatch" style="background:#f5f5f0;border:1px solid #ccc"></span>White
        </button>
        <button class="theme-btn${state.theme==="navy"?" active":""}" data-theme="navy">
          <span class="theme-swatch" style="background:#001E44"></span>Navy
        </button>
        <button class="theme-btn${state.theme==="amber"?" active":""}" data-theme="amber">
          <span class="theme-swatch" style="background:#ff6200;border:1px solid rgba(255,255,255,0.3)"></span>Amber
        </button>
      </div>
    </div>

    <div class="settings-group">
      <label class="settings-label">Background</label>
      <p class="settings-hint">Upload your own image, or clear to use theme gradients.</p>
      <div style="display:flex;gap:0.4rem">
        <button class="upload-btn" id="uploadBgBtn">🖼️ Upload Image</button>
        ${b?'<button class="upload-btn" id="clearBgBtn">✖ Clear</button>':''}
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

  // Theme buttons
  document.querySelectorAll("#settingsBody .theme-btn").forEach(btn=>{
    btn.addEventListener("click",()=>{
      state.theme=btn.dataset.theme;
      document.documentElement.setAttribute("data-theme",state.theme);
      renderSettings();
      saveState();
    });
  });

  // Search engine buttons
  document.querySelectorAll("#settingsBody .engine-btn").forEach(btn=>{
    btn.addEventListener("click",()=>{
      state.searchEngine=btn.dataset.engine;
      renderSettings();
      saveState();
    });
  });

  // Link editors
  document.querySelectorAll("#customLinksRendered .link-editor").forEach(ed=>{
    const idx=parseInt(ed.dataset.idx);
    const save=()=>{
      state.links[idx]={
        ...state.links[idx],
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

  // Add link
  document.getElementById("addLinkBtn")?.addEventListener("click",()=>{
    state.links.push({id:`lc${linkId++}`,label:"New Link",url:"https://example.com",emoji:"🌐",image:""});
    saveState();renderLinks();renderSettings();
    document.getElementById("settingsPanel").scrollTop=document.getElementById("settingsPanel").scrollHeight;
  });

  // Upload background
  document.getElementById("uploadBgBtn")?.addEventListener("click",()=>document.getElementById("bgUpload").click());
  // Clear background
  document.getElementById("clearBgBtn")?.addEventListener("click",()=>{applyBg(null);renderSettings();});
}

// ── Boot ──
(async function boot(){
  await loadState();

  // Apply theme
  document.documentElement.setAttribute("data-theme",state.theme);

  // Restore background
  if(state.bg)applyBg(state.bg);

  // Clock
  updateClock();
  setInterval(updateClock,1000);

  // Weather
  fetchWeather();
  setInterval(fetchWeather,1800000);

  // Quick links
  renderLinks();

  // Search form
  document.getElementById("searchForm").addEventListener("submit",e=>{
    e.preventDefault();
    const q=document.getElementById("searchInput").value.trim();if(!q)return;
    const hasDot=q.includes(".")&&!q.includes(" ");
    const isUrl=hasDot&&(q.startsWith("http://")||q.startsWith("https://")||q.startsWith("localhost"));
    if(isUrl)window.location.href=q.startsWith("http")?q:`https://${q}`;
    else window.location.href=(SE[state.searchEngine]||SE.google)+encodeURIComponent(q);
  });

  // Settings toggle
  document.getElementById("settingsToggle").addEventListener("click",openSettings);
  document.getElementById("settingsClose").addEventListener("click",closeSettings);
  document.getElementById("settingsBackdrop").addEventListener("click",closeSettings);

  // Background file upload
  document.getElementById("bgUpload").addEventListener("change",e=>{
    const f=e.target.files[0];if(!f)return;
    const r=new FileReader();
    r.onload=()=>{applyBg(r.result)};
    r.readAsDataURL(f);
    e.target.value="";
  });

  // Keyboard
  document.addEventListener("keydown",e=>{
    if(e.key==="Escape"&&document.getElementById("settingsPanel").classList.contains("open"))closeSettings();
  });
})();
