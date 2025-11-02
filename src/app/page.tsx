'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { seedInitialUser } from '@/app/actions';

export default function HomePage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // This seeding logic will run on the server component instance, 
    // but the hook-based navigation will run on the client.
    // This is a bit of a hybrid approach for this specific startup page.
    seedInitialUser();
  }, []);

  useEffect(() => {
    if (!isUserLoading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [user, isUserLoading, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}
