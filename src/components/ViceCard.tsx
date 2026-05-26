import React from 'react';
import {StyleSheet} from 'react-native';
import {Button, Card, Text, useTheme} from 'react-native-paper';
import type {Vice} from '../types';

interface Props {
  vice: Vice;
  onDeletePress: () => void;
}

export default function ViceCard({vice, onDeletePress}: Props) {
  const theme = useTheme();
  const formatted = new Date(vice.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleLarge">{vice.name}</Text>
        {vice.description ? (
          <Text
            variant="bodyMedium"
            style={{color: theme.colors.onSurfaceVariant, marginTop: 4}}>
            {vice.description}
          </Text>
        ) : null}
        <Text variant="labelSmall" style={{color: theme.colors.outline, marginTop: 8}}>
          Added {formatted}
        </Text>
      </Card.Content>
      <Card.Actions style={styles.actions}>
        <Button
          mode="contained"
          buttonColor={theme.colors.error}
          textColor="#fff"
          icon="delete"
          onPress={onDeletePress}
          style={styles.deleteButton}>
          Delete
        </Button>
      </Card.Actions>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {marginBottom: 12},
  actions: {paddingHorizontal: 16, paddingBottom: 12},
  deleteButton: {flex: 1},
});
