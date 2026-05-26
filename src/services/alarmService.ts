import {Alarm, LogEntry} from '../types';
import {storageService} from './storageService';
import {cancelAlarm, scheduleAlarm} from './notificationService';
import {uuid} from './utils';

type CreateAlarmParams = Omit<Alarm, 'id' | 'createdAt' | 'triggerCount' | 'notifeeTriggerId'>;

export const alarmService = {
  async createAlarm(params: CreateAlarmParams): Promise<Alarm> {
    const id = uuid();
    const alarm: Alarm = {
      ...params,
      id,
      notifeeTriggerId: id,
      createdAt: Date.now(),
      triggerCount: 0,
    };
    const alarms = await storageService.loadAlarms();
    await storageService.saveAlarms([...alarms, alarm]);
    if (alarm.enabled) {
      await scheduleAlarm(alarm);
    }
    return alarm;
  },

  async updateAlarm(id: string, updates: Partial<Alarm>): Promise<void> {
    const alarms = await storageService.loadAlarms();
    const idx = alarms.findIndex(a => a.id === id);
    if (idx === -1) {
      return;
    }
    const updated = {...alarms[idx], ...updates};
    alarms[idx] = updated;
    await storageService.saveAlarms(alarms);
    await cancelAlarm(id);
    if (updated.enabled) {
      await scheduleAlarm(updated);
    }
  },

  async deleteAlarm(id: string): Promise<void> {
    await cancelAlarm(id);
    await storageService.deleteLogs(id);
    const alarms = await storageService.loadAlarms();
    await storageService.saveAlarms(alarms.filter(a => a.id !== id));
  },

  async toggleAlarm(id: string, enabled: boolean): Promise<void> {
    const alarms = await storageService.loadAlarms();
    const idx = alarms.findIndex(a => a.id === id);
    if (idx === -1) {
      return;
    }
    alarms[idx].enabled = enabled;
    await storageService.saveAlarms(alarms);
    if (enabled) {
      await scheduleAlarm(alarms[idx]);
    } else {
      await cancelAlarm(id);
    }
  },

  // Used by both foreground and headless background handler — must be pure async
  async handleLogAction(alarmId: string): Promise<void> {
    const entry: LogEntry = {
      id: uuid(),
      alarmId,
      timestamp: Date.now(),
      source: 'notification',
    };
    await storageService.appendLog(entry);
    const alarms = await storageService.loadAlarms();
    const idx = alarms.findIndex(a => a.id === alarmId);
    if (idx !== -1) {
      alarms[idx].triggerCount += 1;
      await storageService.saveAlarms(alarms);
    }
  },

  async manualLog(alarmId: string): Promise<void> {
    const entry: LogEntry = {
      id: uuid(),
      alarmId,
      timestamp: Date.now(),
      source: 'manual',
    };
    await storageService.appendLog(entry);
    const alarms = await storageService.loadAlarms();
    const idx = alarms.findIndex(a => a.id === alarmId);
    if (idx !== -1) {
      alarms[idx].triggerCount += 1;
      await storageService.saveAlarms(alarms);
    }
  },
};
