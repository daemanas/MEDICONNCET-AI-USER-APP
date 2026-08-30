import React from 'react';
import {ActivityIndicator, Pressable, StyleSheet, Text, View} from 'react-native';
import {colors, radius, space, type} from '../constants/theme';
import {i18n} from '../i18n';

export function ScreenState({loading, error, empty, emptyText, onRetry, children}) {
  if (loading) {
    return (
      <View style={styles.center} accessibilityLabel={i18n.t('loading')}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[type.muted, styles.mt]}>{i18n.t('loading')}</Text>
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={[type.body, styles.centerText]}>{String(error)}</Text>
        {onRetry ? (
          <Pressable onPress={onRetry} style={styles.btn} accessibilityRole="button">
            <Text style={styles.btnText}>{i18n.t('retry')}</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }
  if (empty) {
    return (
      <View style={styles.center}>
        <Text style={[type.body, styles.centerText]}>{emptyText || i18n.t('emptyGeneric')}</Text>
        {onRetry ? (
          <Pressable onPress={onRetry} style={styles.btn} accessibilityRole="button">
            <Text style={styles.btnText}>{i18n.t('retry')}</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }
  return children;
}

const styles = StyleSheet.create({
  center: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.lg},
  centerText: {textAlign: 'center'},
  mt: {marginTop: space.sm},
  btn: {
    marginTop: space.md,
    backgroundColor: colors.primary,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    borderRadius: radius.pill,
    minHeight: 48,
    justifyContent: 'center',
  },
  btnText: {color: '#fff', fontWeight: '700', fontSize: 15},
});
