/* DinkSense Motion Intelligence v1.6.0
   Requested four-feature suite:
   1) Form Match & Grade
   2) Smart Replay Coach
   3) Shot Progress Passport
   4) Custom Motion Studio

   Camera frames remain in memory. Replays store compact skeleton landmarks only.
*/
'use strict';

DEFAULT_STATE.formReplays = [];
state.formReplays ??= [];

const dspMergeStateBase = mergeState;
mergeState = function(saved){
  const merged = dspMergeStateBase(saved);
  merged.formReplays = Array.isArray(saved.formReplays) ? saved.formReplays : [];
  return merged;
};

let dspReplayRaf = null;
let dspRecordingCustom = false;

function dspSleep(ms){ return new Promise(resolve=>setTimeout(resolve,ms)); }
function dspDeepClone(value){ return JSON.parse(JSON.stringify(value)); }
function dspVisualPose(frame,mirror=true){
  const out={};
  Object.entries(frame||{}).forEach(([k,p])=>{out[k]={...p,x:mirror?1-Number(p.x):Number(p.x),y:Number(p.y),z:Number(p.z||0),visibility:Number(p.visibility??1)};});
  return out;
}
function dspResample(items,target=42){
  if(!items?.length)return [];
  if(items.length<=target)return dspDeepClone(items);
  return Array.from({length:target},(_,i)=>dspDeepClone(items[Math.round((i/(target-1))*(items.length-1))]));
}
function dspAverageComponents(frames){
  const buckets={};
  frames.forEach(f=>Object.entries(f.components||{}).forEach(([k,v])=>(buckets[k]??=[]).push(Number(v||0))));
  return Object.fromEntries(Object.entries(buckets).map(([k,v])=>[k,Math.round(mean(v))]));
}
function dspWorstComponent(components){
  return Object.entries(components||{}).sort((a,b)=>a[1]-b[1])[0]||null;
}
function dspFrameSnapshot(landmarks,shot,hand,mode){
  const handAngle=dsHandAngle(dsLatestHands,hand);
  const phase=dsClosestPhase(landmarks,shot,hand,mode,handAngle);
  const confidence=dsTrackingConfidence(landmarks);
  const score=Math.round(phase.score*(.75+Math.min(100,confidence)*.0025));
  return {
    pose:dsNormalizeCapturedPose(landmarks),
    score,
    phaseIndex:phase.index,
    components:dspDeepClone(phase.detail?.components||{}),
    feedback:dspDeepClone(phase.detail?.feedback||[]),
    confidence,
    at:performance.now()
  };
}

const dspResetBase = dsResetFormSession;
dsResetFormSession = function(){
  dspResetBase();
  if(!dsActiveFormSession)return;
  dsActiveFormSession.currentRepFrames=[];
  dsActiveFormSession.completedReps=[];
  dsActiveFormSession.repInProgress=false;
  dsActiveFormSession.lastSkeletonCapture=0;
};

const dspUpdateBase = dsUpdateFormScore;
dsUpdateFormScore = function(landmarks){
  if(!dsActiveFormSession)return dspUpdateBase(landmarks);
  const shot=dsGetShot($('#ds-shot-select').value),hand=$('#ds-hand').value,mode=$('#ds-mode').value;
  const snapshot=dspFrameSnapshot(landmarks,shot,hand,mode);
  const before=Number(dsActiveFormSession.reps||0);
  if(snapshot.phaseIndex>0&&!dsActiveFormSession.repInProgress){
    dsActiveFormSession.repInProgress=true;
    dsActiveFormSession.currentRepFrames=[];
  }
  if(dsActiveFormSession.repInProgress&&snapshot.pose&&performance.now()-Number(dsActiveFormSession.lastSkeletonCapture||0)>55){
    snapshot.t=performance.now()-Number(dsActiveFormSession.startedAt||performance.now());
    dsActiveFormSession.currentRepFrames.push(snapshot);
    dsActiveFormSession.lastSkeletonCapture=performance.now();
    if(dsActiveFormSession.currentRepFrames.length>180)dsActiveFormSession.currentRepFrames.shift();
  }
  dspUpdateBase(landmarks);
  if(Number(dsActiveFormSession.reps||0)>before){
    const repFrames=dspResample(dsActiveFormSession.currentRepFrames,42);
    const repScore=Number(dsActiveFormSession.repScores.at(-1)||Math.round(mean(repFrames.map(x=>x.score))||0));
    const components=dspAverageComponents(repFrames);
    const weakest=dspWorstComponent(components);
    const lowestFrame=[...repFrames].sort((a,b)=>a.score-b.score)[0];
    dsActiveFormSession.completedReps.push({
      id:uid('rep'),
      score:repScore,
      frames:repFrames,
      components,
      weakest:weakest?{key:weakest[0],score:weakest[1]}:null,
      feedback:lowestFrame?.feedback?.[0]||$('#ds-feedback')?.textContent||'Repeat the slowest checkpoint with a stable base.'
    });
    dsActiveFormSession.currentRepFrames=[];
    dsActiveFormSession.repInProgress=false;
  }
};

