import React from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {colors, radius, space} from '../constants/theme';

const FILTERS = [
  {id: 'All', label: 'All', icon: '🏢'},
  {id: 'Hospitals', label: 'Hospitals', icon: '🏥'},
  {id: 'Nursing Homes', label: 'Nursing Homes', icon: '🏠'},
  {id: '24x7 Emergency', label: '24x7 Emergency', icon: '🚨'},
  {id: 'Multi-Speciality', label: 'Multi-Speciality', icon: '⭐'},
];

export function HospitalFilterChips({selected, onSelect}) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {FILTERS.map(f => {
          const active = selected === f.id;
          return (
            <Pressable
              key={f.id}
              onPress={() => onSelect(f.id)}
              style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
              accessibilityRole="button"
              accessibilityState={{selected: active}}>
              <Text style={[styles.icon, active && styles.iconActive]}>{f.icon}</Text>
              <Text style={[styles.label, active ? styles.labelActive : styles.labelInactive]}>
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: space.sm,
  },
  scrollContent: {
    paddingHorizontal: space.md,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.pill,
    gap: 6,
  },
  chipInactive: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primaryDark,
    borderWidth: 0,
  },
  icon: {
    fontSize: 14,
  },
  iconActive: {
    color: '#FFFFFF',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
  },
  labelInactive: {
    color: colors.text,
  },
  labelActive: {
    color: '#FFFFFF',
  },
});
