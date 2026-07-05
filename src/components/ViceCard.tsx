import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Text, useTheme } from 'react-native-paper';
import type { Vice } from '../types';

type ViceStatus = 'never-logged' | 'on-cooldown' | 'ready';

function getStatus(lastLoggedAt: string | undefined, cooldownMinutes: number): ViceStatus {
  if (!lastLoggedAt) {
    return 'never-logged';
  }
  const elapsed = Date.now() - new Date(lastLoggedAt).getTime();
  return elapsed >= cooldownMinutes * 60 * 1000 ? 'ready' : 'on-cooldown';
}

function formatRemaining(lastLoggedAt: string | undefined, cooldownMinutes: number): string {
  if (!lastLoggedAt) {
    return '';
  }
  const remaining = Math.max(
    0,
    cooldownMinutes * 60 * 1000 - (Date.now() - new Date(lastLoggedAt).getTime()),
  );
  const h = Math.floor(remaining / 3_600_000);
  const m = Math.floor((remaining % 3_600_000) / 60_000);
  return h > 0 ? `${h}h ${m}m remaining` : `${m}m remaining`;
}

function formatCooldown(minutes: number): string {
  if (minutes % 1440 === 0) {
    return `${minutes / 1440}d`;
  }
  if (minutes % 60 === 0) {
    return `${minutes / 60}h`;
  }
  return `${minutes}m`;
}

interface Props {
  vice: Vice;
  onLogPress: () => void;
  onResetPress: () => void;
  onDeletePress: () => void;
}

export default function ViceCard({ vice, onLogPress, onResetPress, onDeletePress }: Props) {
  const theme = useTheme();
  const { lastLoggedAt, cooldownMinutes } = vice;
  const [status, setStatus] = useState<ViceStatus>(() => getStatus(lastLoggedAt, cooldownMinutes));
  const [remaining, setRemaining] = useState(() => formatRemaining(lastLoggedAt, cooldownMinutes));

  useEffect(() => {
    setStatus(getStatus(lastLoggedAt, cooldownMinutes));
    setRemaining(formatRemaining(lastLoggedAt, cooldownMinutes));
    if (!lastLoggedAt) {
      return;
    }

    const interval = setInterval(() => {
      const next = getStatus(lastLoggedAt, cooldownMinutes);
      setStatus(next);
      setRemaining(formatRemaining(lastLoggedAt, cooldownMinutes));
      if (next === 'ready') {
        clearInterval(interval);
      }
    }, 30_000);

    return () => clearInterval(interval);
  }, [lastLoggedAt, cooldownMinutes]);

  const cardBg = status === 'on-cooldown' ? '#FDECEA' : status === 'ready' ? '#E8F5E9' : undefined;

  const statusColor =
    status === 'on-cooldown'
      ? theme.colors.error
      : status === 'ready'
      ? '#2E7D32'
      : theme.colors.onSurfaceVariant;

  const statusLabel =
    status === 'on-cooldown' ? remaining : status === 'ready' ? 'Ready!' : 'Not yet logged';

  const count = vice.logCount ?? 0;

  return (
    <Card style={[styles.card, cardBg ? { backgroundColor: cardBg } : undefined]}>
      <Card.Content>
        <View style={styles.header}>
          <Text variant="titleLarge" style={styles.name}>
            {vice.name}
          </Text>
          <View style={styles.headerRight}>
            {count > 0 && (
              <Chip compact icon="counter" style={styles.countChip}>
                ×{count}
              </Chip>
            )}
            <Text variant="labelMedium" style={{ color: statusColor }}>
              ● {statusLabel}
            </Text>
          </View>
        </View>
        {vice.description ? (
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
            {vice.description}
          </Text>
        ) : null}
        <Text variant="labelSmall" style={{ color: theme.colors.outline, marginTop: 6 }}>
          Cooldown: {formatCooldown(vice.cooldownMinutes)}
        </Text>
      </Card.Content>
      <Card.Actions style={styles.actions}>
        <Button mode="contained" icon="check" onPress={onLogPress} style={styles.btn}>
          Log
        </Button>
        {count > 0 && (
          <Button mode="outlined" icon="restore" onPress={onResetPress} style={styles.btn}>
            Reset
          </Button>
        )}
        <Button
          mode="contained"
          buttonColor={theme.colors.error}
          textColor="#fff"
          icon="delete"
          onPress={onDeletePress}
          style={styles.btn}
        >
          Delete
        </Button>
      </Card.Actions>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { flex: 1, marginRight: 8 },
  headerRight: { alignItems: 'flex-end', gap: 4 },
  countChip: { height: 24 },
  actions: { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  btn: { flex: 1 },
});
