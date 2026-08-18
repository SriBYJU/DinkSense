/* DinkSense August 2026 hotfix
   - Removes founder skill-level claims from the public Founder view.
   - Replaces the decorative court placeholder with a real OpenStreetMap embed.
   - Makes "Use location" center the map instead of opening a partially filled form.
   - Adds map/directions/remove controls and makes court ranking actually consider distance when location is available.
*/
'use strict';

const DINKSENSE_MAP_CENTER_KEY = 'dinksense.map.center.v1';

function dsFiniteCoord(value, min, max){
  const n = Number(value);
  return Number.isFinite(n) && n >= min && n <= max ? n : null;
}

function dsCourtCoords(court){
  if(!court) return null;
  const lat = dsFiniteCoord(court.lat, -90, 90);
  const lon = dsFiniteCoord(court.lon, -180, 180);
  return lat === null || lon === null ? null : {lat, lon};
}

function dsSavedMapCenter(){
  try {
    const raw = localGet(DINKSENSE_MAP_CENTER_KEY);
    if(!raw) return null;
    const parsed = JSON.parse(raw);
    const lat = dsFiniteCoord(parsed.lat, -90, 90);
    const lon = dsFiniteCoord(parsed.lon, -180, 180);
    return lat === null || lon === null ? null : {lat, lon};
  } catch(err){
    return null;
  }
}

function dsSaveMapCenter(lat, lon){
  const safeLat = dsFiniteCoord(lat, -90, 90);
  const safeLon = dsFiniteCoord(lon, -180, 180);
  if(safeLat === null || safeLon === null) return false;
  localSet(DINKSENSE_MAP_CENTER_KEY, JSON.stringify({lat:safeLat, lon:safeLon, updatedAt:new Date().toISOString()}));
  return true;
}

function dsDistanceMiles(a, b){
  if(!a || !b) return null;
  const rad = x => x * Math.PI / 180;
  const earthMiles = 3958.8;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const lat1 = rad(a.lat);
  const lat2 = rad(b.lat);
  const h = Math.sin(dLat/2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon/2) ** 2;
  return 2 * earthMiles * Math.asin(Math.min(1, Math.sqrt(h)));
}

function dsOsmEmbedUrl(center){
  if(!center) return '';
  const lat = Number(center.lat);
  const lon = Number(center.lon);
  const latSpan = 0.035;
  const lonSpan = 0.055;
  const bbox = [lon-lonSpan, lat-latSpan, lon+lonSpan, lat+latSpan].map(n=>n.toFixed(6)).join('%2C');
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat.toFixed(6)}%2C${lon.toFixed(6)}`;
}

function dsOsmOpenUrl(court){
  const coords = dsCourtCoords(court);
  if(coords) return `https://www.openstreetmap.org/?mlat=${coords.lat}&mlon=${coords.lon}#map=15/${coords.lat}/${coords.lon}`;
  return court?.address ? `https://www.openstreetmap.org/search?query=${encodeURIComponent(court.address)}` : 'https://www.openstreetmap.org/';
}

// Correct the recommender so its stated distance behavior is real rather than cosmetic.
recommendCourt = function(){
  if(!state.courts.length) return null;
  const center = dsSavedMapCenter();
  const ranked = state.courts.map(c=>{
    let score = 0;
    if(c.crowd==='Open') score += 35;
    else if(c.crowd==='Moderate') score += 20;
    else if(c.crowd==='Busy') score -= 10;
    if(c.lights) score += 8;
    if(c.surface?.toLowerCase().includes('acrylic')) score += 8;
    score += Math.min(12, Number(c.courts||1) * 2);
    const coords = dsCourtCoords(c);
    const distance = center && coords ? dsDistanceMiles(center, coords) : null;
    if(distance !== null) score += Math.max(0, 20 - Math.min(20, distance * 2));
    return {...c, _score:score, _distance:distance};
  }).sort((a,b)=>b._score-a._score);
  const best = ranked[0];
  const distanceText = best._distance === null ? '' : `, about ${best._distance < 10 ? best._distance.toFixed(1) : Math.round(best._distance)} mi away`;
  return {
    name:best.name,
    reason:`Best current fit: ${best.crowd||'unknown'} crowd, ${best.courts||1} courts, ${best.surface||'surface unknown'}${best.lights?', lights available':''}${distanceText}.`
  };
};

// "Use location" now does what the map control says: it centers Court Discovery on the player.
useLocation = function(){
  if(!navigator.geolocation){
    toast('Geolocation is not available in this browser');
    return;
  }
  toast('Requesting your location…');
  navigator.geolocation.getCurrentPosition(
    pos=>{
      dsSaveMapCenter(pos.coords.latitude, pos.coords.longitude);
      toast('Court map centered on your location');
      if(currentView === 'discover') render();
    },
    err=>toast(`Location unavailable: ${err.message}`),
    {enableHighAccuracy:false, timeout:12000, maximumAge:300000}
  );
};

