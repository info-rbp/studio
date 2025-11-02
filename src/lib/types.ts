import { z } from 'zod';

export const projectSchema = z.object({
  projectName: z.string().min(1, 'Project Name is required.'),
  tenderId: z.string().optional(),
  client: z.string().optional(),
  contractType: z.enum(['Fixed Price', 'Cost Plus', 'Time & Materials (T&M)']),
  securityClassification: z.enum(['Unclassified', 'Protected', 'Secret']),
  projectStartDate: z.date(),
  projectEndDate: z.date(),
  wbsPopulationMethod: z.enum(['Load from JL2 Templates', 'Build Custom WBS', 'Import from MS Project (CSV)']),
  defaultProfitMargin: z.number().min(0).max(100),
  managementReserve: z.number().min(0).max(100),
  projectSpecificContingency: z.number().min(0).max(100),
  annualCostEscalationRate: z.number().min(0).max(100),
  defaultGstTreatment: z.enum(['Exclusive', 'Inclusive']),
  projectCurrency: z.string().min(3, 'Currency code should be 3 letters.'),
  requiredClearance: z.enum(['N/A', 'Baseline', 'NV1', 'NV2']),
});

export type Project = z.infer<typeof projectSchema>;
