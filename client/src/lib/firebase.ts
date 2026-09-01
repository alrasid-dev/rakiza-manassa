import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getMessaging, isSupported, type Messaging } from "firebase/messaging";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
};

export const firebaseWebConfigReady = Object.values(config).every(value => Boolean(value));
let app: FirebaseApp | null = null;
let messagingPromise: Promise<Messaging | null> | null = null;
let auth: Auth | null = null;

export function getFirebaseAuth() {
  if (!firebaseWebConfigReady) return null;
  app ??= initializeApp(config);
  auth ??= getAuth(app);
  return auth;
}

export function getFirebaseMessaging() {
  if (!firebaseWebConfigReady) return Promise.resolve(null);
  if (!messagingPromise) {
    messagingPromise = isSupported().then(supported => {
      if (!supported) return null;
      app ??= initializeApp(config);
      return getMessaging(app);
    }).catch(() => null);
  }
  return messagingPromise;
}

export const firebaseVapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined;
