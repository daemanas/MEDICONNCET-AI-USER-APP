import React, {useCallback, useEffect, useState} from 'react';
import {FlatList, Pressable, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors, radius, space, type} from '../constants/theme';
import {i18n} from '../i18n';
import {reportApi} from '../api/reportApi';
import {ScreenState} from '../components/ScreenState';
import {formatDate} from '../utils/format';

const CATS = [
  {id: 'ALL', label: 'All'},
  {id: 'DIAGNOSTIC', labelKey: 'diagnostic'},
  {id: 'LABORATORY', labelKey: 'laboratory'},
  {id: 'CLINIC', labelKey: 'clinic'},
  {id: 'HOSPITAL', labelKey: 'hospital'},
  {id: 'NURSING_HOME', labelKey: 'nursing'},
];

export function ReportsScreen() {
  const nav = useNavigation();
  const [cat, setCat] = useState('ALL');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await reportApi.list(cat);
      setRows(data.reports || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [cat]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.cats}>
        {CATS.map(c => (
          <Pressable key={c.id} onPress={() => setCat(c.id)} style={[styles.cat, cat === c.id && styles.catOn]}>
            <Text style={[styles.catText, cat === c.id && styles.catTextOn]}>
              {c.labelKey ? i18n.reports(c.labelKey) : c.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <ScreenState loading={loading} error={error} empty={!loading && !rows.length} emptyText={i18n.reports('empty')} onRetry={load}>
        <FlatList
          data={rows}
          keyExtractor={item => item.id + item.kind}
          contentContainerStyle={styles.list}
          renderItem={({item}) => (
            <Pressable style={styles.card} onPress={() => nav.navigate('ReportDetail', {id: item.id, kind: item.kind})}>
              <Text style={type.h3}>{item.title}</Text>
              <Text style={type.muted}>{item.facility?.name} · {item.category}</Text>
              <Text style={type.small}>{formatDate(item.date)}</Text>
            </Pressable>
          )}
        />
      </ScreenState>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bg},
  cats: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: space.md},
  cat: {backgroundColor: colors.surface, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill},
  catOn: {backgroundColor: colors.primary},
  catText: {fontWeight: '700', color: colors.text, fontSize: 12},
  catTextOn: {color: '#fff'},
  list: {padding: space.md},
  card: {backgroundColor: colors.surface, padding: space.md, borderRadius: radius.lg, marginBottom: space.sm},
});
