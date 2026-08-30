import React, {useCallback, useEffect, useState} from 'react';
import {FlatList, Pressable, StyleSheet, Text, View} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors, radius, shadow, space, type} from '../constants/theme';
import {i18n} from '../i18n';
import {useSession} from '../store/SessionContext';
import {useNetwork} from '../store/NetworkContext';
import {providerApi} from '../api/providerApi';
import {searchOfflineDoctors} from '../sync/syncService';
import {ScreenState} from '../components/ScreenState';
import {PrimaryButton} from '../components/PrimaryButton';

export function DoctorsScreen() {
  const nav = useNavigation();
  const facilityId = useRoute().params?.facilityId;
  const {patient} = useSession();
  const {online} = useNetwork();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (online) {
        const data = await providerApi.doctors({
          district: patient?.district,
          city: patient?.city,
        });
        let list = data.doctors || [];
        if (facilityId) {
          list = list.filter(d => d.facility?.id === facilityId);
        }
        setRows(list);
      } else {
        const list = await searchOfflineDoctors('');
        setRows(facilityId ? list.filter(d => d.facilityId === facilityId) : list);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [online, patient, facilityId]);

  useEffect(() => {
    load();
  }, [load]);

  const book = async doctor => {
    try {
      await providerApi.bookConsult({
        facilityId: doctor.facility?.id || doctor.facilityId,
        doctorUserId: doctor.id,
        reason: 'Consultation request from user app',
      });
      nav.navigate('Appointments');
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScreenState loading={loading} error={error} empty={!loading && rows.length === 0} emptyText={i18n.services('emptyDoctors')} onRetry={load}>
        <FlatList
          data={rows}
          keyExtractor={(item, idx) => `${item.id}-${item.facility?.id || idx}`}
          contentContainerStyle={styles.list}
          renderItem={({item}) => (
            <View style={[styles.card, shadow]}>
              <Pressable onPress={() => {}}>
                <Text style={type.h3}>{item.name}</Text>
                <Text style={type.muted}>{item.specialization}</Text>
                <Text style={type.small}>
                  {item.facility?.name || item.facilityName} · {item.availability}
                </Text>
              </Pressable>
              <PrimaryButton title={i18n.services('requestConsult')} onPress={() => book(item)} />
            </View>
          )}
        />
      </ScreenState>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bg},
  list: {padding: space.md, gap: space.sm},
  card: {backgroundColor: colors.surface, borderRadius: radius.lg, padding: space.md, gap: space.sm},
});
