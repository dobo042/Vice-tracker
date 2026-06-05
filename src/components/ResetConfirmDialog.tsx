import React from 'react';
import {Button, Dialog, Portal, Text, useTheme} from 'react-native-paper';
import type {Vice} from '../types';

interface Props {
  vice: Vice | null;
  onDismiss: () => void;
  onResetOnly: () => void;
  onResetAndLog: () => void;
}

export default function ResetConfirmDialog({
  vice,
  onDismiss,
  onResetOnly,
  onResetAndLog,
}: Props) {
  const theme = useTheme();
  const count = vice?.logCount ?? 0;

  return (
    <Portal>
      <Dialog visible={vice !== null} onDismiss={onDismiss}>
        <Dialog.Title>Reset &quot;{vice?.name}&quot;?</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">
            This vice has been logged{' '}
            <Text style={{fontWeight: 'bold'}}>{count} time{count !== 1 ? 's' : ''}</Text>.
            {'\n\n'}Save the count to history before resetting, or just reset the counter?
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Cancel</Button>
          <Button textColor={theme.colors.secondary} onPress={onResetOnly}>
            Reset Only
          </Button>
          <Button mode="contained" onPress={onResetAndLog}>
            Log &amp; Reset
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
