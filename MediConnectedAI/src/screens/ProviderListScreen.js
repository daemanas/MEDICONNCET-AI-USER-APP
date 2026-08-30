import React, {useCallback, useEffect, useState} from 'react';
import {FlatList, StyleSheet, TextInput, View} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors, radius, space} from '../constants/theme';
import {i18n} from '../i18n';
import {useSession} from '../store/SessionContext';
import {useNetwork} from '../store/NetworkContext';
import {providerApi} from '../api/providerApi';
import {searchOffline} from '../sync/syncService';
import {ProviderCard} from '../components/ProviderCard';
import {ScreenState} from '../components/ScreenState';
import {OfflineBanner} from '../components/OfflineBanner';

const EMPTY = {
  HOSPITAL: 'emptyHospitals',
  CLINIC: 'emptyClinics',
  NURSING_HOME: 'emptyNursing',
  DIAGNOSTIC_CENTRE: 'emptyDiagnostics',
  LABORATORY: 'emptyLabs',
  PHARMACY: 'emptyPharmacies',
  MEDICINE_SHOP: 'emptyPharmacies',
};

export function ProviderListScreen() {
  const nav = useNavigation();
  const route = useRoute();
  const {patient} = useSession();
  const {online} = useNetwork();
  const type = route.params?.type;
  const titleKey = route.params?.titleKey;
  const [q, setQ] = useState(route.params?.q || '');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastSyncAt, setLastSyncAt] = useState(null);
  const [offline, setOffline] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (online) {
        const data = await providerApi.list({
          type,
          q,
          district: patient?.district,
          city: patient?.city,
          lat: patient?.geo?.lat,
          lng: patient?.geo?.lng,
        });
        setRows(data.providers || []);
        setOffline(false);
      } else {
        const data = await searchOffline({q, type});
        setRows(data.providers);
        setLastSyncAt(data.lastSyncAt);
        setOffline(true);
      }
    } catch (e) {
      try {
        const data = await searchOffline({q, type});
        setRows(data.providers);
        setLastSyncAt(data.lastSyncAt);
        setOffline(true);
      } catch {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  }, [online, type, q, patient]);

  useEffect(() => {
    nav.setOptions({title: i18n.services(titleKey) || i18n.services('title')});
    load();
  }, [load, nav, titleKey]);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.searchBox}>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder={i18n.t('searchPlaceholder')}
          style={styles.input}
          onSubmitEditing={load}
        />
      </View>
      {offline ? <View style={styles.pad}><OfflineBanner lastSyncAt={lastSyncAt} /></View> : null}
      <ScreenState loading={loading} error={error} empty={!loading && rows.length === 0} emptyText={i18n.services(EMPTY[type] || 'title')} onRetry={load}>
        <FlatList
          data={rows}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({item}) => (
            <ProviderCard item={item} onPress={() => nav.navigate('ProviderDetail', {id: item.id, preview: item})} />
          )}
        />
      </ScreenState>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bg},
  searchBox: {padding: space.md, paddingBottom: 0},
  pad: {paddingHorizontal: space.md},
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: space.md,
    minHeight: 50,
    fontSize: 16,
    color: colors.text,
  },
  list: {padding: space.md},
});
