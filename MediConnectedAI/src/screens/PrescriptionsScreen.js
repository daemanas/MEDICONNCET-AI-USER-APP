import React, {useCallback, useEffect, useState} from 'react';
import {FlatList, Pressable, StyleSheet, Text} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors, radius, space, type} from '../constants/theme';
import {i18n} from '../i18n';
import {reportApi} from '../api/reportApi';
import {ScreenState} from '../components/ScreenState';
import {formatDate} from '../utils/format';

export function PrescriptionsScreen() {
  const nav = useNavigation();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await reportApi.prescriptions();
      setRows(data.prescriptions || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScreenState loading={loading} error={error} empty={!loading && !rows.length} emptyText={i18n.reports('prescriptionsEmpty')} onRetry={load}>
        <FlatList
          data={rows}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({item}) => (
            <Pressable style={styles.card} onPress={() => nav.navigate('PrescriptionDetail', {id: item.id})}>
              <Text style={type.h3}>{item.doctor?.name || 'Doctor'}</Text>
              <Text style={type.muted}>{item.facility?.name}</Text>
              <Text style={type.small}>{formatDate(item.issuedAt)}</Text>
            </Pressable>
          )}
        />
      </ScreenState>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bg},
  list: {padding: space.md},
  card: {backgroundColor: colors.surface, padding: space.md, borderRadius: radius.lg, marginBottom: space.sm},
});
