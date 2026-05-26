import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {Vice} from '../types';

interface ViceStore {
  vices: Vice[];
  addVice: (name: string, cooldownMinutes: number, description?: string) => void;
  logVice: (id: string) => void;
  deleteVice: (id: string) => void;
}

export const useViceStore = create<ViceStore>()(
  persist(
    set => ({
      vices: [],
      addVice: (name, cooldownMinutes, description) =>
        set(state => ({
          vices: [
            ...state.vices,
            {
              id: Date.now().toString(),
              name,
              description,
              cooldownMinutes,
              createdAt: new Date().toISOString(),
            },
          ],
        })),
      logVice: (id: string) =>
        set(state => ({
          vices: state.vices.map(v =>
            v.id === id ? {...v, lastLoggedAt: new Date().toISOString()} : v,
          ),
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
