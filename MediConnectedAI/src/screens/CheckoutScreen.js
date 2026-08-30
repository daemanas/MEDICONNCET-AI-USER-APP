import React, {useState} from 'react';
import {Alert, StyleSheet, Text, TextInput, View} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors, space, type} from '../constants/theme';
import {i18n} from '../i18n';
import {orderApi} from '../api/orderApi';
import {PrimaryButton} from '../components/PrimaryButton';
import {confirmCall} from '../components/confirmCall';

export function CheckoutScreen() {
  const nav = useNavigation();
  const {medicine, pharmacy} = useRoute().params || {};
  const [qty, setQty] = useState('1');
  const [fulfillment, setFulfillment] = useState(pharmacy?.deliveryAvailable ? 'DELIVERY' : 'PICKUP');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!pharmacy?.id) {
      Alert.alert(i18n.orders('noPharmacy'));
      return;
    }
    setBusy(true);
    try {
      const {order} = await orderApi.create({
        pharmacyFacilityId: pharmacy.id,
        fulfillment,
        notes,
        items: [
          {
            medicineItemId: medicine.id,
            name: medicine.name,
            quantity: Number(qty) || 1,
            genericName: medicine.genericName,
            strength: medicine.strength,
            dosageForm: medicine.dosageForm,
            prescriptionRequired: medicine.prescriptionRequired,
          },
        ],
      });
      Alert.alert(i18n.orders('orderPlaced'));
      nav.replace('OrderDetail', {id: order.id});
    } catch (e) {
      Alert.alert(i18n.t('somethingWrong'), e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.pad}>
        <Text style={type.h2}>{medicine?.name}</Text>
        <Text style={type.muted}>{pharmacy?.name} · {pharmacy?.city}</Text>
        <Text style={type.body}>{i18n.orders('qty')}</Text>
        <TextInput value={qty} onChangeText={setQty} keyboardType="number-pad" style={styles.input} />
        <Text style={type.body}>{i18n.orders('fulfillment')}</Text>
        <View style={styles.row}>
          <PrimaryButton title={i18n.services('pickup')} tone={fulfillment === 'PICKUP' ? 'primary' : 'ghost'} onPress={() => setFulfillment('PICKUP')} />
          {pharmacy?.deliveryAvailable ? (
            <PrimaryButton title={i18n.services('delivery')} tone={fulfillment === 'DELIVERY' ? 'primary' : 'ghost'} onPress={() => setFulfillment('DELIVERY')} />
          ) : null}
        </View>
        <TextInput value={notes} onChangeText={setNotes} placeholder={i18n.orders('notes')} style={styles.input} />
        <PrimaryButton title={i18n.t('call')} tone="ghost" onPress={() => confirmCall(pharmacy?.contactNumber)} />
        <PrimaryButton title={i18n.orders('confirmOrder')} onPress={submit} disabled={busy} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bg},
  pad: {padding: space.lg, gap: space.sm},
  input: {backgroundColor: colors.surface, borderRadius: 14, padding: 14, fontSize: 16, color: colors.text},
  row: {gap: 8},
});
