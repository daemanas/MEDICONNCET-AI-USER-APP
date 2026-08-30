import React, {useState} from 'react';
import {Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors, radius, space, type} from '../constants/theme';
import {i18n} from '../i18n';
import {useSession} from '../store/SessionContext';
import {PrimaryButton} from '../components/PrimaryButton';

export function ProfileScreen() {
  const nav = useNavigation();
  const {user, patient, updateProfile, logout} = useSession();
  const [name, setName] = useState(patient?.name || user?.name || '');
  const [address, setAddress] = useState(patient?.address || '');
  const [city, setCity] = useState(patient?.city || '');
  const [district, setDistrict] = useState(patient?.district || '');
  const [state, setState] = useState(patient?.state || '');
  const [emergencyContactName, setEmergencyContactName] = useState(patient?.emergencyContactName || '');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(patient?.emergencyContactPhone || '');
  const [notify, setNotify] = useState(true);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try {
      await updateProfile({
        name,
        address,
        emergencyContactName,
        emergencyContactPhone,
        notificationPrefs: {appointments: notify, email: notify},
      });
      Alert.alert(i18n.t('saved'));
    } catch (e) {
      Alert.alert(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.pad}>
        <Text style={type.title}>{i18n.profile('title')}</Text>
        <Field label={i18n.profile('name')} value={name} onChangeText={setName} />
        <Text style={type.muted}>{i18n.profile('phone')}: {user?.phone || patient?.phone}</Text>
        <Text style={type.muted}>{i18n.profile('email')}: {user?.email}</Text>
        <Field label={i18n.profile('address')} value={address} onChangeText={setAddress} />
        <Field label={i18n.profile('city')} value={city} onChangeText={setCity} editable={false} />
        <Field label={i18n.profile('district')} value={district} onChangeText={setDistrict} editable={false} />
        <Field label={i18n.profile('state')} value={state} onChangeText={setState} editable={false} />
        <Pressable onPress={() => nav.navigate('LocationPicker')}>
          <Text style={styles.link}>{i18n.home('changeArea')}</Text>
        </Pressable>
        <Field label={i18n.profile('emergencyName')} value={emergencyContactName} onChangeText={setEmergencyContactName} />
        <Field label={i18n.profile('emergencyPhone')} value={emergencyContactPhone} onChangeText={setEmergencyContactPhone} keyboardType="phone-pad" />
        <Text style={type.body}>{i18n.profile('language')}: {i18n.profile('languageValue')}</Text>
        <View style={styles.row}>
          <Text style={type.body}>{i18n.profile('notifications')}</Text>
          <Switch value={notify} onValueChange={setNotify} />
        </View>
        <Text style={[type.muted, styles.privacy]}>{i18n.profile('privacyBody')}</Text>
        <PrimaryButton title={i18n.t('save')} onPress={save} disabled={busy} />
        <PrimaryButton title={i18n.profile('logout')} tone="danger" onPress={logout} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({label, ...rest}) {
  return (
    <View>
      <Text style={type.muted}>{label}</Text>
      <TextInput style={styles.input} placeholderTextColor={colors.textSoft} {...rest} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bg},
  pad: {padding: space.md, gap: space.sm, paddingBottom: 40},
  input: {backgroundColor: colors.surface, borderRadius: radius.md, padding: 14, fontSize: 16, color: colors.text, minHeight: 48},
  link: {color: colors.primary, fontWeight: '700'},
  row: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  privacy: {marginVertical: space.sm},
});
