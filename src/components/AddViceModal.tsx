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
  const [description, setDescription] = useState('');
  const [cooldownHours, setCooldownHours] = useState('24');

  const cooldownValid =
    cooldownHours !== '' && !isNaN(Number(cooldownHours)) && Number(cooldownHours) > 0;

  const reset = () => {
    setName('');
    setDescription('');
    setCooldownHours('24');
  };

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName || !cooldownValid) return;
    addVice(trimmedName, Math.round(Number(cooldownHours) * 60), description.trim() || undefined);
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
            label="Description (optional)"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            multiline
            numberOfLines={2}
          />
          <TextInput
            label="Cooldown (hours) *"
            value={cooldownHours}
            onChangeText={setCooldownHours}
            mode="outlined"
            keyboardType="decimal-pad"
          />
          {!cooldownValid && cooldownHours !== '' ? (
            <HelperText type="error">Enter a positive number of hours</HelperText>
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
