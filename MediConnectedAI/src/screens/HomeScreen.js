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
  {key: 'orderMedicine', icon: '💊', color: '#E8F5E9', screen: 'Medicines'},
  {key: 'consultDoctor', icon: '🩺', color: '#E3F2FD', screen: 'Doctors'},
  {key: 'labTests', icon: '🧬', color: '#FCE4EC', screen: 'ProviderList', params: {type: 'LABORATORY', titleKey: 'labs'}},
  {key: 'hospitals', icon: '🏥', color: '#F3E5F5', screen: 'Hospitals'},
];

const QUICK = [
  {key: 'trackOrder', icon: '📦', screen: 'Orders'},
  {key: 'prescriptions', icon: '📋', screen: 'Prescriptions'},
  {key: 'healthRecords', icon: '❤️', screen: 'HealthRecords'},
  {key: 'healthWallet', icon: '💳', screen: 'HealthWallet'},
  {key: 'emergency', icon: '☎️', screen: 'Emergency'},
];

export function HomeScreen() {
  const nav = useNavigation();
  const {profile, patient, unread} = useSession();
  const {online} = useNetwork();
  const [q, setQ] = useState('');
  const [nearby, setNearby] = useState([]);
  const [tips, setTips] = useState([]);
  const [lastSyncAt, setLastSyncAt] = useState(null);
  const [offlineNote, setOfflineNote] = useState(false);
  const [listening, setListening] = useState(false);
  const [activeQuickTab, setActiveQuickTab] = useState(0);

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

  const tip = tips.length > 0 ? tips[0] : null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header with location and notifications */}
        <View style={styles.headerContainer}>
          <Pressable 
            onPress={() => nav.navigate('LocationPicker')} 
            style={styles.locationSection}
            accessibilityRole="button">
            <View style={styles.locationIcon}>
              <Text style={styles.locationIconText}>📍</Text>
            </View>
            <View style={styles.locationContent}>
              <Text style={styles.locationLabel}>{loc}</Text>
              <Text style={styles.locationTagline}>{i18n.home('serving')} 🌿</Text>
            </View>
          </Pressable>
          
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => nav.navigate('Notifications')}
              style={styles.bellButton}
              accessibilityLabel={i18n.t('notifications')}>
              <Text style={styles.bellIcon}>🔔</Text>
              {unread > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unread > 9 ? '9+' : unread}</Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>

        {/* Greeting section */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingTitle}>
            {i18n.t('hello')}, {name} 👋
          </Text>
          <Text style={styles.greetingSubtitle}>{i18n.t('howHelp')}</Text>
        </View>

        {/* Search bar with voice button */}
        <View style={styles.searchContainer}>
          <View style={styles.search}>
            <Text style={styles.searchIcon}>🔍</Text>
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
          </View>
          <Pressable 
            onPress={onMic} 
            style={[styles.voiceButton, listening && styles.voiceButtonActive]} 
            accessibilityLabel={i18n.t('voiceSearch')}>
            <Text style={styles.voiceIcon}>{listening ? '⏹' : '🎤'}</Text>
          </Pressable>
        </View>

        <OfflineBanner lastSyncAt={offlineNote ? lastSyncAt : null} />

        {/* AI Health Assistant Card */}
        <Pressable 
          style={[styles.aiCard, shadow]}
          onPress={() => nav.navigate('AiAssistant')}
          accessibilityRole="button">
          <View style={styles.aiLeft}>
            <Text style={styles.aiLabel}>⚡ AI Health Assistant</Text>
            <Text style={styles.aiTitle}>Your Health, Our Priority</Text>
            <Text style={styles.aiBody}>Talk to our AI assistant and get personalized guidance instantly.</Text>
            <Pressable style={styles.chatButton}>
              <Text style={styles.chatButtonText}>Chat Now</Text>
              <Text style={styles.chatIcon}> 💬</Text>
            </Pressable>
          </View>
          <View style={styles.aiRight}>
            <Text style={styles.robotIcon}>🤖</Text>
          </View>
        </Pressable>

        {/* Our Services Section */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>{i18n.t('ourServices')}</Text>
          <Pressable onPress={() => nav.navigate('Services')} accessibilityRole="button">
            <Text style={styles.viewAllLink}>{i18n.t('viewAll')} →</Text>
          </Pressable>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.servicesRow}
          scrollEventThrottle={16}>
          {SERVICES.map(s => (
            <Pressable
              key={s.key}
              style={({pressed}) => [
                styles.serviceCard,
                {backgroundColor: s.color},
                shadow,
                pressed && {opacity: 0.9},
              ]}
              onPress={() => nav.navigate(s.screen, s.params)}>
              <Text style={styles.serviceIconLarge}>{s.icon}</Text>
              <Text style={styles.serviceTitle}>{i18n.home(s.key)}</Text>
              <Text style={styles.serviceDesc}>
                {s.key === 'orderMedicine' ? 'Fast delivery to your door' :
                 s.key === 'consultDoctor' ? 'Online consultation with verified doctors' :
                 s.key === 'labTests' ? 'Book tests at best prices' :
                 'Find hospitals near you'}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Quick Access Section */}
        <Text style={styles.sectionTitle}>{i18n.t('quickAccess')}</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.quickAccessRow}
          scrollEventThrottle={16}>
          {QUICK.map((qItem, index) => (
            <Pressable 
              key={qItem.key} 
              style={styles.quickItem}
              onPress={() => {
                setActiveQuickTab(index);
                nav.navigate(qItem.screen);
              }}>
              <View style={[styles.quickIconContainer, activeQuickTab === index && styles.quickIconActive]}>
                <Text style={styles.quickIcon}>{qItem.icon}</Text>
              </View>
              <Text style={styles.quickLabel}>{i18n.home(qItem.key)}</Text>
              {activeQuickTab === index && <View style={styles.quickIndicator} />}
            </Pressable>
          ))}
        </ScrollView>

        {/* Upcoming Appointment Card */}
        <Pressable 
          style={[styles.appointmentCard, shadow]}
          onPress={() => nav.navigate('Appointments')}
          accessibilityRole="button">
          <View style={styles.appointmentLeft}>
            <Text style={styles.appointmentLabel}>Upcoming Appointment</Text>
            <Text style={styles.appointmentDocName}>Dr. Arindam Roy</Text>
            <Text style={styles.appointmentSpecialty}>General Physician</Text>
            <View style={styles.appointmentMeta}>
              <Text style={styles.appointmentMetaIcon}>📅</Text>
              <Text style={styles.appointmentMetaText}>10 May 2025</Text>
              <Text style={styles.appointmentMetaIcon}>🕐</Text>
              <Text style={styles.appointmentMetaText}>11:00 AM</Text>
            </View>
            <Pressable style={styles.viewDetailsButton}>
              <Text style={styles.viewDetailsText}>View Details</Text>
            </Pressable>
          </View>
          <View style={styles.appointmentRight}>
            <View style={styles.doctorPhotoPlaceholder}>
              <Text style={styles.doctorPhotoIcon}>👨‍⚕️</Text>
            </View>
            <View style={styles.appointmentCalendarIcon}>
              <Text style={styles.appointmentCalendarEmoji}>📅</Text>
            </View>
          </View>
        </Pressable>

        {/* Nearby Services Section */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>{i18n.t('nearbyServices')}</Text>
          <Pressable onPress={() => nav.navigate('LocationPicker')} accessibilityRole="button">
            <Text style={styles.seeOnMapLink}>See on Map 📍</Text>
          </Pressable>
        </View>
        {nearby.length === 0 ? (
          <Text style={[type.muted, styles.emptyText]}>{i18n.home('noNearby')}</Text>
        ) : (
          nearby.map(item => (
            <ProviderCard
              key={item.id}
              item={item}
              onPress={() => nav.navigate('ProviderDetail', {id: item.id, preview: item})}
            />
          ))
        )}

        {/* Daily Health Tip Card */}
        <View style={[styles.healthTipCard, shadow]}>
          <View style={styles.healthTipTop}>
            <View style={styles.healthTipIcon}>
              <Text style={styles.healthTipEmoji}>🥤</Text>
            </View>
            <View style={styles.healthTipActions}>
              <Pressable style={styles.sosButton}>
                <Text style={styles.sosText}>SOS</Text>
              </Pressable>
              <Pressable style={styles.aiHelpButton}>
                <Text style={styles.aiHelpText}>AI Help</Text>
              </Pressable>
            </View>
          </View>
          <Text style={styles.healthTipLabel}>{i18n.t('dailyHealthTip')}</Text>
          <Text style={styles.healthTipTitle}>{tip?.title}</Text>
          <Text style={styles.healthTipBody}>{tip?.body}</Text>
          <Pressable style={styles.knowMoreButton}>
            <Text style={styles.knowMoreText}>Know More</Text>
            <Text style={styles.knowMoreArrow}> →</Text>
          </Pressable>
        </View>

        <View style={styles.spacer} />
      </ScrollView>
      <AiFab onPress={() => nav.navigate('AiAssistant')} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bg},
  scroll: {padding: space.md, paddingBottom: 40},

  // Header
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space.lg,
    paddingVertical: space.sm,
  },
  locationSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: 'rgba(31, 122, 87, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationIconText: {fontSize: 18},
  locationContent: {flex: 1},
  locationLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  locationTagline: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: space.sm,
    alignItems: 'center',
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  bellIcon: {fontSize: 20},
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#E74C3C',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {color: '#fff', fontSize: 10, fontWeight: '800'},

  // Greeting
  greetingSection: {
    marginBottom: space.lg,
  },
  greetingTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  greetingSubtitle: {
    fontSize: 15,
    color: colors.textSoft,
    fontWeight: '500',
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    gap: space.sm,
    marginBottom: space.lg,
    alignItems: 'center',
  },
  search: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 26,
    paddingHorizontal: space.md,
    alignItems: 'center',
    minHeight: 52,
    ...shadow,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    minHeight: 52,
    fontWeight: '500',
  },
  voiceButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  voiceButtonActive: {
    backgroundColor: colors.primaryDark,
  },
  voiceIcon: {fontSize: 22},

  // AI Card
  aiCard: {
    flexDirection: 'row',
    backgroundColor: '#E0F2F1',
    borderRadius: radius.lg,
    padding: space.lg,
    marginBottom: space.lg,
    alignItems: 'center',
    overflow: 'hidden',
  },
  aiLeft: {
    flex: 1,
    paddingRight: space.sm,
  },
  aiLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
  },
  aiTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
    lineHeight: 24,
  },
  aiBody: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: space.md,
  },
  chatButton: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  chatButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  chatIcon: {
    fontSize: 16,
    marginLeft: 6,
  },
  aiRight: {
    width: 100,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  robotIcon: {
    fontSize: 80,
  },

  // Services Section
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space.md,
    marginTop: space.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  viewAllLink: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  servicesRow: {
    gap: space.md,
    paddingVertical: space.sm,
    paddingRight: space.md,
  },
  serviceCard: {
    width: 140,
    borderRadius: radius.lg,
    padding: space.md,
    alignItems: 'center',
    ...shadow,
  },
  serviceIconLarge: {
    fontSize: 40,
    marginBottom: 10,
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  serviceDesc: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },

  // Quick Access
  quickAccessRow: {
    gap: space.sm,
    paddingVertical: space.sm,
    paddingRight: space.md,
  },
  quickItem: {
    alignItems: 'center',
    gap: 6,
  },
  quickIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  quickIconActive: {
    backgroundColor: colors.primarySoft,
  },
  quickIcon: {
    fontSize: 20,
  },
  quickLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    width: 60,
  },
  quickIndicator: {
    width: 40,
    height: 2,
    backgroundColor: colors.primary,
    borderRadius: 1,
    marginTop: 4,
  },

  // Appointment Card
  appointmentCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.lg,
    marginTop: space.lg,
    marginBottom: space.lg,
    alignItems: 'center',
    overflow: 'hidden',
  },
  appointmentLeft: {
    flex: 1,
    paddingRight: space.md,
  },
  appointmentLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 6,
  },
  appointmentDocName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 2,
  },
  appointmentSpecialty: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 12,
  },
  appointmentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: space.md,
  },
  appointmentMetaIcon: {
    fontSize: 14,
  },
  appointmentMetaText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  viewDetailsButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  viewDetailsText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  appointmentRight: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  doctorPhotoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorPhotoIcon: {
    fontSize: 50,
  },
  appointmentCalendarIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  appointmentCalendarEmoji: {
    fontSize: 18,
  },

  // Nearby Services
  seeOnMapLink: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  emptyText: {
    marginVertical: space.md,
  },

  // Health Tip Card
  healthTipCard: {
    backgroundColor: '#1B9B8E',
    borderRadius: radius.lg,
    padding: space.lg,
    marginTop: space.lg,
    marginBottom: space.lg,
  },
  healthTipTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: space.md,
  },
  healthTipIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  healthTipEmoji: {
    fontSize: 24,
  },
  healthTipActions: {
    flexDirection: 'row',
    gap: space.sm,
  },
  sosButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EF5350',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  sosText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  aiHelpButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#9C27B0',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  aiHelpText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 10,
    textAlign: 'center',
  },
  healthTipLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  healthTipTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  healthTipBody: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
    marginBottom: space.md,
  },
  knowMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  knowMoreText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  knowMoreArrow: {
    color: '#fff',
    fontSize: 16,
  },
  spacer: {
    height: 80,
  },
});
