'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { WithId } from '@/firebase/firestore/use-collection';
import { PlusCircle, Trash2, Loader2 } from 'lucide-react';
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
  DialogDescription,
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
import { useToast } from '@/hooks/use-toast';
import { createUser, deleteUser } from '@/app/actions';


const newUserSchema = z.object({
  fullName: z.string().min(1, 'Full Name is required.'),
  email: z.string().email('Invalid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  accessLevel: z.enum(['Tender Lead', 'Manager', 'Admin']),
});
type NewUserFormData = z.infer<typeof newUserSchema>;


interface User {
    fullName: string;
    email: string;
    accessLevel: string;
    isDeletable: boolean;
    createdAt: { seconds: number, nanoseconds: number };
}

function UserRow({ user, onUserDeleted }: { user: WithId<User>, onUserDeleted: () => void }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const { toast } = useToast();
    
    const handleDelete = async () => {
        if (!user.isDeletable) {
            toast({
                variant: 'destructive',
                title: 'Deletion Failed',
                description: 'This user is protected and cannot be deleted.',
            });
            return;
        }

        if (confirm(`Are you sure you want to delete user ${user.fullName}?`)) {
            setIsDeleting(true);
            const result = await deleteUser(user.id);
            if (result.success) {
                toast({
                    title: 'User Deleted',
                    description: `${user.fullName} has been successfully deleted.`,
                });
                onUserDeleted(); // Trigger re-fetch
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Deletion Failed',
                    description: result.error,
                });
            }
            setIsDeleting(false);
        }
    };
  
  return (
    <TableRow>
      <TableCell>{user.fullName}</TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>{user.accessLevel}</TableCell>
      <TableCell className="text-right">
        <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleDelete}
            disabled={!user.isDeletable || isDeleting}
        >
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </Button>
      </TableCell>
    </TableRow>
  );
}

export default function UserManagementPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [key, setKey] = useState(0); // Key to force re-render
  const { toast } = useToast();
  const firestore = useFirestore();

  const usersCollectionRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'users') : null),
    [firestore, key]
  );
  const { data: users, isLoading: isLoadingUsers } = useCollection<User>(usersCollectionRef);

  const form = useForm<NewUserFormData>({
    resolver: zodResolver(newUserSchema),
    defaultValues: {
        fullName: '',
        email: '',
        password: '',
        accessLevel: 'Tender Lead',
    },
  });

  const onSubmit = async (data: NewUserFormData) => {
    setIsSubmitting(true);
    const result = await createUser(data);
    if (result.success) {
        toast({
            title: 'User Created',
            description: 'The new user has been registered successfully.',
        });
        form.reset();
        setIsDialogOpen(false);
        setKey(prev => prev + 1); // Force re-fetch of users
    } else {
        toast({
            variant: 'destructive',
            title: 'Creation Failed',
            description: result.error,
        });
    }
    setIsSubmitting(false);
  };
  
  const onUserDeleted = () => {
      setKey(prev => prev + 1); // Force re-fetch of users
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Register New User
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Register New User</DialogTitle>
                    <DialogDescription>
                        This will create a new user in both Firebase Authentication and Firestore.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Jane Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="e.g., jane.doe@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="accessLevel"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Access Level</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select an access level" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Tender Lead">Tender Lead</SelectItem>
                                        <SelectItem value="Manager">Manager</SelectItem>
                                        <SelectItem value="Admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create User
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            Manage user roles and permissions for the application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Full Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Access Level</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingUsers && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Loading users...
                  </TableCell>
                </TableRow>
              )}
              {!isLoadingUsers && !users?.length ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                users?.map((user) => <UserRow key={user.id} user={user} onUserDeleted={onUserDeleted}/>)
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
