import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Vice, HistoryEntry } from '../types';

interface HistoryStore {
  entries: HistoryEntry[];
  addEntry: (vice: Vice) => void;
  deleteEntry: (id: string) => void;
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set) => ({
      entries: [],
      addEntry: (vice: Vice) =>
        set((state) => ({
          entries: [
            {
              id: Date.now().toString(),
              viceName: vice.name,
              viceDescription: vice.description,
              loggedAt: new Date().toISOString(),
              logCount: vice.logCount ?? 0,
            },
            ...state.entries,
          ],
        })),
      deleteEntry: (id: string) =>
        set((state) => ({ entries: state.entries.filter((e) => e.id !== id) })),
      clearHistory: () => set({ entries: [] }),
    }),
    {
      name: 'history-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
