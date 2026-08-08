importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBQn5t54aZvtZtC-DhKICCNogVlt-rdT6s",
  authDomain: "pitlanef1.firebaseapp.com",
  projectId: "pitlanef1",
  storageBucket: "pitlanef1.firebasestorage.app",
  messagingSenderId: "440842365729",
  appId: "1:440842365729:web:feb182009aea1b8bf3ec60"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});