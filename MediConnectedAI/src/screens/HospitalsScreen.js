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
import {HospitalCard} from '../components/HospitalCard';
import {HospitalFilterChips} from '../components/HospitalFilterChips';
import {HospitalSkeleton} from '../components/HospitalSkeleton';
import {HospitalEmptyState} from '../components/HospitalEmptyState';
import {HospitalErrorState} from '../components/HospitalErrorState';
import {OfflineBanner} from '../components/OfflineBanner';
import {styles} from './HospitalsScreen.styles';

export function HospitalsScreen() {
  const nav = useNavigation();
  const route = useRoute();
  const {patient} = useSession();
  const {online} = useNetwork();
  const [filter, setFilter] = useState(route.params?.filter || 'All');
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
        const d = await providerApi.list({district: patient?.district, city: patient?.city, lat: patient?.geo?.lat, lng: patient?.geo?.lng});
        setRows(d.providers || []);
        setOffline(false);
      } else {
        const d = await searchOffline({q: ''});
        setRows(d.providers || []);
        setSyncAt(d.lastSyncAt);
        setOffline(true);
      }
    } catch (e) {
      try {
        const d = await searchOffline({q: ''});
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

  const list = rows.filter(item => {
    const isHosp = item.type === 'HOSPITAL' || item.type === 'NURSING_HOME' || item.type === 'CLINIC' || (item.name && /hospital|nursing/i.test(item.name));
    if (!isHosp) return false;
    if (filter === 'Hospitals' && item.type !== 'HOSPITAL' && !/hospital/i.test(item.name || '')) return false;
    if (filter === 'Nursing Homes' && item.type !== 'NURSING_HOME' && !/nursing/i.test(item.name || '')) return false;
    if (filter === '24x7 Emergency' && !item.emergencyAvailable && !item.facilities?.includes('24x7 Emergency')) return false;
    if (filter === 'Multi-Speciality' && !(item.isMultiSpeciality || /multi/i.test(item.subType || '') || item.type === 'HOSPITAL')) return false;
    if (q.trim()) {
      const query = q.trim().toLowerCase();
      return [item.name, item.address, item.city, item.district, item.subType, item.type, ...(item.facilities || [])]
        .filter(Boolean).some(v => String(v).toLowerCase().includes(query));
    }
    return true;
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => nav.goBack()} style={styles.backBtn}><Text style={styles.backIcon}>←</Text></Pressable>
          <View>
            <Text style={styles.headerTitle}>Hospitals & Nursing Homes</Text>
            <Text style={styles.headerSubtitle}>Quality care, closer to you</Text>
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
          <TextInput value={q} onChangeText={setQ} placeholder="Search hospitals..." placeholderTextColor={colors.textSoft} style={styles.searchInput} />
        </View>
        <Pressable onPress={() => setFilter(filter === 'All' ? 'Hospitals' : 'All')} style={styles.filterBtn}>
          <Text style={styles.filterBtnIcon}>🎛️</Text>
        </Pressable>
      </View>

      <HospitalFilterChips selected={filter} onSelect={setFilter} />

      {offline ? <View style={styles.padHoriz}><OfflineBanner lastSyncAt={syncAt} /></View> : null}

      {loading ? (
        <HospitalSkeleton />
      ) : error ? (
        <HospitalErrorState error={error} onRetry={loadData} />
      ) : list.length === 0 ? (
        <HospitalEmptyState onRetry={loadData} onLocationPress={() => nav.navigate('LocationPicker')} />
      ) : (
        <FlatList
          data={list}
          keyExtractor={i => i.id}
          contentContainerStyle={styles.listContent}
          renderItem={({item}) => (
            <HospitalCard
              item={item}
              onViewDetails={() => nav.navigate('ProviderDetail', {id: item.id, preview: item})}
              isFavorite={!!favs[item.id]}
              onToggleFavorite={(id, next) => setFavs(p => ({...p, [id]: next}))}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}
