import React from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';
import {colors, radius, space} from '../constants/theme';

export function PrimaryButton({title, onPress, disabled, tone = 'primary'}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({pressed}) => [
        styles.btn,
        tone === 'danger' && styles.danger,
        tone === 'ghost' && styles.ghost,
        pressed && {opacity: 0.85},
        disabled && {opacity: 0.5},
      ]}>
      <Text style={[styles.text, tone === 'ghost' && styles.ghostText]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: colors.primary,
    minHeight: 52,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.lg,
  },
  danger: {backgroundColor: colors.danger},
  ghost: {backgroundColor: colors.primarySoft},
  text: {color: '#fff', fontWeight: '700', fontSize: 16},
  ghostText: {color: colors.primaryDark},
});
