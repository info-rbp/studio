'use client';

import { useState, useEffect } from 'react';
import { Firestore, doc, onSnapshot, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';

// Define the shape of the user profile data stored in Firestore
export interface UserProfile {
  id: string;
  fullName: string;
  email: string | null; // Can be null for anonymous
  accessLevel: 'Tender Lead' | 'Manager' | 'Admin';
  isDeletable: boolean;
  isAnonymous: boolean;
  createdAt: any; // Can be Timestamp
}

// Internal state for user authentication
export interface UserAuthState {
  user: User | null;
  userProfile: UserProfile | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// Return type for useUser() - specific to user auth state
export interface UserHookResult { 
  user: User | null;
  userProfile: UserProfile | null;
  isUserLoading: boolean;
  userError: Error | null;
}


/**
 * Hook that manages the user's authentication state and their Firestore profile.
 * @param auth Firebase Auth instance.
 * @param firestore Firestore instance.
 * @returns {UserAuthState} The user's authentication state.
 */
export const useUser = (auth: Auth, firestore: Firestore): UserAuthState => {
  const [userAuthState, setUserAuthState] = useState<UserAuthState>({
    user: null,
    userProfile: null,
    isUserLoading: true,
    userError: null,
  });

  useEffect(() => {
    if (!auth || !firestore) {
      setUserAuthState({ user: null, userProfile: null, isUserLoading: false, userError: new Error("Auth or Firestore service not provided.") });
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        if (firebaseUser) {
          const userDocRef = doc(firestore, 'users', firebaseUser.uid);
          
          // Set up the real-time listener for the profile first
          const unsubscribeProfile = onSnapshot(userDocRef, 
            async (docSnap) => {
              if (docSnap.exists()) {
                setUserAuthState({ 
                  user: firebaseUser, 
                  userProfile: docSnap.data() as UserProfile, 
                  isUserLoading: false, 
                  userError: null 
                });
              } else {
                 // Document doesn't exist, so create it.
                const newUserProfile: UserProfile = {
                  id: firebaseUser.uid,
                  fullName: firebaseUser.displayName || 'Anonymous User',
                  email: firebaseUser.email || null, // Will be null for anonymous
                  accessLevel: 'Tender Lead', // All new users default to base level
                  isDeletable: true,
                  isAnonymous: firebaseUser.isAnonymous,
                  createdAt: serverTimestamp(),
                };
                try {
                  await setDoc(userDocRef, newUserProfile);
                  console.log(`Created user document for anonymous user: ${firebaseUser.uid}`);
                  // The listener will pick up the new document and update the state.
                } catch (error) {
                  console.error("Failed to create user document:", error);
                  setUserAuthState({ user: firebaseUser, userProfile: null, isUserLoading: false, userError: error as Error });
                }
              }
            },
            (error) => {
               console.error("onSnapshot error for user profile:", error);
               setUserAuthState({ user: firebaseUser, userProfile: null, isUserLoading: false, userError: error });
            }
          );
          
          return () => unsubscribeProfile();

        } else {
          // User is signed out
          setUserAuthState({ user: null, userProfile: null, isUserLoading: false, userError: null });
        }
      },
      (error) => {
        console.error("onAuthStateChanged error:", error);
        setUserAuthState({ user: null, userProfile: null, isUserLoading: false, userError: error });
      }
    );

    return () => unsubscribeAuth();
  }, [auth, firestore]);

  return userAuthState;
};
