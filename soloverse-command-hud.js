/* Beyond Infinity: Soloverse — Command HUD v2 */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  let root = null, startedAt = 0, lastPct = 0, lastTime = 0, speedPct = 0;

  const LEVELS = {
    1:['THE MOON','REACH THE MOON'], 2:['MARS','SURVIVE THE RED ZONE'],
    3:['VENUS','CROSS THE ACID CLOUDS'], 4:['MERCURY','SURVIVE THE SOLAR RUN'],
    5:['JUPITER','BREAK THROUGH THE STORM'], 6:['SATURN','NAVIGATE THE RING FIELD'],
    7:['URANUS','ENTER THE ICE GIANT'], 8:['NEPTUNE','REACH THE FINAL FRONTIER']
  };
  const DIST = [0,2500,3200,4000,4800,5600,6400,7200,8000];

  function levelNumber(){
    const m = (($('level-label')?.textContent)||'').match(/(\d+)/);
    return m ? Math.max(1,Math.min(8,+m[1])) : 1;
  }
  function isLevels(){
    const game = $('game-ui'), path = $('path-bar');
    return !!(game && !game.classList.contains('hidden') && path && !path.classList.contains('hidden'));
  }
  function pct(){
    const n = parseFloat($('path-fill')?.style.width || '0');
    return Number.isFinite(n) ? Math.max(0,Math.min(100,n)) : 0;
  }
  function hull(){
    const m=(($('hull-label')?.textContent)||'').match(/(\d+(?:\.\d+)?)\s*%/);
    return m ? Math.max(0,Math.min(100,+m[1])) : 100;
  }
  function rupees(){ return (($('coin-count')?.textContent)||'0').replace(/[^0-9]/g,'') || '0'; }
  function shield(){ return (($('shield-indicator')?.textContent)||'—').replace(/\s+/g,' ').trim() || 'OFFLINE'; }
  function ship(){
    const blue = (localStorage.getItem('gr_equipped')||'blue') === 'blue';
    return blue ? ['BLUE FIGHTER','assets/ships/blue.png'] : ['PURPLE FIGHTER','assets/ships/purple.png'];
  }
  function fmtTime(ms){
    const s=Math.max(0,Math.floor(ms/1000));
    return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
  }
  function status(h,p){
    if(h<=25) return ['CRITICAL','critical'];
    if(h<=55 || p<15) return ['WARNING','warning'];
    if(p>=98) return ['ARRIVAL','warning'];
    return ['NOMINAL',''];
  }
  function ensure(){
    if(root) return root;
    root=document.createElement('div'); root.id='soloverse-command-hud';
    root.innerHTML=`
      <div class="sch-vignette"></div><div class="sch-grid"></div>
      <div class="sch-top">
        <div class="sch-card sch-ship"><img class="sch-ship-icon" id="sch-ship-img"/><div><div class="sch-label">AURORA // ACTIVE VESSEL</div><div class="sch-value" id="sch-ship-name">BLUE FIGHTER</div><div class="sch-sub" id="sch-ship-sub">LEVEL 01 • SOLOVERSE</div></div></div>
        <div class="sch-card sch-mission"><div><div class="sch-level" id="sch-level">LEVEL 01</div><div class="sch-value" id="sch-planet">THE MOON</div></div><div class="sch-sep"></div><div><div class="sch-label">MISSION CLOCK</div><div class="sch-clock" id="sch-clock">00:00</div></div></div>
        <div class="sch-top-right"><div class="sch-card sch-mini"><div class="sch-label">MODE</div><div class="sch-value">LEVELS</div></div><div class="sch-card sch-mini"><div class="sch-label">THREAT</div><div class="sch-value sch-status" id="sch-status">NOMINAL</div></div><div class="sch-card sch-mini"><div class="sch-label">FPS TARGET</div><div class="sch-value">60</div></div></div>
      </div>
      <div class="sch-left">
        <div class="sch-card sch-panel"><div class="sch-label">COMBAT SYSTEMS</div><div class="sch-row"><span>HULL INTEGRITY</span><b id="sch-hull-val">100%</b></div><div class="sch-bar"><div class="sch-fill" id="sch-hull-fill"></div></div><div class="sch-row"><span>SHIELD</span><b id="sch-shield-val">OFFLINE</b></div><div class="sch-row"><span>FLIGHT SPEED</span><b id="sch-speed-val">100%</b></div><div class="sch-bar"><div class="sch-fill" id="sch-speed-fill"></div></div></div>
        <div class="sch-card sch-panel"><div class="sch-label">ACTIVE POWERS</div><div id="sch-powers" class="sch-sub" style="font-size:10px;line-height:1.7">NO ACTIVE MODULES</div></div>
      </div>
      <div class="sch-objective"><div class="sch-objective-main">PRIMARY OBJECTIVE</div><div class="sch-value" id="sch-objective">REACH THE MOON</div><div class="sch-distance"><div class="sch-line"><span id="sch-progress-left"></span></div><strong id="sch-percent">0%</strong><div class="sch-line"><span id="sch-progress-right"></span></div></div><div class="sch-check" id="sch-distance-text">0 / 2,500 KM • NEXT CHECKPOINT: 20%</div></div>
      <div class="sch-alert" id="sch-alert">MISSION TELEMETRY ONLINE</div>
      <div class="sch-right">
        <div class="sch-metric"><div class="sch-metric-head"><span class="sch-label">MISSION PROGRESS</span><b class="big" id="sch-progress-big">0%</b></div><div class="sch-bar"><div class="sch-fill" id="sch-progress-fill"></div></div></div>
        <div class="sch-card sch-panel"><div class="sch-label">RESOURCE BANK</div><div class="sch-row"><span>RUPEES</span><b id="sch-rupees">0</b></div><div class="sch-row"><span>RUN TIME</span><b id="sch-run-time">00:00</b></div><div class="sch-row"><span>CHECKPOINT</span><b id="sch-checkpoint">START</b></div></div>
        <div class="sch-card sch-panel"><div class="sch-label">TACTICAL TELEMETRY</div><div class="sch-stat-grid"><div class="sch-stat"><b id="sch-threat">LOW</b><span>THREAT</span></div><div class="sch-stat"><b id="sch-difficulty">NORMAL</b><span>DIFFICULTY</span></div><div class="sch-stat"><b id="sch-alt">SAFE</b><span>FLIGHT ZONE</span></div><div class="sch-stat"><b id="sch-power-count">0</b><span>ACTIVE POWERS</span></div></div></div>
      </div>
      <div class="sch-bottom">
        <div class="sch-bottom-card"><div class="sch-command"><span class="sch-key">▲</span><span class="sch-key">◀</span><span class="sch-key">▼</span><span class="sch-key">▶</span></div><span class="sch-runstate">FLIGHT CONTROL</span></div>
        <div class="sch-bottom-card"><div class="sch-command"><span class="sch-key hot">1</span><span class="sch-key hot">2</span><span class="sch-key hot">3</span><span class="sch-key hot">4</span><span class="sch-key hot">5</span><span class="sch-key hot">6</span></div><span class="sch-runstate">POWER MODULES</span></div>
        <div class="sch-bottom-card"><span class="sch-runstate">COMMAND STATUS</span><b class="sch-status" id="sch-command-status">ONLINE</b></div>
      </div>`;
    $('game-ui')?.appendChild(root);
    return root;
  }
  function update(){
    if(!root) ensure();
    const active=isLevels(); document.body.classList.toggle('bi-command-hud-active',active);
    if(!active){ startedAt=0; return; }
    const n=levelNumber(), meta=LEVELS[n]||LEVELS[1], p=pct(), h=hull(), now=performance.now();
    if(!startedAt) { startedAt=now; lastTime=now; lastPct=p; }
    const dt=Math.max(1,now-lastTime), dp=p-lastPct; speedPct=Math.max(0,Math.min(100,(dp/dt)*10000)); lastTime=now; lastPct=p;
    const [shipName,img]=ship(); const st=status(h,p);
    $('sch-ship-name').textContent=shipName; $('sch-ship-img').src=img;
    $('sch-level').textContent='LEVEL '+String(n).padStart(2,'0'); $('sch-planet').textContent=meta[0]; $('sch-objective').textContent=meta[1];
    $('sch-clock').textContent=fmtTime(now-startedAt); $('sch-run-time').textContent=fmtTime(now-startedAt);
    $('sch-hull-val').textContent=Math.round(h)+'%'; $('sch-hull-fill').style.width=h+'%'; $('sch-hull-fill').className='sch-fill '+st[1];
    const shieldText=shield(); $('sch-shield-val').textContent=shieldText;
    const sp=Math.max(35,Math.min(100,65+speedPct)); $('sch-speed-val').textContent=Math.round(sp)+'%'; $('sch-speed-fill').style.width=sp+'%';
    $('sch-percent').textContent=Math.round(p)+'%'; $('sch-progress-big').textContent=Math.round(p)+'%'; $('sch-progress-fill').style.width=p+'%'; $('sch-progress-left').style.width=p+'%'; $('sch-progress-right').style.width=p+'%';
    const total=DIST[n]||0, travelled=Math.round(total*p/100); const next=Math.min(100,Math.ceil((p+0.001)/20)*20); $('sch-distance-text').textContent=travelled.toLocaleString()+' / '+total.toLocaleString()+' KM • NEXT CHECKPOINT: '+(next>=100?'ARRIVAL':next+'%'); $('sch-checkpoint').textContent=p>=80?'FINAL APPROACH':p>=60?'CHECKPOINT 3':p>=40?'CHECKPOINT 2':p>=20?'CHECKPOINT 1':'START';
    $('sch-rupees').textContent=rupees(); $('sch-status').textContent=st[0]; $('sch-status').className='sch-value sch-status '+st[1]; $('sch-command-status').textContent=st[0]==='CRITICAL'?'ATTENTION':'ONLINE';
    const powers=Array.from(document.querySelectorAll('#active-powers .power-badge')).map(x=>x.textContent.trim()).filter(Boolean); $('sch-powers').textContent=powers.length?powers.join(' • '):'NO ACTIVE MODULES'; $('sch-power-count').textContent=powers.length;
    const threat=p>=85?'EXTREME':p>=60?'HIGH':p>=30?'MEDIUM':'LOW'; $('sch-threat').textContent=threat; $('sch-difficulty').textContent='NORMAL'; $('sch-alt').textContent=h<=25?'DANGER':h<=55?'CAUTION':'SAFE';
    const alert=$('sch-alert'); if(p>=98){alert.textContent='FINAL APPROACH • DESTINATION LOCKED';alert.classList.add('show')}else if(h<=25){alert.textContent='CRITICAL HULL • EVADE HOSTILES';alert.classList.add('show')}else{alert.classList.remove('show')}
  }
  function init(){ ensure(); update(); setInterval(update,200); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();
