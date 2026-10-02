// ============================================================
// Kayda Sathi — Evidence Vault Screen (Phase 3 & 4)
// ============================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Colors, FontSize, Spacing, BorderRadius } from '@/constants';
import { Card, SectionHeader, StatusBadge, Button } from '@/components/ui';
import { useEvidence } from '@/store/caseStore';
import { Evidence, EvidenceType } from '@/types';
import { DEMO_EVIDENCE_GAPS } from '@/store/demoData';

const EVIDENCE_TYPE_ICONS: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string; label: string }> = {
  RENTAL_AGREEMENT: { icon: 'document-text-outline', color: '#7C3AED', bg: '#F5F3FF', label: 'Rental Agreement' },
  PAYMENT_PROOF: { icon: 'card-outline', color: Colors.success[600], bg: Colors.success[50], label: 'Payment / UPI Proof' },
  WHATSAPP_SCREENSHOT: { icon: 'chatbubble-outline', color: '#059669', bg: '#ECFDF5', label: 'WhatsApp Screenshot' },
  PHOTOGRAPH: { icon: 'camera-outline', color: Colors.info[600], bg: Colors.info[50], label: 'Photograph' },
  PDF: { icon: 'document-outline', color: Colors.error[600], bg: Colors.error[50], label: 'Official Document / PDF' },
  IMAGE: { icon: 'image-outline', color: Colors.primary[500], bg: Colors.primary[50], label: 'General Image' },
  SCREENSHOT: { icon: 'phone-portrait-outline', color: Colors.neutral[600], bg: Colors.neutral[50], label: 'Screenshot' },
  EMAIL_SCREENSHOT: { icon: 'mail-outline', color: Colors.info[700], bg: Colors.info[50], label: 'Email Record' },
  AUDIO: { icon: 'mic-outline', color: Colors.warning[600], bg: Colors.warning[50], label: 'Audio Recording' },
  TEXT_NOTE: { icon: 'create-outline', color: Colors.neutral[700], bg: Colors.neutral[100], label: 'Text Note' },
};

const EVIDENCE_TYPES: EvidenceType[] = [
  'RENTAL_AGREEMENT',
  'PAYMENT_PROOF',
  'WHATSAPP_SCREENSHOT',
  'PHOTOGRAPH',
  'PDF',
  'EMAIL_SCREENSHOT',
];

