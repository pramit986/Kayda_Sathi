// ============================================================
// Kayda Sathi — IconBadge Component
// ============================================================

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius } from '@/constants';

interface IconBadgeProps {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
  size?: 'sm' | 'md' | 'lg';
}

const SIZES = {
  sm: { container: 32, icon: 16 },
  md: { container: 40, icon: 20 },
  lg: { container: 48, icon: 24 },
};

export function IconBadge({ icon, color, bgColor, size = 'md' }: IconBadgeProps) {
  const s = SIZES[size];
  return (
    <View
      style={[
        styles.container,
        {
          width: s.container,
          height: s.container,
          borderRadius: BorderRadius.md,
          backgroundColor: bgColor,
        },
      ]}
    >
      <Ionicons name={icon} size={s.icon} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
