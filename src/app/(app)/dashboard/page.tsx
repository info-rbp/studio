import { ProjectCreationWizard } from '@/components/project-creation-wizard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Project Workspace</h1>
        <ProjectCreationWizard />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>My Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted bg-card p-12 text-center">
            <div className="rounded-full border border-dashed p-4">
              <FileText className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold">No Projects Yet</h3>
            <p className="text-muted-foreground">
              Get started by creating your first project.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
