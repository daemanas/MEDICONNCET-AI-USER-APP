import React, {useState} from 'react';
import {Alert, Image, Linking, Pressable, Text, View} from 'react-native';
import {shadow} from '../constants/theme';
import {TYPE_LABEL} from '../constants/facilityTypes';
import {formatDistance} from '../utils/format';
import {confirmCall} from './confirmCall';
import {styles} from './HospitalCard.styles';

export function HospitalCard({item, onViewDetails, isFavorite, onToggleFavorite}) {
  const [fav, setFav] = useState(isFavorite || false);

  const handleFavPress = () => {
    const next = !fav;
    setFav(next);
    if (onToggleFavorite) onToggleFavorite(item.id, next);
  };

  const handleDirections = () => {
    let url = item.lat && item.lng
      ? `https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}`
      : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent([item.name, item.address, item.city, item.district].filter(Boolean).join(', '))}`;
    Linking.openURL(url).catch(() => Alert.alert('Directions', 'Unable to open maps application.'));
  };

  const phone = item.contactNumber || item.phone;
  const dist = formatDistance(item.distanceKm);
  const badgeText = item.subType || (item.type === 'HOSPITAL' ? 'Multi-Speciality' : TYPE_LABEL[item.type] || item.type);
  const openLabel = item.open === false ? 'Closed' : item.open ? 'Open Now' : null;
  const closesText = item.closesAt ? `Closes ${item.closesAt}` : null;
  const tags = item.facilities || (item.emergencyAvailable ? ['24x7 Emergency'] : []);
  const hasRating = typeof item.rating === 'number';

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
          {badgeText ? (
            <View style={styles.imageBadge}>
              <Text style={styles.imageBadgeText} numberOfLines={1}>{badgeText}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.bodyContainer}>
          <View style={styles.titleRow}>
            <View style={styles.titleTextWrap}>
              <View style={styles.nameVerifiedRow}>
                <Text style={styles.nameText} numberOfLines={1}>{item.name}</Text>
                {(item.isVerified || item.verified) && (
                  <View style={styles.verifiedBadge}><Text style={styles.verifiedIcon}>✓</Text></View>
                )}
              </View>
              <Text style={styles.subTypeText} numberOfLines={1}>
                {badgeText} {item.type && badgeText !== TYPE_LABEL[item.type] ? `· ${TYPE_LABEL[item.type] || item.type}` : ''}
              </Text>
            </View>
            {phone ? (
              <Pressable onPress={() => confirmCall(phone)} style={styles.callButton}>
                <Text style={styles.callIcon}>📞</Text>
              </Pressable>
            ) : null}
          </View>

          <View style={styles.locationRow}>
            <Text style={styles.locIcon}>📍</Text>
            <Text style={styles.locationText} numberOfLines={1}>
              {item.address || [item.city, item.district].filter(Boolean).join(', ') || 'Nearby'}
            </Text>
          </View>

          <View style={styles.statusRow}>
            {dist ? <View style={styles.metaChip}><Text style={styles.metaChipText}>🕒 {dist}</Text></View> : null}
            {openLabel ? (
              <View style={[styles.statusChip, item.open === false ? styles.statusClosed : styles.statusOpen]}>
                <View style={[styles.statusDot, item.open === false ? styles.dotClosed : styles.dotOpen]} />
                <Text style={[styles.statusText, item.open === false ? styles.textClosed : styles.textOpen]}>{openLabel}</Text>
              </View>
            ) : null}
            {closesText && item.open !== false ? <Text style={styles.closesText} numberOfLines={1}>{closesText}</Text> : null}
          </View>

          {hasRating ? (
            <View style={styles.ratingRow}>
              <Text style={styles.starIcon}>⭐</Text>
              <Text style={styles.ratingValue}>{item.rating.toFixed(1)}</Text>
              {(item.reviewsCount || item.ratingCount) ? (
                <Text style={styles.reviewsText}>({item.reviewsCount || item.ratingCount} reviews)</Text>
              ) : null}
            </View>
          ) : null}

          {tags.length > 0 ? (
            <View style={styles.tagsRow}>
              {tags.slice(0, 4).map((t, idx) => (
                <View key={idx} style={styles.tagChip}><Text style={styles.tagText}>{t}</Text></View>
              ))}
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.actionsRow}>
        <Pressable onPress={onViewDetails} style={styles.detailsButton}>
          <Text style={styles.detailsIcon}>ⓘ</Text>
          <Text style={styles.detailsText}>View Details</Text>
        </Pressable>
        <Pressable onPress={handleDirections} style={styles.directionsButton}>
          <Text style={styles.directionsIcon}>✈</Text>
          <Text style={styles.directionsText}>Get Directions</Text>
        </Pressable>
      </View>
    </View>
  );
}
