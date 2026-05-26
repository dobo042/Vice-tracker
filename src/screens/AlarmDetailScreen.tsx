import React, {useEffect, useCallback} from 'react';
import {
  StyleSheet, View, Text, FlatList, TouchableOpacity, AppState,
} from 'react-native';
import {useNavigation, useRoute, RouteProp, useFocusEffect} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../types';
import {useAlarmStore} from '../store/alarmStore';
import {LogEntryRow} from '../components/LogEntryRow';

type Nav = StackNavigationProp<RootStackParamList, 'AlarmDetail'>;
type RouteType = RouteProp<RootStackParamList, 'AlarmDetail'>;

export function AlarmDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteType>();
  const {alarmId} = route.params;

  const alarms = useAlarmStore(s => s.alarms);
  const logs = useAlarmStore(s => s.logs);
  const loadLogs = useAlarmStore(s => s.loadLogs);
  const manualLog = useAlarmStore(s => s.manualLog);
  const refreshAlarms = useAlarmStore(s => s.refreshAlarms);

  const alarm = alarms.find(a => a.id === alarmId);
  const alarmLogs = logs[alarmId] ?? [];

  useFocusEffect(
    useCallback(() => {
      loadLogs(alarmId);
      refreshAlarms();
    }, [alarmId]),
  );

  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') {
        loadLogs(alarmId);
        refreshAlarms();
      }
    });
    return () => sub.remove();
  }, [alarmId]);

  useEffect(() => {
    if (alarm) {
      navigation.setOptions({
        title: `${alarm.emoji} ${alarm.label}`,
        headerRight: () => (
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate('CreateEditAlarm', {alarmId: alarm.id})}>
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        ),
      });
    }
  }, [alarm]);

  if (!alarm) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFound}>Alarm not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.hero, {borderBottomColor: alarm.color}]}>
        <Text style={styles.heroCount}>{alarm.triggerCount}</Text>
        <Text style={styles.heroLabel}>events logged</Text>
        <Text style={styles.heroSub}>Every {alarm.intervalMinutes} minutes</Text>
      </View>
      <TouchableOpacity
        style={[styles.logBtn, {backgroundColor: alarm.color}]}
        onPress={() => manualLog(alarmId)}
        activeOpacity={0.8}>
        <Text style={styles.logBtnText}>LOG NOW</Text>
      </TouchableOpacity>
      <Text style={styles.historyHeading}>History</Text>
      {alarmLogs.length === 0 ? (
        <Text style={styles.noHistory}>No entries yet — tap LOG NOW or wait for a notification.</Text>
      ) : (
        <FlatList
          data={alarmLogs}
          keyExtractor={item => item.id}
          renderItem={({item}) => <LogEntryRow entry={item} />}
          style={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#121212'},
  hero: {alignItems: 'center', paddingTop: 32, paddingBottom: 24, borderBottomWidth: 3},
  heroCount: {color: '#FFFFFF', fontSize: 64, fontWeight: '800', lineHeight: 72},
  heroLabel: {color: '#AAAAAA', fontSize: 18, marginTop: 4},
  heroSub: {color: '#666', fontSize: 14, marginTop: 6},
  logBtn: {marginHorizontal: 20, marginTop: 24, height: 72, borderRadius: 14, alignItems: 'center', justifyContent: 'center', elevation: 4},
  logBtnText: {color: '#FFFFFF', fontSize: 24, fontWeight: '800', letterSpacing: 2},
  historyHeading: {color: '#AAAAAA', fontSize: 13, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', marginTop: 28, marginBottom: 4, paddingHorizontal: 20},
  noHistory: {color: '#666', fontSize: 15, padding: 20, textAlign: 'center', marginTop: 12},
  list: {flex: 1},
  notFound: {color: '#888', fontSize: 18, textAlign: 'center', marginTop: 40},
  editBtn: {marginRight: 16},
  editBtnText: {color: '#BB86FC', fontSize: 16, fontWeight: '600'},
});
