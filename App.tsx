import React, {useEffect} from 'react';
import {StyleSheet} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {MD3DarkTheme, PaperProvider} from 'react-native-paper';
import {DarkTheme as NavigationDarkTheme, NavigationContainer} from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import {
  requestNotificationPermissions,
  setupNotifications,
} from './src/utils/notifications';

export default function App() {
  useEffect(() => {
    setupNotifications().then(() => requestNotificationPermissions());
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <PaperProvider theme={MD3DarkTheme}>
          <NavigationContainer theme={NavigationDarkTheme}>
            <AppNavigator />
          </NavigationContainer>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1},
});
