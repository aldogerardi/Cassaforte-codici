// ==== VERSIONE: cambiala a ogni pubblicazione (uguale a APP_VERSION in index.html) ====
const VERSION = "2.12";
// ======================================================================================
const CACHE = "cassaforte-v" + VERSION;
const ASSETS = ["./", "./index.html", "./manifest.json", "./icon.svg", "./icon-192.png", "./icon-512.png"];

// La nuova versione si scarica e resta "in attesa": si attiva solo quando l'utente tocca "Aggiorna" nel banner
// (o quando l'app viene chiusa del tutto e riaperta). Alla primissima installazione si attiva da sola.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll(ASSETS.map((u) => new Request(u, { cache: "reload" })))
    )
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      // cancella solo le vecchie cache di Cassaforte, senza toccare quelle di altre app sullo stesso dominio
      Promise.all(keys.filter((k) => k.startsWith("cassaforte-") && k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  const d = event.data || {};
  if (d.type === "SKIP_WAITING") self.skipWaiting();
  if (d.type === "GET_VERSION" && event.ports && event.ports[0]) event.ports[0].postMessage({ version: VERSION });
});

// cache-first: l'app si apre subito dalla copia offline. Gli aggiornamenti arrivano solo con una nuova versione del service worker.
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((cached) => cached || fetch(req))
  );
});
