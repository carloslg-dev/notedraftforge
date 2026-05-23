import { Button } from '@/ui/components/ui/button';

export function WorkListPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-semibold tracking-tight">My Works</h1>
      <p className="text-muted-foreground text-sm">No works yet. Create your first one.</p>
      <Button>New Work</Button>
    </main>
  );
}
