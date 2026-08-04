/* DinkSense Vision Lab v1.5.0
   Four connected local-first features:
   1) Form Match & Grade with MediaPipe pose + optional hand landmarks
   2) Custom Shot Builder
   3) Reaction & Split-Step Trainer
   4) Court IQ Decision Arena
*/
'use strict';

// Extend the app's existing local data model before init() loads saved state.
DEFAULT_STATE.formSessions = [];
DEFAULT_STATE.customShotTemplates = [];
DEFAULT_STATE.reactionSessions = [];
DEFAULT_STATE.decisionSessions = [];
state.formSessions ??= [];
state.customShotTemplates ??= [];
state.reactionSessions ??= [];
state.decisionSessions ??= [];

const dsOriginalMergeState = mergeState;
mergeState = function(saved){
  const merged = dsOriginalMergeState(saved);
  merged.formSessions = Array.isArray(saved.formSessions) ? saved.formSessions : [];
  merged.customShotTemplates = Array.isArray(saved.customShotTemplates) ? saved.customShotTemplates : [];
  merged.reactionSessions = Array.isArray(saved.reactionSessions) ? saved.reactionSessions : [];
  merged.decisionSessions = Array.isArray(saved.decisionSessions) ? saved.decisionSessions : [];
  return merged;
};

let dsPoseLandmarker = null;
let dsHandLandmarker = null;
let dsVisionModule = null;
let dsVisionLoading = null;
let dsVisionRaf = null;
let dsReferenceRaf = null;
let dsLatestPose = null;
let dsLatestHands = null;
let dsActiveFormSession = null;
let dsCapturedFrames = [];
let dsReactionState = null;

const DS_MP_VERSION = '0.10.35';
const DS_MP_MODULE = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${DS_MP_VERSION}/vision_bundle.mjs`;
const DS_MP_WASM = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${DS_MP_VERSION}/wasm`;
const DS_POSE_MODEL = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';
const DS_HAND_MODEL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

const DS_KEYS = [0,11,12,13,14,15,16,23,24,25,26,27,28];
const DS_CONNECTIONS = [[0,11],[0,12],[11,12],[11,13],[13,15],[12,14],[14,16],[11,23],[12,24],[23,24],[23,25],[25,27],[24,26],[26,28]];

function dsPt(x,y,z=0){ return {x,y,z,visibility:1}; }
function dsBaseFrame(){
  return {
    0:dsPt(.50,.10),11:dsPt(.43,.27),12:dsPt(.57,.27),13:dsPt(.38,.42),14:dsPt(.62,.42),15:dsPt(.37,.56),16:dsPt(.63,.56),
    23:dsPt(.46,.54),24:dsPt(.54,.54),25:dsPt(.43,.75),26:dsPt(.57,.75),27:dsPt(.40,.94),28:dsPt(.60,.94)
  };
}
function dsFrame(overrides={}){
  const f=dsBaseFrame();
  Object.entries(overrides).forEach(([k,v])=>{f[k]=dsPt(v[0],v[1],v[2]||0);});
  return f;
}
function dsMirrorFrame(frame){
  const swaps={11:12,12:11,13:14,14:13,15:16,16:15,23:24,24:23,25:26,26:25,27:28,28:27};
  const out={};
  Object.entries(frame).forEach(([k,p])=>{const target=swaps[k]||Number(k);out[target]=dsPt(1-p.x,p.y,p.z||0);});
  return out;
}

const DS_FRAMES = {
  ready: dsFrame(),
  lowReady: dsFrame({11:[.43,.29],12:[.57,.29],13:[.39,.43],14:[.61,.43],15:[.43,.50],16:[.57,.50],23:[.46,.57],24:[.54,.57],25:[.40,.73],26:[.60,.73],27:[.35,.94],28:[.65,.94]}),
  serveLoad: dsFrame({11:[.42,.28],12:[.58,.25],13:[.37,.43],14:[.68,.39],15:[.39,.59],16:[.75,.53],23:[.45,.55],24:[.55,.53],25:[.40,.75],26:[.59,.72],27:[.36,.94],28:[.66,.92]}),
  serveContact: dsFrame({11:[.44,.28],12:[.58,.25],13:[.40,.42],14:[.66,.34],15:[.41,.57],16:[.73,.25],23:[.47,.54],24:[.55,.52],25:[.43,.74],26:[.60,.71],27:[.40,.94],28:[.65,.91]}),
  serveFinish: dsFrame({11:[.44,.27],12:[.58,.29],13:[.42,.43],14:[.53,.41],15:[.41,.57],16:[.43,.30],23:[.47,.54],24:[.55,.55],25:[.45,.74],26:[.59,.74],27:[.42,.94],28:[.62,.94]}),
  driveLoad: dsFrame({11:[.42,.26],12:[.58,.28],13:[.38,.40],14:[.68,.39],15:[.42,.53],16:[.78,.46],23:[.45,.54],24:[.55,.56],25:[.39,.73],26:[.60,.72],27:[.34,.94],28:[.66,.93]}),
  driveContact: dsFrame({11:[.43,.28],12:[.57,.27],13:[.39,.43],14:[.64,.39],15:[.41,.57],16:[.72,.46],23:[.46,.55],24:[.54,.54],25:[.40,.73],26:[.60,.73],27:[.36,.94],28:[.65,.94]}),
  driveFinish: dsFrame({11:[.43,.28],12:[.57,.27],13:[.40,.43],14:[.51,.36],15:[.40,.57],16:[.39,.29],23:[.46,.54],24:[.54,.54],25:[.42,.73],26:[.58,.73],27:[.39,.94],28:[.61,.94]}),
  backhandLoad: dsFrame({11:[.43,.27],12:[.57,.28],13:[.38,.42],14:[.52,.38],15:[.37,.56],16:[.40,.46],23:[.46,.54],24:[.54,.55],25:[.41,.73],26:[.59,.73],27:[.37,.94],28:[.63,.94]}),
  backhandContact: dsFrame({11:[.43,.27],12:[.57,.28],13:[.38,.42],14:[.48,.39],15:[.37,.56],16:[.31,.42],23:[.46,.54],24:[.54,.55],25:[.41,.73],26:[.59,.73],27:[.37,.94],28:[.63,.94]}),
  backhandFinish: dsFrame({11:[.43,.27],12:[.57,.28],13:[.38,.42],14:[.49,.34],15:[.37,.56],16:[.28,.31],23:[.46,.54],24:[.54,.55],25:[.42,.73],26:[.58,.73],27:[.38,.94],28:[.62,.94]}),
  softLoad: dsFrame({11:[.43,.29],12:[.57,.29],13:[.39,.44],14:[.63,.44],15:[.43,.56],16:[.69,.57],23:[.46,.58],24:[.54,.58],25:[.39,.74],26:[.61,.74],27:[.34,.94],28:[.66,.94]}),
  softContact: dsFrame({11:[.43,.29],12:[.57,.29],13:[.39,.44],14:[.62,.43],15:[.43,.56],16:[.69,.49],23:[.46,.58],24:[.54,.58],25:[.39,.74],26:[.61,.74],27:[.34,.94],28:[.66,.94]}),
  softFinish: dsFrame({11:[.43,.29],12:[.57,.29],13:[.39,.44],14:[.59,.39],15:[.43,.56],16:[.62,.37],23:[.46,.58],24:[.54,.58],25:[.40,.74],26:[.60,.74],27:[.35,.94],28:[.65,.94]}),
  rollLoad: dsFrame({11:[.43,.29],12:[.57,.29],13:[.39,.44],14:[.65,.43],15:[.43,.56],16:[.70,.52],23:[.46,.58],24:[.54,.58],25:[.39,.74],26:[.61,.74],27:[.34,.94],28:[.66,.94]}),
  rollContact: dsFrame({11:[.43,.29],12:[.57,.29],13:[.39,.44],14:[.63,.40],15:[.43,.56],16:[.70,.39],23:[.46,.58],24:[.54,.58],25:[.39,.74],26:[.61,.74],27:[.34,.94],28:[.66,.94]}),
  rollFinish: dsFrame({11:[.43,.29],12:[.57,.29],13:[.39,.44],14:[.57,.34],15:[.43,.56],16:[.53,.23],23:[.46,.58],24:[.54,.58],25:[.40,.74],26:[.60,.74],27:[.35,.94],28:[.65,.94]}),
  flickLoad: dsFrame({11:[.43,.29],12:[.57,.29],13:[.39,.44],14:[.61,.39],15:[.43,.56],16:[.62,.36],23:[.46,.58],24:[.54,.58],25:[.39,.74],26:[.61,.74],27:[.34,.94],28:[.66,.94]}),
  flickContact: dsFrame({11:[.43,.29],12:[.57,.29],13:[.39,.44],14:[.62,.37],15:[.43,.56],16:[.66,.29],23:[.46,.58],24:[.54,.58],25:[.39,.74],26:[.61,.74],27:[.34,.94],28:[.66,.94]}),
  flickFinish: dsFrame({11:[.43,.29],12:[.57,.29],13:[.39,.44],14:[.58,.34],15:[.43,.56],16:[.53,.25],23:[.46,.58],24:[.54,.58],25:[.40,.74],26:[.60,.74],27:[.35,.94],28:[.65,.94]}),
  overheadLoad: dsFrame({11:[.43,.27],12:[.57,.27],13:[.39,.42],14:[.64,.18],15:[.40,.56],16:[.58,.07],23:[.46,.54],24:[.54,.54],25:[.40,.74],26:[.60,.73],27:[.36,.94],28:[.64,.94]}),
  overheadContact: dsFrame({11:[.43,.27],12:[.57,.27],13:[.39,.42],14:[.61,.16],15:[.40,.56],16:[.64,.03],23:[.46,.54],24:[.54,.54],25:[.41,.74],26:[.59,.73],27:[.37,.94],28:[.63,.94]}),
  overheadFinish: dsFrame({11:[.43,.27],12:[.57,.28],13:[.39,.42],14:[.53,.35],15:[.40,.56],16:[.43,.46],23:[.46,.54],24:[.54,.55],25:[.43,.74],26:[.57,.74],27:[.40,.94],28:[.60,.94]}),
  splitAir: dsFrame({11:[.43,.26],12:[.57,.26],13:[.38,.40],14:[.62,.40],15:[.40,.51],16:[.60,.51],23:[.46,.53],24:[.54,.53],25:[.43,.72],26:[.57,.72],27:[.43,.91],28:[.57,.91]}),
  splitLand: dsFrame({11:[.43,.30],12:[.57,.30],13:[.38,.43],14:[.62,.43],15:[.41,.51],16:[.59,.51],23:[.46,.59],24:[.54,.59],25:[.36,.75],26:[.64,.75],27:[.29,.94],28:[.71,.94]}),
  counterLoad: dsFrame({11:[.43,.29],12:[.57,.29],13:[.40,.39],14:[.60,.39],15:[.46,.35],16:[.54,.35],23:[.46,.57],24:[.54,.57],25:[.39,.74],26:[.61,.74],27:[.34,.94],28:[.66,.94]}),
  counterPunch: dsFrame({11:[.43,.29],12:[.57,.29],13:[.40,.39],14:[.62,.39],15:[.46,.35],16:[.69,.36],23:[.46,.57],24:[.54,.57],25:[.39,.74],26:[.61,.74],27:[.34,.94],28:[.66,.94]})
};

