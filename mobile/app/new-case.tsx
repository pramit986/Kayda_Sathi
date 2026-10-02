// ============================================================
// Kayda Sathi — New Case Intake Screen (Phases 2 & 4)
// ============================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing, BorderRadius, CATEGORIES } from '@/constants';
import { Button, Card, StatusBadge, LegalAnalysisCard } from '@/components/ui';
import { VoiceInput } from '@/components/VoiceInput';
import { CaseStore } from '@/store/caseStore';
import { api, LegalAnalysis } from '@/services/api';
import { IntakeQuestion, IntakeAnswer, Case } from '@/types';

const SAMPLE_SCENARIOS = [
  {
    title: 'Rental Deposit',
    desc: 'My landlord in Bangalore is refusing to return my security deposit of ₹45,000 after I vacated the flat on 1st March. He claims deductions for repainting.',
  },
  {
    title: 'E-Commerce Deficiency',
    desc: 'I ordered a laptop worth ₹58,000 on an e-commerce platform. It was delivered damaged, and the seller has rejected my return request citing packaging policy.',
  },
  {
    title: 'UPI Fraud',
    desc: 'Unauthorized UPI transaction of ₹18,500 was debited from my savings bank account at 2 AM without any OTP or alert. The bank refused to reverse the amount.',
  },
];

