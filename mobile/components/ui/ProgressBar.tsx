// ============================================================
// Kayda Sathi — ProgressBar Component
// ============================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius, FontSize, Spacing } from '@/constants';

interface ProgressBarProps {
  label: string;
  value: number; // 0-100
  showPercentage?: boolean;
  color?: string;
  height?: number;
}

export function ProgressBar({
  label,
  value,
  showPercentage = true,
  color = Colors.primary[500],
  height = 6,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        {showPercentage && (
          <Text style={styles.percentage}>{Math.round(clamped)}%</Text>
        )}
      </View>
      <View style={[styles.track, { height }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${clamped}%`,
              backgroundColor: color,
              height,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    color: Colors.neutral[600],
  },
  percentage: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.neutral[700],
  },
  track: {
    backgroundColor: Colors.neutral[100],
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: BorderRadius.full,
  },
});
