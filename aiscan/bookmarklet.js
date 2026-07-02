/* ════════════════════════════════════════════════════════════════════
   Horizon AI Signal — Bookmarklet Version
   ════════════════════════════════════════════════════════════════════

   Copy the minified version below into a bookmark URL field.
   Click it on any Google search results page to see AI scores.

   MINIFIED (paste this into a bookmark):
   ───────────────────────────────────────
   javascript:(function(){const s=document.createElement('script');s.src='https://raw.githubusercontent.com/RishvanthAmsaraj/Home-Page-Extension/main/aiscan/score.js';document.head.appendChild(s);s.onload=function(){const sc=window.AIScore||{score:(t,o)=>({overall:0,reasons:[]})};const sel={result:"div.g, div[jscontroller][data-hveid] div.g, [data-snf] .g",anchor:"a[href]:not([role='button'])",title:"h3",snippet:".VwiC3b, .yXK7lf, [data-content-feature], .st",url:"cite, .tjvcx, .dyjrff"};function eh(h){try{const u=new URL(h);return u.hostname.replace(/^www\./,'')}catch(e){return''}}function ex(card){const as=card.querySelectorAll(sel.anchor);let url='',titleEl=null;for(const a of as){if(/^https?:\/\//i.test(a.getAttribute('href')||'')){url=a.getAttribute('href');titleEl=a;break}}if(!url)return null;const title=(card.querySelector(sel.title)||titleEl||{}).textContent?.trim()||'';const snippet=(card.querySelector(sel.snippet)||{}).textContent?.trim()||'';if(!title&&!snippet)return null;return{url,hostname:eh(url),title,snippet}}function band(p){return p<35?'low':p<65?'med':'high'}function bl(b){return b==='low'?'Human-like':b==='med'?'Mixed':'Likely AI'}function esc(s){return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}document.querySelectorAll('.hz-ai-border').forEach(e=>e.classList.remove('hz-ai-border','hz-ai-low','hz-ai-med','hz-ai-high'));document.querySelectorAll('.hz-ai-tip').forEach(e=>e.remove());const style=document.createElement('style');style.textContent='.hz-ai-border{position:relative}.hz-ai-border::before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;border-radius:2px 0 0 2px}.hz-ai-low::before{background:#22c55e}.hz-ai-med::before{background:#f59e0b}.hz-ai-high::before{background:#ef4444}.hz-ai-tip{position:absolute;left:8px;top:50%;transform:translateY(-50%);background:rgba(0,0,0,.85);color:#fff;padding:8px 12px;border-radius:8px;font-size:12px;line-height:1.5;white-space:pre-wrap;max-width:320px;z-index:9999;pointer-events:none;opacity:0;transition:opacity .2s}.hz-ai-border:hover .hz-ai-tip{opacity:1}';document.head.appendChild(style);const cards=document.querySelectorAll(sel.result);console.log('[AI Signal] Scanning',cards.length,'results');cards.forEach(card=>{const d=ex(card);if(!d)return;const text=[d.title,d.snippet].filter(Boolean).join(' — ');const score=sc.score(text,{url:d.url});const b=band(score.overall);card.classList.add('hz-ai-border','hz-ai-'+b);const tip=document.createElement('div');tip.className='hz-ai-tip';tip.innerHTML='<strong>AI Signal: '+score.overall+'% · '+bl(b)+'</strong>\n'+esc(score.reasons.join(' · ')||'no strong signals')+'\n\n<em>Heuristic estimate — not a definitive verdict</em>';card.appendChild(tip);console.log('[AI Signal]',d.hostname,score.overall+'%',bl(b))})}})();
   ───────────────────────────────────────
*/

// This file is documentation. The actual bookmarklet is the minified
// string above. To use:
// 1. Create a new bookmark in Brave
// 2. Paste the minified code as the URL
// 3. Click it on any Google search results page
// 4. Results get colored left borders + hover tooltips with scores