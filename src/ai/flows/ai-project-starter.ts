'use server';

/**
 * @fileOverview A flow to generate a draft project based on a short user description.
 *
 * - aiProjectStarter - A function that generates a draft project.
 * - AIProjectStarterInput - The input type for the aiProjectStarter function.
 * - AIProjectStarterOutput - The return type for the aiProjectStarter function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIProjectStarterInputSchema = z.object({
  description: z
    .string()
    .describe("A short description of the desired project, e.g., 'Build a 6-month Systems Engineering project for a Defence client, NV1 clearance required, on a Cost Plus basis'."),
});
export type AIProjectStarterInput = z.infer<typeof AIProjectStarterInputSchema>;

const AIProjectStarterOutputSchema = z.object({
  projectName: z.string().describe('The name of the project.'),
  contractType: z.string().describe('The contract type (e.g., Fixed Price, Cost Plus, Time & Materials (T&M)).'),
  securityClassification: z.string().describe('The security classification (e.g., Unclassified, Protected, Secret).'),
  requiredClearance: z.string().describe('The required security clearance (e.g., N/A, Baseline, NV1, NV2).'),
  projectStartDate: z.string().describe('The project start date (YYYY-MM-DD).'),
  projectEndDate: z.string().describe('The project end date (YYYY-MM-DD).'),
  defaultProfitMargin: z.number().describe('The default profit margin (%).'),
  managementReserve: z.number().describe('The management reserve (%).'),
  projectSpecificContingency: z.number().describe('The project-specific contingency (%).'),
  annualCostEscalationRate: z.number().describe('The annual cost escalation rate (%).'),
  defaultGstTreatment: z.string().describe('The default GST treatment (Exclusive/Inclusive).'),
  projectCurrency: z.string().describe('The project currency (AUD, USD, etc.).'),
  wbsPopulationMethod: z.string().describe('The WBS population method (Load from JL2 Templates, Build Custom WBS, Import from MS Project (CSV)).'),
});
export type AIProjectStarterOutput = z.infer<typeof AIProjectStarterOutputSchema>;

export async function aiProjectStarter(input: AIProjectStarterInput): Promise<AIProjectStarterOutput> {
  return aiProjectStarterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiProjectStarterPrompt',
  input: {schema: AIProjectStarterInputSchema},
  output: {schema: AIProjectStarterOutputSchema},
  prompt: `You are an AI Project Starter that helps Tender Leads generate draft projects based on a short description.

  Based on the description, create a draft project with the following details:

  Description: {{{description}}}

  Project Details (JSON):
  `,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
    ],
  },
});

const aiProjectStarterFlow = ai.defineFlow(
  {
    name: 'aiProjectStarterFlow',
    inputSchema: AIProjectStarterInputSchema,
    outputSchema: AIProjectStarterOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
