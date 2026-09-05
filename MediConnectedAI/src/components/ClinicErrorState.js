import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {colors, radius, space} from '../constants/theme';

export function ClinicErrorState({error, onRetry}) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Text style={styles.icon}>⚠️</Text>
      </View>
      <Text style={styles.title}>Unable to load clinics</Text>
      <Text style={styles.subtitle}>{error || 'Something went wrong while connecting to server.'}</Text>
      {onRetry ? (
        <Pressable onPress={onRetry} style={styles.retryBtn} accessibilityRole="button">
          <Text style={styles.retryBtnText}>Retry</Text>
        </Pressable>
      ) : null}
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
    backgroundColor: colors.dangerSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.md,
  },
  icon: {
    fontSize: 36,
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
  retryBtn: {
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: radius.pill,
    marginTop: space.lg,
  },
  retryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
