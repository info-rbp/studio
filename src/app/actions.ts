'use server';

import { aiProjectStarter } from '@/ai/flows/ai-project-starter';
import { projectSchema, type Project } from '@/lib/types';
import { getAdminApp } from '@/firebase/admin';
import { z } from 'zod';
import { auth, firestore } from 'firebase-admin';
import { headers } from 'next/headers';


const newUserSchema = z.object({
  fullName: z.string().min(1, 'Full Name is required.'),
  email: z.string().email('Invalid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  accessLevel: z.enum(['Tender Lead', 'Manager', 'Admin']),
});
type NewUserFormData = z.infer<typeof newUserSchema>;


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

async function getUserIdFromToken() {
    getAdminApp();
    const headersList = headers();
    const authorization = headersList.get('Authorization');
    if (authorization?.startsWith('Bearer ')) {
        const idToken = authorization.split('Bearer ')[1];
        try {
            const decodedToken = await auth().verifyIdToken(idToken);
            return decodedToken.uid;
        } catch (error) {
            console.error('Error verifying token:', error);
            return null;
        }
    }
    return null;
}

export async function createProject(projectData: Project) {
  try {
    const ownerId = await getUserIdFromToken();
    if (!ownerId) {
      return { success: false, error: 'Authentication failed. Could not identify user.' };
    }
    
    const parsedData = projectSchema.parse(projectData);
    
    const projectWithMeta = {
      ...parsedData,
      ownerId: ownerId,
      createdAt: firestore.FieldValue.serverTimestamp(),
    }

    const docRef = await firestore().collection('projects').add(projectWithMeta);

    return { success: true, data: { ...projectWithMeta, id: docRef.id } };
  } catch (error) {
    console.error('Project creation failed:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid project data.', details: error.errors };
    }
    return { success: false, error: 'Failed to create project on the server.' };
  }
}

export async function createUser(userData: NewUserFormData) {
    try {
      getAdminApp();
  
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
      getAdminApp();
  
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
