/* DinkSense — local-first pickleball athlete intelligence
   Built as a dependency-free progressive web app. */
'use strict';

const APP_VERSION = '1.7.0';
const DB_NAME = 'DinkSenseDB';
const DB_VERSION = 1;
const STATE_KEY = 'dinksense.state.v1';

const NAV_ITEMS = [
  ['dashboard', '⌂', 'Home'],
  ['track', '＋', 'Track'],
  ['analytics', '◫', 'Analytics'],
  ['train', '◎', 'Train'],
  ['video', '▶', 'Video'],
  ['discover', '⌖', 'Discover'],
  ['health', '♡', 'Health'],
  ['gear', '◇', 'Gear'],
  ['compete', '⚑', 'Compete'],
  ['profile', '◉', 'Profile'],
  ['founder', '✦', 'Founder'],
  ['settings', '⚙', 'Settings']
];

const DRILLS = [
  {id:'dink-100', name:'100-Dink Control Ladder', skill:'Dink consistency', level:'All', minutes:12, solo:false, tags:['dink','kitchen','consistency'], description:'Build from cooperative cross-court dinks to directional pressure. Restart the count after every unforced error.', steps:['25 forehand cross-court','25 backhand cross-court','25 alternating middle/body','25 with one intentional speed-up every 8 balls']},
  {id:'wall-reset', name:'Wall Reset Rhythm', skill:'Backhand reset', level:'All', minutes:10, solo:true, tags:['reset','backhand','transition'], description:'Use a wall or rebounder to groove a soft, repeatable reset from a compact ready position.', steps:['2 min soft catches','4 × 45 sec backhand resets','4 × 45 sec alternating resets','Finish with 20 perfect reps']},
  {id:'third-drop', name:'Third-Shot Drop Flight School', skill:'Third-shot drop', level:'Intermediate', minutes:18, solo:false, tags:['drop','third shot','transition'], description:'Score each drop by whether it lands unattackable in the kitchen. Progress only after 7/10.', steps:['10 from midcourt','20 from baseline','10 under movement','10 pressure reps: miss = restart at zero']},
  {id:'serve-depth', name:'Deep Serve Grid', skill:'Serve quality', level:'All', minutes:12, solo:true, tags:['serve','depth','accuracy'], description:'Divide the back third of the service box into three lanes and score depth plus location.', steps:['10 deuce wide','10 deuce body','10 ad wide','10 ad body','10 best-target pressure serves']},
  {id:'return-plus', name:'Return + Four', skill:'Return and approach', level:'Intermediate', minutes:14, solo:false, tags:['return','footwork','transition'], description:'Hit a deep return, split step, and play the next four balls with disciplined court positioning.', steps:['5 shadow reps','10 cross-court returns','10 line returns','10 randomized points']},
  {id:'transition-gauntlet', name:'Transition Zone Gauntlet', skill:'Transition success', level:'Advanced', minutes:18, solo:false, tags:['transition','reset','footwork'], description:'Start at the baseline and earn the kitchen in three controlled contacts without giving up an attackable ball.', steps:['8 straight-line reps','8 diagonal reps','8 random feeds','First to 7 successful kitchen arrivals']},
  {id:'speedup-read', name:'Green-Light Speed-Up Reads', skill:'Attack timing', level:'Advanced', minutes:16, solo:false, tags:['dink','attack','decision'], description:'Call green, yellow, or red before attacking. Reward correct decisions more than raw winners.', steps:['20 recognition feeds','10 forehand attacks','10 backhand attacks','Play 7 points where bad attacks count double']},
  {id:'overhead-footwork', name:'Overhead Exit Footwork', skill:'Overhead', level:'Intermediate', minutes:12, solo:false, tags:['overhead','footwork','safety'], description:'Turn, create space, contact in front, then recover without backpedaling.', steps:['10 shadow turns','15 controlled overheads','10 overhead + recovery balls','5 pressure lobs']},
  {id:'hands-burst', name:'Fast Hands Burst', skill:'Volley speed', level:'Intermediate', minutes:10, solo:false, tags:['hands','volley','reaction'], description:'Short high-quality bursts at the kitchen line with complete rest between sets.', steps:['5 × 20 sec cooperative','5 × 15 sec body-line','3 × 20 sec random','Finish with first-to-5']},
  {id:'footwork-ladder', name:'Kitchen Footwork Ladder', skill:'Lateral movement', level:'All', minutes:10, solo:true, tags:['footwork','conditioning','kitchen'], description:'Stay low and square while moving efficiently across the NVZ line.', steps:['2 × shuffle-touch','2 × crossover-recover','2 × split-step reaction','3 × 30 sec random callouts']},
  {id:'pressure-10', name:'10–10 Pressure Simulator', skill:'Close-game execution', level:'All', minutes:15, solo:false, tags:['pressure','serve','decision'], description:'Every mini-game begins at 10–10. Track first-ball quality and decision discipline.', steps:['Play 6 mini-games','Alternate server each game','Log serve/return quality','Write one decision cue after each game']},
  {id:'core-lateral', name:'Lateral Core Circuit', skill:'Off-court strength', level:'All', minutes:18, solo:true, tags:['strength','core','recovery'], description:'Low-equipment circuit for lateral control and trunk stability. Stop for pain or unusual symptoms.', steps:['3 × 8 lateral lunges/side','3 × 20 sec side plank/side','3 × 10 dead bugs/side','3 × 20 sec skater holds']}
];

const PADDLES = [
  {id:'control-16', name:'Control 16', brand:'DinkSense Lab', price:129, shape:'Hybrid', thickness:16, weight:8.0, power:6, control:9, spin:8, grip:4.25, style:['patient','all-court'], note:'Soft touch, stable resets, and a forgiving sweet spot.'},
  {id:'power-14', name:'Power 14', brand:'DinkSense Lab', price:149, shape:'Elongated', thickness:14, weight:8.2, power:9, control:6, spin:8, grip:4.125, style:['aggressive','power'], note:'Fast through the air with extra reach and pop.'},
  {id:'balance-16', name:'Balance 16', brand:'DinkSense Lab', price:109, shape:'Standard', thickness:16, weight:7.8, power:7, control:8, spin:7, grip:4.0, style:['all-court','beginner'], note:'Easy handling and balanced performance for developing players.'},
  {id:'spin-hybrid', name:'Spin Hybrid', brand:'DinkSense Lab', price:169, shape:'Hybrid', thickness:16, weight:8.1, power:7, control:8, spin:10, grip:4.25, style:['aggressive','all-court'], note:'Textured face for shape, roll volleys, and controlled attacks.'},
  {id:'touch-light', name:'Touch Light', brand:'DinkSense Lab', price:89, shape:'Widebody', thickness:16, weight:7.5, power:5, control:9, spin:6, grip:4.0, style:['beginner','patient'], note:'Lightweight and forgiving for comfort-first play.'},
  {id:'pro-elongated', name:'Pro Elongated', brand:'DinkSense Lab', price:199, shape:'Elongated', thickness:16, weight:8.4, power:9, control:7, spin:9, grip:4.25, style:['power','aggressive'], note:'High swing weight, reach, and stability for experienced players.'}
];



const STYLE_PLAYBOOKS = [
  {
    id:'patient-dinker', name:'Patient Dinker', icon:'◎', summary:'Win with depth, neutral-ball discipline, and high-quality speed-up selection.',
    principles:['Create pressure with placement before pace','Make the opponent attack from below net height','Reset immediately after a neutral or defensive read'],
    drills:['dink-100','wall-reset','speedup-read']
  },
  {
    id:'aggressive-rusher', name:'Aggressive Net-Rusher', icon:'⚡', summary:'Take time away while keeping the first two transition contacts controlled.',
    principles:['Earn the kitchen behind a high-quality third ball','Attack body and dominant-side hip before chasing lines','Recover to a balanced base after every acceleration'],
    drills:['third-drop','transition-gauntlet','hands-burst']
  },
  {
    id:'power-baseliner', name:'Power Baseliner', icon:'↗', summary:'Use pace to produce a predictable fifth ball—not as a substitute for transition skill.',
    principles:['Drive with a planned next-ball pattern','Mix body and middle targets to reduce counter angles','Use a soft fifth ball when the drive creates a neutral block'],
    drills:['serve-depth','return-plus','third-drop']
  },
  {
    id:'complete-all-court', name:'Complete All-Court', icon:'◇', summary:'Switch styles based on score, opponent, and ball height without losing identity.',
    principles:['Name the point pattern before serving','Choose attack timing from ball quality, not impatience','Track which style wins against each opponent archetype'],
    drills:['pressure-10','speedup-read','transition-gauntlet']
  }
];

const DEFAULT_STATE = {
  version: APP_VERSION,
  createdAt: new Date().toISOString(),
  profile: {
    name: 'Player One', city: '', state: '', skill: 3.5, dupr: '', handedness: 'Right', style: 'All-court', goals: 'Improve transition-zone consistency', bio: '', publicEmail: '', avatar: '', privacy: 'private'
  },
  matches: [],
  sessions: [],
  health: [],
  goals: [],
  plan: [],
  challenges: [],
  courts: [],
  gear: [],
  videos: [],
  tournaments: [],
  rivals: {},
  badges: [],
  settings: { ollamaEnabled:false, ollamaUrl:'http://localhost:11434', ollamaModel:'llama3.2', weatherEnabled:true, units:'imperial', demoMode:false, autoAdaptPlan:true, adaptationSensitivity:'balanced' },
  coachHistory: [],
  planMeta: { goal:'', note:'', startDate:'', weeks:0, sessionsPerWeek:3, lastAdaptedAt:'', lastSignature:'', unreadAdaptation:false, history:[], undoSnapshot:null },
  experiments: [],
  customDrills: [],
  clubEvents: [],
  ladderPlayers: [],
  gearServices: [],
  movementScreens: [],
  liveHistory: [],
  scoutingReports: [],
  pointPatterns: [],
  milestone: { targetSkill:'', targetDate:'', sessionsPerWeek:3, startSkill:'', createdAt:'' },
  founder: { photo:'assets/shriyan-avadhanula-founder.png' }
};

let state = structuredClone(DEFAULT_STATE);
let currentView = location.hash.replace('#','') || 'dashboard';
let deferredInstallPrompt = null;
let dbPromise = null;
let activeVideoUrl = null;
let cameraStream = null;
let motionLoop = null;

const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const esc = (value='') => String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const uid = (prefix='id') => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
const todayISO = () => new Date().toISOString().slice(0,10);
const clamp = (n,min,max) => Math.min(max,Math.max(min,n));
const pct = (a,b) => b ? Math.round((a/b)*100) : 0;
const mean = arr => arr.length ? arr.reduce((a,b)=>a+Number(b||0),0)/arr.length : 0;
const fmtDate = value => value ? new Intl.DateTimeFormat(undefined,{month:'short',day:'numeric',year:'numeric'}).format(new Date(`${value}T12:00:00`)) : '—';
const daysAgo = (n) => { const d=new Date(); d.setDate(d.getDate()-n); return d.toISOString().slice(0,10); };

function localGet(key){try{return localStorage.getItem(key);}catch(err){console.warn('localStorage unavailable',err);return null;}}
function localSet(key,value){try{localStorage.setItem(key,value);return true;}catch(err){console.warn('localStorage unavailable',err);return false;}}
function localRemove(key){try{localStorage.removeItem(key);}catch(err){console.warn('localStorage unavailable',err);}}


function openDB(){
  if(!('indexedDB' in window)) return Promise.resolve(null);
  if(dbPromise) return dbPromise;
  dbPromise = new Promise((resolve,reject)=>{
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db=req.result;
      if(!db.objectStoreNames.contains('kv')) db.createObjectStore('kv');
      if(!db.objectStoreNames.contains('videos')) db.createObjectStore('videos');
    };
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error);
  }).catch(err=>{ console.warn('IndexedDB unavailable',err); return null; });
  return dbPromise;
}

async function idbGet(store,key){
  const db=await openDB(); if(!db) return null;
  return new Promise((resolve,reject)=>{ const tx=db.transaction(store,'readonly'); const r=tx.objectStore(store).get(key); r.onsuccess=()=>resolve(r.result); r.onerror=()=>reject(r.error); });
}
async function idbSet(store,key,value){
  const db=await openDB(); if(!db) return;
  return new Promise((resolve,reject)=>{ const tx=db.transaction(store,'readwrite'); tx.objectStore(store).put(value,key); tx.oncomplete=()=>resolve(); tx.onerror=()=>reject(tx.error); });
}
async function idbDelete(store,key){
  const db=await openDB(); if(!db) return;
  return new Promise((resolve,reject)=>{ const tx=db.transaction(store,'readwrite'); tx.objectStore(store).delete(key); tx.oncomplete=()=>resolve(); tx.onerror=()=>reject(tx.error); });
}
async function idbClear(store){
  const db=await openDB(); if(!db) return;
  return new Promise((resolve,reject)=>{ const tx=db.transaction(store,'readwrite'); tx.objectStore(store).clear(); tx.oncomplete=()=>resolve(); tx.onerror=()=>reject(tx.error); });
}

async function loadState(){
  try {
    const fromDb=await idbGet('kv',STATE_KEY);
    const fromLocal=localGet(STATE_KEY);
    const parsed=fromDb || (fromLocal ? JSON.parse(fromLocal) : null);
    if(parsed) state=mergeState(parsed);
  } catch(err){ console.warn('Could not load saved state',err); }
}
function mergeState(saved){
  const base=structuredClone(DEFAULT_STATE);
  return {...base,...saved, profile:{...base.profile,...saved.profile}, settings:{...base.settings,...saved.settings}, founder:{...base.founder,...saved.founder}, milestone:{...base.milestone,...saved.milestone}, planMeta:{...base.planMeta,...saved.planMeta,history:Array.isArray(saved.planMeta?.history)?saved.planMeta.history:[]}, experiments:Array.isArray(saved.experiments)?saved.experiments:[], scoutingReports:Array.isArray(saved.scoutingReports)?saved.scoutingReports:[], pointPatterns:Array.isArray(saved.pointPatterns)?saved.pointPatterns:[]};
}
async function saveState({quiet=false,skipAdapt=false}={}){
  state.version=APP_VERSION;
  if(!skipAdapt){
    evaluateExperiments();
    maybeAutoAdaptRoadmap({trigger:'new local data'});
  }
  const clone=JSON.parse(JSON.stringify(state));
  localSet(STATE_KEY,JSON.stringify(clone));
  try { await idbSet('kv',STATE_KEY,clone); } catch(err){ console.warn(err); }
  if(!quiet) toast('Saved locally on this device');
}

function toast(message){
  const el=document.createElement('div'); el.className='toast'; el.textContent=message;
  $('#toast-region').appendChild(el); setTimeout(()=>el.remove(),3200);
}

function analytics(){
  const matches=[...state.matches].sort((a,b)=>b.date.localeCompare(a.date));
  const wins=matches.filter(m=>m.result==='W').length;
  const losses=matches.filter(m=>m.result==='L').length;
  const close=matches.filter(m=>Number(m.scoreFor)>=10 && Number(m.scoreAgainst)>=10);
  const pressureWon=matches.reduce((s,m)=>s+Number(m.pressureWon||0),0);
  const pressurePlayed=matches.reduce((s,m)=>s+Number(m.pressurePlayed||0),0);
  const present=(key)=>matches.filter(m=>m[key]!==undefined&&m[key]!==null&&m[key]!=='' ).map(m=>Number(m[key]));
  const reset=mean(present('resetSuccess'));
  const transition=mean(present('transitionSuccess'));
  const rally=mean(present('dinkRally'));
  const hours=(matches.reduce((s,m)=>s+Number(m.duration||0),0)+state.sessions.reduce((s,x)=>s+Number(x.minutes||0),0))/60;
  const errorCounts={};
  matches.forEach(m=>{ if(m.dominantError && m.dominantError!=='None') errorCounts[m.dominantError]=(errorCounts[m.dominantError]||0)+1; });
  const weakness=Object.entries(errorCounts).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'Not enough data';
  const recent=matches.slice(0,6);
  const recentWinRate=pct(recent.filter(m=>m.result==='W').length,recent.length);
  const streak=calcStreak(matches);
  return {matches,wins,losses,winRate:pct(wins,matches.length),close,pressure:pct(pressureWon,pressurePlayed),reset:Math.round(reset),transition:Math.round(transition),rally:rally.toFixed(1),hours:hours.toFixed(1),weakness,recent,recentWinRate,streak};
}
function calcStreak(matches){
  if(!matches.length) return 0;
  const result=matches[0].result; let n=0;
  for(const m of matches){ if(m.result===result) n++; else break; }
  return result==='W'?n:-n;
}
function focusRecommendation(){
  const a=analytics();
  const health=healthScore();
  if(health.recovery==='Rest') return {title:'Recovery first', detail:'Your recent load and soreness suggest a lighter day: mobility, hydration, and film review.', drill:'core-lateral'};
  if(a.matches.length<2) return {title:'Build your baseline', detail:'Log two matches with reset, transition, and pressure stats so coaching can personalize itself.', drill:'dink-100'};
  if(a.pressure<50 && a.close.length) return {title:'Close-game clarity', detail:'Use one serve target and one third-shot rule when the score reaches 10–10.', drill:'pressure-10'};
  if(a.transition<60) return {title:'Own the transition zone', detail:'Prioritize soft resets and split-step timing instead of rushing all the way forward.', drill:'transition-gauntlet'};
  if(a.reset<65) return {title:'Backhand reset quality', detail:'Compact the swing and create more margin above the net from midcourt.', drill:'wall-reset'};
  if(a.weakness.toLowerCase().includes('serve')) return {title:'First-ball depth', detail:'Deep serves create shorter returns and easier third-ball decisions.', drill:'serve-depth'};
  return {title:'Turn consistency into pressure', detail:'Your base game is stable. Add planned speed-ups after two neutral dinks.', drill:'speedup-read'};
}
function healthScore(){
  const cutoff=daysAgo(6);
  const recent=state.health.filter(h=>h.date>=cutoff);
  const matchMinutes=state.matches.filter(m=>m.date>=cutoff).reduce((s,m)=>s+Number(m.duration||0),0);
  const sessionMinutes=state.sessions.filter(s=>s.date>=cutoff).reduce((a,s)=>a+Number(s.minutes||0),0);
  const load=matchMinutes+sessionMinutes;
  const soreness=Math.round(mean(recent.map(h=>Number(h.soreness||0))));
  const sleep=mean(recent.map(h=>Number(h.sleep||0)));
  let score=100-Math.max(0,load-240)/7-soreness*6+(sleep>=8?4:sleep<6?-10:0);
  score=Math.round(clamp(score,20,100));
  const recovery=score<50?'Rest':score<70?'Light':'Ready';
  return {score,recovery,load,soreness,sleep:sleep.toFixed(1)};
}


function addDaysISO(value,days){
  const d=new Date(`${value||todayISO()}T12:00:00`);d.setDate(d.getDate()+Number(days||0));return d.toISOString().slice(0,10);
}
function daysBetweenISO(a,b){
  return Math.floor((new Date(`${b}T12:00:00`)-new Date(`${a}T12:00:00`))/86400000);
}
function coachingConfidence(){
  const a=analytics();
  const tracked=state.matches.filter(m=>['resetSuccess','transitionSuccess','dominantError'].filter(k=>m[k]!==undefined&&m[k]!==null&&m[k]!=='').length>=2).length;
  let score=8+Math.min(38,a.matches.length*4)+Math.min(18,tracked*3)+Math.min(14,state.sessions.length*2)+Math.min(12,state.health.length*2)+Math.min(10,(state.videos||[]).length*3);
  score=Math.round(clamp(score,8,100));
  const label=score>=80?'High confidence':score>=55?'Useful confidence':score>=30?'Developing confidence':'Baseline needed';
  const missing=[];
  if(a.matches.length<4)missing.push(`${4-a.matches.length} more detailed match${4-a.matches.length===1?'':'es'}`);
  if(state.sessions.length<3)missing.push('three training-session quality logs');
  if(state.health.length<2)missing.push('two readiness check-ins');
  return {score,label,missing,detail:missing.length?`Best next data: ${missing.slice(0,2).join(' and ')}.`:'Your coach has enough connected data to make stronger adaptations.'};
}
function trendSignals(){
  const ordered=[...state.matches].sort((a,b)=>(a.createdAt||a.date).localeCompare(b.createdAt||b.date));
  const size=Math.min(4,Math.floor(ordered.length/2));
  if(size<2)return {sample:ordered.length,winRateDelta:0,transitionDelta:0,resetDelta:0,pressureDelta:0,dinkDelta:0};
  const old=ordered.slice(-(size*2),-size),recent=ordered.slice(-size);
  const rate=(arr,key)=>key==='winRate'?pct(arr.filter(m=>m.result==='W').length,arr.length):key==='pressure'?pct(arr.reduce((x,m)=>x+Number(m.pressureWon||0),0),arr.reduce((x,m)=>x+Number(m.pressurePlayed||0),0)):mean(arr.map(m=>Number(m[key]||0)));
  return {sample:size,winRateDelta:Math.round(rate(recent,'winRate')-rate(old,'winRate')),transitionDelta:Math.round(rate(recent,'transitionSuccess')-rate(old,'transitionSuccess')),resetDelta:Math.round(rate(recent,'resetSuccess')-rate(old,'resetSuccess')),pressureDelta:Math.round(rate(recent,'pressure')-rate(old,'pressure')),dinkDelta:Number((rate(recent,'dinkRally')-rate(old,'dinkRally')).toFixed(1))};
}
function targetMetricForFocus(focus){
  const text=String(focus?.title||focus||'').toLowerCase();
  if(text.includes('transition'))return 'transitionSuccess';
  if(text.includes('reset')||text.includes('backhand'))return 'resetSuccess';
  if(text.includes('pressure')||text.includes('close'))return 'pressure';
  if(text.includes('dink')||text.includes('consistency'))return 'dinkRally';
  if(text.includes('serve')||text.includes('first-ball'))return 'winRate';
  return 'winRate';
}
function metricLabel(metric){return ({transitionSuccess:'Transition success',resetSuccess:'Reset success',pressure:'Pressure conversion',dinkRally:'Dink rally length',winRate:'Win rate'})[metric]||metric;}
function metricValue(metric,matches=state.matches){
  if(!matches.length)return 0;
  if(metric==='winRate')return pct(matches.filter(m=>m.result==='W').length,matches.length);
  if(metric==='pressure')return pct(matches.reduce((s,m)=>s+Number(m.pressureWon||0),0),matches.reduce((s,m)=>s+Number(m.pressurePlayed||0),0));
  return Number(mean(matches.map(m=>Number(m[metric]||0))).toFixed(metric==='dinkRally'?1:0));
}
function planWeekIndex(){
  if(!state.plan.length||!state.planMeta?.startDate)return 0;
  return clamp(Math.floor(Math.max(0,daysBetweenISO(state.planMeta.startDate,todayISO()))/7),0,state.plan.length-1);
}
function planWeekDates(index){
  const start=addDaysISO(state.planMeta?.startDate||todayISO(),index*7);return {start,end:addDaysISO(start,6)};
}
function sessionsForPlanWeek(index){
  const r=planWeekDates(index);return state.sessions.filter(x=>x.date>=r.start&&x.date<=r.end);
}
function planProgress(){
  if(!state.plan.length)return {percent:0,done:0,total:0,current:0};
  const total=state.plan.reduce((s,w)=>s+Number(w.sessions||0),0);
  const done=state.plan.reduce((s,w,i)=>s+Math.min(Number(w.sessions||0),sessionsForPlanWeek(i).length),0);
  return {percent:pct(done,total),done,total,current:planWeekIndex()};
}
function uniqueDrills(ids){return [...new Set(ids)].filter(id=>findDrill(id)).slice(0,3);}
function supportDrills(focusDrill){
  const map={
    'transition-gauntlet':['wall-reset','footwork-ladder','pressure-10'],
    'wall-reset':['transition-gauntlet','dink-100','pressure-10'],
    'pressure-10':['serve-depth','third-drop','dink-100'],
    'serve-depth':['return-plus','pressure-10','third-drop'],
    'speedup-read':['dink-100','hands-burst','pressure-10'],
    'dink-100':['wall-reset','speedup-read','pressure-10'],
    'core-lateral':['footwork-ladder','wall-reset','serve-depth']
  };
  return map[focusDrill]||['dink-100','wall-reset','pressure-10'];
}
function makeRoadmapWeek(index,focus,meta){
  const phases=['Foundation','Repeatability','Decision pressure','Match transfer','Constraint training','Tournament simulation','Refine under fatigue','Proof week'];
  const phase=phases[Math.min(index,phases.length-1)];
  const base=focus.drill||'dink-100';const support=supportDrills(base);
  const metric=targetMetricForFocus(focus);const baseline=metricValue(metric);
  const target=metric==='dinkRally'?Number((baseline+Math.min(3,1+index*.4)).toFixed(1)):Math.round(Math.min(95,baseline+4+index*2));
  return {week:index+1,focus:index===0?focus.title:`${phase}: ${focus.title}`,cue:index===0?focus.detail:`Keep the same technical cue, then add ${phase.toLowerCase()} without sacrificing quality.`,sessions:Number(meta.sessionsPerWeek||3),drills:uniqueDrills([base,support[index%support.length],index>=2?'pressure-10':support[(index+1)%support.length]]),done:false,intensity:index===0?'Technical':index>=3?'Match-like':'Build',targetMetric:metric,targetValue:target,why:`Built from ${metricLabel(metric).toLowerCase()}, recent match patterns, and your ${meta.goal.toLowerCase()}.`,adaptedAt:new Date().toISOString()};
}
function createRoadmap(meta){
  const focus=focusRecommendation();
  return Array.from({length:Number(meta.weeks||4)},(_,i)=>makeRoadmapWeek(i,focus,meta));
}
function roadmapSignature(){
  const lastMatch=[...state.matches].sort((a,b)=>(b.createdAt||b.date).localeCompare(a.createdAt||a.date))[0];
  const lastSession=[...state.sessions].sort((a,b)=>(b.createdAt||b.date).localeCompare(a.createdAt||a.date))[0];
  const lastHealth=[...state.health].sort((a,b)=>(b.createdAt||b.date).localeCompare(a.createdAt||a.date))[0];
  return JSON.stringify({day:todayISO(),week:planWeekIndex(),match:lastMatch&&[lastMatch.id,lastMatch.result,lastMatch.resetSuccess,lastMatch.transitionSuccess,lastMatch.pressureWon,lastMatch.pressurePlayed,lastMatch.dominantError],session:lastSession&&[lastSession.id,lastSession.quality,lastSession.successRate,lastSession.exertion,lastSession.painAfter],health:lastHealth&&[lastHealth.id,lastHealth.soreness,lastHealth.sleep,lastHealth.energy],focus:focusRecommendation().title,recovery:healthScore().recovery});
}
function adaptationEvidence(){
  const a=analytics(),t=trendSignals(),h=healthScore(),c=coachingConfidence();
  return [`${a.matches.length} matches · ${state.sessions.length} sessions`,`${metricLabel('transitionSuccess')} ${a.transition}% (${t.transitionDelta>=0?'+':''}${t.transitionDelta} recent)`,`Reset success ${a.reset}% (${t.resetDelta>=0?'+':''}${t.resetDelta} recent)`,`Readiness ${h.score}/100 · ${h.recovery}`,`${c.label} (${c.score}/100)`];
}
function maybeAutoAdaptRoadmap({trigger='data update',force=false,notify=false}={}){
  if(!state.plan.length||!state.planMeta?.startDate||(!state.settings.autoAdaptPlan&&!force))return false;
  const signature=roadmapSignature();
  if(!force&&signature===state.planMeta.lastSignature)return false;
  const oldPlan=JSON.parse(JSON.stringify(state.plan));
  const current=planWeekIndex();const focus=focusRecommendation();const h=healthScore();const trends=trendSignals();
  const configured=Number(state.planMeta.sessionsPerWeek||3);const recentQuality=mean(state.sessions.slice(-4).map(x=>Number(x.quality||0)));
  state.plan=state.plan.map((week,i)=>{
    const logged=sessionsForPlanWeek(i).length;
    if(i<current)return {...week,done:logged>=Number(week.sessions||configured)||planWeekDates(i).end<todayISO(),completedSessions:logged};
    const offset=i-current;const support=supportDrills(focus.drill);
    let next={...week,done:false,completedSessions:logged,adaptedAt:new Date().toISOString()};
    if(i===current){
      next.focus=focus.title;next.cue=focus.detail;next.targetMetric=targetMetricForFocus(focus);next.why=`Recalculated from your newest match, training-quality, and readiness data (${trigger}).`;
      if(h.recovery==='Rest'){
        next.focus='Recovery microcycle';next.cue='Protect adaptation today: mobility, easy rhythm work, film review, and no high-intensity match block.';next.sessions=Math.min(2,configured);next.intensity='Recovery';next.drills=uniqueDrills(['core-lateral','wall-reset','serve-depth']);
      }else if(h.recovery==='Light'){
        next.sessions=Math.max(2,configured-1);next.intensity='Technical';next.drills=uniqueDrills([focus.drill,'wall-reset','serve-depth']);
      }else{
        next.sessions=configured;next.intensity=recentQuality>=4?'Progress':'Build';next.drills=uniqueDrills([focus.drill,support[0],logged>=2?'pressure-10':support[1]]);
      }
      const currentValue=metricValue(next.targetMetric);
      const delta=next.targetMetric==='transitionSuccess'?trends.transitionDelta:next.targetMetric==='resetSuccess'?trends.resetDelta:next.targetMetric==='pressure'?trends.pressureDelta:next.targetMetric==='dinkRally'?trends.dinkDelta:trends.winRateDelta;
      next.targetValue=next.targetMetric==='dinkRally'?Number((currentValue+1).toFixed(1)):Math.round(Math.min(95,currentValue+(delta>=5?4:7)));
      if(logged>=Math.max(2,Math.floor(configured*.67))&&delta>=5){next.focus=`Transfer ${metricLabel(next.targetMetric).toLowerCase()} under pressure`;next.cue=`You improved ${delta} points in recent data. Keep the cue, but test it in score-based and randomized reps.`;next.drills=uniqueDrills([focus.drill,'pressure-10',support[0]]);next.intensity='Match transfer';}
      if(logged>=configured&&delta<=0){next.focus=`Rebuild ${focus.title.toLowerCase()}`;next.cue='Quality has not transferred yet. Reduce speed, shorten the drill block, and require clean reps before adding pressure.';next.sessions=Math.max(2,configured-1);next.intensity='Reset technique';}
    }else{
      const phases=['Repeatability','Decision pressure','Match transfer','Tournament simulation'];const phase=phases[Math.min(offset-1,phases.length-1)];
      next.focus=`${phase}: ${focus.title}`;next.cue=`Only progress here if the current-week target holds. Add ${phase.toLowerCase()} while preserving the same cue.`;next.sessions=configured;next.intensity=offset>=2?'Match-like':'Progressive';next.targetMetric=targetMetricForFocus(focus);next.targetValue=Math.round(Math.min(95,metricValue(next.targetMetric)+7+offset*3));next.drills=uniqueDrills([focus.drill,support[offset%support.length],offset>=1?'pressure-10':support[0]]);next.why='Future weeks were rewritten so the plan follows the newest evidence instead of staying static.';
    }
    return next;
  });
  const changes=[];
  state.plan.forEach((w,i)=>{const before=oldPlan[i]||{};if(JSON.stringify([before.focus,before.sessions,before.intensity,before.drills,before.targetValue])!==JSON.stringify([w.focus,w.sessions,w.intensity,w.drills,w.targetValue]))changes.push(`Week ${i+1}: ${before.focus||'new plan'} → ${w.focus}`);});
  state.planMeta.lastSignature=signature;
  if(changes.length){
    state.planMeta.undoSnapshot=oldPlan;
    const entry={id:uid('adapt'),at:new Date().toISOString(),trigger,summary:changes.slice(0,3).join(' • '),changes,evidence:adaptationEvidence(),week:current+1};
    state.planMeta.history=[...(state.planMeta.history||[]),entry].slice(-12);state.planMeta.lastAdaptedAt=entry.at;state.planMeta.unreadAdaptation=true;
    if(notify)toast(`Roadmap adapted: ${changes.length} week${changes.length===1?'':'s'} updated`);
  }
  return changes.length>0;
}
function todayPrescription(){
  const h=healthScore(),focus=focusRecommendation(),week=state.plan[planWeekIndex()]||null,c=coachingConfidence();
  let drill=findDrill(week?.drills?.[0]||focus.drill)||findDrill('dink-100');
  let duration=h.recovery==='Rest'?12:h.recovery==='Light'?20:Math.min(55,(drill?.minutes||15)+20);
  let intensity=h.recovery==='Rest'?'Recovery':h.recovery==='Light'?'Low / technical':week?.intensity||'Moderate';
  const rationale=h.recovery==='Rest'?'Your recent load and soreness outweigh the benefit of another hard block.':`This is the highest-value next step for ${focus.title.toLowerCase()} at your current readiness.`;
  return {title:h.recovery==='Rest'?'Recover and preserve feel':drill.name,drillId:drill.id,duration,intensity,rationale,confidence:c.score};
}
function experimentMatches(exp){return state.matches.filter(m=>(m.createdAt||`${m.date}T12:00:00`)>(exp.createdAt||''));}
function evaluateExperiments(){
  (state.experiments||[]).forEach(exp=>{
    if(exp.status!=='active')return;const matches=experimentMatches(exp);exp.matchesLogged=matches.length;exp.current=matches.length?metricValue(exp.metric,matches):exp.baseline;
    if(matches.length>=Number(exp.matchesNeeded||3))exp.status=Number(exp.current)>=Number(exp.target)?'validated':'inconclusive';
  });
}
function experimentProgress(exp){return Math.round(clamp((Number(exp.matchesLogged||0)/Number(exp.matchesNeeded||3))*100,0,100));}
function activeExperiment(){return (state.experiments||[]).find(x=>x.status==='active')||null;}


