'use client';

import { FileText, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WithId } from '@/firebase';
import { Project } from '@/lib/types';
import { format } from 'date-fns';

interface ProjectListProps {
  projects: WithId<Project>[] | null;
  isLoading: boolean;
}

export function ProjectList({ projects, isLoading }: ProjectListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
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
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <Card key={project.id} className="flex flex-col">
          <CardHeader>
            <CardTitle>{project.projectName}</CardTitle>
            <CardDescription>{project.client || 'No client specified'}</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Contract Type:</span>
                <span className="font-medium text-foreground">{project.contractType}</span>
              </div>
              <div className="flex justify-between">
                <span>Clearance:</span>
                <span className="font-medium text-foreground">{project.requiredClearance}</span>
              </div>
               <div className="flex justify-between">
                <span>Timeline:</span>
                <span className="font-medium text-foreground">
                    {format(project.projectStartDate.toDate(), 'MMM yyyy')} - {format(project.projectEndDate.toDate(), 'MMM yyyy')}
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" disabled>Open Project (soon)</Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
