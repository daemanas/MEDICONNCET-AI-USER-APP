import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {colors, radius, shadow, space, type} from '../constants/theme';
import {TYPE_LABEL} from '../constants/facilityTypes';
import {formatDistance} from '../utils/format';
import {i18n} from '../i18n';

export function ProviderCard({item, onPress}) {
  const dist = formatDistance(item.distanceKm);
  const openLabel =
    item.emergencyAvailable ? i18n.t('emergency24') : item.open === false ? i18n.t('closed') : item.open ? i18n.t('open') : null;
  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [styles.card, shadow, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={item.name}>
      <View style={styles.icon}>
        <Text style={styles.iconText}>{(item.name || '?').slice(0, 1).toUpperCase()}</Text>
      </View>
      <View style={styles.body}>
        <Text style={type.h3} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={type.muted} numberOfLines={1}>
          {TYPE_LABEL[item.type] || item.type}
          {item.city ? ` · ${item.city}` : ''}
        </Text>
        <View style={styles.row}>
          {dist ? <Text style={styles.chip}>{dist}</Text> : null}
          {openLabel ? (
            <Text style={[styles.chip, item.open === false ? styles.closed : styles.open]}>{openLabel}</Text>
          ) : null}
          {item.closesAt && item.open ? <Text style={styles.chip}>Closes {item.closesAt}</Text> : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.md,
    marginBottom: space.sm,
    alignItems: 'center',
    gap: space.sm,
  },
  pressed: {opacity: 0.85},
  icon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {color: colors.primary, fontWeight: '800', fontSize: 18},
  body: {flex: 1},
  row: {flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6},
  chip: {
    backgroundColor: colors.bg,
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  open: {backgroundColor: colors.primarySoft, color: colors.primaryDark},
  closed: {backgroundColor: colors.dangerSoft, color: colors.danger},
});
