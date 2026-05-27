import React from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {Card, IconButton, Text, useTheme} from 'react-native-paper';
import {useHistoryStore} from '../store/historyStore';
import type {HistoryEntry} from '../types';

interface HistoryCardProps {
  entry: HistoryEntry;
  onRemove: () => void;
}

function HistoryCard({entry, onRemove}: HistoryCardProps) {
  const theme = useTheme();
  const formatted = new Date(entry.loggedAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Card style={styles.card}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.cardText}>
          <Text variant="titleMedium">{entry.viceName}</Text>
          {entry.viceDescription ? (
            <Text variant="bodySmall" style={{color: theme.colors.onSurfaceVariant}}>
              {entry.viceDescription}
            </Text>
          ) : null}
          <Text variant="labelSmall" style={{color: theme.colors.outline, marginTop: 4}}>
            🕐 Logged {formatted}
          </Text>
        </View>
        <IconButton icon="close" onPress={onRemove} />
      </Card.Content>
    </Card>
  );
}

export default function HistoryScreen() {
  const theme = useTheme();
  const {entries, deleteEntry} = useHistoryStore();

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      {entries.length === 0 ? (
        <View style={styles.empty}>
          <Text variant="headlineSmall" style={{color: theme.colors.onSurfaceVariant}}>
            📜 No history yet
          </Text>
          <Text
            variant="bodyMedium"
            style={{color: theme.colors.onSurfaceVariant, marginTop: 8}}>
            Vices logged before deletion will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <HistoryCard entry={item} onRemove={() => deleteEntry(item.id)} />
          )}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  list: {padding: 16},
  empty: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  card: {marginBottom: 12},
  cardContent: {flexDirection: 'row', alignItems: 'center'},
  cardText: {flex: 1},
});
