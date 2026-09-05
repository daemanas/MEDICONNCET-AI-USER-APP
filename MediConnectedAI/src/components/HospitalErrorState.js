import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {colors, radius, space} from '../constants/theme';

export function HospitalErrorState({error, onRetry}) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Text style={styles.icon}>⚠️</Text>
      </View>
      <Text style={styles.title}>Unable to load hospitals</Text>
      <Text style={styles.subtitle}>
        {error || 'Failed to retrieve hospital listings from the server. Please check your network connection.'}
      </Text>
      {onRetry ? (
        <Pressable onPress={onRetry} style={styles.retryBtn} accessibilityRole="button">
          <Text style={styles.retryText}>Try Again</Text>
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
    marginTop: space.xxl,
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
  retryBtn: {
    backgroundColor: colors.primaryDark,
    paddingHorizontal: space.xl,
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
});