renderDiscover = function(){
  setHeader('Court Discovery','GO PLAY');
  const courts = state.courts;
  const savedCenter = dsSavedMapCenter();
  const firstCourtWithCoords = courts.find(c=>dsCourtCoords(c));
  const mapCenter = savedCenter || dsCourtCoords(firstCourtWithCoords);
  const recommender = recommendCourt();

  const courtList = courts.length ? courts.map(c=>{
    const coords = dsCourtCoords(c);
    const distance = savedCenter && coords ? dsDistanceMiles(savedCenter, coords) : null;
    const meta = `${esc(c.address||'Saved locally')} · ${c.courts||1} courts · ${esc(c.surface||'Unknown surface')}${distance===null?'':` · ${distance<10?distance.toFixed(1):Math.round(distance)} mi`}`;
    return `<div class="list-item"><div><strong>${esc(c.name)}</strong><div class="meta">${meta}</div></div><div class="tag-row"><span class="pill ${c.crowd==='Open'?'good':c.crowd==='Busy'?'bad':'warn'}">${esc(c.crowd||'Unknown')}</span>${coords?`<button class="button small" data-map-court="${c.id}">Map</button>`:''}<a class="button small" href="${esc(dsOsmOpenUrl(c))}" target="_blank" rel="noopener noreferrer">Directions ↗</a><button class="button small" data-edit-court="${c.id}">Update</button><button class="button danger small" data-remove-court="${c.id}">Remove</button></div></div>`;
  }).join('') : empty('⌖','Save your first court','Use your location to center the live map, then add courts manually. Crowd reports remain private/local unless you later connect a community backend.','<button class="button primary" data-action="add-court">Add court</button>');

  const mapMarkup = mapCenter && navigator.onLine
    ? `<div style="position:relative;overflow:hidden;border-radius:22px;border:1px solid var(--border);min-height:340px;background:var(--soft)"><iframe id="court-map-frame" title="Interactive court map" src="${esc(dsOsmEmbedUrl(mapCenter))}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" style="width:100%;height:340px;border:0;display:block"></iframe><div style="position:absolute;left:12px;bottom:12px;background:rgba(255,255,255,.94);padding:8px 10px;border-radius:12px;font-size:.78rem;box-shadow:0 6px 20px rgba(0,0,0,.12)">Map data © OpenStreetMap contributors</div></div>`
    : `<div class="map-placeholder" style="display:grid;place-items:center;min-height:300px;padding:28px;text-align:center"><div><div style="font-size:2.5rem">⌖</div><h3>${navigator.onLine?'Center the real map':'Map unavailable offline'}</h3><p>${navigator.onLine?'Use your location or add latitude/longitude to a saved court.':'Your saved court list still works offline. Reconnect to load map tiles.'}</p><button class="button primary small" data-action="use-location">Use my location</button></div></div>`;

  $('#view').innerHTML = `
    <div class="grid dashboard-grid">
      <div class="card"><div class="card-head"><div><div class="eyebrow">LIVE COURT MAP</div><h2>Saved nearby courts</h2></div><div class="tag-row"><button class="button secondary small" data-action="use-location">Use location</button><button class="button primary small" data-action="add-court">+ Court</button></div></div>${mapMarkup}<div class="list" style="margin-top:14px">${courtList}</div></div>
      <div class="grid">
        <div class="card" id="weather-card"><div class="weather-box"><div><div class="eyebrow">OUTDOOR ADVISORY</div><h2>${navigator.onLine?'Live weather available':'Offline mode'}</h2><p>${navigator.onLine?'Use your location to fetch current conditions from Open-Meteo.':'Core court tools still work; weather needs a connection.'}</p></div><div class="weather-temp">☀</div></div><button class="button small" data-action="weather">Check conditions</button></div>
        <div class="card accent"><div class="eyebrow">AI COURT RECOMMENDER</div><h2>${esc(recommender?.name||'Add court data')}</h2><p>${esc(recommender?.reason||'DinkSense ranks courts by crowd status, surface preference, lights, court count, and distance when location is available.')}</p></div>
      </div>
    </div>
    ${sectionHead('SMART PLAY WINDOWS','Beyond a basic map')}
    <div class="grid three"><div class="card"><h3>Sun-position guidance</h3><p>Morning/evening advice uses time, hemisphere, and court orientation entered for each court.</p></div><div class="card"><h3>Surface heat warning</h3><p>Weather combines with surface type to flag hot hard courts and suggest hydration breaks.</p></div><div class="card"><h3>Personal court memory</h3><p>Track where you play best, which partners meet there, and what time the courts usually fill.</p></div></div>`;

  $$('[data-map-court]').forEach(el=>el.onclick=()=>{
    const court = state.courts.find(c=>c.id===el.dataset.mapCourt);
    const coords = dsCourtCoords(court);
    if(!coords) return;
    dsSaveMapCenter(coords.lat, coords.lon);
    const frame = $('#court-map-frame');
    if(frame) frame.src = dsOsmEmbedUrl(coords);
    toast(`Map centered on ${court.name}`);
  });

  $$('[data-remove-court]').forEach(el=>el.onclick=async()=>{
    const court = state.courts.find(c=>c.id===el.dataset.removeCourt);
    if(!court) return;
    if(!confirm(`Remove ${court.name} from your saved courts?`)) return;
    state.courts = state.courts.filter(c=>c.id!==court.id);
    await saveState({quiet:true});
    toast('Court removed');
    render();
  });
};

