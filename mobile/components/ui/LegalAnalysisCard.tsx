// ============================================================
// Kayda Sathi — LegalAnalysisCard Component
// ============================================================
// Renders the comprehensive 7-field AI legal analysis:
// 1. Category badge with category color
// 2. Identified Issue summary
// 3. Legal Rights under Indian Law
// 4. Action Steps with deadline tags
// 5. Required Documents (interactive checklist)
// 6. Appropriate Authority with portal link
// 7. Editable Complaint Draft with copy & share buttons

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Linking,
  Share,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing, BorderRadius, CATEGORIES } from '@/constants';
import { Card } from './Card';
import { Button } from './Button';
import { StatusBadge } from './StatusBadge';
import { ProgressBar } from './ProgressBar';
import { LegalAnalysis } from '@/services/api';

export interface LegalAnalysisCardProps {
  analysis: LegalAnalysis;
  onProceedToCase?: () => void;
  onReset?: () => void;
}

export const LegalAnalysisCard: React.FC<LegalAnalysisCardProps> = ({
  analysis,
  onProceedToCase,
  onReset,
}) => {
  // Local state for interactive document checklist
  const [checkedDocs, setCheckedDocs] = useState<Record<number, boolean>>({});

  // Local state for editable complaint draft
  const [draftText, setDraftText] = useState(analysis.complaint_draft || '');
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Stop speaking if component unmounts
  React.useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  const handleToggleSpeech = (customText?: string) => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    } else {
      const speechSummary =
        customText ||
        `Legal assessment for ${analysis.category} Law. Identified issue: ${analysis.identified_issue}. Primary legal rights: ${analysis.legal_rights?.slice(0, 2).join('. ') || ''}. Recommended immediate step: ${analysis.action_steps?.[0]?.description || ''}`;
      setIsSpeaking(true);
      Speech.speak(speechSummary, {
        pitch: 1.0,
        rate: 0.95,
        onDone: () => setIsSpeaking(false),
        onError: (err) => {
          console.warn('TTS error, retrying without language option:', err);
          Speech.speak(speechSummary, {
            onDone: () => setIsSpeaking(false),
            onError: () => setIsSpeaking(false),
          });
        },
      });
    }
  };

  // Category styling lookup
  const categoryConfig = CATEGORIES.find(
    (c) => c.label.toLowerCase().includes(analysis.category.toLowerCase()) ||
           c.shortLabel.toLowerCase().includes(analysis.category.toLowerCase())
  ) || {
    id: 'OTHER' as any,
    label: analysis.category,
    shortLabel: analysis.category,
    icon: 'shield-outline' as any,
    color: Colors.primary[600],
    bgColor: Colors.primary[50],
    description: '',
  };

  const toggleDoc = (index: number) => {
    setCheckedDocs((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const totalDocs = analysis.required_documents?.length || 0;
  const completedDocs = Object.values(checkedDocs).filter(Boolean).length;
  const docProgress = totalDocs > 0 ? (completedDocs / totalDocs) * 100 : 0;

  const handleCopyDraft = async () => {
    try {
      await Clipboard.setStringAsync(draftText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      Alert.alert('Copied to Clipboard', 'The complaint draft has been copied to your clipboard.');
    } catch (err: any) {
      Alert.alert('Copy Failed', err?.message || 'Could not copy to clipboard.');
    }
  };

  const handleShareDraft = async () => {
    try {
      await Share.share({
        title: `Legal Complaint Draft - ${analysis.category}`,
        message: draftText,
      });
    } catch (err: any) {
      console.log('Share dismissed or failed', err);
    }
  };

  const handleOpenPortal = async (url: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Unable to open URL', `Cannot open: ${url}`);
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not open portal link.');
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. Header Card: Category + Identified Issue */}
      <Card variant="elevated" style={styles.headerCard}>
        <View style={styles.categoryRow}>
          <View style={[styles.categoryBadge, { backgroundColor: categoryConfig.color + '18' }]}>
            <Ionicons name={categoryConfig.icon} size={16} color={categoryConfig.color} />
            <Text style={[styles.categoryBadgeText, { color: categoryConfig.color }]}>
              {analysis.category.toUpperCase()} LAW
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
            <Pressable
              style={[styles.ttsButton, isSpeaking && styles.ttsButtonActive]}
              onPress={() => handleToggleSpeech()}
              hitSlop={8}
            >
              <Ionicons
                name={isSpeaking ? 'stop-circle' : 'volume-high-outline'}
                size={15}
                color={isSpeaking ? Colors.error[600] : Colors.primary[600]}
              />
              <Text style={[styles.ttsButtonText, isSpeaking && styles.ttsButtonTextActive]}>
                {isSpeaking ? 'Stop' : 'Listen'}
              </Text>
            </Pressable>
            <StatusBadge label="AI ANALYZED" variant="success" size="sm" />
          </View>
        </View>

        <Text style={styles.issueHeading}>Identified Legal Issue</Text>
        <Text style={styles.issueText}>{analysis.identified_issue}</Text>
      </Card>

      {/* 2. Legal Rights Section */}
      <Card variant="outlined" style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionIconBg}>
            <Ionicons name="scale-outline" size={20} color={Colors.primary[600]} />
          </View>
          <View style={styles.sectionTitleBlock}>
            <Text style={styles.sectionTitle}>Your Legal Rights</Text>
            <Text style={styles.sectionSubtitle}>Guaranteed protections under Indian Law</Text>
          </View>
        </View>

        <View style={styles.rightsList}>
          {analysis.legal_rights?.map((right, idx) => (
            <View key={idx} style={styles.rightItem}>
              <View style={styles.rightBullet}>
                <Ionicons name="shield-checkmark" size={16} color={Colors.primary[600]} />
              </View>
              <Text style={styles.rightText}>{right}</Text>
            </View>
          ))}
        </View>
      </Card>

      {/* 3. Action Steps */}
      <Card variant="outlined" style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionIconBg}>
            <Ionicons name="list-outline" size={20} color={Colors.warning[600]} />
          </View>
          <View style={styles.sectionTitleBlock}>
            <Text style={styles.sectionTitle}>Action Steps</Text>
            <Text style={styles.sectionSubtitle}>Follow this legal roadmap sequentially</Text>
          </View>
        </View>

        <View style={styles.stepsList}>
          {analysis.action_steps?.map((step, idx) => (
            <View key={step.step || idx} style={styles.stepCard}>
              <View style={styles.stepHeaderRow}>
                <View style={styles.stepNumberBadge}>
                  <Text style={styles.stepNumberText}>{step.step || idx + 1}</Text>
                </View>
                <Text style={styles.stepTitle}>{step.title}</Text>
              </View>
              <Text style={styles.stepDescription}>{step.description}</Text>
              {step.deadline ? (
                <View style={styles.stepDeadlineRow}>
                  <Ionicons name="alarm-outline" size={13} color={Colors.warning[700]} />
                  <Text style={styles.stepDeadlineText}>{step.deadline}</Text>
                </View>
              ) : null}
            </View>
          ))}
        </View>
      </Card>

      {/* 4. Required Documents Checklist */}
      <Card variant="outlined" style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionIconBg}>
            <Ionicons name="folder-open-outline" size={20} color={Colors.success[600]} />
          </View>
          <View style={styles.sectionTitleBlock}>
            <Text style={styles.sectionTitle}>Required Evidence Checklist</Text>
            <Text style={styles.sectionSubtitle}>
              {completedDocs} of {totalDocs} documents ready
            </Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <ProgressBar label="Document Readiness" value={docProgress} color={Colors.success[500]} height={6} />
        </View>

        <View style={styles.checklist}>
          {analysis.required_documents?.map((doc, idx) => {
            const isChecked = !!checkedDocs[idx];
            return (
              <Pressable
                key={idx}
                style={[styles.checklistItem, isChecked && styles.checklistItemChecked]}
                onPress={() => toggleDoc(idx)}
              >
                <Ionicons
                  name={isChecked ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={isChecked ? Colors.success[600] : Colors.neutral[400]}
                />
                <Text
                  style={[
                    styles.checklistText,
                    isChecked && styles.checklistTextChecked,
                  ]}
                >
                  {doc}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      {/* 5. Appropriate Authority */}
      {analysis.appropriate_authority && (
        <Card variant="outlined" style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionIconBg}>
              <Ionicons name="business-outline" size={20} color={Colors.info[600]} />
            </View>
            <View style={styles.sectionTitleBlock}>
              <Text style={styles.sectionTitle}>Appropriate Legal Authority</Text>
              <Text style={styles.sectionSubtitle}>Where to lodge your dispute</Text>
            </View>
          </View>

          <View style={styles.authorityBox}>
            <Text style={styles.authorityName}>{analysis.appropriate_authority.name}</Text>
            <View style={styles.authorityJurisdictionRow}>
              <Ionicons name="location-outline" size={14} color={Colors.neutral[500]} />
              <Text style={styles.authorityJurisdiction}>
                Jurisdiction: {analysis.appropriate_authority.jurisdiction}
              </Text>
            </View>

            {analysis.appropriate_authority.portal ? (
              <Button
                title="Visit Official Filing Portal"
                onPress={() => handleOpenPortal(analysis.appropriate_authority.portal)}
                variant="outline"
                size="sm"
                icon="open-outline"
                style={{ marginTop: Spacing.sm }}
              />
            ) : null}
          </View>
        </Card>
      )}

      {/* 6. Editable Complaint Draft */}
      <Card variant="outlined" style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionIconBg}>
            <Ionicons name="document-text-outline" size={20} color={Colors.primary[600]} />
          </View>
          <View style={styles.sectionTitleBlock}>
            <Text style={styles.sectionTitle}>Formal Complaint Notice Draft</Text>
            <Text style={styles.sectionSubtitle}>Edit details before sending or filing</Text>
          </View>
        </View>

        <TextInput
          style={styles.draftTextInput}
          multiline
          numberOfLines={10}
          value={draftText}
          onChangeText={setDraftText}
          textAlignVertical="top"
        />

        <View style={styles.draftActionsRow}>
          <Button
            title={isSpeaking ? 'Stop' : 'Listen'}
            onPress={() => handleToggleSpeech(draftText)}
            variant="outline"
            size="sm"
            icon={isSpeaking ? 'stop-circle' : 'volume-high-outline'}
            style={styles.draftActionBtn}
          />
          <Button
            title={copied ? 'Copied!' : 'Copy'}
            onPress={handleCopyDraft}
            variant={copied ? 'primary' : 'outline'}
            size="sm"
            icon={copied ? 'checkmark-circle' : 'copy-outline'}
            style={styles.draftActionBtn}
          />
          <Button
            title="Share"
            onPress={handleShareDraft}
            variant="outline"
            size="sm"
            icon="share-social-outline"
            style={styles.draftActionBtn}
          />
        </View>
      </Card>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        {onProceedToCase && (
          <Button
            title="Save as Active Case Dossier"
            onPress={onProceedToCase}
            variant="primary"
            size="lg"
            fullWidth
            icon="folder-outline"
          />
        )}
        {onReset && (
          <Button
            title="Start Another Query"
            onPress={onReset}
            variant="ghost"
            size="md"
            style={{ marginTop: Spacing.xs }}
          />
        )}
      </View>
    </View>
  );
};

export default LegalAnalysisCard;

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  headerCard: {
    padding: Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary[600],
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    gap: 6,
  },
  categoryBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  issueHeading: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: Colors.neutral[500],
    letterSpacing: 0.8,
    marginTop: Spacing.xs,
  },
  issueText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.neutral[900],
    marginTop: 2,
    lineHeight: 24,
  },
  sectionCard: {
    padding: Spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  sectionTitleBlock: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.neutral[900],
  },
  sectionSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.neutral[500],
    marginTop: 1,
  },
  rightsList: {
    gap: Spacing.sm,
  },
  rightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.neutral[50],
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  rightBullet: {
    marginTop: 2,
  },
  rightText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.neutral[800],
    lineHeight: 20,
  },
  stepsList: {
    gap: Spacing.sm,
  },
  stepCard: {
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.warning[500],
  },
  stepHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: Spacing.xs,
  },
  stepNumberBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.warning[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.neutral[0],
  },
  stepTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.neutral[900],
    flex: 1,
  },
  stepDescription: {
    fontSize: FontSize.sm,
    color: Colors.neutral[600],
    lineHeight: 20,
    marginTop: 2,
  },
  stepDeadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.xs,
    backgroundColor: Colors.warning[50],
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  stepDeadlineText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.warning[700],
  },
  progressContainer: {
    marginBottom: Spacing.md,
  },
  checklist: {
    gap: Spacing.xs,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.neutral[50],
    gap: Spacing.sm,
  },
  checklistItemChecked: {
    backgroundColor: Colors.success[50],
  },
  checklistText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.neutral[800],
  },
  checklistTextChecked: {
    textDecorationLine: 'line-through',
    color: Colors.neutral[400],
  },
  authorityBox: {
    backgroundColor: Colors.neutral[50],
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  authorityName: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.neutral[900],
  },
  authorityJurisdictionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  authorityJurisdiction: {
    fontSize: FontSize.xs,
    color: Colors.neutral[600],
  },
  draftTextInput: {
    minHeight: 180,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.sm,
    color: Colors.neutral[900],
    backgroundColor: Colors.neutral[50],
    lineHeight: 22,
    fontFamily: undefined,
  },
  draftActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  draftActionBtn: {
    flex: 1,
  },
  bottomActions: {
    marginTop: Spacing.md,
    gap: Spacing.xs,
  },
  ttsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary[50],
    borderWidth: 1,
    borderColor: Colors.primary[200],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  ttsButtonActive: {
    backgroundColor: Colors.error[50],
    borderColor: Colors.error[200],
  },
  ttsButtonText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.primary[600],
  },
  ttsButtonTextActive: {
    color: Colors.error[600],
  },
});
