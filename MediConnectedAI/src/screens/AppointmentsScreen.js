import React, {useEffect, useState} from 'react';
import {FlatList, Image, Pressable, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors, radius, shadow, space} from '../constants/theme';
import {providerApi} from '../api/providerApi';
import {ScreenState} from '../components/ScreenState';
import {formatDate} from '../utils/format';

const STATUS_FILTER = {
  UPCOMING: 'upcoming',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

function getDayOfWeek(dateString) {
  if (!dateString) {return '';}
  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {return '';}
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  } catch {return '';}
}

function formatTimeAMPM(value) {
  if (!value) {return '';}
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {return '';}
    let hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) {hours = 12;}
    return `${hours}:${String(minutes).padStart(2, '0')} ${ampm}`;
  } catch {return '';}
}

function StatusBadge({status}) {
  const s = (status || '').toLowerCase();
  const isCompleted = s === STATUS_FILTER.COMPLETED;
  const isCancelled = s === STATUS_FILTER.CANCELLED;
  const badgeStyle = isCompleted
    ? styles.badgeCompleted
    : isCancelled ? styles.badgeCancelled : styles.badgeUpcoming;
  const textStyle = isCompleted
    ? styles.badgeTextCompleted
    : isCancelled ? styles.badgeTextCancelled : styles.badgeTextUpcoming;
  const icon = isCompleted ? '✓ ' : isCancelled ? '✕ ' : '◷ ';
  const label = isCompleted ? 'Completed' : isCancelled ? 'Cancelled' : 'Upcoming';
  const subText = isCompleted
    ? 'Consultation done'
    : isCancelled ? 'Cancelled by you' : 'Appointment scheduled';
  return (
    <View style={styles.badgeContainer}>
      <View style={[styles.badge, badgeStyle]}>
        <Text style={[styles.badgeText, textStyle]}>{icon}{label}</Text>
      </View>
      <Text style={styles.badgeSubText}>{subText}</Text>
    </View>
  );
}

function DoctorAvatar({doctor, item}) {
  const imageUri =
    doctor?.photoUrl || doctor?.imageUrl || doctor?.photo || item?.doctorPhoto || null;
  const initial = (doctor?.name || item?.doctorName || 'D').charAt(0).toUpperCase();
  if (imageUri) {
    return <Image source={{uri: imageUri}} style={styles.doctorImage} resizeMode="cover" />;
  }
  return (
    <View style={styles.doctorImagePlaceholder}>
      <Text style={styles.doctorInitial}>{initial}</Text>
    </View>
  );
}

