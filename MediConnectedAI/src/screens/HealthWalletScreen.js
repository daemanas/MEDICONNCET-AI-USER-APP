import React, {useState} from 'react';
import {ScrollView, StyleSheet, Text, TextInput} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors, radius, space, type} from '../constants/theme';
import {i18n} from '../i18n';
import {useSession} from '../store/SessionContext';
import {PrimaryButton} from '../components/PrimaryButton';

export function HealthWalletScreen() {
  const {patient, updateProfile} = useSession();
  const [bloodGroup, setBloodGroup] = useState(patient?.bloodGroup || '');
  const [allergies, setAllergies] = useState((patient?.allergies || []).join(', '));
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try {
      await updateProfile({bloodGroup, allergies: allergies.split(',').map(s => s.trim()).filter(Boolean)});
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.pad}>
        <Text style={type.title}>{i18n.reports('walletTitle')}</Text>
        <Text style={type.muted}>{i18n.reports('walletBody')}</Text>
        <Text style={type.h3}>{i18n.reports('mrn')}</Text>
        <Text style={type.body}>{patient?.mrn}</Text>
        <Text style={type.h3}>{i18n.reports('bloodGroup')}</Text>
        <TextInput value={bloodGroup} onChangeText={setBloodGroup} style={styles.input} />
        <Text style={type.h3}>{i18n.reports('allergies')}</Text>
        <TextInput value={allergies} onChangeText={setAllergies} style={styles.input} />
        <Text style={type.h3}>{i18n.profile('emergencyContact')}</Text>
        <Text style={type.body}>
          {patient?.emergencyContactName} {patient?.emergencyContactPhone}
        </Text>
        <PrimaryButton title={i18n.t('save')} onPress={save} disabled={busy} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bg},
  pad: {padding: space.lg, gap: space.sm},
  input: {backgroundColor: colors.surface, borderRadius: radius.md, padding: 14, fontSize: 16, color: colors.text},
});
