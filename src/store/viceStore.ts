import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {Vice} from '../types';

interface ViceStore {
  vices: Vice[];
  addVice: (name: string, description?: string) => void;
  deleteVice: (id: string) => void;
}

export const useViceStore = create<ViceStore>()(
  persist(
    set => ({
      vices: [],
      addVice: (name, description) =>
        set(state => ({
          vices: [
            ...state.vices,
            {
              id: Date.now().toString(),
              name,
              description,
              createdAt: new Date().toISOString(),
            },
          ],
        })),
      deleteVice: (id: string) =>
        set(state => ({vices: state.vices.filter(v => v.id !== id)})),
    }),
    {
      name: 'vice-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