function dsShot(id,name,category,frameNames,cues,opts={}){
  return {id,name,category,frames:frameNames.map(x=>DS_FRAMES[x]),frameNames,cues,duration:opts.duration||3200,handTarget:opts.handTarget||null,emphasis:opts.emphasis||['domElbow','domShoulder','knees','stance','torso','wristHeight','balance']};
}
const DS_SHOTS = [
  dsShot('serve','Serve','Serve & return',['ready','serveLoad','serveContact','serveFinish','ready'],['Athletic base','Drop the paddle below the ball','Contact in front below waist','Finish across and recover'],{duration:3800,handTarget:40}),
  dsShot('return','Return of serve','Serve & return',['lowReady','driveLoad','driveContact','driveFinish','lowReady'],['Split before contact','Compact unit turn','Contact in front','Move through the return'],{duration:3400}),
  dsShot('forehand-drive','Forehand drive','Drives',['lowReady','driveLoad','driveContact','driveFinish','lowReady'],['Load outside leg','Create space from the ball','Drive through contact','Finish over opposite shoulder'],{duration:3300}),
  dsShot('backhand-drive','Backhand drive','Drives',['lowReady','backhandLoad','backhandContact','backhandFinish','lowReady'],['Turn shoulders early','Keep the paddle connected','Contact in front of lead hip','Extend then recover'],{duration:3400}),
  dsShot('third-drop','Third-shot drop','Soft game',['lowReady','softLoad','softContact','softFinish','lowReady'],['Stay low','Quiet backswing','Lift from legs and shoulder','Hold the finish'],{duration:3900}),
  dsShot('forehand-dink','Forehand dink','Soft game',['lowReady','softLoad','softContact','softFinish','lowReady'],['Wide stable base','Paddle below the ball','Contact ahead of knee','Recover before the bounce'],{duration:3600}),
  dsShot('backhand-dink','Backhand dink','Soft game',['lowReady','backhandLoad','backhandContact','backhandFinish','lowReady'],['Shoulders quiet','Compact preparation','Push through the target','Return paddle to center'],{duration:3600}),
  dsShot('forehand-roll','Forehand roll','Spin attacks',['lowReady','rollLoad','rollContact','rollFinish','lowReady'],['Stay under the ball','Elbow leads the path','Brush up through contact','Finish high without standing up'],{duration:3000,handTarget:65,emphasis:['domElbow','domShoulder','knees','wristHeight','handAngle','torso']}),
  dsShot('backhand-roll','Backhand roll','Spin attacks',['lowReady','backhandLoad','backhandContact','backhandFinish','lowReady'],['Create space near the hip','Keep elbow in front','Brush upward','Finish outside and reset'],{duration:3100,handTarget:115,emphasis:['domElbow','domShoulder','knees','wristHeight','handAngle','torso']}),
  dsShot('forehand-flick','Forehand flick','Spin attacks',['lowReady','flickLoad','flickContact','flickFinish','lowReady'],['Read a high ball','Keep preparation tiny','Accelerate late','Recover instantly'],{duration:2400,handTarget:55,emphasis:['domElbow','domShoulder','wristHeight','handAngle','balance']}),
  dsShot('backhand-flick','Backhand flick','Spin attacks',['lowReady','backhandLoad','backhandContact','backhandFinish','lowReady'],['Paddle head ready','Elbow stays in front','Short fast acceleration','Recover to center'],{duration:2500,handTarget:125,emphasis:['domElbow','domShoulder','wristHeight','handAngle','balance']}),
  dsShot('forehand-reset','Forehand reset','Resets',['lowReady','softLoad','softContact','softFinish','lowReady'],['Stop your feet first','Absorb pace with soft hands','Lift with margin','Stay balanced after contact'],{duration:3900}),
  dsShot('backhand-reset','Backhand reset','Resets',['lowReady','backhandLoad','backhandContact','backhandFinish','lowReady'],['Compact ready position','Paddle in front','Absorb rather than swing','Recover behind the ball'],{duration:3900}),
  dsShot('counter-volley','Counter volley','Hands battle',['lowReady','counterLoad','counterPunch','counterLoad','lowReady'],['Paddle up','Small shoulder turn','Punch through a short window','Re-center immediately'],{duration:2300}),
  dsShot('overhead','Overhead','Finishing',['ready','overheadLoad','overheadContact','overheadFinish','ready'],['Turn instead of backpedaling','Non-hitting side helps track','Contact high and in front','Land balanced and recover'],{duration:3600}),
  dsShot('split-step','Transition split step','Footwork',['ready','splitAir','splitLand','lowReady','ready'],['Move while the opponent prepares','Small athletic hop','Land as they contact','Push from a balanced base'],{duration:2700,emphasis:['knees','stance','torso','balance','shoulderTilt']})
];

function dsAllShots(){
  const custom=(state.customShotTemplates||[]).map(s=>({...s,category:'My shots',custom:true,duration:s.duration||3200,cues:s.cues||['Match each captured checkpoint'],emphasis:s.emphasis||['domElbow','domShoulder','knees','stance','torso','wristHeight','balance']}));
  return [...DS_SHOTS,...custom];
}
function dsGetShot(id){ return dsAllShots().find(x=>x.id===id)||DS_SHOTS[0]; }
function dsShotOptions(selected='serve'){
  const groups={};
  dsAllShots().forEach(s=>{(groups[s.category]??=[]).push(s);});
  return Object.entries(groups).map(([g,shots])=>`<optgroup label="${esc(g)}">${shots.map(s=>`<option value="${esc(s.id)}" ${s.id===selected?'selected':''}>${esc(s.name)}</option>`).join('')}</optgroup>`).join('');
}

