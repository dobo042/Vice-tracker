import React from 'react';
import {Pressable, ScrollView, StyleSheet, Text} from 'react-native';
import {useTheme} from 'react-native-paper';

export const VICE_EMOJIS = [
  // Alcohol
  '🍺', '🍻', '🥃', '🍷', '🍸', '🍹', '🥂',
  // Smoking
  '🚬', '💨',
  // Gambling
  '🎰', '🃏', '🎲',
  // Junk food
  '🍕', '🍔', '🍩', '🍫', '🍟', '🌮', '🍦',
  // Caffeine
  '☕', '🧋',
  // Screens & gaming
  '🎮', '📱', '📺',
  // Shopping
  '🛍️', '💳',
  // Other
  '💊', '😈',
];

interface Props {
  value: string;
  onChange: (emoji: string) => void;
}

export default function EmojiPicker({value, onChange}: Props) {
  const theme = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}>
      {VICE_EMOJIS.map(emoji => {
        const selected = value === emoji;
        return (
          <Pressable
            key={emoji}
            onPress={() => onChange(selected ? '' : emoji)}
            style={[
              styles.cell,
              selected && {backgroundColor: theme.colors.primaryContainer},
            ]}>
            <Text style={styles.emoji}>{emoji}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 4,
  },
  cell: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  emoji: {
    fontSize: 22,
  },
});