export default function EvidenceScreen() {
  const { evidence, addEvidence, cases } = useEvidence();
  const [selectedCaseId, setSelectedCaseId] = useState<string>('ALL');

  // Modal states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedEvidenceDetail, setSelectedEvidenceDetail] = useState<Evidence | null>(null);
  const [isNoDocsModalOpen, setIsNoDocsModalOpen] = useState(false);

  // Form states
  const [targetCaseId, setTargetCaseId] = useState<string>(cases[0]?.id || '');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<EvidenceType>('PAYMENT_PROOF');
  const [documentDate, setDocumentDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [selectedFileUri, setSelectedFileUri] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Filter evidence
  const filteredEvidence = selectedCaseId === 'ALL'
    ? evidence
    : evidence.filter(e => e.caseId === selectedCaseId);

  const gaps = DEMO_EVIDENCE_GAPS;
  const totalExpected = filteredEvidence.length + gaps.length;
  const completeness = totalExpected > 0 ? Math.round((filteredEvidence.length / totalExpected) * 100) : 0;

  // Pick Image from Gallery
  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedFileUri(asset.uri);
        setSelectedFileName(asset.fileName || 'evidence_image.jpg');
        if (!title) {
          setTitle('Proof Screenshot');
        }
      }
    } catch (err: any) {
      Alert.alert('Image Picker Error', err?.message || 'Could not select image');
    }
  };

  // Pick Document
  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedFileUri(asset.uri);
        setSelectedFileName(asset.name);
        if (!title) {
          setTitle(asset.name.replace(/\.[^/.]+$/, ''));
        }
      }
    } catch (err: any) {
      Alert.alert('Document Picker Error', err?.message || 'Could not select document');
    }
  };

  // Upload
  const handleUploadSubmit = async () => {
    const finalCaseId = targetCaseId || cases[0]?.id;
    if (!finalCaseId) {
      Alert.alert('No Case Selected', 'Please select a case to attach evidence to.');
      return;
    }
    if (!title.trim()) {
      Alert.alert('Title Required', 'Please enter a title for this evidence.');
      return;
    }

    setUploading(true);
    try {
      await addEvidence({
        caseId: finalCaseId,
        title: title.trim(),
        type,
        documentDate,
        description: description.trim() || undefined,
        fileUri: selectedFileUri || undefined,
        fileName: selectedFileName || undefined,
      });

      Alert.alert('Evidence Added', 'AI has processed this evidence and extracted key legal facts.');
      // Reset form
      setTitle('');
      setDescription('');
      setSelectedFileUri(null);
      setSelectedFileName(null);
      setIsUploadModalOpen(false);
    } catch (err: any) {
      Alert.alert('Upload Error', err?.message || 'Failed to add evidence.');
    } finally {
      setUploading(false);
    }
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
          <View>
            <Text style={styles.title}>Evidence Vault</Text>
            <Text style={styles.subtitle}>Secure digital trail & fact verification</Text>
          </View>
          <Pressable
            style={styles.addButton}
            onPress={() => {
              if (cases.length > 0 && !targetCaseId) {
                setTargetCaseId(cases[0].id);
              }
              setIsUploadModalOpen(true);
            }}
          >
            <Ionicons name="add" size={22} color={Colors.neutral[0]} />
          </Pressable>
        </View>

        {/* Case Filter selector */}
        {cases.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar}>
            <Pressable
              style={[styles.filterChip, selectedCaseId === 'ALL' && styles.filterChipActive]}
              onPress={() => setSelectedCaseId('ALL')}
            >
              <Text style={[styles.filterChipText, selectedCaseId === 'ALL' && styles.filterChipTextActive]}>
                All Cases ({evidence.length})
              </Text>
            </Pressable>
            {cases.map(c => (
              <Pressable
                key={c.id}
                style={[styles.filterChip, selectedCaseId === c.id && styles.filterChipActive]}
                onPress={() => setSelectedCaseId(c.id)}
              >
                <Text style={[styles.filterChipText, selectedCaseId === c.id && styles.filterChipTextActive]}>
                  {c.title.length > 20 ? c.title.slice(0, 18) + '...' : c.title}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* Completeness Card */}
        <View style={styles.section}>
          <Card variant="elevated">
            <View style={styles.completenessHeader}>
              <View style={styles.completenessIconBg}>
                <Ionicons name="shield-checkmark" size={20} color={Colors.primary[500]} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.completenessTitle}>Evidence Completeness</Text>
                <Text style={styles.completenessSubtitle}>
                  {filteredEvidence.length} verified item{filteredEvidence.length === 1 ? '' : 's'} · {gaps.length} critical gaps
                </Text>
              </View>
              <Text style={styles.completenessPercent}>{completeness}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${completeness}%` }]} />
            </View>
          </Card>
        </View>

        {/* No Documents Banner Button */}
        <View style={styles.section}>
          <Pressable
            style={styles.noDocsBanner}
            onPress={() => setIsNoDocsModalOpen(true)}
          >
            <View style={styles.noDocsBannerIcon}>
              <Ionicons name="help-buoy-outline" size={20} color={Colors.warning[700]} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.noDocsBannerTitle}>Don't Have Paper Documents?</Text>
              <Text style={styles.noDocsBannerSubtitle}>
                Tap here for 5 statutory ways to build proof under BSA 2023 without paper receipts
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.warning[700]} />
          </Pressable>
        </View>

        {/* Collected Evidence Section */}
        <SectionHeader title="Collected Proof" subtitle="Categorized & verified for Indian statutory forums" />
        <View style={styles.section}>
          {filteredEvidence.length > 0 ? (
            filteredEvidence.map((evi) => {
              const typeInfo = EVIDENCE_TYPE_ICONS[evi.type] || EVIDENCE_TYPE_ICONS.IMAGE;
              return (
                <Card
                  key={evi.id}
                  onPress={() => setSelectedEvidenceDetail(evi)}
                  style={styles.evidenceCard}
                  variant="outlined"
                >
                  <View style={styles.evidenceRow}>
                    <View style={[styles.evidenceIcon, { backgroundColor: typeInfo.bg }]}>
                      <Ionicons name={typeInfo.icon} size={20} color={typeInfo.color} />
                    </View>
                    <View style={styles.evidenceInfo}>
                      <Text style={styles.evidenceName}>{evi.title}</Text>
                      <Text style={styles.evidenceType}>{typeInfo.label} · {evi.documentDate || 'Undated'}</Text>
                      {evi.extractedFacts && evi.extractedFacts.length > 0 && (
                        <View style={styles.factChips}>
                          <Ionicons name="flash" size={12} color={Colors.success[600]} />
                          <Text style={styles.factCount}>
                            {evi.extractedFacts.length} facts extracted by AI
                          </Text>
                        </View>
                      )}
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={Colors.neutral[400]} />
                  </View>
                </Card>
              );
            })
          ) : (
            <Card variant="outlined" style={styles.emptyEvidenceCard}>
              <Ionicons name="shield-outline" size={28} color={Colors.neutral[400]} />
              <Text style={styles.emptyEvidenceTitle}>No proof files uploaded yet</Text>
              <Text style={styles.emptyEvidenceSubtitle}>
                Add receipts, rental agreements, or screenshots to build your case.
              </Text>
              <Button
                title="Upload Document / Photo"
                onPress={() => setIsUploadModalOpen(true)}
                variant="primary"
                size="sm"
                icon="add-circle-outline"
                style={{ marginTop: Spacing.md }}
              />
            </Card>
          )}
        </View>

        {/* Evidence Gaps Section */}
        {gaps.length > 0 && (
          <>
            <SectionHeader
              title="Recommended Missing Proof"
              subtitle="Strengthens claims under Indian Evidence Act / BSA 2023"
            />
            <View style={styles.section}>
              {gaps.map((gap) => (
                <Card key={gap.id} style={styles.gapCard} variant="outlined">
                  <View style={styles.gapHeader}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={18}
                      color={gap.importance === 'HIGH' ? Colors.warning[500] : Colors.info[500]}
                    />
                    <Text style={styles.gapTitle}>{gap.description}</Text>
                    <StatusBadge
                      label={gap.importance}
                      variant={gap.importance === 'HIGH' ? 'warning' : 'info'}
                    />
                  </View>
                  <View style={styles.gapSuggestions}>
                    {gap.suggestedEvidence.map((s, i) => (
                      <Pressable
                        key={i}
                        style={styles.suggestionChip}
                        onPress={() => {
                          setTitle(s);
                          setIsUploadModalOpen(true);
                        }}
                      >
                        <Ionicons name="add-circle" size={15} color={Colors.primary[600]} />
                        <Text style={styles.suggestionText}>{s}</Text>
                      </Pressable>
                    ))}
                  </View>
                </Card>
              ))}
            </View>
          </>
        )}

        <View style={{ height: Spacing['4xl'] }} />
      </ScrollView>

      {/* ======================================================= */}
      {/* Upload Modal */}
      {/* ======================================================= */}
      <Modal
        visible={isUploadModalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsUploadModalOpen(false)}
      >
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Evidence to Vault</Text>
            <Pressable onPress={() => setIsUploadModalOpen(false)} hitSlop={10}>
              <Ionicons name="close" size={24} color={Colors.neutral[700]} />
            </Pressable>
          </View>

          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
            {/* Target Case Selector */}
            <Text style={styles.fieldLabel}>Attach to Case</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.casePickerBar}>
              {cases.map((c) => (
                <Pressable
                  key={c.id}
                  style={[styles.casePickerChip, targetCaseId === c.id && styles.casePickerChipActive]}
                  onPress={() => setTargetCaseId(c.id)}
                >
                  <Text style={[styles.casePickerText, targetCaseId === c.id && styles.casePickerTextActive]}>
                    {c.title}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Evidence Title */}
            <Text style={styles.fieldLabel}>Document / Proof Title *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Registered Rental Agreement, UPI Receipt"
              placeholderTextColor={Colors.neutral[400]}
              value={title}
              onChangeText={setTitle}
            />

            {/* Evidence Type */}
            <Text style={styles.fieldLabel}>Evidence Category</Text>
            <View style={styles.typeGrid}>
              {EVIDENCE_TYPES.map((t) => {
                const info = EVIDENCE_TYPE_ICONS[t];
                const isSelected = type === t;
                return (
                  <Pressable
                    key={t}
                    style={[styles.typeButton, isSelected && styles.typeButtonActive]}
                    onPress={() => setType(t)}
                  >
                    <Ionicons
                      name={info.icon}
                      size={18}
                      color={isSelected ? Colors.primary[700] : info.color}
                    />
                    <Text style={[styles.typeButtonText, isSelected && styles.typeButtonTextActive]}>
                      {info.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* File Pick Buttons */}
            <Text style={styles.fieldLabel}>Attach File or Screenshot</Text>
            <View style={styles.fileButtonsRow}>
              <Pressable style={styles.filePickBtn} onPress={handlePickImage}>
                <Ionicons name="images-outline" size={20} color={Colors.primary[600]} />
                <Text style={styles.filePickBtnText}>Photo / Screenshot</Text>
              </Pressable>
              <Pressable style={styles.filePickBtn} onPress={handlePickDocument}>
                <Ionicons name="document-attach-outline" size={20} color={Colors.primary[600]} />
                <Text style={styles.filePickBtnText}>PDF / Document</Text>
              </Pressable>
            </View>

            {selectedFileName && (
              <View style={styles.selectedFileBadge}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.success[600]} />
                <Text style={styles.selectedFileText} numberOfLines={1}>
                  Selected: {selectedFileName}
                </Text>
              </View>
            )}

            {/* Document Date */}
            <Text style={styles.fieldLabel}>Document Date (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="2026-03-15"
              placeholderTextColor={Colors.neutral[400]}
              value={documentDate}
              onChangeText={setDocumentDate}
            />

            {/* Description */}
            <Text style={styles.fieldLabel}>Notes / Relevance</Text>
            <TextInput
              style={[styles.textInput, { height: 80 }]}
              multiline
              placeholder="Why this document matters (e.g. Clause 4 states 100% refund of deposit)"
              placeholderTextColor={Colors.neutral[400]}
              value={description}
              onChangeText={setDescription}
              textAlignVertical="top"
            />

            <Button
              title={uploading ? 'Analyzing with AI...' : 'Upload & Extract Facts'}
              onPress={handleUploadSubmit}
              variant="primary"
              size="lg"
              fullWidth
              disabled={uploading || !title.trim()}
              icon={uploading ? undefined : 'sparkles-outline'}
              style={{ marginTop: Spacing.xl }}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ======================================================= */}
      {/* Evidence Detail Modal */}
      {/* ======================================================= */}
      <Modal
        visible={Boolean(selectedEvidenceDetail)}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedEvidenceDetail(null)}
      >
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle} numberOfLines={1}>
              {selectedEvidenceDetail?.title}
            </Text>
            <Pressable onPress={() => setSelectedEvidenceDetail(null)} hitSlop={10}>
              <Ionicons name="close" size={24} color={Colors.neutral[700]} />
            </Pressable>
          </View>

          {selectedEvidenceDetail && (
            <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
              <View style={styles.detailMetaRow}>
                <StatusBadge
                  label={selectedEvidenceDetail.type.replace(/_/g, ' ')}
                  variant="info"
                />
                <Text style={styles.detailDate}>Dated: {selectedEvidenceDetail.documentDate}</Text>
              </View>

              {selectedEvidenceDetail.description && (
                <Text style={styles.detailDesc}>{selectedEvidenceDetail.description}</Text>
              )}

              <SectionHeader title="AI Extracted Facts" subtitle="Admissible factual propositions" />
              <View style={styles.factsListWrap}>
                {selectedEvidenceDetail.extractedFacts.map((ef: any) => (
                  <View key={ef.id} style={styles.factCard}>
                    <View style={styles.factHeader}>
                      <Ionicons name="shield-checkmark" size={16} color={Colors.success[600]} />
                      <Text style={styles.factStatement}>{ef.statement}</Text>
                    </View>
                    <View style={styles.factFooter}>
                      <Text style={styles.factConfidence}>Confidence: {ef.confidence}</Text>
                    </View>
                  </View>
                ))}
              </View>

              {selectedEvidenceDetail.relatedClaims.length > 0 && (
                <>
                  <SectionHeader title="Supported Legal Claims" />
                  {selectedEvidenceDetail.relatedClaims.map((rc: string, idx: number) => (
                    <View key={idx} style={styles.claimSupportBadge}>
                      <Ionicons name="link" size={14} color={Colors.primary[600]} />
                      <Text style={styles.claimSupportText}>{rc}</Text>
                    </View>
                  ))}
                </>
              )}
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      {/* ======================================================= */}
      {/* No Documents Present - Legal Guidance Modal */}
      {/* ======================================================= */}
      <Modal
        visible={isNoDocsModalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsNoDocsModalOpen(false)}
      >
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalTitle}>No Documents? Legal Action Plan</Text>
              <Text style={styles.noDocsModalSub}>
                How to prove your case without formal paper receipts (BSA 2023 / BNSS)
              </Text>
            </View>
            <Pressable onPress={() => setIsNoDocsModalOpen(false)} hitSlop={10}>
              <Ionicons name="close" size={24} color={Colors.neutral[700]} />
            </Pressable>
          </View>

          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
            <Card variant="outlined" style={styles.noDocsInfoCard}>
              <Ionicons name="information-circle" size={20} color={Colors.info[600]} />
              <Text style={styles.noDocsInfoText}>
                Under Indian Evidence Act & Bharatiya Sakshya Adhiniyam (BSA 2023), oral testimony, digital transactions, chats, and third-party witness affidavits are fully admissible legal evidence.
              </Text>
            </Card>

            <SectionHeader title="5 Steps to Recover & Create Admissible Proof" />

            {/* Step 1 */}
            <Card variant="outlined" style={styles.stepCard}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>1</Text>
              </View>
              <View style={styles.stepBody}>
                <Text style={styles.stepTitle}>Digital Banking & Transaction Trails</Text>
                <Text style={styles.stepDesc}>
                  Download bank statements, UPI history (GPay, PhonePe, Paytm), or SMS alerts for all transfers. Under BSA 2023, digital bank logs carry strong evidentiary value even without cash receipts.
                </Text>
              </View>
            </Card>

            {/* Step 2 */}
            <Card variant="outlined" style={styles.stepCard}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>2</Text>
              </View>
              <View style={styles.stepBody}>
                <Text style={styles.stepTitle}>Export Chat Logs & SMS</Text>
                <Text style={styles.stepDesc}>
                  Export WhatsApp chat history (with timestamps) or call logs showing communication regarding rent, deposit, or promises made.
                </Text>
              </View>
            </Card>

            {/* Step 3 */}
            <Card variant="outlined" style={styles.stepCard}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>3</Text>
              </View>
              <View style={styles.stepBody}>
                <Text style={styles.stepTitle}>Witness Statements & Affidavits</Text>
                <Text style={styles.stepDesc}>
                  Obtain written statements or signed affidavits from co-tenants, neighbors, building security, or colleagues who witnessed cash transactions or conversations (BNSS Sec 180).
                </Text>
              </View>
            </Card>

            {/* Step 4 */}
            <Card variant="outlined" style={styles.stepCard}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>4</Text>
              </View>
              <View style={styles.stepBody}>
                <Text style={styles.stepTitle}>File Sworn Self-Affidavit</Text>
                <Text style={styles.stepDesc}>
                  Draft a formal notarized affidavit detailing the exact dates, oral agreement terms, and event sequence. AI Kayda Sathi can format this for court presentation.
                </Text>
              </View>
            </Card>

            {/* Step 5 */}
            <Card variant="outlined" style={styles.stepCard}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>5</Text>
              </View>
              <View style={styles.stepBody}>
                <Text style={styles.stepTitle}>Public Portal Complaint / RTI</Text>
                <Text style={styles.stepDesc}>
                  Lodge an online complaint on National Consumer Helpline (1915), Cyber Crime Portal, or local police station (Non-Cognizable Report) to create an official statutory record.
                </Text>
              </View>
            </Card>

            {/* Action Buttons */}
            <View style={styles.noDocsActionCol}>
              <Button
                title="Log Oral Agreement / Self-Statement"
                onPress={() => {
                  setIsNoDocsModalOpen(false);
                  setTitle('Sworn Self-Statement / Oral Agreement Log');
                  setType('TEXT_NOTE');
                  setIsUploadModalOpen(true);
                }}
                variant="primary"
                icon="create-outline"
                style={{ marginBottom: Spacing.xs }}
              />
              <Button
                title="Log Witness Details / Statement"
                onPress={() => {
                  setIsNoDocsModalOpen(false);
                  setTitle('Witness Statement / Contact Log');
                  setType('TEXT_NOTE');
                  setIsUploadModalOpen(true);
                }}
                variant="secondary"
                icon="people-outline"
              />
            </View>

            <View style={{ height: Spacing['3xl'] }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  addButton: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBar: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
  },
  filterChip: {
    backgroundColor: Colors.neutral[0],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    marginRight: Spacing.sm,
  },
  filterChipActive: {
    backgroundColor: Colors.primary[50],
    borderColor: Colors.primary[400],
  },
  filterChipText: {
    fontSize: FontSize.xs,
    fontWeight: '500',
    color: Colors.neutral[600],
  },
  filterChipTextActive: {
    color: Colors.primary[700],
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  completenessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  completenessIconBg: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  completenessTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.neutral[900],
  },
  completenessSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.neutral[500],
    marginTop: 1,
  },
  completenessPercent: {
    fontSize: FontSize['2xl'],
    fontWeight: '700',
    color: Colors.primary[500],
  },
  progressTrack: {
    height: 6,
    backgroundColor: Colors.neutral[100],
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    backgroundColor: Colors.primary[500],
    borderRadius: 3,
  },
  evidenceCard: {
    marginBottom: Spacing.sm,
  },
  emptyEvidenceCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.neutral[0],
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.neutral[300],
    marginBottom: Spacing.md,
  },
  emptyEvidenceTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.neutral[800],
    marginTop: Spacing.xs,
  },
  emptyEvidenceSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.neutral[500],
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  evidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  evidenceIcon: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  evidenceInfo: {
    flex: 1,
  },
  evidenceName: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.neutral[900],
  },
  evidenceType: {
    fontSize: FontSize.xs,
    color: Colors.neutral[500],
    marginTop: 2,
  },
  factChips: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  factCount: {
    fontSize: FontSize.xs,
    color: Colors.success[700],
    fontWeight: '600',
  },
  gapCard: {
    marginBottom: Spacing.sm,
    borderColor: Colors.warning[200],
    borderLeftWidth: 3,
    borderLeftColor: Colors.warning[400],
  },
  gapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  gapTitle: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.neutral[800],
  },
  gapSuggestions: {
    gap: Spacing.xs,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    gap: Spacing.sm,
  },
  suggestionText: {
    fontSize: FontSize.sm,
    color: Colors.neutral[700],
    flex: 1,
  },
  // Modal styles
  modalSafe: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  modalTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.neutral[900],
    flex: 1,
    marginRight: Spacing.md,
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    padding: Spacing.xl,
  },
  fieldLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.neutral[700],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  textInput: {
    backgroundColor: Colors.neutral[50],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.sm,
    color: Colors.neutral[900],
  },
  casePickerBar: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
  },
  casePickerChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neutral[100],
    marginRight: Spacing.sm,
  },
  casePickerChipActive: {
    backgroundColor: Colors.primary[50],
    borderWidth: 1,
    borderColor: Colors.primary[400],
  },
  casePickerText: {
    fontSize: FontSize.xs,
    color: Colors.neutral[600],
  },
  casePickerTextActive: {
    color: Colors.primary[700],
    fontWeight: '700',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    backgroundColor: Colors.neutral[50],
  },
  typeButtonActive: {
    backgroundColor: Colors.primary[50],
    borderColor: Colors.primary[400],
  },
  typeButtonText: {
    fontSize: FontSize.xs,
    color: Colors.neutral[700],
  },
  typeButtonTextActive: {
    color: Colors.primary[800],
    fontWeight: '700',
  },
  fileButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: 4,
  },
  filePickBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.primary[50],
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  filePickBtnText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.primary[700],
  },
  selectedFileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.sm,
    padding: Spacing.xs,
  },
  selectedFileText: {
    fontSize: FontSize.xs,
    color: Colors.success[700],
    fontWeight: '600',
    flex: 1,
  },
  detailMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  detailDate: {
    fontSize: FontSize.xs,
    color: Colors.neutral[500],
  },
  detailDesc: {
    fontSize: FontSize.sm,
    color: Colors.neutral[800],
    lineHeight: 22,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.neutral[50],
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  factsListWrap: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  factCard: {
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  factHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  factStatement: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    color: Colors.neutral[900],
    flex: 1,
    lineHeight: 20,
  },
  factFooter: {
    marginTop: Spacing.xs,
    alignItems: 'flex-end',
  },
  factConfidence: {
    fontSize: FontSize.xs,
    color: Colors.success[700],
    fontWeight: '600',
  },
  claimSupportBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary[50],
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
  },
  claimSupportText: {
    fontSize: FontSize.sm,
    color: Colors.primary[800],
    flex: 1,
  },

  // No Docs Styles
  noDocsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: '#FFFBEB',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  noDocsBannerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDocsBannerTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: '#92400E',
  },
  noDocsBannerSubtitle: {
    fontSize: FontSize.xs,
    color: '#B45309',
    marginTop: 2,
    lineHeight: 16,
  },
  noDocsModalSub: {
    fontSize: FontSize.xs,
    color: Colors.neutral[500],
    marginTop: 2,
  },
  noDocsInfoCard: {
    backgroundColor: Colors.info[50],
    borderColor: Colors.info[200],
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  noDocsInfoText: {
    fontSize: FontSize.xs,
    color: Colors.info[700],
    flex: 1,
    lineHeight: 18,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.neutral[0],
  },
  stepBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.neutral[0],
  },
  stepBody: {
    flex: 1,
  },
  stepTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.neutral[900],
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: FontSize.xs,
    color: Colors.neutral[600],
    lineHeight: 18,
  },
  noDocsActionCol: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
});
