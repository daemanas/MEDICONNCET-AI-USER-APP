import React, {useState} from 'react';
import {Alert, StyleSheet, Text, TextInput, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors, radius, space, type} from '../constants/theme';
import {i18n} from '../i18n';
import {useSession} from '../store/SessionContext';
import {captureAndMapLocation} from '../location/locationService';
import {runSync} from '../sync/syncService';
import {PrimaryButton} from '../components/PrimaryButton';

export function LocationPickerScreen() {
  const nav = useNavigation();
  const {patient, updateLocation, setProfile} = useSession();
  const [city, setCity] = useState(patient?.city || '');
  const [district, setDistrict] = useState(patient?.district || '');
  const [state, setState] = useState(patient?.state || '');
  const [busy, setBusy] = useState(false);

  const gps = async () => {
    setBusy(true);
    try {
      const res = await captureAndMapLocation();
      if (res.denied) {
        Alert.alert(i18n.profile('locationDenied'));
        return;
      }
      setProfile(res.profile);
      await runSync({patient: res.profile.patient, forceFull: true});
      nav.goBack();
    } catch (e) {
      Alert.alert(e.message);
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    setBusy(true);
    try {
      const profile = await updateLocation({city, district, state, locationSource: 'MANUAL'});
      await runSync({patient: profile.patient, forceFull: true});
      nav.goBack();
    } catch (e) {
      Alert.alert(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.pad}>
        <Text style={type.title}>{i18n.t('selectLocation')}</Text>
        <Text style={type.muted}>{i18n.profile('enterArea')}</Text>
        <TextInput value={city} onChangeText={setCity} placeholder={i18n.profile('city')} style={styles.input} />
        <TextInput value={district} onChangeText={setDistrict} placeholder={i18n.profile('district')} style={styles.input} />
        <TextInput value={state} onChangeText={setState} placeholder={i18n.profile('state')} style={styles.input} />
        <PrimaryButton title={i18n.profile('useGps')} onPress={gps} disabled={busy} />
        <PrimaryButton title={i18n.t('save')} tone="ghost" onPress={save} disabled={busy} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bg},
  pad: {padding: space.lg, gap: space.sm},
  input: {backgroundColor: colors.surface, borderRadius: radius.md, padding: 14, fontSize: 16, color: colors.text, minHeight: 50},
});
