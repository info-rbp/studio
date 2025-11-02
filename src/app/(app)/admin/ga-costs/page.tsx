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

// Zod schema for the G&A cost form
const gaCostSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  value: z.coerce.number().min(0, 'Value must be a positive number.'),
});

type GACostFormData = z.infer<typeof gaCostSchema>;

export default function GaCostsSettingsPage() {
  const [isGaCostDialogOpen, setIsGaCostDialogOpen] = useState(false);
  const firestore = useFirestore();

  // G&A Cost data
  const gaCostCollectionRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'workspaces/jl2g/ga_costs') : null),
    [firestore]
  );
  const { data: gaCosts, isLoading: isLoadingGACosts } = useCollection<GACostFormData>(gaCostCollectionRef);

  const gaCostForm = useForm<GACostFormData>({
    resolver: zodResolver(gaCostSchema),
    defaultValues: {
      name: '',
      value: 0,
    },
  });

  const onGACostSubmit = (data: GACostFormData) => {
    if (!gaCostCollectionRef) return;
    addDocumentNonBlocking(gaCostCollectionRef, data);
    gaCostForm.reset();
    setIsGaCostDialogOpen(false);
  };

  return (
    <div className="flex flex-1 flex-col gap-4">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Manage G&amp;A Costs</h1>
            <Dialog open={isGaCostDialogOpen} onOpenChange={setIsGaCostDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Add G&amp;A Cost
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New G&amp;A Cost</DialogTitle>
                </DialogHeader>
                <Form {...gaCostForm}>
                  <form onSubmit={gaCostForm.handleSubmit(onGACostSubmit)} className="space-y-4">
                    <FormField
                      control={gaCostForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Corporate Overhead" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={gaCostForm.control}
                      name="value"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Value (%)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsGaCostDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Save G&amp;A Cost</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>G&amp;A Costs List</CardTitle>
            <CardDescription>
                Manage General and Administrative cost structures.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Value (%)</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingGACosts && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      Loading G&amp;A costs...
                    </TableCell>
                  </TableRow>
                )}
                {!isLoadingGACosts && !gaCosts?.length ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      No G&amp;A costs found.
                    </TableCell>
                  </TableRow>
                ) : (
                  gaCosts?.map((cost) => (
                    <TableRow key={cost.id}>
                      <TableCell className="font-medium">{cost.name}</TableCell>
                      <TableCell className="text-right">{cost.value.toFixed(2)}%</TableCell>
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
