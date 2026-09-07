(function(){
  'use strict';

  const KEY='gr_achievements_v2';
  const OLD_KEY='gr_achievements_v1';
  const defs=[
    {id:'starship-builder',name:'STARSHIP BUILDER',icon:'🚀',desc:'Improve your ship and build a stronger spacecraft.',bronze:2,silver:6,gold:12,kind:'upgrades'},
    {id:'score-beater',name:'SCORE BEATER',icon:'🏆',desc:'Reach higher score milestones.',bronze:10000,silver:25000,gold:50000,kind:'score'},
    {id:'dodge-master',name:'DODGE MASTER',icon:'✦',desc:'Stay in the run and survive longer journeys.',bronze:10,silver:60,gold:180,kind:'survival'},
    {id:'treasure-hunter',name:'TREASURE HUNTER',icon:'💎',desc:'Collect space treasures during your journeys.',bronze:10,silver:50,gold:100,kind:'treasure'}
  ];
  let lastSnapshot=null,lastHudCoins=0,runStartedAt=0,lastRunningState=false,pollTimer=null,toastTimer=null;

  function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return {}}}
  function write(s){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}}
  function migrateOldData(){try{if(localStorage.getItem(KEY))return;const old=JSON.parse(localStorage.getItem(OLD_KEY)||'{}');if(old&&typeof old==='object')write(old)}catch(e){}}
  function getProfile(){try{return JSON.parse(localStorage.getItem('gr_profile')||'{}')}catch(e){return {}}}
  function getCharacters(){try{return JSON.parse(localStorage.getItem('gr_characters')||'{}')}catch(e){return {}}}

  function getProgress(){
    const saved=read(),chars=getCharacters();
    let upgrades=0;
    Object.values(chars).forEach(c=>{upgrades+=Number(c.healthLv||0)+Number(c.speedLv||0)+Math.max(0,Number(c.level||1)-1)});
    const profile=getProfile();
    return {upgrades,score:Math.max(Number(profile.bestScore||profile.best_score||0),Number(saved.bestScore||0)),survival:Number(saved.survival||0),treasure:Number(saved.treasure||0)};
  }
  function value(def,progress){return Number(progress[def.kind]||0)}
  function tierFor(def,v){if(v>=def.gold)return 'gold';if(v>=def.silver)return 'silver';if(v>=def.bronze)return 'bronze';return 'locked'}
  function nextTarget(def,tier){if(tier==='locked')return def.bronze;if(tier==='bronze')return def.silver;if(tier==='silver')return def.gold;return def.gold}
  function card(def,progress){
    const v=value(def,progress),tier=tierFor(def,v),target=nextTarget(def,tier),pct=Math.min(100,Math.round(v/target*100));
    const fmt=n=>def.kind==='survival'?Math.floor(n)+'s':Math.floor(n).toLocaleString();
    return `<article class="achievement-card ${tier}"><div class="achievement-art ${tier}"><div class="achievement-ring"><span>${tier==='locked'?'🔒':def.icon}</span></div></div><div class="achievement-name">${def.name}</div><div class="achievement-tier">${tier==='locked'?'LOCKED':tier.toUpperCase()}</div><div class="achievement-desc">${def.desc}</div><div class="achievement-progress"><span style="width:${pct}%"></span></div><div class="achievement-value">${fmt(v)} / ${fmt(target)}</div></article>`;
  }

  function ensureToast(){
    let el=document.getElementById('achievement-unlock-toast');
    if(el)return el;
    el=document.createElement('div');el.id='achievement-unlock-toast';el.className='achievement-unlock-toast';
    el.innerHTML='<div class="achievement-toast-label">ACHIEVEMENT UNLOCKED</div><div class="achievement-toast-name"></div><div class="achievement-toast-tier"></div>';
    document.getElementById('game-container').appendChild(el);
    const style=document.createElement('style');style.id='achievement-toast-style';style.textContent=`
      .achievement-unlock-toast{position:fixed;left:50%;top:9%;transform:translate(-50%,-18px) scale(.94);z-index:99999;min-width:min(430px,82vw);padding:14px 22px;text-align:center;border:1px solid rgba(120,210,255,.8);border-radius:16px;background:rgba(5,10,30,.94);box-shadow:0 0 28px rgba(0,190,255,.35),inset 0 0 22px rgba(70,130,255,.12);color:#fff;opacity:0;pointer-events:none;transition:opacity .22s ease,transform .22s ease;font-family:system-ui,sans-serif}.achievement-unlock-toast.show{opacity:1;transform:translate(-50%,0) scale(1)}.achievement-toast-label{font-size:12px;letter-spacing:2px;color:#8fe8ff;font-weight:800}.achievement-toast-name{margin-top:5px;font-size:22px;font-weight:900;letter-spacing:1px}.achievement-toast-tier{margin-top:4px;font-size:13px;font-weight:800;letter-spacing:2px}@media(max-width:600px){.achievement-unlock-toast{top:5%;min-width:76vw;padding:12px 15px}.achievement-toast-name{font-size:18px}}`;
    document.head.appendChild(style);return el;
  }
  function showUnlock(def,tier){const el=ensureToast();el.querySelector('.achievement-toast-name').textContent=def.icon+' '+def.name;el.querySelector('.achievement-toast-tier').textContent=tier.toUpperCase();el.classList.remove('show');requestAnimationFrame(()=>el.classList.add('show'));clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2600)}

  function open(){
    let el=document.getElementById('overlay-achievements');
    if(!el){el=document.createElement('div');el.id='overlay-achievements';el.className='overlay achievements-overlay hidden';el.innerHTML='<div class="achievements-panel"><button id="btn-achievements-close" class="achievement-close">✕</button><h1>🏆 ACHIEVEMENTS</h1><p class="achievement-subtitle">Build your legacy beyond infinity</p><div id="achievement-grid"></div><div id="achievement-total"></div></div>';document.getElementById('game-container').appendChild(el);el.querySelector('#btn-achievements-close').onclick=close}
    const progress=getProgress();el.querySelector('#achievement-grid').innerHTML=defs.map(def=>card(def,progress)).join('');
    const unlocked=defs.filter(def=>tierFor(def,value(def,progress))!=='locked').length,gold=defs.filter(def=>tierFor(def,value(def,progress))==='gold').length;
    el.querySelector('#achievement-total').textContent=`Unlocked: ${unlocked}/${defs.length} • Gold: ${gold}/${defs.length} • ${Math.round(unlocked/defs.length*100)}% complete`;el.classList.remove('hidden');
  }
  function close(){const el=document.getElementById('overlay-achievements');if(el)el.classList.add('hidden')}
  function addCounter(key,amount){const p=read();p[key]=(Number(p[key])||0)+Math.max(0,Number(amount)||0);write(p)}
  function setMax(key,value){const p=read();p[key]=Math.max(Number(p[key]||0),Math.max(0,Number(value)||0));write(p)}

  function checkUnlocks(progress){
    const snapshot={};defs.forEach(def=>snapshot[def.id]=tierFor(def,value(def,progress)));
    if(lastSnapshot){const order={locked:0,bronze:1,silver:2,gold:3};defs.forEach(def=>{if(order[snapshot[def.id]]>order[lastSnapshot[def.id]])showUnlock(def,snapshot[def.id])})}
    lastSnapshot=snapshot;
  }
  function gameIsActive(){
    const game=document.getElementById('game-ui'),pause=document.getElementById('overlay-pause'),win=document.getElementById('overlay-win'),lose=document.getElementById('overlay-lose');
    return !!game&&!game.classList.contains('hidden')&&!(pause&&!pause.classList.contains('hidden'))&&!(win&&!win.classList.contains('hidden'))&&!(lose&&!lose.classList.contains('hidden'));
  }
  function sampleHudCoins(){
    if(!gameIsActive())return;
    const el=document.getElementById('coin-count');if(!el)return;
    const current=Math.max(0,parseInt(el.textContent.replace(/[^0-9-]/g,''),10)||0);
    if(current<lastHudCoins){lastHudCoins=current;return;}
    if(current>lastHudCoins)addCounter('treasure',current-lastHudCoins);
    lastHudCoins=current;
  }
  function sampleScore(){
    if(!gameIsActive())return;
    const el=document.getElementById('score-current');if(!el||el.classList.contains('hidden'))return;
    const current=Math.max(0,parseInt(el.textContent.replace(/[^0-9-]/g,''),10)||0);
    setMax('bestScore',current);
  }
  function sampleSurvival(){
    const game=document.getElementById('game-ui'),pause=document.getElementById('overlay-pause');
    const running=!!game&&!game.classList.contains('hidden')&&!(pause&&!pause.classList.contains('hidden'));
    if(running&&!lastRunningState)runStartedAt=Date.now();
    if(running&&runStartedAt)setMax('survival',(Date.now()-runStartedAt)/1000);
    lastRunningState=running;
  }
  function poll(){sampleHudCoins();sampleScore();sampleSurvival();const progress=getProgress();checkUnlocks(progress);const overlay=document.getElementById('overlay-achievements');if(overlay&&!overlay.classList.contains('hidden'))open()}
  function replaceAchievementHotspot(){const oldButton=document.getElementById('hotspot-achievements');if(!oldButton||!oldButton.parentNode)return;const fresh=oldButton.cloneNode(true);oldButton.parentNode.replaceChild(fresh,oldButton);fresh.addEventListener('click',open)}
  function init(){migrateOldData();replaceAchievementHotspot();ensureToast();lastSnapshot=null;poll();clearInterval(pollTimer);pollTimer=setInterval(poll,750)}

  window.Achievements={open,close,recordDodge:n=>addCounter('survival',n||1),recordTreasure:n=>addCounter('treasure',n||1),refresh:open,defs};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
