import {Platform} from 'react-native';

export const colors = {
  bg: '#F4F8F6',
  surface: '#FFFFFF',
  text: '#1C2B24',
  textMuted: '#5C6F66',
  textSoft: '#7A8C84',
  primary: '#1F7A57',
  primaryDark: '#166348',
  primarySoft: '#E7F5EE',
  primaryMid: '#B7E0CB',
  accent: '#2E9E6B',
  gold: '#C4A35A',
  goldSoft: '#F6EEDC',
  danger: '#C0392B',
  dangerSoft: '#FDECEA',
  warning: '#B7791F',
  border: '#DCE8E1',
  shadow: 'rgba(28, 43, 36, 0.08)',
  overlay: 'rgba(16, 32, 26, 0.45)',
  offline: '#8A6D3B',
  offlineBg: '#FFF6E5',
};

export const space = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  xxl: 36,
};

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
};

export const type = {
  title: {fontSize: 26, fontWeight: '700', color: colors.text, letterSpacing: -0.3},
  h2: {fontSize: 20, fontWeight: '700', color: colors.text},
  h3: {fontSize: 16, fontWeight: '700', color: colors.text},
  body: {fontSize: 15, fontWeight: '400', color: colors.text, lineHeight: 22},
  muted: {fontSize: 13, fontWeight: '500', color: colors.textMuted},
  small: {fontSize: 12, fontWeight: '500', color: colors.textSoft},
};

export const hitSlop = {top: 10, bottom: 10, left: 10, right: 10};

export const shadow = Platform.select({
  ios: {
    shadowColor: '#10201A',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
  android: {elevation: 3},
});
