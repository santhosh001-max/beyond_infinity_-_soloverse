/* PlanetScienceCard — reusable level-entry science briefing */
(function(){
  const KEY='soloverse_science_seen_v1';
  const DATA={
    Moon:{emoji:'🌙',facts:[
      'The Moon formed about 4.5 billion years ago.',
      'Surface gravity is about one-sixth of Earth’s.',
      'Earth and the Moon are tidally locked, so the same lunar hemisphere generally faces Earth.',
      'Moonquakes have been detected by seismometers left by Apollo astronauts.'
    ],source:'NASA — Moon Facts',url:'https://science.nasa.gov/moon/facts/'},
    Mars:{emoji:'🔴',facts:[
      'Mars has about 38% of Earth’s surface gravity.',
      'Olympus Mons is the largest volcano known in the Solar System.',
      'Valles Marineris is a gigantic canyon system on Mars.',
      'Ancient river valleys, deltas and lakebeds show that Mars once had liquid water on its surface.'
    ],source:'NASA — Mars Facts',url:'https://science.nasa.gov/mars/facts/'},
    Venus:{emoji:'🟠',facts:[
      'Venus is the hottest planet in the Solar System.',
      'Its thick atmosphere is mostly carbon dioxide and drives a powerful greenhouse effect.',
      'Venus has clouds containing sulfuric acid.',
      'Surface pressure is about 93 times Earth’s sea-level pressure.'
    ],source:'NASA — Venus Facts',url:'https://science.nasa.gov/venus/venus-facts/'},
    Mercury:{emoji:'☀️',facts:[
      'Mercury is the smallest planet and the closest planet to the Sun.',
      'Daytime surface temperatures can reach about 430°C, while nighttime temperatures can fall to about −180°C.',
      'Mercury has a very thin exosphere rather than a substantial atmosphere.',
      'Mercury is not the hottest planet — Venus is hotter because of its dense atmosphere.'
    ],source:'NASA — Mercury Facts',url:'https://science.nasa.gov/mercury/facts/'},
    Jupiter:{emoji:'🟤',facts:[
      'Jupiter is the largest planet in the Solar System.',
      'It is a gas giant with no solid surface like Earth.',
      'The Great Red Spot is a giant storm in Jupiter’s atmosphere.',
      'Jupiter has four famous large moons: Io, Europa, Ganymede and Callisto.'
    ],source:'NASA — Jupiter Facts',url:'https://science.nasa.gov/jupiter/jupiter-facts/'},
    Saturn:{emoji:'🪐',facts:[
      'Saturn is the second-largest planet and a gas giant.',
      'Its rings are made mostly of ice particles, with rock and dust mixed in.',
      'Saturn has many moons, including Titan.',
      'Titan has a thick atmosphere and lakes and seas of liquid methane and ethane.'
    ],source:'NASA — Saturn & Titan Facts',url:'https://science.nasa.gov/saturn/facts/'},
    Uranus:{emoji:'🔵',facts:[
      'Uranus is an ice giant.',
      'Its axis is tilted about 98°, giving it an unusual sideways-looking rotation.',
      'Uranus has faint rings.',
      'Methane absorbs red light, contributing to Uranus’s blue-green appearance.'
    ],source:'NASA — Uranus Facts',url:'https://science.nasa.gov/uranus/facts/'},
    Neptune:{emoji:'🔵',facts:[
      'Neptune is the eighth and most distant major planet from the Sun.',
      'Neptune is an ice giant with no solid surface.',
      'It has some of the fastest winds known on any planet in the Solar System.',
      'Neptune’s atmosphere contains methane, which contributes to its blue appearance; Triton is its largest moon.'
    ],source:'NASA — Neptune Facts',url:'https://science.nasa.gov/neptune/neptune-facts/'}
  };
  function seen(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return {}}}
  function mark(name){const s=seen();s[name]=true;try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}}
  function bodyName(level){
    const n=String(level?.name||'').trim();
    const map={Moon:'Moon',Mars:'Mars',Venus:'Venus',Mercury:'Mercury',Jupiter:'Jupiter',Saturn:'Saturn',Uranus:'Uranus',Neptune:'Neptune'};
    return map[n]||Object.keys(map).find(k=>n.toLowerCase().includes(k.toLowerCase()))||null;
  }
  let resolver=null;
  function close(start=true){const el=document.getElementById('planet-science-modal');if(!el)return;el.classList.add('hidden');el.setAttribute('aria-hidden','true');document.body.classList.remove('science-card-open');if(resolver){const r=resolver;resolver=null;r(start)}}
  function render(name){
    const d=DATA[name],el=document.getElementById('planet-science-modal');if(!d||!el)return;
    el.innerHTML='<div class="psc-backdrop"></div><section class="psc-panel" role="dialog" aria-modal="true" aria-labelledby="psc-title">'+
      '<button class="psc-close" aria-label="Skip science briefing">×</button>'+
      '<div class="psc-kicker">SOL OVERSE • SCIENCE BRIEFING</div>'+
      '<div class="psc-icon">'+d.emoji+'</div><div class="psc-label">DID YOU KNOW?</div>'+
      '<h2 id="psc-title">'+name+'</h2><div class="psc-facts">'+d.facts.map((f,i)=>'<div class="psc-fact"><span>'+String(i+1).padStart(2,'0')+'</span><p>'+f+'</p></div>').join('')+'</div>'+
      '<div class="psc-source">SOURCE: <a href="'+d.url+'" target="_blank" rel="noopener noreferrer">'+d.source+' ↗</a></div>'+
      '<button class="psc-start">START MISSION <span>›</span></button>'+
      '</section>';
    el.querySelector('.psc-close').onclick=()=>close(true);
    el.querySelector('.psc-backdrop').onclick=()=>close(true);
    el.querySelector('.psc-start').onclick=()=>close(true);
  }
  function show(level){
    const name=bodyName(level); if(!name)return Promise.resolve(true);
    if(seen()[name])return Promise.resolve(true);
    return new Promise(resolve=>{
      resolver=resolve; render(name);
      const el=document.getElementById('planet-science-modal');
      el.classList.remove('hidden');el.setAttribute('aria-hidden','false');document.body.classList.add('science-card-open');
      mark(name);
    });
  }
  window.PlanetScienceCard={show,close,render,data:DATA};
})();