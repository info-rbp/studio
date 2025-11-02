'use client';

import { useState, useEffect } from 'react';
import { Firestore, doc, onSnapshot } from 'firebase/firestore';
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
 * It assumes that FirebaseClientProvider has already handled the initial authentication
 * and user profile creation. This hook is for reading the real-time state.
 * @param auth Firebase Auth instance.
 * @param firestore Firestore instance.
 * @returns {UserAuthState} The user's authentication state.
 */
export const useUser = (auth: Auth, firestore: Firestore): UserAuthState => {
  const [userAuthState, setUserAuthState] = useState<UserAuthState>({
    user: auth.currentUser, // Start with the already authenticated user
    userProfile: null,
    isUserLoading: true,
    userError: null,
  });

  useEffect(() => {
    if (!auth || !firestore) {
      setUserAuthState({ user: null, userProfile: null, isUserLoading: false, userError: new Error("Auth or Firestore service not provided.") });
      return;
    }

    const firebaseUser = auth.currentUser;

    if (firebaseUser) {
        // Set up the real-time listener for the user profile.
        const userDocRef = doc(firestore, 'users', firebaseUser.uid);
        const unsubscribeProfile = onSnapshot(userDocRef, (doc) => {
           if (doc.exists()) {
             setUserAuthState({
                user: firebaseUser,
                userProfile: doc.data() as UserProfile,
                isUserLoading: false,
                userError: null,
              });
           } else {
             // This case should theoretically not be hit if FirebaseClientProvider works correctly,
             // but it's a safeguard.
             setUserAuthState({ user: firebaseUser, userProfile: null, isUserLoading: false, userError: new Error("User profile document not found.") });
           }
        }, (error) => {
            console.error("onSnapshot error for user profile:", error);
            setUserAuthState({ user: firebaseUser, userProfile: null, isUserLoading: false, userError: error });
        });

        return () => unsubscribeProfile();
    } else {
        // This state indicates something went wrong during initial auth, as a user should always be present.
        setUserAuthState({ user: null, userProfile: null, isUserLoading: false, userError: new Error("No authenticated user found.") });
    }

  }, [auth, firestore]);

  return userAuthState;
};
