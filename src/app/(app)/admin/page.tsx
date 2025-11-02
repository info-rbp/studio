'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, HardHat, ListChecks, Building, ShieldCheck, ArrowRight } from 'lucide-react';

const adminSections = [
  {
    title: 'Personnel',
    description: 'Manage all preset labor, roles, rates, and security clearances.',
    href: '/admin/personnel',
    icon: HardHat,
  },
  {
    title: 'Materials',
    description: 'Define purchasable, non-labor items for your projects.',
    href: '/admin/materials',
    icon: Building,
  },
  {
    title: 'Milestone Templates',
    description: 'Manage preset WBS/milestone items for common project types.',
    href: '/admin/milestone-templates',
    icon: ListChecks,
  },
  {
    title: 'G&A Costs',
    description: 'Manage General and Administrative cost structures.',
    href: '/admin/ga-costs',
    icon: Users,
  },
    {
    title: 'User Management',
    description: 'Promote or revoke Admin privileges for users.',
    href: '/admin/users',
    icon: ShieldCheck,
  },
];

export default function AdminHubPage() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <h1 className="text-2xl font-bold">Admin Settings</h1>
      <p className="text-muted-foreground">
        This is the central hub for managing your application's master data. Select a category below to manage its settings.
      </p>
      <div className="grid gap-6 pt-4 md:grid-cols-2 lg:grid-cols-3">
        {adminSections.map((section) => {
          const Icon = section.icon;
          return (
            <Link href={section.href} key={section.title} className="flex">
              <Card className="flex flex-col w-full hover:border-primary transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="bg-accent p-3 rounded-full">
                        <Icon className="h-6 w-6 text-accent-foreground" />
                    </div>
                    <CardTitle>{section.title}</CardTitle>
                  </div>
                  <CardDescription className="pt-2">{section.description}</CardDescription>
                </CardHeader>
                <CardFooter className="mt-auto">
                    <Button variant="outline" className="w-full">
                        Manage
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </CardFooter>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
