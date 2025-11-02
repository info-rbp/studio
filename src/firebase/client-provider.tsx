'use client';

import React, { useMemo, type ReactNode, useState, useEffect } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { Loader2 } from 'lucide-react';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);

  const firebaseServices = useMemo(() => {
    return initializeFirebase();
  }, []); 

  useEffect(() => {
    if (hasInitialized) return;

    const auth = getAuth(firebaseServices.firebaseApp);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in (either normally or anonymously).
        setIsLoading(false);
        setHasInitialized(true);
      } else {
        // No user is signed in. Attempt to sign in anonymously.
        try {
          await signInAnonymously(auth);
          // The onAuthStateChanged listener will be called again with the new user,
          // at which point isLoading will be set to false.
        } catch (error) {
          console.error("Critical: Anonymous sign-in failed:", error);
          // Handle critical error, maybe show an error screen
          setIsLoading(false);
          setHasInitialized(true);
        }
      }
    });

    return () => unsubscribe();
  }, [firebaseServices, hasInitialized]);


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