function dsDistance(a,b){return Math.hypot((a.x||0)-(b.x||0),(a.y||0)-(b.y||0));}
function dsAngle(a,b,c){
  if(!a||!b||!c)return 0;
  const ab={x:a.x-b.x,y:a.y-b.y},cb={x:c.x-b.x,y:c.y-b.y};
  const den=Math.hypot(ab.x,ab.y)*Math.hypot(cb.x,cb.y);if(!den)return 0;
  return Math.acos(clamp((ab.x*cb.x+ab.y*cb.y)/den,-1,1))*180/Math.PI;
}
function dsCenter(a,b){return {x:(a.x+b.x)/2,y:(a.y+b.y)/2};}
function dsExtractFeatures(points,handedness='Right',handAngle=null){
  if(!points)return null;
  const dom=handedness==='Left'?{s:11,e:13,w:15,h:23,k:25,a:27}:{s:12,e:14,w:16,h:24,k:26,a:28};
  const non=handedness==='Left'?{s:12,e:14,w:16,h:24,k:26,a:28}:{s:11,e:13,w:15,h:23,k:25,a:27};
  const shoulderC=dsCenter(points[11],points[12]),hipC=dsCenter(points[23],points[24]);
  const shoulderW=Math.max(.04,dsDistance(points[11],points[12]));
  const torso=Math.max(.08,dsDistance(shoulderC,hipC));
  const sign=handedness==='Left'?-1:1;
  const torsoDx=shoulderC.x-hipC.x,torsoDy=hipC.y-shoulderC.y;
  const torsoTilt=Math.atan2(torsoDx,Math.max(.001,torsoDy))*180/Math.PI;
  const shoulderTilt=Math.atan2(points[12].y-points[11].y,points[12].x-points[11].x)*180/Math.PI;
  const ankleMid=dsCenter(points[27],points[28]);
  return {
    domElbow:dsAngle(points[dom.s],points[dom.e],points[dom.w]),
    nonElbow:dsAngle(points[non.s],points[non.e],points[non.w]),
    domShoulder:dsAngle(points[dom.e],points[dom.s],points[dom.h]),
    nonShoulder:dsAngle(points[non.e],points[non.s],points[non.h]),
    domKnee:dsAngle(points[dom.h],points[dom.k],points[dom.a]),
    nonKnee:dsAngle(points[non.h],points[non.k],points[non.a]),
    knees:(360-dsAngle(points[dom.h],points[dom.k],points[dom.a])-dsAngle(points[non.h],points[non.k],points[non.a]))/2,
    stance:dsDistance(points[27],points[28])/shoulderW,
    wristHeight:(points[dom.s].y-points[dom.w].y)/torso,
    wristAcross:sign*(points[dom.w].x-hipC.x)/shoulderW,
    reach:dsDistance(points[dom.s],points[dom.w])/torso,
    torso:Math.abs(torsoTilt),
    torsoSigned:torsoTilt,
    shoulderTilt:Math.abs(shoulderTilt),
    balance:Math.abs((points[0].x-ankleMid.x)/Math.max(.05,dsDistance(points[27],points[28]))),
    handAngle
  };
}
function dsHandAngle(result,handedness='Right'){
  if(!result?.landmarks?.length)return null;
  let idx=0;
  if(result.handedness?.length){
    const wanted=handedness.toLowerCase();
    const found=result.handedness.findIndex(x=>String(x?.[0]?.categoryName||'').toLowerCase()===wanted);
    if(found>=0)idx=found;
  }
  const hand=result.landmarks[idx];if(!hand?.[0]||!hand?.[9])return null;
  return (Math.atan2(hand[9].y-hand[0].y,hand[9].x-hand[0].x)*180/Math.PI+360)%180;
}
function dsMetricScore(live,ref,key,mode='practice'){
  if(live==null||ref==null||Number.isNaN(live)||Number.isNaN(ref))return null;
  const angleKeys=['domElbow','nonElbow','domShoulder','nonShoulder','domKnee','nonKnee','knees','torso','torsoSigned','shoulderTilt','handAngle'];
  const tol=angleKeys.includes(key)?(mode==='performance'?20:32):(mode==='performance'?.22:.34);
  let err=Math.abs(live-ref);
  if(key==='handAngle')err=Math.min(err,180-err);
  return Math.round(clamp(100-(err/tol)*48,0,100));
}
function dsScorePose(livePoints,refFrame,shot,handedness,mode,handAngle){
  const live=dsExtractFeatures(livePoints,handedness,handAngle);
  const ref=dsExtractFeatures(handedness==='Left'?dsMirrorFrame(refFrame):refFrame,handedness,shot.handTarget);
  if(!live||!ref)return {score:0,components:{},feedback:['Step fully into frame so your whole body is visible.']};
  const keys=shot.emphasis||['domElbow','domShoulder','knees','stance','torso','wristHeight','balance'];
  const components={};
  keys.forEach(k=>{const s=dsMetricScore(live[k],ref[k],k,mode);if(s!=null)components[k]=s;});
  const values=Object.values(components);const score=values.length?Math.round(mean(values)):0;
  const feedback=Object.entries(components).sort((a,b)=>a[1]-b[1]).slice(0,2).map(([k])=>dsFeedbackFor(k,live,ref,shot));
  return {score,components,feedback,live,ref};
}
function dsFeedbackFor(key,live,ref,shot){
  const cues={
    domElbow:live.domElbow<ref.domElbow?'Extend the hitting arm more through this checkpoint.':'Keep the hitting elbow more compact and connected.',
    nonElbow:'Use the non-hitting arm to stabilize your shoulders.',
    domShoulder:live.domShoulder<ref.domShoulder?'Let the shoulder open farther toward the contact path.':'Reduce the backswing and keep the swing in front.',
    nonShoulder:'Keep the non-hitting shoulder quieter and more balanced.',
    knees:live.knees<ref.knees?'Bend your knees more and stay down through contact.':'Use a slightly taller base without locking the knees.',
    stance:live.stance<ref.stance?'Widen your base for more balance.':'Bring the feet slightly closer so you can recover faster.',
    wristHeight:live.wristHeight<ref.wristHeight?'Raise the contact point and get the paddle working upward.':'Lower the contact path and avoid reaching above your ideal window.',
    wristAcross:live.wristAcross<ref.wristAcross?'Reach farther through the target line.':'Keep the contact closer to your body line.',
    reach:live.reach<ref.reach?'Create more extension at contact.':'Shorten the swing and stay compact.',
    torso:live.torso>ref.torso?'Keep your chest more centered instead of leaning.':'Allow a small athletic body angle toward the ball.',
    torsoSigned:'Keep your head and chest stacked over your base.',
    shoulderTilt:'Level the shoulders sooner during recovery.',
    balance:live.balance>ref.balance?'Finish over a balanced base and avoid falling away.':'Balance is close—recover the paddle to center faster.',
    handAngle:'Rotate the forearm and hand path closer to the animated reference.'
  };
  return cues[key]||shot.cues?.[1]||'Match the animated checkpoint more closely.';
}
function dsClosestPhase(points,shot,handedness,mode,handAngle){
  let best={index:0,score:-1,detail:null};
  shot.frames.forEach((f,i)=>{const d=dsScorePose(points,f,shot,handedness,mode,handAngle);if(d.score>best.score)best={index:i,score:d.score,detail:d};});
  return best;
}
function dsInterpolateFrame(a,b,t){
  const out={};DS_KEYS.forEach(k=>{const p=a[k],q=b[k];out[k]=dsPt(p.x+(q.x-p.x)*t,p.y+(q.y-p.y)*t,(p.z||0)+((q.z||0)-(p.z||0))*t);});return out;
}
function dsNormalizeCapturedPose(landmarks){
  const visible=DS_KEYS.map(k=>landmarks[k]).filter(Boolean);if(!visible.length)return null;
  const minX=Math.min(...visible.map(p=>p.x)),maxX=Math.max(...visible.map(p=>p.x));
  const minY=Math.min(...visible.map(p=>p.y)),maxY=Math.max(...visible.map(p=>p.y));
  const w=Math.max(.1,maxX-minX),h=Math.max(.2,maxY-minY);const out={};
  DS_KEYS.forEach(k=>{const p=landmarks[k];out[k]=dsPt(.18+((p.x-minX)/w)*.64,.06+((p.y-minY)/h)*.88,p.z||0);});
  return out;
}

