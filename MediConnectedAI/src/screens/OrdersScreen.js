import React, {useCallback, useEffect, useState} from 'react';
import {FlatList, Pressable, StyleSheet, Text} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors, radius, space, type} from '../constants/theme';
import {i18n} from '../i18n';
import {orderApi} from '../api/orderApi';
import {ORDER_LABEL} from '../constants/orderStatus';
import {ScreenState} from '../components/ScreenState';
import {formatDate} from '../utils/format';

export function OrdersScreen() {
  const nav = useNavigation();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await orderApi.list();
      setRows(data.orders || []);
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
      <Text style={[type.title, styles.title]}>{i18n.orders('title')}</Text>
      <ScreenState loading={loading} error={error} empty={!loading && rows.length === 0} emptyText={i18n.orders('empty')} onRetry={load}>
        <FlatList
          data={rows}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({item}) => (
            <Pressable style={styles.card} onPress={() => nav.navigate('OrderDetail', {id: item.id})}>
              <Text style={type.h3}>{item.orderNo}</Text>
              <Text style={type.muted}>{item.pharmacy?.name}</Text>
              <Text style={styles.status}>{ORDER_LABEL[item.status] || item.status}</Text>
              <Text style={type.small}>{formatDate(item.createdAt)}</Text>
            </Pressable>
          )}
        />
      </ScreenState>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bg},
  title: {paddingHorizontal: space.md, paddingTop: space.sm},
  list: {padding: space.md},
  card: {backgroundColor: colors.surface, padding: space.md, borderRadius: radius.lg, marginBottom: space.sm},
  status: {color: colors.primary, fontWeight: '800', marginTop: 6},
});
