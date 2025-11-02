'use server';

import { aiProjectStarter } from '@/ai/flows/ai-project-starter';
import { projectSchema, type Project } from '@/lib/types';
import { ZodError } from 'zod';

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
    if (error instanceof ZodError) {
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
