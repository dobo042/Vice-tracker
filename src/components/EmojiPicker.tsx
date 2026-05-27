import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
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
    <View style={styles.grid}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  cell: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  emoji: {
    fontSize: 22,
  },
});
