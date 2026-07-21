import { useParams, Link } from 'react-router-dom';
import { Button } from '@/ui/components/ui/button';
import { useWorkView } from './use-work-view';
import { useUIStore } from '../../state/ui-store';
import { useEffect } from 'react';

export function WorkViewPage() {
  const { pieceId } = useParams<{ pieceId: string }>();
  const { piece, loading, error } = useWorkView(pieceId);
  const { activeMode, enterEditing, enterVisualization } = useUIStore();

  useEffect(() => {
    // Reset to visualization mode when unmounting or changing piece
    return () => {
      enterVisualization().catch(console.error);
    };
  }, [enterVisualization, pieceId]);

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col gap-4 p-8 items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading piece...</p>
      </main>
    );
  }

  if (error || !piece) {
    return (
      <main className="flex min-h-screen flex-col gap-4 p-8 items-center justify-center">
        <h1 className="text-2xl font-semibold tracking-tight">Piece not found</h1>
        <p className="text-muted-foreground text-sm">The piece you are looking for does not exist or an error occurred.</p>
        <Button asChild>
          <Link to="/">Go back to Works</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col gap-4 p-8 max-w-3xl mx-auto w-full">
      <nav className="flex justify-between items-center mb-4">
        <Button variant="ghost" asChild>
          <Link to="/">← Works</Link>
        </Button>
        <Button
          variant={activeMode === 'editing' ? 'default' : 'outline'}
          onClick={() => {
            if (activeMode === 'editing') {
              enterVisualization().catch(console.error);
            } else {
              enterEditing(piece.id);
            }
          }}
        >
          {activeMode === 'editing' ? 'Finish Editing' : 'Edit Piece'}
        </Button>
      </nav>

      <header className="mb-6 border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight">{piece.title}</h1>
        <div className="flex gap-2 text-sm text-muted-foreground mt-2">
          <span>Type: {piece.type}</span>
          <span>•</span>
          <span>Updated: {new Date(piece.updatedAt).toLocaleDateString()}</span>
        </div>
      </header>

      <div className="flex-1 bg-card rounded-lg border p-6 min-h-[400px]">
        {activeMode === 'visualization' ? (
          <div className="visualization-view">
            <h2 className="text-lg font-medium mb-4 text-muted-foreground">Visualization Sub-view (Read-only)</h2>
            <div className="prose dark:prose-invert">
              <p>This is a placeholder for the read-only visualization view. (E-06)</p>
              <p>Current piece ID: {piece.id}</p>
            </div>
          </div>
        ) : (
          <div className="editing-view">
             <h2 className="text-lg font-medium mb-4 text-blue-600 dark:text-blue-400">Editing Sub-view (Editable)</h2>
             <div className="prose dark:prose-invert">
               <p>This is a placeholder for the Tiptap editor view. (E-04-3)</p>
               <p>Current piece ID: {piece.id}</p>
             </div>
          </div>
        )}
      </div>
    </main>
  );
}