function dsDrawSkeleton(ctx,points,width,height,opts={}){
  if(!points)return;
  const alpha=opts.alpha??1;const stroke=opts.stroke||'#dfff38';const joint=opts.joint||'#ffffff';
  ctx.save();ctx.globalAlpha=alpha;ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=opts.lineWidth||Math.max(3,width/130);ctx.strokeStyle=stroke;
  DS_CONNECTIONS.forEach(([a,b])=>{if(!points[a]||!points[b])return;ctx.beginPath();ctx.moveTo(points[a].x*width,points[a].y*height);ctx.lineTo(points[b].x*width,points[b].y*height);ctx.stroke();});
  ctx.fillStyle=joint;DS_KEYS.forEach(k=>{const p=points[k];if(!p)return;ctx.beginPath();ctx.arc(p.x*width,p.y*height,opts.radius||Math.max(3,width/100),0,Math.PI*2);ctx.fill();});
  const dom=opts.handedness==='Left'?15:16,elbow=opts.handedness==='Left'?13:14;
  if(points[dom]&&points[elbow]){
    const w=points[dom],e=points[elbow];const ang=Math.atan2(w.y-e.y,w.x-e.x);ctx.translate(w.x*width,w.y*height);ctx.rotate(ang+Math.PI/2);ctx.fillStyle=opts.paddle||'#6be2bd';ctx.fillRect(-width*.016,-height*.012,width*.032,height*.075);ctx.beginPath();ctx.ellipse(0,-height*.045,width*.045,height*.065,0,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
}
function dsDrawLivePose(ctx,landmarks,width,height,mirrored=true){
  if(!landmarks)return;
  const pts={};DS_KEYS.forEach(k=>{const p=landmarks[k];pts[k]={x:mirrored?1-p.x:p.x,y:p.y,z:p.z,visibility:p.visibility};});
  dsDrawSkeleton(ctx,pts,width,height,{stroke:'#6be2bd',joint:'#ffffff',alpha:.92,lineWidth:4,radius:4,handedness:state.profile.handedness});
}
function dsDrawReferenceCanvas(canvas,shot,handedness,speed=1,ghostCanvas=null){
  if(dsReferenceRaf)cancelAnimationFrame(dsReferenceRaf);
  const ctx=canvas.getContext('2d');const start=performance.now();
  const loop=now=>{
    if(!canvas.isConnected)return;
    const duration=shot.duration/Number(speed||1);const elapsed=((now-start)%duration+duration)%duration;const raw=(elapsed/duration)*(shot.frames.length-1);const i=clamp(Math.floor(raw),0,shot.frames.length-2);const t=clamp(raw-i,0,1);
    let frame=dsInterpolateFrame(shot.frames[i],shot.frames[i+1],t);if(handedness==='Left')frame=dsMirrorFrame(frame);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const grad=ctx.createLinearGradient(0,0,canvas.width,canvas.height);grad.addColorStop(0,'#10140f');grad.addColorStop(1,'#244334');ctx.fillStyle=grad;ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.strokeStyle='rgba(255,255,255,.09)';ctx.lineWidth=1;for(let x=0;x<canvas.width;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,canvas.height);ctx.stroke();}for(let y=0;y<canvas.height;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(canvas.width,y);ctx.stroke();}
    dsDrawSkeleton(ctx,frame,canvas.width,canvas.height,{stroke:'#dfff38',joint:'#fff',paddle:'#6be2bd',handedness,lineWidth:6,radius:5});
    ctx.fillStyle='#fff';ctx.font='700 16px system-ui';ctx.fillText(shot.cues[Math.min(i,shot.cues.length-1)]||shot.name,18,28);
    ctx.fillStyle='rgba(255,255,255,.65)';ctx.font='600 12px system-ui';ctx.fillText(`Checkpoint ${i+1}/${shot.frames.length-1}`,18,48);
    if(ghostCanvas){ghostCanvas.dataset.refFrame=JSON.stringify(frame);}
    dsReferenceRaf=requestAnimationFrame(loop);
  };dsReferenceRaf=requestAnimationFrame(loop);
}

async function dsEnsureVisionModels(statusEl){
  if(dsPoseLandmarker)return true;
  if(dsVisionLoading)return dsVisionLoading;
  dsVisionLoading=(async()=>{
    try{
      if(statusEl)statusEl.textContent='Loading on-device pose model…';
      dsVisionModule=await import(DS_MP_MODULE);
      const vision=await dsVisionModule.FilesetResolver.forVisionTasks(DS_MP_WASM);
      const createPose=delegate=>dsVisionModule.PoseLandmarker.createFromOptions(vision,{baseOptions:{modelAssetPath:DS_POSE_MODEL,delegate},runningMode:'VIDEO',numPoses:1,minPoseDetectionConfidence:.55,minPosePresenceConfidence:.55,minTrackingConfidence:.55});
      try{dsPoseLandmarker=await createPose('GPU');}catch(_){dsPoseLandmarker=await createPose('CPU');}
      try{
        dsHandLandmarker=await dsVisionModule.HandLandmarker.createFromOptions(vision,{baseOptions:{modelAssetPath:DS_HAND_MODEL,delegate:'GPU'},runningMode:'VIDEO',numHands:2,minHandDetectionConfidence:.45,minHandPresenceConfidence:.45,minTrackingConfidence:.45});
      }catch(err){console.warn('Hand tracking unavailable; pose grading still works.',err);dsHandLandmarker=null;}
      if(statusEl)statusEl.textContent=dsHandLandmarker?'33 body landmarks + hand rotation ready':'33 body landmarks ready · hand model unavailable';
      return true;
    }catch(err){
      console.error(err);if(statusEl)statusEl.textContent='Model could not load. Check your connection, then retry.';toast('Pose model could not load');return false;
    }finally{dsVisionLoading=null;}
  })();
  return dsVisionLoading;
}

function dsStopCameraOnly(){
  if(dsVisionRaf)cancelAnimationFrame(dsVisionRaf);dsVisionRaf=null;
  if(cameraStream)cameraStream.getTracks().forEach(t=>t.stop());cameraStream=null;
  dsLatestPose=null;dsLatestHands=null;
}
function dsStopVision(){
  dsStopCameraOnly();
  if(dsReferenceRaf)cancelAnimationFrame(dsReferenceRaf);dsReferenceRaf=null;
}
function dsSpeak(text){
  if(!('speechSynthesis' in window))return;window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.rate=1.05;u.pitch=1;window.speechSynthesis.speak(u);
}
function dsGrade(score){return score>=90?'Elite match':score>=80?'Excellent':score>=70?'Strong':score>=60?'Developing':score>=45?'Needs work':'Rebuild the checkpoint';}

function openFormLab(initialShot='serve'){
  const recent=(state.formSessions||[]).slice().sort((a,b)=>b.createdAt.localeCompare(a.createdAt)).slice(0,4);
  modal(`<div class="vision-modal-head"><div><div class="eyebrow">FORM MATCH & GRADE</div><h2>Pickleball Motion Studio</h2><p>Animated reference mechanics + live 33-point pose tracking. Camera frames stay on this device.</p></div><span class="pill good">On-device inference</span></div>
  <div class="vision-controls">
    <div class="field"><label>Shot</label><select id="ds-shot-select">${dsShotOptions(initialShot)}</select></div>
    <div class="field"><label>Handedness</label><select id="ds-hand"><option ${state.profile.handedness==='Right'?'selected':''}>Right</option><option ${state.profile.handedness==='Left'?'selected':''}>Left</option></select></div>
    <div class="field"><label>Scoring</label><select id="ds-mode"><option value="practice">Practice tolerance</option><option value="performance">Performance tolerance</option></select></div>
    <div class="field"><label>Animation speed</label><select id="ds-speed"><option value=".5">0.5×</option><option value=".75">0.75×</option><option value="1" selected>1×</option><option value="1.25">1.25×</option></select></div>
  </div>
  <div class="vision-grid">
    <div class="vision-panel"><div class="vision-panel-head"><strong>Animated reference</strong><span id="ds-ref-phase" class="pill">Looping form</span></div><canvas id="ds-reference" width="420" height="520"></canvas><div class="tag-row"><button class="button small" id="ds-toggle-ghost">Ghost overlay: On</button><button class="button small" id="ds-mirror-ref">Mirror hand</button></div></div>
    <div class="vision-panel"><div class="vision-panel-head"><strong>Live form mirror</strong><span id="ds-model-status" class="pill warn">Camera off</span></div><div class="live-pose-stage"><video id="ds-pose-video" autoplay muted playsinline></video><canvas id="ds-live-canvas" width="960" height="720"></canvas><div id="ds-camera-countdown" class="camera-countdown" hidden>3</div></div><div class="tag-row"><button class="button primary" id="ds-start-form">Start camera</button><button class="button" id="ds-stop-form" disabled>Finish session</button><label class="check-row compact"><input id="ds-voice" type="checkbox"> Voice coach</label></div></div>
  </div>
  <div class="vision-score-grid">
    <div class="vision-score primary"><strong id="ds-live-score">—</strong><span>Live match</span></div><div class="vision-score"><strong id="ds-reps">0</strong><span>Graded reps</span></div><div class="vision-score"><strong id="ds-average">—</strong><span>Average</span></div><div class="vision-score"><strong id="ds-streak">0</strong><span>80+ streak</span></div><div class="vision-score"><strong id="ds-confidence">—</strong><span>Tracking confidence</span></div>
  </div>
  <div class="grid two" style="margin-top:14px"><div class="card dark"><div class="eyebrow" style="color:var(--accent)">LIVE FEEDBACK</div><h3 id="ds-grade">Stand fully in frame</h3><p id="ds-feedback">The model grades joint angles, stance, knee bend, torso position, balance, contact height, recovery, and—when visible—hand/forearm orientation for rolls and flicks.</p><div id="ds-components" class="component-bars"></div></div><div class="card"><div class="eyebrow">SHOT CHECKPOINTS</div><ol id="ds-cues" class="cue-list"></ol></div></div>
  <div class="card soft" style="margin-top:14px"><div class="card-head"><div><div class="eyebrow">CUSTOM SHOT BUILDER</div><h3>Capture your own ideal sequence</h3><p>Capture 3–8 keyframes from the live camera, name the sequence, and drill it like any built-in shot.</p></div><span class="pill" id="ds-capture-count">0 frames</span></div><div class="tag-row"><button class="button secondary" id="ds-capture-frame" disabled>Capture current pose</button><button class="button" id="ds-clear-frames" disabled>Clear</button><button class="button primary" id="ds-save-custom" disabled>Save custom shot</button></div><div id="ds-captured-preview" class="captured-strip"></div></div>
  ${recent.length?`<div class="card" style="margin-top:14px"><div class="eyebrow">RECENT FORM SESSIONS</div><div class="list">${recent.map(s=>`<div class="list-item"><div><strong>${esc(s.shotName)}</strong><div class="meta">${fmtDate(s.date)} · ${s.reps} reps · best ${s.best}%</div></div><span class="pill ${s.average>=80?'good':s.average>=60?'warn':'bad'}">${s.average}% avg</span></div>`).join('')}</div></div>`:''}
  <div class="callout" style="margin-top:14px"><p><strong>Accuracy note:</strong> this is coaching feedback from a single-phone view, not a laboratory biomechanical assessment. Paddle-face and ball flight cannot be measured perfectly unless they are clearly visible and a specialized object model is added.</p></div>`);

  const dialog=$('#modal');dialog.classList.add('vision-dialog');
  const cleanup=()=>{dialog.classList.remove('vision-dialog');dsStopVision();};dialog.addEventListener('close',cleanup,{once:true});
  dsCapturedFrames=[];dsActiveFormSession=null;
  const refreshReference=()=>{
    const shot=dsGetShot($('#ds-shot-select').value),hand=$('#ds-hand').value,speed=$('#ds-speed').value;
    dsDrawReferenceCanvas($('#ds-reference'),shot,hand,speed,$('#ds-live-canvas'));
    $('#ds-cues').innerHTML=shot.cues.map((c,i)=>`<li><span>${i+1}</span>${esc(c)}</li>`).join('');
  };
  refreshReference();
  $('#ds-shot-select').onchange=()=>{refreshReference();dsResetFormSession();};
  $('#ds-hand').onchange=refreshReference;$('#ds-speed').onchange=refreshReference;
  $('#ds-mirror-ref').onclick=()=>{$('#ds-hand').value=$('#ds-hand').value==='Right'?'Left':'Right';refreshReference();};
  $('#ds-toggle-ghost').onclick=e=>{const on=e.currentTarget.dataset.on!=='false';e.currentTarget.dataset.on=String(!on);e.currentTarget.textContent=`Ghost overlay: ${on?'Off':'On'}`;};
  $('#ds-start-form').onclick=dsStartFormCamera;$('#ds-stop-form').onclick=dsFinishFormSession;
  $('#ds-capture-frame').onclick=dsCaptureCurrentFrame;$('#ds-clear-frames').onclick=()=>{dsCapturedFrames=[];dsRenderCaptured();};$('#ds-save-custom').onclick=dsSaveCustomShot;
}

function dsResetFormSession(){
  dsActiveFormSession={startedAt:performance.now(),scores:[],repScores:[],reps:0,streak:0,best:0,lastPhase:0,maxPhase:0,lastRepAt:0,frameScores:[],feedback:[]};
  ['ds-live-score','ds-average','ds-confidence'].forEach(id=>{const el=$(`#${id}`);if(el)el.textContent='—';});
  ['ds-reps','ds-streak'].forEach(id=>{const el=$(`#${id}`);if(el)el.textContent='0';});
}
async function dsStartFormCamera(){
  const status=$('#ds-model-status');if(!status)return;
  const ready=await dsEnsureVisionModels(status);if(!ready)return;
  try{
    dsStopCameraOnly();
    cameraStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:1280},height:{ideal:720}},audio:false});
    const video=$('#ds-pose-video');video.srcObject=cameraStream;await video.play();
    dsResetFormSession();$('#ds-start-form').disabled=true;$('#ds-stop-form').disabled=false;$('#ds-capture-frame').disabled=false;status.textContent='Tracking live';status.className='pill good';
    dsRunFormLoop(video,$('#ds-live-canvas'));
  }catch(err){status.textContent='Camera unavailable';status.className='pill bad';toast(`Camera unavailable: ${err.message}`);}
}
function dsRunFormLoop(video,canvas){
  const ctx=canvas.getContext('2d');let lastVideoTime=-1,lastDetect=0;
  const loop=now=>{
    if(!cameraStream||!canvas.isConnected)return;
    const rect=canvas.getBoundingClientRect();const ratio=video.videoWidth&&video.videoHeight?video.videoWidth/video.videoHeight:4/3;canvas.width=Math.max(640,Math.round(rect.width*devicePixelRatio));canvas.height=Math.round(canvas.width/ratio);
    ctx.save();ctx.scale(-1,1);ctx.drawImage(video,-canvas.width,0,canvas.width,canvas.height);ctx.restore();
    if(video.currentTime!==lastVideoTime&&now-lastDetect>48){
      lastVideoTime=video.currentTime;lastDetect=now;
      try{dsLatestPose=dsPoseLandmarker.detectForVideo(video,now);if(dsHandLandmarker)dsLatestHands=dsHandLandmarker.detectForVideo(video,now);}catch(err){console.warn(err);}
    }
    const landmarks=dsLatestPose?.landmarks?.[0];
    if(landmarks){
      dsDrawLivePose(ctx,landmarks,canvas.width,canvas.height,true);
      const ghostOn=$('#ds-toggle-ghost')?.dataset.on!=='false';
      if(ghostOn){
        try{const ref=JSON.parse(canvas.dataset.refFrame||'null');if(ref)dsDrawSkeleton(ctx,ref,canvas.width,canvas.height,{stroke:'#dfff38',joint:'#dfff38',alpha:.22,lineWidth:5,radius:4,handedness:$('#ds-hand').value});}catch(_){ }
      }
      dsUpdateFormScore(landmarks);
    } else {
      $('#ds-model-status').textContent='Step fully into frame';$('#ds-confidence').textContent='Low';
    }
    dsVisionRaf=requestAnimationFrame(loop);
  };dsVisionRaf=requestAnimationFrame(loop);
}
function dsTrackingConfidence(landmarks){
  if(!landmarks)return 0;return Math.round(mean(DS_KEYS.map(k=>Number(landmarks[k]?.visibility??.5)))*100);
}
function dsUpdateFormScore(landmarks){
  if(!dsActiveFormSession)return;
  const shot=dsGetShot($('#ds-shot-select').value),hand=$('#ds-hand').value,mode=$('#ds-mode').value;
  const handAngle=dsHandAngle(dsLatestHands,hand);const phase=dsClosestPhase(landmarks,shot,hand,mode,handAngle);const conf=dsTrackingConfidence(landmarks);
  const adjusted=Math.round(phase.score*(.75+Math.min(100,conf)*.0025));
  $('#ds-live-score').textContent=`${adjusted}%`;$('#ds-confidence').textContent=`${conf}%`;$('#ds-grade').textContent=dsGrade(adjusted);
  $('#ds-feedback').textContent=(phase.detail.feedback||[]).join(' ');
  $('#ds-components').innerHTML=Object.entries(phase.detail.components).slice(0,7).map(([k,v])=>`<div class="component-row"><span>${esc(dsComponentLabel(k))}</span><div class="progress"><span style="width:${v}%"></span></div><strong>${v}</strong></div>`).join('');
  dsActiveFormSession.scores.push(adjusted);dsActiveFormSession.frameScores.push(adjusted);if(dsActiveFormSession.scores.length>240)dsActiveFormSession.scores.shift();
  const lastIndex=shot.frames.length-1;const threshold=mode==='performance'?72:62;
  if(phase.score>=threshold-12){
    if(phase.index>=dsActiveFormSession.maxPhase-1)dsActiveFormSession.maxPhase=Math.max(dsActiveFormSession.maxPhase,phase.index);
    if(dsActiveFormSession.maxPhase>=lastIndex-1&&phase.index<=1&&performance.now()-dsActiveFormSession.lastRepAt>900){
      const slice=dsActiveFormSession.frameScores.splice(0);const rep=Math.round(mean(slice.slice(-Math.min(45,slice.length))));
      dsActiveFormSession.reps++;dsActiveFormSession.repScores.push(rep);dsActiveFormSession.best=Math.max(dsActiveFormSession.best,rep);dsActiveFormSession.streak=rep>=80?dsActiveFormSession.streak+1:0;dsActiveFormSession.lastRepAt=performance.now();dsActiveFormSession.maxPhase=0;
      $('#ds-reps').textContent=dsActiveFormSession.reps;$('#ds-average').textContent=`${Math.round(mean(dsActiveFormSession.repScores))}%`;$('#ds-streak').textContent=dsActiveFormSession.streak;
      if($('#ds-voice').checked)dsSpeak(`${dsGrade(rep)}. ${phase.detail.feedback?.[0]||shot.cues[2]}`);
    }
  }
  $('#ds-model-status').textContent=handAngle!=null?'Pose + hand tracked':'Pose tracked';$('#ds-model-status').className='pill good';
}
function dsComponentLabel(k){return ({domElbow:'Hitting elbow',nonElbow:'Support arm',domShoulder:'Shoulder path',nonShoulder:'Shoulder balance',knees:'Knee bend',stance:'Base width',wristHeight:'Contact height',wristAcross:'Contact reach',reach:'Arm extension',torso:'Torso control',torsoSigned:'Body angle',shoulderTilt:'Shoulder level',balance:'Balance',handAngle:'Forearm roll'})[k]||k;}
async function dsFinishFormSession(){
  if(!dsActiveFormSession){dsStopVision();return;}
  const shot=dsGetShot($('#ds-shot-select').value);const reps=dsActiveFormSession.reps;const avg=reps?Math.round(mean(dsActiveFormSession.repScores)):Math.round(mean(dsActiveFormSession.scores)||0);
  const entry={id:uid('form'),date:todayISO(),createdAt:new Date().toISOString(),shotId:shot.id,shotName:shot.name,handedness:$('#ds-hand').value,mode:$('#ds-mode').value,reps,average:avg,best:dsActiveFormSession.best||avg,streak:dsActiveFormSession.streak,feedback:$('#ds-feedback')?.textContent||''};
  if(reps||avg){state.formSessions.unshift(entry);state.formSessions=state.formSessions.slice(0,100);await saveState({quiet:true});toast(`Form session saved: ${avg}% average`);}
  dsStopCameraOnly();$('#ds-start-form').disabled=false;$('#ds-stop-form').disabled=true;$('#ds-capture-frame').disabled=true;$('#ds-model-status').textContent='Session finished';$('#ds-model-status').className='pill';
}
function dsCaptureCurrentFrame(){
  const landmarks=dsLatestPose?.landmarks?.[0];if(!landmarks){toast('Start the camera and step fully into frame');return;}if(dsCapturedFrames.length>=8){toast('A custom shot can contain up to 8 keyframes');return;}
  const frame=dsNormalizeCapturedPose(landmarks);if(!frame)return;dsCapturedFrames.push(frame);dsRenderCaptured();toast(`Captured checkpoint ${dsCapturedFrames.length}`);
}
function dsRenderCaptured(){
  const strip=$('#ds-captured-preview');if(!strip)return;$('#ds-capture-count').textContent=`${dsCapturedFrames.length} frame${dsCapturedFrames.length===1?'':'s'}`;$('#ds-clear-frames').disabled=!dsCapturedFrames.length;$('#ds-save-custom').disabled=dsCapturedFrames.length<3;
  strip.innerHTML=dsCapturedFrames.map((f,i)=>`<canvas width="100" height="125" data-captured="${i}"></canvas>`).join('');
  $$('[data-captured]',strip).forEach(c=>{const ctx=c.getContext('2d');ctx.fillStyle='#10140f';ctx.fillRect(0,0,c.width,c.height);dsDrawSkeleton(ctx,dsCapturedFrames[Number(c.dataset.captured)],c.width,c.height,{stroke:'#dfff38',joint:'#fff',lineWidth:3,radius:2,handedness:$('#ds-hand').value});});
}
async function dsSaveCustomShot(){
  if(dsCapturedFrames.length<3)return;const name=prompt('Name this custom shot sequence:','My custom pattern');if(!name?.trim())return;
  const custom={id:uid('customshot'),name:name.trim(),frames:JSON.parse(JSON.stringify(dsCapturedFrames)),frameNames:dsCapturedFrames.map((_,i)=>`Checkpoint ${i+1}`),cues:dsCapturedFrames.map((_,i)=>`Match checkpoint ${i+1}`),duration:Math.max(2400,dsCapturedFrames.length*700),createdAt:new Date().toISOString()};
  state.customShotTemplates.unshift(custom);await saveState({quiet:true});dsCapturedFrames=[];dsRenderCaptured();$('#ds-shot-select').innerHTML=dsShotOptions(custom.id);$('#ds-shot-select').value=custom.id;toast('Custom shot saved locally');
}

