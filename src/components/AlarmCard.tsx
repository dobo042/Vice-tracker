import React from 'react';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import {Switch} from 'react-native-paper';
import {Alarm} from '../types';

interface Props {
  alarm: Alarm;
  onPress: () => void;
  onToggle: (enabled: boolean) => void;
  onLongPress: () => void;
}

export function AlarmCard({alarm, onPress, onToggle, onLongPress}: Props) {
  return (
    <TouchableOpacity
      style={[styles.card, {borderLeftColor: alarm.color}]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.75}>
      <View style={styles.content}>
        <Text style={styles.emoji}>{alarm.emoji}</Text>
        <View style={styles.info}>
          <Text style={styles.label} numberOfLines={1}>{alarm.label}</Text>
          <Text style={styles.sub}>Every {alarm.intervalMinutes} min  ·  {alarm.triggerCount} logged</Text>
        </View>
      </View>
      <Switch value={alarm.enabled} onValueChange={onToggle} color={alarm.color} style={styles.toggle} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E1E1E', borderLeftWidth: 5, borderRadius: 8,
    marginHorizontal: 16, marginVertical: 6, flexDirection: 'row',
    alignItems: 'center', minHeight: 80, paddingRight: 8,
  },
  content: {flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12},
  emoji: {fontSize: 32, marginRight: 12},
  info: {flex: 1},
  label: {color: '#FFFFFF', fontSize: 18, fontWeight: '600'},
  sub: {color: '#AAAAAA', fontSize: 14, marginTop: 2},
  toggle: {marginLeft: 8},
});
