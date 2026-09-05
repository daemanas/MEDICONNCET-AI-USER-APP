import React, {useCallback, useEffect, useState} from 'react';
import {FlatList, Pressable, Text, TextInput, View} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors} from '../constants/theme';
import {useSession} from '../store/SessionContext';
import {useNetwork} from '../store/NetworkContext';
import {providerApi} from '../api/providerApi';
import {searchOffline} from '../sync/syncService';
import {formatLocationLabel} from '../location/locationService';
import {filterClinics} from '../utils/clinicFilter';
import {ClinicCard} from '../components/ClinicCard';
import {ClinicFilterChips} from '../components/ClinicFilterChips';
import {ClinicSkeleton} from '../components/ClinicSkeleton';
import {ClinicEmptyState} from '../components/ClinicEmptyState';
import {ClinicErrorState} from '../components/ClinicErrorState';
import {OfflineBanner} from '../components/OfflineBanner';
import {styles} from './ClinicsScreen.styles';

export function ClinicsScreen() {
  const nav = useNavigation();
  const route = useRoute();
  const {patient} = useSession();
  const {online} = useNetwork();
  const [cat, setCat] = useState('All');
  const [q, setQ] = useState(route.params?.q || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rows, setRows] = useState([]);
  const [syncAt, setSyncAt] = useState(null);
  const [offline, setOffline] = useState(false);
  const [favs, setFavs] = useState({});

  const userLoc = formatLocationLabel(patient) || patient?.city || patient?.district || 'Select Location';

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (online) {
        const d = await providerApi.list({type: 'CLINIC', district: patient?.district, city: patient?.city, lat: patient?.geo?.lat, lng: patient?.geo?.lng});
        setRows(d.providers || []);
        setOffline(false);
      } else {
        const d = await searchOffline({q: '', type: 'CLINIC'});
        setRows(d.providers || []);
        setSyncAt(d.lastSyncAt);
        setOffline(true);
      }
    } catch (e) {
      try {
        const d = await searchOffline({q: '', type: 'CLINIC'});
        setRows(d.providers || []);
        setSyncAt(d.lastSyncAt);
        setOffline(true);
      } catch {
        setError(e.message || 'Unable to connect to server');
      }
    } finally {
      setLoading(false);
    }
  }, [online, patient]);

  useEffect(() => { loadData(); }, [loadData]);

  const list = filterClinics(rows, cat, q);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => nav.goBack()} style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
          <View>
            <Text style={styles.headerTitle}>Clinics</Text>
            <Text style={styles.headerSubtitle}>Find trusted clinics near you</Text>
          </View>
        </View>
        <Pressable onPress={() => nav.navigate('LocationPicker')} style={styles.locationSelector}>
          <Text style={styles.locPinIcon}>📍</Text>
          <Text style={styles.locationText} numberOfLines={1}>{userLoc}</Text>
          <Text style={styles.locChevron}>▼</Text>
        </Pressable>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput value={q} onChangeText={setQ} placeholder="Search clinics by name, area, or specialty..." placeholderTextColor={colors.textSoft} style={styles.searchInput} />
        </View>
        <Pressable onPress={() => { setQ(''); setCat('All'); }} style={styles.filterBtn}>
          <Text style={styles.filterBtnIcon}>🎛️</Text>
        </Pressable>
      </View>

      <ClinicFilterChips selectedCategory={cat} onSelectCategory={setCat} />

      {offline ? <View style={styles.padHoriz}><OfflineBanner lastSyncAt={syncAt} /></View> : null}

      {loading ? <ClinicSkeleton /> : error ? <ClinicErrorState error={error} onRetry={loadData} /> : list.length === 0 ? (
        <ClinicEmptyState onReset={() => { setQ(''); setCat('All'); }} onLocationPress={() => nav.navigate('LocationPicker')} />
      ) : (
        <FlatList
          data={list}
          keyExtractor={i => i.id}
          contentContainerStyle={styles.listContent}
          renderItem={({item}) => (
            <ClinicCard
              item={item}
              onViewDetails={() => nav.navigate('ProviderDetail', {id: item.id, preview: item})}
              onBookAppointment={() => nav.navigate('Doctors', {facilityId: item.id})}
              isFavorite={!!favs[item.id]}
              onToggleFavorite={(id, next) => setFavs(p => ({...p, [id]: next}))}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}
