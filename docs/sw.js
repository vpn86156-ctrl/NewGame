const CACHE = 'terra-chronicle-afa67ff6a299';
const BASE = self.registration.scope;
const ASSETS = ["assets/index-UHk2yadv.css", "assets/index-WvRMVbdw.js", "assets/manrope-cyrillic-wght-normal-Dvxsihut.woff2", "assets/manrope-greek-wght-normal-DL7QRZyv.woff2", "assets/manrope-latin-ext-wght-normal-Ch3YOpNY.woff2", "assets/manrope-latin-wght-normal-DHIcAJRg.woff2", "assets/manrope-vietnamese-wght-normal-usUDDRr7.woff2", "assets/russo-one-cyrillic-400-normal-BXZIn0h3.woff2", "assets/russo-one-cyrillic-400-normal-rRbrNFRA.woff", "assets/russo-one-latin-400-normal-BfOuQF9V.woff2", "assets/russo-one-latin-400-normal-CosRecV9.woff", "assets/russo-one-latin-ext-400-normal-BssN3Pxm.woff", "assets/russo-one-latin-ext-400-normal-CezFp_e4.woff2", "favicon.svg", "icons/apple-touch-icon.png", "icons/icon-192.png", "icons/icon-512.png", "images/acquisition/enchanted-sword-shrine.png", "images/bosses/brain-of-cthulhu.gif", "images/bosses/eye-of-cthulhu.gif", "images/bosses/golem.gif", "images/bosses/king-slime.gif", "images/bosses/lunatic-cultist.png", "images/bosses/moon-lord.gif", "images/bosses/plantera.gif", "images/bosses/skeletron.png", "images/bosses/the-twins.gif", "images/bosses/wall-of-flesh.gif", "images/sprites/sheet-0.png", "images/sprites/sheet-1.png", "images/sprites/sheet-2.png", "images/sprites/sheet-3.png", "images/terraria-night-hero.webp", "images/treehouse-challenge.webp", "index.html", "manifest.webmanifest"].map((path) => new URL(path, BASE).toString());
const APP_SHELL = new URL('index.html', BASE).toString();

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith('terra-chronicle-') && key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.includes('/downloads/')) return;
  if (request.mode === 'navigate') {
    event.respondWith(caches.match(APP_SHELL).then((cached) => cached || fetch(request)));
    return;
  }
  event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((response) => {
    if (response.ok) {
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put(request, copy));
    }
    return response;
  })));
});