renderFounder = function(){
  setHeader('About the Founder','BUILT FROM REAL COMPETITION');
  const photo = state.founder.photo || 'assets/shriyan-avadhanula-founder.png';
  $('#view').innerHTML = `
    <div class="hero" style="min-height:430px">
      <div class="hero-copy"><div class="eyebrow" style="color:var(--accent)">FOUNDER · ATHLETE · BUILDER</div><h2>Shriyan<br>Avadhanula</h2><p>DinkSense was created from the perspective of a competitive player who wanted more than a rating number—an app that explains the game and turns every match into a smarter next step.</p><div class="tag-row"><span class="pill good">Independent sponsorships</span><span class="pill">IB student</span><span class="pill dark">Founder & builder</span></div></div>
      <div class="hero-side"><img src="${esc(photo)}" alt="Shriyan Avadhanula" style="width:100%;max-height:430px;object-fit:cover;object-position:center top;border-radius:28px;border:1px solid rgba(255,255,255,.2)"></div>
    </div>
    ${sectionHead('THE STORY','Why DinkSense exists')}
    <div class="grid dashboard-grid">
      <div class="card"><h2>Built by Shriyan Avadhanula</h2><p>Shriyan is an 11th-grade IB student at Henrico High School in Richmond, Virginia, with a 3.95 GPA and interests spanning finance, cybersecurity, and software development.</p><p>He has independently secured sponsorships with major brands including Paddletek and Franklin, among others.</p><p>DinkSense grew out of his own experience as a competitive player: tracking improvement was fragmented, generic advice was disconnected from real performance, and junior athletes lacked a complete way to present verified progress. He designed this system to support his own pickleball journey and to give players at every level—not only elite competitors—practical tools to understand and improve their game.</p></div>
      <div class="grid"><div class="card accent"><div class="eyebrow">CORE BELIEF</div><h2>“Don’t just track the rating. Explain the game.”</h2></div><div class="card"><div class="eyebrow">FOUNDER HIGHLIGHTS</div><div class="list"><div class="list-item"><strong>Independent sponsorships</strong><span class="pill good">Paddletek · Franklin</span></div><div class="list-item"><strong>Academic program</strong><span class="pill">IB</span></div><div class="list-item"><strong>Product role</strong><span class="pill">Founder & builder</span></div></div></div></div>
    </div>
    ${sectionHead('FOUNDER JOURNEY','Athlete insight turned into product design')}
    <div class="grid three"><div class="card"><h3>Compete</h3><p>Real match-play experience revealed that improvement was too often reduced to a single rating number.</p></div><div class="card"><h3>Analyze</h3><p>DinkSense was designed so the AI coach, match logs, roadmap, health, gear, and video tools all pull from one athlete profile.</p></div><div class="card"><h3>Present</h3><p>The public-profile and sponsorship tools make it easier for ambitious juniors to show progress with evidence, not hype.</p></div></div>
    ${sectionHead('PRODUCT PHILOSOPHY','One coherent athlete-intelligence system')}
    <div class="grid three"><div class="card"><h3>Useful for one player</h3><p>No core feature depends on friends joining. Your data alone creates value.</p></div><div class="card"><h3>Local-first by design</h3><p>Private logs, videos, goals, and coaching patterns stay under the player’s control.</p></div><div class="card"><h3>Ambitious, but honest</h3><p>Working features are labeled clearly; advanced model integrations are never faked.</p></div></div>`;
};

// If the user is already on one of the affected views when this deferred script runs,
// refresh it once with the corrected implementation.
if(currentView === 'discover' || currentView === 'founder') render();