function openReactionTrainer(){
  const best=(state.reactionSessions||[]).flatMap(s=>s.times||[]).filter(Boolean);const pb=best.length?Math.min(...best):null;
  modal(`<div class="vision-modal-head"><div><div class="eyebrow">REACTION & SPLIT-STEP TRAINER</div><h2>Read. Move. Recover.</h2><p>Random cues measure first movement from your calibrated stance using the same local pose model.</p></div><span class="pill">${pb?`PB ${pb} ms`:'No PB yet'}</span></div><div class="reaction-stage"><video id="ds-react-video" autoplay muted playsinline></video><canvas id="ds-react-canvas" width="960" height="720"></canvas><div id="ds-react-cue" class="reaction-cue">READY</div></div><div class="vision-score-grid"><div class="vision-score primary"><strong id="ds-react-time">—</strong><span>Reaction</span></div><div class="vision-score"><strong id="ds-react-round">0/6</strong><span>Round</span></div><div class="vision-score"><strong id="ds-react-avg">—</strong><span>Average</span></div><div class="vision-score"><strong id="ds-react-best">${pb?pb+' ms':'—'}</strong><span>Personal best</span></div></div><div class="callout" style="margin-top:14px"><p id="ds-react-status">Start the camera. Hold your athletic ready position for calibration, then react to LEFT, RIGHT, SPLIT, or HANDS UP.</p></div><div class="form-actions"><button class="button" id="ds-react-stop">Stop</button><button class="button primary" id="ds-react-start">Start 6-round test</button></div>`);
  const dialog=$('#modal');dialog.classList.add('vision-dialog');dialog.addEventListener('close',()=>{dialog.classList.remove('vision-dialog');dsStopVision();if(dsReactionState?.timer)clearTimeout(dsReactionState.timer);},{once:true});
  $('#ds-react-start').onclick=dsStartReaction;$('#ds-react-stop').onclick=()=>{dsFinishReaction(true);closeModal();};
}
async function dsStartReaction(){
  const ready=await dsEnsureVisionModels($('#ds-react-status'));if(!ready)return;
  try{dsStopCameraOnly();cameraStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:1280},height:{ideal:720}},audio:false});const video=$('#ds-react-video');video.srcObject=cameraStream;await video.play();dsReactionState={round:0,times:[],baseline:null,cue:null,cueAt:0,armed:false,timer:null,calibration:[]};$('#ds-react-start').disabled=true;dsRunReactionLoop(video,$('#ds-react-canvas'));$('#ds-react-status').textContent='Calibrating your ready position…';setTimeout(()=>dsQueueReactionCue(),2200);}catch(err){toast(`Camera unavailable: ${err.message}`);}
}
function dsReactionPoseValues(lm){
  const hip=dsCenter(lm[23],lm[24]),ankle=dsCenter(lm[27],lm[28]),shoulder=dsCenter(lm[11],lm[12]);
  return {screenHipX:1-hip.x,hipY:hip.y,ankleWidth:Math.abs(lm[28].x-lm[27].x),wristHigh:((lm[15].y+lm[16].y)/2)<shoulder.y-.04};
}
function dsRunReactionLoop(video,canvas){
  const ctx=canvas.getContext('2d');let last=-1,lastDetect=0;
  const loop=now=>{if(!cameraStream||!canvas.isConnected)return;const rect=canvas.getBoundingClientRect(),ratio=video.videoWidth&&video.videoHeight?video.videoWidth/video.videoHeight:4/3;canvas.width=Math.max(640,Math.round(rect.width*devicePixelRatio));canvas.height=Math.round(canvas.width/ratio);ctx.save();ctx.scale(-1,1);ctx.drawImage(video,-canvas.width,0,canvas.width,canvas.height);ctx.restore();
    if(video.currentTime!==last&&now-lastDetect>48){last=video.currentTime;lastDetect=now;try{dsLatestPose=dsPoseLandmarker.detectForVideo(video,now);}catch(_){}}
    const lm=dsLatestPose?.landmarks?.[0];if(lm){dsDrawLivePose(ctx,lm,canvas.width,canvas.height,true);const v=dsReactionPoseValues(lm);if(dsReactionState&&!dsReactionState.baseline){dsReactionState.calibration.push(v);if(dsReactionState.calibration.length>=18){dsReactionState.baseline={screenHipX:mean(dsReactionState.calibration.map(x=>x.screenHipX)),hipY:mean(dsReactionState.calibration.map(x=>x.hipY)),ankleWidth:mean(dsReactionState.calibration.map(x=>x.ankleWidth))};}}
      if(dsReactionState?.armed&&dsReactionDetected(v,dsReactionState.cue,dsReactionState.baseline)){const ms=Math.round(performance.now()-dsReactionState.cueAt);dsReactionState.armed=false;dsReactionState.times.push(ms);$('#ds-react-time').textContent=`${ms} ms`;$('#ds-react-avg').textContent=`${Math.round(mean(dsReactionState.times))} ms`;$('#ds-react-best').textContent=`${Math.min(...dsReactionState.times)} ms`;$('#ds-react-status').textContent=ms<350?'Explosive first move. Recover to ready.':ms<550?'Solid read. Return to neutral faster.':'React sooner—watch the cue, not your feet.';dsBeep(660,.08);setTimeout(dsQueueReactionCue,1100);}}
    dsVisionRaf=requestAnimationFrame(loop);};dsVisionRaf=requestAnimationFrame(loop);
}
function dsReactionDetected(v,cue,b){if(!b)return false;if(cue==='LEFT')return v.screenHipX-b.screenHipX<-.065;if(cue==='RIGHT')return v.screenHipX-b.screenHipX>.065;if(cue==='SPLIT')return v.ankleWidth>b.ankleWidth*1.22&&v.hipY>b.hipY+.025;if(cue==='HANDS UP')return v.wristHigh;return false;}
function dsQueueReactionCue(){
  if(!dsReactionState||!cameraStream)return;if(dsReactionState.round>=6){dsFinishReaction();return;}dsReactionState.round++;$('#ds-react-round').textContent=`${dsReactionState.round}/6`;$('#ds-react-cue').textContent='SET';$('#ds-react-cue').className='reaction-cue';const delay=1200+Math.random()*1800;dsReactionState.timer=setTimeout(()=>{const cues=['LEFT','RIGHT','SPLIT','HANDS UP'];const cue=cues[Math.floor(Math.random()*cues.length)];dsReactionState.cue=cue;dsReactionState.cueAt=performance.now();dsReactionState.armed=true;$('#ds-react-cue').textContent=cue;$('#ds-react-cue').className='reaction-cue active';dsBeep(880,.06);},delay);
}
async function dsFinishReaction(cancelled=false){
  if(!dsReactionState)return;if(dsReactionState.timer)clearTimeout(dsReactionState.timer);const times=dsReactionState.times||[];if(!cancelled&&times.length){state.reactionSessions.unshift({id:uid('reaction'),date:todayISO(),createdAt:new Date().toISOString(),times:[...times],average:Math.round(mean(times)),best:Math.min(...times)});state.reactionSessions=state.reactionSessions.slice(0,60);await saveState({quiet:true});$('#ds-react-cue').textContent='COMPLETE';$('#ds-react-status').textContent=`Saved: ${Math.round(mean(times))} ms average, ${Math.min(...times)} ms best.`;toast('Reaction session saved');}dsStopCameraOnly();$('#ds-react-start').disabled=false;dsReactionState=null;
}
function dsBeep(freq=660,duration=.08){try{const a=new (window.AudioContext||window.webkitAudioContext)(),o=a.createOscillator(),g=a.createGain();o.frequency.value=freq;g.gain.setValueAtTime(.08,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+duration);o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+duration);}catch(_){}}

