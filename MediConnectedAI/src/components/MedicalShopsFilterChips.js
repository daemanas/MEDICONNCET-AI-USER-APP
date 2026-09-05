import React from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {colors, radius} from '../constants/theme';

const CATEGORIES = [
  {id: 'All', label: 'All', icon: '🏪'},
  {id: 'Pharmacy', label: 'Pharmacy', icon: '💊'},
  {id: '24×7 Open', label: '24×7 Open', icon: '⏰'},
  {id: 'Home Delivery', label: 'Home Delivery', icon: '🚚'},
  {id: 'Generic Medicine', label: 'Generic Medicine', icon: '🏷️'},
];

export function MedicalShopsFilterChips({selectedCategory, onSelectCategory}) {
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
              style={[
                styles.chip,
                isSelected ? styles.chipSelected : styles.chipUnselected,
              ]}>
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
  container: {marginVertical: 12},
  scrollContent: {paddingHorizontal: 16, gap: 8},
  chip: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border},
  chipUnselected: {backgroundColor: colors.surface},
  chipSelected: {backgroundColor: colors.success, borderColor: colors.success},
  chipText: {fontSize: 13, fontWeight: '700', color: colors.text},
  chipTextSelected: {color: '#FFFFFF'},
});
