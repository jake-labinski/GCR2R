// Grand Canyon R2R — Service Worker
// Handles scheduled alarm notifications

const CACHE_NAME = 'gcr2r-v1';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

// Store scheduled alarms in memory
const scheduledAlarms = {};

self.addEventListener('message', event => {
  const data = event.data;
  if (data && data.type === 'SCHEDULE_ALARM') {
    const { id, delay, label, body } = data;

    // Clear existing timer for this id if any
    if (scheduledAlarms[id]) {
      clearTimeout(scheduledAlarms[id]);
    }

    // Schedule the notification
    scheduledAlarms[id] = setTimeout(() => {
      self.registration.showNotification('🏜️ ' + label, {
        body: body,
        icon: 'https://jake-labinski.github.io/GCR2R/icon-192.png',
        badge: 'https://jake-labinski.github.io/GCR2R/icon-192.png',
        tag: id,
        requireInteraction: true,
        vibrate: [200, 100, 200],
        actions: [
          { action: 'done', title: '✓ Done' },
          { action: 'dismiss', title: 'Dismiss' }
        ]
      });
    }, delay);

    console.log(`Alarm scheduled: ${id} in ${Math.round(delay/60000)} min`);
  }
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'done') {
    // Notify the page to mark the alarm as fired
    clients.matchAll({ type: 'window' }).then(clientList => {
      clientList.forEach(client => {
        client.postMessage({ type: 'ALARM_DONE', id: event.notification.tag });
      });
    });
  }
  // Open the app if not already open
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return clients.openWindow('https://jake-labinski.github.io/GCR2R/');
    })
  );
});
