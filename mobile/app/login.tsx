// ============================================================
// Kayda Sathi — Login & Authentication Screen
// ============================================================
// Supports Phone OTP, Email/Password, and 1-tap Judge/Demo Login.

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '@/constants';
import { Card, Button } from '@/components/ui';
import { AuthStore } from '@/store/authStore';

type AuthMode = 'PHONE' | 'EMAIL';

export default function LoginScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('PHONE');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const [loading, setLoading] = useState(false);

  // Send OTP
  const handleSendOtp = () => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      Alert.alert('Invalid Mobile Number', 'Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
      setOtp('123456'); // Auto-fill demo OTP for convenience
      Alert.alert('OTP Sent', 'Demo verification code: 123456 has been entered for your convenience.');
    }, 600);
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    if (otp.trim().length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      await AuthStore.login({
        displayName: name.trim() || 'Citizen',
        phone: `+91 ${phone}`,
        email: email.trim() || undefined,
        preferredLanguage: 'en',
      });
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Verification Failed', e?.message || 'Could not verify OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Email Login
  const handleEmailAuth = async () => {
    if (!email.includes('@') || password.length < 6) {
      Alert.alert('Invalid Credentials', 'Please enter a valid email address and a password of at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await AuthStore.login({
        displayName: isSignUp ? name.trim() || 'Citizen' : email.split('@')[0],
        email: email.trim(),
        preferredLanguage: 'en',
      });
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Login Failed', e?.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo / Judge Login
  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      await AuthStore.loginAsDemo();
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Demo Error', e?.message || 'Failed to start demo session.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Brand */}
          <View style={styles.brandContainer}>
            <View style={styles.brandIconBg}>
              <Ionicons name="scale" size={32} color={Colors.primary[500]} />
            </View>
            <Text style={styles.brandTitle}>KAYDA SATHI</Text>
            <Text style={styles.brandSubtitle}>कायदा साथी — Your Legal Rights Companion</Text>
            <Text style={styles.tagline}>From Story → Evidence → Action</Text>
          </View>

          {/* Quick Demo Access for Hackathon Judges */}
          <Card variant="elevated" style={styles.judgeDemoCard}>
            <View style={styles.judgeHeader}>
              <Ionicons name="flash" size={18} color={Colors.warning[600]} />
              <Text style={styles.judgeTitle}>Quick Hackathon Demo Access</Text>
            </View>
            <Text style={styles.judgeSubtitle}>
              Experience the complete flow instantly with Rahul Sharma's tenancy deposit case preloaded.
            </Text>
            <Button
              title="Enter as Demo Citizen"
              onPress={handleDemoLogin}
              variant="primary"
              size="md"
              icon="arrow-forward"
              style={{ marginTop: Spacing.sm }}
            />
          </Card>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR SIGN IN TO YOUR ACCOUNT</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Tab Toggle: Phone vs Email */}
          <View style={styles.modeToggle}>
            <Pressable
              style={[styles.toggleBtn, mode === 'PHONE' && styles.toggleBtnActive]}
              onPress={() => {
                setMode('PHONE');
                setOtpSent(false);
              }}
            >
              <Ionicons
                name="call-outline"
                size={16}
                color={mode === 'PHONE' ? Colors.primary[600] : Colors.neutral[500]}
              />
              <Text style={[styles.toggleText, mode === 'PHONE' && styles.toggleTextActive]}>
                Mobile OTP
              </Text>
            </Pressable>

            <Pressable
              style={[styles.toggleBtn, mode === 'EMAIL' && styles.toggleBtnActive]}
              onPress={() => setMode('EMAIL')}
            >
              <Ionicons
                name="mail-outline"
                size={16}
                color={mode === 'EMAIL' ? Colors.primary[600] : Colors.neutral[500]}
              />
              <Text style={[styles.toggleText, mode === 'EMAIL' && styles.toggleTextActive]}>
                Email ID
              </Text>
            </Pressable>
          </View>

          {/* Phone Form */}
          {mode === 'PHONE' ? (
            <Card variant="outlined" style={styles.formCard}>
              <Text style={styles.fieldLabel}>Mobile Number</Text>
              <View style={styles.phoneInputRow}>
                <View style={styles.countryCodeBadge}>
                  <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="98765 43210"
                  placeholderTextColor={Colors.neutral[400]}
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phone}
                  onChangeText={(val) => {
                    setPhone(val);
                    if (otpSent) setOtpSent(false);
                  }}
                  editable={!loading}
                />
              </View>

              {otpSent && (
                <View style={{ marginTop: Spacing.lg }}>
                  <Text style={styles.fieldLabel}>Enter 6-Digit OTP</Text>
                  <TextInput
                    style={styles.otpInput}
                    placeholder="123456"
                    placeholderTextColor={Colors.neutral[400]}
                    keyboardType="number-pad"
                    maxLength={6}
                    value={otp}
                    onChangeText={setOtp}
                    editable={!loading}
                  />
                  <Text style={styles.otpHelper}>
                    Demo OTP <Text style={{ fontWeight: '700' }}>123456</Text> auto-filled
                  </Text>
                </View>
              )}

              <Button
                title={
                  loading
                    ? 'Please wait...'
                    : otpSent
                    ? 'Verify & Enter App'
                    : 'Send Verification OTP'
                }
                onPress={otpSent ? handleVerifyOtp : handleSendOtp}
                variant="primary"
                size="lg"
                fullWidth
                disabled={loading || (otpSent ? otp.length < 6 : phone.length < 10)}
                style={{ marginTop: Spacing.xl }}
              />
            </Card>
          ) : (
            /* Email Form */
            <Card variant="outlined" style={styles.formCard}>
              {isSignUp && (
                <View style={{ marginBottom: Spacing.md }}>
                  <Text style={styles.fieldLabel}>Full Name</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Priya Deshmukh"
                    placeholderTextColor={Colors.neutral[400]}
                    value={name}
                    onChangeText={setName}
                    editable={!loading}
                  />
                </View>
              )}

              <Text style={styles.fieldLabel}>Email Address</Text>
              <TextInput
                style={styles.textInput}
                placeholder="citizen@example.com"
                placeholderTextColor={Colors.neutral[400]}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                editable={!loading}
              />

              <Text style={[styles.fieldLabel, { marginTop: Spacing.md }]}>Password</Text>
              <TextInput
                style={styles.textInput}
                placeholder="••••••••"
                placeholderTextColor={Colors.neutral[400]}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                editable={!loading}
              />

              <Button
                title={
                  loading
                    ? 'Please wait...'
                    : isSignUp
                    ? 'Create Free Account'
                    : 'Sign In'
                }
                onPress={handleEmailAuth}
                variant="primary"
                size="lg"
                fullWidth
                disabled={loading || !email.includes('@') || password.length < 6}
                style={{ marginTop: Spacing.xl }}
              />

              <Pressable
                onPress={() => setIsSignUp(!isSignUp)}
                style={styles.switchAuthRow}
              >
                <Text style={styles.switchAuthText}>
                  {isSignUp
                    ? 'Already have an account? Sign In'
                    : "Don't have an account? Create one"}
                </Text>
              </Pressable>
            </Card>
          )}

          {/* Privacy & Legal notice */}
          <View style={styles.securityNote}>
            <Ionicons name="shield-checkmark" size={16} color={Colors.primary[600]} />
            <Text style={styles.securityNoteText}>
              Your data is encrypted and kept confidential under Indian privacy laws.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing['4xl'],
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  brandIconBg: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary[200],
    marginBottom: Spacing.sm,
  },
  brandTitle: {
    fontSize: FontSize['2xl'],
    fontWeight: '800',
    color: Colors.neutral[900],
    letterSpacing: 1.5,
  },
  brandSubtitle: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.primary[600],
    marginTop: 2,
  },
  tagline: {
    fontSize: FontSize.xs,
    fontWeight: '500',
    color: Colors.neutral[500],
    marginTop: 4,
    letterSpacing: 0.5,
  },
  judgeDemoCard: {
    backgroundColor: '#FEF9C3',
    borderColor: '#FDE047',
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  judgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 4,
  },
  judgeTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: '#854D0E',
  },
  judgeSubtitle: {
    fontSize: FontSize.xs,
    color: '#713F12',
    lineHeight: 18,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.neutral[200],
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.neutral[400],
    marginHorizontal: Spacing.md,
    letterSpacing: 0.8,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral[100],
    borderRadius: BorderRadius.lg,
    padding: 3,
    marginBottom: Spacing.lg,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  toggleBtnActive: {
    backgroundColor: Colors.neutral[0],
    ...Shadow.sm,
  },
  toggleText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    color: Colors.neutral[500],
  },
  toggleTextActive: {
    fontWeight: '700',
    color: Colors.primary[600],
  },
  formCard: {
    padding: Spacing.xl,
    backgroundColor: Colors.neutral[0],
  },
  fieldLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.neutral[700],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.neutral[200],
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.neutral[0],
    overflow: 'hidden',
  },
  countryCodeBadge: {
    backgroundColor: Colors.neutral[100],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRightWidth: 1,
    borderRightColor: Colors.neutral[200],
  },
  countryCodeText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.neutral[800],
  },
  phoneInput: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.neutral[900],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  otpInput: {
    borderWidth: 1.5,
    borderColor: Colors.primary[300],
    backgroundColor: Colors.primary[50],
    borderRadius: BorderRadius.lg,
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.primary[900],
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    letterSpacing: 8,
    textAlign: 'center',
  },
  otpHelper: {
    fontSize: FontSize.xs,
    color: Colors.primary[700],
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: Colors.neutral[200],
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.neutral[0],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.neutral[900],
  },
  switchAuthRow: {
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  switchAuthText: {
    fontSize: FontSize.sm,
    color: Colors.primary[600],
    fontWeight: '600',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  securityNoteText: {
    fontSize: FontSize.xs,
    color: Colors.neutral[500],
    textAlign: 'center',
  },
});
