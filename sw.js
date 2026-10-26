self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data.json(); } catch (_) {}
  const n = d.notification || {};
  e.waitUntil(self.registration.showNotification(n.title || 'T-20', {
    body: n.body || '',
    tag: n.tag || 't20',
    requireInteraction: true,
    icon: 'icon192.png',
    badge: 'icon192.png',
    data: n.data || {}
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || 'https://eliezer1817.github.io/t20-console/';
  e.waitUntil(clients.openWindow(url));
});
