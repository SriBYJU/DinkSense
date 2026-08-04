/* DinkSense v1.7.0 — Discovery, Playbook, Match Day, AdSense readiness, and polish */
'use strict';

const DS17_FOUNDER_PHOTO = './assets/shriyan-avadhanula-founder.png';
const DS17_MAP_FILTERS = {
  all: 'pickleball courts',
  indoor: 'indoor pickleball courts',
  outdoor: 'outdoor pickleball courts',
  public: 'public pickleball courts',
  openplay: 'pickleball open play'
};

const DS17_PRO_TIPS = [
  {id:'ready-paddle',category:'Technique',level:'All',tags:['hands','volley','flick','counter'],title:'Win the first six inches',cue:'Keep the paddle in front and make the first move compact.',why:'Short preparation protects both sides and makes counters faster.',mistake:'Dropping the paddle or taking a full backswing during hand battles.',challenge:'Play three hands exchanges where the paddle never travels behind your torso.',drill:'hands-burst'},
  {id:'dink-purpose',category:'Strategy',level:'All',tags:['dink','attack timing'],title:'Move the opponent before attacking',cue:'Use depth and location to create height; do not attack only because the rally is long.',why:'A neutral ball stays neutral until balance, height, or spacing changes.',mistake:'Speeding up from below net height because of impatience.',challenge:'During one game, call “green” only when the ball is above net height.',drill:'speedup-read'},
  {id:'reset-margin',category:'Technique',level:'All',tags:['reset','transition','backhand'],title:'Give the reset room to fall',cue:'Contact in front, soften the hand, and clear the net with margin.',why:'A reset that falls is safer than one aimed barely over the tape.',mistake:'Trying to guide the ball with a late wrist motion.',challenge:'Land 30 resets that peak safely and drop before the opponent can attack.',drill:'wall-reset'},
  {id:'split-before-contact',category:'Technique',level:'All',tags:['transition','footwork'],title:'Split before they strike',cue:'Arrive balanced as the opponent contacts the ball—even if that means stopping in transition.',why:'A timed split step gives access to both directions and prevents running through the shot.',mistake:'Sprint-charging the kitchen without reading the next ball.',challenge:'Count ten controlled split steps during transition reps.',drill:'transition-gauntlet'},
  {id:'third-fifth-system',category:'Strategy',level:'Intermediate',tags:['third-shot drop','third-shot drive','transition'],title:'Plan the third and fifth together',cue:'Drive to earn a predictable fifth; drop to earn forward space.',why:'The third ball is valuable because of the next ball it creates.',mistake:'Treating a drive winner as the only successful outcome.',challenge:'Before every third ball, name the intended fifth-ball response.',drill:'third-drop'},
  {id:'deep-middle',category:'Singles',level:'All',tags:['serve','return','singles'],title:'Use deep middle to shrink angles',cue:'Depth first, then location.',why:'Deep middle balls reduce passing angles and buy movement time.',mistake:'Chasing sideline precision before establishing depth.',challenge:'Hit 20 serves or returns into the final third through the middle lane.',drill:'serve-depth'},
  {id:'partner-lane',category:'Doubles',level:'All',tags:['partner','middle'],title:'Protect lanes, not imaginary halves',cue:'Communicate early and cover the ball your positioning makes most efficient.',why:'Strong doubles teams shift together instead of guarding fixed boxes.',mistake:'Both players watching the same ball while the weak-side lane opens.',challenge:'Use one clear middle-ball call for an entire game.',drill:'return-plus'},
  {id:'flick-compact',category:'Technique',level:'Advanced',tags:['flick','backhand flick','forehand flick'],title:'Flick from disguise, not a giant load',cue:'Same setup as a dink; accelerate late with a compact path.',why:'Disguise and contact height matter more than a dramatic backswing.',mistake:'Opening the shoulder early and announcing the attack.',challenge:'Alternate five soft dinks and one compact flick without changing preparation.',drill:'speedup-read'},
  {id:'roll-brush',category:'Technique',level:'Intermediate',tags:['roll','forehand roll','backhand roll'],title:'Brush up while staying through the target',cue:'Lift with shape, but keep the body balanced and the finish controlled.',why:'A roll combines net clearance with a dipping flight path.',mistake:'Overusing the wrist and finishing across the body too soon.',challenge:'Hit 15 rolls to the feet with a balanced recovery after each rep.',drill:'speedup-read'},
  {id:'overhead-turn',category:'Technique',level:'All',tags:['overhead','lob'],title:'Turn before moving back',cue:'Open the hips, crossover, create space, then contact in front.',why:'Turning is safer and more powerful than blind backpedaling.',mistake:'Retreating straight backward while looking up.',challenge:'Complete ten shadow turns without crossing or tangling the feet.',drill:'overhead-footwork'},
  {id:'score-rule',category:'Mental',level:'All',tags:['pressure','close-game'],title:'Use one rule under pressure',cue:'Choose one serve target and one third-ball pattern before 10–10.',why:'A simple rule lowers decision noise when the score tightens.',mistake:'Inventing a new strategy after every lost point.',challenge:'Play four mini-games from 10–10 with the same pre-point cue.',drill:'pressure-10'},
  {id:'between-points',category:'Mental',level:'All',tags:['pressure','recovery'],title:'Reset the nervous system between points',cue:'Turn away, exhale, name the next cue, then return to the line.',why:'A repeatable routine prevents the previous rally from controlling the next one.',mistake:'Rushing immediately into the next serve while frustrated.',challenge:'Use the same four-step routine for one complete match.',drill:'pressure-10'},
  {id:'return-follow',category:'Singles',level:'Intermediate',tags:['return','approach','singles'],title:'The return earns the kitchen only if you follow it',cue:'Return deep, move immediately, and split before the opponent contacts.',why:'Singles court position magnifies hesitation after the return.',mistake:'Admiring the return and starting forward late.',challenge:'Complete 12 return-plus-four sequences with no late first step.',drill:'return-plus'},
  {id:'body-first',category:'Doubles',level:'Intermediate',tags:['attack','body','speedup'],title:'Attack the body before the paint',cue:'Use dominant hip, paddle-side shoulder, and middle seams before sharp sidelines.',why:'Body targets reduce counter angles and punish slow recovery.',mistake:'Trying to paint a sideline from an average ball.',challenge:'Win three points by creating a body jam instead of a clean winner.',drill:'speedup-read'},
  {id:'tournament-first-five',category:'Tournament',level:'All',tags:['tournament','scouting'],title:'Use the first five rallies as information',cue:'Track return depth, preferred third ball, and speed-up direction.',why:'Early observation creates a better plan than guessing from warm-up alone.',mistake:'Changing everything after one unusual rally.',challenge:'Write three opponent tendencies before making a tactical change.',drill:'pressure-10'},
  {id:'warmup-sequence',category:'Tournament',level:'All',tags:['warmup','serve','dink'],title:'Warm up in the order the match asks',cue:'Move, feel, accelerate, then compete.',why:'A progressive warm-up prepares movement and touch before maximum pace.',mistake:'Starting with hard drives while the body and hands are cold.',challenge:'Use a 10-minute sequence: movement, dinks, resets, serves, returns, hands.',drill:'footwork-ladder'},
  {id:'serve-routine',category:'Technique',level:'All',tags:['serve','pressure'],title:'Make the serve routine boring',cue:'Same breath, bounce, target, and finish every time.',why:'Repeatability protects depth when pressure rises.',mistake:'Changing tempo after a miss.',challenge:'Complete 25 serves with the exact same pre-serve routine.',drill:'serve-depth'},
  {id:'paddle-recovery',category:'Technique',level:'All',tags:['recovery','volley','counter'],title:'The shot is not finished until the paddle returns',cue:'Finish, rebalance, and recover the paddle to the next likely window.',why:'Fast exchanges punish beautiful shots followed by slow recovery.',mistake:'Holding the follow-through and watching the ball.',challenge:'Record ten volleys and grade only recovery speed.',drill:'hands-burst'},
  {id:'stack-purpose',category:'Doubles',level:'Advanced',tags:['partner','stacking'],title:'Stack only to protect a real advantage',cue:'Know which forehand, matchup, or movement pattern the stack is preserving.',why:'Stacking adds value when it clarifies roles—not when it creates confusion.',mistake:'Using a formation without rehearsed return and transition responsibilities.',challenge:'Name the first two movements for both partners before each stacked return.',drill:'return-plus'},
  {id:'fatigue-simplify',category:'Tournament',level:'All',tags:['fatigue','serve','recovery'],title:'Simplify before fatigue rewrites your mechanics',cue:'Reduce unnecessary swing, increase target margin, and preserve the legs.',why:'Late-match consistency usually improves when choices become simpler.',mistake:'Swinging harder to compensate for fading timing.',challenge:'Finish one session with ten placement-first serves at 80% effort.',drill:'serve-depth'},
  {id:'crosscourt-margin',category:'Strategy',level:'All',tags:['dink','margin'],title:'Use the long diagonal when neutral',cue:'Cross-court gives more distance and often a lower net window.',why:'Geometry creates margin before technique has to create magic.',mistake:'Redirecting down the line from an off-balance position.',challenge:'Hold a 20-ball cross-court dink rally before changing direction.',drill:'dink-100'},
  {id:'two-ball-advance',category:'Strategy',level:'Intermediate',tags:['transition','reset'],title:'Advance in controlled layers',cue:'Expect to need more than one soft ball to earn the kitchen.',why:'Trying to complete the entire transition in one rush produces unstable contact.',mistake:'Assuming one good drop guarantees the line.',challenge:'Reach the kitchen using at least two controlled contacts on eight reps.',drill:'transition-gauntlet'},
  {id:'scouting-proof',category:'Tournament',level:'Advanced',tags:['scouting','experiment'],title:'Prove a tendency before exploiting it',cue:'See the same pattern twice, then test the counter once.',why:'A small sample can mislead; measured experiments create better scouting.',mistake:'Building the whole game plan around one early point.',challenge:'Log one opponent hypothesis and a three-point test.',drill:'pressure-10'},
  {id:'identity-anchor',category:'Mental',level:'All',tags:['confidence','style'],title:'Compete from an identity, adjust with evidence',cue:'Know your best pattern, then make one change at a time.',why:'Confidence is more stable when it is tied to repeatable behaviors.',mistake:'Abandoning the entire game after a short losing run.',challenge:'Write one identity statement and one adjustable variable before play.',drill:'pressure-10'}

];