function dspBuildReplay(rep,session,label){
  return {
    id:uid('replay'),
    sessionId:session.id,
    shotId:session.shotId,
    shotName:session.shotName,
    handedness:session.handedness,
    mode:session.mode,
    label,
    score:Number(rep.score||0),
    frames:dspDeepClone(rep.frames||[]),
    components:dspDeepClone(rep.components||{}),
    weakest:dspDeepClone(rep.weakest||null),
    feedback:rep.feedback||'',
    date:session.date,
    createdAt:new Date().toISOString()
  };
}

const dspFinishBase = dsFinishFormSession;
dsFinishFormSession = async function(){
  const captured=dspDeepClone(dsActiveFormSession?.completedReps||[]);
  const previousIds=new Set((state.formSessions||[]).map(x=>x.id));
  await dspFinishBase();
  if(!captured.length)return;
  const session=(state.formSessions||[]).find(x=>!previousIds.has(x.id))||(state.formSessions||[])[0];
  if(!session)return;
  const sorted=[...captured].sort((a,b)=>b.score-a.score);
  const best=sorted[0],weakest=sorted.at(-1);
  const replays=[dspBuildReplay(best,session,'Best rep')];
  if(weakest&&weakest.id!==best.id)replays.push(dspBuildReplay(weakest,session,'Needs-work rep'));
  state.formReplays=[...replays,...(state.formReplays||[])].slice(0,80);
  session.replayIds=replays.map(x=>x.id);
  await saveState({quiet:true});
  const button=$('#dsp-open-session-replay');
  if(button){button.disabled=false;button.dataset.openReplay=session.id;button.textContent='Open smart replay';}
  toast(`${replays.length} skeleton replay${replays.length===1?'':'s'} saved locally`);
};

