import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors, radius, space} from '../constants/theme';
import {i18n} from '../i18n';
import {requestOtp, verifyOtp} from '../auth/authService';
import {useSession} from '../store/SessionContext';
import {useNetwork} from '../store/NetworkContext';
import {captureAndMapLocation} from '../location/locationService';

const OTP_LENGTH = 6;
const RESEND_DELAY = 30;

function normalizePhone(value) {
  const digits = value.replace(/\D/g, '');
  return digits.startsWith('91') && digits.length === 12 ? digits.slice(2) : digits;
}

function isValidPhone(value) {
  return /^[6-9]\d{9}$/.test(normalizePhone(value));
}

export function LoginScreen() {
  const {setProfile} = useSession();
  const {online} = useNetwork();
  const [step, setStep] = useState('details');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [hint, setHint] = useState('');
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (!resendIn) return undefined;
    const timer = setInterval(() => setResendIn(value => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [resendIn]);

  const sendOtp = async ({resend = false} = {}) => {
    if (!online) {
      setError(i18n.profile('networkRequired'));
      return false;
    }
    if (!resend && !name.trim()) {
      setError(i18n.profile('nameRequired'));
      return false;
    }
    if (!isValidPhone(phone)) {
      setError(i18n.profile('phoneInvalid'));
      return false;
    }
    setBusy(true);
    setError('');
    try {
      const response = await requestOtp(normalizePhone(phone));
      setHint(response?.debugOtp ? `Dev code: ${response.debugOtp}` : '');
      setCode('');
      setStep('otp');
      setResendIn(RESEND_DELAY);
      return true;
    } catch (err) {
      setError(err.offline ? i18n.profile('networkRequired') : i18n.profile('otpSendFailed'));
      return false;
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    if (!online) {
      setError(i18n.profile('networkRequired'));
      return;
    }
    if (code.length !== OTP_LENGTH) {
      setError(i18n.profile('otpInvalid'));
      return;
    }
    setBusy(true);
    setError('');
    try {
      const profile = await verifyOtp({phone: normalizePhone(phone), code, name: name.trim()});
      setProfile(profile);
      captureAndMapLocation().catch(() => {});
    } catch (err) {
      if (err.offline) setError(i18n.profile('networkRequired'));
      else if (err.status === 429) setError(i18n.profile('tooManyAttempts'));
      else if (err.status === 400 || err.status === 401) setError(i18n.profile('otpInvalid'));
      else setError(i18n.profile('serverError'));
    } finally {
      setBusy(false);
    }
  };

  const goBack = () => {
    if (busy) return;
    setStep('details');
    setCode('');
    setError('');
    setHint('');
  };

  return (
    <ImageBackground source={require('../../assets/home-hero-rural.png')} imageStyle={styles.backgroundImage} style={styles.background}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={styles.brand}>
              <View style={styles.logo}><Text style={styles.logoMark}>+</Text><Text style={styles.logoDot}>•</Text></View>
              <Text style={styles.brandName}>MediConnected <Text style={styles.brandAccent}>AI</Text></Text>
              <Text style={styles.tagline}>{i18n.profile('tagline')}</Text>
              <View style={styles.trustPill}><Text style={styles.trustIcon}>✓</Text><Text style={styles.trustText}>{i18n.profile('trustBadge')}</Text></View>
            </View>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.headerCopy}><Text style={styles.heading}>{step === 'details' ? i18n.profile('welcomeBack') : i18n.profile('verifyPhone')}</Text><Text style={styles.subtitle}>{step === 'details' ? i18n.profile('loginSubtitle') : i18n.profile('verifySubtitle')}</Text></View>
                <View style={styles.shield}><Text style={styles.shieldMark}>✓</Text></View>
              </View>
              {step === 'details' ? (
                <>
                  <Field icon="◎" value={name} onChangeText={value => { setName(value); setError(''); }} placeholder={i18n.profile('name')} autoCapitalize="words" editable={!busy} />
                  <View style={[styles.inputWrap, error && styles.inputError]}><Text style={styles.countryCode}>+91</Text><TextInput value={phone} onChangeText={value => { setPhone(value.replace(/[^\d+ ]/g, '')); setError(''); }} placeholder={i18n.profile('mobileNumber')} placeholderTextColor={colors.textSoft} style={styles.input} keyboardType="phone-pad" maxLength={14} editable={!busy} accessibilityLabel={i18n.profile('mobileNumber')} /></View>
                  {error ? <Text style={styles.err} accessibilityLiveRegion="polite">{error}</Text> : null}
                  <ActionButton title={i18n.profile('sendOtp')} busyTitle={i18n.profile('sendingOtp')} busy={busy} onPress={() => sendOtp()} />
                </>
              ) : (
                <>
                  <Text style={styles.sentTo}>{i18n.profile('sentCodeTo')} <Text style={styles.sentPhone}>+91 {normalizePhone(phone)}</Text></Text>
                  <View style={styles.otpRow}>{Array.from({length: OTP_LENGTH}, (_, index) => <View key={index} style={[styles.otpBox, code[index] && styles.otpFilled]}><Text style={styles.otpText}>{code[index] || ''}</Text></View>)}</View>
                  <TextInput value={code} onChangeText={value => { setCode(value.replace(/\D/g, '').slice(0, OTP_LENGTH)); setError(''); }} style={styles.otpInput} keyboardType="number-pad" maxLength={OTP_LENGTH} autoFocus editable={!busy} accessibilityLabel={i18n.profile('verificationCode')} />
                  {hint ? <Text style={styles.hint}>{hint}</Text> : null}
                  {error ? <Text style={styles.err} accessibilityLiveRegion="polite">{error}</Text> : null}
                  <ActionButton title={i18n.profile('verifyContinue')} busyTitle={i18n.profile('verifying')} busy={busy} onPress={verify} />
                  <Pressable onPress={() => sendOtp({resend: true})} disabled={busy || resendIn > 0} style={styles.resend} accessibilityRole="button" accessibilityLabel={i18n.profile('resendOtp')}><Text style={[styles.resendText, (busy || resendIn > 0) && styles.resendDisabled]}>{resendIn ? `${i18n.profile('resendOtpIn')} ${resendIn}s` : i18n.profile('resendOtp')}</Text></Pressable>
                  <Pressable onPress={goBack} disabled={busy} style={styles.changeNumber}><Text style={styles.changeNumberText}>{i18n.profile('changeNumber')}</Text></Pressable>
                </>
              )}
              <View style={styles.infoPanel}><View style={styles.infoShield}><Text style={styles.infoShieldMark}>✓</Text></View><View style={styles.infoCopy}><Text style={styles.infoTitle}>{i18n.profile('securityTitle')}</Text><Text style={styles.infoBody}>{i18n.profile('securityDescription')}</Text></View><Text style={styles.infoDocument}>▤{`\n`}🔒</Text></View>
            </View>
            <View style={styles.footer}><Text style={styles.footerTop}>✓  {i18n.profile('footerTrust')}</Text><Text style={styles.footerBottom}>{i18n.profile('footerMessage')}</Text></View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

function Field({icon, value, onChangeText, placeholder, ...props}) {
  return <View style={styles.inputWrap}><Text style={styles.inputIcon}>{icon}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.textSoft} style={styles.input} accessibilityLabel={placeholder} {...props} /></View>;
}

function ActionButton({title, busyTitle, busy, onPress}) {
  return <Pressable onPress={onPress} disabled={busy} accessibilityRole="button" accessibilityLabel={title} style={({pressed}) => [styles.loginButton, pressed && styles.pressed, busy && styles.disabled]}>{busy ? <><ActivityIndicator color="#fff" /><Text style={[styles.loginText, styles.busyText]}>{busyTitle}</Text></> : <><Text style={styles.loginText}>{title}</Text><Text style={styles.arrow}>→</Text></>}</Pressable>;
}

const styles = StyleSheet.create({
  background: {flex: 1, backgroundColor: '#EAF5F0'}, backgroundImage: {opacity: 0.44}, safe: {flex: 1, backgroundColor: 'rgba(241, 248, 247, 0.5)'}, flex: {flex: 1}, content: {padding: space.md, paddingBottom: space.xl},
  brand: {alignItems: 'center', paddingTop: space.sm, paddingBottom: space.lg}, logo: {width: 58, height: 58, borderRadius: 15, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', transform: [{rotate: '45deg'}], marginBottom: space.sm}, logoMark: {color: '#fff', fontSize: 45, lineHeight: 48, fontWeight: '300', transform: [{rotate: '-45deg'}]}, logoDot: {position: 'absolute', color: '#fff', fontSize: 25, top: 15, transform: [{rotate: '-45deg'}]}, brandName: {fontSize: 29, fontWeight: '800', color: '#11233A'}, brandAccent: {color: colors.primary}, tagline: {fontSize: 16, color: '#5A6C7A', marginTop: 5}, trustPill: {flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.88)', paddingHorizontal: space.md, paddingVertical: 9, borderRadius: radius.pill, marginTop: space.md}, trustIcon: {color: colors.primary, fontWeight: '800', fontSize: 18, marginRight: 7}, trustText: {color: colors.primaryDark, fontSize: 14, fontWeight: '700'},
  card: {backgroundColor: 'rgba(255,255,255,0.94)', borderRadius: 30, padding: space.lg, shadowColor: '#214B3E', shadowOffset: {width: 0, height: 8}, shadowOpacity: 0.14, shadowRadius: 18, elevation: 5}, cardHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space.lg}, headerCopy: {flex: 1, paddingRight: space.sm}, heading: {fontSize: 28, fontWeight: '800', color: '#11233A'}, subtitle: {fontSize: 15, color: '#647183', marginTop: 7}, shield: {width: 72, height: 72, borderRadius: 36, backgroundColor: '#F8FCFA', alignItems: 'center', justifyContent: 'center', shadowColor: colors.primary, shadowOpacity: 0.13, shadowRadius: 12, elevation: 2}, shieldMark: {fontSize: 36, color: colors.primary, fontWeight: '800'},
  inputWrap: {minHeight: 58, borderRadius: radius.md, borderWidth: 1, borderColor: '#E3E8EC', backgroundColor: '#FCFDFD', flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.md, marginBottom: space.md}, inputError: {borderColor: colors.danger}, inputIcon: {fontSize: 22, color: '#7B8A9B', width: 30, textAlign: 'center'}, countryCode: {fontSize: 15, color: colors.primaryDark, fontWeight: '700', paddingRight: space.sm, borderRightWidth: 1, borderRightColor: colors.border}, input: {flex: 1, color: colors.text, fontSize: 16, paddingVertical: 9, marginLeft: space.sm}, sentTo: {fontSize: 14, lineHeight: 21, color: '#647183', marginBottom: space.md}, sentPhone: {fontWeight: '800', color: colors.text}, otpRow: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: space.sm}, otpBox: {width: 39, height: 48, borderWidth: 1, borderColor: '#DCE8E1', borderRadius: 10, backgroundColor: '#FCFDFD', alignItems: 'center', justifyContent: 'center'}, otpFilled: {borderColor: colors.primary, backgroundColor: colors.primarySoft}, otpText: {fontSize: 22, color: colors.text, fontWeight: '700'}, otpInput: {position: 'absolute', opacity: 0, width: 1, height: 1}, hint: {fontSize: 12, color: colors.primaryDark, marginBottom: space.sm}, err: {color: colors.danger, fontSize: 13, marginBottom: space.sm},
  loginButton: {minHeight: 58, borderRadius: radius.pill, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', shadowColor: colors.primaryDark, shadowOffset: {width: 0, height: 5}, shadowOpacity: 0.25, shadowRadius: 9, elevation: 4}, loginText: {color: '#fff', fontSize: 18, fontWeight: '800', marginLeft: space.sm}, busyText: {fontSize: 15}, arrow: {color: '#fff', fontSize: 30, lineHeight: 30, marginLeft: space.md}, pressed: {opacity: 0.82}, disabled: {opacity: 0.62}, resend: {alignItems: 'center', paddingVertical: space.md}, resendText: {color: colors.primaryDark, fontSize: 14, fontWeight: '700'}, resendDisabled: {color: colors.textSoft}, changeNumber: {alignItems: 'center', paddingBottom: space.md}, changeNumberText: {fontSize: 13, color: colors.textMuted},
  infoPanel: {backgroundColor: '#F6F8FC', borderRadius: radius.md, padding: space.md, flexDirection: 'row', alignItems: 'center', marginTop: space.xs}, infoShield: {width: 50, height: 50, borderRadius: 25, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginRight: space.sm}, infoShieldMark: {fontSize: 27, color: colors.primary, fontWeight: '800'}, infoCopy: {flex: 1}, infoTitle: {fontSize: 15, fontWeight: '800', color: '#11233A', marginBottom: 5}, infoBody: {fontSize: 12, lineHeight: 18, color: '#637083'}, infoDocument: {fontSize: 24, lineHeight: 26, color: '#8CCBB0', textAlign: 'center', marginLeft: space.xs}, footer: {alignItems: 'center', paddingTop: space.lg, paddingBottom: space.sm}, footerTop: {fontSize: 13, color: colors.primaryDark, fontWeight: '700'}, footerBottom: {fontSize: 12, color: '#667587', marginTop: 6},
});
