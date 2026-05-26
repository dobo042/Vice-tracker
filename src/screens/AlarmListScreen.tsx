import React, {useEffect, useCallback} from 'react';
import {StyleSheet, View, FlatList, Text, Alert, AppState} from 'react-native';
import {FAB} from 'react-native-paper';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../types';
import {useAlarmStore} from '../store/alarmStore';
import {AlarmCard} from '../components/AlarmCard';
import {bootstrapNotifications} from '../services/notificationService';

type Nav = StackNavigationProp<RootStackParamList, 'AlarmList'>;

export function AlarmListScreen() {
  const navigation = useNavigation<Nav>();
  const {alarms, loadAll, deleteAlarm, toggleAlarm, refreshAlarms} = useAlarmStore();

  useEffect(() => {
    bootstrapNotifications();
    loadAll();
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') {
        refreshAlarms();
      }
    });
    return () => sub.remove();
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshAlarms();
    }, []),
  );

  function handleLongPress(id: string, label: string) {
    Alert.alert(`Delete "${label}"?`, 'This will remove all history too.', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Delete', style: 'destructive', onPress: () => deleteAlarm(id)},
    ]);
  }

  return (
    <View style={styles.container}>
      {alarms.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🔔</Text>
          <Text style={styles.emptyTitle}>No alarms yet</Text>
          <Text style={styles.emptySub}>Tap + to create your first trackable alarm</Text>
        </View>
      ) : (
        <FlatList
          data={alarms}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <AlarmCard
              alarm={item}
              onPress={() => navigation.navigate('AlarmDetail', {alarmId: item.id})}
              onToggle={enabled => toggleAlarm(item.id, enabled)}
              onLongPress={() => handleLongPress(item.id, item.label)}
            />
          )}
          contentContainerStyle={styles.list}
        />
      )}
      <FAB
        icon="plus"
        style={styles.fab}
        color="#FFFFFF"
        onPress={() => navigation.navigate('CreateEditAlarm', {})}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#121212'},
  list: {paddingVertical: 8, paddingBottom: 100},
  empty: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32},
  emptyEmoji: {fontSize: 64, marginBottom: 16},
  emptyTitle: {color: '#FFFFFF', fontSize: 22, fontWeight: '700', marginBottom: 8},
  emptySub: {color: '#888', fontSize: 16, textAlign: 'center'},
  fab: {position: 'absolute', right: 20, bottom: 28, backgroundColor: '#6200EE'},
});
