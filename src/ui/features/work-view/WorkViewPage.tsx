import { useParams, Link } from 'react-router-dom';
import { Button } from '@/ui/components/ui/button';
import { useWorkView } from './use-work-view';
import { useUIStore } from '../../state/ui-store';
import { useTranslation } from '@/ui/hooks/use-translation';
import { useEffect } from 'react';
import { TiptapEditor } from '../../../core/infrastructure/editor/components/TiptapEditor';
import { PieceContent } from '../../../core/domain/types/';

export function WorkViewPage() {
  const { pieceId } = useParams<{ pieceId: string }>();
  const { piece, loading, error } = useWorkView(pieceId);
  const { activeMode, enterEditing, enterVisualization } = useUIStore();
  const { t } = useTranslation();

  useEffect(() => {
    // Reset to visualization mode when unmounting or changing piece
    return () => {
      enterVisualization().catch(console.error);
    };
  }, [enterVisualization, pieceId]);

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col gap-4 p-8 items-center justify-center bg-[#f8f9fa]">
        <p className="text-[#5f6368] text-sm">{t('loadingWorks')}</p>
      </main>
    );
  }

  if (error || !piece) {
    return (
      <main className="flex min-h-screen flex-col gap-4 p-8 items-center justify-center bg-[#f8f9fa]">
        <h1 className="text-2xl font-semibold tracking-tight text-[#202124]">{t('pieceNotFound')}</h1>
        <p className="text-[#5f6368] text-sm">{t('pieceNotFoundDesc')}</p>
        <Button asChild className="bg-[#1a73e8] hover:bg-[#1557b0] text-white">
          <Link to="/">{t('goBackWorks')}</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col gap-4 p-8 max-w-3xl mx-auto w-full bg-[#f8f9fa] text-[#202124]">
      <nav className="flex justify-between items-center mb-4 bg-white border border-[#e8eaed] rounded-xl p-3 shadow-sm">
        <Button variant="ghost" asChild className="text-[#5f6368] hover:text-[#202124]">
          <Link to="/">← {t('works')}</Link>
        </Button>
        <Button
          variant={activeMode === 'editing' ? 'default' : 'outline'}
          className={activeMode === 'editing' ? 'bg-[#1a73e8] hover:bg-[#1557b0] text-white border-0' : 'text-[#5f6368]'}
          onClick={() => {
            if (activeMode === 'editing') {
              enterVisualization().catch(console.error);
            } else {
              enterEditing(piece.id);
            }
          }}
        >
          {activeMode === 'editing' ? t('finishEditing') : t('editPiece')}
        </Button>
      </nav>

      <header className="mb-6 border-b border-[#e8eaed] pb-4 px-3">
        <h1 className="text-3xl font-bold tracking-tight text-[#202124]">{piece.title}</h1>
        <div className="flex gap-2 text-sm text-[#80868b] mt-2">
          <span>{t('type')}: {piece.type}</span>
          <span>•</span>
          <span>{t('updated')}: {new Date(piece.updatedAt).toLocaleDateString()}</span>
        </div>
      </header>

      <div className="flex-1 bg-white rounded-xl border border-[#e8eaed] p-6 min-h-[400px] shadow-sm">
        {activeMode === 'visualization' ? (
          <div className="visualization-view">
            <h2 className="text-lg font-medium mb-4 text-[#80868b] uppercase text-xs tracking-wider">
              {t('readingPreview')} (Read-only)
            </h2>
            <div className="prose dark:prose-invert">
              <p>This is a placeholder for the read-only visualization view. (E-06)</p>
              <p>Current piece ID: {piece.id}</p>
            </div>
          </div>
        ) : (
          <div className="editing-view">
             <h2 className="text-lg font-medium mb-4 text-[#1a73e8] uppercase text-xs tracking-wider">
               {t('editPiece')} (Editable)
             </h2>
             {piece.content.kind === 'song' ? (
               <p className="text-[#80868b]">Song editing is not supported in MVP.</p>
             ) : (
               <TiptapEditor
                 initialContent={piece.content}
                 onUpdate={(newContent: PieceContent) => {
                   console.log('Domain content updated (autosave E-04-4 stub):', newContent);
                 }}
               />
             )}
          </div>
        )}
      </div>
    </main>
  );
}
