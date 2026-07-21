import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/ui/components/ui/button';
import { Badge } from '@/ui/components/ui/badge';
import { useAppError } from '@/ui/hooks/use-app-error';
import { useWorkList } from './use-work-list';
import { useExportBackup } from './use-export-backup';
import { computeVisiblePieces, computeAvailableUserTags, computeFilteredPieces } from './filter-logic';
import { useMediaQuery } from '@/ui/hooks/use-media-query';
import { TagSearchOverlay } from './components/TagSearchOverlay';

export function WorkListPage() {
  const { handleError } = useAppError();
  const { pieces, loading, error } = useWorkList();
  const { exportBackup, isExporting } = useExportBackup();

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

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8">
        <p className="text-muted-foreground text-sm">Loading works...</p>
      </main>
    );
  }

  // If there's an error, we don't want to show the empty state.
  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8">
        <p className="text-muted-foreground text-sm">Failed to load works.</p>
      </main>
    );
  }

  // WL-REQ-07: Empty state when no pieces exist
  if (!loading && visiblePieces.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
        <h1 className="text-2xl font-semibold tracking-tight">My Works</h1>
        <p className="text-muted-foreground text-sm">No works yet. Create your first one.</p>
        <div className="flex gap-4">
          <Button>New Work</Button>
          <Button variant="outline">Restore Backup</Button>
          <Button variant="outline" onClick={exportBackup} disabled={isExporting}>
            {isExporting ? 'Exporting...' : 'Export Backup'}
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center gap-6 p-8 max-w-3xl mx-auto w-full">
      <div className="w-full flex justify-between items-center">
        <h1 className="text-2xl font-semibold tracking-tight">My Works</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportBackup} disabled={isExporting}>
            {isExporting ? 'Exporting...' : 'Export Backup'}
          </Button>
          <Button>New Work</Button>
        </div>
      </div>

      {visiblePieces.length > 0 && (
        <div className="w-full flex flex-wrap gap-2 items-center">
          <div className="flex gap-2 items-center mr-4">
            {MVP_VISIBLE_TYPES.map(type => (
              <Badge
                key={type}
                variant={activeTypeFilters.includes(type) ? "default" : "secondary"}
                className="cursor-pointer capitalize hover:bg-primary/80"
                onClick={() => toggleTypeFilter(type)}
              >
                {type}
              </Badge>
            ))}
          </div>

          {availableUserTags.length > 0 && (
            <div className="flex gap-2 items-center">
              {visibleTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={activeUserFilters.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/80"
                  onClick={() => toggleUserFilter(tag)}
                >
                  {tag}
                </Badge>
              ))}
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

          {(activeTypeFilters.length > 0 || activeUserFilters.length > 0) && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto text-xs h-6 px-2">
              Clear filters
            </Button>
          )}
        </div>
      )}

      <div className="flex flex-col gap-4 w-full">
        {filteredPieces.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg border-dashed">
            <p className="text-muted-foreground mb-4">No pieces match the selected filters.</p>
            <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
          </div>
        ) : (
          filteredPieces.map((piece) => {
            // WL-REQ-03: Type semantic - canonical type representation in tags or fallback to Piece.type
            const typeTag = piece.tags?.find(t => t.kind === 'type');
            const typeDisplay = typeTag ? typeTag.value : piece.type;

            // Filter out up to 3 user tags
            const userTags = (piece.tags || []).filter(t => t.kind === 'user');
            const visibleUserTags = userTags.slice(0, 3);
            const hasMoreTags = userTags.length > 3;

            return (
              <Link
                key={piece.id}
                to={`/work/${piece.id}`}
                className="flex flex-col gap-2 p-4 border rounded-lg hover:bg-accent/50 transition-colors w-full"
              >
                <div className="flex justify-between items-start gap-4">
                  <h2 className="text-lg font-medium tracking-tight truncate">{piece.title}</h2>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Type Badge */}
                    <Badge variant="secondary" className="capitalize">{typeDisplay}</Badge>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm text-muted-foreground mt-1">
                  <div className="flex gap-2 flex-wrap items-center">
                    {/* User Tags */}
                    {visibleUserTags.map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="font-normal text-xs">{tag.value}</Badge>
                    ))}
                    {/* WL-REQ-11: Tag search overlay for overflow tags indicator */}
                    {hasMoreTags && (
                      <Badge variant="outline" className="font-normal text-xs">···</Badge>
                    )}
                  </div>

                  {/* Updated At Context */}
                  <span className="text-xs whitespace-nowrap">
                    {new Date(piece.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </main>
  );
}
