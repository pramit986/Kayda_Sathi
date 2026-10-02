// ============================================================
// Kayda Sathi — Loading & Error State Components
// ============================================================

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing, BorderRadius } from '@/constants';
import { Button } from './Button';

// ---- Loading Skeleton ----
interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: object;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 6, style }: SkeletonProps) {
  return (
    <View
      style={[
        styles.skeleton,
        { width: width as any, height, borderRadius },
        style,
      ]}
    />
  );
}

// ---- Full-screen Loading ----
interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={Colors.primary[500]} />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
}

// ---- Inline Loading ----
export function LoadingInline({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <View style={styles.inlineLoading}>
      <ActivityIndicator size="small" color={Colors.primary[500]} />
      <Text style={styles.inlineLoadingText}>{message}</Text>
    </View>
  );
}

// ---- Card Skeleton ----
export function CardSkeleton() {
  return (
    <View style={styles.cardSkeleton}>
      <View style={styles.cardSkeletonHeader}>
        <Skeleton width={40} height={40} borderRadius={8} />
        <View style={{ flex: 1, marginLeft: Spacing.md }}>
          <Skeleton width="60%" height={14} />
          <Skeleton width="40%" height={12} style={{ marginTop: 8 }} />
        </View>
      </View>
      <Skeleton width="90%" height={12} style={{ marginTop: 12 }} />
      <Skeleton width="70%" height={12} style={{ marginTop: 8 }} />
    </View>
  );
}

// ---- Error State ----
interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'We couldn\'t complete this action. Please try again.',
  onRetry,
  retryLabel = 'Try Again',
}: ErrorStateProps) {
  return (
    <View style={styles.center}>
      <View style={styles.errorIconContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.error[500]} />
      </View>
      <Text style={styles.errorTitle}>{title}</Text>
      <Text style={styles.errorMessage}>{message}</Text>
      {onRetry && (
        <Button
          title={retryLabel}
          onPress={onRetry}
          variant="outline"
          icon="refresh-outline"
          style={{ marginTop: Spacing.xl }}
        />
      )}
    </View>
  );
}

// ---- Empty State ----
interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = 'folder-open-outline',
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name={icon} size={40} color={Colors.neutral[400]} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      {message && <Text style={styles.emptyMessage}>{message}</Text>}
      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          variant="secondary"
          style={{ marginTop: Spacing.lg }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: Colors.neutral[100],
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing['3xl'],
  },
  loadingText: {
    marginTop: Spacing.lg,
    fontSize: FontSize.md,
    color: Colors.neutral[500],
    fontWeight: '500',
  },
  inlineLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  inlineLoadingText: {
    marginLeft: Spacing.sm,
    fontSize: FontSize.sm,
    color: Colors.neutral[500],
  },
  cardSkeleton: {
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.neutral[100],
  },
  cardSkeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.error[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  errorTitle: {
    fontSize: FontSize.xl,
    fontWeight: '600',
    color: Colors.neutral[900],
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: FontSize.md,
    color: Colors.neutral[500],
    textAlign: 'center',
    marginTop: Spacing.sm,
    lineHeight: 22,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing['4xl'],
    paddingHorizontal: Spacing['3xl'],
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.neutral[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.neutral[700],
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: FontSize.md,
    color: Colors.neutral[500],
    textAlign: 'center',
    marginTop: Spacing.sm,
    lineHeight: 22,
  },
});
