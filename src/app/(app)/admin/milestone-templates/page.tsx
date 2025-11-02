'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusCircle, Trash2, MoreHorizontal } from 'lucide-react';

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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { WithId } from '@/firebase/firestore/use-collection';

// Zod schemas
const milestoneTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
});
type MilestoneTemplateFormData = z.infer<typeof milestoneTemplateSchema>;

const subMilestoneTemplateSchema = z.object({
  wbsCode: z.string().min(1, 'WBS Code is required.'),
  name: z.string().min(1, 'Name is required.'),
});
type SubMilestoneTemplateFormData = z.infer<typeof subMilestoneTemplateSchema>;


export default function MilestoneTemplatesSettingsPage() {
  const [selectedMilestone, setSelectedMilestone] = useState<WithId<MilestoneTemplateFormData> | null>(null);
  const firestore = useFirestore();

  // Milestone Templates (Master)
  const milestoneTemplatesCollectionRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'workspaces/jl2g/milestoneTemplates') : null),
    [firestore]
  );
  const { data: milestoneTemplates, isLoading: isLoadingMilestones } = useCollection<MilestoneTemplateFormData>(milestoneTemplatesCollectionRef);
  
  const milestoneForm = useForm<MilestoneTemplateFormData>({
    resolver: zodResolver(milestoneTemplateSchema),
    defaultValues: { name: '' },
  });

  const onMilestoneSubmit = (data: MilestoneTemplateFormData) => {
    if (!milestoneTemplatesCollectionRef) return;
    addDocumentNonBlocking(milestoneTemplatesCollectionRef, data);
    milestoneForm.reset();
  };

  const deleteMilestone = (id: string) => {
      if(!firestore) return;
      // Note: This doesn't delete sub-collections in Firestore automatically.
      // A cloud function would be needed for that in a production app.
      deleteDocumentNonBlocking(doc(firestore, 'workspaces/jl2g/milestoneTemplates', id));
      if (selectedMilestone?.id === id) {
          setSelectedMilestone(null);
      }
  }

  // Sub-Milestone Templates (Detail)
  const subMilestonesCollectionRef = useMemoFirebase(
    () => (firestore && selectedMilestone ? collection(firestore, `workspaces/jl2g/milestoneTemplates/${selectedMilestone.id}/subMilestones`) : null),
    [firestore, selectedMilestone]
  );
  const { data: subMilestones, isLoading: isLoadingSubMilestones } = useCollection<SubMilestoneTemplateFormData>(subMilestonesCollectionRef);

  const subMilestoneForm = useForm<SubMilestoneTemplateFormData>({
    resolver: zodResolver(subMilestoneTemplateSchema),
    defaultValues: { wbsCode: '', name: '' },
  });

  const onSubMilestoneSubmit = (data: SubMilestoneTemplateFormData) => {
    if (!subMilestonesCollectionRef) return;
    addDocumentNonBlocking(subMilestonesCollectionRef, data);
    subMilestoneForm.reset();
  };

  const deleteSubMilestone = (id: string) => {
      if(!subMilestonesCollectionRef) return;
      deleteDocumentNonBlocking(doc(subMilestonesCollectionRef, id));
  }


  return (
    <div className="flex flex-1 flex-col gap-4">
        <h1 className="text-2xl font-bold">Manage Milestone Templates</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Master Panel */}
            <div className="md:col-span-1 flex flex-col gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Master Templates</CardTitle>
                        <CardDescription>Create and select master WBS templates.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...milestoneForm}>
                            <form onSubmit={milestoneForm.handleSubmit(onMilestoneSubmit)} className="flex items-start gap-2 mb-4">
                                <FormField
                                control={milestoneForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="flex-grow">
                                    <FormLabel className="sr-only">New Milestone Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Design Phase" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                                <Button type="submit" size="icon" aria-label="Add Milestone"><PlusCircle className="h-4 w-4" /></Button>
                            </form>
                        </Form>
                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoadingMilestones && <TableRow><TableCell colSpan={2} className="text-center">Loading...</TableCell></TableRow>}
                                    {milestoneTemplates?.map((template) => (
                                        <TableRow 
                                            key={template.id} 
                                            onClick={() => setSelectedMilestone(template)}
                                            className={cn("cursor-pointer", selectedMilestone?.id === template.id && "bg-muted/50")}
                                        >
                                            <TableCell className="font-medium">{template.name}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); deleteMilestone(template.id);}}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                         </div>
                    </CardContent>
                </Card>
            </div>

            {/* Detail Panel */}
            <div className="md:col-span-2">
                 <Card>
                    <CardHeader>
                        <CardTitle>Sub-Milestones</CardTitle>
                        <CardDescription>
                            {selectedMilestone ? `Manage sub-milestones for "${selectedMilestone.name}"` : "Select a master template to see its sub-milestones."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {selectedMilestone ? (
                            <>
                                <Form {...subMilestoneForm}>
                                    <form onSubmit={subMilestoneForm.handleSubmit(onSubMilestoneSubmit)} className="flex items-start gap-2 mb-4">
                                        <FormField control={subMilestoneForm.control} name="wbsCode" render={({ field }) => (
                                            <FormItem><FormLabel className="sr-only">WBS</FormLabel><FormControl><Input placeholder="WBS (e.g., 1.1)" {...field} /></FormControl><FormMessage /></FormItem>
                                        )}/>
                                        <FormField control={subMilestoneForm.control} name="name" render={({ field }) => (
                                            <FormItem className="flex-grow"><FormLabel className="sr-only">Sub-Milestone Name</FormLabel><FormControl><Input placeholder="e.g., Preliminary Design Review" {...field} /></FormControl><FormMessage /></FormItem>
                                        )}/>
                                        <Button type="submit" size="icon" aria-label="Add Sub-Milestone"><PlusCircle className="h-4 w-4" /></Button>
                                    </form>
                                </Form>
                                <div className="border rounded-md">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>WBS</TableHead>
                                                <TableHead>Name</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {isLoadingSubMilestones && <TableRow><TableCell colSpan={3} className="text-center">Loading...</TableCell></TableRow>}
                                            {!isLoadingSubMilestones && !subMilestones?.length ? (
                                                <TableRow><TableCell colSpan={3} className="text-center">No sub-milestones found.</TableCell></TableRow>
                                            ) : (
                                                subMilestones?.map((sub) => (
                                                    <TableRow key={sub.id}>
                                                        <TableCell>{sub.wbsCode}</TableCell>
                                                        <TableCell className="font-medium">{sub.name}</TableCell>
                                                        <TableCell className="text-right">
                                                            <Button variant="ghost" size="icon" onClick={() => deleteSubMilestone(sub.id)}>
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </>
                        ) : (
                             <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg">
                                <p className="text-muted-foreground">Select a milestone to begin</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
