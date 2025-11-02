'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { FileInput, Coins } from 'lucide-react';

export default function IntegrationsManagementPage() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <h1 className="text-2xl font-bold">Integration Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>Third-Party Integrations</CardTitle>
          <CardDescription>
            Connect your JL2G Costing Platform to other services to streamline your workflow.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="ms-project">
            <TabsList>
              <TabsTrigger value="ms-project">Microsoft Project</TabsTrigger>
              <TabsTrigger value="xero">Xero</TabsTrigger>
            </TabsList>
            <TabsContent value="ms-project" className="mt-6">
              <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted bg-card p-16 text-center">
                <div className="rounded-full border border-dashed p-4">
                  <FileInput className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-700">
                  MS Project Integration Coming Soon
                </h3>
                <p className="mt-2 text-gray-500">
                  This section will allow you to import Work Breakdown Structures and task data directly from MS Project files.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="xero" className="mt-6">
               <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted bg-card p-16 text-center">
                <div className="rounded-full border border-dashed p-4">
                  <Coins className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-700">
                  Xero Integration Coming Soon
                </h3>
                <p className="mt-2 text-gray-500">
                  This section will allow you to sync actual project costs from your Xero account for real-time "Budget vs. Actual" reporting.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
