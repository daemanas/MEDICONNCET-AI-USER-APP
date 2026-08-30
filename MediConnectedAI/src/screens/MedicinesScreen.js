import React, {useCallback, useEffect, useState} from 'react';
import {FlatList, Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors, radius, space, type} from '../constants/theme';
import {i18n} from '../i18n';
import {useSession} from '../store/SessionContext';
import {useNetwork} from '../store/NetworkContext';
import {medicineApi} from '../api/medicineApi';
import {providerApi} from '../api/providerApi';
import {searchOfflineMedicines} from '../sync/syncService';
import {ScreenState} from '../components/ScreenState';
import {OfflineBanner} from '../components/OfflineBanner';
import {formatDistance} from '../utils/format';

export function MedicinesScreen() {
  const nav = useNavigation();
  const route = useRoute();
  const {patient} = useSession();
  const {online} = useNetwork();
  const [q, setQ] = useState(route.params?.q || '');
  const [rows, setRows] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastSyncAt, setLastSyncAt] = useState(null);
  const [offline, setOffline] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (online) {
        const [meds, shops] = await Promise.all([
          medicineApi.search({q, district: patient?.district, city: patient?.city}),
          providerApi.list({type: 'PHARMACY', district: patient?.district, city: patient?.city}),
        ]);
        setRows(meds.medicines || []);
        setPharmacies(shops.providers || []);
        setOffline(false);
      } else {
        const data = await searchOfflineMedicines(q);
        setRows(data.medicines);
        setLastSyncAt(data.lastSyncAt);
        setOffline(true);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [q, online, patient]);

  useEffect(() => {
    load();
  }, [load]);

  const nearby = pharmacies.filter(p => p.band === 'same_city' || p.band === 'nearby' || p.band === 'same_district');

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.searchBox}>
        <TextInput value={q} onChangeText={setQ} onSubmitEditing={load} placeholder={i18n.services('medicines')} style={styles.input} />
      </View>
      {offline ? <View style={styles.pad}><OfflineBanner lastSyncAt={lastSyncAt} /></View> : null}
      <ScreenState
        loading={loading}
        error={error}
        empty={!loading && rows.length === 0 && nearby.length === 0}
        emptyText={nearby.length === 0 ? i18n.orders('noPharmacy') : i18n.services('emptyMedicines')}
        onRetry={load}>
        <FlatList
          data={rows}
          keyExtractor={item => item.id}
          ListHeaderComponent={
            nearby.length === 0 && !loading ? (
              <Text style={styles.warn}>{i18n.orders('noPharmacy')}</Text>
            ) : (
              <Text style={[type.muted, styles.pad]}>{i18n.orders('otherInDistrict')}</Text>
            )
          }
          contentContainerStyle={styles.list}
          renderItem={({item}) => (
            <Pressable
              style={styles.card}
              onPress={() =>
                nav.navigate('Checkout', {
                  medicine: item,
                  pharmacy: item.pharmacy,
                })
              }>
              <Text style={type.h3}>{item.name}</Text>
              <Text style={type.muted}>
                {[item.genericName, item.strength, item.dosageForm].filter(Boolean).join(' · ')}
              </Text>
              <Text style={type.small}>
                {item.pharmacy?.name} {formatDistance(item.pharmacy?.distanceKm) || ''}
              </Text>
            </Pressable>
          )}
        />
      </ScreenState>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bg},
  searchBox: {padding: space.md},
  pad: {paddingHorizontal: space.md, marginBottom: 8},
  input: {backgroundColor: colors.surface, borderRadius: radius.lg, minHeight: 50, paddingHorizontal: 16, color: colors.text, fontSize: 16},
  list: {padding: space.md},
  card: {backgroundColor: colors.surface, padding: space.md, borderRadius: radius.lg, marginBottom: space.sm},
  warn: {color: colors.warning, padding: space.md, fontWeight: '600'},
});
