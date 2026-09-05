import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {colors, radius, space} from '../constants/theme';

export function ClinicEmptyState({onReset, onLocationPress}) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Text style={styles.icon}>🩺</Text>
      </View>
      <Text style={styles.title}>No clinics found nearby</Text>
      <Text style={styles.subtitle}>
        Try changing your location or search filters.
      </Text>

      <View style={styles.buttonRow}>
        {onReset ? (
          <Pressable onPress={onReset} style={styles.resetBtn} accessibilityRole="button">
            <Text style={styles.resetBtnText}>Clear Filters</Text>
          </Pressable>
        ) : null}
        {onLocationPress ? (
          <Pressable onPress={onLocationPress} style={styles.locBtn} accessibilityRole="button">
            <Text style={styles.locBtnText}>Change Location</Text>
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
    marginTop: 20,
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
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: space.lg,
  },
  resetBtn: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.pill,
  },
  resetBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  locBtn: {
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.pill,
  },
  locBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
