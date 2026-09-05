import React, {useEffect, useState} from 'react';
import {Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors, radius, shadow, space} from '../constants/theme';
import {i18n} from '../i18n';
import {useSession} from '../store/SessionContext';
import {orderApi} from '../api/orderApi';
import {providerApi} from '../api/providerApi';
import {reportApi} from '../api/reportApi';

const ACCOUNT_ROWS = [
  {key: 'personalInformation', icon: '♙', tone: '#EAF2FF'},
  {key: 'paymentMethods', icon: '▤', tone: '#EAF9F0'},
  {key: 'addresses', icon: '⌖', tone: '#F2EEFF'},
  {key: 'healthInformation', icon: '♥', tone: '#FFF0F1'},
  {key: 'privacySecurity', icon: '◇', tone: '#EAF6FF'},
  {key: 'helpSupport', icon: '◉', tone: '#FFF6E4'},
];

const HEALTH_CARDS = [
  {key: 'bloodPressure', icon: '♥', tone: '#EEF9F3', valueKey: 'bloodPressureValue', statusKey: 'normal'},
  {key: 'bloodSugar', icon: '●', tone: '#EEF7FF', valueKey: 'bloodSugarValue', statusKey: 'normal'},
  {key: 'weight', icon: '▣', tone: '#F5F0FF', valueKey: 'weightValue', statusKey: 'healthy'},
  {key: 'steps', icon: '⌁', tone: '#FFF7ED', valueKey: 'stepsValue', statusKey: 'today'},
];