export default function NewCaseScreen() {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'describe' | 'analysis' | 'intake'>('describe');
  const [analysisResult, setAnalysisResult] = useState<LegalAnalysis | null>(null);
  const [createdCase, setCreatedCase] = useState<Case | null>(null);
  const [intakeQuestions, setIntakeQuestions] = useState<IntakeQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleStartAnalysis = async () => {
    if (description.trim().length < 10) {
      Alert.alert('Please describe your issue', 'Enter at least 10 characters so AI can understand your problem.');
      return;
    }

    setLoading(true);
    try {
      const result = await api.analyzeText(description.trim());
      setAnalysisResult(result);
      setStep('analysis');
    } catch (err: any) {
      Alert.alert('Analysis Error', err?.message || 'Could not analyze problem. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToCase = async () => {
    setLoading(true);
    try {
      const issueText = description.trim() || analysisResult?.identified_issue || 'Legal dispute';
      const result = await CaseStore.createCase({
        description: issueText,
        inputType: analysisResult?.transcribed_text ? 'VOICE' : 'TEXT',
      });

      setCreatedCase(result.case);
      setIntakeQuestions(result.intakeQuestions || []);
      // Initialize default answers
      const initialAnswers: Record<string, string> = {};
      (result.intakeQuestions || []).forEach((q) => {
        initialAnswers[q.questionId] = q.options ? q.options[0] : '';
      });
      setAnswers(initialAnswers);

      if (result.intakeQuestions && result.intakeQuestions.length > 0) {
        setStep('intake');
      } else {
        router.replace({
          pathname: '/case/[id]',
          params: { id: result.case.id },
        });
      }
    } catch (err: any) {
      Alert.alert('Case Creation Error', err?.message || 'Could not save case dossier.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteIntake = async () => {
    if (!createdCase) return;

    setLoading(true);
    try {
      const formattedAnswers: IntakeAnswer[] = Object.entries(answers).map(
        ([questionId, answer]) => ({ questionId, answer })
      );

      await CaseStore.submitIntake(createdCase.id, formattedAnswers);

      // Navigate to the case detail page!
      router.replace({
        pathname: '/case/[id]',
        params: { id: createdCase.id },
      });
    } catch (err: any) {
      Alert.alert('Submission Error', err?.message || 'Failed to submit intake answers.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipIntake = () => {
    if (!createdCase) return;
    router.replace({
      pathname: '/case/[id]',
      params: { id: createdCase.id },
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => {
              if (step === 'analysis') {
                setStep('describe');
              } else if (step === 'intake') {
                setStep('analysis');
              } else {
                router.back();
              }
            }}
            hitSlop={12}
          >
            <Ionicons
              name={step === 'describe' ? 'close' : 'arrow-back'}
              size={24}
              color={Colors.neutral[600]}
            />
          </Pressable>
          <Text style={styles.headerTitle}>
            {step === 'describe'
              ? 'Describe Your Problem'
              : step === 'analysis'
              ? 'AI Legal Assessment'
              : 'Clarifying Details'}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {step === 'describe' ? (
            <>
              {/* Prompt Section */}
              <View style={styles.promptSection}>
                <View style={styles.promptIconBg}>
                  <Ionicons name="sparkles" size={28} color={Colors.primary[500]} />
                </View>
                <Text style={styles.promptTitle}>From Story to Action</Text>
                <Text style={styles.promptSubtitle}>
                  Describe your legal problem in plain language. Kayda Sathi AI will classify it, extract objective facts, and map your claims.
                </Text>
              </View>

              {/* Sample Presets */}
              <View style={styles.presetsContainer}>
                <Text style={styles.sectionLabel}>Quick test scenarios:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
                  {SAMPLE_SCENARIOS.map((s, idx) => (
                    <Pressable
                      key={idx}
                      style={styles.presetChip}
                      onPress={() => setDescription(s.desc)}
                    >
                      <Ionicons name="flash-outline" size={14} color={Colors.primary[600]} />
                      <Text style={styles.presetText}>{s.title}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              {/* Voice Input Section */}
              <VoiceInput
                mode="transcribe"
                onTranscribeSuccess={(txt) => {
                  setDescription(txt);
                }}
                fallbackText={description}
                disabled={loading}
              />

              <View style={styles.orDivider}>
                <View style={styles.orDividerLine} />
                <Text style={styles.orDividerText}>OR TYPE YOUR PROBLEM</Text>
                <View style={styles.orDividerLine} />
              </View>

              {/* Description Input */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  multiline
                  numberOfLines={6}
                  placeholder="Example: My landlord is refusing to return my ₹30,000 security deposit after vacating on 1st March. He claims deductions for repainting."
                  placeholderTextColor={Colors.neutral[400]}
                  value={description}
                  onChangeText={setDescription}
                  textAlignVertical="top"
                />
                <View style={styles.inputFooter}>
                  <Text style={styles.charCount}>{description.length} / 2000</Text>
                  <Pressable
                    style={styles.voiceInputButton}
                    onPress={() => {
                      setDescription('Landlord withheld 40000 rupees security deposit despite 15 days notice and clean handover.');
                    }}
                  >
                    <Ionicons name="sparkles" size={16} color={Colors.primary[500]} />
                    <Text style={styles.voiceText}>Fill Sample</Text>
                  </Pressable>
                </View>
              </View>

              {/* Submit Button */}
              <Button
                title={loading ? 'Analyzing with AI...' : 'Analyze Case with AI'}
                onPress={handleStartAnalysis}
                variant="primary"
                size="lg"
                fullWidth
                disabled={description.trim().length < 10 || loading}
                icon={loading ? undefined : 'sparkles-outline'}
                style={{ marginTop: Spacing.xl }}
              />

              {loading && (
                <View style={styles.loadingBanner}>
                  <ActivityIndicator size="small" color={Colors.primary[500]} />
                  <Text style={styles.loadingText}>Gemini AI is analyzing legal grounds and extracting facts...</Text>
                </View>
              )}

              {/* Categories Grid */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>Covered Legal Areas</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.categoryGrid}>
                {CATEGORIES.map((cat) => (
                  <View key={cat.id} style={styles.categoryChip}>
                    <Ionicons name={cat.icon} size={15} color={cat.color} />
                    <Text style={styles.categoryChipText}>{cat.shortLabel}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : step === 'analysis' && analysisResult ? (
            <LegalAnalysisCard
              analysis={analysisResult}
              onProceedToCase={handleProceedToCase}
              onReset={() => {
                setAnalysisResult(null);
                setStep('describe');
              }}
            />
          ) : (
            <>
              {/* Step 2: Intake Questions */}
              <Card variant="outlined" style={styles.aiBadgeCard}>
                <View style={styles.aiBadgeRow}>
                  <StatusBadge label={createdCase?.category || 'CLASSIFIED'} variant="info" />
                  <Text style={styles.aiJurisdiction}>{createdCase?.jurisdiction}</Text>
                </View>
                <Text style={styles.aiCaseTitle}>{createdCase?.title}</Text>
                <Text style={styles.aiCaseSub}>
                  AI has extracted {createdCase?.facts.length} initial facts and {createdCase?.claims.length} claims.
                  Answer a few quick questions to strengthen your case readiness.
                </Text>
              </Card>

              <Text style={styles.intakeHeader}>Clarifying Questions</Text>

              {intakeQuestions.map((q, idx) => (
                <View key={q.questionId} style={styles.questionCard}>
                  <View style={styles.questionNumRow}>
                    <View style={styles.questionNumBadge}>
                      <Text style={styles.questionNumText}>{idx + 1}</Text>
                    </View>
                    <Text style={styles.questionTitle}>{q.question}</Text>
                  </View>

                  {q.type === 'SELECT' && q.options ? (
                    <View style={styles.optionsWrap}>
                      {q.options.map((opt: string) => {
                        const isSelected = answers[q.questionId] === opt;
                        return (
                          <Pressable
                            key={opt}
                            style={[
                              styles.optionChip,
                              isSelected && styles.optionChipActive,
                            ]}
                            onPress={() =>
                              setAnswers(prev => ({ ...prev, [q.questionId]: opt }))
                            }
                          >
                            <Ionicons
                              name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                              size={16}
                              color={isSelected ? Colors.primary[600] : Colors.neutral[400]}
                            />
                            <Text
                              style={[
                                styles.optionText,
                                isSelected && styles.optionTextActive,
                              ]}
                            >
                              {opt}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  ) : q.type === 'AMOUNT' ? (
                    <View style={styles.amountInputRow}>
                      <Text style={styles.currencySymbol}>₹</Text>
                      <TextInput
                        style={styles.amountInput}
                        keyboardType="numeric"
                        placeholder="e.g. 35000"
                        placeholderTextColor={Colors.neutral[400]}
                        value={answers[q.questionId] || ''}
                        onChangeText={(txt: string) =>
                          setAnswers(prev => ({ ...prev, [q.questionId]: txt }))
                        }
                      />
                    </View>
                  ) : (
                    <TextInput
                      style={styles.simpleTextInput}
                      placeholder="Type your answer..."
                      placeholderTextColor={Colors.neutral[400]}
                      value={answers[q.questionId] || ''}
                      onChangeText={(txt: string) =>
                        setAnswers(prev => ({ ...prev, [q.questionId]: txt }))
                      }
                    />
                  )}
                </View>
              ))}

              <Button
                title={loading ? 'Updating Case Analysis...' : 'Complete & View Legal Dossier'}
                onPress={handleCompleteIntake}
                variant="primary"
                size="lg"
                fullWidth
                disabled={loading}
                icon="checkmark-circle-outline"
                style={{ marginTop: Spacing.xl }}
              />

              <Button
                title="Skip to Case Dossier"
                onPress={handleSkipIntake}
                variant="ghost"
                size="md"
                style={{ marginTop: Spacing.md }}
              />
            </>
          )}

          <View style={{ height: Spacing['6xl'] }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.neutral[900],
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.xl,
  },
  promptSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  promptIconBg: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  promptTitle: {
    fontSize: FontSize['2xl'],
    fontWeight: '700',
    color: Colors.neutral[900],
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  promptSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.neutral[500],
    textAlign: 'center',
    marginTop: Spacing.xs,
    lineHeight: 20,
    maxWidth: 320,
  },
  presetsContainer: {
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.neutral[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  presetScroll: {
    flexDirection: 'row',
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary[50],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  presetText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.primary[700],
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.neutral[50],
  },
  textInput: {
    padding: Spacing.lg,
    fontSize: FontSize.md,
    color: Colors.neutral[900],
    lineHeight: 24,
    minHeight: 140,
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
    backgroundColor: Colors.neutral[0],
  },
  charCount: {
    fontSize: FontSize.xs,
    color: Colors.neutral[400],
  },
  voiceInputButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary[50],
  },
  voiceText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.primary[600],
  },
  loadingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary[50],
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  loadingText: {
    fontSize: FontSize.xs,
    color: Colors.primary[700],
    flex: 1,
    lineHeight: 18,
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.sm,
  },
  orDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.neutral[200],
  },
  orDividerText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.neutral[400],
    marginHorizontal: Spacing.md,
    letterSpacing: 0.5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.neutral[200],
  },
  dividerText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.neutral[400],
    marginHorizontal: Spacing.md,
    textTransform: 'uppercase',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neutral[50],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  categoryChipText: {
    fontSize: FontSize.xs,
    fontWeight: '500',
    color: Colors.neutral[700],
  },
  aiBadgeCard: {
    backgroundColor: Colors.primary[50],
    borderColor: Colors.primary[200],
    marginBottom: Spacing.xl,
  },
  aiBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  aiJurisdiction: {
    fontSize: FontSize.xs,
    fontWeight: '500',
    color: Colors.primary[700],
  },
  aiCaseTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.neutral[900],
    marginBottom: Spacing.xs,
  },
  aiCaseSub: {
    fontSize: FontSize.xs,
    color: Colors.neutral[600],
    lineHeight: 18,
  },
  intakeHeader: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.neutral[900],
    marginBottom: Spacing.md,
  },
  questionCard: {
    backgroundColor: Colors.neutral[50],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  questionNumRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  questionNumBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  questionNumText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.neutral[0],
  },
  questionTitle: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.neutral[900],
    flex: 1,
    lineHeight: 20,
  },
  optionsWrap: {
    gap: Spacing.xs,
  },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.neutral[0],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  optionChipActive: {
    backgroundColor: Colors.primary[50],
    borderColor: Colors.primary[400],
  },
  optionText: {
    fontSize: FontSize.sm,
    color: Colors.neutral[700],
    flex: 1,
  },
  optionTextActive: {
    fontWeight: '600',
    color: Colors.primary[700],
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[0],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
  },
  currencySymbol: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.neutral[600],
    marginRight: Spacing.xs,
  },
  amountInput: {
    flex: 1,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.md,
    color: Colors.neutral[900],
  },
  simpleTextInput: {
    backgroundColor: Colors.neutral[0],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.sm,
    color: Colors.neutral[900],
  },
});
