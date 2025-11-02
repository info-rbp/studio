'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Icons } from '@/components/icons';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Icons.Logo />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Login Temporarily Disabled</CardTitle>
            <CardDescription>
              The login functionality is currently bypassed for development.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You will be automatically directed to the dashboard. Authentication will be re-enabled later.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
