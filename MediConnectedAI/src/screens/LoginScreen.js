import React, {useState} from 'react';
import {KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors, radius, space, type} from '../constants/theme';
import {i18n} from '../i18n';
import {PrimaryButton} from '../components/PrimaryButton';
import {requestOtp, verifyOtp} from '../auth/authService';
import {useSession} from '../store/SessionContext';

export function LoginScreen() {
  const {setProfile} = useSession();
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [hint, setHint] = useState('');

  const send = async () => {
    setBusy(true);
    setError('');
    try {
      const res = await requestOtp(phone);
      setHint(res.debugOtp ? `Dev code: ${res.debugOtp}` : res.message);
      setStep('otp');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    setBusy(true);
    setError('');
    try {
      const profile = await verifyOtp({phone, code, name});
      setProfile(profile);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <View style={styles.card}>
          <Text style={type.title}>{i18n.t('appName')}</Text>
          <Text style={[type.muted, styles.mb]}>{i18n.profile(step === 'phone' ? 'loginBody' : 'otpBody')}</Text>
          {step === 'phone' ? (
            <>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder={i18n.profile('name')}
                style={styles.input}
                autoCapitalize="words"
              />
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder={i18n.profile('phone')}
                keyboardType="phone-pad"
                style={styles.input}
              />
              {error ? <Text style={styles.err}>{error}</Text> : null}
              <PrimaryButton title={i18n.profile('sendCode')} onPress={send} disabled={busy || phone.length < 10} />
            </>
          ) : (
            <>
              <TextInput
                value={code}
                onChangeText={setCode}
                placeholder="000000"
                keyboardType="number-pad"
                style={styles.input}
                maxLength={6}
              />
              {hint ? <Text style={type.muted}>{hint}</Text> : null}
              {error ? <Text style={styles.err}>{error}</Text> : null}
              <PrimaryButton title={i18n.profile('verify')} onPress={verify} disabled={busy || code.length < 4} />
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.primarySoft},
  flex: {flex: 1, justifyContent: 'center', padding: space.lg},
  card: {backgroundColor: colors.surface, borderRadius: 24, padding: space.lg, gap: space.sm},
  mb: {marginBottom: space.md},
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: space.md,
    fontSize: 16,
    minHeight: 52,
    color: colors.text,
  },
  err: {color: colors.danger, marginBottom: 8},
});