function dspDrawStageBackground(ctx,width,height,title){
  const grad=ctx.createLinearGradient(0,0,width,height);grad.addColorStop(0,'#10140f');grad.addColorStop(1,'#244334');ctx.fillStyle=grad;ctx.fillRect(0,0,width,height);
  ctx.strokeStyle='rgba(255,255,255,.07)';ctx.lineWidth=1;
  for(let x=0;x<width;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,height);ctx.stroke();}
  for(let y=0;y<height;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(width,y);ctx.stroke();}
  ctx.fillStyle='rgba(255,255,255,.72)';ctx.font='700 14px system-ui';ctx.fillText(title,16,24);
}
function dspDrawDifferenceLines(ctx,user,ref,width,height){
  ctx.save();ctx.strokeStyle='rgba(255,116,91,.44)';ctx.lineWidth=2;ctx.setLineDash([4,5]);
  DS_KEYS.forEach(k=>{if(!user?.[k]||!ref?.[k])return;ctx.beginPath();ctx.moveTo(user[k].x*width,user[k].y*height);ctx.lineTo(ref[k].x*width,ref[k].y*height);ctx.stroke();});
  ctx.restore();
}
function dspReplayChoices(target){
  const all=state.formReplays||[];
  if(!target)return all.slice(0,2);
  const direct=all.find(x=>x.id===target);if(direct)return all.filter(x=>x.sessionId===direct.sessionId);
  const bySession=all.filter(x=>x.sessionId===target);return bySession.length?bySession:all.slice(0,2);
}
function openSmartReplay(target=''){
  const choices=dspReplayChoices(target);
  if(!choices.length){
    modal(`<h2>Smart Replay Coach</h2><p>Complete at least one graded repetition in Form Match & Grade. DinkSense will automatically preserve the strongest and weakest skeleton replays.</p><div class="form-actions"><button class="button" onclick="document.getElementById('modal').close()">Close</button><button class="button primary" id="dsp-start-form-empty">Start form session</button></div>`);
    $('#dsp-start-form-empty').onclick=()=>{closeModal();setTimeout(()=>openFormLab(),80);};return;
  }
  if(dspReplayRaf)cancelAnimationFrame(dspReplayRaf);
  modal(`<div class="vision-modal-head"><div><div class="eyebrow">SMART REPLAY COACH</div><h2>See exactly where the rep separated.</h2><p>Best and needs-work repetitions are saved as compact local skeleton data—not camera video.</p></div><span class="pill good">Local skeleton replay</span></div>
    <div class="replay-toolbar"><div class="field"><label>Replay</label><select id="dsp-replay-select">${choices.map(x=>`<option value="${x.id}">${esc(x.label)} · ${x.score}%</option>`).join('')}</select></div><div class="field"><label>Speed</label><select id="dsp-replay-speed"><option value=".25">0.25×</option><option value=".5" selected>0.5×</option><option value="1">1×</option></select></div><button class="button primary" id="dsp-replay-play">Pause</button><label class="check-row compact"><input id="dsp-replay-lines" type="checkbox" checked> Difference lines</label></div>
    <div class="replay-grid"><div class="vision-panel"><div class="vision-panel-head"><strong>Your rep</strong><span id="dsp-replay-score" class="pill"></span></div><canvas id="dsp-replay-user" width="420" height="520"></canvas></div><div class="vision-panel"><div class="vision-panel-head"><strong>Reference overlay</strong><span id="dsp-replay-phase" class="pill">Checkpoint</span></div><canvas id="dsp-replay-overlay" width="420" height="520"></canvas></div></div>
    <input id="dsp-replay-scrub" class="replay-scrub" type="range" min="0" max="100" value="0">
    <div class="grid two" style="margin-top:14px"><div class="card dark"><div class="eyebrow" style="color:var(--accent)">COACH CORRECTION</div><h3 id="dsp-replay-grade"></h3><p id="dsp-replay-feedback"></p></div><div class="card"><div class="eyebrow">COMPONENT MAP</div><div id="dsp-replay-components" class="component-bars"></div></div></div>`);
  const dialog=$('#modal');dialog.classList.add('vision-dialog');
  let replay=choices[0],index=0,playing=true,last=performance.now();
  function renderFrame(){
    const frames=replay.frames||[];if(!frames.length)return;
    index=clamp(index,0,frames.length-1);const f=frames[index],shot=dsGetShot(replay.shotId);const refBase=shot.frames[clamp(Number(f.phaseIndex||0),0,shot.frames.length-1)]||shot.frames[0];const ref=replay.handedness==='Left'?dsMirrorFrame(refBase):refBase;const user=dspVisualPose(f.pose,true);
    const userCanvas=$('#dsp-replay-user'),overlay=$('#dsp-replay-overlay');if(!userCanvas||!overlay)return;
    const u=userCanvas.getContext('2d'),o=overlay.getContext('2d');dspDrawStageBackground(u,userCanvas.width,userCanvas.height,replay.label);dspDrawStageBackground(o,overlay.width,overlay.height,shot.name);
    dsDrawSkeleton(u,user,userCanvas.width,userCanvas.height,{stroke:'#6be2bd',joint:'#fff',paddle:'#6be2bd',handedness:replay.handedness,lineWidth:6,radius:5});
    dsDrawSkeleton(o,ref,overlay.width,overlay.height,{stroke:'#dfff38',joint:'#dfff38',paddle:'#dfff38',alpha:.72,handedness:replay.handedness,lineWidth:7,radius:5});
    dsDrawSkeleton(o,user,overlay.width,overlay.height,{stroke:'#6be2bd',joint:'#fff',paddle:'#6be2bd',alpha:.88,handedness:replay.handedness,lineWidth:5,radius:4});
    if($('#dsp-replay-lines')?.checked)dspDrawDifferenceLines(o,user,ref,overlay.width,overlay.height);
    $('#dsp-replay-score').textContent=`${f.score}% frame`;$('#dsp-replay-score').className=`pill ${f.score>=80?'good':f.score>=60?'warn':'bad'}`;$('#dsp-replay-phase').textContent=`Checkpoint ${Number(f.phaseIndex||0)+1}`;$('#dsp-replay-grade').textContent=`${replay.label}: ${replay.score}% · ${dsGrade(replay.score)}`;$('#dsp-replay-feedback').textContent=f.feedback?.[0]||replay.feedback||'Match the highlighted reference checkpoint, then repeat at half speed.';
    $('#dsp-replay-components').innerHTML=Object.entries(f.components||replay.components||{}).slice(0,7).map(([k,v])=>`<div class="component-row"><span>${esc(dsComponentLabel(k))}</span><div class="progress"><span style="width:${v}%"></span></div><strong>${v}</strong></div>`).join('');
    $('#dsp-replay-scrub').value=frames.length>1?Math.round((index/(frames.length-1))*100):0;
  }
  function loop(now){
    if(!dialog.open)return;if(playing&&now-last>1000/(12*Number($('#dsp-replay-speed')?.value||.5))){index=(index+1)%Math.max(1,replay.frames.length);last=now;renderFrame();}dspReplayRaf=requestAnimationFrame(loop);
  }
  $('#dsp-replay-select').onchange=e=>{replay=choices.find(x=>x.id===e.target.value)||choices[0];index=0;renderFrame();};
  $('#dsp-replay-play').onclick=e=>{playing=!playing;e.currentTarget.textContent=playing?'Pause':'Play';};
  $('#dsp-replay-scrub').oninput=e=>{playing=false;$('#dsp-replay-play').textContent='Play';index=Math.round((Number(e.target.value)/100)*Math.max(0,replay.frames.length-1));renderFrame();};
  $('#dsp-replay-lines').onchange=renderFrame;
  dialog.addEventListener('close',()=>{dialog.classList.remove('vision-dialog');if(dspReplayRaf)cancelAnimationFrame(dspReplayRaf);dspReplayRaf=null;},{once:true});
  renderFrame();dspReplayRaf=requestAnimationFrame(loop);
}

