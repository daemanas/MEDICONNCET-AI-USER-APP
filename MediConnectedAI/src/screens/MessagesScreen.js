import React, {useCallback, useEffect, useState} from 'react';
import {FlatList, Pressable, StyleSheet, Text} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors, radius, space, type} from '../constants/theme';
import {i18n} from '../i18n';
import {messageApi} from '../api/messageApi';
import {ScreenState} from '../components/ScreenState';
import {formatDate} from '../utils/format';

export function MessagesScreen() {
  const nav = useNavigation();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await messageApi.conversations();
      setRows(data.conversations || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsub = nav.addListener('focus', load);
    return unsub;
  }, [nav, load]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={[type.title, styles.title]}>{i18n.reports('messagesTitle')}</Text>
      <ScreenState loading={loading} error={error} empty={!loading && !rows.length} emptyText={i18n.reports('messagesEmpty')} onRetry={load}>
        <FlatList
          data={rows}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({item}) => (
            <Pressable style={styles.card} onPress={() => nav.navigate('Chat', {id: item.id, name: item.facility?.name})}>
              <Text style={type.h3}>{item.facility?.name || 'Provider'}</Text>
              <Text style={type.muted} numberOfLines={1}>{item.lastPreview}</Text>
              <Text style={type.small}>{formatDate(item.lastMessageAt)}</Text>
            </Pressable>
          )}
        />
      </ScreenState>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bg},
  title: {padding: space.md},
  list: {padding: space.md},
  card: {backgroundColor: colors.surface, padding: space.md, borderRadius: radius.lg, marginBottom: space.sm},
});
