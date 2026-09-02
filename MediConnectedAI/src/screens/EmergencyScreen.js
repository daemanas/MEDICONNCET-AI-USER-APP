import React from 'react';
import {ScrollView, StyleSheet, Text} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors, space, type} from '../constants/theme';
import {i18n} from '../i18n';
import {PrimaryButton} from '../components/PrimaryButton';
import {confirmCall} from '../components/confirmCall';
  
export function EmergencyScreen() {
  const nav = useNavigation();
  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.pad}>
        <Text style={type.title}>{i18n.reports('emergencyTitle')}</Text>
        <Text style={type.body}>{i18n.reports('emergencyBody')}</Text>
        <PrimaryButton title={i18n.reports('call108')} tone="danger" onPress={() => confirmCall('108')} />
        <PrimaryButton title={i18n.reports('call112')} tone="danger" onPress={() => confirmCall('112')} />
        <PrimaryButton
          title={i18n.reports('nearestHospital')}
          onPress={() => nav.navigate('ProviderList', {type: 'HOSPITAL', titleKey: 'hospitals'})}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bg},
  pad: {padding: space.lg, gap: space.md},
});
