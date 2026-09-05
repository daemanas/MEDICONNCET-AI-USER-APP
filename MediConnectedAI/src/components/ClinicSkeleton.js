import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet, View} from 'react-native';
import {colors, radius, space} from '../constants/theme';

export function ClinicSkeleton() {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <View style={styles.container}>
      {[1, 2, 3].map(i => (
        <View key={i} style={styles.card}>
          <View style={styles.topRow}>
            <Animated.View style={[styles.image, {opacity}]} />
            <View style={styles.body}>
              <Animated.View style={[styles.title, {opacity}]} />
              <Animated.View style={[styles.sub, {opacity}]} />
              <Animated.View style={[styles.loc, {opacity}]} />
              <Animated.View style={[styles.chipRow, {opacity}]} />
            </View>
          </View>
          <View style={styles.actions}>
            <Animated.View style={[styles.btn, {opacity}]} />
            <Animated.View style={[styles.btn, {opacity}]} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: space.md,
    paddingTop: space.sm,
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
  image: {
    width: 110,
    height: 115,
    borderRadius: radius.md,
    backgroundColor: '#E0E8E4',
  },
  body: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    height: 16,
    width: '75%',
    backgroundColor: '#E0E8E4',
    borderRadius: 4,
  },
  sub: {
    height: 12,
    width: '50%',
    backgroundColor: '#E0E8E4',
    borderRadius: 4,
    marginTop: 6,
  },
  loc: {
    height: 12,
    width: '85%',
    backgroundColor: '#E0E8E4',
    borderRadius: 4,
    marginTop: 8,
  },
  chipRow: {
    height: 16,
    width: '60%',
    backgroundColor: '#E0E8E4',
    borderRadius: radius.pill,
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F4F2',
  },
  btn: {
    flex: 1,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: '#E0E8E4',
  },
});
