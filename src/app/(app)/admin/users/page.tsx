'use client';

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
import { Switch } from '@/components/ui/switch';
import { useCollection, useDoc, useFirestore, useMemoFirebase, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { WithId } from '@/firebase/firestore/use-collection';

interface User {
    createdAt: { seconds: number, nanoseconds: number };
    isAnonymous: boolean;
}

interface AdminUser {
    isAdmin: boolean;
}

function UserRow({ user }: { user: WithId<User> }) {
  const firestore = useFirestore();
  
  const adminUserRef = useMemoFirebase(
    () => (firestore ? doc(firestore, `adminUsers/${user.id}`) : null),
    [firestore, user.id]
  );
  
  const { data: adminUser } = useDoc<AdminUser>(adminUserRef);

  const handleAdminToggle = (isAdmin: boolean) => {
    if (!adminUserRef) return;
    if (isAdmin) {
      setDocumentNonBlocking(adminUserRef, { isAdmin: true }, { merge: true });
    } else {
      deleteDocumentNonBlocking(adminUserRef);
    }
  };

  return (
    <TableRow>
      <TableCell>{user.id}</TableCell>
      <TableCell>{new Date(user.createdAt.seconds * 1000).toLocaleString()}</TableCell>
      <TableCell>{user.isAnonymous ? 'Yes' : 'No'}</TableCell>
      <TableCell>
        <Switch
          checked={!!adminUser?.isAdmin}
          onCheckedChange={handleAdminToggle}
          aria-label="Toggle admin status"
        />
      </TableCell>
    </TableRow>
  );
}

export default function UserManagementPage() {
  const firestore = useFirestore();

  const usersCollectionRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'users') : null),
    [firestore]
  );
  const { data: users, isLoading: isLoadingUsers } = useCollection<User>(usersCollectionRef);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <h1 className="text-2xl font-bold">User Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            Manage user roles and permissions. Toggle the switch to grant or revoke admin privileges.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Is Anonymous</TableHead>
                <TableHead>Is Admin</TableHead>
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
                users?.map((user) => <UserRow key={user.id} user={user} />)
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
