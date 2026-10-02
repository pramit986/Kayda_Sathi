// ============================================================
// Kayda Sathi — StatusBadge Component
// ============================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius, FontSize, Spacing } from '@/constants';

export type BadgeVariant = 'active' | 'action_required' | 'resolved' | 'archived' | 'info' | 'warning' | 'success' | 'error';

interface StatusBadgeProps {
  label: string;
  variant: BadgeVariant;
  size?: 'sm' | 'md';
}

const VARIANT_STYLES: Record<BadgeVariant, { bg: string; text: string }> = {
  active: { bg: Colors.info[50], text: Colors.info[700] },
  action_required: { bg: Colors.warning[50], text: Colors.warning[700] },
  resolved: { bg: Colors.success[50], text: Colors.success[700] },
  archived: { bg: Colors.neutral[100], text: Colors.neutral[500] },
  info: { bg: Colors.info[50], text: Colors.info[700] },
  warning: { bg: Colors.warning[50], text: Colors.warning[700] },
  success: { bg: Colors.success[50], text: Colors.success[700] },
  error: { bg: Colors.error[50], text: Colors.error[700] },
};

export function StatusBadge({ label, variant, size = 'sm' }: StatusBadgeProps) {
  const style = VARIANT_STYLES[variant];
  return (
    <View style={[
      styles.badge,
      { backgroundColor: style.bg },
      size === 'md' && styles.badgeMd,
    ]}>
      <View style={[styles.dot, { backgroundColor: style.text }]} />
      <Text style={[
        styles.label,
        { color: style.text },
        size === 'md' && styles.labelMd,
      ]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  badgeMd: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  labelMd: {
    fontSize: FontSize.sm,
  },
});
