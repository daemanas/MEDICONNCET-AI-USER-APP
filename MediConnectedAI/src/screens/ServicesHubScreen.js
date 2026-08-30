import React from 'react';
import {Pressable, ScrollView, StyleSheet, Text} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors, radius, space, type} from '../constants/theme';
import {i18n} from '../i18n';

const ITEMS = [
  {label: 'doctors', screen: 'Doctors'},
  {label: 'clinics', screen: 'ProviderList', params: {type: 'CLINIC', titleKey: 'clinics'}},
  {label: 'hospitals', screen: 'ProviderList', params: {type: 'HOSPITAL', titleKey: 'hospitals'}},
  {label: 'nursingHomes', screen: 'ProviderList', params: {type: 'NURSING_HOME', titleKey: 'nursingHomes'}},
  {label: 'diagnostics', screen: 'ProviderList', params: {type: 'DIAGNOSTIC_CENTRE', titleKey: 'diagnostics'}},
  {label: 'labs', screen: 'ProviderList', params: {type: 'LABORATORY', titleKey: 'labs'}},
  {label: 'pharmacies', screen: 'ProviderList', params: {type: 'PHARMACY', titleKey: 'pharmacies'}},
  {label: 'medicines', screen: 'Medicines'},
  {label: 'reports', screen: 'Reports'},
  {label: 'prescriptions', screen: 'Prescriptions'},
  {label: 'orders', screen: 'Orders'},
];

export function ServicesHubScreen() {
  const nav = useNavigation();
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.pad}>
        <Text style={type.title}>{i18n.services('title')}</Text>
        {ITEMS.map(it => (
          <Pressable key={it.label} style={styles.card} onPress={() => nav.navigate(it.screen, it.params)}>
            <Text style={type.h3}>{i18n.services(it.label)}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bg},
  pad: {padding: space.md, gap: 10},
  card: {backgroundColor: colors.surface, padding: space.lg, borderRadius: radius.lg, minHeight: 64, justifyContent: 'center'},
});
