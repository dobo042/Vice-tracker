import React, {useEffect} from 'react';
import {Provider as PaperProvider, MD3DarkTheme} from 'react-native-paper';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import notifee, {EventType} from '@notifee/react-native';
import {AppNavigator} from './src/navigation/AppNavigator';
import {alarmService} from './src/services/alarmService';
import {
  NOTIFICATION_ACTION_LOG,
  NOTIFICATION_ACTION_DISMISS,
} from './src/constants';

const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#6200EE',
    secondary: '#03DAC6',
  },
};

export default function App() {
  useEffect(() => {
    const unsubscribe = notifee.onForegroundEvent(async ({type, detail}) => {
      if (type === EventType.ACTION_PRESS) {
        const id = detail.notification?.id;
        if (!id) {
          return;
        }
        if (detail.pressAction?.id === NOTIFICATION_ACTION_LOG) {
          await alarmService.handleLogAction(id);
          await notifee.cancelNotification(id);
        }
        if (detail.pressAction?.id === NOTIFICATION_ACTION_DISMISS) {
          await notifee.cancelNotification(id);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <PaperProvider theme={theme}>
        <AppNavigator />
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
