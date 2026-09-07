(function(){
  'use strict';
  const KEY='gr_achievements_v1';
  const defs=[
    {id:'starship-builder',name:'STARSHIP BUILDER',icon:'🚀',desc:'Upgrade your ship and improve its capabilities.',bronze:3,silver:12,gold:30,kind:'upgrades'},
    {id:'score-beater',name:'SCORE BEATER',icon:'🏆',desc:'Reach higher score milestones.',bronze:10000,silver:25000,gold:50000,kind:'score'},
    {id:'dodge-master',name:'DODGE MASTER',icon:'✦',desc:'Successfully avoid hazards and survive.',bronze:10,silver:50,gold:100,kind:'dodges'},
    {id:'treasure-hunter',name:'TREASURE HUNTER',icon:'💎',desc:'Collect valuable space treasures.',bronze:100,silver:500,gold:1000,kind:'treasure'}
  ];
  function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return {}}}
  function write(s){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}}
  function progress(){
    const p=read(); let upgrades=0;
    try{const c=JSON.parse(localStorage.getItem('gr_characters')||'{}');Object.values(c).forEach(x=>{upgrades+=(x.attackLv||0)+(x.healthLv||0)+(x.speedLv||0)})}catch(e){}
    let score=0;try{score=Number((JSON.parse(localStorage.getItem('gr_profile')||'{}')).bestScore||0)}catch(e){}
    return {upgrades,score,dodges:Number(p.dodges||0),treasure:Number(p.treasure||0)};
  }
  function value(d,pr){return pr[d.kind]||0}
  function tierFor(d,v){let t='locked';if(v>=d.bronze)t='bronze';if(v>=d.silver)t='silver';if(v>=d.gold)t='gold';return t}
  function card(d,pr){const v=value(d,pr),tier=tierFor(d,v),target=tier==='locked'?d.bronze:tier==='bronze'?d.silver:tier==='silver'?d.gold:d.gold,pct=Math.min(100,Math.round(v/target*100));return `<article class="achievement-card ${tier}"><div class="achievement-art ${tier}"><div class="achievement-ring"><span>${tier==='locked'?'🔒':d.icon}</span></div></div><div class="achievement-name">${d.name}</div><div class="achievement-tier">${tier==='locked'?'LOCKED':tier.toUpperCase()}</div><div class="achievement-desc">${d.desc}</div><div class="achievement-progress"><span style="width:${pct}%"></span></div><div class="achievement-value">${v.toLocaleString()} / ${target.toLocaleString()}</div></article>`}
  function open(){
    let el=document.getElementById('overlay-achievements');
    if(!el){el=document.createElement('div');el.id='overlay-achievements';el.className='overlay achievements-overlay hidden';el.innerHTML='<div class="achievements-panel"><button id="btn-achievements-close" class="achievement-close">✕</button><h1>🏆 ACHIEVEMENTS</h1><p class="achievement-subtitle">Build your legacy beyond infinity</p><div id="achievement-grid"></div><div id="achievement-total"></div></div>';document.getElementById('game-container').appendChild(el);el.querySelector('#btn-achievements-close').onclick=close}
    const pr=progress();el.querySelector('#achievement-grid').innerHTML=defs.map(d=>card(d,pr)).join('');const done=defs.reduce((n,d)=>n+(tierFor(d,value(d,pr))==='gold'?1:0),0);el.querySelector('#achievement-total').textContent=`Gold achievements: ${done} / ${defs.length}`;el.classList.remove('hidden');
  }
  function close(){const el=document.getElementById('overlay-achievements');if(el)el.classList.add('hidden')}
  function add(key,amount){const p=read();p[key]=(Number(p[key])||0)+Math.max(0,Number(amount)||0);write(p)}
  window.Achievements={open,close,recordDodge:n=>add('dodges',n||1),recordTreasure:n=>add('treasure',n||1),refresh:open,defs};
  document.addEventListener('DOMContentLoaded',()=>{const b=document.getElementById('hotspot-achievements');if(b)b.addEventListener('click',open)});
})();
