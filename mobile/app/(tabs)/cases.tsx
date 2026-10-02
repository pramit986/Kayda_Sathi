// ============================================================
// Kayda Sathi — Cases Screen (Phases 2 & 4)
// ============================================================

import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, FontSize, Spacing, BorderRadius } from '@/constants';
import { Button, EmptyState } from '@/components/ui';
import { CaseCard } from '@/components/cases/CaseCard';
import { useCases } from '@/store/caseStore';

type FilterTab = 'ALL' | 'ACTIVE' | 'ACTION_REQUIRED' | 'RESOLVED' | 'ARCHIVED';

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'ACTIVE', label: 'Active' },
  { key: 'ACTION_REQUIRED', label: 'Action Required' },
  { key: 'RESOLVED', label: 'Resolved' },
];

export default function CasesScreen() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('ALL');
  const [refreshing, setRefreshing] = useState(false);
  const { cases, refresh } = useCases();

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const filteredCases = activeFilter === 'ALL'
    ? cases
    : cases.filter(c => c.status === activeFilter);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Cases</Text>
          <Text style={styles.subtitle}>{cases.length} active legal dossier{cases.length === 1 ? '' : 's'}</Text>
        </View>
        <Button
          title="New Case"
          onPress={() => router.push('/new-case')}
          variant="primary"
          icon="add"
          size="sm"
        />
      </View>

      {/* Filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        {FILTER_TABS.map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => setActiveFilter(tab.key)}
            style={[
              styles.filterTab,
              activeFilter === tab.key && styles.filterTabActive,
            ]}
          >
            <Text
              style={[
                styles.filterTabText,
                activeFilter === tab.key && styles.filterTabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Case list */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary[500]]} />
        }
      >
        {filteredCases.length > 0 ? (
          filteredCases.map((c) => (
            <CaseCard
              key={c.id}
              id={c.id}
              title={c.title}
              category={c.category}
              status={c.status}
              preparation={c.preparation}
              updatedAt={c.updatedAt}
              isDemo={c.isDemo}
            />
          ))
        ) : (
          <EmptyState
            icon="briefcase-outline"
            title="No cases found"
            message={
              activeFilter === 'ALL'
                ? 'Start by describing your legal problem.'
                : `No ${activeFilter.toLowerCase().replace('_', ' ')} cases.`
            }
            actionLabel={activeFilter === 'ALL' ? 'Start a case' : undefined}
            onAction={activeFilter === 'ALL' ? () => router.push('/new-case') : undefined}
          />
        )}
        <View style={{ height: Spacing['4xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize['2xl'],
    fontWeight: '700',
    color: Colors.neutral[900],
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: FontSize.xs,
    color: Colors.neutral[500],
    marginTop: 2,
  },
  filterContainer: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  filterTab: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neutral[0],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    marginRight: Spacing.sm,
  },
  filterTabActive: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
  filterTabText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.neutral[600],
  },
  filterTabTextActive: {
    color: Colors.neutral[0],
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Spacing.sm,
  },
});