const DS_DECISIONS = [
  {tags:['transition'],title:'Mid-transition pressure',situation:'You drive the third shot. The opponent blocks it low at your feet while you are halfway to the kitchen.',options:['Sprint through and volley hard','Stop, split, and reset cross-court','Back up to the baseline','Attempt a low-percentage sideline flick'],correct:1,why:'The low block removes your attack. A controlled split and reset neutralizes the ball and earns the next step.'},
  {tags:['pressure'],title:'10–10 serve choice',situation:'At 10–10, your deepest serve target has been the opponent’s backhand hip. Your last serve missed long.',options:['Abandon the target and serve softly','Use the same target with slightly more net margin','Try an ace down the sideline','Rush the routine to avoid thinking'],correct:1,why:'Pressure rewards a trusted pattern with margin—not panic or a completely new idea.'},
  {tags:['dink'],title:'High cross-court dink',situation:'You receive a high but slow cross-court dink. The opponent across from you is leaning toward the sideline.',options:['Attack the outside shoulder immediately','Roll to the middle/body gap','Reset the ball softly to the same spot','Lob from below net height'],correct:1,why:'The middle/body target reduces counter angles and attacks the opponent’s compromised balance.'},
  {tags:['flick'],title:'Backhand flick window',situation:'A dead dink sits slightly above net height near your backhand side. Both opponents have paddles low.',options:['Use a compact backhand flick to the dominant hip','Take a huge backswing for pace','Dink it back automatically','Attack the sharpest sideline angle'],correct:0,why:'A short flick into the body uses the high contact while preserving recovery and reducing counter angles.'},
  {tags:['roll'],title:'Forehand roll decision',situation:'The ball is below shoulder height but above the net, and your opponent is deep in transition.',options:['Brush a controlled roll at their feet','Hit flat as hard as possible','Drop it short into the kitchen','Lob over the deeper player'],correct:0,why:'Topspin and a feet target combine shape with pressure while keeping the ball inside a high-margin window.'},
  {tags:['serve'],title:'Return geometry',situation:'A short serve pulls you forward on the deuce side. The server is slow moving after contact.',options:['Return deep middle and continue to the kitchen','Hit a short angle and stay back','Drive directly at the sideline','Attempt a drop return'],correct:0,why:'Deep middle buys recovery time, limits angles, and lets you establish the kitchen line.'},
  {tags:['overhead'],title:'Lob recovery',situation:'A lob goes over your backhand shoulder. You have enough time to turn.',options:['Backpedal while staring upward','Turn sideways, crossover, and create space','Jump backward immediately','Let the ball bounce without moving'],correct:1,why:'Turning and moving with crossover steps protects balance and creates a safer high contact point.'},
  {tags:['partner'],title:'Doubles middle ball',situation:'You are the left-side player with forehand in the middle. Your partner is already stretched wide.',options:['Call “mine” early and cover the middle','Wait silently until the bounce','Both players swing','Leave the ball because it crossed center'],correct:0,why:'Early communication plus the inside forehand resolves ambiguity and protects the open court.'},
  {tags:['reset'],title:'Fast ball at the body',situation:'At the kitchen, a speed-up arrives directly at your dominant hip.',options:['Take a full swing','Use a compact counter with paddle in front','Turn completely sideways','Drop the paddle below your waist'],correct:1,why:'A compact counter uses the opponent’s pace and preserves recovery for the next exchange.'},
  {tags:['patience'],title:'Neutral dink rally',situation:'After six neutral dinks, you feel impatient, but the next ball is below net height.',options:['Force a speed-up anyway','Move the ball with depth and wait for height','Lob from a stretched position','Step backward before contact'],correct:1,why:'Ball quality—not rally length—determines whether an attack is available.'},
  {tags:['singles'],title:'Singles approach',situation:'Your return lands deep and pulls the opponent wide. You are moving toward the kitchen.',options:['Split near the line and cover the likely pass','Run all the way through without stopping','Stay at the baseline','Guess one sideline before the opponent swings'],correct:0,why:'A controlled split gives access to both pass lanes while preserving forward pressure.'},
  {tags:['recovery'],title:'Late-match fatigue',situation:'Your serve pace has dropped and your shoulder feels tired late in a long session.',options:['Swing harder to compensate','Use placement, shorten the motion, and reduce intensity','Ignore the signal and add extra overheads','Change paddles every point'],correct:1,why:'Technique simplification and workload control protect decision quality and reduce unnecessary strain.'}
];
function dsDecisionOrder(){
  const weak=String(analytics().weakness||'').toLowerCase();const preferred=DS_DECISIONS.filter(q=>q.tags.some(t=>weak.includes(t)||focusRecommendation().title.toLowerCase().includes(t)));const rest=DS_DECISIONS.filter(q=>!preferred.includes(q));return [...preferred,...rest.sort(()=>Math.random()-.5)].slice(0,8);
}
function openDecisionArena(){
  const best=(state.decisionSessions||[]).length?Math.max(...state.decisionSessions.map(s=>s.score)):null;
  modal(`<div class="vision-modal-head"><div><div class="eyebrow">COURT IQ DECISION ARENA</div><h2>Choose the right shot before you hit it</h2><p>Eight personalized scenarios test shot selection, score awareness, geometry, and recovery.</p></div><span class="pill">${best!=null?`Best ${best}%`:'New challenge'}</span></div><div id="ds-decision-card" class="decision-card"></div><div class="vision-score-grid"><div class="vision-score primary"><strong id="ds-iq-score">0</strong><span>Points</span></div><div class="vision-score"><strong id="ds-iq-round">1/8</strong><span>Scenario</span></div><div class="vision-score"><strong id="ds-iq-streak">0</strong><span>Streak</span></div><div class="vision-score"><strong id="ds-iq-time">—</strong><span>Decision time</span></div></div>`);
  const run={questions:dsDecisionOrder(),index:0,correct:0,streak:0,bestStreak:0,times:[],startedAt:performance.now(),locked:false};dsRenderDecision(run);
}
function dsRenderDecision(run){
  const q=run.questions[run.index];if(!q){dsFinishDecision(run);return;}run.startedAt=performance.now();run.locked=false;$('#ds-iq-round').textContent=`${run.index+1}/${run.questions.length}`;
  $('#ds-decision-card').innerHTML=`<div class="eyebrow">${esc(q.title)}</div><h2>${esc(q.situation)}</h2><div class="decision-options">${q.options.map((o,i)=>`<button data-decision="${i}"><span>${String.fromCharCode(65+i)}</span>${esc(o)}</button>`).join('')}</div><div id="ds-decision-feedback" class="decision-feedback" hidden></div>`;
  $$('[data-decision]').forEach(b=>b.onclick=()=>dsAnswerDecision(run,Number(b.dataset.decision)));
}
function dsAnswerDecision(run,answer){
  if(run.locked)return;run.locked=true;const q=run.questions[run.index],correct=answer===q.correct,time=Math.round(performance.now()-run.startedAt);run.times.push(time);if(correct){run.correct++;run.streak++;run.bestStreak=Math.max(run.bestStreak,run.streak);}else run.streak=0;
  $$('[data-decision]').forEach(b=>{const i=Number(b.dataset.decision);b.disabled=true;if(i===q.correct)b.classList.add('correct');else if(i===answer)b.classList.add('wrong');});
  $('#ds-iq-score').textContent=run.correct;$('#ds-iq-streak').textContent=run.streak;$('#ds-iq-time').textContent=`${(time/1000).toFixed(1)}s`;const f=$('#ds-decision-feedback');f.hidden=false;f.innerHTML=`<strong>${correct?'Correct read':'Better option: '+q.options[q.correct]}</strong><p>${esc(q.why)}</p><button class="button primary small" id="ds-next-decision">${run.index===run.questions.length-1?'Finish':'Next scenario'}</button>`;$('#ds-next-decision').onclick=()=>{run.index++;dsRenderDecision(run);};
}
async function dsFinishDecision(run){
  const score=Math.round((run.correct/run.questions.length)*100);const entry={id:uid('iq'),date:todayISO(),createdAt:new Date().toISOString(),score,correct:run.correct,total:run.questions.length,bestStreak:run.bestStreak,averageDecisionMs:Math.round(mean(run.times))};state.decisionSessions.unshift(entry);state.decisionSessions=state.decisionSessions.slice(0,60);await saveState({quiet:true});
  $('#ds-decision-card').innerHTML=`<div class="decision-result"><div class="score-ring"><div><strong>${score}</strong><span>court IQ</span></div></div><h2>${score>=88?'Elite decision discipline':score>=75?'Strong tactical awareness':score>=60?'Useful base—sharpen two patterns':'Build a clearer decision framework'}</h2><p>${run.correct}/${run.questions.length} correct · ${(mean(run.times)/1000).toFixed(1)}s average decision time · best streak ${run.bestStreak}</p><div class="tag-row"><button class="button primary" id="ds-retry-iq">Run another set</button><button class="button" onclick="document.getElementById('modal').close()">Done</button></div></div>`;$('#ds-retry-iq').onclick=openDecisionArena;toast('Court IQ result saved');
}

