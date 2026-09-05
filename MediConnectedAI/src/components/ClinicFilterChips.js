import React from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {colors, radius} from '../constants/theme';

const CATEGORIES = [
  {id: 'All', label: 'All', icon: '🏥'},
  {id: 'General Clinic', label: 'General Clinic', icon: '🩺'},
  {id: 'Dental', label: 'Dental', icon: '🦷'},
  {id: 'Eye Care', label: 'Eye Care', icon: '👁️'},
  {id: 'Skin & Hair', label: 'Skin & Hair', icon: '💇'},
  {id: 'Child Care', label: 'Child Care', icon: '👶'},
];

export function ClinicFilterChips({selectedCategory, onSelectCategory}) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {CATEGORIES.map(cat => {
          const isSelected = selectedCategory === cat.id;
          return (
            <Pressable
              key={cat.id}
              onPress={() => onSelectCategory(cat.id)}
              style={({pressed}) => [
                styles.chip,
                isSelected ? styles.chipSelected : styles.chipUnselected,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityState={{selected: isSelected}}>
              <Text style={[styles.chipIcon, isSelected && styles.chipIconSelected]}>
                {cat.icon}
              </Text>
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                {cat.label}
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
    marginVertical: 4,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.pill,
    gap: 6,
    borderWidth: 1.5,
  },
  chipUnselected: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
  },
  pressed: {
    opacity: 0.85,
  },
  chipIcon: {
    fontSize: 14,
  },
  chipIconSelected: {
    color: '#FFFFFF',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
});
