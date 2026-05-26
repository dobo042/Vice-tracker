import React, {useState} from 'react';
import {
  StyleSheet, View, Text, TextInput, ScrollView,
  TouchableOpacity, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../types';
import {useAlarmStore} from '../store/alarmStore';
import {IntervalPicker} from '../components/IntervalPicker';
import {ColorPicker} from '../components/ColorPicker';
import {EmojiPicker} from '../components/EmojiPicker';
import {PRESET_COLORS} from '../constants';

type Nav = StackNavigationProp<RootStackParamList, 'CreateEditAlarm'>;
type RouteType = RouteProp<RootStackParamList, 'CreateEditAlarm'>;

export function CreateEditAlarmScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteType>();
  const {alarms, createAlarm, updateAlarm} = useAlarmStore();

  const editingId = route.params?.alarmId;
  const existing = editingId ? alarms.find(a => a.id === editingId) : undefined;

  const [label, setLabel] = useState(existing?.label ?? '');
  const [intervalMinutes, setIntervalMinutes] = useState(existing?.intervalMinutes ?? 60);
  const [emoji, setEmoji] = useState(existing?.emoji ?? '🔔');
  const [color, setColor] = useState(existing?.color ?? PRESET_COLORS[0]);

  function validate(): boolean {
    if (!label.trim()) {
      Alert.alert('Label required', 'Please enter a name for this alarm.');
      return false;
    }
    if (intervalMinutes < 1) {
      Alert.alert('Invalid interval', 'Minimum interval is 1 minute.');
      return false;
    }
    return true;
  }

  async function handleSave() {
    if (!validate()) {
      return;
    }
    if (editingId) {
      await updateAlarm(editingId, {label: label.trim(), intervalMinutes, emoji, color});
    } else {
      await createAlarm({label: label.trim(), intervalMinutes, emoji, color, enabled: true});
    }
    navigation.goBack();
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionLabel}>Name</Text>
        <TextInput
          style={styles.textInput}
          value={label}
          onChangeText={setLabel}
          placeholder="e.g. Water intake"
          placeholderTextColor="#666"
          autoFocus
          returnKeyType="done"
          maxLength={40}
        />
        <Text style={styles.sectionLabel}>Repeat every</Text>
        <IntervalPicker value={intervalMinutes} onChange={setIntervalMinutes} />
        <Text style={styles.sectionLabel}>Icon</Text>
        <EmojiPicker selected={emoji} onChange={setEmoji} />
        <Text style={styles.sectionLabel}>Color</Text>
        <ColorPicker selected={color} onChange={setColor} />
        <TouchableOpacity
          style={[styles.saveBtn, {backgroundColor: color}]}
          onPress={handleSave}
          activeOpacity={0.8}>
          <Text style={styles.saveBtnText}>
            {editingId ? 'Save changes' : 'Create alarm'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#121212'},
  scroll: {padding: 20, paddingBottom: 40},
  sectionLabel: {
    color: '#AAAAAA', fontSize: 13, fontWeight: '600',
    letterSpacing: 1, textTransform: 'uppercase', marginTop: 24, marginBottom: 10,
  },
  textInput: {
    borderWidth: 1.5, borderColor: '#444', borderRadius: 10,
    color: '#FFFFFF', fontSize: 18, paddingHorizontal: 16,
    paddingVertical: 14, backgroundColor: '#1E1E1E',
  },
  saveBtn: {marginTop: 36, borderRadius: 12, height: 60, alignItems: 'center', justifyContent: 'center'},
  saveBtnText: {color: '#FFFFFF', fontSize: 18, fontWeight: '700', letterSpacing: 0.5},
});
