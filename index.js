/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import notifee, {EventType} from '@notifee/react-native';
import {alarmService} from './src/services/alarmService';
import {storageService} from './src/services/storageService';
import {scheduleAlarm} from './src/services/notificationService';
import {
  NOTIFICATION_ACTION_LOG,
  NOTIFICATION_ACTION_DISMISS,
} from './src/constants';

AppRegistry.registerComponent(appName, () => App);

// Handles notification action taps when the app is in the background or killed.
notifee.onBackgroundEvent(async ({type, detail}) => {
  const id = detail.notification?.id;
  if (!id) {
    return;
  }
  if (type === EventType.ACTION_PRESS) {
    if (detail.pressAction?.id === NOTIFICATION_ACTION_LOG) {
      await alarmService.handleLogAction(id);
      await notifee.cancelNotification(id);
    }
    if (detail.pressAction?.id === NOTIFICATION_ACTION_DISMISS) {
      await notifee.cancelNotification(id);
    }
  }
});

// Re-schedules all enabled alarms after a device reboot.
AppRegistry.registerHeadlessTask(
  'io.invertase.notifee.RNNotifeeInitializationTask',
  () => async () => {
    const alarms = await storageService.loadAlarms();
    for (const alarm of alarms.filter(a => a.enabled)) {
      await scheduleAlarm(alarm);
    }
  },
);
