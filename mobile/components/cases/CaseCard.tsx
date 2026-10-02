// ============================================================
// Kayda Sathi — CaseCard Component (Polished)
// ============================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Card, StatusBadge, type BadgeVariant } from '@/components/ui';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '@/constants';
import { getCategoryById, type CategoryId } from '@/constants';

interface CaseCardProps {
  id: string;
  title: string;
  category: CategoryId;
  status: 'ACTIVE' | 'ACTION_REQUIRED' | 'RESOLVED' | 'ARCHIVED';
  preparation: {
    understanding: number;
    evidence: number;
    actionReadiness: number;
  };
  updatedAt: string;
  isDemo?: boolean;
}

const STATUS_LABELS: Record<string, { label: string; variant: BadgeVariant }> = {
  ACTIVE: { label: 'Active', variant: 'active' },
  ACTION_REQUIRED: { label: 'Action Needed', variant: 'action_required' },
  RESOLVED: { label: 'Resolved', variant: 'resolved' },
  ARCHIVED: { label: 'Archived', variant: 'archived' },
};

export function CaseCard({ id, title, category, status, preparation, updatedAt, isDemo }: CaseCardProps) {
  const cat = getCategoryById(category);
  const statusInfo = STATUS_LABELS[status] || STATUS_LABELS.ACTIVE;
  const avgPrep = Math.round((preparation.understanding + preparation.evidence + preparation.actionReadiness) / 3);

  return (
    <Card
      onPress={() => router.push(`/case/${id}`)}
      variant="elevated"
      style={styles.card}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {cat && (
            <View style={[styles.iconContainer, { backgroundColor: cat.bgColor }]}>
              <Ionicons name={cat.icon} size={18} color={cat.color} />
            </View>
          )}
          <View style={styles.headerText}>
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
            <Text style={styles.category}>{cat?.label || category}</Text>
          </View>
        </View>
        <StatusBadge label={statusInfo.label} variant={statusInfo.variant} />
      </View>

      {/* Preparation Progress Strip */}
      <View style={styles.prepContainer}>
        <View style={styles.prepHeader}>
          <Text style={styles.prepLabel}>Legal Readiness</Text>
          <Text style={styles.prepValue}>{avgPrep}%</Text>
        </View>
        <View style={styles.prepTrack}>
          <View style={[styles.prepFill, { width: `${avgPrep}%` }]} />
        </View>
      </View>

      <View style={styles.footer}>
        {isDemo && (
          <View style={styles.demoBadge}>
            <Text style={styles.demoText}>SAMPLE CASE</Text>
          </View>
        )}
        <Text style={styles.updated}>Updated {formatRelativeTime(updatedAt)}</Text>
        <Ionicons name="chevron-forward" size={15} color={Colors.neutral[400]} />
      </View>
    </Card>
  );
}

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    ...Shadow.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flexDirection: 'row',
    flex: 1,
    marginRight: Spacing.sm,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.neutral[900],
    letterSpacing: -0.2,
  },
  category: {
    fontSize: FontSize.xs,
    color: Colors.neutral[500],
    marginTop: 2,
    fontWeight: '500',
  },
  prepContainer: {
    marginTop: Spacing.md,
  },
  prepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  prepLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.neutral[400],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  prepValue: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary[700],
  },
  prepTrack: {
    height: 4,
    backgroundColor: Colors.neutral[100],
    borderRadius: 2,
    overflow: 'hidden',
  },
  prepFill: {
    height: 4,
    backgroundColor: Colors.primary[500],
    borderRadius: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
  },
  demoBadge: {
    backgroundColor: Colors.warning[50],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
    marginRight: Spacing.sm,
  },
  demoText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.warning[700],
    letterSpacing: 0.5,
  },
  updated: {
    flex: 1,
    fontSize: FontSize.xs,
    color: Colors.neutral[400],
  },
});
