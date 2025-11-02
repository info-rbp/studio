'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plug } from 'lucide-react';

export default function IntegrationsManagementPage() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <h1 className="text-2xl font-bold">Integrations Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>Third-Party Integrations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted bg-card p-12 text-center">
            <div className="rounded-full border border-dashed p-4">
              <Plug className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold">Integrations Coming Soon</h3>
            <p className="text-muted-foreground">
              This section will be used to manage integrations with other services.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
