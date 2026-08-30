import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors, radius, space, type} from '../constants/theme';
import {i18n} from '../i18n';
import {providerApi} from '../api/providerApi';
import {messageApi} from '../api/messageApi';
import {TYPE_LABEL} from '../constants/facilityTypes';
import {formatDistance} from '../utils/format';
import {PrimaryButton} from '../components/PrimaryButton';
import {confirmCall} from '../components/confirmCall';
import {ScreenState} from '../components/ScreenState';
import {useSession} from '../store/SessionContext';

export function ProviderDetailScreen() {
  const nav = useNavigation();
  const {id, preview} = useRoute().params || {};
  const {patient} = useSession();
  const [item, setItem] = useState(preview || null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(!preview);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await providerApi.one(id, {
          district: patient?.district,
          city: patient?.city,
          lat: patient?.geo?.lat,
          lng: patient?.geo?.lng,
        });
        if (alive) {
          setItem(data.provider);
        }
      } catch (e) {
        if (!preview) {
          setError(e.message);
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [id, patient, preview]);

  const openChat = async () => {
    const conv = await messageApi.open(id);
    nav.navigate('Chat', {id: conv.conversation?._id || conv.conversation?.id || conv._id || conv.id, name: item.name});
  };

  const isPharmacy = item?.type === 'PHARMACY' || item?.type === 'MEDICINE_SHOP';
  const isClinical = ['HOSPITAL', 'CLINIC', 'NURSING_HOME'].includes(item?.type);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScreenState loading={loading && !item} error={error} onRetry={() => setLoading(true)}>
        <ScrollView contentContainerStyle={styles.pad}>
          <Text style={type.title}>{item?.name}</Text>
          <Text style={type.muted}>
            {TYPE_LABEL[item?.type] || item?.type}
            {item?.city ? ` · ${item.city}` : ''}
            {item?.district ? `, ${item.district}` : ''}
          </Text>
          {formatDistance(item?.distanceKm) ? <Text style={styles.chip}>{formatDistance(item.distanceKm)}</Text> : null}
          <Text style={[type.body, styles.mt]}>{item?.address}</Text>
          {item?.description ? <Text style={[type.body, styles.mt]}>{item.description}</Text> : null}
          <View style={styles.row}>
            <Text style={styles.pill}>{item?.open ? i18n.t('open') : item?.open === false ? i18n.t('closed') : i18n.t('availability')}</Text>
            {item?.emergencyAvailable ? <Text style={styles.pill}>{i18n.t('emergency24')}</Text> : null}
            {item?.deliveryAvailable ? <Text style={styles.pill}>{i18n.services('delivery')}</Text> : null}
            {item?.pickupAvailable !== false ? <Text style={styles.pill}>{i18n.services('pickup')}</Text> : null}
          </View>
          <View style={styles.actions}>
            <PrimaryButton title={i18n.t('call')} onPress={() => confirmCall(item?.contactNumber)} />
            <PrimaryButton title="Message" tone="ghost" onPress={openChat} />
            {isPharmacy ? (
              <PrimaryButton title={i18n.services('requestMedicine')} onPress={() => nav.navigate('Medicines', {pharmacyId: item.id})} />
            ) : null}
            {isClinical ? (
              <PrimaryButton
                title={i18n.services('requestConsult')}
                onPress={() => nav.navigate('Doctors', {facilityId: item.id})}
              />
            ) : null}
          </View>
        </ScrollView>
      </ScreenState>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bg},
  pad: {padding: space.lg, gap: 8},
  mt: {marginTop: space.sm},
  chip: {marginTop: 8, color: colors.primary, fontWeight: '700'},
  row: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: space.md},
  pill: {
    backgroundColor: colors.primarySoft,
    color: colors.primaryDark,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    overflow: 'hidden',
    fontWeight: '700',
    fontSize: 12,
  },
  actions: {gap: space.sm, marginTop: space.md},
});
