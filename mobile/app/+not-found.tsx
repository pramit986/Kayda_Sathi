// ============================================================
// Kayda Sathi — 404 Not Found Screen
// ============================================================

import { Stack, Link } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing, BorderRadius } from '@/constants';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <View style={styles.container}>
        <View style={styles.iconBg}>
          <Ionicons name="compass-outline" size={48} color={Colors.neutral[400]} />
        </View>
        <Text style={styles.title}>Page Not Found</Text>
        <Text style={styles.subtitle}>The screen you're looking for doesn't exist.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go to Home</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.neutral[50],
    paddingHorizontal: Spacing['3xl'],
  },
  iconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSize['2xl'],
    fontWeight: '700',
    color: Colors.neutral[900],
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.neutral[500],
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  link: {
    marginTop: Spacing.xl,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    backgroundColor: Colors.primary[500],
    borderRadius: BorderRadius.md,
  },
  linkText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.neutral[0],
  },
});
