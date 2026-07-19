import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from './ui-store';
import type { AnnotationTarget } from '../../core/domain/types/index';

describe('useUIStore', () => {
  beforeEach(() => {
    // Reset store before each test
    const { enterVisualization, setAnnotationModalOpen, setRefinementModalOpen, setActiveSelection } = useUIStore.getState();
    enterVisualization();
    setAnnotationModalOpen(false);
    setRefinementModalOpen(false);
    setActiveSelection(null);
  });

  it('should initialize with visualization mode and closed modals', () => {
    const state = useUIStore.getState();
    expect(state.activeMode).toBe('visualization');
    expect(state.isAnnotationModalOpen).toBe(false);
    expect(state.isRefinementModalOpen).toBe(false);
    expect(state.activeSelection).toBeNull();
  });

  it('should transition to editing mode', () => {
    useUIStore.getState().enterEditing();
    const state = useUIStore.getState();
    expect(state.activeMode).toBe('editing');
  });

  it('should transition to visualization mode', () => {
    useUIStore.getState().enterEditing();
    useUIStore.getState().enterVisualization();
    const state = useUIStore.getState();
    expect(state.activeMode).toBe('visualization');
  });

  it('should toggle annotation modal', () => {
    useUIStore.getState().setAnnotationModalOpen(true);
    let state = useUIStore.getState();
    expect(state.isAnnotationModalOpen).toBe(true);

    useUIStore.getState().setAnnotationModalOpen(false);
    state = useUIStore.getState();
    expect(state.isAnnotationModalOpen).toBe(false);
  });

  it('should toggle refinement modal', () => {
    useUIStore.getState().setRefinementModalOpen(true);
    let state = useUIStore.getState();
    expect(state.isRefinementModalOpen).toBe(true);

    useUIStore.getState().setRefinementModalOpen(false);
    state = useUIStore.getState();
    expect(state.isRefinementModalOpen).toBe(false);
  });

  it('should set active selection', () => {
    const mockSelection: AnnotationTarget = {
      kind: 'text-range',
      blockId: 'block-1',
      startOffset: 0,
      endOffset: 5,
    };

    useUIStore.getState().setActiveSelection(mockSelection);
    let state = useUIStore.getState();
    expect(state.activeSelection).toEqual(mockSelection);

    useUIStore.getState().setActiveSelection(null);
    state = useUIStore.getState();
    expect(state.activeSelection).toBeNull();
  });
});