export function AppointmentsScreen() {
  const nav = useNavigation();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(STATUS_FILTER.UPCOMING);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await providerApi.appointments();
      setAppointments(data.appointments || []);
    } catch (e) {
      setError(e.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter(
    apt => (apt.status || '').toLowerCase() === activeTab,
  );

  const tabs = [
    {key: STATUS_FILTER.UPCOMING, label: 'Upcoming'},
    {key: STATUS_FILTER.COMPLETED, label: 'Completed'},
    {key: STATUS_FILTER.CANCELLED, label: 'Cancelled'},
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => nav.goBack()} accessibilityRole="button">
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>My Appointments</Text>
          <Text style={styles.headerSubtitle}>View and manage your appointments</Text>
        </View>
        <Pressable style={styles.headerAddBtn} onPress={() => nav.navigate('Doctors')} accessibilityRole="button">
          <Text style={styles.headerAddIcon}>📅+</Text>
        </Pressable>
      </View>

      <View style={styles.tabBar}>
        {tabs.map(tab => (
          <Pressable key={tab.key} style={[styles.tabItem, activeTab === tab.key && styles.tabItemActive]} onPress={() => setActiveTab(tab.key)} accessibilityRole="tab">
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>{tab.label}</Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <ScreenState loading={true} error="" empty={false} onRetry={loadAppointments} />
      ) : error ? (
        <ScreenState loading={false} error={error} empty={false} onRetry={loadAppointments} />
      ) : filteredAppointments.length === 0 ? (
        <EmptyState status={activeTab} onFindDoctor={() => nav.navigate('Doctors')} />
      ) : (
        <FlatList
          data={filteredAppointments}
          keyExtractor={item => String(item._id || item.id || Math.random())}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          renderItem={({item}) => (
            <AppointmentCard
              item={item}
              onBookAgain={() => nav.navigate('Doctors', {facilityId: item.facility?.id || item.facilityId})}
              onViewDetails={() => nav.navigate('Doctors')}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

function EmptyState({status, onFindDoctor}) {
  const msgs = {
    upcoming: {icon: '📅', title: 'No Upcoming Appointments', body: 'You have no upcoming appointments scheduled.'},
    completed: {icon: '✅', title: 'No Completed Appointments', body: 'Your completed appointments will appear here.'},
    cancelled: {icon: '❌', title: 'No Cancelled Appointments', body: "You haven't cancelled any appointments."},
  };
  const msg = msgs[status] || msgs.upcoming;
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconWrap}><Text style={styles.emptyIcon}>{msg.icon}</Text></View>
      <Text style={styles.emptyTitle}>{msg.title}</Text>
      <Text style={styles.emptyBody}>{msg.body}</Text>
      {status === STATUS_FILTER.UPCOMING ? (
        <Pressable style={styles.findDoctorBtn} onPress={onFindDoctor} accessibilityRole="button">
          <Text style={styles.findDoctorText}>Find a Doctor</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function AppointmentCard({item, onBookAgain, onViewDetails}) {
  const doctor = item.doctor || {};
  const facility = item.facility || {};
  const consultationType = item.consultationType || item.type || '';
  const isOnline = consultationType.toLowerCase().includes('online') || consultationType.toLowerCase().includes('video');
  return (
    <View style={[styles.card, shadow]}>
      <View style={styles.cardDoctorRow}>
        <DoctorAvatar doctor={doctor} item={item} />
        <View style={styles.cardDoctorInfo}>
          <Text style={styles.doctorName} numberOfLines={1}>{doctor.name || item.doctorName || 'Doctor'}</Text>
          <Text style={styles.specialization} numberOfLines={1}>{doctor.specialization || item.doctorSpecialization || doctor.specialty || 'Specialist'}</Text>
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText} numberOfLines={1}>{facility.name || item.clinicName || item.facilityName || 'Healthcare Facility'}</Text>
          </View>
        </View>
        <StatusBadge status={item.status} />
      </View>
      <View style={styles.divider} />
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <View style={styles.metaIconWrap}><Text style={styles.metaIcon}>📅</Text></View>
          <View>
            <Text style={styles.metaValue}>{formatDate(item.scheduledAt) || 'TBD'}</Text>
            <Text style={styles.metaLabel}>{getDayOfWeek(item.scheduledAt)}</Text>
          </View>
        </View>
        <View style={styles.metaSeparator} />
        <View style={styles.metaItem}>
          <View style={styles.metaIconWrap}><Text style={styles.metaIcon}>🕐</Text></View>
          <View>
            <Text style={styles.metaValue}>{formatTimeAMPM(item.scheduledAt) || 'TBD'}</Text>
            <Text style={styles.metaLabel}>Consultation</Text>
          </View>
        </View>
        <View style={styles.metaSeparator} />
        <View style={styles.metaItem}>
          <View style={styles.metaIconWrap}><Text style={styles.metaIcon}>{isOnline ? '📹' : '📍'}</Text></View>
          <View>
            <Text style={styles.metaValue}>{isOnline ? 'Online' : 'In-clinic'}</Text>
            <Text style={styles.metaLabel}>{isOnline ? 'Video Call' : 'Visit'}</Text>
          </View>
        </View>
      </View>
      {(item.reason || item.notes || item.consultationReason) ? (
        <View style={styles.reasonRow}>
          <Text style={styles.reasonIcon}>📋</Text>
          <Text style={styles.reasonText} numberOfLines={2}>{item.reason || item.notes || item.consultationReason}</Text>
        </View>
      ) : null}
      <View style={styles.actionRow}>
        <Pressable style={styles.bookAgainBtn} onPress={onBookAgain} accessibilityRole="button">
          <Text style={styles.bookAgainIcon}>📅</Text>
          <Text style={styles.bookAgainText}>Book Again</Text>
        </Pressable>
        <Pressable style={styles.viewDetailsBtn} onPress={onViewDetails} accessibilityRole="button">
          <Text style={styles.viewDetailsText}>View Details</Text>
          <Text style={styles.viewDetailsArrow}> ›</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#F4F8F6'},

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: space.md,
    paddingVertical: space.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
    marginRight: space.sm,
  },
  backIcon: {fontSize: 18, fontWeight: '700', color: colors.primaryDark},
  headerCenter: {flex: 1},
  headerTitle: {fontSize: 20, fontWeight: '800', color: colors.text, letterSpacing: -0.3},
  headerSubtitle: {fontSize: 12, color: colors.textMuted, marginTop: 2},
  headerAddBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.primarySoft,
    alignItems: 'center', justifyContent: 'center',
  },
  headerAddIcon: {fontSize: 17},

  // Tabs
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingHorizontal: space.md,
    paddingBottom: space.md,
    paddingTop: space.sm,
    gap: space.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabItem: {
    flex: 1, paddingVertical: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center', justifyContent: 'center',
  },
  tabItemActive: {backgroundColor: colors.primary},
  tabLabel: {fontSize: 13, fontWeight: '700', color: colors.primaryDark},
  tabLabelActive: {color: '#fff'},

  // List
  listContent: {padding: space.md, paddingBottom: 100, gap: space.md},

  // Card
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardDoctorRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    padding: space.md, paddingBottom: space.sm, gap: space.sm,
  },
  doctorImage: {
    width: 68, height: 68,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
  },
  doctorImagePlaceholder: {
    width: 68, height: 68,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center', justifyContent: 'center',
  },
  doctorInitial: {fontSize: 26, fontWeight: '800', color: colors.primary},
  cardDoctorInfo: {flex: 1, paddingTop: 2},
  doctorName: {fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 2},
  specialization: {fontSize: 13, color: colors.textMuted, fontWeight: '500', marginBottom: 4},
  locationRow: {flexDirection: 'row', alignItems: 'center', gap: 3},
  locationIcon: {fontSize: 11},
  locationText: {fontSize: 12, color: colors.textMuted, fontWeight: '500', flex: 1},

  // Badge
  badgeContainer: {alignItems: 'flex-end', paddingTop: 2},
  badge: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill, marginBottom: 4},
  badgeCompleted: {backgroundColor: '#DFF2E3'},
  badgeCancelled: {backgroundColor: '#FDECEA'},
  badgeUpcoming: {backgroundColor: colors.primarySoft},
  badgeText: {fontSize: 12, fontWeight: '700'},
  badgeTextCompleted: {color: '#2E7D32'},
  badgeTextCancelled: {color: '#C62828'},
  badgeTextUpcoming: {color: colors.primaryDark},
  badgeSubText: {fontSize: 10, color: colors.textMuted, fontWeight: '500', textAlign: 'right', maxWidth: 110},

  // Divider
  divider: {height: 1, backgroundColor: colors.border, marginHorizontal: space.md},

  // Meta Row
  metaRow: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.md, paddingVertical: space.md, gap: 4},
  metaItem: {flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6},
  metaIconWrap: {width: 30, height: 30, borderRadius: 8, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center'},
  metaIcon: {fontSize: 14},
  metaValue: {fontSize: 12, fontWeight: '700', color: colors.text},
  metaLabel: {fontSize: 10, color: colors.textMuted, fontWeight: '500', marginTop: 1},
  metaSeparator: {width: 1, height: 30, backgroundColor: colors.border, marginHorizontal: 2},

  // Reason
  reasonRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#F4F8F6',
    marginHorizontal: space.md, marginBottom: space.md,
    padding: space.sm, borderRadius: radius.sm,
    gap: 8, borderLeftWidth: 3, borderLeftColor: colors.primaryMid,
  },
  reasonIcon: {fontSize: 14, marginTop: 1},
  reasonText: {flex: 1, fontSize: 13, color: colors.text, fontWeight: '500', lineHeight: 18},

  // Actions
  actionRow: {flexDirection: 'row', gap: space.sm, paddingHorizontal: space.md, paddingBottom: space.md, paddingTop: 4},
  bookAgainBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primarySoft, paddingVertical: 11,
    borderRadius: radius.md, gap: 6,
    borderWidth: 1, borderColor: colors.primaryMid,
  },
  bookAgainIcon: {fontSize: 15},
  bookAgainText: {fontSize: 14, fontWeight: '700', color: colors.primaryDark},
  viewDetailsBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.surface, paddingVertical: 11,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
    gap: 2,
  },
  viewDetailsText: {fontSize: 14, fontWeight: '700', color: colors.text},
  viewDetailsArrow: {fontSize: 18, fontWeight: '700', color: colors.textMuted},

  // Empty State
  emptyState: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.xl},
  emptyIconWrap: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: colors.primarySoft,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: space.lg,
  },
  emptyIcon: {fontSize: 38},
  emptyTitle: {fontSize: 18, fontWeight: '800', color: colors.text, textAlign: 'center', marginBottom: space.sm},
  emptyBody: {fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: space.xl},
  findDoctorBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: space.xl, paddingVertical: space.md,
    borderRadius: radius.pill, minHeight: 48,
    alignItems: 'center', justifyContent: 'center',
  },
  findDoctorText: {color: '#fff', fontWeight: '700', fontSize: 15},
});
