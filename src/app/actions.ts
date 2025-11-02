'use server';

import { aiProjectStarter } from '@/ai/flows/ai-project-starter';
import { projectSchema, type Project } from '@/lib/types';
import { getAdminApp } from '@/firebase/admin';
import { z } from 'zod';
import { auth, firestore } from 'firebase-admin';

const newUserSchema = z.object({
  fullName: z.string().min(1, 'Full Name is required.'),
  email: z.string().email('Invalid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  accessLevel: z.enum(['Tender Lead', 'Manager', 'Admin']),
});
type NewUserFormData = z.infer<typeof newUserSchema>;


// TODO: Check if caller is an admin
// const checkIsAdmin = async (uid: string) => {
//   const userDoc = await firestore().collection('users').doc(uid).get();
//   if (!userDoc.exists || userDoc.data()?.accessLevel !== 'Admin') {
//     throw new Error('Permission denied. Not an admin.');
//   }
// }

export async function createProjectWithAI(description: string) {
  try {
    if (!description) {
      return { success: false, error: 'Description cannot be empty.' };
    }

    const aiResult = await aiProjectStarter({ description });

    const transformedResult = {
        ...aiResult,
        projectStartDate: aiResult.projectStartDate ? new Date(aiResult.projectStartDate) : new Date(),
        projectEndDate: aiResult.projectEndDate ? new Date(aiResult.projectEndDate) : new Date(),
    }
    
    // Validate AI output against our schema
    const parsed = projectSchema.parse(transformedResult);

    return { success: true, data: parsed };
  } catch (error) {
    if (error instanceof z.ZodError) {
        console.error('AI output validation failed:', error.errors);
        return { success: false, error: 'AI returned data in an unexpected format.' };
    }
    console.error('AI Project Starter failed:', error);
    return { success: false, error: 'Failed to generate project with AI.' };
  }
}

export async function createProject(projectData: Project) {
  try {
    const parsedData = projectSchema.parse(projectData);
    console.log('Project created successfully (mock):', parsedData);
    // Here you would typically save to Firestore
    // e.g., await db.collection('projects').add({ ...parsedData, ownerId: ... });
    return { success: true, data: parsedData };
  } catch (error) {
    console.error('Project creation failed:', error);
    return { success: false, error: 'Failed to create project.' };
  }
}

export async function createUser(userData: NewUserFormData) {
    try {
      getAdminApp(); // Ensure admin app is initialized
  
      // TODO: Add admin check here
  
      const userRecord = await auth().createUser({
        email: userData.email,
        password: userData.password,
        displayName: userData.fullName,
      });
  
      await firestore().collection('users').doc(userRecord.uid).set({
        id: userRecord.uid,
        fullName: userData.fullName,
        email: userData.email,
        accessLevel: userData.accessLevel,
        isDeletable: true,
        createdAt: new Date(),
        isAnonymous: false,
      });
  
      if (userData.accessLevel === 'Admin') {
        await firestore().collection('adminUsers').doc(userRecord.uid).set({
            isAdmin: true,
        });
      }

      return { success: true, data: { uid: userRecord.uid } };
    } catch (error: any) {
      console.error('User creation failed:', error);
      const errorMessage = error.code === 'auth/email-already-exists'
        ? 'A user with this email address already exists.'
        : error.message || 'Failed to create user.';
      return { success: false, error: errorMessage };
    }
}
  
export async function deleteUser(uidToDelete: string) {
    try {
      getAdminApp(); // Ensure admin app is initialized
  
      // TODO: Add admin check here
  
      const userDocRef = firestore().collection('users').doc(uidToDelete);
      const userDoc = await userDocRef.get();
  
      if (!userDoc.exists) {
        return { success: false, error: 'User not found in Firestore.' };
      }
  
      if (userDoc.data()?.isDeletable === false) {
        return { success: false, error: 'This user is protected and cannot be deleted.' };
      }
  
      await auth().deleteUser(uidToDelete);
      await userDocRef.delete();
      
      const adminUserDocRef = firestore().collection('adminUsers').doc(uidToDelete);
      if ((await adminUserDocRef.get()).exists) {
        await adminUserDocRef.delete();
      }
  
      return { success: true };
    } catch (error: any) {
      console.error('User deletion failed:', error);
      return { success: false, error: error.message || 'Failed to delete user.' };
    }
}

export async function seedInitialUser() {
    try {
        getAdminApp();
        const email = "info@remotebusinesspartner.com.au";
        let userRecord;

        try {
            userRecord = await auth().getUserByEmail(email);
        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
                console.log(`Creating user ${email} as they were not found.`);
                userRecord = await auth().createUser({
                    email: email,
                    password: "Foxtrot19!",
                    displayName: "Gianpaulo Coletti"
                });
            } else {
                // For other errors (e.g., network issues), rethrow them.
                throw error;
            }
        }

        const protectedUid = userRecord.uid;
        const userDocRef = firestore().collection('users').doc(protectedUid);
        const adminUserDocRef = firestore().collection('adminUsers').doc(protectedUid);
        const db = firestore();

        // Use a transaction to ensure atomicity
        await db.runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userDocRef);
            const adminDoc = await transaction.get(adminUserDocRef);

            if (!userDoc.exists) {
                console.log(`Creating Firestore user document for ${email}.`);
                transaction.set(userDocRef, {
                    id: protectedUid,
                    fullName: "Gianpaulo Coletti",
                    email: email,
                    accessLevel: "Admin", // Corrected Access Level
                    isDeletable: false,   // Ensure user is not deletable
                    createdAt: new Date(),
                    isAnonymous: false,
                });
            } else {
                // If the user doc exists, ensure the correct fields are set
                 transaction.update(userDocRef, {
                    accessLevel: "Admin",
                    isDeletable: false
                });
            }
            
            if (!adminDoc.exists) {
                console.log(`Creating admin record for ${email}.`);
                transaction.set(adminUserDocRef, { isAdmin: true });
            }
        });
        
        console.log(`User ${email} is correctly configured.`);
        return { success: true, message: `User ${email} is correctly configured.` };
    } catch (error: any) {
        console.error("Error seeding protected user:", error.message);
        return { success: false, error: "Failed to seed initial user." };
    }
}
