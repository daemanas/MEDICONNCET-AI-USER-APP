import React from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';
import {colors, shadow} from '../constants/theme';
import {i18n} from '../i18n';

export function AiFab({onPress}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={i18n.ai('title')}
      style={({pressed}) => [styles.fab, shadow, pressed && {transform: [{scale: 0.96}]}]}>
      <Text style={styles.plus}>AI</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 18,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  plus: {color: '#fff', fontWeight: '800', fontSize: 16},
});
