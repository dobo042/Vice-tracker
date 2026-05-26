import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import notifee from '@notifee/react-native';
import {RootStackParamList} from '../types';
import {AlarmListScreen} from '../screens/AlarmListScreen';
import {CreateEditAlarmScreen} from '../screens/CreateEditAlarmScreen';
import {AlarmDetailScreen} from '../screens/AlarmDetailScreen';

const Stack = createStackNavigator<RootStackParamList>();

const screenOptions = {
  headerStyle: {backgroundColor: '#1A1A1A'},
  headerTintColor: '#FFFFFF',
  headerTitleStyle: {fontWeight: '700' as const, fontSize: 18},
  cardStyle: {backgroundColor: '#121212'},
};

export function AppNavigator() {
  const navigationRef = React.useRef<any>(null);

  async function handleInitialNotification() {
    const initial = await notifee.getInitialNotification();
    if (initial && initial.pressAction?.id === 'default' && initial.notification?.id) {
      navigationRef.current?.navigate('AlarmDetail', {alarmId: initial.notification.id});
    }
  }

  return (
    <NavigationContainer ref={navigationRef} onReady={handleInitialNotification}>
      <Stack.Navigator initialRouteName="AlarmList" screenOptions={screenOptions}>
        <Stack.Screen
          name="AlarmList"
          component={AlarmListScreen}
          options={{title: 'Vice Tracker'}}
        />
        <Stack.Screen
          name="CreateEditAlarm"
          component={CreateEditAlarmScreen}
          options={({route}) => ({title: route.params?.alarmId ? 'Edit Alarm' : 'New Alarm'})}
        />
        <Stack.Screen
          name="AlarmDetail"
          component={AlarmDetailScreen}
          options={{title: 'Detail'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
