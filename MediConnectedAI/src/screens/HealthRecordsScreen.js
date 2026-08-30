import React, {useEffect, useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors, radius, space, type} from '../constants/theme';
import {i18n} from '../i18n';
import {reportApi} from '../api/reportApi';
import {ScreenState} from '../components/ScreenState';
import {formatDate} from '../utils/format';

export function HealthRecordsScreen() {
  const nav = useNavigation();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportApi
      .records()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScreenState loading={loading} error={error} empty={!loading && !data} emptyText={i18n.reports('recordsEmpty')}>
        <ScrollView contentContainerStyle={styles.pad}>
          <Text style={type.h2}>{i18n.reports('prescriptionsTitle')}</Text>
          {(data?.prescriptions || []).map(p => (
            <Pressable key={p.id} style={styles.card} onPress={() => nav.navigate('PrescriptionDetail', {id: p.id})}>
              <Text style={type.h3}>{p.doctor?.name}</Text>
              <Text style={type.small}>{formatDate(p.issuedAt)}</Text>
            </Pressable>
          ))}
          <Text style={type.h2}>{i18n.reports('title')}</Text>
          {(data?.reports || []).map(r => (
            <Pressable key={r.id} style={styles.card} onPress={() => nav.navigate('ReportDetail', {id: r.id, kind: r.kind})}>
              <Text style={type.h3}>{r.title}</Text>
              <Text style={type.small}>{formatDate(r.date)}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </ScreenState>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bg},
  pad: {padding: space.md, gap: 8},
  card: {backgroundColor: colors.surface, padding: space.md, borderRadius: radius.lg},
});