const DS17_OFFICIAL_RESOURCES = [
  {org:'USA Pickleball',title:'Positioning, patience, and kitchen-line strategy',description:'Official fundamentals for court position, patience, and earning the non-volley line.',url:'https://usapickleball.org/strategies/pickleball-basics-positioning-tips/'},
  {org:'USA Pickleball',title:'Singles strategy guide',description:'Official singles ideas for serving, returning, movement, and constructing points.',url:'https://usapickleball.org/strategies/pickleball-singles-strategy-tips/'},
  {org:'USA Pickleball',title:'Volley technique and decision tips',description:'Official guidance for compact volleys, ready position, and control at the kitchen.',url:'https://usapickleball.org/strategies/pickleball-volley-tips/'},
  {org:'USA Pickleball',title:'Kitchen-line footwork',description:'Official footwork guidance for efficient lateral movement and balanced court coverage.',url:'https://usapickleball.org/strategies/basic-kitchen-line-footwork-to-move-more-efficiently/'},
  {org:'PPA Tour',title:'Watch professional match patterns',description:'Study how top players construct points, recover, counter, and manage pressure in real competition.',url:'https://ppatour.com/watch/'},
  {org:'USA Pickleball',title:'Official rules and updates',description:'Check the current official rulebook before tournaments, especially for serve and non-volley-zone rules.',url:'https://usapickleball.org/rules/'}
];