// Replace the old experimental camera page with the complete four-feature vision suite.
renderVideo = function(){
  setHeader('Video & Vision Lab','ON-DEVICE FORM INTELLIGENCE');
  const videos=state.videos.length?state.videos.map(v=>`<div class="list-item"><div><strong>${esc(v.name)}</strong><div class="meta">${fmtDate(v.date)} · ${(v.size/1024/1024).toFixed(1)} MB · ${v.tags?.length||0} tagged moments</div></div><div class="tag-row"><button class="button small" data-open-video="${v.id}">Open</button><button class="button danger small" data-delete-video="${v.id}">Delete</button></div></div>`).join(''):empty('▶','No video library yet','Upload a match video. The file and timestamp tags stay in local browser storage.');
  const form=state.formSessions||[],react=state.reactionSessions||[],iq=state.decisionSessions||[];
  const bestForm=form.length?Math.max(...form.map(x=>Number(x.best||0))):0,bestReact=react.length?Math.min(...react.map(x=>Number(x.best||9999))):null,bestIQ=iq.length?Math.max(...iq.map(x=>Number(x.score||0))):0;
  const custom=state.customShotTemplates||[];
  $('#view').innerHTML=`
    <div class="vision-hero"><div><div class="eyebrow" style="color:var(--accent)">FORM MATCH & GRADE</div><h2>Your phone becomes a private motion coach.</h2><p>Choose from 16 pickleball mechanics—including rolls and flicks—follow the animated clip-art athlete, and receive live joint-angle, posture, contact-window, balance, rhythm, and recovery feedback.</p><div class="tag-row"><button class="button primary" data-action="camera-lab">Open Form Match</button><button class="button ghost" data-action="reaction-lab">Reaction trainer</button></div></div><div class="vision-hero-stats"><div><strong>33</strong><span>body landmarks</span></div><div><strong>16+</strong><span>shot mechanics</span></div><div><strong>0</strong><span>camera uploads</span></div></div></div>
    ${sectionHead('FOUR NEW INTELLIGENCE TOOLS','Train mechanics, reaction, custom technique, and decisions')}
    <div class="grid four">
      <button class="card interactive feature-card" data-action="camera-lab"><span class="feature-number">01</span><h3>Form Match & Grade</h3><p>Animated skeleton references, live pose + hand tracking, rep grades, exact corrections, voice coaching, and saved progress.</p><span class="pill good">Live</span></button>
      <button class="card interactive feature-card" data-action="camera-lab"><span class="feature-number">02</span><h3>Custom Shot Builder</h3><p>Capture 3–8 ideal checkpoints from your own camera and turn them into a reusable local training sequence.</p><span class="pill good">Live</span></button>
      <button class="card interactive feature-card" data-action="reaction-lab"><span class="feature-number">03</span><h3>Reaction + Split Step</h3><p>Random movement cues measure your first-step response, split-step timing, hands-up reaction, average, and PB.</p><span class="pill good">Live</span></button>
      <button class="card interactive feature-card" data-action="decision-arena"><span class="feature-number">04</span><h3>Court IQ Arena</h3><p>Personalized tactical scenarios grade shot selection, score awareness, geometry, patience, and recovery.</p><span class="pill good">Live</span></button>
    </div>
    ${sectionHead('VISION PROGRESS','Everything writes back to your athlete profile')}
    <div class="grid four">${statCard(form.length,'Form sessions')}${statCard(bestForm?`${bestForm}%`:'—','Best form rep')}${statCard(bestReact?`${bestReact} ms`:'—','Reaction PB')}${statCard(bestIQ?`${bestIQ}%`:'—','Court IQ best')}</div>
    <div class="grid two" style="margin-top:18px"><div class="card"><div class="card-head"><div><div class="eyebrow">RECENT FORM GRADES</div><h2>Technique trend</h2></div><button class="button primary small" data-action="camera-lab">New session</button></div><div class="list">${form.length?form.slice(0,8).map(s=>`<div class="list-item"><div><strong>${esc(s.shotName)}</strong><div class="meta">${fmtDate(s.date)} · ${s.reps} reps · ${esc(s.handedness)}</div></div><span class="pill ${s.average>=80?'good':s.average>=60?'warn':'bad'}">${s.average}%</span></div>`).join(''):empty('◎','No form grades yet','Open Form Match, select a shot, and complete your first graded repetitions.')}</div></div><div class="card"><div class="card-head"><div><div class="eyebrow">MY SHOT MODELS</div><h2>Custom references</h2></div><button class="button small" data-action="camera-lab">Build one</button></div><div class="list">${custom.length?custom.map(s=>`<div class="list-item"><div><strong>${esc(s.name)}</strong><div class="meta">${s.frames.length} captured checkpoints · stored locally</div></div><button class="button danger small" data-delete-custom-shot="${s.id}">Delete</button></div>`).join(''):empty('✦','No custom sequences','Capture your own ideal serve, roll, flick, or movement pattern and drill it later.')}</div></div></div>
    ${sectionHead('VIDEO LIBRARY','Search, tag, and compare your real match footage','<div class="tag-row"><label class="button primary">Upload video<input id="video-upload" type="file" accept="video/*" hidden></label><button class="button secondary" data-action="search-video">Search moments</button><button class="button" data-action="compare-video" '+(state.videos.length<2?'disabled':'')+'>Compare swings</button></div>')}
    <div class="card"><div class="list">${videos}</div></div>
    <div class="callout" style="margin-top:18px"><p><strong>Privacy:</strong> live camera frames are processed in memory by MediaPipe. They are not recorded or uploaded. The first model load requires an internet connection; afterward, browser caching may allow reuse. GitHub Pages provides the HTTPS camera permission the feature requires.</p></div>`;
};

