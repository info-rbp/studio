'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusCircle, Trash2 } from 'lucide-react';

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
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';


const gaAccountSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
});

type GAAccountFormData = z.infer<typeof gaAccountSchema>;

// G&A Accounts Management Component
function GACostAccountsManager() {
  const [isOpen, setIsOpen] = useState(false);
  const firestore = useFirestore();
  const collectionRef = useMemoFirebase(
    () => (firestore ? collection(firestore, `workspaces/jl2g/ga_costs`) : null),
    [firestore]
  );
  const { data: items, isLoading } = useCollection(collectionRef);

  const form = useForm<GAAccountFormData>({
    resolver: zodResolver(gaAccountSchema),
    defaultValues: { name: '' },
  });

  const onSubmit = (data: GAAccountFormData) => {
    if (!collectionRef) return;
    addDocumentNonBlocking(collectionRef, data);
    form.reset();
    setIsOpen(false);
  };
  
  const handleDelete = (id: string) => {
    if(!firestore) return;
    const docRef = doc(firestore, `workspaces/jl2g/ga_costs`, id);
    deleteDocumentNonBlocking(docRef);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>G&amp;A Accounts List</span>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Add G&amp;A Account
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New G&amp;A Account</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Accounting" {...field} />
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
         <CardDescription>
            Manage the G&amp;A accounts used for cost allocation.
          </CardDescription>
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
            {!isLoading && !items?.length && <TableRow><TableCell colSpan={2} className="text-center">No accounts found.</TableCell></TableRow>}
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

export default function FinancialManagementPage() {
  return (
    <div className="flex flex-1 flex-col gap-4">
        <h1 className="text-2xl font-bold">Financial Management</h1>
         <Tabs defaultValue="ga-accounts">
            <TabsList>
                <TabsTrigger value="ga-accounts">G&amp;A Accounts</TabsTrigger>
                <TabsTrigger value="general-settings" disabled>General Settings (soon)</TabsTrigger>
                <TabsTrigger value="ga-allocation" disabled>G&amp;A Allocation (soon)</TabsTrigger>
            </TabsList>
            <TabsContent value="ga-accounts" className="mt-4">
                <GACostAccountsManager />
            </TabsContent>
        </Tabs>
    </div>
  );
}