function allDrills(){
  return [...DRILLS, ...(state.customDrills||[])];
}
function findDrill(id){ return allDrills().find(d=>d.id===id); }
function rivalryStats(){
  const map={};
  state.matches.forEach(m=>{
    const key=(m.opponent||'').trim(); if(!key) return;
    map[key]??={name:key,w:0,l:0,for:0,against:0,last:null};
    const r=map[key]; if(m.result==='W')r.w++;else r.l++;
    r.for+=Number(m.scoreFor||0);r.against+=Number(m.scoreAgainst||0);
    if(!r.last||m.date>r.last)r.last=m.date;
  });
  return Object.values(map).sort((a,b)=>(b.w+b.l)-(a.w+a.l)||b.w-a.w);
}
function improvementIndex(){
  const ordered=[...state.matches].sort((a,b)=>a.date.localeCompare(b.date));
  if(ordered.length<4) return {score:0,label:'Baseline building',detail:'Log at least four matches to compare early and recent form.'};
  const n=Math.min(5,Math.floor(ordered.length/2));
  const early=ordered.slice(0,n), recent=ordered.slice(-n);
  const metric=(arr,k)=>mean(arr.map(x=>Number(x[k]||0)));
  const trans=metric(recent,'transitionSuccess')-metric(early,'transitionSuccess');
  const reset=metric(recent,'resetSuccess')-metric(early,'resetSuccess');
  const earlyWin=pct(early.filter(x=>x.result==='W').length,early.length);
  const recentWin=pct(recent.filter(x=>x.result==='W').length,recent.length);
  const winDelta=recentWin-earlyWin;
  const score=Math.round(clamp(50+trans*.8+reset*.7+winDelta*.35,0,100));
  const label=score>=72?'Fast improver':score>=56?'Trending upward':score>=44?'Holding steady':'Rebuild one pattern';
  return {score,label,detail:`Recent vs. early sample: transition ${trans>=0?'+':''}${Math.round(trans)} pts, resets ${reset>=0?'+':''}${Math.round(reset)} pts, win rate ${winDelta>=0?'+':''}${Math.round(winDelta)} pts.`};
}
function injuryRiskSignal(){
  const h=healthScore();
  const recent=state.health.filter(x=>x.date>=daysAgo(13));
  const highSoreness=recent.filter(x=>Number(x.soreness)>=6).length;
  const repeatedArea=Object.entries(recent.reduce((m,x)=>{const k=x.area||'General';m[k]=(m[k]||0)+1;return m;},{})).sort((a,b)=>b[1]-a[1])[0];
  const latestScreen=(state.movementScreens||[]).slice().sort((a,b)=>b.date.localeCompare(a.date))[0];
  let risk=100-h.score+Math.max(0,h.load-300)/8+highSoreness*8+Number(latestScreen?.score||0)*.35;
  risk=Math.round(clamp(risk,5,95));
  const level=risk>=70?'High':risk>=45?'Moderate':'Low';
  const factors=[];
  if(h.load>300)factors.push('high 7-day load');
  if(highSoreness)factors.push(`${highSoreness} high-soreness check-in${highSoreness===1?'':'s'}`);
  if(repeatedArea&&repeatedArea[0]!=='General'&&repeatedArea[1]>=2)factors.push(`repeated ${repeatedArea[0].toLowerCase()} symptoms`);
  if(latestScreen?.score>=45)factors.push('movement self-screen flags');
  if(!factors.length)factors.push('no major recent flags');
  return {risk,level,factors};
}
function pointWinProbability(playerScore,opponentScore,target=11,momentum=[]){
  if(playerScore>=target&&playerScore-opponentScore>=2)return 100;
  if(opponentScore>=target&&opponentScore-playerScore>=2)return 0;
  const a=analytics();
  const historyEdge=(a.matches.length>=4?(a.winRate-50)/220:0);
  const recent=momentum.slice(-5); const momentumEdge=recent.length?(recent.filter(x=>x==='P').length/recent.length-.5)*.18:0;
  const p=clamp(.5+historyEdge+momentumEdge,.34,.66);
  const scoreEdge=(playerScore-opponentScore)*.58;
  const finishEdge=(playerScore+opponentScore>=target*1.45?(playerScore-opponentScore)*.35:0);
  const serveNeutral=Math.log(p/(1-p))*.9;
  return Math.round(clamp(100/(1+Math.exp(-(scoreEdge+finishEdge+serveNeutral))),1,99));
}

function updateBadges(){
  const a=analytics();
  const earned=[];
  if(a.matches.length>=1) earned.push('First Log');
  if(a.matches.length>=10) earned.push('Data Builder');
  if(a.wins>=5) earned.push('Match Maker');
  if(a.pressure>=65 && a.close.length>=3) earned.push('Comeback King');
  if(a.rally>=8) earned.push('Kitchen Wizard');
  if(state.sessions.filter(s=>s.drillId==='serve-depth').length>=5) earned.push('Serve Machine');
  if(state.videos.length>=3) earned.push('Film Student');
  if((state.liveHistory||[]).length>=1) earned.push('Live Analyst');
  if((state.customDrills||[]).length>=1) earned.push('Drill Architect');
  if((state.clubEvents||[]).length>=1) earned.push('Club Builder');
  state.badges=earned;
}

function navMarkup(){
  return NAV_ITEMS.map(([id,icon,label])=>`<button class="nav-button ${currentView===id?'active':''}" data-nav="${id}"><span class="nav-icon">${icon}</span><span>${label}</span></button>`).join('');
}
function setHeader(title,kicker='DINKSENSE'){
  $('#page-title').textContent=title; $('#page-kicker').textContent=kicker;
}
function navigate(view){
  if(!NAV_ITEMS.some(n=>n[0]===view)) view='dashboard';
  currentView=view; location.hash=view;
  $('#nav').innerHTML=navMarkup(); render();
  window.scrollTo({top:0,behavior:'smooth'});
}

function sectionHead(kicker,title,action=''){
  return `<div class="section-head"><div><div class="eyebrow">${esc(kicker)}</div><h2>${esc(title)}</h2></div>${action}</div>`;
}
function empty(icon,title,text,action=''){
  return `<div class="empty"><div class="big-icon">${icon}</div><strong>${esc(title)}</strong><p>${esc(text)}</p>${action}</div>`;
}
function statCard(value,label,delta=''){
  return `<div class="card metric"><div class="metric-value">${esc(value)}</div><div class="metric-label">${esc(label)}</div>${delta?`<div class="delta ${delta.includes('+')?'good':''}">${esc(delta)}</div>`:''}</div>`;
}
function adSlot(){ return `<div class="ad-slot">Reserved future ad placement — never shown inside logging or coaching flows</div>`; }

function render(){
  updateBadges();
  const map={dashboard:renderDashboard,track:renderTrack,analytics:renderAnalytics,train:renderTrain,video:renderVideo,discover:renderDiscover,health:renderHealth,gear:renderGear,compete:renderCompete,profile:renderProfile,founder:renderFounder,settings:renderSettings};
  (map[currentView]||renderDashboard)();
  bindCommonActions();
}

function renderDashboard(){
  setHeader('Dashboard','TODAY');
  const a=analytics(); const focus=focusRecommendation(); const health=healthScore(); const prescription=todayPrescription(); const confidence=coachingConfidence(); const planStats=planProgress();
  const recentRows=a.recent.length ? a.recent.slice(0,4).map(m=>`<div class="list-item"><div><strong>${m.result==='W'?'Win':'Loss'} vs. ${esc(m.opponent||'Opponent')}</strong><div class="meta">${fmtDate(m.date)} · ${esc(m.type)} · ${m.scoreFor}-${m.scoreAgainst}</div></div><span class="pill ${m.result==='W'?'good':'bad'}">${m.result}</span></div>`).join('') : empty('◌','No matches yet','Your first log unlocks personalized analytics.','<button class="button primary small" data-action="log-match">Log first match</button>');
  $('#view').innerHTML=`
    <div class="hero">
      <div class="hero-copy">
        <div class="eyebrow" style="color:var(--accent)">LOCAL-FIRST ATHLETE INTELLIGENCE</div>
        <h2>Know your game.<br>Train what matters.</h2>
        <p>DinkSense turns your matches, drills, recovery, gear, and video into one clear improvement system. Core features work offline and your private data stays on this device.</p>
        <div class="hero-actions"><button class="button primary" data-action="log-match">Log a match</button><button class="button ghost" data-nav="train">Start today’s session</button></div>
      </div>
      <div class="hero-side"><div class="focus-card"><div class="eyebrow" style="color:var(--accent)">FOCUS OF THE WEEK</div><div class="big">${esc(focus.title)}</div><p>${esc(focus.detail)}</p></div></div>
    </div>
    ${sectionHead('QUICK START','Everything is connected')}
    <div class="quick-grid">
      <button class="quick-tile" data-action="log-match"><span class="quick-icon">＋</span><strong>Log match</strong><span>Under 30 seconds</span></button>
      <button class="quick-tile" data-action="live-match"><span class="quick-icon">●</span><strong>Live match lab</strong><span>Point-by-point probability</span></button>
      <button class="quick-tile" data-nav="train"><span class="quick-icon">◎</span><strong>Solo session</strong><span>Target your weakness</span></button>
      <button class="quick-tile" data-action="open-coach"><span class="quick-icon">✦</span><strong>Ask coach</strong><span>Uses your own data</span></button>
    </div>
    <div class="grid four" style="margin-top:18px">
      ${statCard(a.matches.length,'Matches logged')}
      ${statCard(`${a.winRate}%`,'Win rate')}
      ${statCard(`${a.transition}%`,'Transition success')}
      ${statCard(`${health.score}/100`,'Readiness',health.recovery)}
    </div>
    <div class="grid dashboard-grid">
      <div class="card prescription-card"><div class="card-head"><div><div class="eyebrow">TODAY'S ADAPTIVE PRESCRIPTION</div><h2>${esc(prescription.title)}</h2></div><span class="pill ${health.recovery==='Ready'?'good':health.recovery==='Rest'?'bad':'warn'}">${esc(prescription.intensity)}</span></div><p>${esc(prescription.rationale)}</p><div class="tag-row"><span class="pill">${prescription.duration} minutes</span><span class="pill">Coach confidence ${confidence.score}/100</span></div><button class="button primary small" style="margin-top:14px" data-view-drill="${prescription.drillId}">Open session</button></div>
      <div class="card dark"><div class="eyebrow" style="color:var(--accent)">COACH READ</div><h2>${esc(a.weakness==='Not enough data'?'Build a useful baseline':`Watch: ${a.weakness}`)}</h2><p>${esc(localCoachAnswer('What should I focus on this week?'))}</p><button class="button primary small" data-action="open-coach">Ask a follow-up</button></div>
    </div>
    <div class="card soft" style="margin-top:18px"><div class="split"><div><div class="eyebrow">NEXT MATCH MISSION</div><h2>${esc(activePointPattern()?.name||'Turn your focus into one measurable pattern')}</h2><p>${esc(nextMatchMission())}</p></div><button class="button dark" data-nav="train">Open Pattern Studio</button></div></div>
    <div class="grid dashboard-grid" style="margin-top:18px">
      <div class="card"><div class="card-head"><div><div class="eyebrow">RECENT FORM</div><h2>Your last matches</h2></div><button class="button small" data-nav="track">View all</button></div><div class="list">${recentRows}</div></div>
      <div class="card"><div class="eyebrow">DATA QUALITY</div><h2>${esc(confidence.label)}</h2><div class="progress" style="margin:14px 0"><span style="width:${confidence.score}%"></span></div><p>${esc(confidence.detail)}</p></div>
    </div>
    ${sectionHead('PROGRESS SYSTEM','Your current roadmap','<button class="button small" data-nav="train">Open training</button>')}
    <div class="grid two">
      <div class="card"><div class="split"><div><div class="eyebrow">GOAL</div><h3>${esc(state.goals[0]?.title || state.profile.goals || 'Choose your first goal')}</h3></div><span class="pill dark">${state.plan.length?'Active':'Set up'}</span></div><div class="progress" style="margin-top:18px"><span style="width:${state.plan.length?planStats.percent:8}%"></span></div><p>${state.plan.length?`${planStats.done}/${planStats.total} planned sessions completed. Current and future weeks rewrite automatically when evidence changes.`:'Generate a goal-based week-by-week plan in Training.'}</p></div>
      <div class="card"><div class="split"><div><div class="eyebrow">BADGES</div><h3>${state.badges.length} earned</h3></div><span style="font-size:2rem">🏅</span></div><div class="tag-row" style="margin-top:16px">${state.badges.length?state.badges.map(b=>`<span class="pill good">${esc(b)}</span>`).join(''):'<span class="pill">Your first badge is one match away</span>'}</div><p>Badges are earned from tracked behavior—not arbitrary taps.</p></div>
    </div>
    ${adSlot()}`;
}

function renderTrack(){
  setHeader('Match & Stat Tracking','CORE DATA LAYER');
  const a=analytics();
  const rows=a.matches.length ? a.matches.map(m=>`<tr><td>${fmtDate(m.date)}</td><td><strong>${m.result}</strong> ${m.scoreFor}-${m.scoreAgainst}</td><td>${esc(m.opponent||'—')}</td><td>${esc(m.type)}</td><td>${esc(m.dominantError||'—')}</td><td><button class="button small" data-edit-match="${m.id}">Edit</button> <button class="button danger small" data-delete-match="${m.id}">Delete</button></td></tr>`).join('') : '';
  $('#view').innerHTML=`
    <div class="grid four">
      ${statCard(a.matches.length,'Total matches')}${statCard(a.wins,'Wins')}${statCard(`${a.pressure}%`,'Pressure points')}${statCard(a.rally,'Avg. dink rally')}
    </div>
    ${sectionHead('FAST CAPTURE','Log while the match is fresh','<div class="tag-row"><button class="button dark" data-action="live-match">● Live match</button><button class="button secondary" data-action="voice-log">◉ Voice log</button><button class="button primary" data-action="log-match">+ Match</button></div>')}
    <div class="grid two">
      <div class="card accent"><div class="eyebrow">ADAPTIVE TRACKER</div><h2>${Number(state.profile.skill)<3.5?'Consistency mode':'Decision-quality mode'}</h2><p>${Number(state.profile.skill)<3.5?'Dink rally length, serve depth, and unforced errors are prioritized for your current profile.':'Shot selection, transition success, resets, and pressure execution are prioritized for your current profile.'}</p><button class="button dark small" data-nav="profile">Change skill profile</button></div>
      <div class="card"><div class="eyebrow">KITCHEN-LINE SNAPSHOT</div><div class="stat-strip" style="margin-top:14px"><div class="stat-chip"><strong>${a.rally}</strong><div class="meta">Rally length</div></div><div class="stat-chip"><strong>${a.reset}%</strong><div class="meta">Reset success</div></div><div class="stat-chip"><strong>${a.transition}%</strong><div class="meta">Transition</div></div><div class="stat-chip"><strong>${a.pressure}%</strong><div class="meta">Pressure</div></div></div></div>
    </div>
    ${sectionHead('MATCH HISTORY','Every point becomes useful data')}
    <div class="card table-wrap">${rows?`<table><thead><tr><th>Date</th><th>Result</th><th>Opponent</th><th>Format</th><th>Main error</th><th></th></tr></thead><tbody>${rows}</tbody></table>`:empty('＋','Nothing logged yet','Log a match to build your athlete intelligence layer.','<button class="button primary" data-action="log-match">Log match</button>')}</div>`;
}


