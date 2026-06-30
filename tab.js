/* ════════════════════════════════════════════════
   Horizon Tab v1.2 — Settings & Customization
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
  {id:"l1",label:"ChatGPT",url:"https://chatgpt.com",emoji:"\u{1F916}",image:""},
  {id:"l2",label:"GitHub",url:"https://github.com",emoji:"\u{1F4BB}",image:""},
  {id:"l3",label:"Calendar",url:"https://calendar.google.com",emoji:"\u{1F4C5}",image:""},
  {id:"l4",label:"Mail",url:"https://mail.google.com",emoji:"\u{1F4E7}",image:""},
  {id:"l5",label:"Canvas",url:"https://canvas.psu.edu",emoji:"\u{1F4DA}",image:""},
  {id:"l6",label:"OpenClaw",url:"https://openclaw.ai",emoji:"\u26A1",image:""}
];

const DS={theme:"black",searchEngine:"google",links:DL};
let state={...DS},lC=100,$=(s)=>document.querySelector(s),$$=(s)=>document.querySelectorAll(s);
const E={};

function el(){Object.assign(E,{
  t:$("#time"),g:$("#greeting"),d:$("#date"),
  sf:$("#searchForm"),si:$("#searchInput"),
  l:$("#links"),
  wi:$("#weatherIcon"),wt:$("#weatherTemp"),wd:$("#weatherDesc"),wh:$("#weatherHiLo"),
  st:$("#settingsToggle"),sp:$("#settingsPanel"),sc:$("#settingsClose"),sb:$("#settingsBackdrop"),
  cl:$("#customLinks"),al:$("#addLinkBtn"),
  so:$("#searchEngineOptions"),to:$("#themeOptions"),
  bl:$("#bgLayer"),go:$("#glassOrb"),
  h:document.documentElement,sbdy:$("#settingsBody")
})}

async function ld(){
  try{
    const s=await chrome.storage.sync.get(["hz"]);
    if(s.hz)state={...DS,...s.hz,links:s.hz.links||DL};
  }catch{
    try{const s=localStorage.getItem("hz");if(s)state={...DS,...JSON.parse(s)}}
    catch{}
  }
}
async function sv(){
  const o={theme:state.theme,searchEngine:state.searchEngine,links:state.links,bg:state.bg};
  try{await chrome.storage.sync.set({hz:o})}catch{try{localStorage.setItem("hz",JSON.stringify(o))}catch{}}
}

// ── Clock ──
function gr(){const h=new Date().getHours();return h<12?"good morning":h<17?"good afternoon":h<21?"good evening":"good night"}
function uc(){
  const n=new Date(),h=n.getHours(),m=String(n.getMinutes()).padStart(2,"0"),a=h>=12?"PM":"AM",h12=h%12||12;
  E.t.textContent=`${h12}:${m} ${a}`;
  E.g.textContent=gr();
  E.d.textContent=n.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})
}
uc();setInterval(uc,1e3);

// ── Weather ──
async function fw(){
  try{
    const p=await(await fetch(`https://api.weather.gov/points/${LAT},${LON}`)).json();
    const f=await(await fetch(p.properties.forecast)).json(),ps=f.properties.periods;
    const c=ps[0],n=ps[1],t=c.temperature,d=c.isDaytime,s=c.shortForecast;
    let hi=n&&n.isDaytime?n.temperature:t,lo=n&&!n.isDaytime?n.temperature:t;
    if(!d){lo=t;const td=ps[2]&&ps[2].isDaytime?ps[2]:null;hi=td?td.temperature:n?n.temperature:t}
    E.wi.textContent=we(c.shortForecast,d);
    E.wt.textContent=`${t}\u00B0`;
    E.wd.textContent=s;
    E.wh.textContent=`H ${hi}\u00B0 L ${lo}\u00B0`;
  }catch{E.wd.textContent="unavailable"}
}
function we(f,d){
  const F=f.toLowerCase();
  if(F.includes("sunny")||F.includes("clear"))return d?"\u2600\uFE0F":"\uD83C\uDF19";
  if(F.includes("cloudy")||F.includes("overcast"))return"\u2601\uFE0F";
  if(F.includes("partly"))return d?"\u26C5":"\uD83C\uDF19";
  if(F.includes("rain")||F.includes("shower")||F.includes("drizzle"))return"\uD83C\uDF27\uFE0F";
  if(F.includes("thunder")||F.includes("storm"))return"\u26C8\uFE0F";
  if(F.includes("snow")||F.includes("flurr")||F.includes("blizzard"))return"\u2744\uFE0F";
  if(F.includes("fog")||F.includes("mist")||F.includes("haze"))return"\uD83C\uDF2B\uFE0F";
  if(F.includes("wind")||F.includes("breez"))return"\uD83D\uDCA8";
  return d?"\u2600\uFE0F":"\uD83C\uDF19";
}
fw();setInterval(fw,18e5);

// ── Search ──
E.sf?.addEventListener("submit",e=>{
  e.preventDefault();
  const q=E.si.value.trim();if(!q)return;
  const h=q.includes(".")&&!q.includes(" "),u=h&&(q.startsWith("http")||q.startsWith("https")||q.startsWith("localhost"));
  if(u)window.location.href=q.startsWith("http")?q:`https://${q}`;
  else window.location.href=(SE[state.searchEngine]||SE.google)+encodeURIComponent(q);
});

// ── Links ──
function rl(){
  E.l.innerHTML=state.links.map(l=>
    `<a href="${l.url}" class="link-item" title="${l.url}">
      <span class="link-icon">${l.image?`<img src="${l.image}" alt="" loading="lazy">`:l.emoji||"\uD83C\uDF10"}</span>
      <span class="link-label">${l.label}</span>
    </a>`
  ).join("")
}

// ── Background ──
function applyBg(bgData){
  state.bg=bgData;sv();
  if(bgData){
    E.bl.style.setProperty("--user-bg",`url(${bgData})`);
    E.bl.style.setProperty("--user-overlay","rgba(0,0,0,.55)");
    E.bl.classList.add("has-image");
    E.go.style.display="none";
  }else{
    E.bl.classList.remove("has-image");
    E.bl.style.removeProperty("--user-bg");
    E.bl.style.removeProperty("--user-overlay");
    E.go.style.display="";
  }
}

// ── Settings panel ──
function os(){E.sp.classList.add("open");E.sb.classList.add("open");rle()}
function cs(){E.sp.classList.remove("open");E.sb.classList.remove("open")}
E.st?.addEventListener("click",os);
E.sc?.addEventListener("click",cs);
E.sb?.addEventListener("click",cs);

// ── Settings render ──
function rle(){
  const b=state.bg;
  E.sbdy.innerHTML=`
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
          <span class="theme-swatch" style="background:#ff6200"></span>Amber
        </button>
      </div>
    </div>

    <div class="settings-group">
      <label class="settings-label">Background</label>
      <p class="settings-hint">Upload your own image or clear to use theme gradients.</p>
      <div style="display:flex;gap:.4rem">
        <button class="upload-btn" id="uploadBgBtn">\u{1F5BC}\uFE0F Upload Image</button>
        ${b?'<button class="upload-btn" id="clearBgBtn">\u2716 Clear</button>':''}
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
      <div class="custom-links" id="customLinks">
        ${state.links.map((l,i)=>`
          <div class="link-editor" data-i="${i}">
            <input class="le-emoji" value="${l.emoji||"\uD83C\uDF10"}" maxlength="2" placeholder="\uD83C\uDF10">
            <input class="le-label" value="${l.label}" placeholder="Label">
            <input class="le-url" value="${l.url}" placeholder="https://...">
            <input class="le-img" value="${l.image||""}" placeholder="Img URL">
            <button class="link-remove" title="Remove">\u2715</button>
          </div>
        `).join("")}
      </div>
      <button class="btn-sm" id="addLinkBtn">+ Add Link</button>
    </div>
  `;

  // Theme buttons
  E.sbdy.querySelectorAll(".theme-btn").forEach(b=>
    b.addEventListener("click",()=>{state.theme=b.dataset.theme;E.h.setAttribute("data-theme",state.theme);rle();sv()})
  );

  // Search engine buttons
  E.sbdy.querySelectorAll(".engine-btn").forEach(b=>
    b.addEventListener("click",()=>{state.searchEngine=b.dataset.engine;rle();sv()})
  );

  // Link editors
  E.sbdy.querySelectorAll(".link-editor").forEach(ed=>{
    const i=parseInt(ed.dataset.i);
    const inputs={
      emoji:ed.querySelector(".le-emoji"),
      label:ed.querySelector(".le-label"),
      url:ed.querySelector(".le-url"),
      img:ed.querySelector(".le-img")
    };
    const save=()=>{
      state.links[i]={...state.links[i],
        emoji:inputs.emoji.value||"\uD83C\uDF10",
        label:inputs.label.value||"Link",
        url:inputs.url.value||"https://example.com",
        image:inputs.img.value||""
      };
      sv();rl();
    };
    Object.values(inputs).forEach(inp=>inp.addEventListener("input",save));
    ed.querySelector(".link-remove").addEventListener("click",()=>{
      state.links.splice(i,1);sv();rl();rle()
    });
  });

  // Add link
  const al=E.sbdy.querySelector("#addLinkBtn");
  if(al)al.addEventListener("click",()=>{
    state.links.push({id:`lc${lC++}`,label:"New Link",url:"https://example.com",emoji:"\uD83C\uDF10",image:""});
    sv();rl();rle();
    E.sp.scrollTop=E.sp.scrollHeight;
  });

  // Upload / Clear background
  const up=E.sbdy.querySelector("#uploadBgBtn");
  if(up)up.addEventListener("click",()=>document.getElementById("bgUpload").click());
  const cl=E.sbdy.querySelector("#clearBgBtn");
  if(cl)cl.addEventListener("click",()=>{applyBg(null);rle()});
}

// ── Background file upload ──
document.getElementById("bgUpload").addEventListener("change",e=>{
  const f=e.target.files[0];if(!f)return;
  const r=new FileReader();
  r.onload=ev=>{applyBg(ev.target.result);rle()};
  r.readAsDataURL(f);
  e.target.value="";
});

// ── Keyboard ──
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&E.sp.classList.contains("open"))cs()});

// ── Boot ──
(async function(){
  el();await ld();
  E.h.setAttribute("data-theme",state.theme);
  if(state.bg)applyBg(state.bg);
  rl();
})();
