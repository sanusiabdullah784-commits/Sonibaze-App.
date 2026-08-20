// Convert VAPID public key to Uint8Array
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Request notification permission
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('❌ This browser does not support notifications');
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

// Subscribe to push notifications
export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator)) {
    console.log('❌ Service Worker not supported');
    return null;
  }

  const registration = await navigator.serviceWorker.ready;
  
  // Replace with your VAPID public key from Supabase or Firebase
  const VAPID_PUBLIC_KEY = 'YOUR_VAPID_PUBLIC_KEY_HERE';
  
  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });
    
    console.log('✅ Push subscription created:', subscription);
    
    // Send subscription to your backend
    await saveSubscriptionToBackend(subscription);
    
    return subscription;
  } catch (error) {
    console.error('❌ Failed to subscribe to push:', error);
    return null;
  }
}

// Save subscription to backend (Supabase)
async function saveSubscriptionToBackend(subscription: PushSubscription) {
  // Get current user
  const { supabase } = await import('./supabaseClient');
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    // Save to a push_subscriptions table
    const { error } = await supabase
      .from('push_subscriptions')
      .insert([
        {
          user_id: user.id,
          subscription: JSON.stringify(subscription),
          created_at: new Date().toISOString()
        }
      ]);
    
    if (error) {
      console.error('❌ Failed to save subscription:', error);
    } else {
      console.log('✅ Subscription saved to backend');
    }
  }
}

// Unsubscribe from push notifications
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  
  if (subscription) {
    await subscription.unsubscribe();
    console.log('✅ Unsubscribed from push notifications');
    return true;
  }
  
  return false;
}

// Send a test notification
export function sendTestNotification() {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('SoniBaze Digital', {
      body: 'Push notifications are working! 🎉',
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      vibrate: [100, 50, 100]
    });
  }
}