function stdDev(values){
  if(!values.length)return 0;
  const avg=mean(values);return Math.sqrt(mean(values.map(v=>(Number(v)-avg)**2)));
}
function gameDNA(){
  const a=analytics();
  const matches=a.matches;
  const tracked=(key)=>matches.filter(m=>m[key]!==undefined&&m[key]!==null&&m[key]!=='').map(m=>Number(m[key]||0));
  const rallyScore=clamp(Number(a.rally||0)*8,0,100);
  const control=Math.round(clamp(Number(a.reset||0)*.46+Number(a.transition||0)*.24+rallyScore*.30,0,100));
  const pressure=Math.round(clamp(a.close.length?Number(a.pressure||0):32+Number(a.winRate||0)*.34,0,100));
  const transition=Math.round(clamp(Number(a.transition||0),0,100));
  const driveRate=pct(matches.filter(m=>String(m.thirdShot||'').toLowerCase()==='drive').length,matches.length||1);
  const attack=Math.round(clamp(34+driveRate*.34+Number(a.winRate||0)*.30-(String(a.weakness||'').toLowerCase().includes('attack')?8:0),0,100));
  const variability=stdDev(tracked('resetSuccess'))+stdDev(tracked('transitionSuccess'));
  const consistency=Math.round(clamp(matches.length<3?30+matches.length*11:92-variability*1.45,15,100));
  const readiness=healthScore().score;
  const dimensions=[
    {key:'control',label:'Touch & control',value:control},
    {key:'transition',label:'Transition',value:transition},
    {key:'pressure',label:'Pressure',value:pressure},
    {key:'attack',label:'Attack creation',value:attack},
    {key:'consistency',label:'Repeatability',value:consistency},
    {key:'readiness',label:'Durability',value:readiness}
  ];
  const top=[...dimensions].sort((x,y)=>y.value-x.value)[0];
  const low=[...dimensions].sort((x,y)=>x.value-y.value)[0];
  const names={control:'Control Architect',transition:'Transition Closer',pressure:'Pressure Player',attack:'Attack Creator',consistency:'Repeatability Engine',readiness:'High-Readiness Athlete'};
  return {dimensions,label:names[top.key],edge:top,risk:low,confidence:coachingConfidence().score};
}
function activityPulse(days=14){
  return Array.from({length:days},(_,i)=>{
    const date=daysAgo(days-1-i);
    const matchMinutes=state.matches.filter(m=>m.date===date).reduce((s,m)=>s+Number(m.duration||0),0);
    const sessionMinutes=state.sessions.filter(s=>s.date===date).reduce((s,x)=>s+Number(x.minutes||0),0);
    const minutes=matchMinutes+sessionMinutes;
    const level=minutes===0?0:minutes<20?1:minutes<45?2:minutes<75?3:4;
    return {date,minutes,level,matchMinutes,sessionMinutes};
  });
}
function milestoneForecast(){
  const m=state.milestone||{};
  const target=Number(m.targetSkill||0),start=Number(m.startSkill||state.profile.skill||0);
  if(!target||!m.targetDate||target<=start)return null;
  const days=Math.max(0,daysBetweenISO(todayISO(),m.targetDate));
  const weeks=Math.max(1,days/7);
  const sessionsPerWeek=Number(m.sessionsPerWeek||3);
  const quality=state.sessions.length?mean(state.sessions.slice(-8).map(s=>Number(s.quality||3))):3;
  const momentum=improvementIndex().score;
  const rate=0.006+(momentum/100)*0.012+sessionsPerWeek*.0015+quality*.001;
  const projected=Math.min(target+0.25,start+rate*weeks);
  const requiredRate=(target-start)/weeks;
  const status=projected>=target?'On pace':projected>=target-.12?'Close / stretch':'Needs more runway';
  const weeklyMinutes=Math.round(sessionsPerWeek*(18+Math.max(0,target-start)*10));
  return {target,start,weeks:Math.ceil(weeks),sessionsPerWeek,projected:Number(projected.toFixed(2)),requiredRate:Number(requiredRate.toFixed(3)),rate:Number(rate.toFixed(3)),status,weeklyMinutes,totalSessions:Math.ceil(weeks*sessionsPerWeek),targetDate:m.targetDate};
}
function milestoneForm(){
  const m=state.milestone||{};
  modal(`<h2>Milestone Forecast</h2><p>Create a local, evidence-based training projection. This is a planning estimate—not an official rating prediction.</p><form id="milestone-form" class="form-grid"><div class="field"><label>Current profile level</label><input name="startSkill" type="number" min="1" max="6" step="0.1" value="${esc(m.startSkill||state.profile.skill||3.5)}" required></div><div class="field"><label>Target level</label><input name="targetSkill" type="number" min="1" max="6" step="0.1" value="${esc(m.targetSkill||4.0)}" required></div><div class="field"><label>Target date</label><input name="targetDate" type="date" min="${todayISO()}" value="${esc(m.targetDate||addDaysISO(todayISO(),84))}" required></div><div class="field"><label>Sessions per week</label><input name="sessionsPerWeek" type="number" min="1" max="10" value="${esc(m.sessionsPerWeek||3)}" required></div><div class="form-actions"><button class="button" type="button" onclick="document.getElementById('modal').close()">Cancel</button><button class="button primary">Build forecast</button></div></form>`);
  $('#milestone-form').addEventListener('submit',async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget));state.milestone={...d,startSkill:Number(d.startSkill),targetSkill:Number(d.targetSkill),sessionsPerWeek:Number(d.sessionsPerWeek),createdAt:m.createdAt||new Date().toISOString()};await saveState({quiet:true});closeModal();toast('Milestone forecast updated');render();});
}
function activePointPattern(){return (state.pointPatterns||[]).find(p=>p.active)||(state.pointPatterns||[])[0]||null;}
function pointPatternRate(pattern){return pct(Number(pattern.successes||0),Number(pattern.attempts||0));}
function pointPatternForm(pattern={}){
  const isEdit=Boolean(pattern.id);
  modal(`<h2>${isEdit?'Edit point pattern':'Create point pattern'}</h2><p>Design a repeatable serve-to-fifth-ball sequence and track whether it works in practice or matches.</p><form id="pattern-form" class="form-grid"><input type="hidden" name="id" value="${esc(pattern.id||'')}"><div class="field full"><label>Pattern name</label><input name="name" required value="${esc(pattern.name||'')}" placeholder="Ex: Deep middle → soft fifth"></div><div class="field"><label>Serve / return plan</label><input name="firstBall" value="${esc(pattern.firstBall||'')}" placeholder="Deep middle serve"></div><div class="field"><label>Third-ball plan</label><input name="thirdBall" value="${esc(pattern.thirdBall||'')}" placeholder="Drive body or drop cross-court"></div><div class="field"><label>Fifth-ball plan</label><input name="fifthBall" value="${esc(pattern.fifthBall||'')}" placeholder="Reset, crash, or counter"></div><div class="field"><label>Trigger to attack</label><input name="trigger" value="${esc(pattern.trigger||'')}" placeholder="Ball above net at backhand hip"></div><div class="field full"><label>Success definition</label><input name="successDefinition" value="${esc(pattern.successDefinition||'')}" placeholder="Earn kitchen or create first attackable ball"></div><div class="form-actions"><button class="button" type="button" onclick="document.getElementById('modal').close()">Cancel</button><button class="button primary">${isEdit?'Save changes':'Create pattern'}</button></div></form>`);
  $('#pattern-form').addEventListener('submit',async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget));const old=state.pointPatterns.find(x=>x.id===d.id);const next={...old,...d,id:d.id||uid('pattern'),attempts:Number(old?.attempts||0),successes:Number(old?.successes||0),active:old?.active??state.pointPatterns.length===0,createdAt:old?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};if(old)state.pointPatterns=state.pointPatterns.map(x=>x.id===next.id?next:x);else state.pointPatterns.unshift(next);await saveState({quiet:true});closeModal();toast('Point pattern saved');render();});
}
function nextMatchMission(){
  const pattern=activePointPattern(),dna=gameDNA(),focus=focusRecommendation();
  if(pattern)return `Run “${pattern.name}” at least 5 times. Success means ${pattern.successDefinition||'earning a neutral or attackable fifth ball'}. Current rate: ${pointPatternRate(pattern)}%.`;
  return `Protect your ${dna.edge.label.toLowerCase()} edge and test one cue for ${focus.title.toLowerCase()}. Create a Point Pattern to measure it.`;
}

function renderAnalytics(){
  setHeader('Performance Analytics','WHY YOU WIN OR LOSE');
  const a=analytics(),dna=gameDNA(),pulse=activityPulse(14);
  const last=[...state.matches].sort((x,y)=>x.date.localeCompare(y.date)).slice(-10);
  const bars=last.length?last.map((m,i)=>`<div class="chart-bar-wrap"><div class="chart-bar" title="${m.result} ${m.scoreFor}-${m.scoreAgainst}" style="height:${30+Number(m.transitionSuccess||50)*1.6}px;${m.result==='L'?'opacity:.35':''}"></div><div class="chart-label">${fmtDate(m.date).split(',')[0]}</div></div>`).join(''):'<div class="empty" style="width:100%">Log matches to reveal trends.</div>';
  const errors={}; state.matches.forEach(m=>{const k=m.dominantError||'Unknown';errors[k]=(errors[k]||0)+1;});
  const errorList=Object.entries(errors).sort((x,y)=>y[1]-x[1]);
  const partnerStats={}; state.matches.filter(m=>m.partner).forEach(m=>{const p=m.partner; partnerStats[p]??={w:0,n:0};partnerStats[p].n++;if(m.result==='W')partnerStats[p].w++;});
  $('#view').innerHTML=`
    <div class="grid four">${statCard(`${a.winRate}%`,'All-time win rate')}${statCard(`${a.recentWinRate}%`,'Last 6 win rate')}${statCard(a.streak>0?`${a.streak}W`:a.streak<0?`${Math.abs(a.streak)}L`:'—','Current streak')}${statCard(a.weakness,'Most common issue')}</div>
    <div class="grid dashboard-grid" style="margin-top:18px">
      <div class="card"><div class="card-head"><div><div class="eyebrow">FORM TREND</div><h2>Transition-zone success</h2></div><span class="pill">Last 10</span></div><div class="chart">${bars}</div></div>
      <div class="card"><div class="card-head"><div><div class="eyebrow">PRESSURE</div><h2>Close-game execution</h2></div></div><div style="display:grid;place-items:center;padding:12px"><div class="donut" style="--value:${a.pressure}" data-label="${a.pressure}%"></div></div><p>${a.close.length?`Based on ${a.close.length} close match${a.close.length===1?'':'es'} and ${state.matches.reduce((s,m)=>s+Number(m.pressurePlayed||0),0)} tagged pressure points.`:'Tag pressure points in matches that reach 10–10 to make this meaningful.'}</p></div>
    </div>
    <div class="grid two" style="margin-top:18px">
      <div class="card"><div class="card-head"><div><div class="eyebrow">WEAKNESS MAP</div><h2>Error patterns</h2></div></div><div class="list">${errorList.length?errorList.map(([name,count],i)=>`<div class="list-item"><div><strong>${esc(name)}</strong><div class="meta">Appeared as the main issue in ${count} match${count===1?'':'es'}</div></div><span class="pill ${i===0?'bad':''}">${pct(count,state.matches.length)}%</span></div>`).join(''):empty('◫','No pattern yet','Log a dominant error type after each match.')}</div></div>
      <div class="card"><div class="card-head"><div><div class="eyebrow">PARTNER CHEMISTRY</div><h2>Doubles combinations</h2></div></div><div class="list">${Object.keys(partnerStats).length?Object.entries(partnerStats).map(([p,s])=>`<div class="list-item"><div><strong>${esc(p)}</strong><div class="meta">${s.n} matches together</div></div><span class="pill good">${pct(s.w,s.n)}% wins</span></div>`).join(''):empty('↔','No doubles data','Add a partner name when logging doubles matches.')}</div></div>
    </div>
    ${sectionHead('IMPROVEMENT & RIVALRIES','Progress is more motivating than a raw rating')}
    <div class="grid two">
      <div class="card accent"><div class="split"><div><div class="eyebrow">MOST-IMPROVED INDEX</div><h2>${esc(improvementIndex().label)}</h2></div><strong style="font-size:2.5rem">${improvementIndex().score}</strong></div><p>${esc(improvementIndex().detail)}</p></div>
      <div class="card"><div class="eyebrow">HEAD-TO-HEAD RIVALRIES</div><div class="list" style="margin-top:12px">${rivalryStats().length?rivalryStats().slice(0,5).map(r=>`<div class="list-item"><div><strong>${esc(r.name)}</strong><div class="meta">${r.w+r.l} matches · points ${r.for}-${r.against}</div></div><span class="pill ${r.w>=r.l?'good':'bad'}">${r.w}-${r.l}</span></div>`).join(''):empty('⚡','No rivalries yet','Opponent history appears automatically after repeated match logs.')}</div></div>
    </div>
    ${sectionHead('GAME DNA','A living identity profile generated from connected performance data')}
    <div class="grid dashboard-grid"><div class="card dark"><div class="eyebrow" style="color:var(--accent)">CURRENT ARCHETYPE</div><h2>${esc(dna.label)}</h2><p>Your clearest edge is ${esc(dna.edge.label.toLowerCase())} (${dna.edge.value}/100). The biggest development opportunity is ${esc(dna.risk.label.toLowerCase())} (${dna.risk.value}/100). Confidence: ${dna.confidence}/100.</p><button class="button primary small" data-action="open-coach">Build around my DNA</button></div><div class="card"><div class="eyebrow">DNA DIMENSIONS</div><div class="dna-bars">${dna.dimensions.map(d=>`<div class="dna-row"><span>${esc(d.label)}</span><div class="dna-track"><i style="width:${d.value}%"></i></div><strong>${d.value}</strong></div>`).join('')}</div></div></div>
    ${sectionHead('14-DAY TRAINING PULSE','See load, consistency, and empty days at a glance')}
    <div class="card"><div class="pulse-grid">${pulse.map(d=>`<div class="pulse-day level-${d.level}" title="${fmtDate(d.date)} · ${d.minutes} minutes"><strong>${new Date(`${d.date}T12:00:00`).toLocaleDateString(undefined,{weekday:'narrow'})}</strong><span>${new Date(`${d.date}T12:00:00`).getDate()}</span><small>${d.minutes?d.minutes+'m':'—'}</small></div>`).join('')}</div><div class="tag-row" style="margin-top:14px"><span class="pill">${pulse.filter(d=>d.minutes>0).length}/14 active days</span><span class="pill">${pulse.reduce((s,d)=>s+d.minutes,0)} total minutes</span><span class="pill good">${pulse.filter(d=>d.level>=3).length} high-load days</span></div></div>
    ${sectionHead('DECISION INTELLIGENCE','What the data says next')}
    <div class="card dark"><div class="eyebrow" style="color:var(--accent)">AI COACH SYNTHESIS</div><h2>${esc(focusRecommendation().title)}</h2><p>${esc(focusRecommendation().detail)} ${esc(localCoachAnswer('Why am I losing?'))}</p><button class="button primary" data-action="open-coach">Discuss my data</button></div>`;
}

function renderTrain(){
  setHeader('Training Roadmap','GOAL → PLAN → ADAPT');
  const focus=focusRecommendation(),plan=state.plan,prescription=todayPrescription(),confidence=coachingConfidence(),progress=planProgress();
  const current=progress.current;const latestAdapt=(state.planMeta?.history||[]).slice(-1)[0];const experiment=activeExperiment();const milestone=milestoneForecast();const activePattern=activePointPattern();
  const drillCards=allDrills().map(d=>`<article class="card interactive"><div class="card-head"><div><div class="tag-row"><span class="pill">${esc(d.level)}</span>${d.custom?'<span class="pill good">Created by you</span>':''}</div><h3 style="margin-top:9px">${esc(d.name)}</h3></div><strong>${d.minutes}m</strong></div><p>${esc(d.description)}</p><div class="tag-row">${d.tags.map(t=>`<span class="pill">${esc(t)}</span>`).join('')}</div><div style="margin-top:15px"><button class="button small" data-view-drill="${d.id}">View drill</button> <button class="button primary small" data-complete-drill="${d.id}">Log session</button>${d.custom?` <button class="button secondary small" data-export-drill="${d.id}">Share</button> <button class="button danger small" data-delete-custom="${d.id}">Delete</button>`:''}</div></article>`).join('');
  const planMarkup=plan.length?`<div class="timeline">${plan.map((w,i)=>{const dates=planWeekDates(i),logged=sessionsForPlanWeek(i).length;return `<div class="timeline-item ${i===current?'current':''}"><div class="timeline-line"><span class="timeline-dot"></span></div><div class="timeline-content"><div class="split"><div><div class="tag-row"><span class="pill ${i===current?'good':''}">${i===current?'Current week':`Week ${w.week}`}</span><span class="pill">${esc(w.intensity||'Build')}</span><span class="pill">${fmtDate(dates.start)}–${fmtDate(dates.end)}</span></div><strong style="display:block;margin-top:8px">Week ${w.week}: ${esc(w.focus)}</strong><div class="meta">${esc(w.cue)}</div></div><span class="pill ${w.done?'good':''}">${w.done?'Complete':`${logged}/${w.sessions} sessions`}</span></div><div class="tag-row" style="margin-top:10px">${w.drills.map(id=>`<button class="pill" data-view-drill="${id}">${esc(findDrill(id)?.name||id)}</button>`).join('')}</div><div class="plan-target"><strong>Target:</strong> ${esc(metricLabel(w.targetMetric||'winRate'))} → ${esc(w.targetValue??'build baseline')}${w.targetMetric==='dinkRally'?' balls':'%'}</div><div class="meta" style="margin-top:6px">Why: ${esc(w.why||'Built from your connected player data.')}</div></div></div>`}).join('')}</div>`:empty('◎','No roadmap yet','Choose a goal and DinkSense will build a plan that rewrites current and future weeks as your evidence changes.','<button class="button primary" data-action="generate-plan">Generate roadmap</button>');
  const history=(state.planMeta?.history||[]).slice().reverse().slice(0,4);
  const adaptationMarkup=history.length?history.map(h=>`<div class="list-item"><div><strong>${esc(h.trigger)} · Week ${h.week}</strong><div class="meta">${new Date(h.at).toLocaleString()} · ${esc(h.summary)}</div></div><span class="pill good">Adapted</span></div>`).join(''):empty('↻','No adaptation yet','Once you generate a plan, new match, session, health, or week data can rewrite the current and future weeks.');
  const expMarkup=experiment?`<div class="experiment-card"><div class="split"><div><div class="eyebrow">ACTIVE COACH EXPERIMENT</div><h3>${esc(experiment.title)}</h3></div><span class="pill ${experiment.status==='validated'?'good':'warn'}">${experiment.matchesLogged||0}/${experiment.matchesNeeded} matches</span></div><p>${esc(experiment.hypothesis)}</p><div class="progress"><span style="width:${experimentProgress(experiment)}%"></span></div><div class="tag-row" style="margin-top:10px"><span class="pill">Baseline ${experiment.baseline}${experiment.metric==='dinkRally'?'':'%'}</span><span class="pill">Now ${experiment.current??experiment.baseline}${experiment.metric==='dinkRally'?'':'%'}</span><span class="pill good">Target ${experiment.target}${experiment.metric==='dinkRally'?'':'%'}</span></div></div>`:empty('⌁','No skill experiment running','Turn one coaching idea into a measurable test across your next matches.','<button class="button primary" data-action="new-experiment">Start experiment</button>');
  const milestoneMarkup=milestone?`<div class="card ${milestone.status==='On pace'?'accent':'soft'}"><div class="split"><div><div class="eyebrow">MILESTONE FORECAST</div><h2>${milestone.start.toFixed(1)} → ${milestone.target.toFixed(1)}</h2></div><span class="pill ${milestone.status==='On pace'?'good':'warn'}">${esc(milestone.status)}</span></div><p>Projected level by ${fmtDate(milestone.targetDate)}: <strong>${milestone.projected.toFixed(2)}</strong>. Plan for roughly ${milestone.totalSessions} sessions across ${milestone.weeks} weeks (${milestone.weeklyMinutes} minutes/week).</p><div class="progress"><span style="width:${clamp(((milestone.projected-milestone.start)/(milestone.target-milestone.start))*100,0,100)}%"></span></div><button class="button dark small" style="margin-top:14px" data-action="milestone-form">Update forecast</button></div>`:empty('↗','No milestone forecast','Set a target level and date to turn your training history into a transparent planning estimate.','<button class="button primary" data-action="milestone-form">Build forecast</button>');
  const patternMarkup=(state.pointPatterns||[]).length?(state.pointPatterns||[]).map(p=>`<div class="card ${p.active?'accent':''}"><div class="card-head"><div><div class="tag-row"><span class="pill ${p.active?'good':''}">${p.active?'Active pattern':'Saved pattern'}</span><span class="pill">${pointPatternRate(p)}% success</span></div><h3 style="margin-top:9px">${esc(p.name)}</h3></div><strong>${p.successes||0}/${p.attempts||0}</strong></div><div class="pattern-chain"><span>${esc(p.firstBall||'First ball')}</span><b>→</b><span>${esc(p.thirdBall||'Third ball')}</span><b>→</b><span>${esc(p.fifthBall||'Fifth ball')}</span></div><p><strong>Attack trigger:</strong> ${esc(p.trigger||'Not set')}<br><strong>Success:</strong> ${esc(p.successDefinition||'Create a clear advantage')}</p><div class="tag-row"><button class="button small" data-pattern-attempt="${p.id}">Log attempt</button><button class="button dark small" data-pattern-success="${p.id}">Log success</button>${p.active?'':`<button class="button secondary small" data-pattern-active="${p.id}">Make active</button>`}<button class="button small" data-pattern-edit="${p.id}">Edit</button><button class="button danger small" data-pattern-delete="${p.id}">Delete</button></div></div>`).join(''):empty('⌁','No point patterns yet','Build a serve-to-fifth-ball sequence, make it active, and measure whether it transfers.','<button class="button primary" data-action="new-pattern">Create pattern</button>');

  $('#view').innerHTML=`
    <div class="grid dashboard-grid">
      <div class="card dark"><div class="split"><div><div class="eyebrow" style="color:var(--accent)">TODAY'S PRESCRIPTION</div><h2>${esc(prescription.title)}</h2><p>${esc(prescription.rationale)}</p><div class="tag-row"><span class="pill">${prescription.duration} minutes</span><span class="pill">${esc(prescription.intensity)}</span><span class="pill">Confidence ${confidence.score}/100</span></div></div><button class="button primary" data-view-drill="${prescription.drillId}">Start session</button></div></div>
      <div class="card accent"><div class="eyebrow">ADAPTIVE ENGINE</div><h2>${state.settings.autoAdaptPlan?'Automatic rewriting is on':'Automatic rewriting is paused'}</h2><p>${state.settings.autoAdaptPlan?'Completed weeks stay locked. The current and future weeks update after meaningful data changes or when a new week begins.':'Your saved plan stays fixed until you run an adaptation manually.'}</p><div class="tag-row"><button class="button dark small" data-action="adapt-now" ${plan.length?'':'disabled'}>Adapt now</button><button class="button small" data-action="toggle-auto-adapt">${state.settings.autoAdaptPlan?'Pause':'Turn on'}</button></div></div>
    </div>
    ${latestAdapt&&state.planMeta.unreadAdaptation?`<div class="adaptation-banner"><div><strong>Your roadmap changed automatically.</strong><span>${esc(latestAdapt.summary)}</span></div><div class="tag-row"><button class="button small" data-action="mark-adaptation-read">Got it</button><button class="button small" data-action="undo-adaptation" ${state.planMeta.undoSnapshot?'':'disabled'}>Undo</button></div></div>`:''}
    ${sectionHead('PERSONAL ROADMAP','A living plan built from your goal, results, session quality, and readiness','<button class="button secondary" data-action="generate-plan">Rebuild from goal</button>')}
    <div class="grid dashboard-grid"><div class="card">${planMarkup}</div><div class="grid"><div class="card accent"><div class="eyebrow">ROADMAP PROGRESS</div><h2>${progress.percent}% complete</h2><div class="progress"><span style="width:${progress.percent}%"></span></div><p>${progress.done}/${progress.total} planned sessions logged. The engine never rewrites completed weeks.</p></div><div class="card"><div class="eyebrow">WEEKLY CHALLENGE</div><h3>${esc(currentChallenge())}</h3><p>Generated from the same weakness and readiness signals as your coach.</p><button class="button small" data-action="new-challenge">Refresh challenge</button></div></div></div>
    ${sectionHead('MILESTONE LAB','Turn ambition into a visible pace and workload estimate','<button class="button primary" data-action="milestone-form">Set target</button>')}
    ${milestoneMarkup}
    ${sectionHead('POINT PATTERN STUDIO','Design repeatable sequences and measure tactical transfer','<button class="button primary" data-action="new-pattern">+ New pattern</button>')}
    <div class="grid two">${patternMarkup}</div>
    ${sectionHead('COACH EXPERIMENTS','Stop guessing—test whether a change actually transfers','<button class="button primary" data-action="new-experiment">+ New experiment</button>')}
    <div class="card">${expMarkup}</div>
    ${sectionHead('ADAPTATION HISTORY','What changed and why',`<div class="tag-row"><button class="button" data-action="show-adaptation-evidence" ${latestAdapt?'':'disabled'}>View evidence</button><button class="button" data-action="undo-adaptation" ${state.planMeta.undoSnapshot?'':'disabled'}>Undo last change</button></div>`)}
    <div class="card"><div class="list">${adaptationMarkup}</div></div>
    ${sectionHead('SOLO MODE','No partner required','<button class="button primary" data-action="solo-session">Build a solo workout</button>')}
    <div class="card soft"><div class="split"><div><h3>AI-generated solo practice</h3><p>Combines wall/rebounder work, serve reps, movement, and off-court strength around your current weakness and readiness.</p></div><span style="font-size:3rem">◉</span></div></div>
    ${sectionHead('STYLE PLAYBOOKS','Original coaching systems inspired by how great players win')}
    <div class="grid four">${STYLE_PLAYBOOKS.map(p=>`<button class="card interactive" data-playbook="${p.id}" style="text-align:left"><div style="font-size:2rem">${p.icon}</div><h3 style="margin-top:10px">${esc(p.name)}</h3><p>${esc(p.summary)}</p></button>`).join('')}</div>
    ${sectionHead('DRILL LIBRARY','Every drill writes back to your profile','<div class="tag-row"><label class="button">Import drill<input id="import-drill" type="file" accept="application/json" hidden></label><button class="button secondary" data-action="strength-plan">Build strength plan</button><button class="button primary" data-action="custom-drill">+ Create drill</button></div>')}
    <div class="grid three">${drillCards}</div>`;
}

function renderVideo(){
  setHeader('Video & Form Lab','LOCAL COMPUTER VISION');
  const list=state.videos.length?state.videos.map(v=>`<div class="list-item"><div><strong>${esc(v.name)}</strong><div class="meta">${fmtDate(v.date)} · ${(v.size/1024/1024).toFixed(1)} MB · ${v.tags?.length||0} tagged moments</div></div><div class="tag-row"><button class="button small" data-open-video="${v.id}">Open</button><button class="button danger small" data-delete-video="${v.id}">Delete</button></div></div>`).join(''):empty('▶','No video library yet','Upload a match video. The file and its timestamp tags are stored locally in your browser.');
  $('#view').innerHTML=`
    <div class="grid two">
      <div class="card"><div class="eyebrow">TIER 1 · SHIPS NOW</div><h2>Searchable clip library</h2><p>Upload a match, tag exact moments by shot/error type, and jump back to every tagged timestamp. Video files stay in local IndexedDB.</p><div class="tag-row"><label class="button primary" style="display:inline-block">Upload video<input id="video-upload" type="file" accept="video/*" hidden></label><button class="button secondary" data-action="search-video">Search moments</button><button class="button" data-action="compare-video" ${state.videos.length<2?'disabled':''}>Compare swings</button></div></div>
      <div class="card accent"><div class="eyebrow">FORM MATCH · LOCAL EXPERIMENT</div><h2>Camera Motion Coach</h2><p>Uses on-device frame-difference analysis to score rep rhythm and stability—without uploading camera video. It is not joint-angle pose estimation or medical analysis.</p><button class="button dark" data-action="camera-lab">Open form lab</button></div>
    </div>
    ${sectionHead('VIDEO LIBRARY','Your tagged match moments')}
    <div class="card"><div class="list">${list}</div></div>
    ${sectionHead('PHASED VISION','Honest technical roadmap')}
    <div class="grid three">
      <div class="card"><span class="pill good">Functional</span><h3 style="margin-top:12px">Timestamp tagging</h3><p>Manual tags, notes, local playback, and searchable moments.</p></div>
      <div class="card"><span class="pill warn">Experimental</span><h3 style="margin-top:12px">Motion consistency</h3><p>Local movement intensity, rep rhythm, and stability from live camera frames.</p></div>
      <div class="card"><span class="pill">Model-ready</span><h3 style="margin-top:12px">Pose + ball tracking</h3><p>The data model and UI are ready, but accurate skeletal grading requires a MediaPipe/ONNX model pack not bundled in this lightweight offline build.</p></div>
    </div>
    <div class="callout" style="margin-top:18px"><p><strong>Privacy:</strong> camera frames are analyzed in memory and are not saved unless you explicitly record or upload a file.</p></div>`;
}

