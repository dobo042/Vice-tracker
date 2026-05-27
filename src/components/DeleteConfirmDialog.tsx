import React from 'react';
import {Button, Dialog, Portal, Text, useTheme} from 'react-native-paper';
import type {Vice} from '../types';

interface Props {
  vice: Vice | null;
  onDismiss: () => void;
  onDeleteOnly: () => void;
  onDeleteAndLog: () => void;
}

export default function DeleteConfirmDialog({
  vice,
  onDismiss,
  onDeleteOnly,
  onDeleteAndLog,
}: Props) {
  const theme = useTheme();

  return (
    <Portal>
      <Dialog visible={vice !== null} onDismiss={onDismiss}>
        <Dialog.Title>Delete &quot;{vice?.name}&quot;?</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">
            Save this entry to history before deleting, or remove it permanently?
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Cancel</Button>
          <Button textColor={theme.colors.error} onPress={onDeleteOnly}>
            Delete Only
          </Button>
          <Button mode="contained" onPress={onDeleteAndLog}>
            Log &amp; Delete
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
