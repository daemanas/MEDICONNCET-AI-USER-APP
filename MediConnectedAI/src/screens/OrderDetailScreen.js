import React, {useCallback, useEffect, useState} from 'react';
import {Alert, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useRoute} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors, space, type} from '../constants/theme';
import {i18n} from '../i18n';
import {orderApi} from '../api/orderApi';
import {ORDER_LABEL, CANCELLABLE} from '../constants/orderStatus';
import {ScreenState} from '../components/ScreenState';
import {PrimaryButton} from '../components/PrimaryButton';
import {confirmCall} from '../components/confirmCall';
import {formatDate} from '../utils/format';

export function OrderDetailScreen() {
  const {id} = useRoute().params;
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await orderApi.one(id);
      setOrder(data.order);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
    const t = setInterval(load, 20000);
    return () => clearInterval(t);
  }, [load]);

  const cancel = async () => {
    try {
      const data = await orderApi.cancel(id);
      setOrder(data.order);
    } catch (e) {
      Alert.alert(e.message);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScreenState loading={loading && !order} error={error} onRetry={load}>
        <ScrollView contentContainerStyle={styles.pad}>
          <Text style={type.title}>{order?.orderNo}</Text>
          <Text style={styles.status}>{ORDER_LABEL[order?.status] || order?.status}</Text>
          <Text style={type.body}>{order?.pharmacy?.name}</Text>
          <Text style={type.muted}>{order?.fulfillment}</Text>
          {(order?.items || []).map((it, i) => (
            <Text key={i} style={type.body}>
              {it.quantity} × {it.name}
            </Text>
          ))}
          <Text style={[type.h3, styles.mt]}>{i18n.orders('timeline')}</Text>
          {(order?.history || []).map((h, i) => (
            <Text key={i} style={type.muted}>
              {ORDER_LABEL[h.status] || h.status} · {formatDate(h.at)}
            </Text>
          ))}
          <View style={styles.mt}>
            <PrimaryButton title={i18n.t('call')} tone="ghost" onPress={() => confirmCall(order?.pharmacy?.contactNumber)} />
          </View>
          {CANCELLABLE.includes(order?.status) ? (
            <PrimaryButton title={i18n.orders('cancelOrder')} tone="danger" onPress={cancel} />
          ) : null}
        </ScrollView>
      </ScreenState>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bg},
  pad: {padding: space.lg, gap: 8},
  status: {color: colors.primary, fontWeight: '800', fontSize: 16},
  mt: {marginTop: space.md, gap: 8},
});
