import React from 'react';
import {StyleSheet, View, TouchableOpacity} from 'react-native';
import {PRESET_COLORS} from '../constants';

interface Props {
  selected: string;
  onChange: (color: string) => void;
}

export function ColorPicker({selected, onChange}: Props) {
  return (
    <View style={styles.row}>
      {PRESET_COLORS.map(color => (
        <TouchableOpacity
          key={color}
          style={[styles.swatch, {backgroundColor: color}, selected === color && styles.swatchSelected]}
          onPress={() => onChange(color)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {flexDirection: 'row', flexWrap: 'wrap', gap: 12},
  swatch: {width: 40, height: 40, borderRadius: 20},
  swatchSelected: {borderWidth: 3, borderColor: '#FFFFFF'},
});
