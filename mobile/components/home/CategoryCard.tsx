// ============================================================
// Kayda Sathi — CategoryCard Component
// ============================================================

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '@/constants';

interface CategoryCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  bgColor: string;
  onPress: () => void;
  horizontal?: boolean;
}

export function CategoryCard({ icon, label, color, bgColor, onPress, horizontal = false }: CategoryCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        horizontal && styles.cardHorizontal,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: bgColor }, horizontal && styles.iconContainerHorizontal]}>
        <Ionicons name={icon} size={horizontal ? 18 : 22} color={color} />
      </View>
      <Text style={[styles.label, horizontal && styles.labelHorizontal]} numberOfLines={2}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '30%',
    alignItems: 'center',
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.neutral[100],
    ...Shadow.sm,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
    borderColor: Colors.primary[200],
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.neutral[700],
    textAlign: 'center',
    lineHeight: 15,
  },
  cardHorizontal: {
    width: 124,
    marginRight: Spacing.sm,
    marginBottom: Spacing.xs,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  iconContainerHorizontal: {
    width: 40,
    height: 40,
    marginBottom: 6,
  },
  labelHorizontal: {
    fontSize: 11,
    lineHeight: 14,
  },
});
