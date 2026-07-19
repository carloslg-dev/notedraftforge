import { Button } from '@/ui/components/ui/button';
import { useAppError } from '@/ui/hooks/use-app-error';

export function WorkListPage() {
  const { handleError } = useAppError();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-semibold tracking-tight">My Works</h1>
      <p className="text-muted-foreground text-sm">No works yet. Create your first one.</p>
      <Button>New Work</Button>
      <Button
        id="trigger-toast-btn"
        onClick={() => handleError(new Error("Test error message"), { severity: 'error', title: 'Database Error' })}
      >
        Trigger Toast
      </Button>
    </main>
  );
}
