import { create } from 'zustand';

export type UiState = {
  isLoading: boolean;
};

type UiActions = {
  setLoading: (isLoading: boolean) => void;
};

export type UiStore = UiState & UiActions;

export const useUiStore = create<UiStore>((set) => ({
  isLoading: false,
  setLoading: (isLoading) => set({ isLoading }),
}));
