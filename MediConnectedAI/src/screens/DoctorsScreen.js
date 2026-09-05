import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors, radius, shadow, space, type} from '../constants/theme';
import {i18n} from '../i18n';
import {useSession} from '../store/SessionContext';
import {useNetwork} from '../store/NetworkContext';
import {providerApi} from '../api/providerApi';
import {searchOfflineDoctors} from '../sync/syncService';
import {formatDistance} from '../utils/format';

const SPECIALTY_ICONS = {
  All: '▦',
  'General Physician': '🩺',
  Dermatologist: '✨',
  Cardiologist: '❤️',
  Pediatrician: '👶',
  Gynecologist: '🩺',
  Orthopedic: '🦴',
  Neurologist: '🧠',
  ENT: '👂',
  Dentist: '🦷',
};

function DoctorAvatar({doctor, isFavorite, onToggleFavorite}) {
  const imageUri =
    doctor?.photoUrl ||
    doctor?.imageUrl ||
    doctor?.avatar ||
    doctor?.photo ||
    doctor?.profileImage ||
    null;
  const initial = (doctor?.name || 'D').replace(/^Dr\.\s*/i, '').charAt(0).toUpperCase();

  const isAvailableToday =
    String(doctor?.availability || '').toUpperCase().includes('TODAY') ||
    String(doctor?.availability || '').toUpperCase() === 'AVAILABLE';

  return (
    <View style={styles.avatarWrapper}>
      <View style={styles.avatarContainer}>
        {imageUri ? (
          <Image source={{uri: imageUri}} style={styles.avatarImage} resizeMode="cover" />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>{initial}</Text>
          </View>
        )}
      </View>

      <View
        style={[
          styles.statusDot,
          isAvailableToday ? styles.statusDotAvailable : styles.statusDotOffline,
        ]}
      />

      <Pressable
        style={styles.favoriteBtn}
        onPress={onToggleFavorite}
        hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
        <Text style={[styles.favoriteIcon, isFavorite && styles.favoriteIconActive]}>
          {isFavorite ? '♥' : '♡'}
        </Text>
      </Pressable>
    </View>
  );
}

