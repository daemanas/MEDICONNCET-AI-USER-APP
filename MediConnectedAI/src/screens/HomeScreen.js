import React, {useCallback, useEffect, useState} from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors, radius, shadow, space, type} from '../constants/theme';
import {i18n} from '../i18n';
import {useSession} from '../store/SessionContext';
import {useNetwork} from '../store/NetworkContext';
import {providerApi} from '../api/providerApi';
import {userApi} from '../api/userApi';
import {searchOffline} from '../sync/syncService';
import {getMeta} from '../database/database';
import {displayName} from '../utils/format';
import {formatLocationLabel} from '../location/locationService';
import {ProviderCard} from '../components/ProviderCard';
import {OfflineBanner} from '../components/OfflineBanner';
import {AiFab} from '../components/AiFab';
import {startListening, stopListening} from '../ai/voiceService';
import {detectLocalIntent} from '../ai/intentService';
import {runTool} from '../ai/aiTools';
import {SEARCH_DEBOUNCE_MS} from '../constants/config';

const SERVICES = [
  {key: 'orderMedicine', icon: '💊', screen: 'Medicines'},
  {key: 'consultDoctor', icon: '👨‍⚕️', screen: 'Doctors'},
  {key: 'labTests', icon: '🧪', screen: 'ProviderList', params: {type: 'LABORATORY', titleKey: 'labs'}},
  {key: 'hospitals', icon: '🏥', screen: 'ProviderList', params: {type: 'HOSPITAL', titleKey: 'hospitals'}},
];

const MORE = [
  {key: 'clinics', screen: 'ProviderList', params: {type: 'CLINIC', titleKey: 'clinics'}},
  {key: 'nursingHomes', screen: 'ProviderList', params: {type: 'NURSING_HOME', titleKey: 'nursingHomes'}},
  {key: 'diagnostics', screen: 'ProviderList', params: {type: 'DIAGNOSTIC_CENTRE', titleKey: 'diagnostics'}},
  {key: 'pharmacies', screen: 'ProviderList', params: {type: 'PHARMACY', titleKey: 'pharmacies'}},
  {key: 'healthReports', screen: 'Reports'},
  {key: 'prescriptions', screen: 'Prescriptions'},
];

const QUICK = [
  {key: 'trackOrder', icon: '📦', screen: 'Orders'},
  {key: 'prescriptions', icon: '📋', screen: 'Prescriptions'},
  {key: 'healthRecords', icon: '📁', screen: 'HealthRecords'},
  {key: 'healthWallet', icon: '🪪', screen: 'HealthWallet'},
  {key: 'emergency', icon: '🚨', screen: 'Emergency'},
];

