import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {LogEntry} from '../types';
import {formatDateTime} from '../services/utils';

interface Props {
  entry: LogEntry;
}

export function LogEntryRow({entry}: Props) {
  const icon = entry.source === 'notification' ? '🔔' : '👆';
  const label = entry.source === 'notification' ? 'notification' : 'manual';
  return (
    <View style={styles.row}>
      <Text style={styles.icon}>{icon}</Text>
      <View style={styles.textGroup}>
        <Text style={styles.time}>{formatDateTime(entry.timestamp)}</Text>
        <Text style={styles.source}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 20, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#333'},
  icon: {fontSize: 22, marginRight: 12},
  textGroup: {flex: 1},
  time: {color: '#FFFFFF', fontSize: 16},
  source: {color: '#888888', fontSize: 13, marginTop: 2},
});
