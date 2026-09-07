(function(){
  'use strict';

  const LEVELS = [
    {level_number:1,name:'The Moon',distance:2500,reward_coins:120,planet:'planet1_moon'},
    {level_number:2,name:'Mars',distance:3200,reward_coins:170,planet:'planet2_mars'},
    {level_number:3,name:'Venus',distance:4000,reward_coins:220,planet:'planet3_venus'},
    {level_number:4,name:'Mercury',distance:4800,reward_coins:280,planet:'planet4_mercury'},
    {level_number:5,name:'Jupiter',distance:5600,reward_coins:340,planet:'planet5_jupiter'},
    {level_number:6,name:'Saturn',distance:6400,reward_coins:400,planet:'planet6_saturn'},
    {level_number:7,name:'Uranus',distance:7200,reward_coins:470,planet:'planet7_uranus'},
    {level_number:8,name:'Neptune',distance:8000,reward_coins:550,planet:'planet8_neptune'}
  ];

  const META = [
    null,
    {diff:'EASY',tag:'LUNAR FRONTIER'},
    {diff:'EASY+',tag:'RED PLANET'},
    {diff:'NORMAL',tag:'CLOUD WORLD'},
    {diff:'NORMAL+',tag:'MERCURY RUN'},
    {diff:'HARD',tag:'GIANT STORM'},
    {diff:'HARD+',tag:'RINGED GIANT'},
    {diff:'EXTREME',tag:'ICE GIANT'},
    {diff:'EXTREME+',tag:'DEEP BLUE'}
  ];

  const PROGRESS_KEY = 'gr_level_progress_v1';
  let activeLevel = Number(localStorage.getItem('gr_active_level') || 0);
  let completionHandled = false;
  let lastWinVisible = false;

  function safeParse(key, fallback){
    try { const raw=localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
    catch(e){ return fallback; }
  }
  function save(key,value){ try{ localStorage.setItem(key,JSON.stringify(value)); }catch(e){} }

  function getProfile(){
    const p=safeParse('gr_profile',{username:'guest',coins:0,currentLevel:1,bestScore:0});
    if(!Number.isFinite(Number(p.currentLevel))) p.currentLevel=1;
    if(!Number.isFinite(Number(p.coins))) p.coins=0;
    return p;
  }
  function saveProfile(p){ save('gr_profile',p); }

  function getProgress(){
    const oldCompleted=safeParse('gr_completed_levels',[]);
    const oldStars=safeParse('gr_level_stars',{});
    const p=safeParse(PROGRESS_KEY,{});
    const completed=Array.isArray(p.completed)?p.completed.slice():Array.isArray(oldCompleted)?oldCompleted.slice():[];
    const stars=(p.stars&&typeof p.stars==='object')?Object.assign({},p.stars):(oldStars&&typeof oldStars==='object'?Object.assign({},oldStars):{});
    const rewards=(p.rewards&&typeof p.rewards==='object')?Object.assign({},p.rewards):{};
    const scores=(p.scores&&typeof p.scores==='object')?Object.assign({},p.scores):{};
    const treasures=(p.treasures&&typeof p.treasures==='object')?Object.assign({},p.treasures):{};
    const unlocked=Math.max(1,Math.min(LEVELS.length,Number(p.unlocked)||Number(getProfile().currentLevel)||1));
    return {completed,stars,rewards,scores,treasures,unlocked};
  }

  function normalizeProgress(pr){
    pr.completed=[...new Set(pr.completed.map(Number).filter(n=>n>=1&&n<=LEVELS.length))].sort((a,b)=>a-b);
    Object.keys(pr.stars).forEach(k=>{ const n=Math.max(0,Math.min(3,Number(pr.stars[k])||0)); pr.stars[k]=n; });
    pr.unlocked=Math.max(1,Math.min(LEVELS.length,Number(pr.unlocked)||1));
    return pr;
  }
  function saveProgress(pr){
    normalizeProgress(pr);
    save(PROGRESS_KEY,pr);
    save('gr_completed_levels',pr.completed);
    save('gr_level_stars',pr.stars);
  }

  function getUnlocked(pr){
    const profileLevel=Math.max(1,Math.min(LEVELS.length,Number(getProfile().currentLevel)||1));
    const maxUnlocked=Math.max(pr.unlocked,profileLevel);
    return Math.max(1,Math.min(LEVELS.length,maxUnlocked));
  }

  function isVisible(el){
    if(!el) return false;
    if(el.classList.contains('hidden')) return false;
    const s=getComputedStyle(el);
    return s.display!=='none' && s.visibility!=='hidden' && Number(s.opacity||1)>0;
  }

  function readNumber(selector){
    const el=document.querySelector(selector);
    if(!el) return 0;
    const n=Number(String(el.textContent||'').replace(/[^0-9.-]/g,''));
    return Number.isFinite(n)?n:0;
  }

  function readCurrentScore(){
    return Math.max(0,readNumber('#score-current'),readNumber('#score'));
  }
  function readCurrentTreasure(){
    return Math.max(0,readNumber('#coin-count'));
  }

  function calculateStars(level,score,treasure){
    // Completion itself gives 1 star. Higher stars are performance milestones.
    // These are deliberately independent of combat actions.
    let stars=1;
    if(score>=10000 || treasure>=10) stars=2;
    if(score>=25000 || treasure>=25) stars=3;
    return stars;
  }

  function installProgressionStyle(){
    if(document.getElementById('level-progression-style')) return;
    const style=document.createElement('style');
    style.id='level-progression-style';
    style.textContent=`
      #level-progression-result{margin:14px auto 0;max-width:520px;padding:14px 16px;border:1px solid rgba(110,210,255,.28);border-radius:16px;background:linear-gradient(135deg,rgba(10,30,62,.88),rgba(4,10,26,.92));box-shadow:0 0 24px rgba(40,170,255,.12),inset 0 0 22px rgba(100,200,255,.05);text-align:center;color:#eaf6ff;font-family:inherit}
      #level-progression-result .lp-title{font-size:11px;letter-spacing:.18em;font-weight:900;color:#7fdcff}
      #level-progression-result .lp-stars{font-size:30px;letter-spacing:4px;margin:6px 0 3px;line-height:1}
      #level-progression-result .lp-star.off{opacity:.18;filter:grayscale(1)}
      #level-progression-result .lp-reward{font-size:12px;font-weight:800;color:#ffe28a}
      #level-progression-result .lp-unlock{margin-top:7px;font-size:10px;font-weight:900;letter-spacing:.08em;color:#79f6c4}
      #level-progression-result .lp-note{margin-top:6px;font-size:9px;color:#87a5c4;letter-spacing:.05em}
    `;
    document.head.appendChild(style);
  }

  function showCompletionResult(level,stars,rewardDelta,unlockedNext,score,treasure){
    installProgressionStyle();
    const overlay=document.getElementById('overlay-win');
    if(!overlay) return;
    let box=document.getElementById('level-progression-result');
    if(!box){ box=document.createElement('div'); box.id='level-progression-result';
      const summary=document.getElementById('win-summary');
      if(summary && summary.parentNode) summary.parentNode.insertBefore(box,summary.nextSibling);
      else overlay.appendChild(box);
    }
    const starsHtml=[1,2,3].map(i=>`<span class="lp-star ${i<=stars?'':'off'}">★</span>`).join('');
    const next=level.level_number<LEVELS.length ? `PLANET ${level.level_number+1} UNLOCKED` : 'SOLAR JOURNEY COMPLETE';
    box.innerHTML=`<div class="lp-title">LEVEL COMPLETE • ${level.name.toUpperCase()}</div>
      <div class="lp-stars" aria-label="${stars} of 3 stars">${starsHtml}</div>
      <div class="lp-reward">BASE REWARD ${level.reward_coins} • STAR BONUS ${rewardDelta}</div>
      <div class="lp-unlock">${unlockedNext?next:'PROGRESS SAVED'}</div>
      <div class="lp-note">Score ${score.toLocaleString()} • Treasure ${treasure.toLocaleString()}</div>`;
  }

  function addStarBonus(level,oldStars,newStars){
    // game.js already owns the normal level reward. We only add the one-time
    // performance bonus for newly earned stars, preventing duplicate base rewards.
    const bonusPerNewStar=25;
    const delta=Math.max(0,newStars-oldStars)*bonusPerNewStar;
    if(!delta) return 0;
    const p=getProfile();
    p.coins=(Number(p.coins)||0)+delta;
    saveProfile(p);
    return delta;
  }

  function completeLevel(levelNumber){
    const level=LEVELS.find(x=>x.level_number===Number(levelNumber));
    if(!level) return;
    const pr=getProgress();
    const score=readCurrentScore();
    const treasure=readCurrentTreasure();
    const stars=calculateStars(level,score,treasure);
    const oldStars=Math.max(0,Number(pr.stars[level.level_number])||0);
    const bestStars=Math.max(oldStars,stars);
    const rewardDelta=addStarBonus(level,oldStars,bestStars);

    pr.completed.push(level.level_number);
    pr.stars[level.level_number]=bestStars;
    pr.scores[level.level_number]=Math.max(Number(pr.scores[level.level_number])||0,score);
    pr.treasures[level.level_number]=Math.max(Number(pr.treasures[level.level_number])||0,treasure);
    pr.unlocked=Math.max(pr.unlocked,Math.min(LEVELS.length,level.level_number+1));
    pr.rewards[level.level_number]=true;
    saveProgress(pr);

    const profile=getProfile();
    profile.currentLevel=Math.max(Number(profile.currentLevel)||1,Math.min(LEVELS.length,level.level_number+1));
    profile.bestScore=Math.max(Number(profile.bestScore)||0,score);
    saveProfile(profile);

    showCompletionResult(level,bestStars,rewardDelta,level.level_number<LEVELS.length,score,treasure);
    if(window.Achievements && typeof window.Achievements.refresh==='function') window.Achievements.refresh();
    render();
  }

  function watchWinOverlay(){
    const overlay=document.getElementById('overlay-win');
    if(!overlay || overlay.dataset.progressionObserved==='1') return;
    overlay.dataset.progressionObserved='1';
    const check=()=>{
      const visible=isVisible(overlay);
      if(visible && !lastWinVisible){
        lastWinVisible=true;
        if(!completionHandled){
          completionHandled=true;
          completeLevel(activeLevel || Number(getProfile().currentLevel)-1 || 1);
        }
      }
      if(!visible){ lastWinVisible=false; completionHandled=false; }
    };
    const mo=new MutationObserver(check);
    mo.observe(overlay,{attributes:true,attributeFilter:['class','style','aria-hidden']});
    setInterval(check,500);
    check();
  }

  function wrapStartLevel(){
    if(typeof window.startLevel!=='function' || window.startLevel.__levelProgressWrapped) return;
    const original=window.startLevel;
    function wrapped(level){
      const n=Number(level);
      if(Number.isFinite(n) && n>=1 && n<=LEVELS.length){
        const pr=getProgress();
        if(n>getUnlocked(pr)) return false;
        activeLevel=n;
        localStorage.setItem('gr_active_level',String(n));
      }
      return original.apply(this,arguments);
    }
    wrapped.__levelProgressWrapped=true;
    wrapped.__original=original;
    window.startLevel=wrapped;
  }

  function render(){
    const list=document.getElementById('level-list');
    if(!list) return;
    const pr=getProgress();
    const unlocked=getUnlocked(pr);
    pr.unlocked=unlocked;
    saveProgress(pr);
    list.innerHTML='';

    LEVELS.forEach((l)=>{
      const n=l.level_number;
      const locked=n>unlocked;
      const cleared=pr.completed.indexOf(n)!==-1;
      const stars=Math.max(0,Math.min(3,Number(pr.stars[n])||0));
      const m=META[n];
      const card=document.createElement('button');
      card.type='button';
      card.className='planet-card-pro'+(locked?' locked':'');
      card.dataset.level=String(n);
      card.innerHTML=`<div class="planet-card-art">
        <img src="assets/levels/${l.planet}.png" alt="${l.name}" loading="lazy">
        <div class="planet-shade"></div>
        <div class="planet-level">LEVEL ${n}</div>
        ${cleared?'<div class="planet-complete">CLEARED</div>':''}
        ${locked?'<div class="planet-lock-pro"><span>🔒</span><small>COMPLETE PREVIOUS LEVEL</small></div>':''}
      </div>
      <div class="planet-card-info">
        <div class="planet-card-top"><div class="planet-name">${l.name}</div><div class="planet-diff">${m.diff}</div></div>
        <div class="planet-tag">${m.tag}</div>
        <div class="planet-stats"><span>◉ ${l.distance.toLocaleString()} KM</span><span>＋${l.reward_coins}</span></div>
        <div class="planet-stars" aria-label="${stars} of 3 stars">${[1,2,3].map(i=>`<span class="level-star ${i<=stars?'on':''}">★</span>`).join('')}</div>
      </div>`;
      if(!locked){
        card.addEventListener('click',()=>{
          activeLevel=n;
          localStorage.setItem('gr_active_level',String(n));
          if(typeof window.startLevel==='function') window.startLevel(n);
        });
      }
      list.appendChild(card);
    });
  }

  function observeLevelScreen(){
    const screen=document.getElementById('level-select');
    if(!screen || screen.dataset.proObserved==='1') return;
    screen.dataset.proObserved='1';
    const update=()=>{ if(isVisible(screen)) render(); };
    const mo=new MutationObserver(update);
    mo.observe(screen,{attributes:true,attributeFilter:['class','style','aria-hidden']});
    update();
  }

  function boot(){
    render();
    observeLevelScreen();
    watchWinOverlay();
    wrapStartLevel();
    setTimeout(wrapStartLevel,300);
    setTimeout(wrapStartLevel,1000);
    setInterval(wrapStartLevel,1500);
  }

  window.LevelSelectPro={render,completeLevel,getProgress,levels:LEVELS};
  window.renderLevelSelect=render;

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
