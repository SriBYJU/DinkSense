'use strict';
const CACHE = 'dinksense-shell-v1.7.0';
const MODEL_CACHE = 'dinksense-models-v1';
const ASSETS = [
  './','./index.html','./styles.css','./enhancements-v1.7.css','./adsense-config.js','./app.js','./vision-lab.js','./vision-pro.js','./enhancements-v1.7.js',
  './manifest.webmanifest','./assets/icon.svg','./assets/icon-192.png','./assets/icon-512.png',
  './assets/shriyan-avadhanula-founder.png'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  const keep=new Set([CACHE,MODEL_CACHE]);
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => !keep.has(key)).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  const isModel=url.hostname.includes('googleapis.com')||url.hostname.includes('jsdelivr.net')||url.pathname.includes('pose_landmarker')||url.pathname.includes('hand_landmarker')||url.pathname.includes('wasm');
  if(isModel){
    event.respondWith(caches.open(MODEL_CACHE).then(async cache=>{
      const hit=await cache.match(event.request);if(hit)return hit;
      const response=await fetch(event.request);if(response.ok)cache.put(event.request,response.clone());return response;
    }).catch(()=>caches.match(event.request)));
    return;
  }
  if(url.hostname==='api.open-meteo.com'){
    event.respondWith(fetch(event.request).catch(()=>new Response(JSON.stringify({error:'offline'}),{headers:{'Content-Type':'application/json'}})));
    return;
  }
  if(url.hostname.includes('google.com')||url.hostname.includes('googlesyndication.com')){
    event.respondWith(fetch(event.request).catch(()=>new Response('<!doctype html><title>Online connection required</title><body style="font-family:system-ui;padding:2rem">Google Maps or AdSense requires an internet connection.</body>',{headers:{'Content-Type':'text/html'}})));
    return;
  }
  event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request).then(response=>{
    if(url.origin===location.origin&&response.ok){const clone=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,clone));}
    return response;
  }).catch(()=>caches.match('./index.html'))));
});
