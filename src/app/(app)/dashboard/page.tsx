'use client';

import { ProjectCreationWizard } from '@/components/project-creation-wizard';
import { ProjectList } from '@/components/project-list';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const projectsQuery = useMemoFirebase(() => {
    if (firestore && user?.uid) {
      return query(collection(firestore, 'projects'), where('ownerId', '==', user.uid));
    }
    return null;
  }, [firestore, user?.uid]);

  const { data: projects, isLoading: isLoadingProjects } = useCollection(projectsQuery);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Project Workspace</h1>
        <ProjectCreationWizard />
      </div>
      <ProjectList projects={projects} isLoading={isUserLoading || isLoadingProjects} />
    </div>
  );
}
