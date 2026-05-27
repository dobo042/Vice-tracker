import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, Card, Text, useTheme} from 'react-native-paper';
import type {Vice} from '../types';

type ViceStatus = 'never-logged' | 'on-cooldown' | 'ready';

function getStatus(vice: Vice): ViceStatus {
  if (!vice.lastLoggedAt) return 'never-logged';
  const elapsed = Date.now() - new Date(vice.lastLoggedAt).getTime();
  return elapsed >= vice.cooldownMinutes * 60 * 1000 ? 'ready' : 'on-cooldown';
}

function formatRemaining(vice: Vice): string {
  if (!vice.lastLoggedAt) return '';
  const remaining = Math.max(
    0,
    vice.cooldownMinutes * 60 * 1000 - (Date.now() - new Date(vice.lastLoggedAt).getTime()),
  );
  const h = Math.floor(remaining / 3_600_000);
  const m = Math.floor((remaining % 3_600_000) / 60_000);
  return h > 0 ? `${h}h ${m}m remaining` : `${m}m remaining`;
}

function formatCooldown(minutes: number): string {
  if (minutes >= 1440 && minutes % 1440 === 0) return `${minutes / 1440}d`;
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  return `${minutes}m`;
}

interface Props {
  vice: Vice;
  onLogPress: () => void;
  onDeletePress: () => void;
}

export default function ViceCard({vice, onLogPress, onDeletePress}: Props) {
  const theme = useTheme();
  const [status, setStatus] = useState<ViceStatus>(() => getStatus(vice));
  const [remaining, setRemaining] = useState(() => formatRemaining(vice));

  useEffect(() => {
    setStatus(getStatus(vice));
    setRemaining(formatRemaining(vice));
    if (!vice.lastLoggedAt) return;

    const interval = setInterval(() => {
      const next = getStatus(vice);
      setStatus(next);
      setRemaining(formatRemaining(vice));
      if (next === 'ready') clearInterval(interval);
    }, 30_000);

    return () => clearInterval(interval);
  }, [vice.lastLoggedAt, vice.cooldownMinutes]);

  const cardBg =
    status === 'on-cooldown'
      ? (theme.dark ? '#3B1010' : '#FDECEA')
      : status === 'ready'
      ? (theme.dark ? '#0D2B0D' : '#E8F5E9')
      : undefined;

  const statusColor =
    status === 'on-cooldown'
      ? (theme.dark ? '#FF7070' : theme.colors.error)
      : status === 'ready'
      ? (theme.dark ? '#66BB6A' : '#2E7D32')
      : theme.colors.onSurfaceVariant;

  const statusLabel =
    status === 'on-cooldown'
      ? `⏳ ${remaining}`
      : status === 'ready'
      ? '✅ Ready!'
      : '⚪ Not yet logged';

  return (
    <Card style={[styles.card, cardBg ? {backgroundColor: cardBg} : undefined]}>
      <Card.Content>
        <View style={styles.header}>
          <Text variant="titleLarge" style={styles.name}>
            {vice.name}
          </Text>
          <Text variant="labelMedium" style={{color: statusColor}}>
            {statusLabel}
          </Text>
        </View>
        {vice.description ? (
          <Text
            variant="bodyMedium"
            style={{color: theme.colors.onSurfaceVariant, marginTop: 4}}>
            {vice.description}
          </Text>
        ) : null}
        <Text variant="labelSmall" style={{color: theme.colors.outline, marginTop: 6}}>
          ⏱️ Cooldown: {formatCooldown(vice.cooldownMinutes)}
        </Text>
      </Card.Content>
      <Card.Actions style={styles.actions}>
        <Button mode="contained" icon="check" onPress={onLogPress} style={styles.btn}>
          ✅ Log it!
        </Button>
        <Button
          mode="contained"
          buttonColor={theme.colors.error}
          textColor="#fff"
          icon="delete"
          onPress={onDeletePress}
          style={styles.btn}>
          🗑️ Delete
        </Button>
      </Card.Actions>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {marginBottom: 12},
  header: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  name: {flex: 1, marginRight: 8},
  actions: {paddingHorizontal: 16, paddingBottom: 12, gap: 8},
  btn: {flex: 1},
});
