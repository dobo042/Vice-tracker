import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import VicesScreen from '../screens/VicesScreen';
import HistoryScreen from '../screens/HistoryScreen';
import type {RootStackParamList} from './types';

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: '#1A1A00'},
        headerTintColor: '#fff',
        headerTitleStyle: {fontWeight: 'bold'},
      }}>
      <Stack.Screen name="Vices" component={VicesScreen} options={{title: 'My Vices'}} />
      <Stack.Screen name="History" component={HistoryScreen} options={{title: 'History'}} />
    </Stack.Navigator>
  );
}