function renderDiscover(){
  setHeader('Court Discovery','GO PLAY');
  const courts=state.courts;
  const courtList=courts.length?courts.map((c,i)=>`<div class="list-item"><div><strong>${esc(c.name)}</strong><div class="meta">${esc(c.address||'Saved locally')} · ${c.courts||1} courts · ${esc(c.surface||'Unknown surface')}</div></div><div class="tag-row"><span class="pill ${c.crowd==='Open'?'good':c.crowd==='Busy'?'bad':'warn'}">${esc(c.crowd||'Unknown')}</span><button class="button small" data-edit-court="${c.id}">Update</button></div></div>`).join(''):empty('⌖','Save your first court','Use your location or add a court manually. Crowd reports are private/local unless you later connect a community backend.','<button class="button primary" data-action="add-court">Add court</button>');
  const pins=courts.slice(0,5).map((c,i)=>`<div class="map-pin" title="${esc(c.name)}" style="left:${18+(i*16)%70}%;top:${30+(i*21)%55}%"><span>${i+1}</span></div>`).join('');
  $('#view').innerHTML=`
    <div class="grid dashboard-grid">
      <div class="card"><div class="card-head"><div><div class="eyebrow">OPEN COURT RADAR</div><h2>Saved nearby courts</h2></div><div class="tag-row"><button class="button secondary small" data-action="use-location">Use location</button><button class="button primary small" data-action="add-court">+ Court</button></div></div><div class="map-placeholder">${pins}</div><div class="list" style="margin-top:14px">${courtList}</div></div>
      <div class="grid">
        <div class="card" id="weather-card"><div class="weather-box"><div><div class="eyebrow">OUTDOOR ADVISORY</div><h2>${navigator.onLine?'Live weather available':'Offline mode'}</h2><p>${navigator.onLine?'Use your location to fetch current conditions from Open-Meteo.':'Core court tools still work; weather needs a connection.'}</p></div><div class="weather-temp">☀</div></div><button class="button small" data-action="weather">Check conditions</button></div>
        <div class="card accent"><div class="eyebrow">AI COURT RECOMMENDER</div><h2>${esc(recommendCourt()?.name||'Add court data')}</h2><p>${esc(recommendCourt()?.reason||'DinkSense ranks courts by crowd status, surface preference, lights, and distance when coordinates are available.')}</p></div>
      </div>
    </div>
    ${sectionHead('SMART PLAY WINDOWS','Beyond a basic map')}
    <div class="grid three"><div class="card"><h3>Sun-position guidance</h3><p>Morning/evening advice uses time, hemisphere, and court orientation entered for each court.</p></div><div class="card"><h3>Surface heat warning</h3><p>Weather combines with surface type to flag hot hard courts and suggest hydration breaks.</p></div><div class="card"><h3>Personal court memory</h3><p>Track where you play best, which partners meet there, and what time the courts usually fill.</p></div></div>`;
}

function renderHealth(){
  setHeader('Health & Longevity','TRAIN TOMORROW TOO');
  const h=healthScore();
  const risk=injuryRiskSignal();
  const logs=[...state.health].sort((a,b)=>b.date.localeCompare(a.date));
  $('#view').innerHTML=`
    <div class="grid four">${statCard(`${h.score}/100`,'Readiness')}${statCard(`${h.load} min`,'7-day load')}${statCard(`${h.soreness}/10`,'Avg. soreness')}${statCard(`${h.sleep}h`,'Avg. sleep')}</div>
    <div class="grid dashboard-grid" style="margin-top:18px">
      <div class="card ${h.recovery==='Rest'?'':'accent'}"><div class="eyebrow">RECOVERY RECOMMENDATION</div><h2>${h.recovery} day</h2><p>${esc(recoveryAdvice(h))}</p><button class="button dark" data-action="health-log">Log today</button></div>
      <div class="card"><div class="eyebrow">LOAD MANAGEMENT</div><div style="display:grid;place-items:center;padding:14px"><div class="donut" style="--value:${h.score}" data-label="${h.score}"></div></div><p>Calculated from recent play minutes, training, soreness, and sleep. This is wellness guidance—not a medical diagnosis.</p></div>
    </div>
    ${sectionHead('MOVEMENT RISK SCREEN','A private, non-medical early-warning layer','<button class="button primary" data-action="movement-screen">Run self-screen</button>')}
    <div class="grid two"><div class="card ${risk.level==='High'?'':'soft'}"><div class="split"><div><div class="eyebrow">OVERUSE + MOVEMENT SIGNAL</div><h2>${risk.level} · ${risk.risk}/100</h2></div><span class="pill ${risk.level==='Low'?'good':risk.level==='Moderate'?'warn':'bad'}">${risk.level}</span></div><p>Current factors: ${esc(risk.factors.join(', '))}. This score combines training load, soreness patterns, and your latest movement self-screen; it does not diagnose injury.</p></div><div class="card"><h3>What the screen checks</h3><p>Backpedaling under lobs, uncontrolled knee collapse, late contact, painful acceleration, one-sided fatigue, and loss of balance during recovery. Persistent pain or sudden symptoms need qualified medical evaluation.</p></div></div>
    ${sectionHead('DAILY LOG','Light-touch recovery signals','<button class="button primary" data-action="health-log">+ Add log</button>')}
    <div class="card"><div class="list">${logs.length?logs.slice(0,14).map(x=>`<div class="list-item"><div><strong>${fmtDate(x.date)}</strong><div class="meta">Soreness ${x.soreness}/10 · Sleep ${x.sleep}h · Hydration ${x.hydration}/5</div></div><span class="pill ${Number(x.soreness)>=7?'bad':Number(x.soreness)>=4?'warn':'good'}">${esc(x.area||'General')}</span></div>`).join(''):empty('♡','No recovery logs','A 15-second check-in helps DinkSense balance training and rest.')}</div></div>
    ${sectionHead('PREP & RECOVERY','Position-specific routines')}
    <div class="grid three"><div class="card"><h3>8-minute court warm-up</h3><p>March + arm circles, lateral shuffles, split-step hops, shadow dinks, progressive serves.</p><button class="button small" data-start-timer="480">Start timer</button></div><div class="card"><h3>Elbow/shoulder care</h3><p>Gentle wrist extensor work, scapular control, and low-load external rotation. Stop if painful.</p><button class="button small" data-start-timer="360">Start timer</button></div><div class="card"><h3>Post-match downshift</h3><p>Easy walk, calves/hips mobility, hydration check, and a simple soreness note.</p><button class="button small" data-start-timer="300">Start timer</button></div></div>`;
}

function renderGear(){
  setHeader('Equipment Intelligence','GEAR THAT FITS YOUR GAME');
  const owned=state.gear;
  $('#view').innerHTML=`
    <div class="card dark"><div class="split"><div><div class="eyebrow" style="color:var(--accent)">PADDLE FINDER</div><h2>Recommendations tied to how you play</h2><p>Answer five questions. DinkSense scores local catalog options by control, power, spin, grip, budget, and your tracked weakness.</p></div><button class="button primary" data-action="paddle-quiz">Find my paddle</button></div></div>
    ${sectionHead('GEAR LIFECYCLE','Usage—not just purchase date','<button class="button primary" data-action="add-gear">+ Add gear</button>')}
    <div class="grid two">${owned.length?owned.map(g=>`<div class="card"><div class="split"><div><span class="pill">${esc(g.type)}</span><h3 style="margin-top:10px">${esc(g.name)}</h3></div><strong>${gearWear(g)}%</strong></div><div class="progress" style="margin-top:14px"><span style="width:${gearWear(g)}%"></span></div><p>${esc(gearAdvice(g))}</p><button class="button small" data-use-gear="${g.id}">+ 1 session</button> <button class="button danger small" data-delete-gear="${g.id}">Remove</button></div>`).join(''):empty('◇','No gear tracked','Add a paddle or shoes to estimate usage and maintenance timing.','<button class="button primary" data-action="add-gear">Add gear</button>')}</div>
    ${sectionHead('LOCAL CATALOG','Spec comparison without affiliate pressure')}
    <div class="grid three">${PADDLES.map(p=>`<div class="card"><div class="card-head"><div><span class="pill">${esc(p.shape)}</span><h3 style="margin-top:10px">${esc(p.name)}</h3><div class="meta">${esc(p.brand)} · $${p.price}</div></div><strong>${p.thickness}mm</strong></div><p>${esc(p.note)}</p><div class="kpi-row"><div class="kpi"><strong>${p.power}/10</strong><span>Power</span></div><div class="kpi"><strong>${p.control}/10</strong><span>Control</span></div><div class="kpi"><strong>${p.spin}/10</strong><span>Spin</span></div></div></div>`).join('')}</div>
    ${sectionHead('LOCAL GEAR SERVICES','Save trusted grip, repair, and fitting contacts','<button class="button primary" data-action="add-service">+ Service</button>')}
    <div class="card"><div class="list">${state.gearServices.length?state.gearServices.map(s=>`<div class="list-item"><div><strong>${esc(s.name)}</strong><div class="meta">${esc(s.type)} · ${esc(s.location||'Location not set')} ${s.phone?'· '+esc(s.phone):''}</div></div><button class="button danger small" data-delete-service="${s.id}">Remove</button></div>`).join(''):empty('◇','No services saved','Build a private directory of local grip replacement, paddle repair, fitting, or court-shoe specialists.')}</div></div>
    ${adSlot()}`;
}


function scoutingPlan(report){
  const focus=focusRecommendation();
  const a=analytics();
  const opener=report.style?`Expect a ${report.style.toLowerCase()} pattern early.`:'Read the first three rallies before overcommitting.';
  const attack=report.targetZone?`Primary target: ${report.targetZone.toLowerCase()}.`:'Primary target: middle first, then the dominant-side hip.';
  const pressure=report.speedupTendency?`If they ${String(report.speedupTendency).toLowerCase()}, keep your paddle up and counter only off balance.`:'Be disciplined about when you speed up and recover to a stable ready position.';
  const ownGame=a.transition<60?'Your match-up key is patient transition-zone execution.':'Your match-up key is preserving your stable base game before accelerating.';
  return `${opener} ${attack} ${pressure} ${ownGame} Weekly carry-over cue: ${focus.title}.`;
}
function scoutingForm(report={}){
  const isEdit=Boolean(report.id);
  modal(`<h2>${isEdit?'Edit scouting report':'New scouting report'}</h2><p>Store an opponent read, partner tendencies, or bracket prep notes in one place.</p><form id="scout-form" class="form-grid"><input type="hidden" name="id" value="${esc(report.id||'')}"><div class="field"><label>Opponent / team</label><input name="opponent" required value="${esc(report.opponent||'')}" placeholder="Name or team"></div><div class="field"><label>Handedness</label><select name="handedness"><option value="">Unknown</option><option value="Right" ${report.handedness==='Right'?'selected':''}>Right</option><option value="Left" ${report.handedness==='Left'?'selected':''}>Left</option></select></div><div class="field"><label>Playing style</label><select name="style"><option value="">Unknown</option><option ${report.style==='Aggressive net-rusher'?'selected':''}>Aggressive net-rusher</option><option ${report.style==='Patient dinker'?'selected':''}>Patient dinker</option><option ${report.style==='Power baseliner'?'selected':''}>Power baseliner</option><option ${report.style==='All-court'?'selected':''}>All-court</option></select></div><div class="field"><label>Biggest strength</label><input name="strengths" value="${esc(report.strengths||'')}" placeholder="Ex: fast hands, heavy drive, lefty angles"></div><div class="field"><label>Best target zone</label><input name="targetZone" value="${esc(report.targetZone||'')}" placeholder="Ex: backhand hip, middle, transition body"></div><div class="field"><label>Speed-up tendency</label><input name="speedupTendency" value="${esc(report.speedupTendency||'')}" placeholder="Ex: speeds up off high forehand dink"></div><div class="field full"><label>Notes</label><textarea name="notes" placeholder="Serve patterns, return depth, movement habits, pressure tendencies">${esc(report.notes||'')}</textarea></div><div class="form-actions"><button class="button" type="button" onclick="document.getElementById('modal').close()">Cancel</button><button class="button primary">${isEdit?'Save changes':'Save report'}</button></div></form>`);
  $('#scout-form').addEventListener('submit',async e=>{
    e.preventDefault();
    const data=Object.fromEntries(new FormData(e.currentTarget));
    const existing=state.scoutingReports.find(x=>x.id===data.id);
    const next={
      id:data.id||uid('scout'),
      opponent:data.opponent.trim(),
      handedness:data.handedness,
      style:data.style,
      strengths:data.strengths.trim(),
      targetZone:data.targetZone.trim(),
      speedupTendency:data.speedupTendency.trim(),
      notes:data.notes.trim(),
      createdAt:existing?.createdAt||new Date().toISOString(),
      updatedAt:new Date().toISOString()
    };
    next.plan=scoutingPlan(next);
    if(existing) state.scoutingReports=state.scoutingReports.map(x=>x.id===next.id?next:x);
    else state.scoutingReports.unshift(next);
    await saveState({quiet:true});
    closeModal();
    toast('Scouting report saved');
    render();
  });
}
function openScoutingReport(id){
  const report=state.scoutingReports.find(x=>x.id===id); if(!report)return;
  modal(`<h2>${esc(report.opponent)}</h2><p class="meta">${esc([report.handedness||'Unknown handedness',report.style||'Unknown style'].join(' · '))}</p><div class="callout"><p>${esc(report.plan||scoutingPlan(report))}</p></div><div class="grid two" style="margin-top:14px"><div class="card"><h3>Strengths / tendencies</h3><p><strong>Strength:</strong> ${esc(report.strengths||'Not logged')}<br><strong>Best target:</strong> ${esc(report.targetZone||'Not logged')}<br><strong>Speed-up tendency:</strong> ${esc(report.speedupTendency||'Not logged')}</p></div><div class="card"><h3>Notes</h3><p>${esc(report.notes||'No notes added yet.')}</p></div></div><div class="form-actions"><button class="button" type="button" onclick="document.getElementById('modal').close()">Close</button><button class="button secondary" id="edit-scout-inline">Edit</button></div>`);
  $('#edit-scout-inline').onclick=()=>scoutingForm(report);
}