function dspPassportStats(){
  return dsAllShots().map(shot=>{
    const sessions=(state.formSessions||[]).filter(x=>x.shotId===shot.id).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
    const reps=sessions.reduce((sum,x)=>sum+Number(x.reps||0),0),best=sessions.length?Math.max(...sessions.map(x=>Number(x.best||0))):0,avg=sessions.length?Math.round(mean(sessions.map(x=>Number(x.average||0)))):0;
    const recent=mean(sessions.slice(0,3).map(x=>Number(x.average||0))),older=mean(sessions.slice(3,6).map(x=>Number(x.average||0))),trend=sessions.length>=4?Math.round(recent-older):0;
    const mastery=Math.round(clamp(avg*.55+best*.25+Math.min(20,reps*1.35),0,100));
    const level=mastery>=90?'Elite':mastery>=78?'Match ready':mastery>=62?'Strong base':mastery>=42?'Developing':sessions.length?'Foundation':'Unstarted';
    const stamps=[];if(sessions.length)stamps.push('First grade');if(reps>=10)stamps.push('10 reps');if(sessions.length>=3)stamps.push('3 sessions');if(avg>=80)stamps.push('80 avg');if(best>=90)stamps.push('90 rep');if(trend>=5)stamps.push('Rising');
    return {shot,sessions,reps,best,avg,trend,mastery,level,stamps};
  });
}
function dspPassportNext(row){
  if(!row.sessions.length)return 'Complete five slow graded reps to establish a baseline.';
  if(row.reps<10)return `${10-row.reps} more graded rep${10-row.reps===1?'':'s'} to earn the 10-rep stamp.`;
  if(row.avg<70)return 'Repeat the lowest-scoring checkpoint at half speed until the average reaches 70%.';
  if(row.avg<80)return 'Move from practice tolerance to performance tolerance without losing your base.';
  if(row.best<90)return 'Chase one 90% rep, then prove it twice in the same session.';
  return 'Maintain 80%+ under performance tolerance and transfer the cue into match play.';
}
function dspPassportSummary(){
  const rows=dspPassportStats(),trained=rows.filter(x=>x.sessions.length),overall=trained.length?Math.round(mean(trained.map(x=>x.mastery))):0,best=[...trained].sort((a,b)=>b.mastery-a.mastery)[0],focus=[...trained].sort((a,b)=>a.mastery-b.mastery)[0];
  return {rows,trained,overall,best,focus,totalReps:trained.reduce((s,x)=>s+x.reps,0)};
}
function openShotPassport(){
  const summary=dspPassportSummary();
  modal(`<div class="vision-modal-head"><div><div class="eyebrow">SHOT PROGRESS PASSPORT</div><h2>Every mechanic gets its own development record.</h2><p>Mastery combines session averages, best repetitions, volume, and recent trend. It is a local coaching index—not an official rating.</p></div><span class="passport-seal">DS</span></div>
    <div class="grid four" style="margin-top:18px">${statCard(`${summary.trained.length}/${summary.rows.length}`,'Shots started')}${statCard(`${summary.overall}%`,'Overall mastery')}${statCard(summary.totalReps,'Graded reps')}${statCard(summary.best?.shot.name||'—','Strongest shot')}</div>
    <div class="passport-toolbar"><div class="field"><label>Show</label><select id="dsp-passport-filter"><option value="all">All mechanics</option><option value="trained">Started only</option><option value="focus">Needs focus</option><option value="mastered">Match ready+</option></select></div><button class="button" id="dsp-export-passport">Export passport</button><button class="button primary" id="dsp-passport-train-focus" ${summary.focus?'':'disabled'}>Train weakest started shot</button></div>
    <div id="dsp-passport-grid" class="passport-grid"></div>`);
  const dialog=$('#modal');dialog.classList.add('vision-dialog');dialog.addEventListener('close',()=>dialog.classList.remove('vision-dialog'),{once:true});
  function renderRows(){
    let rows=summary.rows;const filter=$('#dsp-passport-filter').value;if(filter==='trained')rows=rows.filter(x=>x.sessions.length);if(filter==='focus')rows=rows.filter(x=>x.sessions.length&&x.mastery<78).sort((a,b)=>a.mastery-b.mastery);if(filter==='mastered')rows=rows.filter(x=>x.mastery>=78).sort((a,b)=>b.mastery-a.mastery);
    $('#dsp-passport-grid').innerHTML=rows.map(r=>`<div class="passport-card ${r.mastery>=78?'mastered':''}"><div class="passport-card-head"><div><div class="eyebrow">${esc(r.shot.category)}</div><h3>${esc(r.shot.name)}</h3></div><div class="passport-score">${r.sessions.length?r.mastery:'—'}<small>${r.sessions.length?'mastery':'start'}</small></div></div><div class="progress"><span style="width:${r.mastery}%"></span></div><div class="passport-metrics"><span><strong>${r.avg||'—'}${r.avg?'%':''}</strong>average</span><span><strong>${r.best||'—'}${r.best?'%':''}</strong>best</span><span><strong>${r.reps}</strong>reps</span><span><strong>${r.trend?`${r.trend>0?'+':''}${r.trend}`:'—'}</strong>trend</span></div><div class="tag-row">${r.stamps.length?r.stamps.map(x=>`<span class="pill good">${esc(x)}</span>`).join(''):'<span class="pill">No stamps yet</span>'}</div><p>${esc(dspPassportNext(r))}</p><button class="button ${r.sessions.length?'secondary':'primary'} small" data-passport-train="${r.shot.id}">${r.sessions.length?'Train again':'Start baseline'}</button></div>`).join('')||empty('◎','Nothing in this filter','Choose another view or complete a form session.');
    $$('[data-passport-train]').forEach(el=>el.onclick=()=>{closeModal();setTimeout(()=>openFormLab(el.dataset.passportTrain),80);});
  }
  $('#dsp-passport-filter').onchange=renderRows;$('#dsp-passport-train-focus').onclick=()=>{if(!summary.focus)return;closeModal();setTimeout(()=>openFormLab(summary.focus.shot.id),80);};$('#dsp-export-passport').onclick=dspExportPassport;renderRows();
}
function dspExportPassport(){
  const p=state.profile,s=dspPassportSummary();
  const rows=s.rows.filter(x=>x.sessions.length).map(r=>`<tr><td>${esc(r.shot.name)}</td><td>${r.mastery}%</td><td>${r.avg}%</td><td>${r.best}%</td><td>${r.reps}</td><td>${esc(r.level)}</td></tr>`).join('');
  const html=`<!doctype html><meta charset="utf-8"><title>${esc(p.name)} — DinkSense Shot Passport</title><style>body{font-family:system-ui;margin:0;background:#f4f6f1;color:#10140f}.wrap{max-width:900px;margin:auto;padding:40px}.hero{background:#10140f;color:white;padding:34px;border-radius:24px}.hero b{color:#dfff38;font-size:3rem}table{width:100%;border-collapse:collapse;background:white;margin-top:20px;border-radius:18px;overflow:hidden}th,td{padding:13px;text-align:left;border-bottom:1px solid #e5e8e1}th{background:#eff3e9}.fine{color:#667063;font-size:.8rem}</style><div class="wrap"><div class="hero"><h1>${esc(p.name)}'s Shot Progress Passport</h1><b>${s.overall}%</b><p>${s.trained.length} mechanics started · ${s.totalReps} graded reps</p></div><table><thead><tr><th>Shot</th><th>Mastery</th><th>Average</th><th>Best</th><th>Reps</th><th>Level</th></tr></thead><tbody>${rows||'<tr><td colspan="6">No graded shots yet.</td></tr>'}</tbody></table><p class="fine">Generated locally by DinkSense. Mastery is a coaching index, not an official rating.</p></div>`;
  downloadBlob(new Blob([html],{type:'text/html'}),`${slug(p.name)}-dinksense-shot-passport.html`);toast('Shot Passport exported');
}

