// オフライン対応：アプリ本体はキャッシュ優先、更新はバックグラウンドで取得
const CACHE = "abx-sukima-v6";
const ASSETS = ["./", "./index.html", "./manifest.webmanifest",
  "./icon.svg", "./icon-192.png", "./icon-512.png",
  "./maskable-512.png", "./apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.open(CACHE).then(async cache => {
      const cached = await cache.match(e.request);
      const fresh = fetch(e.request).then(res => {
        if (res && (res.ok || res.type === "opaque")) cache.put(e.request, res.clone());
        return res;
      }).catch(() => cached);
      return cached || fresh;
    })
  );
});