function renderCompete(){
  setHeader('Competition & Sponsorship','TURN PROGRESS INTO OPPORTUNITY');
  const a=analytics();
  const tournaments=state.tournaments.length?state.tournaments.map(t=>`<div class="list-item"><div><strong>${esc(t.name)}</strong><div class="meta">${fmtDate(t.date)} · ${esc(t.location)} · ${esc(t.bracket)}${t.report?' · report saved':''}</div></div><div class="tag-row"><span class="pill ${t.status==='Registered'?'good':t.status==='Completed'?'warn':''}">${esc(t.status)}</span><button class="button small" data-tournament-report="${t.id}">${t.report?'View report':'Report card'}</button>${t.url?`<a class="button small" href="${esc(t.url)}" target="_blank" rel="noopener">Register ↗</a>`:''}</div></div>`).join(''):empty('⚑','No tournaments saved','Add a tournament from an organizer listing. DinkSense will create a prep recommendation and post-event report.','<button class="button primary" data-action="add-tournament">Add tournament</button>');
  const scouting=(state.scoutingReports||[]).length?(state.scoutingReports||[]).slice().sort((a,b)=>(b.updatedAt||'').localeCompare(a.updatedAt||'')).map(r=>`<div class="card"><div class="card-head"><div><div class="eyebrow">SCOUTING REPORT</div><h3>${esc(r.opponent)}</h3><div class="meta">${esc([r.handedness||'Unknown handedness',r.style||'Unknown style'].join(' · '))}</div></div><span class="pill">${fmtDate((r.updatedAt||'').slice(0,10)||todayISO())}</span></div><p>${esc(r.plan||scoutingPlan(r))}</p><div class="tag-row">${r.strengths?`<span class="pill">${esc(r.strengths)}</span>`:''}${r.targetZone?`<span class="pill good">Target ${esc(r.targetZone)}</span>`:''}</div><div class="tag-row" style="margin-top:14px"><button class="button small" data-open-scout="${r.id}">Open</button><button class="button secondary small" data-edit-scout="${r.id}">Edit</button><button class="button danger small" data-delete-scout="${r.id}">Delete</button></div></div>`).join(''):empty('✦','No scouting reports yet','Create opponent reports with target zones, strengths, and a pre-match plan.','<button class="button primary" data-action="add-scout">Add report</button>');
  $('#view').innerHTML=`
    <div class="grid two">
      <div class="card"><div class="card-head"><div><div class="eyebrow">TOURNAMENT DISCOVERY</div><h2>External events, smarter fit</h2></div><button class="button primary small" data-action="add-tournament">+ Add</button></div><p>DinkSense never hosts events. Save public organizer listings, then compare the bracket to your current profile.</p><div class="list">${tournaments}</div><div class="tag-row" style="margin-top:14px"><a class="button secondary small" href="https://pickleballbrackets.com" target="_blank" rel="noopener">Search PickleballBrackets ↗</a><a class="button secondary small" href="https://www.pickleballtournaments.com" target="_blank" rel="noopener">Search listings ↗</a></div></div>
      <div class="card accent"><div class="eyebrow">BRACKET READINESS</div><h2>${bracketRecommendation()}</h2><p>Based on skill profile, recent win rate (${a.recentWinRate}%), transition success (${a.transition}%), and pressure execution (${a.pressure}%).</p><div class="callout"><p>Recommendation is training guidance—not an official rating or eligibility decision.</p></div></div>
    </div>
    ${sectionHead('SCOUTING LAB','Prepare for specific opponents','<button class="button primary" data-action="add-scout">+ Scouting report</button>')}
    <div class="grid two">${scouting}</div>
    ${sectionHead('SPONSORSHIP ENGINE','A verified-looking portfolio built from real logs')}
    <div class="grid dashboard-grid">
      <div class="card dark"><div class="eyebrow" style="color:var(--accent)">AI PITCH GENERATOR</div><h2>Your results become proof points</h2><p>Generate an editable brand outreach draft using your match volume, improvement, competition level, story, and goals.</p><button class="button primary" data-action="sponsor-pitch">Generate pitch</button></div>
      <div class="card"><div class="eyebrow">PORTFOLIO STRENGTH</div><div class="score-ring" style="margin:14px auto"><div><strong>${portfolioScore()}</strong><span>out of 100</span></div></div><p>${portfolioAdvice()}</p><button class="button small" data-nav="profile">Improve profile</button></div>
    </div>
    ${sectionHead('CLUB STUDIO','Local ladder and event tools','<div class="tag-row"><button class="button secondary" data-action="add-ladder-player">+ Ladder player</button><button class="button primary" data-action="add-club-event">+ Club event</button></div>')}
    <div class="grid two"><div class="card"><div class="eyebrow">LOCAL LADDER</div><div class="list" style="margin-top:12px">${state.ladderPlayers.length?state.ladderPlayers.slice().sort((x,y)=>(y.wins-y.losses)-(x.wins-x.losses)||y.wins-x.wins).map((p,i)=>`<div class="list-item"><div><strong>#${i+1} ${esc(p.name)}</strong><div class="meta">${p.wins} wins · ${p.losses} losses · ${esc(p.level||'Open level')}</div></div><button class="button small" data-ladder-result="${p.id}">Update</button></div>`).join(''):empty('▦','No ladder yet','Add players and update results locally. No accounts or server required.')}</div></div><div class="card"><div class="eyebrow">CLUB CALENDAR</div><div class="list" style="margin-top:12px">${state.clubEvents.length?state.clubEvents.slice().sort((x,y)=>x.date.localeCompare(y.date)).map(e=>`<div class="list-item"><div><strong>${esc(e.name)}</strong><div class="meta">${fmtDate(e.date)} · ${esc(e.time||'Time TBD')} · ${esc(e.court||'Court TBD')}</div></div><span class="pill">${esc(e.format||'Open play')}</span></div>`).join(''):empty('◫','No club events','Schedule ladders, clinics, open play, or round robins in this private local workspace.')}</div></div></div>
    ${sectionHead('PICKLEBALL WRAPPED','Built to share, stored locally')}
    <div class="card soft"><div class="split"><div><h2>${new Date().toLocaleString(undefined,{month:'long'})} recap</h2><p>${a.matches.length} matches · ${a.wins} wins · ${a.hours} court/training hours · biggest focus: ${esc(a.weakness)}</p></div><button class="button dark" data-action="wrapped">Create share card</button></div></div>`;
}

function renderProfile(){
  setHeader('Athlete Profile','VERIFIED-STYLE PORTFOLIO');
  const p=state.profile,a=analytics();
  $('#view').innerHTML=`
    <div class="card profile-hero">
      ${p.avatar?`<img class="avatar" src="${esc(p.avatar)}" alt="${esc(p.name)}">`:`<div class="avatar">${esc(initials(p.name))}</div>`}
      <div><div class="eyebrow">DINKSENSE ATHLETE</div><h2>${esc(p.name)}</h2><p style="margin:6px 0">${esc([p.city,p.state].filter(Boolean).join(', ')||'Location private')} · ${esc(p.handedness)}-handed · ${esc(p.style)}</p><div class="tag-row"><span class="pill dark">${Number(p.skill).toFixed(1)} profile</span>${p.dupr?`<span class="pill good">DUPR ${esc(p.dupr)} self-entered</span>`:''}<span class="pill">${a.matches.length} matches</span></div></div>
      <div class="score-ring"><div><strong>${portfolioScore()}</strong><span>portfolio score</span></div></div>
    </div>
    <div class="grid dashboard-grid" style="margin-top:18px">
      <div class="card"><div class="card-head"><div><div class="eyebrow">PROFILE DETAILS</div><h2>Tell the complete athlete story</h2></div><button class="button primary small" data-action="edit-profile">Edit</button></div><p>${esc(p.bio||'Add a short player story, competitive goals, and what makes your game distinctive.')}</p><div class="grid two"><div class="stat-chip"><strong>${a.winRate}%</strong><div class="meta">Win rate</div></div><div class="stat-chip"><strong>${a.transition}%</strong><div class="meta">Transition</div></div><div class="stat-chip"><strong>${a.pressure}%</strong><div class="meta">Pressure</div></div><div class="stat-chip"><strong>${state.badges.length}</strong><div class="meta">Badges</div></div></div></div>
      <div class="card accent"><div class="eyebrow">SHAREABLE PORTFOLIO</div><h2>Export a standalone profile</h2><p>Creates one HTML file with your public bio, stats, badges, goals, and recent results. You decide when and where to share it.</p><button class="button dark" data-action="export-profile">Export profile HTML</button></div>
    </div>
    ${sectionHead('ACHIEVEMENTS','Earned from tracked stats')}
    <div class="badge-grid">${allBadges().map(b=>`<div class="badge ${state.badges.includes(b.name)?'':'locked'}"><div class="badge-icon">${b.icon}</div><strong>${esc(b.name)}</strong><span>${esc(b.rule)}</span></div>`).join('')}</div>
    ${sectionHead('PRIVACY','You control the portfolio')}
    <div class="callout"><p>Your profile is private by default. Nothing is uploaded or published by this build. DUPR is self-entered and clearly labeled because automatic verification requires an approved external integration.</p></div>`;
}


function renderFounder(){
  setHeader('About the Founder','BUILT FROM REAL COMPETITION');
  const photo=state.founder.photo || 'assets/shriyan-avadhanula-founder.png';
  $('#view').innerHTML=`
    <div class="hero" style="min-height:430px">
      <div class="hero-copy"><div class="eyebrow" style="color:var(--accent)">FOUNDER · ATHLETE · BUILDER</div><h2>Shriyan<br>Avadhanula</h2><p>DinkSense was created from the perspective of a competitive player who wanted more than a rating number—an app that explains the game and turns every match into a smarter next step.</p><div class="tag-row"><span class="pill good">4.5 singles competitor</span><span class="pill">IB MYP student</span><span class="pill dark">Founder & builder</span></div></div>
      <div class="hero-side"><img src="${esc(photo)}" alt="Shriyan Avadhanula" style="width:100%;max-height:430px;object-fit:cover;object-position:center top;border-radius:28px;border:1px solid rgba(255,255,255,.2)"></div>
    </div>
    ${sectionHead('THE STORY','Why DinkSense exists')}
    <div class="grid dashboard-grid">
      <div class="card"><h2>Built by Shriyan Avadhanula</h2><p>Shriyan is a 10th-grade IB MYP student at Henrico High School in Richmond, Virginia, with a 3.95 GPA and interests spanning finance, cybersecurity, and software development.</p><p>He has extensive competitive pickleball experience, including competing at the 4.5 singles level, and has independently secured sponsorships with major brands including Paddletek and Franklin, among others.</p><p>DinkSense grew out of his own experience as a competitive player: tracking improvement was fragmented, generic advice was disconnected from real performance, and junior athletes lacked a complete way to present verified progress. He designed this system to support his own pickleball journey and to give players at every level—not only elite competitors—practical tools to understand and improve their game.</p></div>
      <div class="grid"><div class="card accent"><div class="eyebrow">CORE BELIEF</div><h2>“Don’t just track the rating. Explain the game.”</h2></div><div class="card"><div class="eyebrow">FOUNDER HIGHLIGHTS</div><div class="list"><div class="list-item"><strong>Competitive level</strong><span class="pill dark">4.5 singles</span></div><div class="list-item"><strong>Independent sponsorships</strong><span class="pill good">Paddletek · Franklin</span></div><div class="list-item"><strong>Academic program</strong><span class="pill">IB MYP</span></div><div class="list-item"><strong>Product role</strong><span class="pill">Founder & builder</span></div></div></div></div>
    </div>
    ${sectionHead('FOUNDER JOURNEY','Athlete insight turned into product design')}
    <div class="grid three"><div class="card"><h3>Compete</h3><p>Real match-play experience revealed that improvement was too often reduced to a single rating number.</p></div><div class="card"><h3>Analyze</h3><p>DinkSense was designed so the AI coach, match logs, roadmap, health, gear, and video tools all pull from one athlete profile.</p></div><div class="card"><h3>Present</h3><p>The public-profile and sponsorship tools make it easier for ambitious juniors to show progress with evidence, not hype.</p></div></div>
    ${sectionHead('PRODUCT PHILOSOPHY','One coherent athlete-intelligence system')}
    <div class="grid three"><div class="card"><h3>Useful for one player</h3><p>No core feature depends on friends joining. Your data alone creates value.</p></div><div class="card"><h3>Local-first by design</h3><p>Private logs, videos, goals, and coaching patterns stay under the player’s control.</p></div><div class="card"><h3>Ambitious, but honest</h3><p>Working features are labeled clearly; advanced model integrations are never faked.</p></div></div>`;
}

function renderSettings(){
  setHeader('Settings & Data','LOCAL-FIRST CONTROL CENTER');
  const bytes=new Blob([JSON.stringify(state)]).size;
  $('#view').innerHTML=`
    <div class="grid two">
      <div class="card"><div class="eyebrow">LOCAL STORAGE</div><h2>Your data is on this device</h2><p>Profiles, matches, drills, health logs, plans, settings, and video metadata are saved in IndexedDB with a localStorage fallback. Uploaded video blobs are stored in IndexedDB.</p><div class="kpi-row"><div class="kpi"><strong>${(bytes/1024).toFixed(1)} KB</strong><span>Structured data</span></div><div class="kpi"><strong>${state.videos.length}</strong><span>Local videos</span></div><div class="kpi"><strong>0</strong><span>Cloud uploads</span></div></div><div class="tag-row" style="margin-top:16px"><button class="button primary" data-action="export-data">Export backup</button><label class="button secondary">Import backup<input id="import-data" type="file" accept="application/json" hidden></label></div></div>
      <div class="card accent"><div class="eyebrow">OPTIONAL LOCAL AI</div><h2>Connect Ollama on your computer</h2><p>The built-in coach works offline with rules and your statistics. Ollama adds a more conversational local language model while keeping prompts on your own computer.</p><button class="button dark" data-action="ollama-settings">Configure local AI</button></div>
    </div>
    ${sectionHead('ADAPTIVE COACH ENGINE','Control automatic plan rewriting')}
    <div class="grid two"><div class="card"><div class="split"><div><h3>Automatic roadmap adaptation</h3><p>Rewrites only the current and future weeks after meaningful local data changes. Completed weeks remain locked.</p></div><span class="pill ${state.settings.autoAdaptPlan?'good':'warn'}">${state.settings.autoAdaptPlan?'On':'Paused'}</span></div><button class="button small" data-action="toggle-auto-adapt">${state.settings.autoAdaptPlan?'Pause automatic changes':'Enable automatic changes'}</button></div><div class="card"><div class="eyebrow">COACHING CONFIDENCE</div><h2>${coachingConfidence().score}/100</h2><div class="progress"><span style="width:${coachingConfidence().score}%"></span></div><p>${esc(coachingConfidence().detail)}</p></div></div>
    ${sectionHead('APP CONTROL','Backups, demos, and reset')}
    <div class="grid three"><div class="card"><h3>Install as an app</h3><p>When served on localhost or HTTPS, DinkSense can install as a PWA and cache its interface for offline use.</p><button class="button small" id="settings-install" ${deferredInstallPrompt?'':'disabled'}>Install</button></div><div class="card"><h3>Load demo data</h3><p>Explore every dashboard with realistic sample matches, sessions, health logs, courts, and gear.</p><button class="button small" data-action="demo-data">Load demo</button></div><div class="card"><h3>Reset local app</h3><p>Deletes structured data and locally stored videos from this browser only.</p><button class="button danger small" data-action="reset-app">Reset everything</button></div></div>
    ${sectionHead('LOCAL AI STATUS','No API key required')}
    <div class="card"><div class="split"><div><strong>${state.settings.ollamaEnabled?'Ollama enabled':'Built-in coach active'}</strong><div class="meta">${state.settings.ollamaEnabled?`${esc(state.settings.ollamaModel)} at ${esc(state.settings.ollamaUrl)}`:'Deterministic local insight engine based on your tracked stats'}</div></div><span class="pill ${state.settings.ollamaEnabled?'good':''}">${state.settings.ollamaEnabled?'Local LLM':'Offline rules'}</span></div></div>
    ${sectionHead('TRANSPARENCY','What needs an internet connection')}
    <div class="card table-wrap"><table><thead><tr><th>Feature</th><th>Local status</th><th>Why</th></tr></thead><tbody><tr><td>Tracking, analytics, training, health, gear</td><td><span class="pill good">Fully local</span></td><td>No server required</td></tr><tr><td>AI coach + adaptive roadmap</td><td><span class="pill good">Local</span></td><td>Rules, trend analysis, plan rewriting, and experiments are built in; Ollama optional</td></tr><tr><td>Video library</td><td><span class="pill good">Local</span></td><td>IndexedDB blobs</td></tr><tr><td>Live weather</td><td><span class="pill warn">Optional online</span></td><td>Open-Meteo current conditions</td></tr><tr><td>DUPR verification, live tournament aggregation, shared crowds, leaderboards</td><td><span class="pill">Integration-ready</span></td><td>Require approved external APIs and a backend</td></tr><tr><td>Pose + hand form grading</td><td><span class="pill good">On-device</span></td><td>MediaPipe runs in the browser; first model load needs internet</td></tr><tr><td>Automatic ball/court tracking</td><td><span class="pill">Specialist model required</span></td><td>Still needs a sport-specific ball and court model</td></tr></tbody></table></div>
    <p class="fine-print" style="margin-top:18px">DinkSense ${APP_VERSION}. This build provides training and wellness guidance, not medical advice.</p>`;
}
function currentChallenge(){
  if(!state.challenges.length){
    const a=analytics();
    if(a.transition<60) return 'Reach the kitchen successfully 10 times using two or more controlled transition balls.';
    if(a.pressure<55) return 'Play three mini-games beginning at 10–10 and log every pressure decision.';
    if(a.reset<65) return 'Complete 50 compact backhand resets with at least 35 landing unattackable.';
    return 'Win three points this week by creating—not forcing—the first attackable ball.';
  }
  return state.challenges[state.challenges.length-1].text;
}
function recommendCourt(){
  if(!state.courts.length) return null;
  const ranked=state.courts.map(c=>{
    let score=0;
    if(c.crowd==='Open') score+=35; else if(c.crowd==='Moderate') score+=20; else if(c.crowd==='Busy') score-=10;
    if(c.lights) score+=8;
    if(c.surface?.toLowerCase().includes('acrylic')) score+=8;
    score+=Math.min(12,Number(c.courts||1)*2);
    return {...c,_score:score};
  }).sort((a,b)=>b._score-a._score);
  const best=ranked[0];
  return {name:best.name,reason:`Best current fit: ${best.crowd||'unknown'} crowd, ${best.courts||1} courts, ${best.surface||'surface unknown'}${best.lights?', and lights available':''}.`};
}
function recoveryAdvice(h){
  if(h.recovery==='Rest') return 'Skip high-intensity play today. Choose gentle mobility, easy walking, hydration, and consider professional guidance for persistent or severe pain.';
  if(h.recovery==='Light') return 'Use a technical session with long rests: serves, soft resets, and mobility. Avoid stacking another long match block.';
  return 'Your recent load looks manageable. Warm up progressively, keep quality high, and log soreness afterward so the recommendation can adapt.';
}
function gearWear(g){
  const sessions=Number(g.sessions||0); const ageDays=Math.max(0,Math.floor((Date.now()-new Date(g.purchaseDate||todayISO()).getTime())/86400000));
  const divisor=g.type==='Shoes'?55:120;
  return Math.round(clamp((sessions/divisor)*70+(ageDays/730)*30,0,100));
}
function gearAdvice(g){
  const wear=gearWear(g);
  if(wear>=85) return 'High estimated wear. Inspect grip, face texture, edge guard, cushioning, and consistency before important play.';
  if(wear>=60) return 'Moderate wear. Compare feel against a newer reference and schedule grip/sole inspection.';
  return 'Estimated condition is healthy. Keep logging sessions for a more useful lifecycle estimate.';
}
function bracketRecommendation(){
  const a=analytics(); const skill=Number(state.profile.skill||3.5);
  if(a.matches.length<4) return `Start with a ${skill.toFixed(1)} bracket and collect more match data`;
  if(a.recentWinRate>=70 && a.transition>=65 && a.pressure>=55) return `Strong case to test ${Math.min(5,skill+0.5).toFixed(1)}`;
  if(a.recentWinRate<40 || a.transition<50) return `Build consistency in ${skill.toFixed(1)} before moving up`;
  return `${skill.toFixed(1)} looks like the right competitive fit now`;
}
function portfolioScore(){
  const a=analytics(),p=state.profile;
  let s=10;
  s+=Math.min(25,a.matches.length*2.5);
  s+=p.bio?12:0; s+=p.avatar?8:0; s+=p.city?5:0; s+=p.dupr?8:0;
  s+=Math.min(12,state.badges.length*2); s+=state.videos.length?8:0; s+=state.tournaments.length?7:0; s+=state.plan.length?5:0;
  return Math.round(clamp(s,0,100));
}
function portfolioAdvice(){
  const missing=[];
  if(!state.profile.bio) missing.push('player story');
  if(!state.profile.avatar) missing.push('photo');
  if(state.matches.length<8) missing.push('more match logs');
  if(!state.videos.length) missing.push('video evidence');
  if(!state.tournaments.length) missing.push('competition history');
  return missing.length?`Next strongest additions: ${missing.slice(0,3).join(', ')}.`:'Your portfolio has strong coverage across story, stats, competition, and evidence.';
}
function allBadges(){
  return [
    {name:'First Log',icon:'＋',rule:'Log one match'},
    {name:'Data Builder',icon:'▦',rule:'Log 10 matches'},
    {name:'Match Maker',icon:'⚡',rule:'Record 5 wins'},
    {name:'Comeback King',icon:'♛',rule:'65% pressure success'},
    {name:'Kitchen Wizard',icon:'◎',rule:'Average 8-dink rallies'},
    {name:'Serve Machine',icon:'↗',rule:'Complete 5 serve sessions'},
    {name:'Film Student',icon:'▶',rule:'Add 3 videos'},
    {name:'Live Analyst',icon:'●',rule:'Track a live match'},
    {name:'Drill Architect',icon:'✎',rule:'Create a custom drill'},
    {name:'Club Builder',icon:'▦',rule:'Schedule a club event'}
  ];
}
function initials(name){ return String(name||'P').split(/\s+/).map(x=>x[0]).join('').slice(0,2).toUpperCase(); }
function localCoachAnswer(question){
  const q=String(question||'').toLowerCase(),a=analytics(),h=healthScore(),f=focusRecommendation();
  if(a.matches.length===0) return 'Start by logging two matches. Include transition success, reset success, pressure points, and one dominant error. That gives me enough evidence to move beyond generic advice.';
  if(q.includes('close')||q.includes('pressure')) return a.pressure<50?`You are converting ${a.pressure}% of tagged pressure points. Your next session should use the 10–10 simulator: pick one high-margin serve target, commit to your preferred third-ball pattern, and score decision quality—not only whether you win.`:`Your pressure conversion is ${a.pressure}%, which is a strength. Protect it by keeping the same pre-point cue and avoiding unnecessary speed-ups after 10–10.`;
  if(q.includes('transition')) return `Your average transition success is ${a.transition}%. ${a.transition<60?'The likely priority is split-step timing and compact resets. Stop treating the transition zone like a place to sprint through; earn one controlled ball at a time.':'This is trending as a relative strength. Add more random feeds and planned counters so success holds under pace.'}`;
  if(q.includes('reset')||q.includes('backhand')) return `Your logged reset success is ${a.reset}%. Focus on a quiet wrist, contact in front, and enough net clearance that the ball falls rather than floats. Use Wall Reset Rhythm for 10 minutes, then test it from midcourt.`;
  if(q.includes('why')&&q.includes('los')) return `The most repeated issue in your match logs is “${a.weakness}.” Your transition success is ${a.transition}% and pressure conversion is ${a.pressure}%. The best next experiment is to change one decision rule for three matches, then compare—not overhaul your whole game at once.`;
  if(q.includes('recover')||q.includes('sore')||q.includes('rest')) return `${h.recovery} recommendation: ${recoveryAdvice(h)}`;
  if(q.includes('tournament')||q.includes('bracket')) return `${bracketRecommendation()}. I would use your next two matches to test first-ball depth and pressure decisions before finalizing a bracket choice.`;
  if(q.includes('paddle')||q.includes('gear')) return `Your profile says ${state.profile.style} style and your main tracked issue is ${a.weakness}. Prioritize a paddle that supports the weakness without taking away your identity: more control if resets/transition are the issue; more power only if you already create attackable balls reliably.`;
  if(q.includes('plan')&&(q.includes('change')||q.includes('adapt')||q.includes('why'))){const last=(state.planMeta?.history||[]).slice(-1)[0];return last?`I rewrote the current/future roadmap because ${last.evidence.join('; ')}. The main change was: ${last.summary}. Completed weeks were preserved, and you can undo the last rewrite in Training.`:'Your roadmap has not adapted yet. Generate a plan, then log a match, session-quality review, or readiness check-in.';}
  if(q.includes('today')||q.includes('workout')){const p=todayPrescription();return `Today: ${p.title} for about ${p.duration} minutes at ${p.intensity} intensity. ${p.rationale} Log quality, effort, and successful reps afterward so the next week can adapt.`;}
  if(q.includes('experiment')||q.includes('test')){const x=activeExperiment();return x?`Your active experiment is “${x.title}.” You have ${x.matchesLogged||0}/${x.matchesNeeded} matches and the metric moved from ${x.baseline} to ${x.current??x.baseline}, with a target of ${x.target}. Keep the cue stable until the sample is complete.`:`Start a Coach Experiment from Training. It locks one hypothesis and measures whether it transfers across your next matches.`;}
  if(q.includes('improv')||q.includes('trend')){const t=trendSignals();return `Recent-vs-previous movement: transition ${t.transitionDelta>=0?'+':''}${t.transitionDelta}, reset ${t.resetDelta>=0?'+':''}${t.resetDelta}, pressure ${t.pressureDelta>=0?'+':''}${t.pressureDelta}, and win rate ${t.winRateDelta>=0?'+':''}${t.winRateDelta}. Treat this as directional until the sample grows.`;}
  if(q.includes('pattern')||q.includes('game plan')||q.includes('sequence')){const p=activePointPattern();return p?`Your active Point Pattern is “${p.name}.” Run it at least five times before changing it. Current success is ${pointPatternRate(p)}% across ${p.attempts||0} attempts. The trigger is ${p.trigger||'not set yet'}, and success means ${p.successDefinition||'creating a clear fifth-ball advantage'}.`:'Create a Point Pattern in Training. Define the first ball, third ball, fifth ball, attack trigger, and success condition so the coach can measure tactical transfer.';}
  if(q.includes('milestone')||q.includes('target level')||q.includes('projection')){const m=milestoneForecast();return m?`Your local forecast projects ${m.projected.toFixed(2)} by ${fmtDate(m.targetDate)} against a target of ${m.target.toFixed(1)}. Status: ${m.status}. The planning load is about ${m.sessionsPerWeek} sessions and ${m.weeklyMinutes} minutes per week. This is a heuristic, not an official rating prediction.`:'Set a target level and date in Milestone Lab so I can turn your recent improvement, session quality, and weekly volume into a transparent forecast.';}
  if(q.includes('week')||q.includes('focus')||q.includes('train')) return `${f.title}: ${f.detail} Complete ${findDrill(f.drill)?.name||'the recommended drill'} twice, then tag the same metric in your next match so we can see whether it transfers.`;
  return `Based on ${a.matches.length} logged matches, your strongest current signal is a ${a.winRate}% win rate and your clearest improvement target is ${a.weakness}. ${f.detail}`;
}

async function coachAnswer(question){
  if(state.settings.ollamaEnabled){
    try{
      const a=analytics();
      const system=`You are DinkSense, a concise pickleball coach. Use only the supplied player data. Never invent stats. Give practical drills and explain uncertainty. Player data: ${JSON.stringify({profile:state.profile,analytics:a,recentMatches:a.recent,health:healthScore(),focus:focusRecommendation(),today:todayPrescription(),roadmap:state.plan,roadmapMeta:state.planMeta,experiment:activeExperiment(),trends:trendSignals(),confidence:coachingConfidence(),gameDNA:gameDNA(),milestone:milestoneForecast(),activePointPattern:activePointPattern()})}`;
      const response=await fetch(`${state.settings.ollamaUrl.replace(/\/$/,'')}/api/chat`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:state.settings.ollamaModel,stream:false,messages:[{role:'system',content:system},{role:'user',content:question}]})});
      if(!response.ok) throw new Error(`Ollama ${response.status}`);
      const data=await response.json();
      return data.message?.content||localCoachAnswer(question);
    }catch(err){ toast('Local Ollama unavailable; used built-in coach'); }
  }
  return localCoachAnswer(question);
}

function modal(html){
  $('#modal-body').innerHTML=html;
  const d=$('#modal'); if(!d.open) d.showModal();
}
function closeModal(){ const d=$('#modal'); if(d.open) d.close(); }

function matchForm(match={}){
  const isEdit=Boolean(match.id);
  modal(`<h2>${isEdit?'Edit match':'Log a match'}</h2><p>Quick fields first; deeper tags are optional but improve coaching.</p>
  <form id="match-form" class="form-grid">
    <input type="hidden" name="id" value="${esc(match.id||'')}">
    <div class="field"><label>Date</label><input name="date" type="date" required value="${esc(match.date||todayISO())}"></div>
    <div class="field"><label>Format</label><select name="type"><option ${match.type==='Singles'?'selected':''}>Singles</option><option ${match.type==='Doubles'?'selected':''}>Doubles</option></select></div>
    <div class="field"><label>Result</label><select name="result"><option value="W" ${match.result!=='L'?'selected':''}>Win</option><option value="L" ${match.result==='L'?'selected':''}>Loss</option></select></div>
    <div class="field"><label>Opponent</label><input name="opponent" value="${esc(match.opponent||'')}" placeholder="Name or team"></div>
    <div class="field"><label>Your score</label><input name="scoreFor" type="number" min="0" max="99" required value="${esc(match.scoreFor??11)}"></div>
    <div class="field"><label>Opponent score</label><input name="scoreAgainst" type="number" min="0" max="99" required value="${esc(match.scoreAgainst??7)}"></div>
    <div class="field"><label>Partner (doubles)</label><input name="partner" value="${esc(match.partner||'')}"></div>
    <div class="field"><label>Court</label><input name="court" value="${esc(match.court||'')}"></div>
    <div class="field"><label>Duration (minutes)</label><input name="duration" type="number" min="0" max="600" value="${esc(match.duration??25)}"></div>
    <div class="field"><label>Third-shot preference</label><select name="thirdShot"><option>Mixed</option><option ${match.thirdShot==='Drop'?'selected':''}>Drop</option><option ${match.thirdShot==='Drive'?'selected':''}>Drive</option></select></div>
    <div class="field"><label>Reset success %</label><input name="resetSuccess" type="number" min="0" max="100" value="${esc(match.resetSuccess??60)}"></div>
    <div class="field"><label>Transition success %</label><input name="transitionSuccess" type="number" min="0" max="100" value="${esc(match.transitionSuccess??60)}"></div>
    <div class="field"><label>Avg. dink rally length</label><input name="dinkRally" type="number" min="0" max="100" step="0.1" value="${esc(match.dinkRally??5)}"></div>
    <div class="field"><label>Main issue</label><select name="dominantError">${['None','Backhand reset','Forehand reset','Third-shot drop','Third-shot drive','Dink attack timing','Serve depth','Return depth','Overhead','Transition footwork','Unforced dink error'].map(x=>`<option ${match.dominantError===x?'selected':''}>${x}</option>`).join('')}</select></div>
    <div class="field"><label>Pressure points won</label><input name="pressureWon" type="number" min="0" max="99" value="${esc(match.pressureWon??0)}"></div>
    <div class="field"><label>Pressure points played</label><input name="pressurePlayed" type="number" min="0" max="99" value="${esc(match.pressurePlayed??0)}"></div>
    <div class="field full"><label>Notes / voice recap</label><textarea name="notes" placeholder="What happened and why?">${esc(match.notes||match.voice||'')}</textarea></div>
    <div class="form-actions"><button type="button" class="button" onclick="document.getElementById('modal').close()">Cancel</button><button class="button primary" type="submit">${isEdit?'Save changes':'Save match'}</button></div>
  </form>`);
  $('#match-form').addEventListener('submit',async e=>{
    e.preventDefault(); const data=Object.fromEntries(new FormData(e.currentTarget));
    ['scoreFor','scoreAgainst','duration','resetSuccess','transitionSuccess','dinkRally','pressureWon','pressurePlayed'].forEach(k=>data[k]=Number(data[k]||0));
    data.id=data.id||uid('match'); data.createdAt=match.createdAt||new Date().toISOString();
    const idx=state.matches.findIndex(m=>m.id===data.id); if(idx>=0) state.matches[idx]=data; else state.matches.push(data);
    await saveState({quiet:true}); closeModal(); toast(isEdit?'Match updated':'Match saved locally'); render();
  });
}

function generatePlanForm(){
  const currentMeta=state.planMeta||{};
  modal(`<h2>Build an automatically adaptive roadmap</h2><p>The plan is generated locally, then rewrites current and future weeks after match, session-quality, readiness, or calendar changes. Completed weeks stay locked.</p><form id="plan-form" class="form-grid"><div class="field full"><label>Primary goal</label><select name="goal"><option>Reach the next skill level</option><option>Fix my backhand reset</option><option>Prepare for a tournament</option><option>Improve transition-zone play</option><option>Build a complete all-court game</option></select></div><div class="field"><label>Target weeks</label><select name="weeks"><option>4</option><option>6</option><option>8</option></select></div><div class="field"><label>Sessions per week</label><select name="sessions"><option>2</option><option selected>3</option><option>4</option><option>5</option></select></div><label class="check-row field full"><input type="checkbox" name="autoAdapt" ${state.settings.autoAdaptPlan?'checked':''}> Automatically rewrite current and future weeks when evidence changes</label><div class="field full"><label>Personal note</label><textarea name="note" placeholder="Tournament date, specific weakness, schedule limits...">${esc(currentMeta.note||'')}</textarea></div><div class="form-actions"><button class="button" type="button" onclick="document.getElementById('modal').close()">Cancel</button><button class="button primary">Build living roadmap</button></div></form>`);
  $('#plan-form').addEventListener('submit',async e=>{
    e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget));const meta={goal:d.goal,note:d.note,startDate:todayISO(),weeks:Number(d.weeks),sessionsPerWeek:Number(d.sessions),lastAdaptedAt:new Date().toISOString(),lastSignature:'',unreadAdaptation:false,history:[],undoSnapshot:null};
    state.settings.autoAdaptPlan=e.currentTarget.autoAdapt.checked;state.goals=[{id:uid('goal'),title:d.goal,note:d.note,createdAt:new Date().toISOString()}];state.planMeta=meta;state.plan=createRoadmap(meta);state.planMeta.lastSignature=roadmapSignature();
    await saveState({quiet:true,skipAdapt:true});closeModal();toast('Living roadmap generated locally');render();
  });
}

function viewDrill(id){
  const d=findDrill(id); if(!d) return;
  modal(`<h2>${esc(d.name)}</h2><div class="tag-row"><span class="pill">${esc(d.level)}</span><span class="pill">${d.minutes} minutes</span><span class="pill ${d.solo?'good':''}">${d.solo?'Solo-ready':'Partner drill'}</span></div><p>${esc(d.description)}</p><h3>Session flow</h3><div class="list">${d.steps.map((s,i)=>`<div class="list-item"><div><strong>${i+1}. ${esc(s)}</strong></div></div>`).join('')}</div><div class="form-actions"><button class="button" type="button" onclick="document.getElementById('modal').close()">Close</button><button class="button primary" id="modal-log-drill">Log completed session</button></div>`);
  $('#modal-log-drill').onclick=()=>logDrill(id);
}
function logDrill(id,minutes=null){
  const d=findDrill(id);if(!d)return;
  modal(`<h2>Log ${esc(d.name)}</h2><p>Session quality is what lets the roadmap adapt intelligently instead of only counting minutes.</p><form id="session-form" class="form-grid"><div class="field"><label>Date</label><input name="date" type="date" value="${todayISO()}" required></div><div class="field"><label>Minutes</label><input name="minutes" type="number" min="1" max="240" value="${minutes||d.minutes}" required></div><div class="field"><label>Quality (1–5)</label><select name="quality"><option value="1">1 · Poor</option><option value="2">2 · Inconsistent</option><option value="3" selected>3 · Solid</option><option value="4">4 · Strong</option><option value="5">5 · Excellent</option></select></div><div class="field"><label>Effort / RPE (1–10)</label><input name="exertion" type="number" min="1" max="10" value="6"></div><div class="field"><label>Successful reps %</label><input name="successRate" type="number" min="0" max="100" value="70"></div><div class="field"><label>Pain after (0–10)</label><input name="painAfter" type="number" min="0" max="10" value="0"></div><div class="field full"><label>What transferred or broke down?</label><textarea name="notes" placeholder="The compact cue held until pace increased..."></textarea></div><div class="form-actions"><button class="button" type="button" onclick="document.getElementById('modal').close()">Cancel</button><button class="button primary">Save session and adapt</button></div></form>`);
  $('#session-form').addEventListener('submit',async e=>{e.preventDefault();const x=Object.fromEntries(new FormData(e.currentTarget));['minutes','quality','exertion','successRate','painAfter'].forEach(k=>x[k]=Number(x[k]||0));state.sessions.push({...x,id:uid('session'),createdAt:new Date().toISOString(),drillId:id,name:d.name,skill:d.skill});await saveState({quiet:true});closeModal();toast(`${d.name} logged; roadmap checked`);render();});
}

function soloSession(){
  const focus=focusRecommendation();
  const pool=allDrills().filter(d=>d.solo);
  const first=(findDrill(focus.drill)?.solo?findDrill(focus.drill):(pool.find(d=>d.tags.some(t=>focus.title.toLowerCase().includes(t)))||pool[0]));
  const picks=[first,...pool.filter(d=>d.id!==first.id).sort(()=>Math.random()-.5).slice(0,2)];
  modal(`<h2>Your solo session</h2><p>Built around <strong>${esc(focus.title)}</strong>. Total time: ${picks.reduce((s,d)=>s+d.minutes,0)} minutes.</p><div class="timeline">${picks.map((d,i)=>`<div class="timeline-item"><div class="timeline-line"><span class="timeline-dot"></span></div><div class="timeline-content"><strong>${i+1}. ${esc(d.name)} · ${d.minutes}m</strong><div class="meta">${esc(d.description)}</div></div></div>`).join('')}</div><div class="form-grid" style="margin-top:14px"><div class="field"><label>Overall quality (1–5)</label><select id="solo-quality"><option>1</option><option>2</option><option selected>3</option><option>4</option><option>5</option></select></div><div class="field"><label>Effort / RPE (1–10)</label><input id="solo-rpe" type="number" min="1" max="10" value="6"></div></div><div class="form-actions"><button class="button" type="button" onclick="document.getElementById('modal').close()">Close</button><button class="button primary" id="complete-solo">Complete all</button></div>`);
  $('#complete-solo').onclick=async()=>{ const quality=Number($('#solo-quality').value),exertion=Number($('#solo-rpe').value);picks.forEach(d=>state.sessions.push({id:uid('session'),date:todayISO(),createdAt:new Date().toISOString(),drillId:d.id,name:d.name,minutes:d.minutes,skill:d.skill,quality,exertion,successRate:quality*18,painAfter:0,notes:'Completed as part of an adaptive solo workout.'})); await saveState({quiet:true}); closeModal(); toast('Solo session logged; roadmap checked'); render(); };
}

function experimentForm(){
  const focus=focusRecommendation(),metric=targetMetricForFocus(focus),baseline=metricValue(metric),target=metric==='dinkRally'?Number((baseline+1.5).toFixed(1)):Math.min(95,Math.round(baseline+8));
  modal(`<h2>Start a coach experiment</h2><p>Pick one change, define the metric, and test it across future matches. DinkSense will evaluate the result locally.</p><form id="experiment-form" class="form-grid"><div class="field full"><label>Experiment title</label><input name="title" required value="${esc(focus.title)} transfer test"></div><div class="field full"><label>Hypothesis</label><textarea name="hypothesis" required>If I use the cue “${esc(focus.detail)}”, my ${esc(metricLabel(metric).toLowerCase())} will improve without lowering decision quality.</textarea></div><div class="field"><label>Metric</label><select name="metric">${[['transitionSuccess','Transition success'],['resetSuccess','Reset success'],['pressure','Pressure conversion'],['dinkRally','Dink rally length'],['winRate','Win rate']].map(([v,l])=>`<option value="${v}" ${v===metric?'selected':''}>${l}</option>`).join('')}</select></div><div class="field"><label>Target</label><input name="target" type="number" step="0.1" value="${target}"></div><div class="field"><label>Matches to test</label><select name="matchesNeeded"><option>2</option><option selected>3</option><option>4</option><option>5</option></select></div><div class="field"><label>Current baseline</label><input value="${baseline}" disabled></div><div class="form-actions"><button class="button" type="button" onclick="document.getElementById('modal').close()">Cancel</button><button class="button primary">Start experiment</button></div></form>`);
  $('#experiment-form').addEventListener('submit',async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget));const base=metricValue(d.metric);state.experiments=(state.experiments||[]).map(x=>x.status==='active'?{...x,status:'archived'}:x);state.experiments.push({...d,id:uid('experiment'),createdAt:new Date().toISOString(),baseline:base,current:base,target:Number(d.target),matchesNeeded:Number(d.matchesNeeded),matchesLogged:0,status:'active'});await saveState({quiet:true,skipAdapt:true});closeModal();toast('Coach experiment started');render();});
}
function showAdaptationEvidence(){
  const h=(state.planMeta?.history||[]).slice(-1)[0];if(!h)return;
  modal(`<h2>Why your roadmap changed</h2><p>DinkSense only rewrites the current and future weeks. It used these local signals:</p><div class="list">${h.evidence.map(x=>`<div class="list-item"><strong>${esc(x)}</strong></div>`).join('')}</div><h3 style="margin-top:20px">Changes</h3><div class="list">${h.changes.map(x=>`<div class="list-item"><strong>${esc(x)}</strong></div>`).join('')}</div><div class="callout" style="margin-top:14px"><p>This is a transparent rule-based adaptation, not a hidden model retraining itself. Optional Ollama can explain the same evidence conversationally.</p></div>`);
}
async function undoAdaptation(){
  if(!state.planMeta?.undoSnapshot)return;state.plan=state.planMeta.undoSnapshot;state.planMeta.undoSnapshot=null;state.planMeta.unreadAdaptation=false;state.planMeta.lastSignature=roadmapSignature();await saveState({quiet:true,skipAdapt:true});toast('Last roadmap rewrite undone');render();
}
function courtForm(court={}){
  modal(`<h2>${court.id?'Update court':'Add a court'}</h2><form id="court-form" class="form-grid"><input type="hidden" name="id" value="${esc(court.id||'')}"><div class="field full"><label>Court name</label><input name="name" required value="${esc(court.name||'')}"></div><div class="field full"><label>Address</label><input name="address" value="${esc(court.address||'')}"></div><div class="field"><label>Number of courts</label><input name="courts" type="number" min="1" value="${esc(court.courts||4)}"></div><div class="field"><label>Surface</label><select name="surface"><option>Acrylic hard court</option><option ${court.surface==='Concrete'?'selected':''}>Concrete</option><option ${court.surface==='Indoor wood'?'selected':''}>Indoor wood</option><option ${court.surface==='Sport court'?'selected':''}>Sport court</option></select></div><div class="field"><label>Crowd now</label><select name="crowd"><option>Open</option><option ${court.crowd==='Moderate'?'selected':''}>Moderate</option><option ${court.crowd==='Busy'?'selected':''}>Busy</option><option ${court.crowd==='Unknown'?'selected':''}>Unknown</option></select></div><div class="field"><label>Orientation</label><select name="orientation"><option>North–south</option><option ${court.orientation==='East–west'?'selected':''}>East–west</option><option ${court.orientation==='Unknown'?'selected':''}>Unknown</option></select></div><label class="check-row"><input type="checkbox" name="lights" ${court.lights?'checked':''}> Lights available</label><label class="check-row"><input type="checkbox" name="indoor" ${court.indoor?'checked':''}> Indoor</label><div class="field"><label>Latitude (optional)</label><input name="lat" type="number" step="any" value="${esc(court.lat||'')}"></div><div class="field"><label>Longitude (optional)</label><input name="lon" type="number" step="any" value="${esc(court.lon||'')}"></div><div class="form-actions"><button class="button" type="button" onclick="document.getElementById('modal').close()">Cancel</button><button class="button primary">Save court</button></div></form>`);
  $('#court-form').addEventListener('submit',async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget));d.id=d.id||uid('court');d.courts=Number(d.courts);d.lights=e.currentTarget.lights.checked;d.indoor=e.currentTarget.indoor.checked;d.lat=d.lat?Number(d.lat):null;d.lon=d.lon?Number(d.lon):null;const i=state.courts.findIndex(x=>x.id===d.id);if(i>=0)state.courts[i]=d;else state.courts.push(d);await saveState({quiet:true});closeModal();toast('Court saved locally');render();});
}
function useLocation(){
  if(!navigator.geolocation){toast('Geolocation is not available in this browser');return;}
  toast('Requesting your location…');
  navigator.geolocation.getCurrentPosition(pos=>{courtForm({lat:pos.coords.latitude.toFixed(6),lon:pos.coords.longitude.toFixed(6),crowd:'Unknown',surface:'Acrylic hard court'});},err=>toast(`Location unavailable: ${err.message}`),{enableHighAccuracy:true,timeout:10000});
}
async function showWeather(){
  if(!navigator.onLine){toast('Weather needs an internet connection');return;}
  if(!navigator.geolocation){toast('Location is unavailable');return;}
  navigator.geolocation.getCurrentPosition(async pos=>{
    const card=$('#weather-card'); if(card) card.innerHTML='<p>Loading current conditions…</p>';
    try{
      const {latitude,longitude}=pos.coords;
      const unit=state.settings.units==='imperial'?'fahrenheit':'celsius';
      const windUnit=state.settings.units==='imperial'?'mph':'kmh';
      const url=`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,wind_speed_10m,wind_direction_10m,weather_code&temperature_unit=${unit}&wind_speed_unit=${windUnit}`;
      const r=await fetch(url); if(!r.ok) throw new Error('Weather service unavailable');
      const data=await r.json(); const c=data.current; const tempUnit=unit==='fahrenheit'?'°F':'°C';
      const warning=Number(c.temperature_2m)>=90?'Surface heat may be high. Shorten sessions and plan extra hydration.':Number(c.wind_speed_10m)>=15?'Wind will materially affect lobs, drops, and serve placement.':'Conditions look playable; still adjust for sun and court orientation.';
      if(card) card.innerHTML=`<div class="weather-box"><div><div class="eyebrow">LIVE OUTDOOR ADVISORY</div><h2>${Math.round(c.temperature_2m)}${tempUnit}</h2><p>Feels ${Math.round(c.apparent_temperature)}${tempUnit} · Wind ${Math.round(c.wind_speed_10m)} ${windUnit} from ${Math.round(c.wind_direction_10m)}°</p></div><div class="weather-temp">${Number(c.weather_code)<3?'☀':'◌'}</div></div><div class="callout"><p>${esc(warning)}</p></div>`;
    }catch(err){toast(err.message);render();}
  },err=>toast(`Location unavailable: ${err.message}`));
}
function healthForm(){
  modal(`<h2>Daily recovery check-in</h2><form id="health-form" class="form-grid"><div class="field"><label>Date</label><input name="date" type="date" value="${todayISO()}" required></div><div class="field"><label>Soreness (0–10)</label><input name="soreness" type="number" min="0" max="10" value="2" required></div><div class="field"><label>Sleep hours</label><input name="sleep" type="number" min="0" max="16" step="0.1" value="8" required></div><div class="field"><label>Hydration (1–5)</label><input name="hydration" type="number" min="1" max="5" value="4" required></div><div class="field"><label>Main area</label><select name="area"><option>General</option><option>Elbow/forearm</option><option>Shoulder</option><option>Knee</option><option>Calf/ankle</option><option>Low back</option></select></div><div class="field"><label>Energy (1–5)</label><input name="energy" type="number" min="1" max="5" value="4"></div><div class="field full"><label>Notes</label><textarea name="notes" placeholder="Anything unusual, sharp, or persistent should be handled by a qualified professional."></textarea></div><div class="form-actions"><button class="button" type="button" onclick="document.getElementById('modal').close()">Cancel</button><button class="button primary">Save check-in</button></div></form>`);
  $('#health-form').addEventListener('submit',async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget));d.id=uid('health');['soreness','sleep','hydration','energy'].forEach(k=>d[k]=Number(d[k]));const i=state.health.findIndex(x=>x.date===d.date);if(i>=0)state.health[i]=d;else state.health.push(d);await saveState({quiet:true});closeModal();toast('Recovery log saved');render();});
}
function gearForm(){
  modal(`<h2>Add gear</h2><form id="gear-form" class="form-grid"><div class="field"><label>Type</label><select name="type"><option>Paddle</option><option>Shoes</option><option>Grip</option><option>Bag</option></select></div><div class="field"><label>Name</label><input name="name" required placeholder="Brand and model"></div><div class="field"><label>Purchase date</label><input name="purchaseDate" type="date" value="${todayISO()}"></div><div class="field"><label>Sessions already used</label><input name="sessions" type="number" min="0" value="0"></div><div class="field full"><label>Notes</label><textarea name="notes"></textarea></div><div class="form-actions"><button class="button" type="button" onclick="document.getElementById('modal').close()">Cancel</button><button class="button primary">Add gear</button></div></form>`);
  $('#gear-form').addEventListener('submit',async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget));d.id=uid('gear');d.sessions=Number(d.sessions);state.gear.push(d);await saveState({quiet:true});closeModal();toast('Gear added');render();});
}
function paddleQuiz(){
  modal(`<h2>Paddle finder quiz</h2><form id="paddle-form" class="form-grid"><div class="field"><label>Play style</label><select name="style"><option value="all-court">All-court</option><option value="patient">Patient dinker</option><option value="aggressive">Aggressive net-rusher</option><option value="power">Power baseliner</option><option value="beginner">Developing player</option></select></div><div class="field"><label>Priority</label><select name="priority"><option value="control">Control</option><option value="power">Power</option><option value="spin">Spin</option><option value="balanced">Balanced</option></select></div><div class="field"><label>Grip size</label><select name="grip"><option>4</option><option>4.125</option><option>4.25</option></select></div><div class="field"><label>Maximum budget</label><input name="budget" type="number" min="50" max="500" value="170"></div><div class="field"><label>Preferred weight</label><select name="weight"><option value="light">Light under 7.9 oz</option><option value="mid" selected>Mid 7.9–8.2 oz</option><option value="heavy">Stable 8.3+ oz</option></select></div><div class="field"><label>Shape</label><select name="shape"><option value="any">No preference</option><option>Standard</option><option>Hybrid</option><option>Elongated</option><option>Widebody</option></select></div><div class="form-actions"><button class="button" type="button" onclick="document.getElementById('modal').close()">Cancel</button><button class="button primary">Get recommendations</button></div></form>`);
  $('#paddle-form').addEventListener('submit',e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget));const scored=PADDLES.filter(p=>p.price<=Number(d.budget)).map(p=>{let s=0;if(p.style.includes(d.style))s+=20;if(d.priority==='control')s+=p.control*3;if(d.priority==='power')s+=p.power*3;if(d.priority==='spin')s+=p.spin*3;if(d.priority==='balanced')s+=(p.power+p.control+p.spin);s-=Math.abs(p.grip-Number(d.grip))*15;if(d.shape!=='any'&&p.shape===d.shape)s+=10;if(d.weight==='light'&&p.weight<7.9)s+=8;if(d.weight==='mid'&&p.weight>=7.9&&p.weight<=8.2)s+=8;if(d.weight==='heavy'&&p.weight>=8.3)s+=8;const weakness=analytics().weakness.toLowerCase();if((weakness.includes('reset')||weakness.includes('dink'))&&p.control>=8)s+=8;if((weakness.includes('serve')||weakness.includes('overhead'))&&p.power>=8)s+=8;return {...p,score:s};}).sort((a,b)=>b.score-a.score).slice(0,3);$('#modal-body').innerHTML=`<h2>Your top matches</h2><p>Ranked from your answers plus the weakness patterns in your local match data.</p><div class="grid">${scored.map((p,i)=>`<div class="card ${i===0?'accent':''}"><div class="split"><div><span class="pill">#${i+1} match</span><h3 style="margin-top:8px">${esc(p.name)}</h3><div class="meta">${esc(p.shape)} · ${p.thickness}mm · ${p.weight} oz · $${p.price}</div></div><strong>${p.score}</strong></div><p>${esc(p.note)}</p><div class="tag-row"><span class="pill">Power ${p.power}</span><span class="pill">Control ${p.control}</span><span class="pill">Spin ${p.spin}</span></div></div>`).join('')}</div><div class="callout" style="margin-top:14px"><p>Catalog names are demonstrator products, not paid endorsements. Replace them with licensed retailer inventory before monetizing.</p></div>`;});
}
function tournamentForm(){
  modal(`<h2>Add an external tournament</h2><form id="tournament-form" class="form-grid"><div class="field full"><label>Tournament name</label><input name="name" required></div><div class="field"><label>Date</label><input name="date" type="date" required></div><div class="field"><label>Bracket</label><input name="bracket" value="3.5 singles"></div><div class="field full"><label>Location</label><input name="location"></div><div class="field full"><label>Official registration URL</label><input name="url" type="url" placeholder="https://official-organizer-site.com/..."></div><div class="field"><label>Status</label><select name="status"><option>Considering</option><option>Registered</option><option>Completed</option></select></div><div class="form-actions"><button class="button" type="button" onclick="document.getElementById('modal').close()">Cancel</button><button class="button primary">Save tournament</button></div></form>`);
  $('#tournament-form').addEventListener('submit',async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget));d.id=uid('tourney');state.tournaments.push(d);await saveState({quiet:true});closeModal();toast('Tournament saved');render();});
}
function sponsorPitch(){
  const a=analytics(),p=state.profile;
  const pitch=`Subject: Partnership opportunity with ${p.name}\n\nHello [Brand/Business Name],\n\nMy name is ${p.name}, a ${Number(p.skill).toFixed(1)}-level ${p.style.toLowerCase()} pickleball player based in ${[p.city,p.state].filter(Boolean).join(', ')||'[location]'}. I am reaching out because I believe my development as a player and my approach to documenting improvement could align well with your brand.\n\nThrough DinkSense, I have logged ${a.matches.length} matches, with a ${a.winRate}% win rate, ${a.transition}% transition-zone success, and ${a.pressure}% conversion on tagged pressure points. My current goal is ${p.goals||'to continue improving and competing at a higher level'}. ${p.bio?`My story: ${p.bio}`:''}\n\nI would be excited to discuss a partnership involving [gear testing / local promotion / event content / junior-player outreach]. In return, I can offer consistent, honest product representation and progress-based content rather than one-time promotion.\n\nI can share my DinkSense athlete portfolio, recent competition history, and video clips upon request.\n\nThank you for your time,\n${p.name}\n${p.publicEmail||'[email]'}\n`;
  modal(`<h2>AI sponsorship pitch</h2><p>Generated locally from your profile and tracked results. Edit every claim before sending.</p><div class="field"><textarea id="pitch-text" style="min-height:420px">${esc(pitch)}</textarea></div><div class="form-actions"><button class="button" type="button" onclick="document.getElementById('modal').close()">Close</button><button class="button primary" id="copy-pitch">Copy pitch</button></div>`);
  $('#copy-pitch').onclick=async()=>{await navigator.clipboard.writeText($('#pitch-text').value);toast('Pitch copied');};
}
function wrapped(){
  const a=analytics(); const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1350;const ctx=canvas.getContext('2d');
  const grad=ctx.createLinearGradient(0,0,1080,1350);grad.addColorStop(0,'#10140f');grad.addColorStop(1,'#244334');ctx.fillStyle=grad;ctx.fillRect(0,0,1080,1350);
  ctx.fillStyle='#dfff38';ctx.beginPath();ctx.arc(930,120,260,0,Math.PI*2);ctx.fill();ctx.fillStyle='#6be2bd';ctx.beginPath();ctx.arc(110,1280,230,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#fff';ctx.font='800 44px system-ui';ctx.fillText('DINKSENSE',70,90);ctx.font='900 96px system-ui';ctx.fillText(`${new Date().toLocaleString(undefined,{month:'long'}).toUpperCase()}`,70,250);ctx.fillText('WRAPPED',70,355);
  ctx.font='900 170px system-ui';ctx.fillStyle='#dfff38';ctx.fillText(String(a.matches.length),70,610);ctx.font='700 38px system-ui';ctx.fillStyle='#fff';ctx.fillText('MATCHES LOGGED',75,665);
  const stats=[['WIN RATE',`${a.winRate}%`],['COURT + TRAINING',`${a.hours} HRS`],['TRANSITION SUCCESS',`${a.transition}%`],['TOP FOCUS',a.weakness.toUpperCase().slice(0,24)]];
  stats.forEach((s,i)=>{const y=790+i*115;ctx.font='700 28px system-ui';ctx.fillStyle='rgba(255,255,255,.64)';ctx.fillText(s[0],75,y);ctx.font='900 48px system-ui';ctx.fillStyle='#fff';ctx.fillText(s[1],410,y);});
  ctx.font='600 26px system-ui';ctx.fillStyle='rgba(255,255,255,.7)';ctx.fillText(`Built locally for ${state.profile.name}`,70,1280);
  canvas.toBlob(blob=>downloadBlob(blob,`dinksense-wrapped-${todayISO()}.png`),'image/png');toast('Wrapped share card created');
}
function profileForm(){
  const p=state.profile;
  modal(`<h2>Edit athlete profile</h2><form id="profile-form" class="form-grid"><div class="field full"><label>Name</label><input name="name" value="${esc(p.name)}" required></div><div class="field"><label>City</label><input name="city" value="${esc(p.city)}"></div><div class="field"><label>State</label><input name="state" value="${esc(p.state)}"></div><div class="field"><label>Skill profile</label><input name="skill" type="number" min="1" max="6" step="0.1" value="${esc(p.skill)}"></div><div class="field"><label>DUPR (self-entered)</label><input name="dupr" type="number" min="1" max="8" step="0.001" value="${esc(p.dupr)}"></div><div class="field"><label>Handedness</label><select name="handedness"><option ${p.handedness==='Right'?'selected':''}>Right</option><option ${p.handedness==='Left'?'selected':''}>Left</option></select></div><div class="field"><label>Style</label><select name="style"><option ${p.style==='All-court'?'selected':''}>All-court</option><option ${p.style==='Patient dinker'?'selected':''}>Patient dinker</option><option ${p.style==='Aggressive net-rusher'?'selected':''}>Aggressive net-rusher</option><option ${p.style==='Power baseliner'?'selected':''}>Power baseliner</option></select></div><div class="field full"><label>Primary goal</label><input name="goals" value="${esc(p.goals)}"></div><div class="field full"><label>Player story</label><textarea name="bio">${esc(p.bio)}</textarea></div><div class="field full"><label>Public contact email (optional)</label><input name="publicEmail" type="email" value="${esc(p.publicEmail)}"></div><div class="field full"><label>Profile photo</label><input id="profile-photo-input" type="file" accept="image/*"></div><div class="form-actions"><button class="button" type="button" onclick="document.getElementById('modal').close()">Cancel</button><button class="button primary">Save profile</button></div></form>`);
  $('#profile-form').addEventListener('submit',async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget));delete d.avatar;d.skill=Number(d.skill);const file=$('#profile-photo-input').files[0];if(file)d.avatar=await fileToDataUrl(file,2_000_000);else d.avatar=p.avatar;state.profile={...p,...d};await saveState({quiet:true});closeModal();toast('Profile updated');render();});
}
async function fileToDataUrl(file,maxBytes){
  if(file.size<=maxBytes) return await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=()=>rej(r.error);r.readAsDataURL(file);});
  const bitmap=await createImageBitmap(file);const scale=Math.sqrt(maxBytes/file.size);const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);return canvas.toDataURL('image/jpeg',.82);
}
function exportProfile(){
  const a=analytics(),p=state.profile;
  const html=`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(p.name)} — Pickleball Portfolio</title><style>body{margin:0;background:#f5f7f1;color:#10140f;font-family:system-ui,-apple-system,sans-serif}.wrap{max-width:920px;margin:auto;padding:48px 20px}.hero{background:#10140f;color:white;border-radius:28px;padding:42px;display:grid;grid-template-columns:auto 1fr;gap:24px;align-items:center}.avatar{width:130px;height:130px;border-radius:28px;object-fit:cover;background:#dfff38;display:grid;place-items:center;color:#10140f;font-weight:900;font-size:36px}.card{background:white;border:1px solid #dfe5d8;border-radius:20px;padding:22px;margin-top:18px}.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.stat{background:#eef2e9;border-radius:16px;padding:16px}.stat b{display:block;font-size:28px}.pill{display:inline-block;background:#dfff38;padding:6px 10px;border-radius:99px;font-weight:800;font-size:12px;margin:4px}.muted{color:#667063}@media(max-width:700px){.hero{grid-template-columns:1fr}.stats{grid-template-columns:repeat(2,1fr)}}</style></head><body><main class="wrap"><section class="hero">${p.avatar?`<img class="avatar" src="${p.avatar}" alt="${esc(p.name)}">`:`<div class="avatar">${esc(initials(p.name))}</div>`}<div><div style="letter-spacing:.15em;font-weight:900;color:#dfff38;font-size:12px">DINKSENSE ATHLETE PORTFOLIO</div><h1 style="font-size:48px;margin:8px 0">${esc(p.name)}</h1><p>${esc([p.city,p.state].filter(Boolean).join(', ')||'Location private')} · ${esc(p.handedness)}-handed · ${esc(p.style)} · ${Number(p.skill).toFixed(1)} profile</p></div></section><section class="card"><h2>Player story</h2><p class="muted">${esc(p.bio||'Athlete profile in progress.')}</p><p><b>Current goal:</b> ${esc(p.goals)}</p></section><section class="stats"><div class="stat"><b>${a.matches.length}</b><span>Matches</span></div><div class="stat"><b>${a.winRate}%</b><span>Win rate</span></div><div class="stat"><b>${a.transition}%</b><span>Transition</span></div><div class="stat"><b>${a.pressure}%</b><span>Pressure</span></div></section><section class="card"><h2>Achievements</h2>${state.badges.length?state.badges.map(b=>`<span class="pill">${esc(b)}</span>`).join(''):'<p class="muted">More tracked achievements coming soon.</p>'}</section><section class="card"><h2>Recent results</h2>${a.recent.length?a.recent.map(m=>`<p><b>${m.result} ${m.scoreFor}-${m.scoreAgainst}</b> vs. ${esc(m.opponent||'Opponent')} · ${fmtDate(m.date)}</p>`).join(''):'<p class="muted">No public results included.</p>'}<p class="muted" style="font-size:12px">Generated locally by DinkSense. Statistics are based on player-entered logs; DUPR is ${p.dupr?`self-entered as ${esc(p.dupr)}`:'not included'}.</p></section></main></body></html>`;
  downloadBlob(new Blob([html],{type:'text/html'}),`${slug(p.name)}-dinksense-portfolio.html`);toast('Standalone profile exported');
}
function slug(s){return String(s||'player').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');}
function exportData(){
  const backup={app:'DinkSense',version:APP_VERSION,exportedAt:new Date().toISOString(),state};
  downloadBlob(new Blob([JSON.stringify(backup,null,2)],{type:'application/json'}),`dinksense-backup-${todayISO()}.json`);toast('Backup exported');
}
function downloadBlob(blob,name){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);}
async function importData(file){
  try{const parsed=JSON.parse(await file.text());const incoming=parsed.state||parsed;if(!incoming.profile||!Array.isArray(incoming.matches))throw new Error('Not a valid DinkSense backup');state=mergeState(incoming);await saveState({quiet:true});toast('Backup imported');render();}catch(err){toast(err.message);}
}
function ollamaSettings(){
  const s=state.settings;
  modal(`<h2>Configure local Ollama AI</h2><p>Install and run Ollama separately on this computer, pull a chat model, then enable it here. No API key is stored.</p><form id="ollama-form" class="form-grid"><label class="check-row field full"><input type="checkbox" name="enabled" ${s.ollamaEnabled?'checked':''}> Enable Ollama for coach responses</label><div class="field full"><label>Ollama URL</label><input name="url" value="${esc(s.ollamaUrl)}"></div><div class="field full"><label>Model</label><input name="model" value="${esc(s.ollamaModel)}" placeholder="llama3.2"></div><div class="form-actions"><button class="button" type="button" onclick="document.getElementById('modal').close()">Cancel</button><button class="button primary">Save</button></div></form><div class="codebox">ollama pull llama3.2\nollama serve</div>`);
  $('#ollama-form').addEventListener('submit',async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget));state.settings.ollamaEnabled=e.currentTarget.enabled.checked;state.settings.ollamaUrl=d.url.trim();state.settings.ollamaModel=d.model.trim();await saveState({quiet:true});closeModal();toast('Local AI settings saved');render();});
}
function voiceLog(){
  const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SpeechRecognition){
    modal(`<h2>Voice quick capture</h2><p>This browser does not expose on-device speech recognition. Type or paste your recap below and DinkSense will parse basic match details locally.</p><div class="field"><textarea id="manual-voice" placeholder="I won 11 to 8 against Alex. My backhand reset was the main issue..."></textarea></div><div class="form-actions"><button class="button" type="button" onclick="document.getElementById('modal').close()">Cancel</button><button class="button primary" id="parse-manual">Parse recap</button></div>`);
    $('#parse-manual').onclick=()=>{const text=$('#manual-voice').value;closeModal();matchForm(parseVoice(text));};return;
  }
  modal(`<h2>Voice quick capture</h2><p>Speak naturally: “I won 11–8 against Alex. Backhand resets were the main problem.” Browser speech services may require an internet connection depending on your device.</p><div class="card dark" style="text-align:center"><div style="font-size:3rem">◉</div><h3 id="voice-status">Ready to listen</h3><p id="voice-text">Your transcript will appear here.</p></div><div class="form-actions"><button class="button" type="button" onclick="document.getElementById('modal').close()">Cancel</button><button class="button primary" id="voice-start">Start listening</button></div>`);
  const rec=new SpeechRecognition();rec.lang='en-US';rec.interimResults=true;let finalText='';
  rec.onstart=()=>{$('#voice-status').textContent='Listening…';$('#voice-start').disabled=true;};
  rec.onresult=e=>{let interim='';for(let i=e.resultIndex;i<e.results.length;i++){if(e.results[i].isFinal)finalText+=e.results[i][0].transcript+' ';else interim+=e.results[i][0].transcript;}$('#voice-text').textContent=finalText+interim;};
  rec.onerror=e=>toast(`Voice capture: ${e.error}`);
  rec.onend=()=>{if(finalText.trim()){closeModal();matchForm(parseVoice(finalText));}else{$('#voice-status').textContent='No speech captured';$('#voice-start').disabled=false;}};
  $('#voice-start').onclick=()=>rec.start();
}
function parseVoice(text){
  const lower=text.toLowerCase();const score=text.match(/(\d+)\s*(?:to|-|–)\s*(\d+)/i);const opponent=text.match(/against\s+([a-z][a-z .'-]{1,30}?)(?:\.|,|\s+(?:and|my|at|with)|$)/i);
  const result=lower.includes('lost')||lower.includes('loss')?'L':'W';
  let dominantError='None';const mapping=[['backhand reset','Backhand reset'],['forehand reset','Forehand reset'],['third shot drop','Third-shot drop'],['third-shot drop','Third-shot drop'],['serve','Serve depth'],['return','Return depth'],['overhead','Overhead'],['transition','Transition footwork'],['dink','Unforced dink error']];for(const [k,v] of mapping){if(lower.includes(k)){dominantError=v;break;}}
  const a=score?Number(score[1]):11,b=score?Number(score[2]):7;
  return {date:todayISO(),type:lower.includes('double')?'Doubles':'Singles',result,scoreFor:result==='W'?Math.max(a,b):Math.min(a,b),scoreAgainst:result==='W'?Math.min(a,b):Math.max(a,b),opponent:opponent?.[1]?.trim()||'',dominantError,notes:text,voice:text,resetSuccess:60,transitionSuccess:60,dinkRally:5,duration:25,pressureWon:0,pressurePlayed:0};
}

async function handleVideoUpload(file){
  if(!file)return;if(!file.type.startsWith('video/')){toast('Choose a video file');return;}if(file.size>500*1024*1024){toast('For browser reliability, keep local videos under 500 MB');return;}
  const id=uid('video');
  try{await idbSet('videos',id,file);state.videos.push({id,name:file.name,date:todayISO(),size:file.size,type:file.type,duration:0,tags:[]});await saveState({quiet:true});toast('Video stored locally');render();}catch(err){toast('Could not store video. Browser storage may be full.');console.error(err);}
}
async function openVideo(id,seekTime=0){
  const meta=state.videos.find(v=>v.id===id);const blob=await idbGet('videos',id);if(!meta||!blob){toast('Local video file is missing');return;}
  if(activeVideoUrl)URL.revokeObjectURL(activeVideoUrl);activeVideoUrl=URL.createObjectURL(blob);
  modal(`<h2>${esc(meta.name)}</h2><div class="media-card"><video id="local-video" src="${activeVideoUrl}" controls playsinline></video></div><div class="grid two" style="margin-top:14px"><div class="field"><label>Moment type</label><select id="video-tag-type"><option>Backhand reset error</option><option>Forehand reset error</option><option>Third-shot drop</option><option>Third-shot drive</option><option>Dink attack</option><option>Overhead</option><option>Highlight</option><option>Injury-risk observation</option></select></div><div class="field"><label>Note</label><input id="video-tag-note" placeholder="What should change?"></div></div><button class="button primary" id="tag-current" style="margin-top:12px">Tag current timestamp</button><h3>Tagged moments</h3><div id="video-tags" class="list"></div>`);
  const video=$('#local-video');const renderTags=()=>{$('#video-tags').innerHTML=meta.tags?.length?meta.tags.sort((a,b)=>a.time-b.time).map(t=>`<div class="list-item"><div><strong>${formatTime(t.time)} · ${esc(t.type)}</strong><div class="meta">${esc(t.note||'No note')}</div></div><button class="button small" data-jump-time="${t.time}">Play</button></div>`).join(''):empty('◌','No moments tagged','Pause on a useful moment and tag the current timestamp.');$$('[data-jump-time]').forEach(b=>b.onclick=()=>{video.currentTime=Number(b.dataset.jumpTime);video.play();});};
  video.onloadedmetadata=async()=>{meta.duration=video.duration;if(Number(seekTime)>0)video.currentTime=Math.min(Number(seekTime),Math.max(0,video.duration-.1));await saveState({quiet:true});};
  $('#tag-current').onclick=async()=>{meta.tags??=[];meta.tags.push({id:uid('tag'),time:video.currentTime,type:$('#video-tag-type').value,note:$('#video-tag-note').value});await saveState({quiet:true});$('#video-tag-note').value='';renderTags();toast('Moment tagged');};renderTags();
}
function formatTime(s){const m=Math.floor(s/60),sec=Math.floor(s%60);return `${m}:${String(sec).padStart(2,'0')}`;}
async function deleteVideo(id){if(!confirm('Delete this locally stored video and its tags?'))return;state.videos=state.videos.filter(v=>v.id!==id);await idbDelete('videos',id);await saveState({quiet:true});toast('Video deleted');render();}


function liveMatchLab(){
  const live={id:uid('live'),date:todayISO(),opponent:'Opponent',type:'Singles',target:11,playerScore:0,opponentScore:0,points:[],startedAt:Date.now()};
  modal(`<h2>Live Win Probability</h2><p>Track the score point by point. The model combines score state, recent point momentum, and your historical results. It is a personal estimate—not an official betting or rating tool.</p><form id="live-setup" class="form-grid"><div class="field"><label>Opponent</label><input name="opponent" value="Opponent"></div><div class="field"><label>Format</label><select name="type"><option>Singles</option><option>Doubles</option></select></div><div class="field"><label>Target score</label><select name="target"><option>11</option><option>15</option><option>21</option></select></div><div class="field"><label>Date</label><input name="date" type="date" value="${todayISO()}"></div><div class="form-actions"><button class="button" type="button" onclick="document.getElementById('modal').close()">Cancel</button><button class="button primary" type="submit">Start live match</button></div></form>`);
  $('#live-setup').addEventListener('submit',e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget));Object.assign(live,d,{target:Number(d.target)});renderLiveMatch(live);});
}
function liveWinner(live){
  if(live.playerScore>=live.target&&live.playerScore-live.opponentScore>=2)return 'P';
  if(live.opponentScore>=live.target&&live.opponentScore-live.playerScore>=2)return 'O';
  return null;
}
function renderLiveMatch(live){
  const momentum=live.points.map(p=>p.winner);const probability=pointWinProbability(live.playerScore,live.opponentScore,live.target,momentum);const winner=liveWinner(live);
  const recent=live.points.slice(-12);
  $('#modal-body').innerHTML=`<div class="split"><div><div class="eyebrow">LIVE MATCH LAB</div><h2>${esc(state.profile.name)} vs. ${esc(live.opponent)}</h2><p>${esc(live.type)} · first to ${live.target}, win by 2</p></div><span class="pill ${winner?'good':'warn'}">${winner?`${winner==='P'?'You':'Opponent'} won`:'Live'}</span></div>
  <div class="live-scoreboard"><div><span>You</span><strong>${live.playerScore}</strong></div><div class="probability-orb" style="--prob:${probability}"><strong>${probability}%</strong><span>win probability</span></div><div><span>${esc(live.opponent)}</span><strong>${live.opponentScore}</strong></div></div>
  <div class="probability-track"><span style="width:${probability}%"></span></div>
  <div class="point-ribbon">${recent.length?recent.map((p,i)=>`<span class="point-dot ${p.winner==='P'?'won':'lost'}" title="${p.winner==='P'?'You':'Opponent'} won point ${live.points.length-recent.length+i+1}">${p.winner==='P'?'Y':'O'}</span>`).join(''):'<span class="meta">Point history will appear here.</span>'}</div>
  <div class="grid two" style="margin-top:18px"><button class="button primary live-point" id="point-player" ${winner?'disabled':''}>+ You won point</button><button class="button dark live-point" id="point-opponent" ${winner?'disabled':''}>+ Opponent won point</button></div>
  <div class="callout" style="margin-top:14px"><p>${winner?`Match complete. Save it to your tracking layer so analytics, rivalries, and coaching update automatically.`:`Current read: ${probability>=60?'You have the edge—protect first-ball quality and avoid low-margin attacks.':probability<=40?'Create one high-margin pattern; do not chase the entire deficit at once.':'The match is balanced. The next two decisions matter more than the last point.'}`}</p></div>
  <div class="form-actions"><button class="button" id="undo-live" ${live.points.length?'':'disabled'}>Undo point</button><button class="button" type="button" onclick="document.getElementById('modal').close()">Close</button>${winner?'<button class="button primary" id="save-live">Save completed match</button>':''}</div>`;
  const addPoint=(who)=>{live.points.push({winner:who,at:new Date().toISOString(),before:[live.playerScore,live.opponentScore],probability});if(who==='P')live.playerScore++;else live.opponentScore++;renderLiveMatch(live);};
  const pp=$('#point-player'),po=$('#point-opponent');if(pp)pp.onclick=()=>addPoint('P');if(po)po.onclick=()=>addPoint('O');
  $('#undo-live').onclick=()=>{const last=live.points.pop();if(!last)return;live.playerScore=last.before[0];live.opponentScore=last.before[1];renderLiveMatch(live);};
  if($('#save-live'))$('#save-live').onclick=async()=>{
    const pressure=live.points.filter(p=>p.before[0]>=live.target-2&&p.before[1]>=live.target-2);
    const duration=Math.max(1,Math.round((Date.now()-live.startedAt)/60000));
    state.matches.push({id:uid('match'),date:live.date,type:live.type,result:winner==='P'?'W':'L',opponent:live.opponent,scoreFor:live.playerScore,scoreAgainst:live.opponentScore,duration,dominantError:'None',pressurePlayed:pressure.length,pressureWon:pressure.filter(p=>p.winner==='P').length,notes:`Logged live with ${live.points.length} point events. Final model probability ${probability}%.`,createdAt:new Date().toISOString()});
    state.liveHistory.push({...live,finishedAt:new Date().toISOString(),finalProbability:probability});state.liveHistory=state.liveHistory.slice(-50);
    await saveState({quiet:true});closeModal();toast('Live match saved to your profile');render();
  };
}