export function HomeScreen() {
  const nav = useNavigation();
  const {profile, patient, unread} = useSession();
  const {online} = useNetwork();
  const [q, setQ] = useState('');
  const [nearby, setNearby] = useState([]);
  const [tips, setTips] = useState([]);
  const [tipIndex, setTipIndex] = useState(0);
  const [lastSyncAt, setLastSyncAt] = useState(null);
  const [offlineNote, setOfflineNote] = useState(false);
  const [listening, setListening] = useState(false);

  const loc = formatLocationLabel(patient) || i18n.t('selectLocation');
  const name = displayName(profile) || 'there';

  const loadNearby = useCallback(async () => {
    try {
      if (online) {
        const data = await providerApi.list({limit: 8, district: patient?.district, city: patient?.city});
        setNearby(data.providers || []);
        setOfflineNote(false);
      } else {
        const data = await searchOffline({q: ''});
        setNearby(data.providers.slice(0, 8));
        setLastSyncAt(data.lastSyncAt);
        setOfflineNote(true);
      }
    } catch {
      const data = await searchOffline({q: ''});
      setNearby(data.providers.slice(0, 8));
      setLastSyncAt(data.lastSyncAt);
      setOfflineNote(true);
    }
  }, [online, patient?.district, patient?.city]);

  useEffect(() => {
    loadNearby();
    getMeta('lastSyncAt').then(setLastSyncAt);
    userApi
      .tips()
      .then(d => setTips(d.tips || []))
      .catch(() =>
        setTips([
          {title: 'Drink clean water', body: 'Use boiled or filtered water to prevent stomach infections.'},
          {title: 'Wash your hands', body: 'Wash with soap before eating and after using the toilet.'},
        ]),
      );
  }, [loadNearby]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (q.trim().length >= 2) {
        nav.navigate('Search', {q});
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [q, nav]);

  const onMic = async () => {
    if (listening) {
      await stopListening();
      setListening(false);
      return;
    }
    setListening(true);
    try {
      await startListening({
        onResult: text => {
          setListening(false);
          setQ(text);
          const intent = detectLocalIntent(text);
          runTool(intent.tool, intent.params || {q: text});
        },
        onError: msg => {
          setListening(false);
          Alert.alert(i18n.t('voiceSearch'), String(msg));
        },
      });
    } catch (e) {
      setListening(false);
      Alert.alert(i18n.t('voiceSearch'), e.message || 'Voice is not available on this device.');
    }
  };

  const tip = tips[tipIndex % Math.max(tips.length, 1)];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <Pressable onPress={() => nav.navigate('LocationPicker')} accessibilityRole="button">
              <Text style={styles.locLabel}>{i18n.t('yourLocation')}</Text>
              <Text style={styles.locValue} numberOfLines={1}>
                📍 {loc}
              </Text>
              <Text style={styles.tagline}>
                {i18n.home('serving')} 🌿
              </Text>
            </Pressable>
            <Pressable
              onPress={() => nav.navigate('Notifications')}
              style={styles.bell}
              accessibilityLabel={i18n.t('notifications')}>
              <Text style={styles.bellIcon}>🔔</Text>
              {unread > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unread > 9 ? '9+' : unread}</Text>
                </View>
              ) : null}
            </Pressable>
          </View>
        </View>

        <Text style={styles.hello}>
          {i18n.t('hello')}, {name} 👋
        </Text>
        <Text style={styles.sub}>{i18n.t('howHelp')}</Text>

        <View style={styles.search}>
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder={i18n.t('searchPlaceholder')}
            placeholderTextColor={colors.textSoft}
            style={styles.input}
            accessibilityLabel={i18n.t('searchPlaceholder')}
            returnKeyType="search"
            onSubmitEditing={() => nav.navigate('Search', {q})}
          />
          <Pressable onPress={onMic} style={styles.mic} accessibilityLabel={i18n.t('voiceSearch')}>
            <Text style={styles.micText}>{listening ? '■' : '🎤'}</Text>
          </Pressable>
        </View>

        <OfflineBanner lastSyncAt={offlineNote ? lastSyncAt : null} />

        <View style={styles.sectionHead}>
          <Text style={type.h2}>{i18n.t('ourServices')}</Text>
          <Pressable onPress={() => nav.navigate('Services')} accessibilityRole="button">
            <Text style={styles.link}>{i18n.t('viewAll')}</Text>
          </Pressable>
        </View>
        <View style={styles.grid}>
          {SERVICES.map(s => (
            <Pressable
              key={s.key}
              style={({pressed}) => [styles.service, shadow, pressed && {opacity: 0.9}]}
              onPress={() => nav.navigate(s.screen, s.params)}>
              <Text style={styles.sIcon}>{s.icon}</Text>
              <Text style={styles.sLabel}>{i18n.home(s.key)}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.moreWrap}>
          {MORE.map(m => (
            <Pressable key={m.key} onPress={() => nav.navigate(m.screen, m.params)} style={styles.moreChip}>
              <Text style={styles.moreText}>{i18n.home(m.key)}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[type.h2, styles.mt]}>{i18n.t('quickAccess')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickRow}>
          {QUICK.map(qItem => (
            <Pressable key={qItem.key} style={styles.quick} onPress={() => nav.navigate(qItem.screen)}>
              <Text style={styles.qIcon}>{qItem.icon}</Text>
              <Text style={styles.qLabel}>{i18n.home(qItem.key)}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.sectionHead}>
          <Text style={type.h2}>{i18n.t('nearbyServices')}</Text>
        </View>
        {nearby.length === 0 ? (
          <Text style={type.muted}>{i18n.home('noNearby')}</Text>
        ) : (
          nearby.map(item => (
            <ProviderCard
              key={item.id}
              item={item}
              onPress={() => nav.navigate('ProviderDetail', {id: item.id, preview: item})}
            />
          ))
        )}

        <View style={styles.tipCard}>
          <View style={styles.tipHead}>
            <Text style={type.h3}>{i18n.t('dailyHealthTip')}</Text>
            <Pressable
              onPress={() => setTipIndex(i => i + 1)}
              accessibilityLabel="Next tip">
              <Text style={styles.link}>Next</Text>
            </Pressable>
          </View>
          <Text style={styles.tipTitle}>{tip?.title}</Text>
          <Text style={type.body}>{tip?.body}</Text>
        </View>
        <View style={{height: 80}} />
      </ScrollView>
      <AiFab onPress={() => nav.navigate('AiAssistant')} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bg},
  scroll: {padding: space.md, paddingBottom: 40},
  hero: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    padding: space.lg,
    marginBottom: space.md,
    overflow: 'hidden',
  },
  heroTop: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start'},
  locLabel: {color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600'},
  locValue: {color: '#fff', fontSize: 18, fontWeight: '800', marginTop: 4, maxWidth: 240},
  tagline: {color: 'rgba(255,255,255,0.9)', marginTop: 6, fontSize: 13},
  bell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellIcon: {fontSize: 18},
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E74C3C',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {color: '#fff', fontSize: 9, fontWeight: '800'},
  hello: {...type.title, marginTop: 4},
  sub: {...type.muted, marginBottom: space.md, fontSize: 15},
  search: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    paddingLeft: space.md,
    alignItems: 'center',
    minHeight: 58,
    marginBottom: space.md,
    ...shadow,
  },
  input: {flex: 1, fontSize: 16, color: colors.text, minHeight: 58},
  mic: {width: 52, height: 52, alignItems: 'center', justifyContent: 'center'},
  micText: {fontSize: 20},
  sectionHead: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space.sm, marginTop: space.sm},
  link: {color: colors.primary, fontWeight: '700'},
  grid: {flexDirection: 'row', flexWrap: 'wrap', gap: space.sm},
  service: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: space.lg,
    alignItems: 'center',
    minHeight: 110,
  },
  sIcon: {fontSize: 28, marginBottom: 8},
  sLabel: {fontWeight: '700', color: colors.text, textAlign: 'center'},
  moreWrap: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: space.sm},
  moreChip: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    minHeight: 40,
    justifyContent: 'center',
  },
  moreText: {color: colors.primaryDark, fontWeight: '700', fontSize: 13},
  mt: {marginTop: space.md, marginBottom: space.sm},
  quickRow: {gap: 10, paddingVertical: 8},
  quick: {
    backgroundColor: colors.surface,
    padding: space.md,
    borderRadius: radius.lg,
    alignItems: 'center',
    width: 108,
    minHeight: 96,
  },
  qIcon: {fontSize: 22, marginBottom: 6},
  qLabel: {fontSize: 12, fontWeight: '700', textAlign: 'center', color: colors.text},
  tipCard: {
    backgroundColor: colors.goldSoft,
    borderRadius: radius.lg,
    padding: space.md,
    marginTop: space.md,
  },
  tipHead: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6},
  tipTitle: {fontWeight: '800', color: colors.text, marginBottom: 4, fontSize: 16},
});
