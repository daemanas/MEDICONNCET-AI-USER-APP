import React from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors, radius, space, type} from '../constants/theme';
import {i18n} from '../i18n';

const MAIN_CATEGORIES = [
  {
    key: 'hospitals',
    title: 'Hospitals & Nursing Homes',
    subtitle: 'Quality care, closer to you',
    icon: '🏥',
    color: '#E7F5EE',
    screen: 'Hospitals',
  },
  {
    key: 'clinic',
    title: 'Clinics',
    subtitle: 'Consultation & doctor clinics',
    icon: '🩺',
    color: '#E3F2FD',
    screen: 'Clinics',
  },
  {
    key: 'diagnostic',
    title: 'Diagnostic / Lab',
    subtitle: 'Book tests & path labs',
    icon: '🧬',
    color: '#FCE4EC',
    screen: 'ProviderList',
    params: {type: 'DIAGNOSTIC_CENTRE', titleKey: 'diagnostics'},
  },
  {
    key: 'medicalShop',
    title: 'Medical Shop',
    subtitle: 'Pharmacies & medicine stores',
    icon: '💊',
    color: '#FFF8E1',
    screen: 'ProviderList',
    params: {type: 'PHARMACY', titleKey: 'pharmacies'},
  },
];

const SECONDARY_ITEMS = [
  {label: 'doctors', screen: 'Doctors'},
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
        
        {/* PRIMARY CATEGORIES */}
        <View style={styles.mainGrid}>
          {MAIN_CATEGORIES.map(cat => (
            <Pressable
              key={cat.key}
              style={({pressed}) => [styles.mainCard, pressed && styles.pressed]}
              onPress={() => nav.navigate(cat.screen, cat.params)}>
              <View style={[styles.iconCircle, {backgroundColor: cat.color}]}>
                <Text style={styles.icon}>{cat.icon}</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{cat.title}</Text>
                <Text style={styles.cardSub}>{cat.subtitle}</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </Pressable>
          ))}
        </View>

        {/* MORE SERVICES */}
        <Text style={[type.h3, styles.sectionTitle]}>More Services</Text>
        <View style={styles.secGrid}>
          {SECONDARY_ITEMS.map(it => (
            <Pressable
              key={it.label}
              style={styles.secCard}
              onPress={() => nav.navigate(it.screen, it.params)}>
              <Text style={styles.secText}>{i18n.services(it.label)}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bg},
  pad: {padding: space.md, paddingBottom: 40},
  mainGrid: {gap: 12, marginTop: space.md},
  mainCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: space.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 14,
  },
  pressed: {opacity: 0.85},
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {fontSize: 24},
  cardContent: {flex: 1},
  cardTitle: {fontSize: 16, fontWeight: '800', color: colors.text},
  cardSub: {fontSize: 12, fontWeight: '500', color: colors.textMuted, marginTop: 2},
  arrow: {fontSize: 22, fontWeight: '700', color: colors.textSoft},
  sectionTitle: {marginTop: space.lg, marginBottom: space.sm},
  secGrid: {gap: 8},
  secCard: {
    backgroundColor: colors.surface,
    padding: space.md,
    borderRadius: radius.md,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  secText: {fontSize: 14, fontWeight: '700', color: colors.text},
});

