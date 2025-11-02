'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { Auth, onAuthStateChanged, signInAnonymously, User } from 'firebase/auth';
import { Firestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { UserProfile } from './auth/use-user';

// Initialize Firebase services once when the module is loaded.
const firebaseServices = initializeFirebase();

/**
 * Ensures a user profile document exists in Firestore.
 * Creates one if it doesn't.
 * @param firestore Firestore instance
 * @param user The authenticated user object
 */
const ensureUserProfile = async (firestore: Firestore, user: User): Promise<void> => {
    const userDocRef = doc(firestore, 'users', user.uid);
    try {
        const docSnap = await getDoc(userDocRef);
        if (!docSnap.exists()) {
            const newUserProfile: UserProfile = {
                id: user.uid,
                fullName: user.displayName || 'Anonymous User',
                email: user.email || null,
                accessLevel: 'Tender Lead', // Default access level
                isDeletable: true,
                isAnonymous: user.isAnonymous,
                createdAt: serverTimestamp(),
            };
            await setDoc(userDocRef, newUserProfile);
        }
    } catch (error) {
        console.error("Critical: Failed to ensure user profile exists.", error);
        // This is a critical failure. The app may not function correctly.
        // We could throw here to halt rendering, or allow it to continue with a broken state.
    }
};


export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const auth = firebaseServices.auth;
    const firestore = firebaseServices.firestore;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in. Ensure their profile exists.
        await ensureUserProfile(firestore, user);
        // Authentication and profile check is complete.
        setIsLoading(false);
        setError(null);
      } else {
        // No user is signed in. Attempt to sign in anonymously.
        try {
          await signInAnonymously(auth);
          // The onAuthStateChanged listener will be called again with the new user,
          // at which point the profile will be created and isLoading will be set to false.
        } catch (authError) {
          console.error("Critical: Anonymous sign-in failed:", authError);
          setError("Could not authenticate with the server. Please try again later.");
          setIsLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);


  if (isLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Connecting to the server...</p>
      </div>
    );
  }

  if (error) {
     return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background p-4 text-center">
        <h1 className="text-xl font-semibold text-destructive">Connection Error</h1>
        <p className="text-muted-foreground">{error}</p>
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
