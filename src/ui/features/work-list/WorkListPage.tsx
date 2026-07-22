import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/ui/components/ui/button';
import { useAppError } from '@/ui/hooks/use-app-error';
import { useWorkList } from './use-work-list';
import { useExportBackup } from './use-export-backup';
import { computeVisiblePieces, computeAvailableUserTags, computeFilteredPieces } from './filter-logic';
import { useMediaQuery } from '@/ui/hooks/use-media-query';
import { TagSearchOverlay } from './components/TagSearchOverlay';
import { RestoreBackupModal } from './components/RestoreBackupModal';
import { useUIStore } from '@/ui/state/ui-store';
import { toast } from 'sonner';
import {
  Plus,
  Download,
  Upload,
  Search,
  Settings,
  ChevronRight,
  Feather,
  FileText,
  Eye,
  Edit,
  Tag
} from 'lucide-react';
import type { Piece } from '@/core/domain/types/';

export function WorkListPage() {
  const navigate = useNavigate();
  const { handleError } = useAppError();
  const { pieces, loading, error, refresh } = useWorkList();
  const { exportBackup, isExporting } = useExportBackup();
  const { enterEditing } = useUIStore();
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);

  const MVP_VISIBLE_TYPES = ['text', 'poem'];

  const [activeTypeFilters, setActiveTypeFilters] = useState<string[]>([]);
  const [activeUserFilters, setActiveUserFilters] = useState<string[]>([]);

  const visiblePieces = useMemo(() => {
    if (!pieces) return [];
    return computeVisiblePieces(pieces);
  }, [pieces]);

  const availableUserTags = useMemo(() => computeAvailableUserTags(visiblePieces), [visiblePieces]);

  const isDesktop = useMediaQuery("(min-width: 768px)");
  const visibleLimit = isDesktop ? 4 : 2;
  const visibleTags = availableUserTags.slice(0, visibleLimit);
  const overflowTags = availableUserTags.slice(visibleLimit);

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

  // Common Header Chrome (Desktop only)
  const renderAppChrome = () => (
    <div className="h-[52px] px-5 flex items-center justify-between border-b border-[#e8eaed] bg-white shrink-0">
      <div className="flex items-center gap-2">
        <span className="font-sans font-bold text-base text-[#202124] tracking-tight">
          NoteDraftForge
        </span>
      </div>
      <div className="flex items-center gap-2">
        {/* Presentational language controls and settings placeholder */}
        <div className="inline-flex rounded-lg border border-[#dadce0] overflow-hidden">
          <button className="h-[30px] px-[10px] text-xs font-semibold bg-[#202124] text-white border-0">ES</button>
          <button className="h-[30px] px-[10px] text-xs font-semibold bg-transparent text-[#5f6368] border-0 hover:bg-[#f1f3f4]">EN</button>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-[#5f6368]" onClick={() => toast.info('Settings will be configured in a future update.')}>
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  // Desktop Split Layout View
  if (isDesktop) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f8f9fa] overflow-hidden select-none">
        {renderAppChrome()}
        <div className="flex flex-1 min-h-0">
          {/* Left Rail Sidebar */}
          <aside className="w-[320px] shrink-0 border-r border-[#e8eaed] bg-white flex flex-col h-[calc(100vh-52px)] relative">
            {/* Sidebar header */}
            <div className="p-4 flex items-center justify-between border-b border-[#e8eaed]">
              <span className="font-sans text-xs font-bold text-[#202124] uppercase tracking-wider">Works</span>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-[#5f6368]" onClick={() => toast.info('Search will be enabled in a future update.')}>
                  <Search className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-[#5f6368]" onClick={handleNewWorkClick} title="New work">
                  <Plus className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-[#5f6368]" onClick={() => setIsRestoreModalOpen(true)} title="Restore backup">
                  <Upload className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-[#5f6368]" onClick={exportBackup} disabled={isExporting} title="Export backup">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Filter chips bar */}
            {visiblePieces.length > 0 && (
              <div className="p-3 flex flex-wrap gap-1.5 border-b border-[#e8eaed] shrink-0">
                <button
                  onClick={clearFilters}
                  className={`px-2.5 py-0.5 rounded-full border text-[11px] font-medium transition-colors cursor-pointer ${
                    activeTypeFilters.length === 0 && activeUserFilters.length === 0
                      ? 'bg-[#202124] text-white border-[#202124]'
                      : 'bg-transparent text-[#5f6368] border-[#dadce0] hover:bg-[#f1f3f4]'
                  }`}
                >
                  All
                </button>
                {MVP_VISIBLE_TYPES.map(type => {
                  const isActive = activeTypeFilters.includes(type);
                  const activeColorClass = type === 'poem'
                    ? 'bg-[oklch(0.88_0.06_330)] text-[oklch(0.42_0.13_335)] border-[oklch(0.88_0.06_330)]'
                    : 'bg-[oklch(0.88_0.06_150)] text-[oklch(0.38_0.1_165)] border-[oklch(0.88_0.06_150)]';
                  return (
                    <button
                      key={type}
                      onClick={() => toggleTypeFilter(type)}
                      className={`px-2.5 py-0.5 rounded-full border text-[11px] font-medium transition-colors cursor-pointer capitalize ${
                        isActive ? activeColorClass : 'bg-transparent text-[#5f6368] border-[#dadce0] hover:bg-[#f1f3f4]'
                      }`}
                    >
                      {type}
                    </button>
                  );
                })}
                {visibleTags.map(tag => {
                  const isActive = activeUserFilters.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleUserFilter(tag)}
                      className={`px-2.5 py-0.5 rounded-full border text-[11px] font-medium transition-colors cursor-pointer ${
                        isActive ? 'bg-[#202124] text-white border-[#202124]' : 'bg-transparent text-[#5f6368] border-[#dadce0] hover:bg-[#f1f3f4]'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
                {overflowTags.length > 0 && (
                  <TagSearchOverlay
                    availableTags={overflowTags}
                    activeTags={activeUserFilters}
                    onSelectTag={toggleUserFilter}
                    isDesktop={isDesktop}
                  />
                )}
              </div>
            )}

            {/* Works list */}
            <div className="flex-1 overflow-y-auto">
              {filteredPieces.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-[#80868b]">No works match filters.</p>
                </div>
              ) : (
                filteredPieces.map((piece) => {
                  const isSelected = currentPiece?.id === piece.id;
                  const typeTag = piece.tags?.find(t => t.kind === 'type');
                  const typeDisplay = typeTag ? typeTag.value : piece.type;
                  const displayBadgeClass = piece.type === 'poem'
                    ? 'bg-[oklch(0.95_0.03_330)] text-[oklch(0.42_0.13_335)]'
                    : 'bg-[oklch(0.95_0.03_150)] text-[oklch(0.38_0.1_165)]';

                  return (
                    <button
                      key={piece.id}
                      onClick={() => setSelectedPieceId(piece.id)}
                      className={`w-full text-left border-0 cursor-pointer p-4 flex gap-3 border-b border-[#e8eaed] transition-colors ${
                        isSelected ? 'bg-[#e8f0fe] border-l-2 border-l-[#1a73e8]' : 'bg-transparent hover:bg-neutral-50/50'
                      }`}
                    >
                      <div className={`mt-0.5 shrink-0 ${isSelected ? 'text-[#1967d2]' : 'text-[#5f6368]'}`}>
                        {piece.type === 'poem' ? <Feather className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`font-sans text-sm font-medium truncate ${isSelected ? 'text-[#1967d2]' : 'text-[#202124]'}`}>
                          {piece.title}
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-[11px] text-[#80868b]">
                          <span className={`px-2 py-0.5 rounded-full capitalize text-[10px] font-medium ${displayBadgeClass}`}>
                            {typeDisplay}
                          </span>
                          <span>{new Date(piece.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* Right Preview Panel */}
          <main className="flex-1 bg-[#f8f9fa] flex flex-col h-[calc(100vh-52px)] overflow-y-auto p-8">
            {currentPiece ? (
              <div className="max-w-2xl mx-auto w-full flex flex-col">
                {/* Details card header */}
                <div className="bg-white border border-[#e8eaed] rounded-xl p-6 shadow-sm flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                        currentPiece.type === 'poem' ? 'bg-[oklch(0.95_0.03_330)] text-[oklch(0.42_0.13_335)]' : 'bg-[oklch(0.95_0.03_150)] text-[oklch(0.38_0.1_165)]'
                      }`}>
                        {currentPiece.type}
                      </span>
                      <span className="bg-[#dcfce7] text-[#166534] px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
                        Snapshot ready
                      </span>
                      <span className="text-[11px] text-[#80868b]">
                        {new Date(currentPiece.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h2 className="font-sans text-2xl font-semibold text-[#202124] tracking-tight">
                      {currentPiece.title}
                    </h2>
                    <div className="mt-3 flex gap-2 flex-wrap">
                      {currentPiece.tags?.filter(t => t.kind === 'user').map((t, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 text-[11px] text-[#80868b]">
                          <Tag className="h-2.5 w-2.5" />#{t.value}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <Button variant="default" size="sm" asChild className="bg-[#1a73e8] hover:bg-[#1557b0] text-white">
                      <Link to={`/work/${currentPiece.id}`}>
                        <Eye className="h-4 w-4 mr-1.5" /> View
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEditClick(currentPiece.id)}>
                      <Edit className="h-4 w-4 mr-1.5" /> Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={exportBackup} disabled={isExporting}>
                      <Download className="h-4 w-4 mr-1.5" /> Backup
                    </Button>
                  </div>
                </div>

                {/* Content preview card */}
                <div className="bg-white border border-[#e8eaed] rounded-xl p-8 shadow-sm mt-6 flex-1 min-h-[300px]">
                  <div className="text-[11px] font-bold text-[#80868b] uppercase tracking-widest border-b border-neutral-100 pb-3 mb-5">
                    Reading preview
                  </div>
                  <div className={`font-serif text-lg leading-relaxed text-[#202124] ${currentPiece.type === 'poem' ? 'whitespace-pre-line' : ''}`}>
                    {getPiecePreviewText(currentPiece).map((line, idx) => (
                      <p key={idx} className="mb-4">{line}</p>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <p className="text-[#80868b] text-sm">Select a piece from the rail to preview.</p>
              </div>
            )}
          </main>
        </div>

        <RestoreBackupModal
          isOpen={isRestoreModalOpen}
          onClose={() => setIsRestoreModalOpen(false)}
          onSuccess={refresh}
        />
      </div>
    );
  }

  // Mobile Single-Column View
  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa] text-[#202124] relative pb-20 select-none">
      {/* Mobile Header */}
      <header className="px-4 py-3 flex items-center justify-between bg-white border-b border-[#e8eaed] shrink-0 shadow-sm">
        <span className="font-sans text-xl font-bold text-[#202124] tracking-tight">Works</span>
        <div className="flex items-center gap-1">
          {/* Presentational Language toggle for mobile */}
          <div className="inline-flex rounded-lg border border-[#dadce0] overflow-hidden mr-1">
            <button className="h-[26px] px-2 text-[10px] font-bold bg-[#202124] text-white border-0">ES</button>
            <button className="h-[26px] px-2 text-[10px] font-bold bg-transparent text-[#5f6368] border-0">EN</button>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-[#5f6368]" onClick={() => setIsRestoreModalOpen(true)}>
            <Upload className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-[#5f6368]" onClick={exportBackup} disabled={isExporting}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Filter chips — horizontally scrollable row */}
      {visiblePieces.length > 0 && (
        <div className="px-4 py-2.5 flex gap-1.5 overflow-x-auto bg-white border-b border-[#e8eaed] shrink-0 scrollbar-none">
          <button
            onClick={clearFilters}
            className={`px-3 py-0.5 rounded-full border text-[11px] font-medium shrink-0 cursor-pointer ${
              activeTypeFilters.length === 0 && activeUserFilters.length === 0
                ? 'bg-[#202124] text-white border-[#202124]'
                : 'bg-transparent text-[#5f6368] border-[#dadce0]'
            }`}
          >
            All
          </button>
          {MVP_VISIBLE_TYPES.map(type => {
            const isActive = activeTypeFilters.includes(type);
            const activeColorClass = type === 'poem'
              ? 'bg-[oklch(0.88_0.06_330)] text-[oklch(0.42_0.13_335)] border-[oklch(0.88_0.06_330)]'
              : 'bg-[oklch(0.88_0.06_150)] text-[oklch(0.38_0.1_165)] border-[oklch(0.88_0.06_150)]';
            return (
              <button
                key={type}
                onClick={() => toggleTypeFilter(type)}
                className={`px-3 py-0.5 rounded-full border text-[11px] font-medium shrink-0 cursor-pointer capitalize ${
                  isActive ? activeColorClass : 'bg-transparent text-[#5f6368] border-[#dadce0]'
                }`}
              >
                {type}
              </button>
            );
          })}
          {visibleTags.map(tag => {
            const isActive = activeUserFilters.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => toggleUserFilter(tag)}
                className={`px-3 py-0.5 rounded-full border text-[11px] font-medium shrink-0 cursor-pointer ${
                  isActive ? 'bg-[#202124] text-white border-[#202124]' : 'bg-transparent text-[#5f6368] border-[#dadce0]'
                }`}
              >
                {tag}
              </button>
            );
          })}
          {overflowTags.length > 0 && (
            <TagSearchOverlay
              availableTags={overflowTags}
              activeTags={activeUserFilters}
              onSelectTag={toggleUserFilter}
              isDesktop={isDesktop}
            />
          )}
        </div>
      )}

      {/* Work items list */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {filteredPieces.length === 0 ? (
          <div className="p-8 text-center border border-dashed rounded-xl bg-white border-[#dadce0]">
            <p className="text-sm text-[#80868b] mb-4">No works match active filters.</p>
            <Button variant="outline" size="sm" onClick={clearFilters}>Clear Filters</Button>
          </div>
        ) : (
          filteredPieces.map((piece) => {
            const typeTag = piece.tags?.find(t => t.kind === 'type');
            const typeDisplay = typeTag ? typeTag.value : piece.type;
            const displayBadgeClass = piece.type === 'poem'
              ? 'bg-[oklch(0.95_0.03_330)] text-[oklch(0.42_0.13_335)]'
              : 'bg-[oklch(0.95_0.03_150)] text-[oklch(0.38_0.1_165)]';

            return (
              <Link
                key={piece.id}
                to={`/work/${piece.id}`}
                className="flex items-center gap-3 p-3.5 mb-2 bg-white border border-[#e8eaed] rounded-xl hover:bg-neutral-50/50 transition-colors w-full"
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#f1f3f4] text-[#5f6368] shrink-0">
                  {piece.type === 'poem' ? <Feather className="h-4.5 w-4.5" /> : <FileText className="h-4.5 w-4.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-sans text-[15px] font-medium text-[#202124] truncate">
                    {piece.title}
                  </div>
                  <div className="mt-0.5 text-xs text-[#80868b]">
                    {new Date(piece.updatedAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2 py-0.5 rounded-full capitalize text-[10px] font-medium ${displayBadgeClass}`}>
                    {typeDisplay}
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-[#80868b]" />
                </div>
              </Link>
            );
          })
        )}
      </div>

      {/* Floating Action Button (FAB) for New Work */}
      <div className="fixed right-4 bottom-5 z-40">
        <button
          onClick={handleNewWorkClick}
          className="bg-[#1a73e8] hover:bg-[#1557b0] text-white shadow-lg h-12 px-5 rounded-full flex items-center gap-2 font-semibold text-sm active:scale-95 transition-transform"
        >
          <Plus className="h-4.5 w-4.5 text-white" />
          New work
        </button>
      </div>

      <RestoreBackupModal
        isOpen={isRestoreModalOpen}
        onClose={() => setIsRestoreModalOpen(false)}
        onSuccess={refresh}
      />
    </div>
  );
}
