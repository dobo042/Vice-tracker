import AsyncStorage from '@react-native-async-storage/async-storage';
import {Alarm, LogEntry} from '../types';
import {STORAGE_KEYS} from '../constants';

function logsKey(alarmId: string): string {
  return STORAGE_KEYS.LOGS_PREFIX + alarmId;
}

export const storageService = {
  async loadAlarms(): Promise<Alarm[]> {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.ALARMS);
    return raw ? JSON.parse(raw) : [];
  },

  async saveAlarms(alarms: Alarm[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.ALARMS, JSON.stringify(alarms));
  },

  async loadLogs(alarmId: string): Promise<LogEntry[]> {
    const raw = await AsyncStorage.getItem(logsKey(alarmId));
    return raw ? JSON.parse(raw) : [];
  },

  async appendLog(entry: LogEntry): Promise<void> {
    const existing = await storageService.loadLogs(entry.alarmId);
    await AsyncStorage.setItem(
      logsKey(entry.alarmId),
      JSON.stringify([entry, ...existing]),
    );
  },

  async deleteLogs(alarmId: string): Promise<void> {
    await AsyncStorage.removeItem(logsKey(alarmId));
  },
};
