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

        {/* ---- Primary CTA: Describe Your Problem ---- */}
        <View style={styles.ctaContainer}>
          <View style={styles.ctaCard}>
            <View style={styles.ctaHeaderRow}>
              <View style={styles.ctaIconBg}>
                <Ionicons name="sparkles" size={24} color={Colors.primary[600]} />
              </View>
              <View style={styles.aiTag}>
                <Ionicons name="flash" size={11} color={Colors.primary[700]} />
                <Text style={styles.aiTagText}>AI LEGAL DOSSIER</Text>
              </View>
            </View>

            <Text style={styles.ctaTitle}>Describe Your Problem</Text>
            <Text style={styles.ctaSubtitle}>
              Voice or type what happened in simple everyday words. Kayda Sathi extracts facts, identifies evidence gaps, and drafts your legal notices.
            </Text>

            <View style={styles.ctaButtons}>
              <Button
                title="Start Legal Assessment"
                onPress={() => router.push('/new-case')}
                variant="primary"
                icon="arrow-forward"
                size="lg"
                style={{ flex: 1, marginRight: Spacing.sm }}
              />
              <Pressable
                onPress={() => router.push('/new-case')}
                style={styles.voiceButton}
                accessibilityLabel="Speak your problem"
              >
                <Ionicons name="mic" size={24} color={Colors.primary[600]} />
              </Pressable>
            </View>
          </View>
        </View>

        {/* ---- Quick Category Chips (Horizontal Scroll) ---- */}
        <SectionHeader
          title="Common Grievance Areas"
          actionLabel="View all"
          onAction={() => router.push('/new-case')}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalCategoriesContent}
          style={styles.horizontalCategoriesScroll}
        >
          {COMMON_PROBLEMS.map((cat) => (
            <CategoryCard
              key={cat.id}
              icon={cat.icon}
              label={cat.shortLabel}
              color={cat.color}
              bgColor={cat.bgColor}
              horizontal
              onPress={() => router.push('/new-case')}
            />
          ))}
        </ScrollView>

        {/* ---- Your Cases ---- */}
        <SectionHeader
          title="Your Active Cases"
          actionLabel={cases.length > 0 ? `View all (${cases.length})` : undefined}
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
          <Ionicons name="shield-checkmark-outline" size={16} color={Colors.neutral[400]} />
          <Text style={styles.disclaimerText}>
            Kayda Sathi provides legal information & standard grievance navigation. It does not replace a licensed advocate.
          </Text>
        </View>

        <View style={{ height: Spacing['6xl'] }} />
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
    padding: Spacing.xl,
    borderWidth: 1.5,
    borderColor: Colors.primary[200],
    ...Shadow.md,
  },
  ctaHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  ctaIconBg: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary[100],
  },
  aiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary[50],
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  aiTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary[700],
    letterSpacing: 0.5,
  },
  ctaTitle: {
    fontSize: FontSize['2xl'],
    fontWeight: '800',
    color: Colors.neutral[900],
    letterSpacing: -0.4,
  },
  ctaSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.neutral[600],
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
    lineHeight: 21,
  },
  ctaButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voiceButton: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary[200],
  },
  horizontalCategoriesScroll: {
    marginBottom: Spacing.xl,
  },
  horizontalCategoriesContent: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
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
