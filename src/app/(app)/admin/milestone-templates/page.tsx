'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusCircle, MoreHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';

// Zod schema for the milestone template form
const milestoneTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
});

type MilestoneTemplateFormData = z.infer<typeof milestoneTemplateSchema>;

export default function MilestoneTemplatesSettingsPage() {
  const [isMilestoneDialogOpen, setIsMilestoneDialogOpen] = useState(false);
  const firestore = useFirestore();

  // Milestone Template data
  const milestoneTemplateCollectionRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'workspaces/jl2g/milestoneTemplates') : null),
    [firestore]
  );
  const { data: milestoneTemplates, isLoading: isLoadingMilestoneTemplates } = useCollection<MilestoneTemplateFormData>(milestoneTemplateCollectionRef);

  const milestoneTemplateForm = useForm<MilestoneTemplateFormData>({
    resolver: zodResolver(milestoneTemplateSchema),
    defaultValues: {
      name: '',
    },
  });

  const onMilestoneTemplateSubmit = (data: MilestoneTemplateFormData) => {
    if (!milestoneTemplateCollectionRef) return;
    addDocumentNonBlocking(milestoneTemplateCollectionRef, data);
    milestoneTemplateForm.reset();
    setIsMilestoneDialogOpen(false);
  };

  return (
    <div className="flex flex-1 flex-col gap-4">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Manage Milestone Templates</h1>
            <Dialog open={isMilestoneDialogOpen} onOpenChange={setIsMilestoneDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Add Template
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Milestone Template</DialogTitle>
                </DialogHeader>
                <Form {...milestoneTemplateForm}>
                  <form onSubmit={milestoneTemplateForm.handleSubmit(onMilestoneTemplateSubmit)} className="space-y-4">
                    <FormField
                      control={milestoneTemplateForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Template Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Project Initiation" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsMilestoneDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Save Template</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Milestone Templates List</CardTitle>
            <CardDescription>
                Manage preset WBS/milestone items for projects.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingMilestoneTemplates && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center">
                      Loading templates...
                    </TableCell>
                  </TableRow>
                )}
                {!isLoadingMilestoneTemplates && !milestoneTemplates?.length ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center">
                      No milestone templates found.
                    </TableCell>
                  </TableRow>
                ) : (
                  milestoneTemplates?.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell>
                        <Button aria-haspopup="true" size="icon" variant="ghost" disabled>
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
    </div>
  );
}
