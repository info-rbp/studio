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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';


// Zod schema for the material form
const materialSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  defaultUnitCost: z.coerce.number().min(0, 'Default unit cost must be a positive number.'),
  costFrequency: z.enum(['Monthly', 'One-Time', 'Annual', 'Per Unit']),
});

type MaterialFormData = z.infer<typeof materialSchema>;


export default function MaterialsSettingsPage() {
  const [isMaterialDialogOpen, setIsMaterialDialogOpen] = useState(false);
  const firestore = useFirestore();

  const materialCollectionRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'workspaces/jl2g/materials') : null),
    [firestore]
  );
  const { data: materials, isLoading: isLoadingMaterials } = useCollection<MaterialFormData>(materialCollectionRef);

  const materialForm = useForm<MaterialFormData>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      name: '',
      defaultUnitCost: 0,
      costFrequency: 'One-Time',
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
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Manage Materials</h1>
            <Dialog open={isMaterialDialogOpen} onOpenChange={setIsMaterialDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Add Material
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent>
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
                          <FormLabel>Name</FormLabel>
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
                      <FormField
                        control={materialForm.control}
                        name="costFrequency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cost Frequency</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select frequency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="One-Time">One-Time</SelectItem>
                                <SelectItem value="Monthly">Monthly</SelectItem>
                                <SelectItem value="Annual">Annual</SelectItem>
                                <SelectItem value="Per Unit">Per Unit</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
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
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Materials List</CardTitle>
            <CardDescription>
                Define purchasable, non-labor items for your projects.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Cost Frequency</TableHead>
                  <TableHead className="text-right">Default Unit Cost</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingMaterials && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      Loading materials...
                    </TableCell>
                  </TableRow>
                )}
                {!isLoadingMaterials && !materials?.length ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No materials found. Get started by adding one.
                    </TableCell>
                  </TableRow>
                ) : (
                  materials?.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{m.name}</TableCell>
                      <TableCell>{m.costFrequency}</TableCell>
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
    </div>
  );
}
