import React, {useState} from 'react';
import {Image, Pressable, Text, View} from 'react-native';
import {shadow, colors} from '../constants/theme';
import {formatDistance} from '../utils/format';
import {confirmCall} from './confirmCall';
import {styles} from './DiagnosticCentreCard.styles';

export function DiagnosticCentreCard({item, onViewDetails, onBookAppointment}) {
  const [fav, setFav] = useState(false);
  const handleFavPress = () => setFav(!fav);

  const phone = item.contactNumber || item.phone;
  const dist = formatDistance(item.distanceKm);
  const openLabel = item.open === false ? 'Closed' : item.open === true ? 'Open Now' : null;
  const closesText = item.closesAt && item.open !== false ? `Closes ${item.closesAt}` : null;
  const hasRating = typeof item.rating === 'number' && item.rating > 0;
  const reviewsNum = item.reviewsCount || item.ratingCount;
  const tags = Array.isArray(item.services) ? item.services : [];
  const addressLabel = item.address || [item.city, item.district].filter(Boolean).join(', ') || '';

  return (
    <View style={[styles.card, shadow]}>
      <View style={styles.topRow}>
        <View style={styles.imageContainer}>
          {item.imageUrl ? (
            <Image source={{uri: item.imageUrl}} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.imagePlaceholder}><Text style={styles.placeholderIcon}>🏥</Text></View>
          )}
          <Pressable onPress={handleFavPress} style={styles.favButton}>
            <Text style={styles.favIcon}>{fav ? '❤️' : '🤍'}</Text>
          </Pressable>
        </View>

        <View style={styles.bodyContainer}>
          <View style={styles.headerRow}>
            <View style={styles.titleCol}>
              <View style={styles.nameVerifiedRow}>
                <Text style={styles.nameText} numberOfLines={1}>{item.name}</Text>
                {(item.isVerified || item.verified) && <View style={styles.verifiedBadge}><Text style={styles.verifiedIcon}>✓</Text></View>}
              </View>
              <Text style={styles.subTypeText} numberOfLines={1}>Diagnostic Centre</Text>
            </View>

            <View style={styles.rightMetaCol}>
              {dist ? <View style={styles.distRow}><Text style={styles.distText}>{dist}</Text></View> : null}
              {openLabel ? (
                <View style={[styles.statusChip, item.open === false ? styles.statusClosed : styles.statusOpen]}>
                  <View style={[styles.statusDot, item.open === false ? styles.dotClosed : styles.dotOpen]} />
                  <Text style={[styles.statusText, item.open === false ? styles.textClosed : styles.textOpen]}>{openLabel}</Text>
                </View>
              ) : null}
              {closesText ? <Text style={styles.closesText}>{closesText}</Text> : null}
              {phone ? (
                <Pressable onPress={() => confirmCall(phone)} style={styles.callButton}>
                  <Text style={styles.callIcon}>📞</Text>
                </Pressable>
              ) : null}
            </View>
          </View>

          {addressLabel ? (
            <View style={styles.locationRow}>
              <Text style={styles.locationText} numberOfLines={1}>📍 {addressLabel}</Text>
            </View>
          ) : null}

          {hasRating ? (
            <View style={styles.ratingRow}>
              <Text style={styles.ratingValue}>⭐ {item.rating.toFixed(1)} {reviewsNum ? `(${reviewsNum} reviews)` : ''}</Text>
            </View>
          ) : null}
        </View>
      </View>

      {tags.length > 0 ? (
        <View style={styles.tagsRow}>
          {tags.slice(0, 4).map((tag, idx) => (
            <View key={idx} style={styles.tagChip}><Text style={styles.tagText}>{tag}</Text></View>
          ))}
        </View>
      ) : null}

      <View style={styles.actionsRow}>
        <Pressable onPress={onViewDetails} style={styles.detailsButton}>
          <Text style={styles.detailsText}>View Details</Text>
        </Pressable>
        <Pressable onPress={onBookAppointment} style={styles.bookButton}>
          <Text style={styles.bookText}>Book a Test</Text>
        </Pressable>
      </View>
    </View>
  );
}
