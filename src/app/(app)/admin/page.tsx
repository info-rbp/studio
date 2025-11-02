import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function AdminPage() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <h1 className="text-2xl font-bold">Admin</h1>
      <Card>
        <CardHeader>
          <CardTitle>Welcome to the Admin Area</CardTitle>
          <CardDescription>
            This is where you can manage your application settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>More admin features coming soon!</p>
        </CardContent>
      </Card>
    </div>
  );
}
