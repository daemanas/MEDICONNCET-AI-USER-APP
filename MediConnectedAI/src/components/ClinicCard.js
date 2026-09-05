import React, {useState} from 'react';
import {Image, Pressable, Text, View} from 'react-native';
import {shadow} from '../constants/theme';
import {TYPE_LABEL} from '../constants/facilityTypes';
import {formatDistance} from '../utils/format';
import {confirmCall} from './confirmCall';
import {styles} from './ClinicCard.styles';

export function ClinicCard({item, onViewDetails, onBookAppointment, isFavorite, onToggleFavorite}) {
  const [fav, setFav] = useState(isFavorite || false);

  const handleFavPress = () => {
    const next = !fav;
    setFav(next);
    if (onToggleFavorite) onToggleFavorite(item.id, next);
  };

  const phone = item.contactNumber || item.phone;
  const dist = formatDistance(item.distanceKm);

  const categoryBadge = item.subType || item.specialty || (item.type ? TYPE_LABEL[item.type] || item.type : null);
  const openLabel = item.open === false ? 'Closed' : item.open === true ? 'Open Now' : null;
  const closesText = item.closesAt && item.open !== false ? `Closes ${item.closesAt}` : null;
  const hasRating = typeof item.rating === 'number' && item.rating > 0;
  const reviewsNum = item.reviewsCount || item.ratingCount;
  const tagSource = item.specialties || item.services || item.facilities;
  const tags = Array.isArray(tagSource) ? tagSource : typeof tagSource === 'string' ? [tagSource] : [];
  const addressLabel = item.address || [item.city, item.district].filter(Boolean).join(', ') || '';

  return (
    <View style={[styles.card, shadow]}>
      <View style={styles.topRow}>
        <View style={styles.imageContainer}>
          {item.imageUrl || item.image ? (
            <Image source={{uri: item.imageUrl || item.image}} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderIcon}>🩺</Text>
            </View>
          )}
          <Pressable onPress={handleFavPress} style={styles.favButton} accessibilityRole="button">
            <Text style={styles.favIcon}>{fav ? '❤️' : '🤍'}</Text>
          </Pressable>
          {categoryBadge ? (
            <View style={styles.imageBadge}>
              <Text style={styles.imageBadgeText} numberOfLines={1}>{categoryBadge}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.bodyContainer}>
          <View style={styles.headerRow}>
            <View style={styles.titleCol}>
              <View style={styles.nameVerifiedRow}>
                <Text style={styles.nameText} numberOfLines={1}>{item.name}</Text>
                {(item.isVerified || item.verified) && (
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedIcon}>✓</Text>
                  </View>
                )}
              </View>
              {categoryBadge ? (
                <Text style={styles.subTypeText} numberOfLines={1}>{categoryBadge}</Text>
              ) : null}
            </View>

            <View style={styles.rightMetaCol}>
              {dist ? (
                <View style={styles.distRow}>
                  <Text style={styles.distIcon}>🕒</Text>
                  <Text style={styles.distText}>{dist}</Text>
                </View>
              ) : null}
              {openLabel ? (
                <View style={[styles.statusChip, item.open === false ? styles.statusClosed : styles.statusOpen]}>
                  <View style={[styles.statusDot, item.open === false ? styles.dotClosed : styles.dotOpen]} />
                  <Text style={[styles.statusText, item.open === false ? styles.textClosed : styles.textOpen]}>
                    {openLabel}
                  </Text>
                </View>
              ) : null}
              {closesText ? (
                <Text style={styles.closesText} numberOfLines={1}>{closesText}</Text>
              ) : null}
              {phone ? (
                <Pressable onPress={() => confirmCall(phone)} style={styles.callButton} accessibilityRole="button">
                  <Text style={styles.callIcon}>📞</Text>
                </Pressable>
              ) : null}
            </View>
          </View>

          {addressLabel ? (
            <View style={styles.locationRow}>
              <Text style={styles.locIcon}>📍</Text>
              <Text style={styles.locationText} numberOfLines={1}>{addressLabel}</Text>
            </View>
          ) : null}

          {hasRating ? (
            <View style={styles.ratingRow}>
              <Text style={styles.starIcon}>⭐</Text>
              <Text style={styles.ratingValue}>{item.rating.toFixed(1)}</Text>
              {reviewsNum ? <Text style={styles.reviewsText}>({reviewsNum} reviews)</Text> : null}
            </View>
          ) : null}

          {tags.length > 0 ? (
            <View style={styles.tagsRow}>
              {tags.slice(0, 3).map((tag, idx) => (
                <View key={idx} style={styles.tagChip}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.actionsRow}>
        <Pressable onPress={onViewDetails} style={styles.detailsButton} accessibilityRole="button">
          <Text style={styles.detailsIcon}>ⓘ</Text>
          <Text style={styles.detailsText}>View Details</Text>
        </Pressable>
        <Pressable onPress={onBookAppointment} style={styles.bookButton} accessibilityRole="button">
          <Text style={styles.bookIcon}>📅</Text>
          <Text style={styles.bookText}>Book Appointment</Text>
        </Pressable>
      </View>
    </View>
  );
}
