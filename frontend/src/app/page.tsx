import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BackendStatus } from '@/features/health/components/backend-status';

export default function HomePage() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">AgentBoard</CardTitle>
          <CardDescription>AI Assisted Development Lab</CardDescription>
        </CardHeader>
        <CardContent>
          <BackendStatus />
        </CardContent>
      </Card>
    </main>
  );
}
