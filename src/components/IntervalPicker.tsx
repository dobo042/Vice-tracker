import React, {useState} from 'react';
import {StyleSheet, View, Text, TextInput, ScrollView, TouchableOpacity} from 'react-native';
import {INTERVAL_PRESETS} from '../constants';

interface Props {
  value: number;
  onChange: (minutes: number) => void;
}

export function IntervalPicker({value, onChange}: Props) {
  const isPreset = INTERVAL_PRESETS.includes(value);
  const [isCustom, setIsCustom] = useState(!isPreset);
  const [customText, setCustomText] = useState(isPreset ? '' : String(value));

  function selectPreset(minutes: number) {
    setIsCustom(false);
    setCustomText('');
    onChange(minutes);
  }

  function handleCustomChange(text: string) {
    setCustomText(text);
    const parsed = parseInt(text, 10);
    if (!isNaN(parsed) && parsed >= 1) {
      onChange(parsed);
    }
  }

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        {INTERVAL_PRESETS.map(min => (
          <TouchableOpacity
            key={min}
            style={[styles.chip, !isCustom && value === min && styles.chipSelected]}
            onPress={() => selectPreset(min)}>
            <Text style={[styles.chipText, !isCustom && value === min && styles.chipTextSelected]}>
              {min} min
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.chip, isCustom && styles.chipSelected]}
          onPress={() => { setIsCustom(true); setCustomText(String(value)); }}>
          <Text style={[styles.chipText, isCustom && styles.chipTextSelected]}>Custom</Text>
        </TouchableOpacity>
      </ScrollView>
      {isCustom && (
        <View style={styles.customRow}>
          <TextInput
            style={styles.customInput}
            keyboardType="number-pad"
            value={customText}
            onChangeText={handleCustomChange}
            placeholder="minutes"
            placeholderTextColor="#666"
            maxLength={4}
          />
          <Text style={styles.minLabel}>min</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  chipRow: {flexDirection: 'row', marginBottom: 8},
  chip: {borderWidth: 1.5, borderColor: '#444', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, marginRight: 8, minHeight: 44, justifyContent: 'center'},
  chipSelected: {borderColor: '#6200EE', backgroundColor: '#6200EE22'},
  chipText: {color: '#AAAAAA', fontSize: 15},
  chipTextSelected: {color: '#FFFFFF', fontWeight: '600'},
  customRow: {flexDirection: 'row', alignItems: 'center', marginTop: 4},
  customInput: {borderWidth: 1.5, borderColor: '#6200EE', borderRadius: 8, color: '#FFFFFF', fontSize: 18, paddingHorizontal: 14, paddingVertical: 10, width: 100, textAlign: 'center'},
  minLabel: {color: '#AAAAAA', fontSize: 16, marginLeft: 10},
});
