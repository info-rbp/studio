'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { useMemo, type DependencyList } from 'react';

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  const isConfigured = getApps().length > 0;
  const app = isConfigured ? getApp() : initializeApp(firebaseConfig);
  return getSdks(app);
}

export function getSdks(firebaseApp: FirebaseApp) {
  const auth = getAuth(firebaseApp);
  const firestore = getFirestore(firebaseApp);

  if (process.env.NODE_ENV === 'development') {
    // This code will only run in development
    // and will be tree-shaken from the production build.
    try {
        // IMPORTANT: Do not move these connect calls outside of the DEV block.
        // They should only run in development.
        console.log("Connecting to local Firebase emulators.");
        // connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
        // connectFirestoreEmulator(firestore, 'localhost', 9098);
    } catch (e: any) {
        // The "already-initialized" errors are expected if hot-reloading.
        if (e.code !== 'auth/emulator-config-failed' && e.code !== 'firestore/emulator-config-failed') {
            console.warn("Warning: Could not connect to Firebase emulators. This is expected if they are not running.", e);
        }
    }
  }

  return {
    firebaseApp,
    auth,
    firestore,
  };
}


export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T {
    const memoized = useMemo(factory, deps);
    if(typeof memoized === 'object' && memoized !== null) {
      (memoized as any).__memo = true;
    }
    return memoized;
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './auth/use-user';
export * from './non-blocking-updates';
export * from './errors';
export * from './error-emitter';
