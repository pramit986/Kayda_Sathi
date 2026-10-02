// ============================================================
// Kayda Sathi — Profile Screen
// ============================================================

import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '@/constants';
import { Card } from '@/components/ui';

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  color?: string;
  onPress?: () => void;
  badge?: string;
}

const MENU_SECTIONS: { title: string; items: MenuItem[] }[] = [
  {
    title: 'Account',
    items: [
      { icon: 'person-outline', label: 'Personal Information', subtitle: 'Name, email, phone' },
      { icon: 'language-outline', label: 'Language', subtitle: 'English', badge: 'EN' },
      { icon: 'notifications-outline', label: 'Notifications', subtitle: 'Manage alerts' },
    ],
  },
  {
    title: 'Data & Privacy',
    items: [
      { icon: 'cloud-download-outline', label: 'Export My Data', subtitle: 'Download all your case data' },
      { icon: 'trash-outline', label: 'Delete All Data', subtitle: 'Permanently remove your data', color: Colors.error[600] },
      { icon: 'lock-closed-outline', label: 'Privacy Policy' },
      { icon: 'document-text-outline', label: 'Terms of Service' },
    ],
  },
  {
    title: 'About',
    items: [
      { icon: 'information-circle-outline', label: 'About Kayda Sathi', subtitle: 'Version 1.0.0' },
      { icon: 'help-circle-outline', label: 'Help & Support' },
      { icon: 'star-outline', label: 'Rate the App' },
    ],
  },
];

import { useRouter } from 'expo-router';
import { useAuth } from '@/store/authStore';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const displayName = user?.displayName || 'Citizen';
  const email = user?.email || 'citizen@kaydasathi.in';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const handleSignOut = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.section}>
          <Card variant="elevated">
            <View style={styles.profileRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials || 'KS'}</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{displayName}</Text>
                <Text style={styles.profileEmail}>{email}</Text>
              </View>
              <Pressable
                onPress={() => router.push('/login')}
                hitSlop={8}
                style={{ padding: 4 }}
              >
                <Ionicons name="swap-horizontal" size={20} color={Colors.primary[600]} />
              </Pressable>
            </View>
          </Card>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>1</Text>
            <Text style={styles.statLabel}>Cases</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>5</Text>
            <Text style={styles.statLabel}>Evidence</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Documents</Text>
          </View>
        </View>

        {/* Menu Sections */}
        {MENU_SECTIONS.map((section) => (
          <View key={section.title} style={styles.menuSection}>
            <Text style={styles.menuSectionTitle}>{section.title}</Text>
            <Card variant="outlined" padding="sm">
              {section.items.map((item, index) => (
                <Pressable
                  key={item.label}
                  style={[
                    styles.menuItem,
                    index < section.items.length - 1 && styles.menuItemBorder,
                  ]}
                  onPress={item.onPress}
                >
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={item.color || Colors.neutral[600]}
                    style={styles.menuIcon}
                  />
                  <View style={styles.menuText}>
                    <Text style={[styles.menuLabel, item.color ? { color: item.color } : null]}>
                      {item.label}
                    </Text>
                    {item.subtitle && (
                      <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                    )}
                  </View>
                  {item.badge ? (
                    <View style={styles.menuBadge}>
                      <Text style={styles.menuBadgeText}>{item.badge}</Text>
                    </View>
                  ) : (
                    <Ionicons name="chevron-forward" size={16} color={Colors.neutral[300]} />
                  )}
                </Pressable>
              ))}
            </Card>
          </View>
        ))}

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Ionicons name="information-circle-outline" size={14} color={Colors.neutral[400]} />
          <Text style={styles.disclaimerText}>
            Kayda Sathi provides legal information and guidance. It is not a substitute for professional legal advice.
          </Text>
        </View>

        {/* Sign Out */}
        <Pressable style={styles.signOut} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={18} color={Colors.error[600]} />
          <Text style={styles.signOutText}>Sign Out / Switch Account</Text>
        </Pressable>

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
  section: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  avatarText: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.neutral[0],
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: FontSize.xl,
    fontWeight: '600',
    color: Colors.neutral[900],
  },
  profileEmail: {
    fontSize: FontSize.sm,
    color: Colors.neutral[500],
    marginTop: 2,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
    marginBottom: Spacing['2xl'],
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral[100],
  },
  statValue: {
    fontSize: FontSize['3xl'],
    fontWeight: '700',
    color: Colors.primary[500],
  },
  statLabel: {
    fontSize: FontSize.xs,
    fontWeight: '500',
    color: Colors.neutral[500],
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Menu
  menuSection: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  menuSectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.neutral[400],
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
    paddingLeft: Spacing.xs,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  menuIcon: {
    marginRight: Spacing.md,
  },
  menuText: {
    flex: 1,
  },
  menuLabel: {
    fontSize: FontSize.md,
    fontWeight: '500',
    color: Colors.neutral[800],
  },
  menuSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.neutral[500],
    marginTop: 1,
  },
  menuBadge: {
    backgroundColor: Colors.primary[50],
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  menuBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.primary[500],
  },

  // Disclaimer
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  disclaimerText: {
    flex: 1,
    fontSize: FontSize.xs,
    color: Colors.neutral[400],
    lineHeight: 16,
  },

  // Sign out
  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    marginHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.error[200],
    gap: Spacing.sm,
  },
  signOutText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.error[600],
  },
});