async function dspRecordCustomSequence(){
  if(dspRecordingCustom)return;
  if(!cameraStream||!dsLatestPose?.landmarks?.[0]){toast('Start the camera and step fully into frame first');return;}
  dspRecordingCustom=true;const button=$('#dsp-record-motion'),countdown=$('#ds-camera-countdown');if(button)button.disabled=true;
  try{
    for(let n=3;n>=1;n--){countdown.hidden=false;countdown.textContent=n;dsBeep(420+n*90,.07);await dspSleep(720);}countdown.textContent='REC';
    const captured=[],start=performance.now();let last=0;
    while(performance.now()-start<4200){
      if(performance.now()-last>100){const lm=dsLatestPose?.landmarks?.[0];if(lm){const normalized=dsNormalizeCapturedPose(lm);if(normalized)captured.push(normalized);}last=performance.now();}
      await dspSleep(30);
    }
    countdown.textContent='✓';await dspSleep(450);countdown.hidden=true;
    if(captured.length<5){toast('Not enough pose frames were visible. Keep your full body in frame and retry.');return;}
    dsCapturedFrames=dspResample(captured,8);dsRenderCaptured();toast('Motion captured as 8 reusable checkpoints');
  }finally{dspRecordingCustom=false;if(button)button.disabled=false;if(countdown)countdown.hidden=true;}
}

