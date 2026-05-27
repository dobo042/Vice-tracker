import React, {useCallback, useLayoutEffect, useState} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {FAB, IconButton, Text, useTheme} from 'react-native-paper';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import ViceCard from '../components/ViceCard';
import AddViceModal from '../components/AddViceModal';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';
import {useViceStore} from '../store/viceStore';
import {useHistoryStore} from '../store/historyStore';
import {
  cancelViceNotification,
  scheduleViceReadyNotification,
} from '../utils/notifications';
import type {Vice} from '../types';
import type {RootStackParamList} from '../navigation/types';

type VicesNavProp = StackNavigationProp<RootStackParamList, 'Vices'>;

export default function VicesScreen() {
  const theme = useTheme();
  const navigation = useNavigation<VicesNavProp>();
  const {vices, logVice, deleteVice} = useViceStore();
  const {addEntry} = useHistoryStore();
  const [addVisible, setAddVisible] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Vice | null>(null);
  const [screenFocused, setScreenFocused] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setScreenFocused(true);
      return () => setScreenFocused(false);
    }, []),
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <IconButton
          icon="history"
          iconColor="#fff"
          onPress={() => navigation.navigate('History')}
        />
      ),
    });
  }, [navigation]);

  const handleLogVice = async (vice: Vice) => {
    logVice(vice.id);
    await scheduleViceReadyNotification({
      ...vice,
      lastLoggedAt: new Date().toISOString(),
    });
  };

  const handleDeleteOnly = async () => {
    if (!deleteTarget) return;
    await cancelViceNotification(deleteTarget.id);
    deleteVice(deleteTarget.id);
    setDeleteTarget(null);
  };

  const handleDeleteAndLog = async () => {
    if (!deleteTarget) return;
    await cancelViceNotification(deleteTarget.id);
    addEntry(deleteTarget);
    deleteVice(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      {vices.length === 0 ? (
        <View style={styles.empty}>
          <Text variant="headlineSmall" style={{color: theme.colors.onSurfaceVariant}}>
            No vices tracked yet
          </Text>
          <Text
            variant="bodyMedium"
            style={{color: theme.colors.onSurfaceVariant, marginTop: 8}}>
            Tap + to add your first vice
          </Text>
        </View>
      ) : (
        <FlatList
          data={vices}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <ViceCard
              vice={item}
              onLogPress={() => handleLogVice(item)}
              onDeletePress={() => setDeleteTarget(item)}
              screenFocused={screenFocused}
            />
          )}
          contentContainerStyle={styles.list}
        />
      )}

      <FAB
        icon="plus"
        style={[styles.fab, {backgroundColor: theme.colors.primary}]}
        color="#fff"
        onPress={() => setAddVisible(true)}
      />

      <AddViceModal visible={addVisible} onDismiss={() => setAddVisible(false)} />
      <DeleteConfirmDialog
        vice={deleteTarget}
        onDismiss={() => setDeleteTarget(null)}
        onDeleteOnly={handleDeleteOnly}
        onDeleteAndLog={handleDeleteAndLog}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  list: {padding: 16, paddingBottom: 96},
  empty: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  fab: {position: 'absolute', right: 16, bottom: 24},
});
