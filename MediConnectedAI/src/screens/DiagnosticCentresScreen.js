import React, {useCallback, useEffect, useState} from 'react';
import {FlatList, StyleSheet, TextInput, View, Text, Pressable, ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors, radius, space, type} from '../constants/theme';
import {providerApi} from '../api/providerApi';
import {DiagnosticCentreCard} from '../components/DiagnosticCentreCard';
import {ScreenState} from '../components/ScreenState';
import {useSession} from '../store/SessionContext';

const CATEGORIES = ['All', 'Pathology', 'Imaging (X-ray, MRI)', 'Cardiac', 'Specialized Testing'];

export function DiagnosticCentresScreen() {
  const nav = useNavigation();
  const {patient} = useSession();
  const [q, setQ] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await providerApi.list({type: 'DIAGNOSTIC_CENTRE', q});
      setRows(data.providers || []);
    } catch (e) {
      setError('Unable to load diagnostic centres');
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => { load(); }, [load]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => nav.goBack()}><Text>←</Text></Pressable>
        <View style={{flex: 1, alignItems: 'center'}}>
          <Text style={type.h2}>Diagnostic Centres</Text>
          <Text style={type.small}>Accurate results. A healthier tomorrow.</Text>
        </View>
        <Pressable><Text>📍 {patient?.city || 'Location'}</Text></Pressable>
      </View>

      <View style={styles.searchBox}>
        <TextInput value={q} onChangeText={setQ} placeholder="Search diagnostic centres..." style={styles.input} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
        {CATEGORIES.map(cat => (
          <Pressable key={cat} onPress={() => setSelectedCat(cat)} style={[styles.chip, selectedCat === cat && styles.activeChip]}>
            <Text style={[styles.chipText, selectedCat === cat && styles.activeChipText]}>{cat}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScreenState loading={loading} error={error} empty={!loading && rows.length === 0} onRetry={load}>
        <FlatList
          data={rows}
          keyExtractor={item => item.id}
          renderItem={({item}) => <DiagnosticCentreCard item={item} onViewDetails={() => nav.navigate('ProviderDetail', {id: item.id})} onBookAppointment={() => {}} />}
        />
      </ScreenState>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bg},
  header: {flexDirection: 'row', alignItems: 'center', padding: space.md},
  searchBox: {padding: space.md},
  input: {backgroundColor: colors.surface, borderRadius: radius.lg, padding: 15, fontSize: 16},
  chips: {flexGrow: 0, paddingHorizontal: space.md, marginBottom: 10},
  chip: {paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: colors.surface, marginRight: 8, borderWidth: 1, borderColor: colors.border},
  activeChip: {backgroundColor: colors.primary, borderColor: colors.primary},
  chipText: {fontSize: 13, color: colors.text},
  activeChipText: {color: '#FFFFFF'},
});
