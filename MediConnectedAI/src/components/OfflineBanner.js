import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {colors, space, type} from '../constants/theme';
import {i18n} from '../i18n';
import {useNetwork} from '../store/NetworkContext';

export function OfflineBanner({lastSyncAt}) {
  const {online} = useNetwork();
  if (online && !lastSyncAt) {
    return null;
  }
  if (online) {
    return null;
  }
  return (
    <View style={styles.bar} accessibilityLiveRegion="polite">
      <Text style={styles.text}>
        {i18n.t('offlineBanner')}
        {lastSyncAt ? `\n${i18n.t('offlineResults')} ${new Date(lastSyncAt).toLocaleString()}` : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.offlineBg,
    padding: space.sm,
    borderRadius: 12,
    marginBottom: space.sm,
  },
  text: {...type.small, color: colors.offline},
});
