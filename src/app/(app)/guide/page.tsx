'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"


export default function GuidePage() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>User Guide</CardTitle>
          <CardDescription>
            A step-by-step guide to using the JL2G Costing Platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Step 1: Creating a Project</AccordionTrigger>
              <AccordionContent>
                To begin, navigate to the Dashboard and click the "Create New Project" button. You can choose to start a blank project, generate one with AI, or duplicate an existing project.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Step 2: Building the Cost Structure</AccordionTrigger>
              <AccordionContent>
                Once a project is created, you will be taken to the Project Workspace. Here you can define the Work Breakdown Structure (WBS), add labor line items from the personnel database, and include material costs.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Step 3: Reviewing Reports</AccordionTrigger>
              <AccordionContent>
                The platform auto-generates several key reports, including an Executive Summary, Cash Flow, and Profit & Loss statement. Access these from the "Reports" tab within your project.
              </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-4">
              <AccordionTrigger>Admin: Managing Master Data</AccordionTrigger>
              <AccordionContent>
                Administrators can manage the master lists for Personnel, Materials, and Milestone Templates via the "Admin" section. This data is then available for all users to select when building projects.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
