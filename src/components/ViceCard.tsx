import React, {useEffect, useState} from 'react';
import {AppState, StyleSheet, View} from 'react-native';
import {Button, Card, Text, useTheme} from 'react-native-paper';
import type {Vice} from '../types';

type ViceStatus = 'never-logged' | 'on-cooldown' | 'ready';

function getStatus(vice: Vice): ViceStatus {
  if (!vice.lastLoggedAt) return 'never-logged';
  const elapsed = Date.now() - new Date(vice.lastLoggedAt).getTime();
  return elapsed >= vice.cooldownMinutes * 60 * 1000 ? 'ready' : 'on-cooldown';
}

function getProgress(vice: Vice): number {
  if (!vice.lastLoggedAt) return 1;
  const elapsed = Date.now() - new Date(vice.lastLoggedAt).getTime();
  return Math.min(1, elapsed / (vice.cooldownMinutes * 60 * 1000));
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
  screenFocused: boolean;
}

export default function ViceCard({vice, onLogPress, onDeletePress, screenFocused}: Props) {
  const theme = useTheme();
  const [status, setStatus] = useState<ViceStatus>(() => getStatus(vice));
  const [remaining, setRemaining] = useState(() => formatRemaining(vice));
  const [progress, setProgress] = useState(() => getProgress(vice));

  useEffect(() => {
    const recalculate = () => {
      const next = getStatus(vice);
      setStatus(next);
      setRemaining(formatRemaining(vice));
      setProgress(getProgress(vice));
    };

    recalculate();

    if (!vice.lastLoggedAt) return;

    // Recalculate immediately when the user returns from background
    const appStateSub = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') recalculate();
    });

    // Only tick while this screen is actually visible
    let interval: ReturnType<typeof setInterval> | undefined;
    if (screenFocused) {
      interval = setInterval(() => {
        const next = getStatus(vice);
        setStatus(next);
        setRemaining(formatRemaining(vice));
        setProgress(getProgress(vice));
        if (next === 'ready') clearInterval(interval);
      }, 60_000);
    }

    return () => {
      appStateSub.remove();
      if (interval !== undefined) clearInterval(interval);
    };
  }, [vice.lastLoggedAt, vice.cooldownMinutes, screenFocused]);

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

  const progressColor =
    status === 'on-cooldown'
      ? (theme.dark ? '#C62828' : '#EF9A9A')
      : (theme.dark ? '#2E7D32' : '#66BB6A');

  const statusLabel =
    status === 'on-cooldown' ? remaining : status === 'ready' ? 'Ready!' : 'Not yet logged';

  return (
    <Card style={[styles.card, cardBg ? {backgroundColor: cardBg} : undefined]}>
      <Card.Content>
        <View style={styles.header}>
          {vice.emoji ? <Text style={styles.emoji}>{vice.emoji}</Text> : null}
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
          Cooldown: {formatCooldown(vice.cooldownMinutes)}
        </Text>
      </Card.Content>
      <Card.Actions style={styles.actions}>
        <Button mode="contained" icon="check" onPress={onLogPress} style={styles.btn}>
          Log
        </Button>
        <Button
          mode="contained"
          buttonColor={theme.colors.error}
          textColor="#fff"
          icon="delete"
          onPress={onDeletePress}
          style={styles.btn}>
          Delete
        </Button>
      </Card.Actions>
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {width: `${progress * 100}%`, backgroundColor: progressColor},
          ]}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {marginBottom: 12, overflow: 'hidden'},
  header: {flexDirection: 'row', alignItems: 'center'},
  emoji: {fontSize: 22, marginRight: 8},
  name: {flex: 1, marginRight: 8},
  actions: {paddingHorizontal: 16, paddingBottom: 12, gap: 8},
  btn: {flex: 1},
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(128,128,128,0.2)',
  },
  progressFill: {height: 6},
});
