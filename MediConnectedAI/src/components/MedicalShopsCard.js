import React, {useState} from 'react';
import {Alert, Image, Linking, Pressable, Text, View, StyleSheet} from 'react-native';
import {colors, radius, shadow} from '../constants/theme';
import {formatDistance} from '../utils/format';
import {confirmCall} from './confirmCall';

export function MedicalShopsCard({item, onViewDetails, onOrderMedicines, isFavorite, onToggleFavorite}) {
  const [fav, setFav] = useState(isFavorite || false);

  const handleFavPress = () => {
    const next = !fav;
    setFav(next);
    if (onToggleFavorite) onToggleFavorite(item.id, next);
  };

  const phone = item.contactNumber || item.phone;
  const dist = formatDistance(item.distanceKm);
  const badgeText = item.subType || 'Pharmacy';
  const openLabel = item.open === false ? 'Closed' : item.open ? 'Open Now' : 'Closed';
  const closesText = item.closesAt && item.open !== false ? 'Closes ' + item.closesAt : null;
  const tags = item.categories || item.facilities || [];
  
  return (
    <View style={[styles.card, shadow]}>
      <View style={styles.topRow}>
        <View style={styles.imageContainer}>
          {item.imageUrl || item.image ? (
            <Image source={{uri: item.imageUrl || item.image}} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.imagePlaceholder}><Text style={styles.placeholderIcon}>🏥</Text></View>
          )}
          <Pressable onPress={handleFavPress} style={styles.favButton}>
            <Text style={styles.favIcon}>{fav ? '❤️' : '🤍'}</Text>
          </Pressable>
          <View style={styles.imageBadge}><Text style={styles.imageBadgeText} numberOfLines={1}>{badgeText}</Text></View>
        </View>

        <View style={styles.bodyContainer}>
          <View style={styles.titleRow}>
            <View style={styles.titleTextWrap}>
              <View style={styles.nameRow}>
                <Text style={styles.nameText} numberOfLines={1}>{item.name}</Text>
                {(item.isVerified || item.verified) && <View style={styles.verifiedBadge}><Text style={styles.verifiedIcon}>✓</Text></View>}
              </View>
            </View>
            {phone ? (
              <Pressable onPress={() => confirmCall(phone)} style={styles.callButton}>
                <Text style={styles.callIcon}>📞</Text>
              </Pressable>
            ) : null}
          </View>

          <View style={styles.locationRow}>
            <Text style={styles.locIcon}>📍</Text>
            <Text style={styles.locationText} numberOfLines={1}>{item.address || [item.city, item.district].filter(Boolean).join(', ') || 'Area'}</Text>
          </View>
          
          <View style={styles.statusRow}>
            {dist ? <View style={styles.chip}><Text style={styles.chipText}>🕒 {dist}</Text></View> : null}
            <View style={[styles.statusChip, item.open === false ? styles.statusClosed : styles.statusOpen]}>
              <View style={[styles.statusDot, item.open === false ? styles.dotClosed : styles.dotOpen]} />
              <Text style={[styles.statusText, item.open === false ? styles.textClosed : styles.textOpen]}>{openLabel}</Text>
            </View>
            {closesText ? <Text style={styles.closesText}>{closesText}</Text> : null}
          </View>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <Pressable onPress={onViewDetails} style={styles.detailsButton}>
          <Text style={styles.detailsText}>View Details</Text>
        </Pressable>
        <Pressable onPress={onOrderMedicines} style={styles.orderButton}>
          <Text style={styles.orderText}>Order Now</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {backgroundColor: colors.bg, borderRadius: radius.md, padding: 12, margin: 8},
  topRow: {flexDirection: 'row', gap: 12},
  imageContainer: {width: 80, height: 80, borderRadius: radius.md, overflow: 'hidden'},
  image: {width: '100%', height: '100%'},
  imagePlaceholder: {width: '100%', height: '100%', backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center'},
  placeholderIcon: {fontSize: 30},
  favButton: {position: 'absolute', top: 4, right: 4, zIndex: 1},
  favIcon: {fontSize: 16},
  imageBadge: {position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.primary, paddingHorizontal: 4, paddingVertical: 2},
  imageBadgeText: {color: '#FFF', fontSize: 10, textAlign: 'center'},
  bodyContainer: {flex: 1},
  titleRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start'},
  titleTextWrap: {flex: 1},
  nameRow: {flexDirection: 'row', alignItems: 'center', gap: 4},
  nameText: {fontSize: 14, fontWeight: '700'},
  verifiedBadge: {paddingHorizontal: 2},
  verifiedIcon: {fontSize: 12, color: colors.success},
  callButton: {backgroundColor: colors.primarySoft, padding: 8, borderRadius: 20},
  callIcon: {fontSize: 14},
  locationRow: {flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4},
  locIcon: {fontSize: 12},
  locationText: {fontSize: 12, color: colors.textSoft},
  statusRow: {flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4},
  chip: {backgroundColor: colors.primarySoft, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4},
  chipText: {fontSize: 10, fontWeight: '600', color: colors.textSoft},
  statusChip: {flexDirection: 'row', alignItems: 'center', gap: 4},
  statusDot: {width: 6, height: 6, borderRadius: 3},
  statusOpen: {color: colors.success},
  dotOpen: {backgroundColor: colors.success},
  textOpen: {color: colors.success, fontSize: 11, fontWeight: '600'},
  statusClosed: {color: colors.danger},
  dotClosed: {backgroundColor: colors.danger},
  textClosed: {color: colors.danger, fontSize: 11, fontWeight: '600'},
  closesText: {fontSize: 11, color: colors.textSoft, marginLeft: 4},
  actionsRow: {flexDirection: 'row', gap: 10, marginTop: 12},
  detailsButton: {flex: 1, borderWidth: 1, borderColor: colors.primary, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', paddingVertical: 8},
  detailsText: {fontSize: 13, fontWeight: '700', color: colors.primary},
  orderButton: {flex: 1, backgroundColor: colors.primary, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', paddingVertical: 8},
  orderText: {fontSize: 13, fontWeight: '700', color: '#FFF'},
});

