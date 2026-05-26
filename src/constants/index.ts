export const CHANNEL_ID = 'vice-tracker-alarms';
export const CHANNEL_NAME = 'Vice Tracker Alarms';

export const STORAGE_KEYS = {
  ALARMS: '@vice_tracker/alarms',
  LOGS_PREFIX: '@vice_tracker/logs/',
} as const;

export const NOTIFICATION_ACTION_LOG = 'LOG_IT';
export const NOTIFICATION_ACTION_DISMISS = 'DISMISS';

export const PRESET_COLORS = [
  '#6200EE',
  '#03DAC6',
  '#FF6200',
  '#E91E63',
  '#4CAF50',
  '#2196F3',
  '#FF5722',
  '#9C27B0',
];

export const PRESET_EMOJIS = [
  '🔔', '💧', '🏃', '💊', '🍺', '🚬', '☕', '🧘', '💪', '🎸', '🍕', '🥤',
];

export const INTERVAL_PRESETS = [15, 30, 45, 60, 90, 120];
