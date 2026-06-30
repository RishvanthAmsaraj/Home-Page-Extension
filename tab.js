/* ════════════════════════════════════════════════
   Horizon Tab v1.3
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

/* ── Storage ── */
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

/* ── Clock ── */
function getGreeting(){
  return["good morning","good afternoon","good evening","good night"][Math.min(Math.floor(new Date().getHours()/6),3)];
}
function updateClock(){
  const n=new Date();
  document.getElementById("time").textContent=`${n.getHours()%12||12}:${String(n.getMinutes()).padStart(2,"0")} ${n.getHours()>=12?"PM":"AM"}`;
  document.getElementById("greeting").textContent=getGreeting();
  document.getElementById("date").textContent=n.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});
}

/* ── Weather ── */
async function fetchWeather(){
  try{
    const p=await(await fetch(`https://api.weather.gov/points/${LAT},${LON}`)).json();
    const f=await(await fetch(p.properties.forecast)).json(),ps=f.properties.periods;
    const c=ps[0],nxt=ps[1],t=c.temperature,d=c.isDaytime;
    let hi=nxt&&nxt.isDaytime?nxt.temperature:t,lo=nxt&&!nxt.isDaytime?nxt.temperature:t;
    if(!d){lo=t;const td=ps[2]&&ps[2].isDaytime?ps[2]:null;hi=td?td.temperature:nxt?nxt.temperature:t}
    document.getElementById("weatherIcon").textContent=we(c.shortForecast,d);
    document.getElementById("weatherTemp").textContent=`${t}°`;
    document.getElementById("weatherDesc").textContent=c.shortForecast;
    document.getElementById("weatherHiLo").textContent=`H ${hi}° L ${lo}°`;
  }catch{document.getElementById("weatherDesc").textContent="unavailable"}
}
function we(f,d){
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

/* ── Theme application ── */
function applyTheme(theme){
  state.theme=theme;
  document.documentElement.setAttribute("data-theme",theme);
  saveState();
  // Update Modern mode's day/night watcher
  if(theme==="modern")scheduleModernSwitch();
}

function scheduleModernSwitch(){
  // Use isDaytime from weather or sun calc
  const h=new Date().getHours();
  const isDay=h>=6&&h<20; // rough 6am-8pm
  document.documentElement.setAttribute("data-theme",isDay?"modern-day":"modern");
}

/* ─── Background brightness analysis and overlay ─── */
function getOverlayFromImage(img){
  // Sample a 1x1 of the image to estimate brightness
  const c=document.createElement("canvas");
  c.width=1;c.height=1;
  const ctx=c.getContext("2d");
  ctx.drawImage(img,0,0,1,1);
  const [r,g,b]=ctx.getImageData(0,0,1,1).data;
  // Relative luminance: 0.299R + 0.587G + 0.114B
  const lum=(0.299*r+0.587*g+0.114*b)/255;
  return lum>0.5
    ? {overlay:"rgba(255,255,255,0.65)",textTheme:"lightbg"}
    : {overlay:"rgba(0,0,0,0.55)",textTheme:"darkbg"};
}

function applyBg(bgData){
  if(!bgData){clearBg();return}
  const img=new Image();
  img.onload=()=>{
    const {overlay,textTheme}=getOverlayFromImage(img);
    const el=document.getElementById("bgLayer");
    el.style.setProperty("--user-bg",`url(${bgData})`);
    el.style.setProperty("--overlay-c",overlay);
    el.classList.add("has-image");
    document.getElementById("glassOrb").style.display="none";
    document.documentElement.setAttribute("data-theme",textTheme);
    state.bg=bgData;
    saveState();
  };
  img.onerror=()=>{clearBg()};
  img.src=bgData;
}
function clearBg(){
  const el=document.getElementById("bgLayer");
  el.classList.remove("has-image");
  el.style.removeProperty("--user-bg");
  el.style.removeProperty("--overlay-c");
  document.getElementById("glassOrb").style.display="";
  // Revert to saved theme
  applyTheme(state.theme||"black");
}

/* ── Links render ── */
function renderLinks(){
  document.getElementById("links").innerHTML=state.links.map(l=>
    `<a href="${l.url}" class="link-item" title="${l.url}">
      <span class="link-icon">${l.image?`<img src="${l.image}" alt="" loading="lazy">`:l.emoji||"🌐"}</span>
      <span class="link-label">${l.label}</span>
    </a>`
  ).join("");
}

/* ── Settings panel ── */
function openSettings(){
  document.getElementById("settingsPanel").classList.add("open");
  document.getElementById("settingsBackdrop").classList.add("open");
  renderSettings();
}
function closeSettings(){
  document.getElementById("settingsPanel").classList.remove("open");
  document.getElementById("settingsBackdrop").classList.remove("open");
}

const THUMB_MAX_BYTES=100*1024; // 100KB — chrome.storage.sync limit

function renderSettings(){
  const b=state.bg;
  document.getElementById("settingsTitle").textContent="Horizon Settings";
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
        <button class="theme-btn${state.theme==="modern"?" active":""}" data-theme="modern">
          <span class="theme-swatch" style="background:linear-gradient(135deg,#0a0a0a 50%,#f8f6f0 50%);border:1px solid #666"></span>Modern
        </button>
      </div>
    </div>

    <div class="settings-group">
      <label class="settings-label">Background</label>
      <p class="settings-hint" id="bgHint">Upload your own image. Large files will be compressed to 100 KB.</p>
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
      applyTheme(btn.dataset.theme);
      // If we had a custom bg, clear it
      if(state.bg)clearBg();
      renderSettings();
    });
  });

  // Search engine buttons
  document.querySelectorAll("#settingsBody .engine-btn").forEach(btn=>{
    btn.addEventListener("click",()=>{
      state.searchEngine=btn.dataset.engine;
      renderSettings();saveState();
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

  // Upload / Clear
  document.getElementById("uploadBgBtn")?.addEventListener("click",()=>document.getElementById("bgUpload").click());
  document.getElementById("clearBgBtn")?.addEventListener("click",()=>{clearBg();renderSettings();});
}

/* ── Background upload with compression ── */
document.getElementById("bgUpload").addEventListener("change",e=>{
  const f=e.target.files[0];if(!f)return;
  const r=new FileReader();
  r.onload=()=>{
    const img=new Image();
    img.onload=()=>{
      // Compress to fit in chrome.storage.sync (100KB per item)
      let quality=0.85,w=img.width,h=img.height;
      const MAX_DIM=1920;
      if(w>MAX_DIM||h>MAX_DIM){
        const ratio=Math.min(MAX_DIM/w,MAX_DIM/h);
        w=Math.round(w*ratio);h=Math.round(h*ratio);
      }
      const c=document.createElement("canvas");
      c.width=w;c.height=h;
      const ctx=c.getContext("2d");
      ctx.drawImage(img,0,0,w,h);
      // Try compressing until under 90KB (keeping headroom)
      const compress=(q)=>{
        const data=c.toDataURL("image/jpeg",q);
        const bytes=data.length*0.75; // rough base64 → bytes
        if(bytes>THUMB_MAX_BYTES&&q>0.1)return compress(q-0.1);
        return data;
      };
      const compressed=compress(quality);
      applyBg(compressed);
      renderSettings();
    };
    img.onerror=()=>{
      document.getElementById("bgHint").textContent="Could not load that image. Try a different one.";
    };
    img.src=r.result;
  };
  r.readAsDataURL(f);
  e.target.value="";
});

/* ── Keyboard ── */
document.addEventListener("keydown",e=>{
  if(e.key==="Escape"&&document.getElementById("settingsPanel").classList.contains("open"))closeSettings();
});

/* ── Boot ── */
(async function boot(){
  await loadState();

  // Apply stored background or theme
  if(state.bg){
    applyBg(state.bg);
  }else{
    applyTheme(state.theme||"black");
  }

  // Clock
  updateClock();
  setInterval(updateClock,1000);

  // Weather
  fetchWeather();
  setInterval(fetchWeather,1800000);

  // Quick links
  renderLinks();

  // Search
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

  // If Modern theme, schedule day/night watcher
  if(state.theme==="modern"&&!state.bg)scheduleModernSwitch();
})();
