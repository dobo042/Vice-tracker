export interface Alarm {
  id: string;
  label: string;
  intervalMinutes: number;
  emoji: string;
  color: string;
  enabled: boolean;
  createdAt: number;
  triggerCount: number;
  notifeeTriggerId: string;
}

export interface LogEntry {
  id: string;
  alarmId: string;
  timestamp: number;
  source: 'notification' | 'manual';
}

export type RootStackParamList = {
  AlarmList: undefined;
  CreateEditAlarm: {alarmId?: string};
  AlarmDetail: {alarmId: string};
};
