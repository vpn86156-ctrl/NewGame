#!/usr/bin/env python3
"""Generate a versioned service worker that precaches the complete online app."""
import hashlib
import json
import sys
from pathlib import Path

build = Path(sys.argv[1] if len(sys.argv) > 1 else 'dist')
files = []
for path in sorted(build.rglob('*')):
    if not path.is_file():
        continue
    relative = path.relative_to(build).as_posix()
    if relative in ('sw.js', '404.html') or relative.startswith('downloads/'):
        continue
    files.append(relative)
assert 'index.html' in files
version = hashlib.sha256('\n'.join(f'{name}:{(build / name).stat().st_size}' for name in files).encode()).hexdigest()[:12]
assets = json.dumps(files, ensure_ascii=False)
worker = f'''const CACHE = 'terra-chronicle-{version}';
const BASE = self.registration.scope;
const ASSETS = {assets}.map((path) => new URL(path, BASE).toString());
const APP_SHELL = new URL('index.html', BASE).toString();

self.addEventListener('install', (event) => {{
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
}});

self.addEventListener('activate', (event) => {{
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith('terra-chronicle-') && key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
}});

self.addEventListener('fetch', (event) => {{
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.includes('/downloads/')) return;
  if (request.mode === 'navigate') {{
    event.respondWith(caches.match(APP_SHELL).then((cached) => cached || fetch(request)));
    return;
  }}
  event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((response) => {{
    if (response.ok) {{
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put(request, copy));
    }}
    return response;
  }})));
}});
'''
(build / 'sw.js').write_text(worker)
print(f'Service worker: {len(files)} precached files · version {version}')
