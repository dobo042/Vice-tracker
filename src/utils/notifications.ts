import notifee, {
  AndroidImportance,
  AuthorizationStatus,
  TriggerType,
} from '@notifee/react-native';
import type { Vice } from '../types';

const CHANNEL_ID = 'vice-ready';

export async function setupNotifications(): Promise<void> {
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: 'Vice Ready',
    importance: AndroidImportance.HIGH,
  });
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const settings = await notifee.requestPermission();
  return settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED;
}

export async function scheduleViceReadyNotification(vice: Vice): Promise<void> {
  // cancel any existing notification for this vice before rescheduling
  await notifee.cancelNotification(`vice-${vice.id}`);

  await notifee.createTriggerNotification(
    {
      id: `vice-${vice.id}`,
      title: 'Vice Tracker',
      body: `You can ${vice.name} again!`,
      android: {
        channelId: CHANNEL_ID,
        pressAction: { id: 'default' },
      },
    },
    {
      type: TriggerType.TIMESTAMP,
      timestamp: Date.now() + vice.cooldownMinutes * 60 * 1000,
    },
  );
}

export async function cancelViceNotification(viceId: string): Promise<void> {
  await notifee.cancelNotification(`vice-${viceId}`);
}
