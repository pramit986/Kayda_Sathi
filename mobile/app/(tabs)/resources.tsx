// ============================================================
// Kayda Sathi — Resources Screen
// ============================================================

import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '@/constants';
import { Card, SectionHeader } from '@/components/ui';

interface ResourceItem {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
  url?: string;
  tag?: string;
}

const HELPLINES: ResourceItem[] = [
  {
    id: 'h1',
    title: 'National Legal Services Authority',
    description: 'Free legal aid for eligible citizens',
    icon: 'call-outline',
    color: Colors.primary[500],
    bgColor: Colors.primary[50],
    url: 'tel:15100',
    tag: '15100',
  },
  {
    id: 'h2',
    title: 'Cyber Crime Helpline',
    description: 'Report online fraud and cybercrime',
    icon: 'shield-outline',
    color: Colors.error[600],
    bgColor: Colors.error[50],
    url: 'tel:1930',
    tag: '1930',
  },
  {
    id: 'h3',
    title: 'Women Helpline',
    description: 'Support for women in distress',
    icon: 'people-outline',
    color: '#BE185D',
    bgColor: '#FDF2F8',
    url: 'tel:181',
    tag: '181',
  },
  {
    id: 'h4',
    title: 'Consumer Helpline',
    description: 'Consumer complaint registration',
    icon: 'bag-handle-outline',
    color: '#7C3AED',
    bgColor: '#F5F3FF',
    url: 'tel:1800114000',
    tag: '1800-11-4000',
  },
];

const OFFICIAL_PORTALS: ResourceItem[] = [
  {
    id: 'p1',
    title: 'India Code',
    description: 'Repository of all Central and State Acts',
    icon: 'book-outline',
    color: Colors.primary[600],
    bgColor: Colors.primary[50],
    url: 'https://www.indiacode.nic.in',
  },
  {
    id: 'p2',
    title: 'National Cyber Crime Portal',
    description: 'File online cyber crime complaints',
    icon: 'globe-outline',
    color: Colors.info[600],
    bgColor: Colors.info[50],
    url: 'https://cybercrime.gov.in',
  },
  {
    id: 'p3',
    title: 'Consumer Commission',
    description: 'National Consumer Disputes Redressal Commission',
    icon: 'business-outline',
    color: '#4338CA',
    bgColor: '#EEF2FF',
    url: 'https://ncdrc.nic.in',
  },
  {
    id: 'p4',
    title: 'eCourts Services',
    description: 'Case status and court orders',
    icon: 'document-text-outline',
    color: Colors.success[700],
    bgColor: Colors.success[50],
    url: 'https://ecourts.gov.in',
  },
];

const GUIDES: ResourceItem[] = [
  {
    id: 'g1',
    title: 'How to File a Consumer Complaint',
    description: 'Step-by-step guide for consumer disputes',
    icon: 'list-outline',
    color: '#7C3AED',
    bgColor: '#F5F3FF',
  },
  {
    id: 'g2',
    title: 'Tenant Rights in India',
    description: 'Know your rights as a tenant',
    icon: 'home-outline',
    color: Colors.primary[500],
    bgColor: Colors.primary[50],
  },
  {
    id: 'g3',
    title: 'What to Do if You\'re Scammed Online',
    description: 'Immediate steps for online fraud victims',
    icon: 'shield-outline',
    color: Colors.error[600],
    bgColor: Colors.error[50],
  },
];

function ResourceCard({ item, showTag }: { item: ResourceItem; showTag?: boolean }) {
  return (
    <Card
      onPress={item.url ? () => Linking.openURL(item.url!) : undefined}
      style={styles.resourceCard}
      variant="outlined"
      padding="sm"
    >
      <View style={styles.resourceRow}>
        <View style={[styles.resourceIcon, { backgroundColor: item.bgColor }]}>
          <Ionicons name={item.icon} size={20} color={item.color} />
        </View>
        <View style={styles.resourceInfo}>
          <Text style={styles.resourceTitle}>{item.title}</Text>
          <Text style={styles.resourceDesc} numberOfLines={2}>{item.description}</Text>
        </View>
        {showTag && item.tag ? (
          <View style={styles.tagContainer}>
            <Text style={styles.tagText}>{item.tag}</Text>
          </View>
        ) : item.url ? (
          <Ionicons name="open-outline" size={16} color={Colors.neutral[400]} />
        ) : (
          <Ionicons name="chevron-forward" size={16} color={Colors.neutral[400]} />
        )}
      </View>
    </Card>
  );
}

export default function ResourcesScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Resources</Text>
          <Text style={styles.subtitle}>Helplines, portals & guides</Text>
        </View>

        {/* Emergency Banner */}
        <View style={styles.section}>
          <Card style={styles.emergencyCard}>
            <View style={styles.emergencyRow}>
              <View style={styles.emergencyIcon}>
                <Ionicons name="warning-outline" size={22} color={Colors.error[600]} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.emergencyTitle}>Need immediate help?</Text>
                <Text style={styles.emergencyDesc}>
                  If you're in danger, call 112 (emergency) or contact the nearest police station.
                </Text>
              </View>
            </View>
            <Pressable
              style={styles.emergencyButton}
              onPress={() => Linking.openURL('tel:112')}
            >
              <Ionicons name="call" size={16} color={Colors.neutral[0]} />
              <Text style={styles.emergencyButtonText}>Call 112</Text>
            </Pressable>
          </Card>
        </View>

        {/* Helplines */}
        <SectionHeader title="Helplines" />
        <View style={styles.section}>
          {HELPLINES.map((item) => (
            <ResourceCard key={item.id} item={item} showTag />
          ))}
        </View>

        {/* Official Portals */}
        <SectionHeader title="Official Portals" />
        <View style={styles.section}>
          {OFFICIAL_PORTALS.map((item) => (
            <ResourceCard key={item.id} item={item} />
          ))}
        </View>

        {/* Guides */}
        <SectionHeader title="Guides" subtitle="Coming in future updates" />
        <View style={styles.section}>
          {GUIDES.map((item) => (
            <ResourceCard key={item.id} item={item} />
          ))}
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
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize['2xl'],
    fontWeight: '700',
    color: Colors.neutral[900],
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.neutral[500],
    marginTop: 2,
  },
  section: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },

  // Emergency
  emergencyCard: {
    backgroundColor: Colors.error[50],
    borderWidth: 1,
    borderColor: Colors.error[200],
  },
  emergencyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  emergencyIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.neutral[0],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  emergencyTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.error[700],
  },
  emergencyDesc: {
    fontSize: FontSize.sm,
    color: Colors.error[600],
    marginTop: 2,
    lineHeight: 20,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.error[600],
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    alignSelf: 'flex-start',
  },
  emergencyButtonText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.neutral[0],
  },

  // Resource card
  resourceCard: {
    marginBottom: Spacing.sm,
  },
  resourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resourceIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  resourceInfo: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.neutral[900],
  },
  resourceDesc: {
    fontSize: FontSize.xs,
    color: Colors.neutral[500],
    marginTop: 2,
    lineHeight: 16,
  },
  tagContainer: {
    backgroundColor: Colors.primary[50],
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  tagText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.primary[500],
  },
});