const dspOpenFormBase = openFormLab;
openFormLab = function(initialShot='serve'){
  dspOpenFormBase(initialShot);
  const customCard=$('#ds-captured-preview')?.closest('.card');
  if(customCard){
    const eyebrow=customCard.querySelector('.eyebrow'),title=customCard.querySelector('h3'),description=customCard.querySelector('p');
    if(eyebrow)eyebrow.textContent='CUSTOM MOTION STUDIO';if(title)title.textContent='Teach DinkSense a movement sequence';if(description)description.textContent='Capture checkpoints manually or record a four-second motion. DinkSense converts the movement into an animated local reference you can grade against.';
    const actions=customCard.querySelector('.tag-row');if(actions&&!$('#dsp-record-motion'))actions.insertAdjacentHTML('afterbegin','<button class="button dark" id="dsp-record-motion">● Record 4-second motion</button>');
    $('#dsp-record-motion').onclick=dspRecordCustomSequence;
  }
  const header=$('.vision-modal-head');if(header&&!$('#dsp-passport-inline'))header.insertAdjacentHTML('beforeend','<div class="tag-row motion-head-actions"><button class="button small" id="dsp-passport-inline">Shot Passport</button><button class="button small" id="dsp-open-session-replay" disabled>Replay after session</button></div>');
  $('#dsp-passport-inline').onclick=openShotPassport;$('#dsp-open-session-replay').onclick=e=>openSmartReplay(e.currentTarget.dataset.openReplay||'');
};
cameraLab = openFormLab;