function DoctorCard({doctor, isFavorite, onToggleFavorite, onViewProfile, onBook}) {
  const fee = doctor?.consultationFee || doctor?.fee || doctor?.unitPrice || doctor?.price || null;
  const rating = doctor?.rating || doctor?.stars || null;
  const reviewCount = doctor?.reviewCount || doctor?.reviewsCount || doctor?.reviews || null;
  const experience = doctor?.experienceYears || doctor?.experience || null;
  const distanceKm = doctor?.distanceKm || doctor?.facility?.distanceKm || null;
  const formattedDist = formatDistance(distanceKm);

  const availabilityText = doctor?.availability
    ? String(doctor.availability)
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, l => l.toUpperCase())
    : null;

  const isAvailableToday =
    String(doctor?.availability || '').toUpperCase().includes('TODAY') ||
    String(doctor?.availability || '').toUpperCase() === 'AVAILABLE';

  const facilityName = doctor?.facility?.name || doctor?.facilityName || null;
  const locationText =
    doctor?.facility?.city ||
    doctor?.city ||
    doctor?.facility?.district ||
    doctor?.district ||
    null;

  const qualifications = doctor?.qualification || doctor?.qualifications || null;
  const specialization = doctor?.specialization || doctor?.specialty || 'Specialist';
  const isVerified = !!(doctor?.verified || doctor?.isVerified);

  return (
    <View style={[styles.card, shadow]}>
      <View style={styles.cardHeaderRow}>
        <DoctorAvatar
          doctor={doctor}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
        />

        <View style={styles.cardCenterInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.doctorName} numberOfLines={1}>
              {doctor?.name || 'Doctor'}
            </Text>
            {isVerified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedCheck}>✓</Text>
              </View>
            )}
          </View>

          <Text style={styles.specializationText} numberOfLines={1}>
            {specialization}
          </Text>

          {qualifications ? (
            <Text style={styles.qualificationText} numberOfLines={1}>
              {qualifications}
            </Text>
          ) : null}

          {facilityName ? (
            <Text style={styles.facilityText} numberOfLines={1}>
              {facilityName}
            </Text>
          ) : null}

          {locationText ? (
            <View style={styles.locationRow}>
              <Text style={styles.locationPinIcon}>📍</Text>
              <Text style={styles.locationText} numberOfLines={1}>
                {locationText}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.cardRightCol}>
          {availabilityText ? (
            <View
              style={[
                styles.availabilityPill,
                isAvailableToday
                  ? styles.availabilityPillActive
                  : styles.availabilityPillMuted,
              ]}>
              <Text
                style={[
                  styles.availabilityText,
                  isAvailableToday
                    ? styles.availabilityTextActive
                    : styles.availabilityTextMuted,
                ]}
                numberOfLines={1}>
                {isAvailableToday ? '● Available Today' : `⏱ ${availabilityText}`}
              </Text>
            </View>
          ) : null}

          {fee != null ? (
            <View style={styles.feeContainer}>
              <Text style={styles.feeAmount}>₹{fee}</Text>
              <Text style={styles.feeLabel}>Consultation Fee</Text>
            </View>
          ) : null}
        </View>
      </View>

      {(rating != null || experience != null || formattedDist != null) && (
        <View style={styles.metaRow}>
          {rating != null && (
            <View style={styles.metaItem}>
              <Text style={styles.starIcon}>★</Text>
              <Text style={styles.metaValueText}>
                {rating}
                {reviewCount ? ` (${reviewCount} reviews)` : ''}
              </Text>
            </View>
          )}

          {rating != null && (experience != null || formattedDist != null) && (
            <View style={styles.metaDivider} />
          )}

          {experience != null && (
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>👥</Text>
              <Text style={styles.metaValueText}>{experience}+ years</Text>
            </View>
          )}

          {experience != null && formattedDist != null && <View style={styles.metaDivider} />}

          {formattedDist != null && (
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>📍</Text>
              <Text style={styles.metaValueText}>{formattedDist}</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.actionRow}>
        <Pressable
          style={styles.viewProfileBtn}
          onPress={onViewProfile}
          accessibilityRole="button">
          <Text style={styles.viewProfileText}>View Profile</Text>
        </Pressable>

        <Pressable style={styles.bookBtn} onPress={onBook} accessibilityRole="button">
          <Text style={styles.bookBtnIcon}>📅</Text>
          <Text style={styles.bookBtnText}>Book Appointment</Text>
        </Pressable>
      </View>
    </View>
  );
}

function LoadingSkeleton() {
  return (
    <View style={styles.skeletonList}>
      {[1, 2, 3].map(key => (
        <View key={key} style={[styles.card, styles.skeletonCard]}>
          <View style={styles.skeletonHeader}>
            <View style={styles.skeletonAvatar} />
            <View style={styles.skeletonContent}>
              <View style={styles.skeletonLineLong} />
              <View style={styles.skeletonLineShort} />
              <View style={styles.skeletonLineMedium} />
            </View>
          </View>
          <View style={styles.skeletonBtnRow}>
            <View style={styles.skeletonBtn} />
            <View style={styles.skeletonBtn} />
          </View>
        </View>
      ))}
    </View>
  );
}
export function DoctorsScreen() {
  const nav = useNavigation();
  const facilityId = useRoute().params?.facilityId;
  const {patient} = useSession();
  const {online} = useNetwork();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [bookingId, setBookingId] = useState(null);
  const [favorites, setFavorites] = useState({});

  const userLocation =
    patient?.city ||
    patient?.district ||
    patient?.address ||
    i18n.t('selectLocation') ||
    'Select Location';

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (online) {
        const data = await providerApi.doctors({
          district: patient?.district,
          city: patient?.city,
        });
        let list = data.doctors || [];
        if (facilityId) {
          list = list.filter(d => d.facility?.id === facilityId || d.facilityId === facilityId);
        }
        setRows(list);
      } else {
        const list = await searchOfflineDoctors('');
        setRows(facilityId ? list.filter(d => d.facilityId === facilityId) : list);
      }
    } catch (e) {
      setError(e.message || 'Failed to fetch doctor data');
    } finally {
      setLoading(false);
    }
  }, [online, patient, facilityId]);

  useEffect(() => {
    load();
  }, [load]);

  const book = async doctor => {
    setBookingId(doctor.id);
    try {
      await providerApi.bookConsult({
        facilityId: doctor.facility?.id || doctor.facilityId,
        doctorUserId: doctor.id,
        reason: 'Consultation request from user app',
      });
      nav.navigate('Appointments');
    } catch (e) {
      setError(e.message || 'Failed to book appointment');
    } finally {
      setBookingId(null);
    }
  };

  const handleViewProfile = doctor => {
    const targetFacilityId = doctor.facility?.id || doctor.facilityId;
    if (targetFacilityId) {
      nav.navigate('ProviderDetail', {
        id: targetFacilityId,
        preview: doctor.facility || null,
      });
    } else {
      book(doctor);
    }
  };

  const toggleFavorite = doctorId => {
    setFavorites(prev => ({
      ...prev,
      [doctorId]: !prev[doctorId],
    }));
  };

  const availableSpecialties = useMemo(() => {
    const set = new Set();
    rows.forEach(d => {
      const spec = d.specialization || d.specialty;
      if (spec && typeof spec === 'string') {
        set.add(spec.trim());
      }
    });

    const list = Array.from(set);
    const defaults = [
      'General Physician',
      'Dermatologist',
      'Cardiologist',
      'Pediatrician',
      'Gynecologist',
      'Orthopedic',
      'Neurologist',
    ];

    const combined = Array.from(new Set([...list, ...defaults]));
    return ['All', ...combined];
  }, [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter(doctor => {
      const spec = doctor.specialization || doctor.specialty || '';
      const name = doctor.name || '';
      const facility = doctor.facility?.name || doctor.facilityName || '';

      const matchesSpecialty =
        selectedSpecialty === 'All' ||
        spec.toLowerCase() === selectedSpecialty.toLowerCase();

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        name.toLowerCase().includes(q) ||
        spec.toLowerCase().includes(q) ||
        facility.toLowerCase().includes(q);

      return matchesSpecialty && matchesSearch;
    });
  }, [rows, selectedSpecialty, searchQuery]);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <FlatList
        data={loading ? [] : filteredRows}
        keyExtractor={(item, idx) => `${item.id || idx}-${item.facility?.id || idx}`}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerWrapper}>
            <View style={styles.headerTopRow}>
              <View style={styles.headerTextGroup}>
                <Text style={styles.headerTitle}>Doctors</Text>
                <Text style={styles.headerSubtitle}>
                  Find the right doctor for a healthier you
                </Text>
              </View>

              <Pressable
                style={styles.locationPill}
                onPress={() => nav.navigate('LocationPicker')}
                accessibilityRole="button">
                <Text style={styles.locationPinHeader}>📍</Text>
                <Text style={styles.locationNameHeader} numberOfLines={1}>
                  {userLocation}
                </Text>
                <Text style={styles.chevronDown}>∨</Text>
              </Pressable>
            </View>

            <View style={styles.searchRow}>
              <View style={styles.searchBar}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search doctors by name, specialty, or problem..."
                  placeholderTextColor={colors.textSoft}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCorrect={false}
                />
                {searchQuery.length > 0 && (
                  <Pressable
                    onPress={() => setSearchQuery('')}
                    hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                    <Text style={styles.clearIcon}>✕</Text>
                  </Pressable>
                )}
              </View>

              <Pressable
                style={styles.filterBtn}
                onPress={() => {
                  if (selectedSpecialty !== 'All' || searchQuery !== '') {
                    setSelectedSpecialty('All');
                    setSearchQuery('');
                  }
                }}
                accessibilityRole="button">
                <Text style={styles.filterIcon}>🎛️</Text>
              </Pressable>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsScrollContainer}
              style={styles.chipsScrollView}>
              {availableSpecialties.map(specialty => {
                const isSelected = selectedSpecialty === specialty;
                const icon = SPECIALTY_ICONS[specialty] || '🩺';

                return (
                  <Pressable
                    key={specialty}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() => setSelectedSpecialty(specialty)}>
                    <Text
                      style={[
                        styles.chipIcon,
                        isSelected && styles.chipIconSelected,
                      ]}>
                      {icon}
                    </Text>
                    <Text
                      style={[
                        styles.chipText,
                        isSelected && styles.chipTextSelected,
                      ]}>
                      {specialty}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={styles.promoBanner}>
              <View style={styles.promoTextContainer}>
                <Text style={styles.promoTitle}>Expert Doctors Closer to You</Text>
                <Text style={styles.promoSub}>
                  Quality care. Trusted professionals.{'\n'}Better tomorrows.
                </Text>
              </View>

              <View style={styles.promoGraphicBox}>
                <View style={styles.promoCircleBg}>
                  <Text style={styles.promoEmblemIcon}>💚</Text>
                  <Text style={styles.promoEmblemTag}>Your Health{'\n'}Our Priority</Text>
                </View>
              </View>
            </View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Available Doctors Nearby</Text>
              <Pressable
                onPress={() => {
                  setSelectedSpecialty('All');
                  setSearchQuery('');
                }}>
                <Text style={styles.seeAllText}>See All ›</Text>
              </Pressable>
            </View>

            {loading && <LoadingSkeleton />}

            {!loading && error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>{error}</Text>
                <Pressable style={styles.retryBtn} onPress={load}>
                  <Text style={styles.retryText}>Try Again</Text>
                </Pressable>
              </View>
            ) : null}

            {!loading && !error && filteredRows.length === 0 && (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconWrap}>
                  <Text style={styles.emptyIcon}>🩺</Text>
                </View>
                <Text style={styles.emptyTitle}>
                  {i18n.services('emptyDoctors') || 'No doctors found'}
                </Text>
                <Text style={styles.emptyBody}>
                  {searchQuery || selectedSpecialty !== 'All'
                    ? 'No doctors match your current search or specialty filter. Try clearing filters or searching for something else.'
                    : 'No doctors are currently available in your selected location.'}
                </Text>
                {(searchQuery !== '' || selectedSpecialty !== 'All') && (
                  <Pressable
                    style={styles.resetFilterBtn}
                    onPress={() => {
                      setSearchQuery('');
                      setSelectedSpecialty('All');
                    }}>
                    <Text style={styles.resetFilterText}>Clear Filters</Text>
                  </Pressable>
                )}
              </View>
            )}
          </View>
        }
        renderItem={({item}) => (
          <DoctorCard
            doctor={item}
            isFavorite={!!favorites[item.id]}
            onToggleFavorite={() => toggleFavorite(item.id)}
            onViewProfile={() => handleViewProfile(item)}
            onBook={() => book(item)}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  listContainer: {
    paddingHorizontal: space.md,
    paddingBottom: space.xl,
    gap: space.md,
  },
  headerWrapper: {
    paddingTop: space.sm,
    gap: space.md,
  },

  // Header Title & Location
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: space.sm,
  },
  headerTextGroup: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textMuted,
    marginTop: 2,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    gap: 4,
    maxWidth: 150,
  },
  locationPinHeader: {
    fontSize: 13,
  },
  locationNameHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
    flexShrink: 1,
  },
  chevronDown: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primaryDark,
  },

  // Search Bar
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    fontSize: 15,
    marginRight: space.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    paddingVertical: 0,
  },
  clearIcon: {
    fontSize: 14,
    color: colors.textSoft,
    fontWeight: '700',
    paddingLeft: 4,
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterIcon: {
    fontSize: 18,
  },

  // Chips
  chipsScrollView: {
    marginHorizontal: -space.md,
  },
  chipsScrollContainer: {
    paddingHorizontal: space.md,
    gap: space.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.pill,
    gap: 6,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipIcon: {
    fontSize: 13,
    color: colors.textMuted,
  },
  chipIconSelected: {
    color: '#FFFFFF',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Banner
  promoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E3F4EC',
    borderRadius: radius.lg,
    paddingHorizontal: space.md,
    paddingVertical: space.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.primaryMid,
  },
  promoTextContainer: {
    flex: 1,
    paddingRight: space.sm,
  },
  promoTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.primaryDark,
    marginBottom: 4,
  },
  promoSub: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textMuted,
    lineHeight: 17,
  },
  promoGraphicBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoCircleBg: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    borderWidth: 1,
    borderColor: colors.primaryMid,
  },
  promoEmblemIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  promoEmblemTag: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.primaryDark,
    textAlign: 'center',
    lineHeight: 11,
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: space.xs,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  // Doctor Card
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  avatarContainer: {
    width: 72,
    height: 76,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  avatarInitial: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
  },
  statusDot: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  statusDotAvailable: {
    backgroundColor: '#2E7D32',
  },
  statusDotOffline: {
    backgroundColor: '#9E9E9E',
  },
  favoriteBtn: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  favoriteIcon: {
    fontSize: 13,
    color: colors.textSoft,
  },
  favoriteIconActive: {
    color: colors.danger,
  },
  cardCenterInfo: {
    flex: 1,
    paddingRight: 6,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  doctorName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    flexShrink: 1,
  },
  verifiedBadge: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedCheck: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  specializationText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 2,
  },
  qualificationText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSoft,
    marginBottom: 2,
  },
  facilityText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 1,
  },
  locationPinIcon: {
    fontSize: 10,
  },
  locationText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSoft,
  },
  cardRightCol: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minHeight: 76,
  },
  availabilityPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  availabilityPillActive: {
    backgroundColor: colors.primarySoft,
  },
  availabilityPillMuted: {
    backgroundColor: '#F0F4F2',
  },
  availabilityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  availabilityTextActive: {
    color: colors.primaryDark,
  },
  availabilityTextMuted: {
    color: colors.textMuted,
  },
  feeContainer: {
    alignItems: 'flex-end',
  },
  feeAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  feeLabel: {
    fontSize: 9,
    fontWeight: '500',
    color: colors.textSoft,
  },

  // Meta Row
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAF8',
    marginTop: space.sm,
    paddingHorizontal: space.sm,
    paddingVertical: 8,
    borderRadius: radius.sm,
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starIcon: {
    fontSize: 12,
    color: '#F5A623',
  },
  metaIcon: {
    fontSize: 11,
  },
  metaValueText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  metaDivider: {
    width: 1,
    height: 12,
    backgroundColor: colors.border,
  },

  // Bottom Action Buttons
  actionRow: {
    flexDirection: 'row',
    gap: space.sm,
    marginTop: space.md,
  },
  viewProfileBtn: {
    flex: 1,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewProfileText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  bookBtn: {
    flex: 1.3,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  bookBtnIcon: {
    fontSize: 13,
  },
  bookBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Skeleton
  skeletonList: {
    gap: space.sm,
    marginTop: space.xs,
  },
  skeletonCard: {
    opacity: 0.6,
  },
  skeletonHeader: {
    flexDirection: 'row',
    gap: space.sm,
  },
  skeletonAvatar: {
    width: 72,
    height: 76,
    borderRadius: radius.md,
    backgroundColor: colors.border,
  },
  skeletonContent: {
    flex: 1,
    gap: 8,
    justifyContent: 'center',
  },
  skeletonLineLong: {
    height: 14,
    backgroundColor: colors.border,
    borderRadius: 4,
    width: '70%',
  },
  skeletonLineShort: {
    height: 12,
    backgroundColor: colors.border,
    borderRadius: 4,
    width: '40%',
  },
  skeletonLineMedium: {
    height: 12,
    backgroundColor: colors.border,
    borderRadius: 4,
    width: '55%',
  },
  skeletonBtnRow: {
    flexDirection: 'row',
    gap: space.sm,
    marginTop: space.md,
  },
  skeletonBtn: {
    flex: 1,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.border,
  },

  // Empty & Error
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space.xl,
    paddingHorizontal: space.md,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.sm,
  },
  emptyIcon: {
    fontSize: 32,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  emptyBody: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
    marginBottom: space.md,
  },
  resetFilterBtn: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.primaryMid,
  },
  resetFilterText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  errorContainer: {
    alignItems: 'center',
    padding: space.md,
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.md,
    marginVertical: space.sm,
  },
  errorIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  errorText: {
    fontSize: 13,
    color: colors.danger,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: space.sm,
  },
  retryBtn: {
    backgroundColor: colors.danger,
    paddingHorizontal: space.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
});
