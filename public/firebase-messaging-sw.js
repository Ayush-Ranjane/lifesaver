importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

// We just need a basic initialization here. The config can be injected or parsed, 
// but even just leaving it empty is often enough to stop the browser from throwing a 404
// when `getToken` calls `navigator.serviceWorker.register('/firebase-messaging-sw.js')`.
// To fully receive background messages, it would need firebase.initializeApp(config).
// For now, this fixes the 404.

self.addEventListener('install', () => {
  self.skipWaiting();
});
