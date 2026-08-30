import React, {useEffect, useState} from 'react';
import {FlatList, StyleSheet, Text} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors, radius, space, type} from '../constants/theme';
import {i18n} from '../i18n';
import {fetchNotifications, markAllRead} from '../services/notificationService';
import {useSession} from '../store/SessionContext';
import {ScreenState} from '../components/ScreenState';
import {formatDate} from '../utils/format';

export function NotificationsScreen() {
  const {refreshUnread} = useSession();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotifications()
      .then(d => {
        setRows(d.notifications || []);
        return markAllRead();
      })
      .then(() => refreshUnread())
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [refreshUnread]);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScreenState loading={loading} error={error} empty={!loading && !rows.length} emptyText={i18n.t('emptyGeneric')}>
        <FlatList
          data={rows}
          keyExtractor={item => item._id || item.id}
          contentContainerStyle={styles.list}
          renderItem={({item}) => (
            <Text style={styles.card}>
              <Text style={type.h3}>{item.title}{'\n'}</Text>
              <Text style={type.body}>{item.body}{'\n'}</Text>
              <Text style={type.small}>{formatDate(item.createdAt)}</Text>
            </Text>
          )}
        />
      </ScreenState>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bg},
  list: {padding: space.md},
  card: {backgroundColor: colors.surface, padding: space.md, borderRadius: radius.lg, marginBottom: space.sm, overflow: 'hidden'},
});
