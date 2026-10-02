// ============================================================
// Kayda Sathi — Cases Screen (Polished UI)
// ============================================================

import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '@/constants';
import { Button, EmptyState } from '@/components/ui';
import { CaseCard } from '@/components/cases/CaseCard';
import { useCases } from '@/store/caseStore';

type FilterTab = 'ALL' | 'ACTIVE' | 'ACTION_REQUIRED' | 'RESOLVED';

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'ACTIVE', label: 'Active' },
  { key: 'ACTION_REQUIRED', label: 'Action Needed' },
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
          <Text style={styles.title}>Legal Dossiers</Text>
          <Text style={styles.subtitle}>{cases.length} active legal dispute{cases.length === 1 ? '' : 's'}</Text>
        </View>
        <Button
          title="New Case"
          onPress={() => router.push('/new-case')}
          variant="primary"
          icon="add"
          size="sm"
        />
      </View>

      {/* Modern Compact Filter Bar */}
      <View style={styles.filterWrapper}>
        <View style={styles.filterControl}>
          {FILTER_TABS.map((tab) => {
            const isActive = activeFilter === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setActiveFilter(tab.key)}
                style={[styles.filterTab, isActive && styles.filterTabActive]}
              >
                <Text style={[styles.filterTabText, isActive && styles.filterTabTextActive]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

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
    backgroundColor: Colors.neutral[0],
  },
  title: {
    fontSize: FontSize['2xl'],
    fontWeight: '800',
    color: Colors.neutral[900],
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: FontSize.xs,
    color: Colors.neutral[500],
    marginTop: 2,
  },
  filterWrapper: {
    backgroundColor: Colors.neutral[0],
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  filterControl: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral[100],
    borderRadius: BorderRadius.md,
    padding: 2,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.sm,
  },
  filterTabActive: {
    backgroundColor: Colors.neutral[0],
    ...Shadow.sm,
  },
  filterTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.neutral[500],
  },
  filterTabTextActive: {
    color: Colors.primary[700],
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing['6xl'],
  },
});
