import { create } from 'zustand';
import type { AnnotationTarget } from '../../core/domain/types/index';

interface UIState {
  activeMode: 'visualization' | 'editing';
  isAnnotationModalOpen: boolean;
  isRefinementModalOpen: boolean;
  activeSelection: AnnotationTarget | null;
}

interface UIActions {
  enterEditing: () => void;
  enterVisualization: () => void;
  setAnnotationModalOpen: (isOpen: boolean) => void;
  setRefinementModalOpen: (isOpen: boolean) => void;
  setActiveSelection: (selection: AnnotationTarget | null) => void;
}

export type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>((set) => ({
  activeMode: 'visualization',
  isAnnotationModalOpen: false,
  isRefinementModalOpen: false,
  activeSelection: null,

  enterEditing: () => set({ activeMode: 'editing' }),
  enterVisualization: () => set({ activeMode: 'visualization' }),
  setAnnotationModalOpen: (isOpen: boolean) => set({ isAnnotationModalOpen: isOpen }),
  setRefinementModalOpen: (isOpen: boolean) => set({ isRefinementModalOpen: isOpen }),
  setActiveSelection: (selection: AnnotationTarget | null) => set({ activeSelection: selection }),
}));