function dspInjectMotionSuite(){
  const heads=$$('.section-head');
  const toolsHead=heads.find(h=>h.querySelector('.eyebrow')?.textContent.trim()==='FOUR NEW INTELLIGENCE TOOLS');
  if(toolsHead){
    toolsHead.querySelector('.eyebrow').textContent='MOTION INTELLIGENCE SUITE';toolsHead.querySelector('h2').textContent='Four connected features—from form to proof';
    const grid=toolsHead.nextElementSibling;
    if(grid)grid.innerHTML=`
      <button class="card interactive feature-card" data-action="camera-lab"><span class="feature-number">01</span><h3>Form Match & Grade</h3><p>Animated shot references, live 33-point pose and hand tracking, rep detection, component grades, voice feedback, and flick/roll mechanics.</p><span class="pill good">Live grading</span></button>
      <button class="card interactive feature-card" data-action="smart-replay"><span class="feature-number">02</span><h3>Smart Replay Coach</h3><p>Automatically keeps the best and weakest rep as local skeleton replays with slow motion, ghost overlays, difference lines, and exact corrections.</p><span class="pill good">Auto-saved</span></button>
      <button class="card interactive feature-card" data-action="shot-passport"><span class="feature-number">03</span><h3>Shot Progress Passport</h3><p>Separate mastery, personal bests, volume, trends, stamps, and next targets for every serve, dink, drive, drop, reset, roll, flick, volley, and overhead.</p><span class="pill good">Progress system</span></button>
      <button class="card interactive feature-card" data-action="custom-motion"><span class="feature-number">04</span><h3>Custom Motion Studio</h3><p>Record a four-second motion or capture key checkpoints, save it locally, and turn it into a reusable animated form model.</p><span class="pill good">Build your own</span></button>`;
    const bonus=document.createElement('div');bonus.innerHTML=`${sectionHead('BONUS PERFORMANCE LABS','Reaction speed and Court IQ')}<div class="grid two"><button class="card interactive" data-action="reaction-lab"><div class="eyebrow">REACTION + SPLIT STEP</div><h3>Train the first movement</h3><p>Randomized left, right, split, and hands-up cues measure response time, consistency, and personal bests.</p></button><button class="card interactive" data-action="decision-arena"><div class="eyebrow">COURT IQ ARENA</div><h3>Make the right choice faster</h3><p>Personalized tactical scenarios grade score awareness, geometry, patience, attack timing, and recovery.</p></button></div>`;
    grid?.after(...bonus.childNodes);
  }
  const videoHead=$$('.section-head').find(h=>h.querySelector('.eyebrow')?.textContent.trim()==='VIDEO LIBRARY');
  if(videoHead){
    const s=dspPassportSummary(),replays=(state.formReplays||[]).slice(0,4);
    const block=document.createElement('div');block.className='motion-dashboard-block';block.innerHTML=`${sectionHead('SHOT DEVELOPMENT','Your live motion evidence','<div class="tag-row"><button class="button secondary" data-action="smart-replay">Open replays</button><button class="button primary" data-action="shot-passport">Open passport</button></div>')}<div class="grid dashboard-grid"><div class="card accent"><div class="eyebrow">PASSPORT OVERVIEW</div><div class="split"><div><h2>${s.overall}% overall mastery</h2><p>${s.trained.length}/${s.rows.length} mechanics started · ${s.totalReps} graded reps</p></div><div class="passport-seal">DS</div></div><div class="progress"><span style="width:${s.overall}%"></span></div><p>${s.focus?`Current form priority: ${esc(s.focus.shot.name)} at ${s.focus.mastery}% mastery.`:'Complete a graded session to open your first passport stamp.'}</p></div><div class="card"><div class="card-head"><div><div class="eyebrow">SMART REPLAY VAULT</div><h2>Best vs. needs-work</h2></div><span class="pill">${state.formReplays?.length||0} saved</span></div><div class="list">${replays.length?replays.map(r=>`<div class="list-item"><div><strong>${esc(r.shotName)} · ${esc(r.label)}</strong><div class="meta">${fmtDate(r.date)} · skeleton-only local replay</div></div><button class="button small" data-open-replay="${r.id}">${r.score}% replay</button></div>`).join(''):empty('▶','No smart replays yet','Finish a form session with at least one complete repetition.')}</div></div></div>`;
    videoHead.before(block);
  }
}

const dspRenderVideoBase = renderVideo;
renderVideo = function(){dspRenderVideoBase();dspInjectMotionSuite();};

const dspBindBase = bindCommonActions;
bindCommonActions = function(){
  dspBindBase();
  $$('[data-action="smart-replay"]').forEach(el=>el.onclick=()=>openSmartReplay());
  $$('[data-action="shot-passport"]').forEach(el=>el.onclick=openShotPassport);
  $$('[data-action="custom-motion"]').forEach(el=>el.onclick=()=>{openFormLab();setTimeout(()=>$('#dsp-record-motion')?.scrollIntoView({behavior:'smooth',block:'center'}),120);});
  $$('[data-open-replay]').forEach(el=>el.onclick=()=>openSmartReplay(el.dataset.openReplay));
};

