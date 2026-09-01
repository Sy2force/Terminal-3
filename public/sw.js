const CACHE_VERSION = "t3-v1";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;

const STATIC_ASSETS = [
  "/",
  "/offline",
  "/site.webmanifest",
  "/favicon.ico",
  "/images/terminal-3/brand/favicon/icon-512x512.png",
  "/images/terminal-3/brand/favicon/apple-touch-icon-180x180.png",
];

// Install : pré-cache les assets vitaux en arrière-plan.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)),
  );
  self.skipWaiting();
});

// Activate : nettoyage des anciens caches.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith("t3-") && k !== STATIC_CACHE && k !== IMAGE_CACHE)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// Fetch : cache-first pour les assets statiques, no-cache pour les données utilisateur.
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Jamais de cache pour les Server Actions, Auth, admin, callbacks, profils, commandes.
  const sensitive = ["/api/", "/auth/", "/admin", "/_next/data", "/commande", "/compte"];
  if (
    sensitive.some((p) => url.pathname.startsWith(p)) ||
    request.method !== "GET" ||
    url.pathname.startsWith("/__")
  ) {
    return;
  }

  const sameOrigin = url.origin === self.location.origin;
  const isImage = request.destination === "image";
  const isDocument = request.destination === "document";
  const isStatic =
    request.destination === "script" ||
    request.destination === "style" ||
    request.destination === "font" ||
    url.pathname.startsWith("/_next/static/");

  if (!sameOrigin || isImage) {
    event.respondWith(imageFirst(request));
    return;
  }

  if (isStatic) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  if (isDocument) {
    event.respondWith(documentWithFallback(request));
    return;
  }

  // API / réseau : network first, fallback offline si disponible.
  event.respondWith(networkFirst(request));
});

async function cacheFirst(request, cacheName) {
  const cached = await caches.open(cacheName).then((c) => c.match(request));
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const clone = response.clone();
    caches.open(cacheName).then((c) => c.put(request, clone));
  }
  return response;
}

async function imageFirst(request) {
  const cached = await caches.open(IMAGE_CACHE).then((c) => c.match(request));
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const clone = response.clone();
      caches.open(IMAGE_CACHE).then((c) => c.put(request, clone));
    }
    return response;
  } catch {
    return cached ?? new Response("", { status: 504, statusText: "Offline" });
  }
}

async function documentWithFallback(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch {
    const cached = await caches.open(STATIC_CACHE).then((c) => c.match(request));
    if (cached) return cached;
    const offline = await caches.open(STATIC_CACHE).then((c) => c.match("/offline"));
    return offline ?? new Response("Hors connexion", { status: 503, headers: { "Content-Type": "text/plain" } });
  }
}

async function networkFirst(request) {
  const cached = await caches.open(STATIC_CACHE).then((c) => c.match(request));
  try {
    const response = await fetch(request);
    if (response.ok) {
      const clone = response.clone();
      caches.open(STATIC_CACHE).then((c) => c.put(request, clone));
    }
    return response;
  } catch {
    return cached ?? new Response(JSON.stringify({ error: "offline" }), { status: 503, headers: { "Content-Type": "application/json" } });
  }
}