cameraLab = openFormLab;

const dsOriginalBindCommonActions=bindCommonActions;
bindCommonActions=function(){
  dsOriginalBindCommonActions();
  $$('[data-action="reaction-lab"]').forEach(el=>el.onclick=openReactionTrainer);
  $$('[data-action="decision-arena"]').forEach(el=>el.onclick=openDecisionArena);
  $$('[data-delete-custom-shot]').forEach(el=>el.onclick=async()=>{if(!confirm('Delete this custom shot model?'))return;state.customShotTemplates=state.customShotTemplates.filter(x=>x.id!==el.dataset.deleteCustomShot);await saveState({quiet:true});toast('Custom shot deleted');render();});
};

// Make the built-in coach aware of the new evidence layer.
const dsOriginalLocalCoachAnswer=localCoachAnswer;
localCoachAnswer=function(question){
  const q=String(question||'').toLowerCase();
  const lastForm=(state.formSessions||[])[0],lastReaction=(state.reactionSessions||[])[0],lastIQ=(state.decisionSessions||[])[0];
  if(q.includes('form')||q.includes('mechanic')||q.includes('flick')||q.includes('roll')){
    if(!lastForm)return 'Open Video & Vision Lab and complete five graded reps. I will use the saved average, best rep, and correction pattern to recommend the next drill.';
    return `Your latest ${lastForm.shotName} session averaged ${lastForm.average}% with a best rep of ${lastForm.best}%. The saved correction was: ${lastForm.feedback||'repeat the lowest-scoring checkpoint slowly before adding speed.'}`;
  }
  if(q.includes('reaction')||q.includes('split step'))return lastReaction?`Your latest reaction test averaged ${lastReaction.average} ms with a ${lastReaction.best} ms best. Train the first movement, then require a complete recovery to ready before the next cue.`:'Run the Reaction & Split-Step Trainer for a six-cue baseline.';
  if(q.includes('court iq')||q.includes('decision'))return lastIQ?`Your latest Court IQ score was ${lastIQ.score}% with a ${lastIQ.averageDecisionMs} ms average decision time. Review missed scenarios and turn one decision rule into your next-match mission.`:'Complete the eight-scenario Court IQ Arena to build a tactical baseline.';
  return dsOriginalLocalCoachAnswer(question);
};
