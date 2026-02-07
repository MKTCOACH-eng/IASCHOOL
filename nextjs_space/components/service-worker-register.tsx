'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });

        console.log('[App] Service Worker registered:', registration.scope);

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              toast('Nueva versión disponible', {
                description: 'Actualiza para obtener las últimas mejoras.',
                action: {
                  label: 'Actualizar',
                  onClick: () => window.location.reload()
                },
                duration: 10000
              });
            }
          });
        });

        // Request notification permission after user interaction
        const requestNotificationPermission = async () => {
          if ('Notification' in window && Notification.permission === 'default') {
            // Only ask after some engagement
            const hasEngaged = sessionStorage.getItem('user-engaged');
            if (hasEngaged) {
              const permission = await Notification.requestPermission();
              console.log('[App] Notification permission:', permission);
            }
          }
        };

        // Mark engagement on first interaction
        const markEngagement = () => {
          sessionStorage.setItem('user-engaged', 'true');
          document.removeEventListener('click', markEngagement);
          setTimeout(requestNotificationPermission, 5000);
        };

        document.addEventListener('click', markEngagement, { once: true });

      } catch (error) {
        console.error('[App] Service Worker registration failed:', error);
      }
    };

    // Register after page load
    if (document.readyState === 'complete') {
      registerSW();
    } else {
      window.addEventListener('load', registerSW);
      return () => window.removeEventListener('load', registerSW);
    }
  }, []);

  return null;
}

// Hook for push subscription management
export function usePushSubscription() {
  const subscribe = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('[Push] Push messaging not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Check existing subscription
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        // Get VAPID public key from server
        const response = await fetch('/api/push/vapid-public-key');
        if (!response.ok) {
          console.warn('[Push] VAPID key not configured');
          return null;
        }
        
        const { publicKey } = await response.json();
        
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey)
        });

        // Send subscription to server
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription)
        });
      }

      return subscription;
    } catch (error) {
      console.error('[Push] Subscription failed:', error);
      return null;
    }
  };

  const unsubscribe = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        
        // Notify server
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint })
        });
      }
    } catch (error) {
      console.error('[Push] Unsubscribe failed:', error);
    }
  };

  return { subscribe, unsubscribe };
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
