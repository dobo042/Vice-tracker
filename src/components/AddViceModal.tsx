import React, {useState} from 'react';
import {StyleSheet} from 'react-native';
import {Button, Dialog, HelperText, Portal, TextInput} from 'react-native-paper';
import {useViceStore} from '../store/viceStore';

interface Props {
  visible: boolean;
  onDismiss: () => void;
}

export default function AddViceModal({visible, onDismiss}: Props) {
  const {addVice} = useViceStore();
  const [name, setName] = useState('');
  const [cooldownMinutes, setCooldownMinutes] = useState('60');

  const minutesValue = Number(cooldownMinutes);
  const cooldownValid =
    cooldownMinutes !== '' && !isNaN(minutesValue) && minutesValue > 0;

  const reset = () => {
    setName('');
    setCooldownMinutes('60');
  };

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName || !cooldownValid) return;
    addVice(trimmedName, Math.round(minutesValue));
    reset();
    onDismiss();
  };

  const handleDismiss = () => {
    reset();
    onDismiss();
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={handleDismiss}>
        <Dialog.Title>Add Vice</Dialog.Title>
        <Dialog.Content style={styles.content}>
          <TextInput
            label="Name *"
            value={name}
            onChangeText={setName}
            mode="outlined"
            autoFocus
          />
          <TextInput
            label="Cooldown (minutes) *"
            value={cooldownMinutes}
            onChangeText={setCooldownMinutes}
            mode="outlined"
            keyboardType="number-pad"
          />
          {!cooldownValid && cooldownMinutes !== '' ? (
            <HelperText type="error">Enter a positive number of minutes</HelperText>
          ) : null}
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={handleDismiss}>Cancel</Button>
          <Button
            mode="contained"
            onPress={handleSave}
            disabled={!name.trim() || !cooldownValid}>
            Save
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  content: {gap: 12},
});
