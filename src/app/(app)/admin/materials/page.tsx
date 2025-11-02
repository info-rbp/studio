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
const materialSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  classification: z.string().min(1, 'Classification is required.'),
  costType: z.string().min(1, 'Cost Type is required.'),
  defaultUnitCost: z.coerce.number().min(0, 'Default unit cost must be a positive number.'),
});
type MaterialFormData = z.infer<typeof materialSchema>;

const classificationSchema = z.object({
  name: z.string().min(1, 'Classification name is required.'),
});
type ClassificationFormData = z.infer<typeof classificationSchema>;

const costTypeSchema = z.object({
  name: z.string().min(1, 'Cost type name is required.'),
});
type CostTypeFormData = z.infer<typeof costTypeSchema>;


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


// Main Materials Page Component
export default function MaterialsSettingsPage() {
  const [isMaterialDialogOpen, setIsMaterialDialogOpen] = useState(false);
  const firestore = useFirestore();

  // Data fetching
  const materialCollectionRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'workspaces/jl2g/materials') : null),
    [firestore]
  );
  const classificationsCollectionRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'workspaces/jl2g/materialClassifications') : null),
    [firestore]
  );
  const costTypesCollectionRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'workspaces/jl2g/costTypes') : null),
    [firestore]
  );

  const { data: materials, isLoading: isLoadingMaterials } = useCollection<MaterialFormData>(materialCollectionRef);
  const { data: classifications } = useCollection(classificationsCollectionRef);
  const { data: costTypes } = useCollection(costTypesCollectionRef);

  const materialForm = useForm<MaterialFormData>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      name: '',
      classification: '',
      costType: '',
      defaultUnitCost: 0,
    },
  });

  const onMaterialSubmit = (data: MaterialFormData) => {
    if (!materialCollectionRef) return;
    addDocumentNonBlocking(materialCollectionRef, data);
    materialForm.reset();
    setIsMaterialDialogOpen(false);
  };

  return (
    <div className="flex flex-1 flex-col gap-4">
      <h1 className="text-2xl font-bold">Manage Materials</h1>
        <Tabs defaultValue="materials">
          <TabsList>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="classifications">Material Classification</TabsTrigger>
            <TabsTrigger value="costTypes">Cost Type</TabsTrigger>
          </TabsList>
          
          <TabsContent value="materials" className="mt-4">
             <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    Materials List
                     <Dialog open={isMaterialDialogOpen} onOpenChange={setIsMaterialDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="gap-1">
                          <PlusCircle className="h-3.5 w-3.5" />
                          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                            Add Material
                          </span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[625px]">
                        <DialogHeader>
                          <DialogTitle>Add New Material</DialogTitle>
                          <DialogDescription>
                            Fill in the details for the new material.
                          </DialogDescription>
                        </DialogHeader>
                        <Form {...materialForm}>
                          <form onSubmit={materialForm.handleSubmit(onMaterialSubmit)} className="space-y-4">
                            <FormField
                              control={materialForm.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Material Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g., Acrobat Pro License" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                control={materialForm.control}
                                name="classification"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Classification</FormLabel>
                                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                            <SelectValue placeholder="Select a classification" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {classifications?.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                                <FormField
                                control={materialForm.control}
                                name="costType"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Cost Type</FormLabel>
                                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                            <SelectValue placeholder="Select a cost type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {costTypes?.map(ct => <SelectItem key={ct.id} value={ct.name}>{ct.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                            </div>
                            <FormField
                                control={materialForm.control}
                                name="defaultUnitCost"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Default Unit Cost ($)</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                            <DialogFooter>
                              <Button type="button" variant="outline" onClick={() => setIsMaterialDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button type="submit">Save Material</Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </CardTitle>
                    <CardDescription>
                        Define purchasable, non-labor items for your projects.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Classification</TableHead>
                        <TableHead>Cost Type</TableHead>
                        <TableHead className="text-right">Default Unit Cost</TableHead>
                        <TableHead>
                            <span className="sr-only">Actions</span>
                        </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoadingMaterials && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center">
                            Loading materials...
                            </TableCell>
                        </TableRow>
                        )}
                        {!isLoadingMaterials && !materials?.length ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center">
                            No materials found. Get started by adding one.
                            </TableCell>
                        </TableRow>
                        ) : (
                        materials?.map((m) => (
                            <TableRow key={m.id}>
                            <TableCell className="font-medium">{m.name}</TableCell>
                            <TableCell>{m.classification}</TableCell>
                            <TableCell>{m.costType}</TableCell>
                            <TableCell className="text-right">
                                ${m.defaultUnitCost.toFixed(2)}
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

          <TabsContent value="classifications" className="mt-4">
             <InputControlManager 
                schema={classificationSchema}
                collectionName="materialClassifications"
                formTitle="Classification"
                formLabel="Classification Name"
             />
          </TabsContent>

          <TabsContent value="costTypes" className="mt-4">
              <InputControlManager 
                schema={costTypeSchema}
                collectionName="costTypes"
                formTitle="Cost Type"
                formLabel="Cost Type Name"
             />
          </TabsContent>
        </Tabs>
    </div>
  );
}