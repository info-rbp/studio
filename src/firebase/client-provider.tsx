'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { Loader2 } from 'lucide-react';

// Initialize Firebase services once when the module is loaded.
const firebaseServices = initializeFirebase();

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth(firebaseServices.firebaseApp);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in (either normally or anonymously).
        // Authentication is complete.
        setIsLoading(false);
      } else {
        // No user is signed in. Attempt to sign in anonymously.
        try {
          await signInAnonymously(auth);
          // The onAuthStateChanged listener will be called again with the new user,
          // at which point isLoading will be set to false.
        } catch (error) {
          console.error("Critical: Anonymous sign-in failed:", error);
          // If sign-in fails, we stop loading but the app will be in a broken state.
          // This is a critical failure.
          setIsLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);


  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