// Extend local state before the original init() executes.
DEFAULT_STATE.savedTips = [];
DEFAULT_STATE.tipRotation = 0;
DEFAULT_STATE.courtDiscovery = {filter:'all', place:'', lat:'', lon:'', updatedAt:''};
DEFAULT_STATE.matchDay = {name:'',date:'',time:'',venue:'',format:'Singles',arrivalMinutes:60,notes:'',checked:[]};
DEFAULT_STATE.settings.adsenseEnabled = false;

if (!NAV_ITEMS.some(item => item[0] === 'learn')) {
  const insertAt = Math.max(0, NAV_ITEMS.findIndex(item => item[0] === 'compete'));
  NAV_ITEMS.splice(insertAt, 0, ['learn', '◆', 'Playbook']);
}

let ds17TipFilter = 'Recommended';
let ds17AdCounter = 0;

function ds17AdsConfig(){ return window.DINKSENSE_ADSENSE || {enabled:false,client:'',slots:{}}; }
function ds17IsRealAdValue(value){ return value && !String(value).includes('REPLACE_'); }
function ds17AdSlot(position='content'){
  const config=ds17AdsConfig();
  const slot=config.slots?.[position] || config.slots?.content || '';
  const live=Boolean(config.enabled && ds17IsRealAdValue(config.client) && ds17IsRealAdValue(slot));
  const id=`dinksense-ad-${++ds17AdCounter}`;
  return `<aside class="ad-unit ${live?'is-live':'is-placeholder'}" id="${id}" data-ad-position="${esc(position)}"><div class="ad-label">Advertisement</div>${live?`<ins class="adsbygoogle" style="display:block" data-ad-client="${esc(config.client)}" data-ad-slot="${esc(slot)}" data-ad-format="auto" data-full-width-responsive="true"></ins>`:`<div class="ad-placeholder-copy"><strong>AdSense-ready space</strong><span>Activates only after publisher and slot IDs are added in adsense-config.js.</span></div>`}</aside>`;
}
adSlot = ds17AdSlot;

function ds17HydrateAds(){
  const config=ds17AdsConfig();
  if(!(config.enabled && ds17IsRealAdValue(config.client)))return;
  if(!document.querySelector('script[data-dinksense-adsense]')){
    const script=document.createElement('script');
    script.async=true;script.crossOrigin='anonymous';script.dataset.dinksenseAdsense='true';
    script.src=`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(config.client)}`;
    document.head.appendChild(script);
  }
  document.querySelectorAll('ins.adsbygoogle:not([data-ad-requested])').forEach(ins=>{
    ins.dataset.adRequested='true';
    try{(window.adsbygoogle=window.adsbygoogle||[]).push({});}catch(err){console.warn('AdSense slot deferred',err);}
  });
}

function ds17CourtDiscovery(){
  state.courtDiscovery ??= structuredClone(DEFAULT_STATE.courtDiscovery);
  return state.courtDiscovery;
}
function ds17CourtQuery(){
  const d=ds17CourtDiscovery();
  const term=DS17_MAP_FILTERS[d.filter]||DS17_MAP_FILTERS.all;
  const place=d.lat&&d.lon?`${d.lat},${d.lon}`:(d.place||[state.profile.city,state.profile.state].filter(Boolean).join(', '));
  return place?`${term} near ${place}`:`${term} near me`;
}
function ds17GoogleMapsUrl(){
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ds17CourtQuery())}`;
}
function ds17GoogleEmbedUrl(){
  return `https://www.google.com/maps?q=${encodeURIComponent(ds17CourtQuery())}&z=12&output=embed`;
}
function ds17CourtSearchLabel(){
  const d=ds17CourtDiscovery();
  if(d.lat&&d.lon)return 'Current device location';
  return d.place||[state.profile.city,state.profile.state].filter(Boolean).join(', ')||'Location not set';
}
async function ds17UseLocation(){
  if(!navigator.geolocation){toast('Geolocation is not available in this browser');return;}
  toast('Requesting location for Google Maps…');
  navigator.geolocation.getCurrentPosition(async pos=>{
    const d=ds17CourtDiscovery();
    d.lat=Number(pos.coords.latitude).toFixed(6);d.lon=Number(pos.coords.longitude).toFixed(6);d.place='';d.updatedAt=new Date().toISOString();
    await saveState({quiet:true,skipAdapt:true});toast('Nearby-court map updated');render();
  },err=>toast(`Location unavailable: ${err.message}`),{enableHighAccuracy:true,timeout:12000,maximumAge:300000});
}
async function ds17SetCourtFilter(filter){
  const d=ds17CourtDiscovery();d.filter=filter;d.updatedAt=new Date().toISOString();await saveState({quiet:true,skipAdapt:true});render();
}

function ds17TipScore(tip){
  const a=analytics();const focus=focusRecommendation();const hay=`${a.weakness} ${focus.title} ${focus.detail}`.toLowerCase();
  let score=0;
  tip.tags.forEach(tag=>{if(hay.includes(tag.toLowerCase()))score+=14;});
  if(tip.level==='All')score+=3;
  if(Number(state.profile.skill)>=4&&tip.level==='Advanced')score+=5;
  if(Number(state.profile.skill)<3.5&&tip.level==='All')score+=5;
  if((state.savedTips||[]).includes(tip.id))score-=2;
  return score;
}
function ds17RecommendedTips(){ return [...DS17_PRO_TIPS].sort((a,b)=>ds17TipScore(b)-ds17TipScore(a)); }
function ds17DailyTip(){
  const ranked=ds17RecommendedTips();
  const index=Math.abs(Number(state.tipRotation||0))%Math.min(5,ranked.length);
  return ranked[index]||DS17_PRO_TIPS[0];
}
function ds17TipCard(tip){
  const saved=(state.savedTips||[]).includes(tip.id);
  return `<article class="card pro-tip-card"><div class="card-head"><div><div class="eyebrow">${esc(tip.category)} · ${esc(tip.level)}</div><h3>${esc(tip.title)}</h3></div><button class="tip-save ${saved?'saved':''}" data-save-tip="${tip.id}" aria-label="${saved?'Remove saved tip':'Save tip'}">${saved?'★':'☆'}</button></div><div class="tip-cue">${esc(tip.cue)}</div><p><strong>Why it works:</strong> ${esc(tip.why)}</p><p class="tip-mistake"><strong>Avoid:</strong> ${esc(tip.mistake)}</p><div class="tip-challenge"><span>COURT CHALLENGE</span>${esc(tip.challenge)}</div><div class="tag-row"><button class="button primary small" data-tip-practice="${esc(tip.drill)}">Open drill</button><button class="button small" data-copy-tip="${tip.id}">Copy cue</button>${tip.tags.slice(0,2).map(tag=>`<span class="pill">${esc(tag)}</span>`).join('')}</div></article>`;
}
function ds17StyleForProfile(){
  const style=String(state.profile.style||'').toLowerCase();
  return STYLE_PLAYBOOKS.find(p=>p.name.toLowerCase()===style)||STYLE_PLAYBOOKS.find(p=>style.includes(p.name.split(' ')[0].toLowerCase()))||STYLE_PLAYBOOKS[3];
}

