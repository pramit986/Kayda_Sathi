// ============================================================
// Kayda Sathi — Home Screen (Phases 2, 3, 4)
// ============================================================

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, FontSize, Spacing, BorderRadius, Shadow, COMMON_PROBLEMS } from '@/constants';
import { Button, SectionHeader, EmptyState } from '@/components/ui';
import { CategoryCard } from '@/components/home/CategoryCard';
import { CaseCard } from '@/components/cases/CaseCard';
import { useCases } from '@/store/caseStore';

export default function HomeScreen() {
  const { cases } = useCases();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ---- Header ---- */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandName}>Kayda Sathi</Text>
            <Text style={styles.tagline}>
              Understand your situation. Know your next step.
            </Text>
          </View>
          <Pressable
            style={styles.notifButton}
            hitSlop={8}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <Ionicons name="shield-checkmark" size={20} color={Colors.primary[600]} />
          </Pressable>
        </View>

        {/* ---- Primary CTA ---- */}
        <View style={styles.ctaContainer}>
          <View style={styles.ctaCard}>
            <View style={styles.ctaContent}>
              <View style={styles.ctaIconRow}>
                <View style={styles.ctaIconBg}>
                  <Ionicons name="sparkles" size={22} color={Colors.primary[500]} />
                </View>
              </View>
              <Text style={styles.ctaTitle}>Describe your problem</Text>
              <Text style={styles.ctaSubtitle}>
                Tell us what happened in plain words — Kayda Sathi AI classifies facts, detects gaps, and prepares your legal dossier.
              </Text>
              <View style={styles.ctaButtons}>
                <Button
                  title="Analyze with AI"
                  onPress={() => router.push('/new-case')}
                  variant="primary"
                  icon="sparkles-outline"
                  size="lg"
                  style={{ flex: 1, marginRight: Spacing.sm }}
                />
                <Pressable
                  onPress={() => router.push('/new-case')}
                  style={styles.voiceButton}
                >
                  <Ionicons name="mic" size={22} color={Colors.primary[500]} />
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* ---- Common Problems ---- */}
        <SectionHeader
          title="Common Grievance Categories"
          actionLabel="View all"
          onAction={() => router.push('/new-case')}
        />
        <View style={styles.categoriesGrid}>
          {COMMON_PROBLEMS.map((cat) => (
            <CategoryCard
              key={cat.id}
              icon={cat.icon}
              label={cat.shortLabel}
              color={cat.color}
              bgColor={cat.bgColor}
              onPress={() => router.push('/new-case')}
            />
          ))}
        </View>

        {/* ---- Your Cases ---- */}
        <SectionHeader
          title="Your Legal Dossiers"
          actionLabel={cases.length > 0 ? 'View all' : undefined}
          onAction={cases.length > 0 ? () => router.push('/(tabs)/cases') : undefined}
        />

        {cases.length > 0 ? (
          cases.map((c) => (
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
            icon="folder-open-outline"
            title="No active cases yet"
            message="Start by describing your legal problem and we'll help you build your case."
            actionLabel="Start a case"
            onAction={() => router.push('/new-case')}
          />
        )}

        {/* ---- Legal Disclaimer Footer ---- */}
        <View style={styles.disclaimerContainer}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.neutral[400]} />
          <Text style={styles.disclaimerText}>
            Kayda Sathi provides legal information & standard grievance navigation. It does not provide legal advice or replace a licensed advocate.
          </Text>
        </View>

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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing['6xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  brandName: {
    fontSize: FontSize['2xl'],
    fontWeight: '800',
    color: Colors.neutral[900],
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: FontSize.sm,
    color: Colors.neutral[500],
    marginTop: 2,
  },
  notifButton: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaContainer: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  ctaCard: {
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    ...Shadow.md,
  },
  ctaContent: {
    padding: Spacing.xl,
  },
  ctaIconRow: {
    marginBottom: Spacing.md,
  },
  ctaIconBg: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.neutral[900],
    letterSpacing: -0.3,
  },
  ctaSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.neutral[500],
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  ctaButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voiceButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  disclaimerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.neutral[100],
    borderRadius: BorderRadius.md,
  },
  disclaimerText: {
    fontSize: FontSize.xs,
    color: Colors.neutral[500],
    flex: 1,
    lineHeight: 18,
  },
});
