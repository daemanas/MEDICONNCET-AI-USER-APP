import React from 'react';
import {StyleSheet, View} from 'react-native';
import {colors, radius, space} from '../constants/theme';

export function HospitalSkeleton() {
  return (
    <View style={styles.container}>
      {[1, 2, 3].map(key => (
        <View key={key} style={styles.card}>
          <View style={styles.topRow}>
            <View style={styles.imagePlaceholder} />
            <View style={styles.bodyPlaceholder}>
              <View style={styles.lineTitle} />
              <View style={styles.lineSub} />
              <View style={styles.lineLoc} />
              <View style={styles.rowChips}>
                <View style={styles.chipSmall} />
                <View style={styles.chipSmall} />
              </View>
            </View>
          </View>
          <View style={styles.actionsRow}>
            <View style={styles.btnPlaceholder} />
            <View style={styles.btnPlaceholder} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: space.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: space.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  topRow: {
    flexDirection: 'row',
    gap: 12,
  },
  imagePlaceholder: {
    width: 100,
    height: 105,
    borderRadius: radius.md,
    backgroundColor: '#E2EAF4',
  },
  bodyPlaceholder: {
    flex: 1,
    gap: 8,
  },
  lineTitle: {
    height: 16,
    width: '75%',
    backgroundColor: '#E2EAF4',
    borderRadius: 4,
  },
  lineSub: {
    height: 12,
    width: '50%',
    backgroundColor: '#E2EAF4',
    borderRadius: 4,
  },
  lineLoc: {
    height: 12,
    width: '85%',
    backgroundColor: '#E2EAF4',
    borderRadius: 4,
  },
  rowChips: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  chipSmall: {
    height: 20,
    width: 60,
    backgroundColor: '#E2EAF4',
    borderRadius: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F4F2',
  },
  btnPlaceholder: {
    flex: 1,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: '#E2EAF4',
  },
});
