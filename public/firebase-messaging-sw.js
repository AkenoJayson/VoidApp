importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyBcQplnU_AdhXWLYU7cfJkdiCTXfTYlwVc",
    authDomain: "voidtech-void.firebaseapp.com",
    projectId: "voidtech-void",
    storageBucket: "voidtech-void.firebasestorage.app",
    messagingSenderId: "253604857372",
    appId: "1:253604857372:web:91ce2a533b188f5d6d41d9"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    self.registration.showNotification(payload.notification.title, {
        body: payload.notification.body,
        icon: '/favicon.ico'
    });
});

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});