import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppError } from '@/ui/hooks/use-app-error';
import { useWorkList } from './use-work-list';
import { useExportBackup } from './use-export-backup';
import { computeVisiblePieces, computeAvailableUserTags, computeFilteredPieces } from './filter-logic';
import { useMediaQuery } from '@/ui/hooks/use-media-query';
import { RestoreBackupModal } from './components/RestoreBackupModal';
import { WorkListDesktop } from './components/WorkListDesktop';
import { WorkListMobile } from './components/WorkListMobile';
import { useUIStore } from '@/ui/state/ui-store';
import { toast } from 'sonner';
import type { Piece } from '@/core/domain/types/';

export function WorkListPage() {
  const navigate = useNavigate();
  const { handleError } = useAppError();
  const { pieces, loading, error, refresh } = useWorkList();
  const { exportBackup, isExporting } = useExportBackup();
  const { enterEditing } = useUIStore();
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);

  const [activeTypeFilters, setActiveTypeFilters] = useState<string[]>([]);
  const [activeUserFilters, setActiveUserFilters] = useState<string[]>([]);

  const visiblePieces = useMemo(() => {
    if (!pieces) return [];
    return computeVisiblePieces(pieces);
  }, [pieces]);

  const availableUserTags = useMemo(() => computeAvailableUserTags(visiblePieces), [visiblePieces]);

  const isDesktop = useMediaQuery("(min-width: 768px)");

  const filteredPieces = useMemo(() => computeFilteredPieces(visiblePieces, activeTypeFilters, activeUserFilters), [visiblePieces, activeTypeFilters, activeUserFilters]);

  const currentPiece = useMemo(() => {
    if (filteredPieces.length === 0) return null;
    return filteredPieces.find(p => p.id === selectedPieceId) || filteredPieces[0];
  }, [filteredPieces, selectedPieceId]);

  useEffect(() => {
    if (error) {
      handleError(error, { severity: 'error', title: 'Failed to load works' });
    }
  }, [error, handleError]);

  const toggleTypeFilter = (type: string) => {
    setActiveTypeFilters(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleUserFilter = (tag: string) => {
    setActiveUserFilters(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setActiveTypeFilters([]);
    setActiveUserFilters([]);
  };

  const handleEditClick = (pieceId: string) => {
    enterEditing(pieceId);
    navigate(`/work/${pieceId}`);
  };

  const handleNewWorkClick = () => {
    toast.info('New piece creation will be fully configured in the upcoming IndexedDB persistence integration epic (E-07/#73).');
  };

  const getPiecePreviewText = (piece: Piece) => {
    if (!piece.content || piece.content.kind === 'song' || !piece.content.blocks) {
      return ['No content yet. Open editor to start writing.'];
    }
    const lines = piece.content.blocks
      .map(block => block.runs.map(run => run.text).join(''))
      .filter(text => text.trim().length > 0);
    return lines.length > 0 ? lines.slice(0, 5) : ['No content yet. Open editor to start writing.'];
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8 bg-[#f8f9fa]">
        <p className="text-[#5f6368] text-sm">Loading works...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8 bg-[#f8f9fa]">
        <p className="text-[#5f6368] text-sm">Failed to load works.</p>
      </main>
    );
  }

  return (
    <>
      {isDesktop ? (
        <WorkListDesktop
          visiblePieces={visiblePieces}
          filteredPieces={filteredPieces}
          availableUserTags={availableUserTags}
          activeTypeFilters={activeTypeFilters}
          activeUserFilters={activeUserFilters}
          toggleTypeFilter={toggleTypeFilter}
          toggleUserFilter={toggleUserFilter}
          clearFilters={clearFilters}
          selectedPieceId={selectedPieceId}
          setSelectedPieceId={setSelectedPieceId}
          currentPiece={currentPiece}
          isExporting={isExporting}
          exportBackup={exportBackup}
          setIsRestoreModalOpen={setIsRestoreModalOpen}
          handleNewWorkClick={handleNewWorkClick}
          handleEditClick={handleEditClick}
          getPiecePreviewText={getPiecePreviewText}
          isDesktop={isDesktop}
        />
      ) : (
        <WorkListMobile
          visiblePieces={visiblePieces}
          filteredPieces={filteredPieces}
          availableUserTags={availableUserTags}
          activeTypeFilters={activeTypeFilters}
          activeUserFilters={activeUserFilters}
          toggleTypeFilter={toggleTypeFilter}
          toggleUserFilter={toggleUserFilter}
          clearFilters={clearFilters}
          isExporting={isExporting}
          exportBackup={exportBackup}
          setIsRestoreModalOpen={setIsRestoreModalOpen}
          handleNewWorkClick={handleNewWorkClick}
          isDesktop={isDesktop}
        />
      )}

      <RestoreBackupModal
        isOpen={isRestoreModalOpen}
        onClose={() => setIsRestoreModalOpen(false)}
        onSuccess={refresh}
      />
    </>
  );
}
