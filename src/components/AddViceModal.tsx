import React, {useState} from 'react';
import {StyleSheet} from 'react-native';
import {Button, Dialog, Portal, TextInput} from 'react-native-paper';
import {useViceStore} from '../store/viceStore';

interface Props {
  visible: boolean;
  onDismiss: () => void;
}

export default function AddViceModal({visible, onDismiss}: Props) {
  const {addVice} = useViceStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const reset = () => {
    setName('');
    setDescription('');
  };

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    addVice(trimmedName, description.trim() || undefined);
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
            numberOfLines={3}
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={handleDismiss}>Cancel</Button>
          <Button mode="contained" onPress={handleSave} disabled={!name.trim()}>
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