function ds17MatchDay(){ state.matchDay ??= structuredClone(DEFAULT_STATE.matchDay);state.matchDay.checked??=[];return state.matchDay; }
function ds17MatchDate(){
  const m=ds17MatchDay();
  if(!m.date)return null;
  const time=m.time||'09:00';const d=new Date(`${m.date}T${time}:00`);return Number.isNaN(d.getTime())?null:d;
}
function ds17TimeOffset(base,minutes){
  const d=new Date(base.getTime()+minutes*60000);
  return d.toLocaleTimeString([], {hour:'numeric',minute:'2-digit'});
}
function ds17MatchDayChecklist(){
  return [
    ['gear','Paddle, backup grip, shoes, and balls checked'],
    ['fuel','Water, electrolytes, and a familiar snack packed'],
    ['arrival','Route and arrival buffer confirmed'],
    ['warmup','Progressive warm-up completed'],
    ['scouting','Opponent or bracket scouting reviewed'],
    ['cue','One tactical cue and one mental cue selected'],
    ['recovery','Post-match notes and recovery plan ready']
  ];
}
function ds17MatchPlanText(){
  const m=ds17MatchDay(),date=ds17MatchDate(),f=focusRecommendation(),h=healthScore(),tip=ds17DailyTip();
  const scout=(state.scoutingReports||[])[0];
  const lines=[
    `DinkSense Match Day Plan — ${m.name||'Upcoming competition'}`,
    `${m.date||'Date TBD'} ${m.time||''} · ${m.venue||'Venue TBD'} · ${m.format||'Format TBD'}`,
    '',`Readiness: ${h.score}/100 (${h.recovery})`,`Primary game cue: ${f.title} — ${f.detail}`,
    `Pro-level cue: ${tip.cue}`,scout?`Scouting note: ${scout.plan||scoutingPlan(scout)}`:'Scouting note: Use the first five rallies to identify return depth and attack direction.',
    '', 'Checklist:',...ds17MatchDayChecklist().map(([id,label])=>`${m.checked.includes(id)?'☑':'☐'} ${label}`)
  ];
  if(date)lines.splice(2,0,`Suggested arrival: ${ds17TimeOffset(date,-Number(m.arrivalMinutes||60))}`);
  if(m.notes)lines.push('',`Notes: ${m.notes}`);
  return lines.join('\n');
}
function ds17MatchDayForm(){
  const m=ds17MatchDay();
  modal(`<h2>Match Day Command Center</h2><p>Build a calm, personalized plan from your readiness, current focus, and scouting notes.</p><form id="ds17-match-day-form" class="form-grid"><div class="field full"><label>Event or match name</label><input name="name" value="${esc(m.name||'')}" placeholder="Saturday singles bracket"></div><div class="field"><label>Date</label><input name="date" type="date" value="${esc(m.date||todayISO())}"></div><div class="field"><label>Start time</label><input name="time" type="time" value="${esc(m.time||'09:00')}"></div><div class="field full"><label>Venue</label><input name="venue" value="${esc(m.venue||'')}" placeholder="Court or facility"></div><div class="field"><label>Format</label><select name="format"><option ${m.format==='Singles'?'selected':''}>Singles</option><option ${m.format==='Doubles'?'selected':''}>Doubles</option><option ${m.format==='Open play'?'selected':''}>Open play</option><option ${m.format==='Practice match'?'selected':''}>Practice match</option></select></div><div class="field"><label>Arrival buffer (minutes)</label><input name="arrivalMinutes" type="number" min="20" max="180" value="${esc(m.arrivalMinutes||60)}"></div><div class="field full"><label>Notes</label><textarea name="notes" placeholder="Bracket details, partner plan, equipment reminders">${esc(m.notes||'')}</textarea></div><div class="form-actions"><button class="button" type="button" onclick="document.getElementById('modal').close()">Cancel</button><button class="button primary">Build match plan</button></div></form>`);
  $('#ds17-match-day-form').addEventListener('submit',async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget));state.matchDay={...m,...d,arrivalMinutes:Number(d.arrivalMinutes||60),checked:m.checked||[]};await saveState({quiet:true,skipAdapt:true});closeModal();toast('Match day plan updated');render();});
}
function ds17MatchDayMarkup(){
  const m=ds17MatchDay(),eventDate=ds17MatchDate(),h=healthScore(),f=focusRecommendation(),tip=ds17DailyTip(),scout=(state.scoutingReports||[])[0];
  if(!m.name&&!m.date)return `<div class="card match-day-empty"><div><div class="eyebrow">NEW · MATCH DAY COMMAND CENTER</div><h2>Turn preparation into a repeatable system</h2><p>Build an arrival timeline, equipment checklist, warm-up sequence, tactical cue, scouting read, and recovery plan from your own data.</p></div><button class="button primary" data-action="match-day-form">Create match plan</button></div>`;
  const offsets=[[-Number(m.arrivalMinutes||60),'Arrive, check in, and settle'],[-40,'Movement + mobility warm-up'],[-25,'Touch, resets, serves, and returns'],[-10,'Scouting cue + controlled breathing'],[0,'Compete with one clear pattern']];
  return `<div class="grid dashboard-grid"><div class="card match-day-card"><div class="card-head"><div><div class="eyebrow">MATCH DAY COMMAND CENTER</div><h2>${esc(m.name||'Upcoming match')}</h2><div class="meta">${m.date?fmtDate(m.date):'Date TBD'} · ${esc(m.time||'Time TBD')} · ${esc(m.venue||'Venue TBD')} · ${esc(m.format||'Format TBD')}</div></div><span class="pill ${h.recovery==='Ready'?'good':h.recovery==='Rest'?'bad':'warn'}">Readiness ${h.score}</span></div><div class="timeline-list">${eventDate?offsets.map(([offset,label])=>`<div class="timeline-item"><strong>${ds17TimeOffset(eventDate,offset)}</strong><span>${esc(label)}</span></div>`).join(''):'<p>Add a date and start time to generate the arrival timeline.</p>'}</div><div class="callout"><p><strong>Game cue:</strong> ${esc(f.title)} — ${esc(f.detail)}</p></div><div class="tag-row"><button class="button primary small" data-action="match-day-form">Edit plan</button><button class="button small" data-action="export-match-day">Export plan</button></div></div><div class="card"><div class="eyebrow">CHECKLIST + PRO-LEVEL READ</div><div class="checklist-list">${ds17MatchDayChecklist().map(([id,label])=>`<label class="match-check ${m.checked.includes(id)?'done':''}"><input type="checkbox" data-match-check="${id}" ${m.checked.includes(id)?'checked':''}><span>${esc(label)}</span></label>`).join('')}</div><div class="tip-cue" style="margin-top:14px">${esc(tip.cue)}</div><p>${scout?esc(scout.plan||scoutingPlan(scout)):'Use the first five rallies to identify return depth, third-ball preference, and speed-up direction.'}</p></div></div>`;
}

