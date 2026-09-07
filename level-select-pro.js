(function(){
  'use strict';
  const LEVELS=[
    {level_number:1,name:'The Moon',distance:2500,reward_coins:120,planet:'planet1_moon'},
    {level_number:2,name:'Mars',distance:3200,reward_coins:170,planet:'planet2_mars'},
    {level_number:3,name:'Venus',distance:4000,reward_coins:220,planet:'planet3_venus'},
    {level_number:4,name:'Mercury',distance:4800,reward_coins:280,planet:'planet4_mercury'},
    {level_number:5,name:'Jupiter',distance:5600,reward_coins:340,planet:'planet5_jupiter'},
    {level_number:6,name:'Saturn',distance:6400,reward_coins:400,planet:'planet6_saturn'},
    {level_number:7,name:'Uranus',distance:7200,reward_coins:470,planet:'planet7_uranus'},
    {level_number:8,name:'Neptune',distance:8000,reward_coins:550,planet:'planet8_neptune'}
  ];
  const META={1:['LUNAR FRONTIER','EASY'],2:['RED PLANET','EASY+'],3:['CLOUD WORLD','NORMAL'],4:['MERCURY RUN','NORMAL+'],5:['GIANT STORM','HARD'],6:['RINGED GIANT','HARD+'],7:['ICE GIANT','EXTREME'],8:['DEEP BLUE','EXTREME+']};
  function profile(){try{return JSON.parse(localStorage.getItem('gr_profile')||'{}')}catch(e){return {currentLevel:1}}}
  function completed(){try{return JSON.parse(localStorage.getItem('gr_completed_levels')||'{}')}catch(e){return {}}}
  function starsFor(n,done){if(!done)return 0;try{const s=JSON.parse(localStorage.getItem('gr_level_stars')||'{}');return Math.max(1,Math.min(3,Number(s[n]||3)))}catch(e){return 3}}
  function starHtml(n){return [1,2,3].map(i=>`<span class="level-star ${i<=n?'on':''}">★</span>`).join('')}
  function render(){
    const list=document.getElementById('level-list'); if(!list)return;
    const p=profile(), done=completed(), maxUnlocked=Number(p.currentLevel||1); list.innerHTML='';
    LEVELS.forEach(level=>{
      const n=level.level_number, locked=n>maxUnlocked, cleared=!!done[n], meta=META[n]||['DEEP SPACE','NORMAL'];
      const card=document.createElement('button'); card.type='button'; card.className=`planet-card-pro ${locked?'locked':''} ${cleared?'completed':''}`; card.disabled=locked;
      card.innerHTML=`<div class="planet-card-art"><img src="assets/levels/${level.planet}.png" alt="${level.name}" loading="eager"><div class="planet-shade"></div><div class="planet-level">LEVEL ${String(n).padStart(2,'0')}</div>${locked?'<div class="planet-lock-pro"><span>🔒</span><small>LOCKED</small></div>':''}${cleared?'<div class="planet-complete">✓ CLEARED</div>':''}</div><div class="planet-card-info"><div class="planet-card-top"><span class="planet-name">${level.name}</span><span class="planet-diff">${meta[1]}</span></div><div class="planet-tag">${meta[0]}</div><div class="planet-stats"><span>◉ ${level.distance.toLocaleString()} km</span><span>💎 ${level.reward_coins}</span></div><div class="planet-stars">${starHtml(starsFor(n,cleared))}</div></div>`;
      if(!locked)card.onclick=()=>startLevel(n);
      list.appendChild(card);
    });
  }
  function mark(n,starCount){try{const d=completed();d[n]=true;localStorage.setItem('gr_completed_levels',JSON.stringify(d));const s=JSON.parse(localStorage.getItem('gr_level_stars')||'{}');s[n]=Math.max(1,Math.min(3,Number(starCount||3)));localStorage.setItem('gr_level_stars',JSON.stringify(s))}catch(e){}}
  window.LevelSelectPro={render,mark};
  window.renderLevelSelect=render;
  window.addEventListener('load',()=>setTimeout(render,100));
  let activeLevel=0;
  if(typeof window.startLevel==='function'){const originalStart=window.startLevel;window.startLevel=async function(n){activeLevel=Number(n);return originalStart.apply(this,arguments)}}
  if(typeof window.winLevel==='function'){const originalWin=window.winLevel;window.winLevel=async function(){const result=await originalWin.apply(this,arguments);if(activeLevel)mark(activeLevel,3);return result}}
})();
