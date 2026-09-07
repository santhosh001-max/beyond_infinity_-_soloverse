(function(){
  'use strict';
  const PLANET_META={1:{tag:'LUNAR FRONTIER',tone:'moon',difficulty:'EASY'},2:{tag:'RED PLANET',tone:'mars',difficulty:'EASY+'},3:{tag:'CLOUD WORLD',tone:'venus',difficulty:'NORMAL'},4:{tag:'MERCURY RUN',tone:'mercury',difficulty:'NORMAL+'},5:{tag:'GIANT STORM',tone:'jupiter',difficulty:'HARD'},6:{tag:'RINGED GIANT',tone:'saturn',difficulty:'HARD+'},7:{tag:'ICE GIANT',tone:'uranus',difficulty:'EXTREME'},8:{tag:'DEEP BLUE',tone:'neptune',difficulty:'EXTREME+'}};
  function completedSet(){try{return JSON.parse(localStorage.getItem('gr_completed_levels')||'{}')}catch(e){return {}}}
  function starsFor(level,done){if(!done)return 0;try{const s=JSON.parse(localStorage.getItem('gr_level_stars')||'{}');return Math.max(1,Math.min(3,Number(s[level.level_number]||3)))}catch(e){return 3}}
  function stars(n){return [1,2,3].map(i=>`<span class="level-star ${i<=n?'on':''}">★</span>`).join('')}
  function render(){
    const list=document.getElementById('level-list'); if(!list||!window.state)return;
    const completed=completedSet(); list.innerHTML='';
    window.state.levels.forEach(level=>{
      const n=Number(level.level_number), locked=n>Number(window.state.profile.currentLevel||1), done=!!completed[n], meta=PLANET_META[n]||{}, planetKey=level.planet||LEVEL_PLANET_IMG[n];
      const card=document.createElement('button'); card.type='button'; card.className=`planet-card-pro ${locked?'locked':''} ${done?'completed':''} tone-${meta.tone||'space'}`; card.disabled=locked;
      card.innerHTML=`<div class="planet-card-art"><img src="assets/levels/${planetKey}.png" alt="${level.name}" loading="eager"><div class="planet-shade"></div><div class="planet-level">LEVEL ${String(n).padStart(2,'0')}</div>${locked?'<div class="planet-lock-pro"><span>🔒</span><small>LOCKED</small></div>':''}${done?'<div class="planet-complete">✓ CLEARED</div>':''}</div><div class="planet-card-info"><div class="planet-card-top"><span class="planet-name">${level.name}</span><span class="planet-diff">${meta.difficulty||'NORMAL'}</span></div><div class="planet-tag">${meta.tag||'DEEP SPACE'}</div><div class="planet-stats"><span>◉ ${(level.distance||0).toLocaleString()} km</span><span>💎 ${level.reward_coins||0}</span></div><div class="planet-stars">${stars(starsFor(level,done))}</div></div>`;
      if(!locked)card.onclick=()=>{if(window.Sound&&Sound.click)Sound.click();startLevel(n)}; list.appendChild(card);
    });
  }
  function mark(levelNumber,starCount){try{const d=completedSet();d[levelNumber]=true;localStorage.setItem('gr_completed_levels',JSON.stringify(d));const s=JSON.parse(localStorage.getItem('gr_level_stars')||'{}');s[levelNumber]=Math.max(1,Math.min(3,Number(starCount||3)));localStorage.setItem('gr_level_stars',JSON.stringify(s))}catch(e){}}
  window.LevelSelectPro={render,mark};
  window.addEventListener('load',()=>setTimeout(render,0));
})();
