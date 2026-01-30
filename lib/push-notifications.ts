import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

/**
 * Converts a base64 string to a Uint8Array
 */
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Subscribes the user to push notifications
 */
export async function subscribeToPushNotifications(storeSubscription: any) {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.log("Push notifications are not supported");
    return false;
  }

  if (!VAPID_PUBLIC_KEY) {
    console.error("VAPID Public Key is missing");
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }

    const sub = subscription.toJSON();
    
    // Send to backend
    if (sub.endpoint && sub.keys?.p256dh && sub.keys?.auth) {
        await storeSubscription({
            endpoint: sub.endpoint,
            p256dh: sub.keys.p256dh,
            auth: sub.keys.auth
        });
        return true;
    }
  } catch (error) {
    console.error("Failed to subscribe to push notifications:", error);
    return false;
  }
  return false;
}