export function ProfileScreen() {
  const nav = useNavigation();
  const {user, patient, updateProfile, logout, unread} = useSession();
  const [name, setName] = useState(patient?.name || user?.name || '');
  const [address, setAddress] = useState(patient?.address || '');
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [counts, setCounts] = useState({orders: null, appointments: null, reports: null, addresses: null});

  useEffect(() => {
    setName(patient?.name || user?.name || '');
    setAddress(patient?.address || '');
  }, [patient?.name, patient?.address, user?.name]);

  useEffect(() => {
    let alive = true;
    Promise.allSettled([orderApi.list(), providerApi.appointments(), reportApi.records()]).then(results => {
      if (!alive) return;
      const [orders, appointments, reports] = results;
      setCounts({
        orders: Array.isArray(orders.value?.orders) ? orders.value.orders.length : null,
        appointments: Array.isArray(appointments.value?.appointments) ? appointments.value.appointments.length : null,
        reports: Array.isArray(reports.value?.records) ? reports.value.records.length : null,
        addresses: patient?.address ? 1 : 0,
      });
    });
    return () => { alive = false; };
  }, [patient?.address]);

  const save = async () => {
    setBusy(true);
    try {
      await updateProfile({name: name.trim(), address});
      setEditing(false);
      Alert.alert(i18n.t('saved'));
    } catch (error) {
      Alert.alert(i18n.t('somethingWrong'), error.message);
    } finally {
      setBusy(false);
    }
  };

  const openAccountRow = key => {
    if (key === 'personalInformation') { setEditing(true); return; }
    if (key === 'addresses') { nav.navigate('LocationPicker'); return; }
    if (key === 'healthInformation') { nav.navigate('HealthRecords'); return; }
    if (key === 'privacySecurity') { Alert.alert(i18n.profile('privacy'), i18n.profile('privacyBody')); return; }
    if (key === 'helpSupport') { Alert.alert(i18n.profile('helpSupport'), i18n.profile('helpSupportBody')); return; }
    Alert.alert(i18n.profile('paymentMethods'), i18n.profile('featureUnavailable'));
  };

  const avatarUri = user?.avatarUrl || user?.photoUrl || user?.profileImage;
  const display = name || 'MediConnected user';
  const initials = display.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase();
  const health = patient?.healthSummary || {};

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}><View><Text style={styles.title}>{i18n.profile('myProfile')}</Text><Text style={styles.subtitle}>{i18n.profile('manageAccount')}</Text></View><View style={styles.headerActions}><Pressable onPress={() => nav.navigate('Notifications')} style={styles.headerButton} accessibilityRole="button" accessibilityLabel={i18n.t('notifications')}><Text style={styles.headerIcon}>♧</Text>{unread > 0 ? <View style={styles.badge}><Text style={styles.badgeText}>{unread > 9 ? '9+' : unread}</Text></View> : null}</Pressable><Pressable onPress={() => Alert.alert(i18n.profile('settings'), i18n.profile('featureUnavailable'))} style={styles.headerButton} accessibilityRole="button" accessibilityLabel={i18n.profile('settings')}><Text style={styles.headerIcon}>⚙</Text></Pressable></View></View>

        <Pressable onPress={() => setEditing(true)} style={({pressed}) => [styles.heroCard, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel={i18n.profile('openProfile')}>
          <View style={styles.plusMark}>+</View><View style={styles.avatarRing}>{avatarUri ? <Image source={{uri: avatarUri}} style={styles.avatarImage} /> : <Text style={styles.avatarInitials}>{initials}</Text>}<View style={styles.camera}><Text style={styles.cameraText}>⌾</Text></View></View>
          <View style={styles.identity}><View style={styles.nameLine}><Text style={styles.profileName} numberOfLines={1}>{display}</Text><Text style={styles.verified}>✓</Text></View><Text style={styles.profileLine}>{user?.phone || patient?.phone || 'Mobile not added'}</Text><Text style={styles.profileLine} numberOfLines={1}>{user?.email || 'Email not added'}</Text><View style={styles.memberPill}><Text style={styles.memberText}>♛  {i18n.profile('premiumMember')}</Text></View></View><Text style={styles.chevron}>›</Text>
          <View style={styles.stats}><Stat icon="▣" value={counts.orders} label={i18n.profile('orders')} /><Stat icon="□" value={counts.appointments} label={i18n.profile('appointments')} /><Stat icon="▤" value={counts.reports} label={i18n.profile('reports')} /><Stat icon="⌖" value={counts.addresses} label={i18n.profile('addresses')} /></View>
        </Pressable>

        {editing ? <View style={styles.editPanel}><Text style={styles.editTitle}>{i18n.profile('personalInformation')}</Text><TextInput value={name} onChangeText={setName} placeholder={i18n.profile('name')} placeholderTextColor={colors.textSoft} style={styles.editInput} /><TextInput value={address} onChangeText={setAddress} placeholder={i18n.profile('address')} placeholderTextColor={colors.textSoft} style={styles.editInput} /><View style={styles.editActions}><Pressable onPress={() => setEditing(false)} style={styles.cancelButton}><Text style={styles.cancelText}>{i18n.t('cancel')}</Text></Pressable><Pressable onPress={save} disabled={busy} style={styles.saveButton}><Text style={styles.saveText}>{busy ? i18n.t('loading') : i18n.t('save')}</Text></Pressable></View></View> : null}

        <SectionHeader title={i18n.profile('healthSummary')} action={i18n.t('viewAll')} onPress={() => nav.navigate('HealthRecords')} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.healthRow}>{HEALTH_CARDS.map(card => <HealthCard key={card.key} card={card} value={health[card.valueKey]} />)}</ScrollView>

        <Text style={styles.sectionTitle}>{i18n.profile('accountSettings')}</Text><View style={styles.settingsCard}>{ACCOUNT_ROWS.map((row, index) => <AccountRow key={row.key} row={row} last={index === ACCOUNT_ROWS.length - 1} onPress={() => openAccountRow(row.key)} />)}</View>

        <Pressable onPress={() => nav.navigate('HealthRecords')} style={({pressed}) => [styles.promo, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel={i18n.profile('exploreNow')}><View style={styles.promoShield}>+</View><View style={styles.promoCopy}><Text style={styles.promoTitle}>{i18n.profile('healthPriority')}</Text><Text style={styles.promoBody}>{i18n.profile('healthPriorityBody')}</Text></View><View style={styles.explore}><Text style={styles.exploreText}>{i18n.profile('exploreNow')}  →</Text></View></Pressable>
        <Pressable onPress={() => logout()} style={({pressed}) => [styles.logout, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel={i18n.profile('logout')}><Text style={styles.logoutIcon}>⇥</Text><Text style={styles.logoutText}>{i18n.profile('logout')}</Text></Pressable>
        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({title, action, onPress}) { return <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{title}</Text><Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={action}><Text style={styles.viewAll}>{action}  →</Text></Pressable></View>; }
function Stat({icon, value, label}) { return <View style={styles.stat}><Text style={styles.statIcon}>{icon}</Text><Text style={styles.statValue}>{value == null ? '—' : value}</Text><Text style={styles.statLabel}>{label}</Text></View>; }
function HealthCard({card, value}) { return <View style={[styles.healthCard, {backgroundColor: card.tone}]}><Text style={styles.healthIcon}>{card.icon}</Text><Text style={styles.healthValue}>{value || '—'}</Text><Text style={styles.healthLabel}>{i18n.profile(card.key)}</Text><Text style={[styles.healthStatus, card.statusKey === 'normal' ? styles.green : card.statusKey === 'healthy' ? styles.purple : styles.orange]}>{i18n.profile(card.statusKey)}</Text></View>; }
function AccountRow({row, last, onPress}) { return <Pressable onPress={onPress} style={({pressed}) => [styles.accountRow, !last && styles.accountBorder, pressed && styles.rowPressed]} accessibilityRole="button" accessibilityLabel={i18n.profile(row.key)}><View style={[styles.accountIcon, {backgroundColor: row.tone}]}><Text style={styles.accountIconText}>{row.icon}</Text></View><View style={styles.accountCopy}><Text style={styles.accountTitle}>{i18n.profile(row.key)}</Text><Text style={styles.accountSubtitle}>{i18n.profile(`${row.key}Body`)}</Text></View><Text style={styles.accountChevron}>›</Text></Pressable>; }

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#FAFCFF'}, content: {padding: space.md, paddingBottom: space.xl}, header: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space.lg}, title: {fontSize: 29, fontWeight: '800', color: '#122039'}, subtitle: {fontSize: 14, color: '#68758A', marginTop: 5}, headerActions: {flexDirection: 'row', gap: 10}, headerButton: {width: 45, height: 45, borderRadius: 13, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...shadow}, headerIcon: {fontSize: 23, color: '#122039'}, badge: {position: 'absolute', right: -3, top: -5, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: '#E5444E', alignItems: 'center', justifyContent: 'center'}, badgeText: {fontSize: 9, color: '#fff', fontWeight: '800'}, heroCard: {backgroundColor: '#EAF5FF', borderRadius: radius.lg, padding: space.md, minHeight: 286, overflow: 'hidden', ...shadow}, plusMark: {position: 'absolute', right: 26, top: 36, fontSize: 112, lineHeight: 112, color: 'rgba(56, 135, 216, 0.08)', fontWeight: '300'}, avatarRing: {width: 102, height: 102, borderRadius: 51, backgroundColor: '#fff', borderWidth: 4, borderColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 12}, avatarImage: {width: '100%', height: '100%', borderRadius: 50}, avatarInitials: {fontSize: 28, color: '#146BC1', fontWeight: '800'}, camera: {position: 'absolute', right: -7, bottom: -2, width: 35, height: 35, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...shadow}, cameraText: {fontSize: 19, color: '#1D6BCC'}, identity: {position: 'absolute', left: 137, top: 38, right: 30}, nameLine: {flexDirection: 'row', alignItems: 'center'}, profileName: {fontSize: 20, fontWeight: '800', color: '#122039', flexShrink: 1}, verified: {marginLeft: 8, width: 19, height: 19, borderRadius: 10, backgroundColor: '#176BD0', color: '#fff', textAlign: 'center', textAlignVertical: 'center', fontSize: 13, fontWeight: '800'}, profileLine: {fontSize: 13, color: '#53657C', marginTop: 7}, memberPill: {alignSelf: 'flex-start', marginTop: 10, paddingHorizontal: 11, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: '#E8E5FF'}, memberText: {fontSize: 12, color: '#4A39B5', fontWeight: '700'}, chevron: {position: 'absolute', right: 14, top: 42, color: '#122039', fontSize: 30}, stats: {position: 'absolute', left: space.md, right: space.md, bottom: space.md, minHeight: 70, borderRadius: radius.md, backgroundColor: 'rgba(255,255,255,0.85)', flexDirection: 'row', alignItems: 'center'}, stat: {flex: 1, alignItems: 'center', borderRightWidth: 1, borderRightColor: '#DCE5EE'}, statIcon: {fontSize: 17, color: '#176BD0'}, statValue: {fontSize: 17, fontWeight: '800', color: '#122039', marginTop: 2}, statLabel: {fontSize: 11, color: '#637187', marginTop: 2}, editPanel: {backgroundColor: '#fff', borderRadius: radius.md, padding: space.md, marginTop: space.sm, ...shadow}, editTitle: {fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: space.sm}, editInput: {borderWidth: 1, borderColor: colors.border, borderRadius: 10, minHeight: 48, paddingHorizontal: 12, color: colors.text, marginBottom: space.sm}, editActions: {flexDirection: 'row', justifyContent: 'flex-end', gap: 10}, cancelButton: {paddingHorizontal: 15, paddingVertical: 10}, cancelText: {color: colors.textMuted, fontWeight: '700'}, saveButton: {backgroundColor: '#176BD0', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10}, saveText: {color: '#fff', fontWeight: '800'}, sectionHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: space.lg, marginBottom: space.sm}, sectionTitle: {fontSize: 19, fontWeight: '800', color: '#122039'}, viewAll: {fontSize: 14, color: '#176BD0', fontWeight: '800'}, healthRow: {gap: 10}, healthCard: {width: 142, minHeight: 174, borderRadius: radius.md, padding: space.md, alignItems: 'center', justifyContent: 'center'}, healthIcon: {fontSize: 27, color: '#176BD0', marginBottom: 8}, healthValue: {fontSize: 22, fontWeight: '800', color: '#122039'}, healthLabel: {fontSize: 12, color: '#4F5D73', marginTop: 4}, healthStatus: {fontSize: 13, fontWeight: '800', marginTop: 8}, green: {color: '#15965B'}, purple: {color: '#6243C9'}, orange: {color: '#EE8A18'}, settingsCard: {backgroundColor: '#fff', borderRadius: radius.lg, paddingHorizontal: space.md, ...shadow}, accountRow: {minHeight: 70, flexDirection: 'row', alignItems: 'center'}, accountBorder: {borderBottomWidth: 1, borderBottomColor: '#EDF0F4'}, rowPressed: {opacity: 0.75}, accountIcon: {width: 42, height: 42, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginRight: space.sm}, accountIconText: {fontSize: 21, color: '#176BD0'}, accountCopy: {flex: 1}, accountTitle: {fontSize: 15, fontWeight: '800', color: '#122039'}, accountSubtitle: {fontSize: 12, color: '#68758A', marginTop: 4}, accountChevron: {fontSize: 28, color: '#122039', paddingLeft: 10}, promo: {minHeight: 125, borderRadius: radius.lg, backgroundColor: '#EEF9F2', marginTop: space.lg, padding: space.md, flexDirection: 'row', alignItems: 'center'}, promoShield: {width: 65, height: 75, backgroundColor: '#37A967', borderRadius: 24, color: '#fff', fontSize: 45, fontWeight: '800', textAlign: 'center', textAlignVertical: 'center', marginRight: 10}, promoCopy: {flex: 1}, promoTitle: {fontSize: 17, fontWeight: '800', color: '#122039'}, promoBody: {fontSize: 12, lineHeight: 18, color: '#5D6C72', marginTop: 7}, explore: {borderWidth: 1, borderColor: '#2A9B61', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 10}, exploreText: {fontSize: 11, color: '#208650', fontWeight: '800'}, logout: {height: 60, marginTop: space.md, borderRadius: radius.lg, backgroundColor: '#fff', borderWidth: 1, borderColor: '#F1D8DA', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', ...shadow}, logoutIcon: {fontSize: 25, color: '#E0444D', marginRight: 8}, logoutText: {fontSize: 16, fontWeight: '800', color: '#E0444D'}, pressed: {opacity: 0.8}, bottomSpace: {height: 20},
});