function customDrillForm(){
  modal(`<h2>Create a drill</h2><p>Build a reusable drill that becomes part of roadmaps, solo sessions, and your shareable training library.</p><form id="custom-drill-form" class="form-grid"><div class="field full"><label>Drill name</label><input name="name" required placeholder="Cross-court reset pressure ladder"></div><div class="field"><label>Skill built</label><input name="skill" required placeholder="Backhand reset"></div><div class="field"><label>Level</label><select name="level"><option>All</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></div><div class="field"><label>Minutes</label><input name="minutes" type="number" min="1" max="180" value="15"></div><label class="check-row field"><input name="solo" type="checkbox"> Solo-ready</label><div class="field full"><label>Description</label><textarea name="description" required placeholder="What the drill develops and how success is measured."></textarea></div><div class="field full"><label>Steps (one per line)</label><textarea name="steps" required placeholder="20 cooperative reps&#10;10 pressure reps&#10;Finish with first-to-7"></textarea></div><div class="field full"><label>Tags (comma separated)</label><input name="tags" value="custom, decision"></div><div class="form-actions"><button class="button" type="button" onclick="document.getElementById('modal').close()">Cancel</button><button class="button primary" type="submit">Save drill locally</button></div></form>`);
  $('#custom-drill-form').addEventListener('submit',async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget));state.customDrills.push({id:uid('custom-drill'),name:d.name.trim(),skill:d.skill.trim(),level:d.level,minutes:Number(d.minutes),solo:e.currentTarget.solo.checked,tags:d.tags.split(',').map(x=>x.trim()).filter(Boolean),description:d.description.trim(),steps:d.steps.split(/\n+/).map(x=>x.trim()).filter(Boolean),custom:true,createdAt:new Date().toISOString()});await saveState({quiet:true});closeModal();toast('Custom drill added');render();});
}

