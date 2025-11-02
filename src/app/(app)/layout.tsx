'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
import { LayoutDashboard, Settings, BookOpen } from 'lucide-react';
import { useUser } from '@/firebase';


export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { userProfile } = useUser();

  const getInitials = (name = '') => {
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
  };
  
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
