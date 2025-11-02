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
  DialogDescription,
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

// Zod schema for the personnel form
const personnelSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  role: z.string().min(1, 'Role is required.'),
  level: z.string().min(1, 'Level is required.'),
  standardRate: z.coerce.number().min(0, 'Standard rate must be a positive number.'),
  clearanceLevel: z.string().min(1, 'Clearance level is required.'),
});

type PersonnelFormData = z.infer<typeof personnelSchema>;


export default function PersonnelSettingsPage() {
  const [isPersonnelDialogOpen, setIsPersonnelDialogOpen] = useState(false);
  const firestore = useFirestore();

  // Personnel data
  const personnelCollectionRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'workspaces/jl2g/personnel') : null),
    [firestore]
  );
  const { data: personnel, isLoading: isLoadingPersonnel } = useCollection<PersonnelFormData>(personnelCollectionRef);

  const personnelForm = useForm<PersonnelFormData>({
    resolver: zodResolver(personnelSchema),
    defaultValues: {
      name: '',
      role: '',
      level: '',
      standardRate: 0,
      clearanceLevel: '',
    },
  });

  const onPersonnelSubmit = (data: PersonnelFormData) => {
    if (!personnelCollectionRef) return;
    addDocumentNonBlocking(personnelCollectionRef, data);
    personnelForm.reset();
    setIsPersonnelDialogOpen(false);
  };
  

  return (
    <div className="flex flex-1 flex-col gap-4">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Manage Personnel</h1>
             <Dialog open={isPersonnelDialogOpen} onOpenChange={setIsPersonnelDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Add Personnel
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Personnel</DialogTitle>
                  <DialogDescription>
                    Fill in the details for the new team member.
                  </DialogDescription>
                </DialogHeader>
                <Form {...personnelForm}>
                  <form onSubmit={personnelForm.handleSubmit(onPersonnelSubmit)} className="space-y-4">
                    <FormField
                      control={personnelForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Jane Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={personnelForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Senior Systems Engineer" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={personnelForm.control}
                        name="level"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Level</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., C6" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={personnelForm.control}
                        name="clearanceLevel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Clearance</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., NV1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={personnelForm.control}
                      name="standardRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Standard Rate ($/hr)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsPersonnelDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Save Personnel</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
        </div>
      <Card>
          <CardHeader>
            <CardTitle>Personnel List</CardTitle>
              <CardDescription>
                Add, edit, and manage your organization's personnel.
              </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Clearance</TableHead>
                  <TableHead className="text-right">Standard Rate</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingPersonnel && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Loading personnel...
                    </TableCell>
                  </TableRow>
                )}
                {!isLoadingPersonnel && !personnel?.length ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No personnel found. Get started by adding one.
                    </TableCell>
                  </TableRow>
                ) : (
                  personnel?.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{p.role}</TableCell>
                      <TableCell>{p.level}</TableCell>
                      <TableCell>{p.clearanceLevel}</TableCell>
                      <TableCell className="text-right">
                        ${p.standardRate.toFixed(2)}
                      </TableCell>
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