const dspCoachBase = localCoachAnswer;
localCoachAnswer = function(question){
  const q=String(question||'').toLowerCase(),passport=dspPassportSummary(),latestReplay=(state.formReplays||[])[0];
  if(q.includes('passport')||q.includes('mastery'))return passport.trained.length?`Your Shot Passport is ${passport.overall}% overall across ${passport.trained.length} started mechanics. Strongest: ${passport.best.shot.name} at ${passport.best.mastery}%. Priority: ${passport.focus.shot.name} at ${passport.focus.mastery}%. ${dspPassportNext(passport.focus)}`:'Complete five graded reps to create your first Shot Passport entry.';
  if(q.includes('replay')||q.includes('best rep')||q.includes('weakest rep'))return latestReplay?`Your latest saved replay is ${latestReplay.shotName} — ${latestReplay.label} at ${latestReplay.score}%. Main correction: ${latestReplay.feedback||'slow the lowest-scoring checkpoint and compare the ghost overlay.'}`:'Finish a complete graded repetition and DinkSense will automatically save a best/needs-work skeleton replay.';
  if(q.includes('custom motion')||q.includes('custom shot'))return `Open Custom Motion Studio, start the camera, and either capture 3–8 checkpoints or record a four-second sequence. It stays in this browser and becomes an animated shot you can grade against.`;
  return dspCoachBase(question);
};

function dspSyntheticFrames(shotId,baseScore=82,weak=false){
  const shot=dsGetShot(shotId),sequence=[];
  for(let segment=0;segment<shot.frames.length-1;segment++)for(let step=0;step<8;step++){
    const t=step/8,ref=dsInterpolateFrame(shot.frames[segment],shot.frames[segment+1],t),pose=dspDeepClone(ref);
    if(weak&&pose[16]){pose[16].y+=.06;pose[16].x-=.035;}if(weak&&pose[26])pose[26].x-=.035;
    sequence.push({pose,score:clamp(baseScore+(step%3)-2,0,100),phaseIndex:segment,components:{domElbow:weak?58:88,domShoulder:weak?64:86,knees:weak?70:84,stance:weak?73:87,wristHeight:weak?55:90,torso:82,balance:weak?61:89},feedback:[weak?'Raise the contact point and finish over a more balanced base.':'The contact window and balance match the reference well.'],confidence:94,t:sequence.length*80});
  }
  return sequence;
}
const dspDemoBase = generateDemoData;
generateDemoData = function(){
  dspDemoBase();
  const now=new Date().toISOString();
  state.formSessions=[
    {id:'demo-form-roll',date:daysAgo(1),createdAt:now,shotId:'forehand-roll',shotName:'Forehand roll',handedness:'Right',mode:'practice',reps:6,average:82,best:91,streak:3,feedback:'Stay lower through the finish and recover the paddle to center.'},
    {id:'demo-form-drop',date:daysAgo(4),createdAt:new Date(Date.now()-3*86400000).toISOString(),shotId:'third-drop',shotName:'Third-shot drop',handedness:'Right',mode:'practice',reps:5,average:74,best:84,streak:1,feedback:'Quiet the backswing and hold the lift through contact.'}
  ];
  state.formReplays=[
    {id:'demo-replay-best',sessionId:'demo-form-roll',shotId:'forehand-roll',shotName:'Forehand roll',handedness:'Right',mode:'practice',label:'Best rep',score:91,frames:dspSyntheticFrames('forehand-roll',91,false),components:{domElbow:90,domShoulder:88,knees:84,stance:89,wristHeight:93,torso:86,balance:91},feedback:'The upward paddle path and contact height match strongly.',date:daysAgo(1),createdAt:now},
    {id:'demo-replay-weak',sessionId:'demo-form-roll',shotId:'forehand-roll',shotName:'Forehand roll',handedness:'Right',mode:'practice',label:'Needs-work rep',score:63,frames:dspSyntheticFrames('forehand-roll',63,true),components:{domElbow:58,domShoulder:64,knees:70,stance:73,wristHeight:55,torso:82,balance:61},feedback:'Raise the contact point and finish over a more balanced base.',date:daysAgo(1),createdAt:now}
  ];
  state.formSessions[0].replayIds=['demo-replay-best','demo-replay-weak'];
  state.reactionSessions=[{id:'demo-react',date:daysAgo(2),createdAt:now,average:487,best:392,times:[520,446,392,501,462,601]}];
  state.decisionSessions=[{id:'demo-iq',date:daysAgo(3),createdAt:now,score:88,correct:7,total:8,bestStreak:5,averageDecisionMs:1840}];
};
