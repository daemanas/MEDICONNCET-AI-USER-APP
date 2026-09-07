import React, {useCallback, useEffect, useState} from 'react';
import {FlatList, Pressable, Text, TextInput, View, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors, radius, space} from '../constants/theme';
import {useSession} from '../store/SessionContext';
import {useNetwork} from '../store/NetworkContext';
import {providerApi} from '../api/providerApi';
import {formatLocationLabel} from '../location/locationService';
import {MedicalShopsCard} from '../components/MedicalShopsCard';
import {MedicalShopsFilterChips} from '../components/MedicalShopsFilterChips';

export function MedicalShopsScreen() {
  const nav = useNavigation();
  const {patient} = useSession();
  const [filter, setFilter] = useState('All');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  
  const userLoc = formatLocationLabel(patient) || patient?.city || 'Select Location';

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const d = await providerApi.list({type: 'PHARMACY', district: patient?.district, city: patient?.city});
      setRows(d.providers || []);
    } finally {
      setLoading(false);
    }
  }, [patient]);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => nav.goBack()}><Text style={styles.backIcon}>←</Text></Pressable>
          <View>
            <Text style={styles.headerTitle}>Medical Shops</Text>
            <Text style={styles.headerSubtitle}>Genuine medicines, closer to you</Text>
          </View>
        </View>
        <Pressable onPress={() => nav.navigate('LocationPicker')} style={styles.locSelector}>
          <Text style={styles.locText}>📍 {userLoc} ▾</Text>
        </Pressable>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchBar}><TextInput value={q} onChangeText={setQ} placeholder="Search medical shops by name, area, or medicine..." /></View>
        <Pressable style={styles.filterBtn}><Text>🎛️</Text></Pressable>
      </View>

      <MedicalShopsFilterChips selectedCategory={filter} onSelectCategory={setFilter} />

      <FlatList
        data={rows}
        keyExtractor={i => i.id}
        contentContainerStyle={{padding: space.md}}
        renderItem={({item}) => (
          <MedicalShopsCard 
            item={item} 
            onViewDetails={() => nav.navigate('ProviderDetail', {id: item.id, preview: item})}
            onOrderMedicines={() => nav.navigate('Medicines', {shop: item})}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bg},
  header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: space.md, backgroundColor: colors.surface},
  headerLeft: {flexDirection: 'row', alignItems: 'center', gap: 10},
  backIcon: {fontSize: 22, fontWeight: '700'},
  headerTitle: {fontSize: 18, fontWeight: '800', color: colors.text},
  headerSubtitle: {fontSize: 12, color: colors.textSoft},
  locSelector: {backgroundColor: colors.primarySoft, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill},
  locText: {fontSize: 12, fontWeight: '700', color: colors.primaryDark},
  searchSection: {flexDirection: 'row', padding: space.md, gap: 10},
  searchBar: {flex: 1, backgroundColor: colors.surface, borderRadius: radius.pill, paddingHorizontal: 16, height: 48, justifyContent: 'center', borderWidth: 1, borderColor: colors.border},
  filterBtn: {width: 48, height: 48, borderRadius: radius.pill, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center'},
});
