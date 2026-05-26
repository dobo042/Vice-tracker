import React from 'react';
import {StyleSheet, ScrollView, Text, TouchableOpacity} from 'react-native';
import {PRESET_EMOJIS} from '../constants';

interface Props {
  selected: string;
  onChange: (emoji: string) => void;
}

export function EmojiPicker({selected, onChange}: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {PRESET_EMOJIS.map(emoji => (
        <TouchableOpacity
          key={emoji}
          style={[styles.item, selected === emoji && styles.itemSelected]}
          onPress={() => onChange(emoji)}>
          <Text style={styles.emoji}>{emoji}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  item: {width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginRight: 8},
  itemSelected: {backgroundColor: '#6200EE33', borderWidth: 2, borderColor: '#6200EE'},
  emoji: {fontSize: 28},
});
