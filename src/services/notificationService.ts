import notifee, {
  AndroidImportance,
  AndroidVisibility,
  TriggerType,
  TimeUnit,
  AndroidStyle,
} from '@notifee/react-native';
import type {IntervalTrigger} from '@notifee/react-native';
import {Alarm} from '../types';
import {
  CHANNEL_ID,
  CHANNEL_NAME,
  NOTIFICATION_ACTION_DISMISS,
  NOTIFICATION_ACTION_LOG,
} from '../constants';

export async function bootstrapNotifications(): Promise<void> {
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: CHANNEL_NAME,
    importance: AndroidImportance.HIGH,
    visibility: AndroidVisibility.PUBLIC,
    sound: 'default',
    vibration: true,
    lights: true,
  });
  await notifee.requestPermission();
}

export async function scheduleAlarm(alarm: Alarm): Promise<void> {
  const trigger: IntervalTrigger = {
    type: TriggerType.INTERVAL,
    interval: alarm.intervalMinutes,
    timeUnit: TimeUnit.MINUTES,
  };

  await notifee.createTriggerNotification(
    {
      id: alarm.id,
      title: `${alarm.emoji} ${alarm.label}`,
      body: `Tap "Log it" to record — total so far: ${alarm.triggerCount}`,
      android: {
        channelId: CHANNEL_ID,
        importance: AndroidImportance.HIGH,
        color: alarm.color,
        smallIcon: 'ic_notification',
        pressAction: {id: 'default'},
        actions: [
          {title: 'Log it', pressAction: {id: NOTIFICATION_ACTION_LOG}},
          {title: 'Dismiss', pressAction: {id: NOTIFICATION_ACTION_DISMISS}},
        ],
        style: {
          type: AndroidStyle.BIGTEXT,
          text: `Every ${alarm.intervalMinutes} min  •  Total logged: ${alarm.triggerCount}`,
        },
      },
    },
    trigger,
  );
}

export async function cancelAlarm(alarmId: string): Promise<void> {
  await notifee.cancelTriggerNotification(alarmId);
}

export async function rescheduleAllAlarms(alarms: Alarm[]): Promise<void> {
  for (const alarm of alarms.filter(a => a.enabled)) {
    await scheduleAlarm(alarm);
  }
}
