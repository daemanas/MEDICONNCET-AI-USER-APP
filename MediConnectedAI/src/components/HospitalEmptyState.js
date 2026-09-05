import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {colors, radius, space} from '../constants/theme';

export function HospitalEmptyState({onRetry, onLocationPress}) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Text style={styles.icon}>🏥</Text>
      </View>
      <Text style={styles.title}>No hospitals found nearby</Text>
      <Text style={styles.subtitle}>
        We couldn't find any hospitals or nursing homes matching your criteria in this location.
      </Text>
      <View style={styles.buttonRow}>
        {onRetry ? (
          <Pressable onPress={onRetry} style={styles.retryBtn} accessibilityRole="button">
            <Text style={styles.retryText}>Try Again</Text>
          </Pressable>
        ) : null}
        {onLocationPress ? (
          <Pressable onPress={onLocationPress} style={styles.locBtn} accessibilityRole="button">
            <Text style={styles.locText}>Change Location</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.xl,
    marginTop: space.xxl,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.md,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: space.lg,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  retryBtn: {
    backgroundColor: colors.primaryDark,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm + 2,
    borderRadius: radius.pill,
    minHeight: 46,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  locBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.primaryDark,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm + 2,
    borderRadius: radius.pill,
    minHeight: 46,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locText: {
    color: colors.primaryDark,
    fontWeight: '700',
    fontSize: 14,
  },
});
