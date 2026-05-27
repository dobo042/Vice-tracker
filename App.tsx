import React, {useEffect} from 'react';
import {StyleSheet} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {MD3DarkTheme, PaperProvider, type MD3Theme} from 'react-native-paper';
import {DarkTheme as NavigationDarkTheme, NavigationContainer} from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import {
  requestNotificationPermissions,
  setupNotifications,
} from './src/utils/notifications';

const OliveDarkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#C5C742',
    onPrimary: '#2A2A00',
    primaryContainer: '#3D3D00',
    onPrimaryContainer: '#E1E155',
  },
};

export default function App() {
  useEffect(() => {
    setupNotifications().then(() => requestNotificationPermissions());
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <PaperProvider theme={OliveDarkTheme}>
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
