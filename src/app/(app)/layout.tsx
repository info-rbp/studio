'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Icons } from '@/components/icons';
import { LayoutDashboard, Settings, BookOpen, Loader2 } from 'lucide-react';
import { useUser, useAuth } from '@/firebase';
import { signInAnonymously } from 'firebase/auth';


export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const auth = useAuth();
  const { user, userProfile, isUserLoading } = useUser();
  const [isSigningIn, setIsSigningIn] = useState(true);

  useEffect(() => {
    if (isUserLoading) {
        setIsSigningIn(true);
        return;
    }
    if (!user) {
      console.log("No user found. Signing in anonymously...");
      signInAnonymously(auth).catch((error) => {
        console.error("Error signing in anonymously:", error);
        // Handle critical error - maybe show an error page
        setIsSigningIn(false);
      });
      // The onAuthStateChanged listener in useUser will handle the user state update
    } else {
        console.log("User is logged in:", user.uid);
        setIsSigningIn(false);
    }
  }, [user, isUserLoading, auth]);


  const getInitials = (name = '') => {
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
  };

  if (isSigningIn || isUserLoading) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Link href="/dashboard" className="block">
            <Icons.Logo />
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/dashboard'}
              >
                <Link href="/dashboard">
                  <LayoutDashboard />
                  Dashboard
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {userProfile?.accessLevel === 'Admin' && (
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith('/admin')}
                >
                  <Link href="/admin">
                    <Settings />
                    Admin
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
             <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/guide'}
              >
                <Link href="/guide">
                  <BookOpen />
                  User Guide
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
           <div className="flex items-center gap-3 cursor-pointer p-2 rounded-md">
              {userProfile && (
                <>
                    <Avatar className="h-8 w-8">
                    <AvatarImage />
                    <AvatarFallback>{getInitials(userProfile.fullName)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col text-sm group-data-[collapsible=icon]:hidden">
                    <span className="font-medium text-sidebar-foreground truncate">{userProfile.fullName}</span>
                    <span className="text-xs text-muted-foreground">{userProfile.accessLevel}</span>
                    </div>
                </>
              )}
            </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-card px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1">
             <h1 className="text-lg font-semibold capitalize">
                {pathname.split('/').pop()?.replace(/-/g, ' ') || 'Dashboard'}
            </h1>
          </div>
        </header>
        <main className="flex-1 flex flex-col bg-background p-4 md:p-6">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
