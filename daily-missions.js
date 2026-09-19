/* Daily Missions — Soloverse */
(function(){
'use strict';
const KEY='soloverse_daily_missions_v1';
const POOL=[
{id:'complete_level',icon:'🪐',title:'Planetary Expedition',desc:'Complete any level',target:1,reward:120,unit:'level'},
{id:'collect_rupees',icon:'💎',title:'Cosmic Collector',desc:'Collect Rupees during runs',target:300,reward:90,unit:'Rupees'},
{id:'play_runs',icon:'🚀',title:'Keep Exploring',desc:'Finish 3 runs',target:3,reward:110,unit:'runs'},
{id:'infinity_score',icon:'∞',title:'Infinity Trial',desc:'Reach 5,000 score in Infinity',target:5000,reward:150,unit:'score'},
{id:'complete_two',icon:'🌌',title:'Deep Space Route',desc:'Complete 2 levels',target:2,reward:180,unit:'levels'},
{id:'collect_rupees_big',icon:'✨',title:'Treasure Run',desc:'Collect 600 Rupees during runs',target:600,reward:180,unit:'Rupees'}
];
const pad=n=>String(n).padStart(2,'0');
function date(){const d=new Date();return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function missions(d){let p=POOL.slice(),seed=hash(d),a=[];while(a.length<3){seed=(Math.imul(seed,1664525)+1013904223)>>>0;a.push({...p.splice(seed%p.length,1)[0],progress:0,claimed:false})}return a}
function save(x){localStorage.setItem(KEY,JSON.stringify(x))}
function load(){let d=date(),x=null;try{x=JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){}if(!x||x.date!==d||!Array.isArray(x.missions)){x={date:d,missions:missions(d)};save(x)}return x}
function add(id,n,setMax){let x=load(),changed=false;x.missions.forEach(m=>{if(m.id!==id||m.claimed)return;let v=setMax?Math.max(m.progress,n):m.progress+n;v=Math.max(0,Math.min(m.target,v));if(v!==m.progress){m.progress=v;changed=true}});if(changed)save(x);refresh()}
function record(o){o=o||{};add('play_runs',1);add('collect_rupees',Math.max(0,Number(o.coins)||0));add('collect_rupees_big',Math.max(0,Number(o.coins)||0));if(o.mode==='infinity')add('infinity_score',Math.max(0,Number(o.score)||0),true);if(o.won){add('complete_level',1);add('complete_two',1)}}
function claim(i){let x=load(),m=x.missions[i];if(!m||m.claimed||m.progress<m.target)return;m.claimed=true;save(x);let p=typeof state!=='undefined'&&state.profile?state.profile:null;if(p){p.coins=Number(p.coins||0)+m.reward;if(typeof saveLocalProfile==='function')saveLocalProfile(p);let e=document.getElementById('coin-count');if(e)e.textContent=p.coins}else{let q=JSON.parse(localStorage.getItem('gr_profile')||'{"coins":0}');q.coins=Number(q.coins||0)+m.reward;localStorage.setItem('gr_profile',JSON.stringify(q))}if(typeof Sound!=='undefined'&&Sound.click)Sound.click();render();if(typeof showToast==='function')showToast('🎁 Mission reward +'+m.reward+' Rupees')}
function open(){let r=document.getElementById('daily-missions-modal');if(!r)return;render();r.classList.remove('hidden');document.body.classList.add('daily-missions-open')}
function close(){let r=document.getElementById('daily-missions-modal');if(!r)return;r.classList.add('hidden');document.body.classList.remove('daily-missions-open');clearInterval(timer)}
function render(){let r=document.getElementById('daily-missions-modal');if(!r)return;let x=load(),done=x.missions.filter(m=>m.progress>=m.target).length;r.innerHTML='<div class="dm-backdrop" data-close></div><section class="dm-panel" role="dialog" aria-modal="true" aria-labelledby="dm-title"><header class="dm-head"><div><div class="dm-kicker">SOL OVERSE • COMMAND CENTER</div><h1 id="dm-title">DAILY MISSIONS</h1><p>Complete today’s objectives and collect your rewards.</p></div><button class="dm-close" data-close aria-label="Close">×</button></header><div class="dm-status"><div><small>TODAY</small><b>'+x.date+'</b></div><div><small>OBJECTIVES</small><b>'+done+' / 3 COMPLETE</b></div><div><small>RESET IN</small><b id="dm-clock">—</b></div></div><div class="dm-list">'+x.missions.map((m,i)=>{let pct=Math.min(100,Math.round(m.progress/m.target*100)),ok=m.progress>=m.target;return '<article class="dm-card '+(ok?'complete ':'')+(m.claimed?'claimed':'')+'"><div class="dm-icon">'+m.icon+'</div><div class="dm-main"><div class="dm-title-row"><div><h2>'+m.title+'</h2><p>'+m.desc+'</p></div><span>💎 +'+m.reward+'</span></div><div class="dm-meta"><span>'+Math.floor(m.progress).toLocaleString()+' / '+m.target.toLocaleString()+'</span><b>'+pct+'%</b></div><div class="dm-track"><i style="width:'+pct+'%"></i></div></div><button class="dm-claim" data-claim="'+i+'" '+(!ok||m.claimed?'disabled':'')+'>'+(m.claimed?'CLAIMED ✓':ok?'CLAIM':'IN PROGRESS')+'</button></article>'}).join('')+'</div><footer><span>♻ Progress is saved on this device.</span><b>'+ (x.missions.every(m=>m.claimed)?'ALL REWARDS CLAIMED':'KEEP EXPLORING, PILOT') +'</b></footer></section>';
r.querySelectorAll('[data-close]').forEach(e=>e.onclick=close);r.querySelectorAll('[data-claim]').forEach(e=>e.onclick=()=>claim(Number(e.dataset.claim)));clock()}
let timer;
function clock(){clearInterval(timer);let e=document.getElementById('dm-clock');if(!e)return;function t(){let n=new Date(),z=new Date(n);z.setHours(24,0,0,0);let s=Math.max(0,z-n)/1000,h=Math.floor(s/3600),m=Math.floor(s%3600/60),q=Math.floor(s%60);e.textContent=pad(h)+':'+pad(m)+':'+pad(q);if(s<=0)render()}t();timer=setInterval(t,1000)}
function refresh(){let b=document.getElementById('daily-mission-badge');if(!b)return;let n=load().missions.filter(m=>m.progress>=m.target&&!m.claimed).length;b.textContent=n?n:'';b.classList.toggle('has-count',n>0)}
function recordRunEnd(o){
  o=o||{};
  // Count a run when the run actually ends. A won level also advances
  // the level objectives; Infinity uses the final score.
  record({
    won:!!o.won,
    mode:o.mode||'levels',
    coins:Number(o.coins)||0,
    score:Number(o.score)||0
  });
}
window.DailyMissions={open,close,render,refresh,record,recordRunEnd,getData:load};
document.addEventListener('DOMContentLoaded',()=>{refresh();let b=document.getElementById('hotspot-daily-missions');if(b)b.addEventListener('click',()=>{if(typeof Sound!=='undefined'&&Sound.click)Sound.click();open()})});
})();