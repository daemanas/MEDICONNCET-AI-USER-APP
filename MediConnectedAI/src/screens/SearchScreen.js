import React, {useCallback, useEffect, useState} from 'react';
import {SectionList, StyleSheet, Text, TextInput, View} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors, radius, space, type} from '../constants/theme';
import {i18n} from '../i18n';
import {useSession} from '../store/SessionContext';
import {useNetwork} from '../store/NetworkContext';
import {providerApi} from '../api/providerApi';
import {searchOffline, searchOfflineDoctors, searchOfflineMedicines} from '../sync/syncService';
import {ProviderCard} from '../components/ProviderCard';
import {OfflineBanner} from '../components/OfflineBanner';
import {ScreenState} from '../components/ScreenState';

export function SearchScreen() {
  const nav = useNavigation();
  const initial = useRoute().params?.q || '';
  const {patient} = useSession();
  const {online} = useNetwork();
  const [q, setQ] = useState(initial);
  const [groups, setGroups] = useState({providers: [], doctors: [], medicines: []});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastSyncAt, setLastSyncAt] = useState(null);
  const [offline, setOffline] = useState(false);

  const run = useCallback(async () => {
    if (!q.trim()) {
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (online) {
        const data = await providerApi.search({
          q,
          district: patient?.district,
          city: patient?.city,
          lat: patient?.geo?.lat,
          lng: patient?.geo?.lng,
        });
        setGroups(data.groups || {providers: [], doctors: [], medicines: []});
        setOffline(false);
      } else {
        const [p, d, m] = await Promise.all([
          searchOffline({q}),
          searchOfflineDoctors(q),
          searchOfflineMedicines(q),
        ]);
        setGroups({providers: p.providers, doctors: d, medicines: m.medicines});
        setLastSyncAt(p.lastSyncAt);
        setOffline(true);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [q, online, patient]);

  useEffect(() => {
    run();
  }, [run]);

  const sections = [
    {title: 'Providers', data: groups.providers || []},
    {title: 'Doctors', data: groups.doctors || []},
    {title: 'Medicines', data: groups.medicines || []},
  ].filter(s => s.data.length);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.searchBox}>
        <TextInput value={q} onChangeText={setQ} onSubmitEditing={run} style={styles.input} placeholder={i18n.t('searchPlaceholder')} />
      </View>
      {offline ? <View style={styles.pad}><OfflineBanner lastSyncAt={lastSyncAt} /></View> : null}
      <ScreenState loading={loading} error={error} empty={!loading && !sections.length} emptyText={i18n.t('emptyGeneric')} onRetry={run}>
        <SectionList
          sections={sections}
          keyExtractor={(item, i) => item.id + String(i)}
          contentContainerStyle={styles.list}
          renderSectionHeader={({section}) => <Text style={type.h3}>{section.title}</Text>}
          renderItem={({item, section}) => {
            if (section.title === 'Providers') {
              return <ProviderCard item={item} onPress={() => nav.navigate('ProviderDetail', {id: item.id, preview: item})} />;
            }
            if (section.title === 'Doctors') {
              return (
                <Text style={styles.doc} onPress={() => nav.navigate('Doctors')}>
                  {item.name} · {item.specialization}
                </Text>
              );
            }
            return (
              <Text style={styles.doc} onPress={() => nav.navigate('Medicines', {q: item.name})}>
                {item.name} {item.strength || ''}
              </Text>
            );
          }}
        />
      </ScreenState>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bg},
  searchBox: {padding: space.md},
  pad: {paddingHorizontal: space.md},
  input: {backgroundColor: colors.surface, borderRadius: radius.lg, minHeight: 50, paddingHorizontal: 16, fontSize: 16, color: colors.text},
  list: {padding: space.md, gap: 8},
  doc: {backgroundColor: colors.surface, padding: 14, borderRadius: 14, marginBottom: 8, color: colors.text, fontWeight: '600'},
});
