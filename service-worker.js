const CACHE_NAME = "maan-pwa-v2";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./autism.html",
  "./intellectual.html",
  "./visual.html",
  "./hearing.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// تثبيت التطبيق وحفظ ملفاته
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  self.skipWaiting();
});

// تفعيل النسخة الجديدة وحذف النسخ القديمة
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    })
  );

  self.clients.claim();
});

// تشغيل الملفات المحفوظة دون إنترنت
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const request = event.request;

  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then(response => {
        if (response && response.ok) {
          const copy = response.clone();

          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, copy);
          });
        }

        return response;
      }).catch(() => {
        if (request.mode === "navigate") {
          return caches.match("./index.html");
        }
      });
    })
  );
});
