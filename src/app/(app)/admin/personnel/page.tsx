'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusCircle, MoreHorizontal, Trash2 } from 'lucide-react';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';

// Zod schemas
const personnelSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  role: z.string().min(1, 'Role is required.'),
  level: z.string().min(1, 'Level is required.'),
  standardRate: z.coerce.number().min(0, 'Standard rate must be a positive number.'),
  clearanceLevel: z.enum(['N/A', 'Baseline', 'NV1', 'NV2']),
  engagementType: z.enum(['Full-Time', 'Part-Time', 'Subcontractor']),
});
type PersonnelFormData = z.infer<typeof personnelSchema>;

const roleSchema = z.object({
  name: z.string().min(1, 'Role name is required.'),
});
type RoleFormData = z.infer<typeof roleSchema>;

const levelSchema = z.object({
  name: z.string().min(1, 'Level name is required.'),
});
type LevelFormData = z.infer<typeof levelSchema>;

// Input Control Management Component
function InputControlManager({ schema, collectionName, formTitle, formLabel }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const firestore = useFirestore();
  const collectionRef = useMemoFirebase(
    () => (firestore ? collection(firestore, `workspaces/jl2g/${collectionName}`) : null),
    [firestore, collectionName]
  );
  const { data: items, isLoading } = useCollection(collectionRef);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '' },
  });

  const onSubmit = (data: { name: string }) => {
    if (!collectionRef) return;
    addDocumentNonBlocking(collectionRef, data);
    form.reset();
    setIsOpen(false);
  };
  
  const handleDelete = (id: string) => {
    if(!firestore) return;
    const docRef = doc(firestore, `workspaces/jl2g/${collectionName}`, id);
    deleteDocumentNonBlocking(docRef);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{formTitle} List</span>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Add {formTitle}
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New {formTitle}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{formLabel}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Save</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={2} className="text-center">Loading...</TableCell></TableRow>}
            {!isLoading && !items?.length && <TableRow><TableCell colSpan={2} className="text-center">No items found.</TableCell></TableRow>}
            {items?.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}


// Main Personnel Page Component
export default function PersonnelSettingsPage() {
  const [isPersonnelDialogOpen, setIsPersonnelDialogOpen] = useState(false);
  const firestore = useFirestore();

  // Data fetching
  const personnelCollectionRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'workspaces/jl2g/personnel') : null),
    [firestore]
  );
  const rolesCollectionRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'workspaces/jl2g/roles') : null),
    [firestore]
  );
  const levelsCollectionRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'workspaces/jl2g/levels') : null),
    [firestore]
  );

  const { data: personnel, isLoading: isLoadingPersonnel } = useCollection<PersonnelFormData>(personnelCollectionRef);
  const { data: roles } = useCollection(rolesCollectionRef);
  const { data: levels } = useCollection(levelsCollectionRef);

  const personnelForm = useForm<PersonnelFormData>({
    resolver: zodResolver(personnelSchema),
    defaultValues: {
      name: '',
      role: '',
      level: '',
      standardRate: 0,
      clearanceLevel: 'N/A',
      engagementType: 'Full-Time',
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
      <h1 className="text-2xl font-bold">Manage Personnel</h1>
        <Tabs defaultValue="personnel">
          <TabsList>
            <TabsTrigger value="personnel">Personnel</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="levels">Employee Levels</TabsTrigger>
          </TabsList>
          
          {/* Manage Personnel Tab */}
          <TabsContent value="personnel" className="mt-4">
             <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    Personnel List
                     <Dialog open={isPersonnelDialogOpen} onOpenChange={setIsPersonnelDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="gap-1">
                          <PlusCircle className="h-3.5 w-3.5" />
                          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                            Add Personnel
                          </span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[625px]">
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
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                control={personnelForm.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Role</FormLabel>
                                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                            <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {roles?.map(r => <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                                <FormField
                                control={personnelForm.control}
                                name="level"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Employee Level</FormLabel>
                                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                            <SelectValue placeholder="Select a level" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {levels?.map(l => <SelectItem key={l.id} value={l.name}>{l.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                            </div>
                             <div className="grid grid-cols-2 gap-4">
                                <FormField
                                control={personnelForm.control}
                                name="clearanceLevel"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Security Clearance</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="N/A">N/A</SelectItem>
                                            <SelectItem value="Baseline">Baseline</SelectItem>
                                            <SelectItem value="NV1">NV1</SelectItem>
                                            <SelectItem value="NV2">NV2</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
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
                            </div>
                            <FormField
                                control={personnelForm.control}
                                name="engagementType"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Engagement Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="Full-Time">Full-Time</SelectItem>
                                            <SelectItem value="Part-Time">Part-Time</SelectItem>
                                            <SelectItem value="Subcontractor">Subcontractor</SelectItem>
                                        </SelectContent>
                                    </Select>
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
                  </CardTitle>
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
                        <TableHead>Engagement Type</TableHead>
                        <TableHead className="text-right">Standard Rate</TableHead>
                        <TableHead>
                            <span className="sr-only">Actions</span>
                        </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoadingPersonnel && (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center">
                            Loading personnel...
                            </TableCell>
                        </TableRow>
                        )}
                        {!isLoadingPersonnel && !personnel?.length ? (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center">
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
                            <TableCell>{p.engagementType}</TableCell>
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
          </TabsContent>

          {/* Manage Roles Tab */}
          <TabsContent value="roles" className="mt-4">
             <InputControlManager 
                schema={roleSchema}
                collectionName="roles"
                formTitle="Role"
                formLabel="Role Name"
             />
          </TabsContent>

          {/* Manage Levels Tab */}
          <TabsContent value="levels" className="mt-4">
              <InputControlManager 
                schema={levelSchema}
                collectionName="levels"
                formTitle="Level"
                formLabel="Level Name"
             />
          </TabsContent>
        </Tabs>
    </div>
  );
}