function renderLearn(){
  setHeader('Pro-Level Playbook','LEARN · APPLY · PROVE');
  const daily=ds17DailyTip(),saved=(state.savedTips||[]).map(id=>DS17_PRO_TIPS.find(t=>t.id===id)).filter(Boolean);
  const categories=['Recommended','Technique','Strategy','Doubles','Singles','Mental','Tournament','Saved'];
  let tips=ds17TipFilter==='Recommended'?ds17RecommendedTips().slice(0,8):ds17TipFilter==='Saved'?saved:DS17_PRO_TIPS.filter(t=>t.category===ds17TipFilter);
  const playbook=ds17StyleForProfile();
  $('#view').innerHTML=`
    <div class="hero pro-hero"><div class="hero-copy"><div class="eyebrow" style="color:var(--accent)">PERSONALIZED COACHING LIBRARY</div><h2>Pro-level habits.<br>Your next usable cue.</h2><p>Original coaching content organized around patterns used at high levels of play—personalized from your tracked weaknesses, goals, playing style, and readiness. It is not a quote library or athlete endorsement.</p><div class="hero-actions"><button class="button primary" data-tip-practice="${esc(daily.drill)}">Practice today’s cue</button><button class="button ghost" data-action="next-daily-tip">Show another cue</button></div></div><div class="hero-side"><div class="focus-card"><div class="eyebrow" style="color:var(--accent)">TODAY'S PRO-LEVEL CUE</div><div class="big">${esc(daily.title)}</div><p>${esc(daily.cue)}</p><div class="tag-row"><span class="pill good">${esc(daily.category)}</span><span class="pill">Matched to ${esc(focusRecommendation().title)}</span></div></div></div></div>
    ${sectionHead('COACHING CUE DECK','Filter advice, save what works, then prove it on court')}
    <div class="filter-row">${categories.map(cat=>`<button class="filter-chip ${ds17TipFilter===cat?'active':''}" data-tip-filter="${esc(cat)}">${esc(cat)}${cat==='Saved'?` (${saved.length})`:''}</button>`).join('')}</div>
    <div class="grid two pro-tip-grid">${tips.length?tips.map(ds17TipCard).join(''):empty('☆','No saved cues yet','Save a tip to build a focused personal cue deck.')}</div>
    ${sectionHead('STYLE BLUEPRINT',playbook.name,'<button class="button small" data-playbook="'+playbook.id+'">Open full playbook</button>')}
    <div class="grid three">${playbook.principles.map((principle,i)=>`<div class="card"><span class="feature-number">0${i+1}</span><h3>${i===0?'Create the pattern':i===1?'Protect the advantage':'Recover for the next ball'}</h3><p>${esc(principle)}</p><button class="button small" data-tip-practice="${esc(playbook.drills[i]||playbook.drills[0])}">Train it</button></div>`).join('')}</div>
    ${sectionHead('WATCH & LEARN','Official resources and professional match study')}
    <div class="grid three official-resource-grid">${DS17_OFFICIAL_RESOURCES.map(r=>`<article class="card official-resource"><div class="eyebrow">${esc(r.org)}</div><h3>${esc(r.title)}</h3><p>${esc(r.description)}</p><a class="button small" href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">Open official source ↗</a></article>`).join('')}</div>
    <div class="callout"><p><strong>How to use pro film:</strong> watch one point pattern at a time—ready position, contact choice, recovery, and the next ball—then turn it into one measurable court challenge. External resources open on their official sites; DinkSense does not copy or imply endorsement by individual professionals.</p></div>
    ${sectionHead('MATCH DAY SYSTEM','Preparation connected to readiness, tactics, and scouting')}
    ${ds17MatchDayMarkup()}
    ${adSlot('learn')}`;
}

const DS17_BASE_DISCOVER = renderDiscover;
renderDiscover = function(){
  setHeader('Court Discovery','GOOGLE MAPS COURT FINDER');
  const d=ds17CourtDiscovery(),query=ds17CourtQuery(),mapsUrl=ds17GoogleMapsUrl(),embedUrl=ds17GoogleEmbedUrl();
  const saved=state.courts.length?state.courts.map(c=>`<div class="list-item"><div><strong>${esc(c.name)}</strong><div class="meta">${esc(c.address||'Saved favorite')} · ${c.courts||1} courts · ${esc(c.surface||'Surface unknown')}</div></div><div class="tag-row"><span class="pill ${c.crowd==='Open'?'good':c.crowd==='Busy'?'bad':'warn'}">${esc(c.crowd||'Unknown')}</span><button class="button small" data-edit-court="${c.id}">Update memory</button></div></div>`).join(''):empty('☆','No favorites saved','Google Maps discovery works without saving anything. Favorites are optional for personal notes and crowd memory.');
  $('#view').innerHTML=`
    <div class="card map-search-card"><div class="map-search-copy"><div class="eyebrow">LIVE GOOGLE MAPS SEARCH</div><h2>Find real pickleball courts near you</h2><p>Use your current location or search a city/ZIP. No manual court log is required to discover facilities, ratings, hours, photos, or directions in Google Maps.</p></div><form id="ds17-map-search" class="map-search-form"><input name="place" value="${esc(d.place||'')}" placeholder="City, ZIP, or neighborhood"><button class="button primary">Search</button><button class="button secondary" type="button" data-action="maps-location">Use my location</button></form></div>
    <div class="map-filter-row">${Object.entries(DS17_MAP_FILTERS).map(([id,label])=>`<button class="filter-chip ${d.filter===id?'active':''}" data-map-filter="${id}">${esc(label.replace(/pickleball /i,''))}</button>`).join('')}</div>
    <div class="google-map-shell"><div class="google-map-toolbar"><div><strong>${esc(ds17CourtSearchLabel())}</strong><span>${esc(query)}</span></div><a class="button primary small" href="${esc(mapsUrl)}" target="_blank" rel="noopener">Open full Google Maps ↗</a></div><iframe class="google-map-frame" title="Google Maps pickleball court search" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="${esc(embedUrl)}"></iframe><div class="map-privacy">Google Maps is an online service. Loading this map or opening the search sends the search/location query to Google. DinkSense itself does not upload your match, health, or training data.</div></div>
    <div class="grid dashboard-grid" style="margin-top:18px"><div class="card" id="weather-card"><div class="weather-box"><div><div class="eyebrow">OUTDOOR PLAY ADVISORY</div><h2>${navigator.onLine?'Live conditions ready':'Offline mode'}</h2><p>${navigator.onLine?'Check current temperature, apparent temperature, wind speed, and wind direction before choosing an outdoor court.':'Google Maps and weather need a connection; saved favorites remain available.'}</p></div><div class="weather-temp">☀</div></div><button class="button small" data-action="weather">Check current conditions</button></div><div class="card accent"><div class="eyebrow">SMART COURT DECISION</div><h2>${new Date().getHours()<11?'Morning play window':new Date().getHours()>17?'Evening play window':'Heat + crowd check'}</h2><p>${new Date().getHours()<11?'Look for courts with an east–west orientation note and prepare for low sun during early points.':new Date().getHours()>17?'Prioritize lighting, wind exposure, and posted closing hours before leaving.':'Hard surfaces can retain heat. Check live temperature, shade, hydration access, and indoor alternatives.'}</p><a class="button dark small" href="${esc(mapsUrl)}" target="_blank" rel="noopener">Compare nearby options</a></div></div>
    ${sectionHead('OPTIONAL COURT MEMORY','Save only the places you want to remember','<button class="button primary" data-action="add-court">+ Save favorite</button>')}
    <div class="card"><div class="list">${saved}</div></div>
    ${sectionHead('DISCOVERY POWER TOOLS','Faster decisions before you leave')}
    <div class="grid three"><div class="card"><h3>Indoor fallback</h3><p>Switch to the Indoor filter when wind, heat, rain, or darkness makes outdoor play less useful.</p><button class="button small" data-map-filter="indoor">Find indoor courts</button></div><div class="card"><h3>Open-play search</h3><p>Search Google Maps for facilities and organizations that advertise pickleball open play.</p><button class="button small" data-map-filter="openplay">Find open play</button></div><div class="card"><h3>Route-ready</h3><p>Open the full Maps result to compare reviews, hours, photos, traffic, and turn-by-turn directions.</p><a class="button small" href="${esc(mapsUrl)}" target="_blank" rel="noopener">Open Maps</a></div></div>
    ${adSlot('discover')}`;
};

const DS17_BASE_FOUNDER = renderFounder;
renderFounder = function(){
  setHeader('About the Founder','BUILT FROM REAL COMPETITION');
  $('#view').innerHTML=`
    <div class="hero founder-hero" style="min-height:470px"><div class="hero-copy"><div class="eyebrow" style="color:var(--accent)">FOUNDER · ATHLETE · BUILDER</div><h2>Shriyan<br>Avadhanula</h2><p>DinkSense was created from the perspective of a competitive player who wanted more than a rating number—an app that explains the game and turns every match into a smarter next step.</p><div class="tag-row"><span class="pill good">4.5 singles competitor</span><span class="pill">IB MYP student</span><span class="pill dark">Founder & builder</span></div></div><div class="hero-side founder-photo-frame"><img id="ds17-founder-photo" src="${DS17_FOUNDER_PHOTO}" alt="Shriyan Avadhanula" decoding="async"><div class="founder-photo-caption">Bundled asset: <code>shriyan-avadhanula-founder.png</code></div></div></div>
    ${sectionHead('THE STORY','Why DinkSense exists')}
    <div class="grid dashboard-grid"><div class="card"><h2>Built by Shriyan Avadhanula</h2><p>Shriyan is a 10th-grade IB MYP student at Henrico High School in Richmond, Virginia, with a 3.95 GPA and interests spanning finance, cybersecurity, and software development.</p><p>He has extensive competitive pickleball experience, including competing at the 4.5 singles level, and has independently secured sponsorships with major brands including Paddletek and Franklin, among others.</p><p>DinkSense grew out of his own experience as a competitive player: tracking improvement was fragmented, generic advice was disconnected from real performance, and junior athletes lacked a complete way to present verified progress. He designed this system to support his own pickleball journey and to give players at every level—not only elite competitors—practical tools to understand and improve their game.</p></div><div class="grid"><div class="card accent"><div class="eyebrow">CORE BELIEF</div><h2>“Don’t just track the rating. Explain the game.”</h2></div><div class="card"><div class="eyebrow">FOUNDER HIGHLIGHTS</div><div class="list"><div class="list-item"><strong>Competitive level</strong><span class="pill dark">4.5 singles</span></div><div class="list-item"><strong>Independent sponsorships</strong><span class="pill good">Paddletek · Franklin</span></div><div class="list-item"><strong>Academic program</strong><span class="pill">IB MYP</span></div><div class="list-item"><strong>Product role</strong><span class="pill">Founder & builder</span></div></div></div></div></div>
    ${sectionHead('FOUNDER JOURNEY','Athlete insight turned into product design')}
    <div class="grid three"><div class="card"><h3>Compete</h3><p>Real match-play experience revealed that improvement was too often reduced to a single rating number.</p></div><div class="card"><h3>Analyze</h3><p>DinkSense connects the AI coach, match logs, roadmap, health, gear, discovery, and motion intelligence through one athlete profile.</p></div><div class="card"><h3>Present</h3><p>The public-profile and sponsorship tools help ambitious juniors show progress with evidence, not hype.</p></div></div>
    ${sectionHead('PRODUCT PHILOSOPHY','One coherent athlete-intelligence system')}
    <div class="grid three"><div class="card"><h3>Useful for one player</h3><p>No core feature depends on friends joining. Your data alone creates value.</p></div><div class="card"><h3>Local-first by design</h3><p>Private logs, videos, goals, motion grades, and coaching patterns remain under the player’s control.</p></div><div class="card"><h3>Ambitious, but honest</h3><p>Working features are labeled clearly; external integrations are never faked.</p></div></div>`;
  const img=$('#ds17-founder-photo');
  img?.addEventListener('error',()=>{img.closest('.founder-photo-frame').innerHTML=`<div class="founder-photo-error"><strong>Founder image could not load.</strong><span>Confirm that <code>assets/shriyan-avadhanula-founder.png</code> was uploaded with the website files, then hard-refresh the page.</span></div>`;});
};

const DS17_BASE_DASHBOARD = renderDashboard;
renderDashboard = function(){
  DS17_BASE_DASHBOARD();
  const view=$('#view'),ad=view.querySelector('.ad-unit,.ad-slot');
  const tip=ds17DailyTip(),m=ds17MatchDay();
  const block=document.createElement('div');
  block.className='ds17-dashboard-polish';
  block.innerHTML=`${sectionHead('SMARTER NEXT ACTIONS','Court, coaching, and competition in one glance')}<div class="grid three"><div class="card"><div class="eyebrow">PRO-LEVEL CUE</div><h3>${esc(tip.title)}</h3><p>${esc(tip.cue)}</p><button class="button small" data-nav="learn">Open Playbook</button></div><div class="card"><div class="eyebrow">GO PLAY</div><h3>Google Maps court finder</h3><p>Search actual nearby pickleball courts, indoor options, public courts, and open play without logging a court first.</p><button class="button small" data-nav="discover">Find courts</button></div><div class="card ${m.name?'accent':''}"><div class="eyebrow">MATCH DAY</div><h3>${esc(m.name||'Build your command center')}</h3><p>${m.name?`${m.date?fmtDate(m.date):'Date TBD'} · readiness ${healthScore().score}/100`:'Create a timeline, checklist, tactical cue, and scouting plan.'}</p><button class="button ${m.name?'dark':'small'}" data-nav="learn">${m.name?'Open plan':'Set it up'}</button></div></div>`;
  if(ad)view.insertBefore(block,ad);else view.appendChild(block);
};

const DS17_BASE_VIDEO = renderVideo;
renderVideo = function(){
  DS17_BASE_VIDEO();
  const oldCards=$$('.section-head').find(h=>h.querySelector('.eyebrow')?.textContent.trim()==='PHASED VISION');
  if(oldCards){
    oldCards.querySelector('.eyebrow').textContent='VISION STATUS';
    oldCards.querySelector('h2').textContent='Working motion intelligence, clearly separated from future ball tracking';
    const grid=oldCards.nextElementSibling;
    if(grid)grid.innerHTML=`<div class="card"><span class="pill good">Functional</span><h3 style="margin-top:12px">Pose + hand grading</h3><p>MediaPipe body landmarks, optional hand landmarks, animated shot references, rep detection, component grades, and voice cues run on-device.</p></div><div class="card"><span class="pill good">Functional</span><h3 style="margin-top:12px">Replay + progression</h3><p>Skeleton-only Smart Replay, Shot Passport mastery, custom motion capture, reaction training, and Court IQ results save locally.</p></div><div class="card"><span class="pill warn">Future specialist model</span><h3 style="margin-top:12px">Ball + court tracking</h3><p>Automatic ball trajectory, bounce location, and shot classification still require a dedicated sport-specific model and calibration.</p></div>`;
  }
};

const DS17_BASE_SETTINGS = renderSettings;
renderSettings = function(){
  DS17_BASE_SETTINGS();
  const view=$('#view'),config=ds17AdsConfig(),live=Boolean(config.enabled&&ds17IsRealAdValue(config.client));
  view.insertAdjacentHTML('beforeend',`${sectionHead('PUBLIC INTEGRATIONS','Google Maps, founder asset, and AdSense readiness')}<div class="grid three"><div class="card"><div class="eyebrow">GOOGLE MAPS DISCOVERY</div><h3>No API key required for search links</h3><p>DinkSense builds a Google Maps search from a city/ZIP or browser location. Discovery works without manually saving courts.</p><button class="button small" data-nav="discover">Open court finder</button></div><div class="card"><div class="eyebrow">FOUNDER PHOTO</div><h3>Bundled and cache-safe</h3><p>The founder page ignores old browser photo settings and loads the exact project asset:</p><div class="codebox">assets/shriyan-avadhanula-founder.png</div></div><div class="card"><div class="eyebrow">GOOGLE ADSENSE</div><h3>${live?'Configured':'Placement-ready'}</h3><p>${live?'Approved publisher and slot IDs are configured. Ads can render only in labeled, non-core spaces.':'Edit adsense-config.js after site approval. Placeholders stay away from match logging, coaching chat, and live form grading.'}</p><span class="pill ${live?'good':'warn'}">${live?'Live configuration':'IDs required'}</span></div></div>`);
};

const DS17_BASE_LOCAL_COACH = localCoachAnswer;
localCoachAnswer = function(question){
  const q=String(question||'').toLowerCase();const tip=ds17DailyTip();
  if(q.includes('pro tip')||q.includes('tip')||q.includes('advice')||q.includes('playbook'))return `${tip.title}: ${tip.cue} ${tip.why} Court challenge: ${tip.challenge}`;
  if(q.includes('court')||q.includes('where should i play')||q.includes('nearby'))return `Open Discover and choose “Use my location.” DinkSense will create a live Google Maps search for ${DS17_MAP_FILTERS[ds17CourtDiscovery().filter]||'pickleball courts'}, while your private athlete data remains in this browser.`;
  if(q.includes('match day')||q.includes('prepare for my match'))return ds17MatchPlanText();
  return DS17_BASE_LOCAL_COACH(question);
};

const DS17_BASE_OPEN_COACH = openCoach;
openCoach = function(){
  DS17_BASE_OPEN_COACH();
  $('#coach-suggestions').innerHTML=['What pro-level cue fits me?','Find courts near me','Build my match-day plan','What should I do today?'].map(s=>`<button>${esc(s)}</button>`).join('');
  $$('#coach-suggestions button').forEach(b=>b.onclick=()=>sendCoach(b.textContent));
};

const DS17_BASE_BIND = bindCommonActions;
bindCommonActions = function(){
  DS17_BASE_BIND();
  const mapForm=$('#ds17-map-search');if(mapForm)mapForm.addEventListener('submit',async e=>{e.preventDefault();const place=new FormData(e.currentTarget).get('place').trim();const d=ds17CourtDiscovery();d.place=place;d.lat='';d.lon='';d.updatedAt=new Date().toISOString();await saveState({quiet:true,skipAdapt:true});render();});
  $$('[data-action="maps-location"]').forEach(el=>el.onclick=ds17UseLocation);
  $$('[data-map-filter]').forEach(el=>el.onclick=()=>ds17SetCourtFilter(el.dataset.mapFilter));
  $$('[data-tip-filter]').forEach(el=>el.onclick=()=>{ds17TipFilter=el.dataset.tipFilter;render();});
  $$('[data-save-tip]').forEach(el=>el.onclick=async()=>{state.savedTips??=[];const id=el.dataset.saveTip;state.savedTips=state.savedTips.includes(id)?state.savedTips.filter(x=>x!==id):[...state.savedTips,id];await saveState({quiet:true,skipAdapt:true});toast(state.savedTips.includes(id)?'Cue saved':'Cue removed');render();});
  $$('[data-tip-practice]').forEach(el=>el.onclick=()=>viewDrill(el.dataset.tipPractice));
  $$('[data-copy-tip]').forEach(el=>el.onclick=async()=>{const t=DS17_PRO_TIPS.find(x=>x.id===el.dataset.copyTip);if(!t)return;try{await navigator.clipboard.writeText(`${t.title}: ${t.cue}`);toast('Cue copied');}catch{toast('Copy is unavailable in this browser');}});
  $$('[data-action="next-daily-tip"]').forEach(el=>el.onclick=async()=>{state.tipRotation=Number(state.tipRotation||0)+1;await saveState({quiet:true,skipAdapt:true});render();});
  $$('[data-action="match-day-form"]').forEach(el=>el.onclick=ds17MatchDayForm);
  $$('[data-match-check]').forEach(el=>el.onchange=async()=>{const m=ds17MatchDay(),id=el.dataset.matchCheck;m.checked=el.checked?[...new Set([...m.checked,id])]:m.checked.filter(x=>x!==id);await saveState({quiet:true,skipAdapt:true});el.closest('.match-check')?.classList.toggle('done',el.checked);});
  $$('[data-action="export-match-day"]').forEach(el=>el.onclick=()=>downloadBlob(new Blob([ds17MatchPlanText()],{type:'text/plain'}),`dinksense-match-day-${todayISO()}.txt`));
};

const DS17_BASE_RENDER = render;
render = function(){
  ds17AdCounter=0;
  if(currentView==='learn'){
    updateBadges();renderLearn();bindCommonActions();
  }else DS17_BASE_RENDER();
  window.setTimeout(ds17HydrateAds,0);
};

// Force the exact bundled founder path, migrating away from older local photo values.
document.addEventListener('DOMContentLoaded',()=>{
  window.setTimeout(async()=>{
    state.savedTips=Array.isArray(state.savedTips)?state.savedTips:[];
    state.matchDay={...structuredClone(DEFAULT_STATE.matchDay),...(state.matchDay||{}),checked:Array.isArray(state.matchDay?.checked)?state.matchDay.checked:[]};
    state.courtDiscovery={...structuredClone(DEFAULT_STATE.courtDiscovery),...(state.courtDiscovery||{})};
    state.founder={photo:'assets/shriyan-avadhanula-founder.png'};
    await saveState({quiet:true,skipAdapt:true});
    if(currentView==='founder')render();
  },0);
});
