/* Beyond Infinity: Soloverse — Levels Mode Status Board
   Uses the existing DOM as the source of truth so it works with the current
   game.js, where state is not exported on window. */
(() => {
  'use strict';

  const LEVELS = {
    1: { name:'THE MOON', task:'REACH THE MOON', emoji:'🌕', target:2500 },
    2: { name:'MARS', task:'REACH MARS', emoji:'🔴', target:3200 },
    3: { name:'VENUS', task:'REACH VENUS', emoji:'🟠', target:4000 },
    4: { name:'MERCURY', task:'REACH MERCURY', emoji:'⚪', target:4800 },
    5: { name:'JUPITER', task:'REACH JUPITER', emoji:'🟤', target:5600 },
    6: { name:'SATURN', task:'REACH SATURN', emoji:'🪐', target:6400 },
    7: { name:'URANUS', task:'REACH URANUS', emoji:'🔵', target:7200 },
    8: { name:'NEPTUNE', task:'REACH NEPTUNE', emoji:'🔵', target:8000 }
  };
  const el=id=>document.getElementById(id);
  const txt=(id,v)=>{const n=el(id);if(n)n.textContent=v;};
  const num=v=>{const n=Number(String(v??'').replace(/[^0-9.]/g,''));return Number.isFinite(n)?n:0;};

  function level(){
    const m=(el('level-label')?.textContent||'').match(/(\d+)/);
    return m?Math.max(1,Math.min(8,Number(m[1]))):1;
  }

  // game.js keeps state as a module-local const, so window.state is undefined.
  // The existing DOM already tells us which mode is active: Levels shows the
  // path bar; Infinity hides it. This is reliable and does not alter gameplay.
  function active(){
    const game=el('game-ui');
    const path=el('path-bar');
    return !!(game && !game.classList.contains('hidden') && path && !path.classList.contains('hidden'));
  }

  function hull(){
    const m=(el('hull-label')?.textContent||'').match(/(\d+(?:\.\d+)?)\s*%/);
    return m?Number(m[1]):100;
  }
  function progress(){
    const n=Number(String(el('path-fill')?.style.width||'').replace('%',''));
    return Number.isFinite(n)?Math.max(0,Math.min(100,n)):0;
  }

  function ensure(){
    if(el('bi-level-status-board'))return el('bi-level-status-board');
    const ui=el('game-ui');if(!ui)return null;
    const b=document.createElement('section');
    b.id='bi-level-status-board';
    b.setAttribute('aria-label','Levels mode status board');
    b.innerHTML=`
      <div class="bi-hud-panel bi-ship-panel"><div class="bi-ship-mark">✦</div><div><div class="bi-kicker">CURRENT MISSION</div><div class="bi-ship-name">AURORA</div><div class="bi-level-name" id="bi-level-name">LEVEL 01 • THE MOON</div></div><span class="bi-level-chip">SOLOVERSE / LEVELS</span></div>
      <div class="bi-hud-panel bi-stat"><div class="bi-stat-head"><span>HEALTH</span><span id="bi-hull-value">100 / 100</span></div><div class="bi-stat-value">HULL INTEGRITY</div><div class="bi-meter"><div class="bi-meter-fill" id="bi-hull-meter"></div></div></div>
      <div class="bi-hud-panel bi-stat"><div class="bi-stat-head"><span>SHIELD</span><span id="bi-shield-value">100 / 100</span></div><div class="bi-stat-value">PROTECTION</div><div class="bi-meter"><div class="bi-meter-fill" id="bi-shield-meter"></div></div></div>
      <div class="bi-hud-panel bi-stat"><div class="bi-stat-head"><span>SPEED</span><span id="bi-speed-value">80 / 100</span></div><div class="bi-stat-value">CRUISE</div><div class="bi-meter"><div class="bi-meter-fill" id="bi-speed-meter"></div></div></div>
      <div class="bi-hud-panel bi-stat"><div class="bi-stat-head"><span>DISTANCE</span><span id="bi-distance-value">0 / 2,500</span></div><div class="bi-stat-value">MISSION PROGRESS</div><div class="bi-meter"><div class="bi-meter-fill" id="bi-distance-meter"></div></div></div>
      <div class="bi-hud-panel bi-objective"><div class="bi-planet-orb" id="bi-planet-orb">🌕</div><div><div class="bi-kicker">PRIMARY OBJECTIVE</div><div class="bi-objective-title" id="bi-objective-title">THE MOON</div><div class="bi-objective-sub" id="bi-objective-sub">REACH THE MOON</div></div></div>
      <div class="bi-hud-panel bi-right"><div class="bi-mini">SCORE<b id="bi-score">0</b></div><div class="bi-mini">RUPEES<b id="bi-coins">0</b></div><div class="bi-mini">BEST<b id="bi-best">0</b></div><div class="bi-mini">STATUS<b id="bi-status">READY</b></div><span class="bi-board-corner">LEVEL HUD</span></div>
      <div class="bi-hud-panel bi-controls"><button class="bi-control-btn" id="bi-pause" type="button" aria-label="Pause">Ⅱ</button><button class="bi-control-btn" id="bi-settings" type="button" aria-label="Settings">⚙</button></div>`;
    ui.appendChild(b);
    el('bi-pause')?.addEventListener('click',()=>{el('btn-pause-ingame')?.click();});
    el('bi-settings')?.addEventListener('click',()=>{el('btn-settings-levels')?.click();});
    return b;
  }

  function update(){
    const b=ensure();if(!b)return;
    const n=level(),i=LEVELS[n]||LEVELS[1],h=Math.max(0,Math.min(100,hull())),p=progress();
    txt('bi-level-name',`LEVEL ${String(n).padStart(2,'0')} • ${i.name}`);
    txt('bi-objective-title',i.name);txt('bi-objective-sub',i.task);txt('bi-planet-orb',i.emoji);
    txt('bi-hull-value',`${Math.round(h)} / 100`);
    txt('bi-distance-value',`${Math.round(i.target*p/100).toLocaleString()} / ${i.target.toLocaleString()}`);
    txt('bi-score',num(el('score-current')?.textContent).toLocaleString());
    txt('bi-best',num(el('score-best')?.textContent).toLocaleString());
    txt('bi-coins',num(el('coin-count')?.textContent).toLocaleString());
    el('bi-hull-meter').style.width=`${h}%`;el('bi-distance-meter').style.width=`${p}%`;
    const sm=(el('shield-indicator')?.textContent||'').match(/([0-9]+)\s*%/),sh=sm?Number(sm[1]):100;
    txt('bi-speed-value','80 / 100');txt('bi-shield-value',`${Math.round(Math.max(0,Math.min(100,sh)))} / 100`);
    el('bi-speed-meter').style.width='80%';el('bi-shield-meter').style.width=`${sh}%`;
    txt('bi-status',active()?'NOMINAL':'READY');
  }

  function sync(){
    const a=active(),b=ensure();
    document.body.classList.toggle('bi-levels-mode',a);
    if(b)b.style.display=a?'grid':'none';
  }
  function init(){ensure();update();sync();setInterval(()=>{update();sync();},250);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
