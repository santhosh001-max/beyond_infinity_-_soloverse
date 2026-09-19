/* Explore — Soloverse Knowledge Hub */
(function(){
'use strict';

const FACTS=[
  {tag:'SOLAR SYSTEM',title:'Our cosmic neighborhood',body:'The Solar System contains the Sun, eight planets, five officially named dwarf planets, hundreds of moons, and thousands of asteroids and comets.',source:'NASA — Solar System Facts',url:'https://science.nasa.gov/solar-system/solar-system-facts/'},
  {tag:'MOON',title:'Earth’s natural satellite',body:'The Moon is about 385,000 km from Earth on average. Earth and Moon are tidally locked, so we see nearly the same lunar hemisphere from Earth.',source:'NASA — Moon Facts',url:'https://science.nasa.gov/moon/facts/'},
  {tag:'MARS',title:'A cold desert world',body:'Mars is the fourth planet from the Sun. It has a thin atmosphere, seasons, polar ice caps, ancient volcanoes and huge canyons. Evidence shows it was wetter and warmer billions of years ago.',source:'NASA — Mars Facts',url:'https://science.nasa.gov/mars/facts/'},
  {tag:'PLANETS',title:'Eight worlds, three broad groups',body:'Mercury, Venus, Earth and Mars are terrestrial planets. Jupiter and Saturn are gas giants, while Uranus and Neptune are ice giants.',source:'NASA — About the Planets',url:'https://science.nasa.gov/solar-system/planets/'},
  {tag:'INDIA',title:'India’s lunar exploration',body:'Chandrayaan-3 demonstrated a successful soft landing on the Moon and surface mobility, adding important engineering experience to India’s lunar exploration programme.',source:'ISRO — Chandrayaan-3',url:'https://www.isro.gov.in/Chandrayaan3_Details.html'},
  {tag:'SPACE SCIENCE',title:'Exploration keeps moving',body:'Space agencies continue to study planets, stars, galaxies and the space environment through missions and observatories. This knowledge is updated as new observations arrive.',source:'ESA — Space Science',url:'https://www.esa.int/Science_Exploration/Space_Science'}
];

let index=0;

function open(){const r=document.getElementById('explore-modal');if(!r)return;render();r.classList.remove('hidden');r.setAttribute('aria-hidden','false');document.body.classList.add('explore-open');}
function close(){const r=document.getElementById('explore-modal');if(!r)return;r.classList.add('hidden');r.setAttribute('aria-hidden','true');document.body.classList.remove('explore-open');}
function render(){
 const r=document.getElementById('explore-modal');if(!r)return;
 const f=FACTS[index];
 r.innerHTML='<div class="ex-backdrop" data-ex-close></div><section class="ex-panel" role="dialog" aria-modal="true" aria-labelledby="ex-title">'+
 '<header class="ex-head"><div><div class="ex-kicker">SOL OVERSE • KNOWLEDGE HUB</div><h1 id="ex-title">EXPLORE</h1><p>Learn a fact. Discover more. Keep exploring.</p></div><button class="ex-close" data-ex-close aria-label="Close Explore">×</button></header>'+
 '<nav class="ex-tabs" aria-label="Explore topics">'+FACTS.map((x,i)=>'<button class="'+(i===index?'active':'')+'" data-ex-index="'+i+'">'+x.tag+'</button>').join('')+'</nav>'+
 '<article class="ex-card"><div class="ex-number">'+String(index+1).padStart(2,'0')+' / '+String(FACTS.length).padStart(2,'0')+'</div><div class="ex-tag">'+f.tag+'</div><h2>'+f.title+'</h2><p>'+f.body+'</p><div class="ex-source"><span>OFFICIAL SOURCE</span><a href="'+f.url+'" target="_blank" rel="noopener noreferrer">'+f.source+' ↗</a></div></article>'+
 '<div class="ex-nav"><button id="ex-prev" '+(index===0?'disabled':'')+'>‹ PREVIOUS</button><button id="ex-next" '+(index===FACTS.length-1?'disabled':'')+'>NEXT ›</button></div>'+
 '<footer class="ex-foot"><span>FACTS ARE CURATED FROM OFFICIAL SPACE AGENCIES.</span><span>CHECK SOURCE FOR NEW UPDATES.</span></footer></section>';
 r.querySelectorAll('[data-ex-close]').forEach(e=>e.onclick=close);
 r.querySelectorAll('[data-ex-index]').forEach(e=>e.onclick=()=>{index=Number(e.dataset.exIndex);render()});
 const p=r.querySelector('#ex-prev'),n=r.querySelector('#ex-next');if(p)p.onclick=()=>{if(index>0){index--;render()}};if(n)n.onclick=()=>{if(index<FACTS.length-1){index++;render()}};
}
window.ExplorePage={open,close,render};
document.addEventListener('DOMContentLoaded',()=>{
 const b=document.getElementById('hotspot-explore');if(b)b.addEventListener('click',()=>{if(typeof Sound!=='undefined'&&Sound.click)Sound.click();open()});
});
})();