function exportDrill(id){
  const d=(state.customDrills||[]).find(x=>x.id===id);if(!d)return;
  const payload={app:'DinkSense Drill',version:1,exportedAt:new Date().toISOString(),drill:{...d,id:undefined}};
  downloadBlob(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),`${slug(d.name)}.dinksense-drill.json`);toast('Drill share file created');
}
async function importDrill(file){
  if(!file)return;
  try{const parsed=JSON.parse(await file.text());const d=parsed.drill||parsed;if(!d.name||!d.description||!Array.isArray(d.steps))throw new Error('Not a valid DinkSense drill file');state.customDrills.push({...d,id:uid('custom-drill'),minutes:Number(d.minutes||15),tags:Array.isArray(d.tags)?d.tags:['imported'],custom:true,importedAt:new Date().toISOString()});await saveState({quiet:true});toast('Shared drill imported');render();}catch(err){toast(err.message);}
}

function showPlaybook(id){
  const p=STYLE_PLAYBOOKS.find(x=>x.id===id);if(!p)return;
  modal(`<div style="font-size:3rem">${p.icon}</div><h2>${esc(p.name)} Playbook</h2><p>${esc(p.summary)}</p><h3>Decision rules</h3><div class="list">${p.principles.map((x,i)=>`<div class="list-item"><strong>${i+1}. ${esc(x)}</strong></div>`).join('')}</div><h3>Core drill sequence</h3><div class="tag-row">${p.drills.map(id=>`<button class="button small" data-modal-drill="${id}">${esc(findDrill(id)?.name||id)}</button>`).join('')}</div><div class="form-actions"><button class="button" type="button" onclick="document.getElementById('modal').close()">Close</button><button class="button primary" id="adopt-playbook">Use this style focus</button></div>`);
  $$('[data-modal-drill]').forEach(b=>b.onclick=()=>viewDrill(b.dataset.modalDrill));
  $('#adopt-playbook').onclick=async()=>{state.profile.style=p.name;state.profile.goals=`Develop the ${p.name.toLowerCase()} playbook while preserving an all-court foundation`;await saveState({quiet:true});closeModal();toast('Style playbook adopted');render();};
}
function strengthPlan(){
  const a=analytics(),h=healthScore();
  const catalog={
    transition:[['Lateral lunge to balance','3 × 8/side'],['Split-step pogo + stick','4 × 20 sec'],['Dead bug with reach','3 × 8/side']],
    shoulder:[['Band external rotation','3 × 12/side'],['Scapular wall slide','3 × 10'],['Forearm extensor eccentric','3 × 12/side']],
    general:[['Goblet squat or bodyweight squat','3 × 8'],['Side plank','3 × 25 sec/side'],['Single-leg calf raise','3 × 12/side']]
  };
  const key=(a.weakness.toLowerCase().includes('transition')||a.weakness.toLowerCase().includes('footwork'))?'transition':(a.weakness.toLowerCase().includes('serve')||a.weakness.toLowerCase().includes('overhead'))?'shoulder':'general';
  const exercises=catalog[key];const intensity=h.recovery==='Ready'?'Moderate':h.recovery==='Light'?'Light':'Recovery only';
  modal(`<h2>Strength & Conditioning Plan</h2><p>Built from your current weakness, 7-day load, soreness, and readiness. Intensity today: <strong>${intensity}</strong>.</p><div class="list">${exercises.map(([n,d])=>`<div class="list-item"><div><strong>${esc(n)}</strong><div class="meta">${esc(d)}</div></div><span class="pill">Controlled</span></div>`).join('')}</div><div class="callout" style="margin-top:14px"><p>${h.recovery==='Rest'?'Replace loaded work with comfortable mobility today.':`Rest 60–90 seconds and stop before form breaks. Pair this with ${esc(focusRecommendation().title.toLowerCase())}.`}</p></div><div class="form-actions"><button class="button" type="button" onclick="document.getElementById('modal').close()">Close</button><button class="button primary" id="log-strength">Log workout</button></div>`);
  $('#log-strength').onclick=async()=>{state.sessions.push({id:uid('session'),date:todayISO(),drillId:'generated-strength',name:`${key[0].toUpperCase()+key.slice(1)} strength plan`,minutes:h.recovery==='Rest'?10:24,skill:'Off-court strength',exercises});await saveState({quiet:true});closeModal();toast('Strength session logged');render();};
}
function movementScreen(){
  modal(`<h2>Movement & Injury-Risk Self-Screen</h2><p>Answer based on your last two sessions. This is an early-warning checklist, not a diagnosis or substitute for a qualified clinician.</p><form id="movement-form" class="form-grid"><label class="check-row field full"><input type="checkbox" name="backpedal"> I backpedaled or crossed my feet while chasing lobs</label><label class="check-row field full"><input type="checkbox" name="knee"> My knee moved inward or I lost lower-body control while stopping</label><label class="check-row field full"><input type="checkbox" name="late"> Contact was repeatedly late or behind my body</label><label class="check-row field full"><input type="checkbox" name="balance"> I often finished swings off-balance or needed extra recovery steps</label><label class="check-row field full"><input type="checkbox" name="fatigue"> One side fatigued much earlier than the other</label><div class="field"><label>Pain during play (0–10)</label><input name="pain" type="number" min="0" max="10" value="0"></div><div class="field"><label>Confidence in movement (1–5)</label><input name="confidence" type="number" min="1" max="5" value="4"></div><div class="field full"><label>Notes</label><textarea name="notes" placeholder="Where, when, and during which movement?"></textarea></div><div class="form-actions"><button class="button" type="button" onclick="document.getElementById('modal').close()">Cancel</button><button class="button primary" type="submit">Save screen</button></div></form>`);
  $('#movement-form').addEventListener('submit',async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget));const flags=['backpedal','knee','late','balance','fatigue'].filter(k=>e.currentTarget[k].checked);const pain=Number(d.pain);const confidence=Number(d.confidence);const score=Math.round(clamp(flags.length*14+pain*5+(5-confidence)*5,0,100));state.movementScreens.push({id:uid('screen'),date:todayISO(),flags,pain,confidence,notes:d.notes,score});await saveState({quiet:true});closeModal();toast(`Movement screen saved: ${score}/100 signal`);render();});
}
function gearServiceForm(){
  modal(`<h2>Add a local gear service</h2><form id="service-form" class="form-grid"><div class="field full"><label>Name</label><input name="name" required></div><div class="field"><label>Service type</label><select name="type"><option>Grip replacement</option><option>Paddle repair</option><option>Paddle fitting/demo</option><option>Shoe fitting</option><option>Other</option></select></div><div class="field"><label>Location</label><input name="location"></div><div class="field"><label>Phone</label><input name="phone" type="tel"></div><div class="field"><label>Website</label><input name="url" type="url"></div><div class="field full"><label>Notes</label><textarea name="notes"></textarea></div><div class="form-actions"><button class="button" type="button" onclick="document.getElementById('modal').close()">Cancel</button><button class="button primary" type="submit">Save service</button></div></form>`);
  $('#service-form').addEventListener('submit',async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget));state.gearServices.push({...d,id:uid('service')});await saveState({quiet:true});closeModal();toast('Service saved locally');render();});
}
function tournamentReport(id){
  const t=state.tournaments.find(x=>x.id===id);if(!t)return;const r=t.report||{};
  modal(`<h2>${esc(t.name)} Report Card</h2><p>Compare tournament execution with practice signals and save the lesson back to your coaching profile.</p><form id="report-form" class="form-grid"><div class="field"><label>Wins</label><input name="wins" type="number" min="0" value="${esc(r.wins??0)}"></div><div class="field"><label>Losses</label><input name="losses" type="number" min="0" value="${esc(r.losses??0)}"></div><div class="field"><label>First-ball quality (1–5)</label><input name="firstBall" type="number" min="1" max="5" value="${esc(r.firstBall??3)}"></div><div class="field"><label>Pressure execution (1–5)</label><input name="pressure" type="number" min="1" max="5" value="${esc(r.pressure??3)}"></div><div class="field"><label>Training transferred (1–5)</label><input name="transfer" type="number" min="1" max="5" value="${esc(r.transfer??3)}"></div><div class="field"><label>Status</label><select name="status"><option ${t.status==='Considering'?'selected':''}>Considering</option><option ${t.status==='Registered'?'selected':''}>Registered</option><option ${t.status==='Completed'?'selected':''}>Completed</option></select></div><div class="field full"><label>What held up?</label><textarea name="strengths">${esc(r.strengths||'')}</textarea></div><div class="field full"><label>What broke down?</label><textarea name="weaknesses">${esc(r.weaknesses||'')}</textarea></div><div class="field full"><label>Next adjustment</label><textarea name="next">${esc(r.next||'')}</textarea></div><div class="form-actions"><button class="button" type="button" onclick="document.getElementById('modal').close()">Cancel</button><button class="button primary" type="submit">Save report</button></div></form>`);
  $('#report-form').addEventListener('submit',async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget));['wins','losses','firstBall','pressure','transfer'].forEach(k=>d[k]=Number(d[k]));t.status=d.status;delete d.status;t.report={...d,savedAt:new Date().toISOString()};await saveState({quiet:true});closeModal();toast('Tournament report saved');render();});
}
function clubEventForm(){
  modal(`<h2>Create a club event</h2><form id="club-event-form" class="form-grid"><div class="field full"><label>Event name</label><input name="name" required placeholder="Friday night round robin"></div><div class="field"><label>Date</label><input name="date" type="date" value="${todayISO()}" required></div><div class="field"><label>Time</label><input name="time" type="time" value="18:00"></div><div class="field"><label>Format</label><select name="format"><option>Open play</option><option>Round robin</option><option>Ladder night</option><option>Clinic</option><option>Tournament prep</option></select></div><div class="field"><label>Court</label><input name="court"></div><div class="field full"><label>Notes</label><textarea name="notes"></textarea></div><div class="form-actions"><button class="button" type="button" onclick="document.getElementById('modal').close()">Cancel</button><button class="button primary" type="submit">Save event</button></div></form>`);
  $('#club-event-form').addEventListener('submit',async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget));state.clubEvents.push({...d,id:uid('club')});await saveState({quiet:true});closeModal();toast('Club event scheduled locally');render();});
}
function ladderPlayerForm(){
  modal(`<h2>Add ladder player</h2><form id="ladder-form" class="form-grid"><div class="field full"><label>Name</label><input name="name" required></div><div class="field"><label>Level</label><input name="level" placeholder="3.5"></div><div class="field"><label>Starting wins</label><input name="wins" type="number" min="0" value="0"></div><div class="field"><label>Starting losses</label><input name="losses" type="number" min="0" value="0"></div><div class="form-actions"><button class="button" type="button" onclick="document.getElementById('modal').close()">Cancel</button><button class="button primary" type="submit">Add player</button></div></form>`);
  $('#ladder-form').addEventListener('submit',async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget));state.ladderPlayers.push({...d,id:uid('ladder'),wins:Number(d.wins),losses:Number(d.losses)});await saveState({quiet:true});closeModal();toast('Player added to local ladder');render();});
}
function updateLadderResult(id){
  const p=state.ladderPlayers.find(x=>x.id===id);if(!p)return;
  modal(`<h2>Update ${esc(p.name)}</h2><p>Current record: ${p.wins}-${p.losses}</p><div class="grid two"><button class="button primary" id="ladder-win">+ Win</button><button class="button dark" id="ladder-loss">+ Loss</button></div><div class="form-actions"><button class="button danger" id="remove-ladder">Remove player</button><button class="button" type="button" onclick="document.getElementById('modal').close()">Close</button></div>`);
  $('#ladder-win').onclick=async()=>{p.wins++;await saveState({quiet:true});closeModal();render();};$('#ladder-loss').onclick=async()=>{p.losses++;await saveState({quiet:true});closeModal();render();};$('#remove-ladder').onclick=async()=>{state.ladderPlayers=state.ladderPlayers.filter(x=>x.id!==id);await saveState({quiet:true});closeModal();render();};
}


