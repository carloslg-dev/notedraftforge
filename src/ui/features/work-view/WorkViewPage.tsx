import { useParams, Link } from 'react-router-dom';
import { Button } from '@/ui/components/ui/button';

export function WorkViewPage() {
  const { pieceId } = useParams<{ pieceId: string }>();

  return (
    <main className="flex min-h-screen flex-col gap-4 p-8">
      <nav>
        <Button variant="ghost" asChild>
          <Link to="/">← Works</Link>
        </Button>
      </nav>
      <h1 className="text-2xl font-semibold tracking-tight">Work</h1>
      <p className="text-muted-foreground text-xs font-mono">id: {pieceId}</p>
    </main>
  );
}
