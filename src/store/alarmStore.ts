import {create} from 'zustand';
import {Alarm, LogEntry} from '../types';
import {storageService} from '../services/storageService';
import {alarmService} from '../services/alarmService';

type CreateParams = Omit<Alarm, 'id' | 'createdAt' | 'triggerCount' | 'notifeeTriggerId'>;

interface AlarmStore {
  alarms: Alarm[];
  logs: Record<string, LogEntry[]>;
  isLoading: boolean;
  loadAll: () => Promise<void>;
  createAlarm: (params: CreateParams) => Promise<void>;
  updateAlarm: (id: string, updates: Partial<Alarm>) => Promise<void>;
  deleteAlarm: (id: string) => Promise<void>;
  toggleAlarm: (id: string, enabled: boolean) => Promise<void>;
  loadLogs: (alarmId: string) => Promise<void>;
  manualLog: (alarmId: string) => Promise<void>;
  refreshAlarms: () => Promise<void>;
}

export const useAlarmStore = create<AlarmStore>((set, get) => ({
  alarms: [],
  logs: {},
  isLoading: false,

  loadAll: async () => {
    set({isLoading: true});
    const alarms = await storageService.loadAlarms();
    set({alarms, isLoading: false});
  },

  refreshAlarms: async () => {
    const alarms = await storageService.loadAlarms();
    set({alarms});
  },

  createAlarm: async (params: CreateParams) => {
    const alarm = await alarmService.createAlarm(params);
    set(state => ({alarms: [...state.alarms, alarm]}));
  },

  updateAlarm: async (id: string, updates: Partial<Alarm>) => {
    await alarmService.updateAlarm(id, updates);
    await get().refreshAlarms();
  },

  deleteAlarm: async (id: string) => {
    await alarmService.deleteAlarm(id);
    set(state => ({
      alarms: state.alarms.filter(a => a.id !== id),
      logs: Object.fromEntries(Object.entries(state.logs).filter(([k]) => k !== id)),
    }));
  },

  toggleAlarm: async (id: string, enabled: boolean) => {
    await alarmService.toggleAlarm(id, enabled);
    set(state => ({alarms: state.alarms.map(a => (a.id === id ? {...a, enabled} : a))}));
  },

  loadLogs: async (alarmId: string) => {
    const logs = await storageService.loadLogs(alarmId);
    set(state => ({logs: {...state.logs, [alarmId]: logs}}));
  },

  manualLog: async (alarmId: string) => {
    await alarmService.manualLog(alarmId);
    await get().loadLogs(alarmId);
    await get().refreshAlarms();
  },
}));