function searchVideoMoments(){
  const moments=[];(state.videos||[]).forEach(v=>(v.tags||[]).forEach(t=>moments.push({...t,videoId:v.id,videoName:v.name,date:v.date})));
  const types=[...new Set(moments.map(x=>x.type))].sort();
  modal(`<h2>Search Video Moments</h2><p>Search every locally tagged timestamp—such as all backhand reset errors or every highlight.</p><div class="grid two"><div class="field"><label>Moment type</label><select id="moment-filter"><option value="all">All moment types</option>${types.map(t=>`<option>${esc(t)}</option>`).join('')}</select></div><div class="field"><label>Keyword</label><input id="moment-query" placeholder="reset, contact, footwork..."></div></div><div id="moment-results" class="list" style="margin-top:16px"></div>`);
  const renderResults=()=>{const type=$('#moment-filter').value,q=$('#moment-query').value.toLowerCase().trim();const filtered=moments.filter(m=>(type==='all'||m.type===type)&&(!q||`${m.type} ${m.note} ${m.videoName}`.toLowerCase().includes(q)));$('#moment-results').innerHTML=filtered.length?filtered.sort((a,b)=>b.date.localeCompare(a.date)).map(m=>`<div class="list-item"><div><strong>${esc(m.type)} · ${formatTime(m.time)}</strong><div class="meta">${esc(m.videoName)} · ${esc(m.note||'No note')}</div></div><button class="button small" data-open-moment="${m.videoId}" data-time="${m.time}">Open</button></div>`).join(''):empty('▶','No matching moments',moments.length?'Try a different type or keyword.':'Tag moments inside an uploaded video first.');$$('[data-open-moment]').forEach(b=>b.onclick=()=>openVideo(b.dataset.openMoment,Number(b.dataset.time)));};
  $('#moment-filter').onchange=renderResults;$('#moment-query').oninput=renderResults;renderResults();
}
async function compareVideos(){
  if(state.videos.length<2){toast('Upload at least two videos to compare');return;}
  modal(`<h2>Video Swing Comparison</h2><p>Choose two locally stored clips, align the starting timestamps, and play them together to visualize form change over time.</p><div class="grid two"><div class="field"><label>Earlier clip</label><select id="compare-a">${state.videos.map(v=>`<option value="${v.id}">${esc(v.name)} · ${fmtDate(v.date)}</option>`).join('')}</select></div><div class="field"><label>Later clip</label><select id="compare-b">${state.videos.map((v,i)=>`<option value="${v.id}" ${i===1?'selected':''}>${esc(v.name)} · ${fmtDate(v.date)}</option>`).join('')}</select></div><div class="field"><label>A start time (seconds)</label><input id="compare-a-time" type="number" min="0" step="0.1" value="0"></div><div class="field"><label>B start time (seconds)</label><input id="compare-b-time" type="number" min="0" step="0.1" value="0"></div></div><button class="button primary" id="load-comparison" style="margin-top:14px">Load comparison</button><div id="comparison-stage" class="comparison-stage" style="margin-top:16px"></div>`);
  const urls=[];const cleanup=()=>urls.forEach(URL.revokeObjectURL);$('#modal').addEventListener('close',cleanup,{once:true});
  $('#load-comparison').onclick=async()=>{const aid=$('#compare-a').value,bid=$('#compare-b').value;if(aid===bid){toast('Choose two different videos');return;}const [ab,bb]=await Promise.all([idbGet('videos',aid),idbGet('videos',bid)]);if(!ab||!bb){toast('A local video file is missing');return;}urls.splice(0).forEach(URL.revokeObjectURL);const au=URL.createObjectURL(ab),bu=URL.createObjectURL(bb);urls.push(au,bu);$('#comparison-stage').innerHTML=`<div class="comparison-grid"><div><div class="eyebrow">EARLIER</div><video id="compare-video-a" src="${au}" controls playsinline></video></div><div><div class="eyebrow">LATER</div><video id="compare-video-b" src="${bu}" controls playsinline></video></div></div><div class="tag-row" style="margin-top:12px"><button class="button primary" id="sync-play">Sync play</button><button class="button" id="sync-pause">Pause both</button><button class="button" id="sync-reset">Reset starts</button></div>`;const va=$('#compare-video-a'),vb=$('#compare-video-b');const starts=()=>[Number($('#compare-a-time').value||0),Number($('#compare-b-time').value||0)];const setStarts=()=>{const [a,b]=starts();va.currentTime=a;vb.currentTime=b;};va.onloadedmetadata=setStarts;vb.onloadedmetadata=setStarts;$('#sync-play').onclick=async()=>{setStarts();await Promise.allSettled([va.play(),vb.play()]);};$('#sync-pause').onclick=()=>{va.pause();vb.pause();};$('#sync-reset').onclick=()=>{va.pause();vb.pause();setStarts();};};
}

function cameraLab(){
  modal(`<h2>Local Camera Motion Coach</h2><p>This experimental tool measures movement intensity and rep rhythm from frames on your device. It does not identify joints, diagnose injury, or replace a coach.</p><div class="camera-stage"><video id="camera-video" autoplay muted playsinline></video><canvas id="motion-canvas" hidden></canvas><div class="target-zone">Contact zone</div><div class="paddle-guide"></div></div><div class="grid three" style="margin-top:14px"><div class="stat-chip"><strong id="motion-score">0</strong><div class="meta">Motion intensity</div></div><div class="stat-chip"><strong id="rep-count">0</strong><div class="meta">Detected reps</div></div><div class="stat-chip"><strong id="rhythm-score">—</strong><div class="meta">Rhythm score</div></div></div><div class="field" style="margin-top:14px"><label>Shot mode</label><select id="camera-shot"><option>Serve</option><option>Dink</option><option>Drive</option><option>Third-shot drop</option><option>Overhead</option></select></div><div class="callout" style="margin-top:12px"><p id="camera-cue">Start the camera, perform 5 controlled reps, and keep your tempo repeatable.</p></div><div class="form-actions"><button class="button" id="stop-camera">Stop</button><button class="button primary" id="start-camera">Start camera</button></div>`);
  $('#start-camera').onclick=startMotionCamera;$('#stop-camera').onclick=stopCamera;
  $('#modal').addEventListener('close',stopCamera,{once:true});
}
async function startMotionCamera(){
  try{cameraStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user'},audio:false});const video=$('#camera-video');video.srcObject=cameraStream;await video.play();runMotionAnalysis(video,$('#motion-canvas'));$('#start-camera').disabled=true;}catch(err){toast(`Camera unavailable: ${err.message}`);}
}
function runMotionAnalysis(video,canvas){
  const ctx=canvas.getContext('2d',{willReadFrequently:true});canvas.width=160;canvas.height=90;let prev=null,lastHigh=false,reps=0,times=[];let raf;
  const loop=()=>{if(!cameraStream)return;ctx.drawImage(video,0,0,canvas.width,canvas.height);const data=ctx.getImageData(0,0,canvas.width,canvas.height).data;let diff=0;if(prev){for(let i=0;i<data.length;i+=16){diff+=Math.abs(data[i]-prev[i])+Math.abs(data[i+1]-prev[i+1])+Math.abs(data[i+2]-prev[i+2]);}diff=Math.round(diff/(data.length/16)/7.65);}prev=new Uint8ClampedArray(data);const high=diff>18;if(high&&!lastHigh){const now=performance.now();if(!times.length||now-times[times.length-1]>500){reps++;times.push(now);if(times.length>8)times.shift();}}lastHigh=high;if($('#motion-score'))$('#motion-score').textContent=diff;if($('#rep-count'))$('#rep-count').textContent=reps;if(times.length>=3){const intervals=times.slice(1).map((t,i)=>t-times[i]);const avg=mean(intervals);const variation=mean(intervals.map(x=>Math.abs(x-avg)))/avg;const score=Math.round(clamp(100-variation*160,0,100));if($('#rhythm-score'))$('#rhythm-score').textContent=score;if($('#camera-cue'))$('#camera-cue').textContent=score>=80?'Tempo is consistent. Now preserve the same rhythm while aiming at the contact zone.':score>=55?'Rhythm is developing. Slow down and make the reset between reps identical.':'Rep timing is inconsistent. Reduce speed and exaggerate the ready-position pause.';}raf=requestAnimationFrame(loop);motionLoop=raf;};loop();
}
function stopCamera(){if(motionLoop)cancelAnimationFrame(motionLoop);motionLoop=null;if(cameraStream)cameraStream.getTracks().forEach(t=>t.stop());cameraStream=null;}
function timerModal(seconds){
  let remaining=Number(seconds);modal(`<h2>Guided timer</h2><div class="card dark" style="text-align:center"><div id="timer-display" style="font-size:5rem;font-weight:950;letter-spacing:-.08em">${formatTime(remaining)}</div><p>Move smoothly and stop if anything feels painful.</p></div><div class="form-actions"><button class="button" id="timer-pause">Pause</button><button class="button primary" id="timer-start">Start</button></div>`);
  let interval=null;const update=()=>{$('#timer-display').textContent=formatTime(remaining);if(remaining<=0){clearInterval(interval);interval=null;toast('Routine complete');}};$('#timer-start').onclick=()=>{if(interval)return;interval=setInterval(()=>{remaining--;update();},1000);};$('#timer-pause').onclick=()=>{clearInterval(interval);interval=null;};$('#modal').addEventListener('close',()=>clearInterval(interval),{once:true});
}
function generateDemoData(){
  const names=['Jordan Lee','Maya Patel','Chris R.','Avery Chen','Noah Williams','Taylor Brooks','Sam Kim','Riley Morgan'];
  state.matches=Array.from({length:12},(_,i)=>{
    const win=[1,1,0,1,0,1,1,1,0,1,0,1][i]===1;const forScore=win?11:[7,9,8,10][i%4];const against=win?[5,7,8,9,10][i%5]:11;
    return {id:uid('match'),date:daysAgo(24-i*2),type:i%3===0?'Doubles':'Singles',result:win?'W':'L',opponent:names[i%names.length],partner:i%3===0?'Alex Rivera':'',scoreFor:forScore,scoreAgainst:against,court:i%2?'River City Courts':'Henrico Sports Park',duration:25+i*2,thirdShot:i%2?'Drop':'Mixed',resetSuccess:48+i*3,transitionSuccess:44+i*3,dominantError:['Backhand reset','Third-shot drop','Transition footwork','Unforced dink error'][i%4],dinkRally:4+(i%6),pressureWon:i%4,pressurePlayed:i%4+1,notes:'Demo match for exploring DinkSense.'};
  });
  state.sessions=[{id:uid('s'),date:daysAgo(2),createdAt:new Date().toISOString(),drillId:'wall-reset',name:'Wall Reset Rhythm',minutes:10,skill:'Backhand reset',quality:4,exertion:6,successRate:78,painAfter:0},{id:uid('s'),date:daysAgo(4),createdAt:new Date(Date.now()-86400000).toISOString(),drillId:'serve-depth',name:'Deep Serve Grid',minutes:12,skill:'Serve quality',quality:3,exertion:5,successRate:72,painAfter:0},{id:uid('s'),date:daysAgo(6),createdAt:new Date(Date.now()-172800000).toISOString(),drillId:'footwork-ladder',name:'Kitchen Footwork Ladder',minutes:10,skill:'Lateral movement',quality:4,exertion:7,successRate:82,painAfter:1}];
  state.health=[0,1,3,5].map((n,i)=>({id:uid('h'),date:daysAgo(n),soreness:[2,3,4,2][i],sleep:[8,7.5,6.5,8.2][i],hydration:[4,4,3,5][i],energy:4,area:i===2?'Knee':'General'}));
  state.courts=[{id:uid('c'),name:'River City Pickleball Center',address:'Richmond, VA',courts:8,surface:'Acrylic hard court',crowd:'Open',lights:true,indoor:false,orientation:'North–south'},{id:uid('c'),name:'Henrico Sports Park',address:'Henrico, VA',courts:6,surface:'Concrete',crowd:'Moderate',lights:true,indoor:false,orientation:'East–west'}];
  state.gear=[{id:uid('g'),type:'Paddle',name:'Competition Paddle',purchaseDate:daysAgo(110),sessions:38,notes:''},{id:uid('g'),type:'Shoes',name:'Court Shoes',purchaseDate:daysAgo(70),sessions:31,notes:''}];
  state.tournaments=[{id:uid('t'),name:'Richmond Summer Open',date:daysAgo(-30),location:'Richmond, VA',bracket:'4.0 singles',status:'Considering',url:''}];
  state.profile={...state.profile,name:'Demo Athlete',city:'Richmond',state:'Virginia',skill:4.0,style:'Aggressive net-rusher',goals:'Prepare for a competitive singles tournament',bio:'Competitive player focused on measurable development, disciplined training, and helping grow junior pickleball.'};
  state.challenges=[];state.settings.demoMode=true;state.planMeta={...structuredClone(DEFAULT_STATE.planMeta),goal:'Prepare for a tournament',note:'Demo adaptive plan',startDate:daysAgo(5),weeks:6,sessionsPerWeek:3,lastAdaptedAt:new Date().toISOString(),history:[],undoSnapshot:null};state.plan=createRoadmap(state.planMeta);state.planMeta.lastSignature=roadmapSignature();state.experiments=[{id:uid('experiment'),title:'Transition split-step transfer test',hypothesis:'A deliberate split-step before every transition contact will raise transition success.',metric:'transitionSuccess',baseline:58,current:63,target:68,matchesNeeded:3,matchesLogged:1,status:'active',createdAt:new Date(Date.now()-86400000).toISOString()}];
  state.pointPatterns=[{id:uid('pattern'),name:'Deep middle → soft fifth',firstBall:'Deep serve through the middle',thirdBall:'Drive body to shrink angles',fifthBall:'Soft reset into the kitchen',trigger:'Opponent blocks above net height',successDefinition:'Earn the kitchen or create the first attackable ball',attempts:14,successes:9,active:true,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()}];
  state.milestone={startSkill:4.0,targetSkill:4.5,targetDate:addDaysISO(todayISO(),112),sessionsPerWeek:4,createdAt:new Date().toISOString()};
}

async function resetApp(){
  if(!confirm('Delete all DinkSense data and local videos from this browser? This cannot be undone unless you exported a backup.'))return;
  state=structuredClone(DEFAULT_STATE);localRemove(STATE_KEY);await idbClear('kv');await idbClear('videos');await saveState({quiet:true});toast('DinkSense reset');navigate('dashboard');
}

function bindCommonActions(){
  $$('[data-nav]').forEach(el=>el.onclick=()=>navigate(el.dataset.nav));
  $$('[data-action="log-match"]').forEach(el=>el.onclick=()=>matchForm());
  $$('[data-action="live-match"]').forEach(el=>el.onclick=liveMatchLab);
  $$('[data-action="voice-log"]').forEach(el=>el.onclick=voiceLog);
  $$('[data-action="open-coach"]').forEach(el=>el.onclick=openCoach);
  $$('[data-edit-match]').forEach(el=>el.onclick=()=>matchForm(state.matches.find(m=>m.id===el.dataset.editMatch)));
  $$('[data-delete-match]').forEach(el=>el.onclick=async()=>{if(!confirm('Delete this match?'))return;state.matches=state.matches.filter(m=>m.id!==el.dataset.deleteMatch);await saveState({quiet:true});toast('Match deleted');render();});
  $$('[data-action="generate-plan"]').forEach(el=>el.onclick=generatePlanForm);
  $$('[data-view-drill]').forEach(el=>el.onclick=()=>viewDrill(el.dataset.viewDrill));
  $$('[data-complete-drill]').forEach(el=>el.onclick=()=>logDrill(el.dataset.completeDrill));
  $$('[data-start-solo]').forEach(el=>el.onclick=()=>viewDrill(el.dataset.startSolo));
  $$('[data-action="solo-session"]').forEach(el=>el.onclick=soloSession);
  $$('[data-action="custom-drill"]').forEach(el=>el.onclick=customDrillForm);
  $$('[data-action="strength-plan"]').forEach(el=>el.onclick=strengthPlan);
  $$('[data-playbook]').forEach(el=>el.onclick=()=>showPlaybook(el.dataset.playbook));
  $$('[data-delete-custom]').forEach(el=>el.onclick=async()=>{if(!confirm('Delete this custom drill?'))return;state.customDrills=state.customDrills.filter(d=>d.id!==el.dataset.deleteCustom);await saveState({quiet:true});toast('Custom drill deleted');render();});
  $$('[data-export-drill]').forEach(el=>el.onclick=()=>exportDrill(el.dataset.exportDrill));
  const drillImporter=$('#import-drill');if(drillImporter)drillImporter.onchange=e=>importDrill(e.target.files[0]);
  $$('[data-action="new-challenge"]').forEach(el=>el.onclick=async()=>{const f=focusRecommendation(),h=healthScore();const options=h.recovery==='Rest'?[`Complete 12 minutes of mobility and tag soreness afterward.`,`Review three tagged video moments and write one technical cue.`]:f.drill==='transition-gauntlet'?[`Reach the kitchen 12 times using two or more controlled transition balls.`,`Complete 30 resets, then win five 10–10 mini-games without rushing forward.`]:f.drill==='wall-reset'?[`Land 50 compact resets with at least 70% unattackable.`,`Hold 4/5 session quality on two backhand-reset sessions.`]:f.drill==='pressure-10'?[`Play four mini-games from 10–10 using one pre-point cue.`,`Convert 60% of tagged pressure points across your next two matches.`]:[`Complete ${findDrill(f.drill)?.name||'the focus drill'} twice and test the same cue in one match.`,`Win three points by creating—not forcing—the first attackable ball.`];const next=options[(state.challenges.length)%options.length];state.challenges.push({id:uid('challenge'),text:next,date:todayISO(),source:f.title});await saveState({quiet:true});render();});

  $$('[data-action="adapt-now"]').forEach(el=>el.onclick=async()=>{const changed=maybeAutoAdaptRoadmap({trigger:'manual coach review',force:true,notify:true});await saveState({quiet:true,skipAdapt:true});if(!changed)toast('Roadmap is already aligned with current evidence');render();});
  $$('[data-action="toggle-auto-adapt"]').forEach(el=>el.onclick=async()=>{state.settings.autoAdaptPlan=!state.settings.autoAdaptPlan;await saveState({quiet:true,skipAdapt:true});toast(state.settings.autoAdaptPlan?'Automatic roadmap rewriting enabled':'Automatic roadmap rewriting paused');render();});
  $$('[data-action="undo-adaptation"]').forEach(el=>el.onclick=undoAdaptation);
  $$('[data-action="mark-adaptation-read"]').forEach(el=>el.onclick=async()=>{state.planMeta.unreadAdaptation=false;await saveState({quiet:true,skipAdapt:true});render();});
  $$('[data-action="show-adaptation-evidence"]').forEach(el=>el.onclick=showAdaptationEvidence);
  $$('[data-action="new-experiment"]').forEach(el=>el.onclick=experimentForm);
  $$('[data-action="milestone-form"]').forEach(el=>el.onclick=milestoneForm);
  $$('[data-action="new-pattern"]').forEach(el=>el.onclick=()=>pointPatternForm());
  $$('[data-pattern-edit]').forEach(el=>el.onclick=()=>pointPatternForm(state.pointPatterns.find(p=>p.id===el.dataset.patternEdit)||{}));
  $$('[data-pattern-attempt]').forEach(el=>el.onclick=async()=>{const p=state.pointPatterns.find(x=>x.id===el.dataset.patternAttempt);if(!p)return;p.attempts=Number(p.attempts||0)+1;p.updatedAt=new Date().toISOString();await saveState({quiet:true});toast('Pattern attempt logged');render();});
  $$('[data-pattern-success]').forEach(el=>el.onclick=async()=>{const p=state.pointPatterns.find(x=>x.id===el.dataset.patternSuccess);if(!p)return;p.attempts=Number(p.attempts||0)+1;p.successes=Number(p.successes||0)+1;p.updatedAt=new Date().toISOString();await saveState({quiet:true});toast('Pattern success logged');render();});
  $$('[data-pattern-active]').forEach(el=>el.onclick=async()=>{state.pointPatterns=state.pointPatterns.map(p=>({...p,active:p.id===el.dataset.patternActive}));await saveState({quiet:true});toast('Active pattern changed');render();});
  $$('[data-pattern-delete]').forEach(el=>el.onclick=async()=>{if(!confirm('Delete this point pattern?'))return;const wasActive=state.pointPatterns.find(p=>p.id===el.dataset.patternDelete)?.active;state.pointPatterns=state.pointPatterns.filter(p=>p.id!==el.dataset.patternDelete);if(wasActive&&state.pointPatterns[0])state.pointPatterns[0].active=true;await saveState({quiet:true});toast('Point pattern deleted');render();});
  const videoUpload=$('#video-upload');if(videoUpload)videoUpload.onchange=e=>handleVideoUpload(e.target.files[0]);
  $$('[data-open-video]').forEach(el=>el.onclick=()=>openVideo(el.dataset.openVideo));
  $$('[data-delete-video]').forEach(el=>el.onclick=()=>deleteVideo(el.dataset.deleteVideo));
  $$('[data-action="camera-lab"]').forEach(el=>el.onclick=cameraLab);
  $$('[data-action="search-video"]').forEach(el=>el.onclick=searchVideoMoments);
  $$('[data-action="compare-video"]').forEach(el=>el.onclick=compareVideos);
  $$('[data-action="add-court"]').forEach(el=>el.onclick=()=>courtForm());
  $$('[data-edit-court]').forEach(el=>el.onclick=()=>courtForm(state.courts.find(c=>c.id===el.dataset.editCourt)));
  $$('[data-action="use-location"]').forEach(el=>el.onclick=useLocation);
  $$('[data-action="weather"]').forEach(el=>el.onclick=showWeather);
  $$('[data-action="health-log"]').forEach(el=>el.onclick=healthForm);
  $$('[data-action="movement-screen"]').forEach(el=>el.onclick=movementScreen);
  $$('[data-start-timer]').forEach(el=>el.onclick=()=>timerModal(Number(el.dataset.startTimer)));
  $$('[data-action="paddle-quiz"]').forEach(el=>el.onclick=paddleQuiz);
  $$('[data-action="add-gear"]').forEach(el=>el.onclick=gearForm);
  $$('[data-action="add-service"]').forEach(el=>el.onclick=gearServiceForm);
  $$('[data-delete-service]').forEach(el=>el.onclick=async()=>{state.gearServices=state.gearServices.filter(s=>s.id!==el.dataset.deleteService);await saveState({quiet:true});render();});
  $$('[data-use-gear]').forEach(el=>el.onclick=async()=>{const g=state.gear.find(x=>x.id===el.dataset.useGear);g.sessions=Number(g.sessions||0)+1;await saveState({quiet:true});toast('Gear usage updated');render();});
  $$('[data-delete-gear]').forEach(el=>el.onclick=async()=>{state.gear=state.gear.filter(x=>x.id!==el.dataset.deleteGear);await saveState({quiet:true});render();});
  $$('[data-action="add-tournament"]').forEach(el=>el.onclick=tournamentForm);
  $$('[data-tournament-report]').forEach(el=>el.onclick=()=>tournamentReport(el.dataset.tournamentReport));
  $$('[data-action="add-scout"]').forEach(el=>el.onclick=()=>scoutingForm());
  $$('[data-open-scout]').forEach(el=>el.onclick=()=>openScoutingReport(el.dataset.openScout));
  $$('[data-edit-scout]').forEach(el=>el.onclick=()=>scoutingForm(state.scoutingReports.find(x=>x.id===el.dataset.editScout)||{}));
  $$('[data-delete-scout]').forEach(el=>el.onclick=async()=>{if(!confirm('Delete this scouting report?'))return;state.scoutingReports=state.scoutingReports.filter(x=>x.id!==el.dataset.deleteScout);await saveState({quiet:true});toast('Scouting report deleted');render();});
  $$('[data-action="add-club-event"]').forEach(el=>el.onclick=clubEventForm);
  $$('[data-action="add-ladder-player"]').forEach(el=>el.onclick=ladderPlayerForm);
  $$('[data-ladder-result]').forEach(el=>el.onclick=()=>updateLadderResult(el.dataset.ladderResult));
  $$('[data-action="sponsor-pitch"]').forEach(el=>el.onclick=sponsorPitch);
  $$('[data-action="wrapped"]').forEach(el=>el.onclick=wrapped);
  $$('[data-action="edit-profile"]').forEach(el=>el.onclick=profileForm);
  $$('[data-action="export-profile"]').forEach(el=>el.onclick=exportProfile);
  $$('[data-action="export-data"]').forEach(el=>el.onclick=exportData);
  const importer=$('#import-data');if(importer)importer.onchange=e=>importData(e.target.files[0]);
  $$('[data-action="ollama-settings"]').forEach(el=>el.onclick=ollamaSettings);
  $$('[data-action="demo-data"]').forEach(el=>el.onclick=async()=>{if(state.matches.length&&!confirm('Replace current structured data with demo data? Export a backup first if needed.'))return;generateDemoData();await saveState({quiet:true});toast('Demo data loaded');navigate('dashboard');});
  $$('[data-action="reset-app"]').forEach(el=>el.onclick=resetApp);
  const si=$('#settings-install');if(si)si.onclick=installApp;
}

function openCoach(){
  const panel=$('#coach-panel');const messages=$('#coach-messages');
  messages.innerHTML='';
  const history=state.coachHistory.slice(-8);
  if(!history.length)addCoachMessage('coach','I’m grounded in your local match, drill, health, and goal data. Ask what to train, why a pattern is happening, or how ready you are for competition.');
  else history.forEach(m=>addCoachMessage(m.role,m.text));
  $('#coach-suggestions').innerHTML=['What should I do today?','Why did my plan change?','What trend is improving?','Start a measurable experiment'].map(s=>`<button>${esc(s)}</button>`).join('');
  $$('#coach-suggestions button').forEach(b=>b.onclick=()=>sendCoach(b.textContent));
  panel.showModal();setTimeout(()=>$('#coach-input').focus(),50);
}
function addCoachMessage(role,text){const el=document.createElement('div');el.className=`message ${role}`;el.textContent=text;$('#coach-messages').appendChild(el);$('#coach-messages').scrollTop=$('#coach-messages').scrollHeight;}
async function sendCoach(text){
  const q=String(text||$('#coach-input').value).trim();if(!q)return;$('#coach-input').value='';addCoachMessage('user',q);state.coachHistory.push({role:'user',text:q,date:new Date().toISOString()});const pending=document.createElement('div');pending.className='message coach';pending.textContent='Analyzing your local data…';$('#coach-messages').appendChild(pending);const answer=await coachAnswer(q);pending.textContent=answer;state.coachHistory.push({role:'coach',text:answer,date:new Date().toISOString()});state.coachHistory=state.coachHistory.slice(-30);await saveState({quiet:true});$('#coach-messages').scrollTop=$('#coach-messages').scrollHeight;
}

function installApp(){if(!deferredInstallPrompt){toast('Use your browser menu to install, or open through localhost/HTTPS first');return;}deferredInstallPrompt.prompt();deferredInstallPrompt.userChoice.finally(()=>{deferredInstallPrompt=null;$('#install-button').hidden=true;});}

async function init(){
  await loadState();
  $('#nav').innerHTML=navMarkup();
  $('#quick-log').onclick=()=>matchForm();
  $('#coach-fab').onclick=openCoach;
  $('#coach-send').onclick=()=>sendCoach();
  $('#modal-x').onclick=closeModal;
  $('#coach-x').onclick=()=>$('#coach-panel').close();
  $('#coach-input').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();sendCoach();}});
  window.addEventListener('hashchange',()=>{const v=location.hash.replace('#','')||'dashboard';if(v!==currentView){currentView=v;render();$('#nav').innerHTML=navMarkup();}});
  window.addEventListener('online',()=>{$('#offline-banner').hidden=true;});
  window.addEventListener('offline',()=>{$('#offline-banner').hidden=false;});
  $('#offline-banner').hidden=navigator.onLine;
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstallPrompt=e;$('#install-button').hidden=false;});
  $('#install-button').onclick=installApp;
  if('serviceWorker' in navigator && location.protocol!=='file:') navigator.serviceWorker.register('./sw.js').catch(console.warn);
  const adapted=maybeAutoAdaptRoadmap({trigger:'app opened or new week'});if(adapted)await saveState({quiet:true,skipAdapt:true});
  render();
}

document.addEventListener('DOMContentLoaded',init);
