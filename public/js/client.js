var publicVapidKey = 'BJthRQ5myDgc7OSXzPCMftGw-n16F7zQBEN7EUD6XxcfTTvrLGWSIG7y_JxiWtVlCFua0S8MTB5rPziBqNx1qIo';

// Check for service worker
if ('serviceWorker' in navigator) {
    send().catch(err => console.error(err));
}

// Register SW, Register Push, Send Push
async function send() {
    // Register Service Worker
    const register = await navigator.serviceWorker.register('/js/worker.js');

    // Register Push
    const subscription = await register.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
    });

    // Send Push Notification
    await fetch('/subscribe', {
        method: 'POST',
        body: JSON.stringify(subscription),
        headers: {
            'content-type': 'application/json'
        }
    });
}

function urlBase64ToUint8Array(base64String) {
    var padding = '='.repeat((4 - base64String.length % 4) % 4);
    var base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    var rawData = window.atob(base64);
    var outputArray = new Uint8Array(rawData.length);

    for (var i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}