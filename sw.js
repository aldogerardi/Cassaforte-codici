const CACHE = "cassaforte-v21";
const ASSETS = ["./", "./index.html", "./manifest.json", "./icon.svg", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// cache-first: l'app si apre subito dalla copia offline salvata sul telefono, senza aspettare la rete.
// in parallelo, in background, controlla se c'e' una versione piu' recente e la salva per la prossima apertura.
self.addEventListener("fetch", (event) => {
  const req = event.request;
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req).then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => null);
      // se in cache, rispondi subito con quella; altrimenti aspetta la rete (prima installazione)
      return cached || network;
    })
  );
});
