// ============================================================
// Kayda Sathi — Case Detail Screen (Polished UI & Segmented Tabs)
// ============================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  Modal,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '@/constants';
import { Card, StatusBadge, ProgressBar, Button, type BadgeVariant } from '@/components/ui';
import { useCase, useEvidence } from '@/store/caseStore';
import { DEMO_CASE, DEMO_CONTRADICTIONS } from '@/store/demoData';
import { getCategoryById } from '@/constants';
import { getAuthoritativeLegalSource } from '@/constants/legalSources';
import { CaseDocument, LegalSourceReference } from '@/types';

type TabKey = 'overview' | 'timeline' | 'evidence' | 'actions' | 'documents';

// Compact segmented tabs that fit on all screen sizes without scrolling
const TABS: { key: TabKey; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'overview', label: 'Overview', icon: 'grid-outline' },
  { key: 'timeline', label: 'Timeline', icon: 'time-outline' },
  { key: 'evidence', label: 'Proof', icon: 'shield-checkmark-outline' },
  { key: 'actions', label: 'Actions', icon: 'checkbox-outline' },
  { key: 'documents', label: 'Docs', icon: 'document-text-outline' },
];

const STATUS_MAP: Record<string, { label: string; variant: BadgeVariant }> = {
  ACTIVE: { label: 'Active', variant: 'active' },
  ACTION_REQUIRED: { label: 'Action Required', variant: 'action_required' },
  RESOLVED: { label: 'Resolved', variant: 'resolved' },
  ARCHIVED: { label: 'Archived', variant: 'archived' },
};

export default function CaseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [draftingType, setDraftingType] = useState<CaseDocument['type'] | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<CaseDocument | null>(null);
  const [selectedSource, setSelectedSource] = useState<LegalSourceReference | null>(null);
  const [timelineFilter, setTimelineFilter] = useState<'ALL' | 'KEY'>('KEY');
  const [showSmartSummaryModal, setShowSmartSummaryModal] = useState<boolean>(false);

  const caseId = id || DEMO_CASE.id;
  const { caseData, toggleAction, generateDocument } = useCase(caseId);
  const { evidence } = useEvidence(caseId);

  // Fallback to demo case if not found
  const c = caseData || (caseId === DEMO_CASE.id ? DEMO_CASE : null);

  if (!c) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color={Colors.neutral[700]} />
          </Pressable>
          <Text style={styles.topBarTitle}>Case Not Found</Text>
        </View>
        <View style={styles.notFoundCenter}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.neutral[400]} />
          <Text style={styles.notFoundText}>This case dossier could not be located.</Text>
          <Button title="Back to Cases" onPress={() => router.back()} style={{ marginTop: Spacing.lg }} />
        </View>
      </SafeAreaView>
    );
  }

  const cat = getCategoryById(c.category);
  const statusInfo = STATUS_MAP[c.status] || STATUS_MAP.ACTIVE;
  const contradictions = DEMO_CONTRADICTIONS;

  const handleGenerateDoc = async (type: CaseDocument['type']) => {
    setDraftingType(type);
    try {
      const doc = await generateDocument(type);
      setSelectedDoc(doc);
    } catch (err: any) {
      Alert.alert('Drafting Error', err?.message || 'Could not draft document.');
    } finally {
      setDraftingType(null);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={Colors.neutral[800]} />
        </Pressable>
        <View style={styles.topBarCenter}>
          <Text style={styles.topBarTitle} numberOfLines={1}>{c.title}</Text>
          <StatusBadge label={statusInfo.label} variant={statusInfo.variant} />
        </View>
      </View>

      {/* Modern Compact Segmented Bar (All 5 buttons fit on 1 row without horizontal scroll) */}
      <View style={styles.segmentedContainer}>
        <View style={styles.segmentedControl}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={[styles.segmentTab, isActive && styles.segmentTabActive]}
              >
                <Ionicons
                  name={tab.icon}
                  size={14}
                  color={isActive ? Colors.primary[600] : Colors.neutral[500]}
                />
                <Text style={[styles.segmentLabel, isActive && styles.segmentLabelActive]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Main Content Area */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'overview' && (
          <OverviewTab
            caseData={c}
            cat={cat}
            contradictions={contradictions}
            onToggleAction={toggleAction}
            onSwitchTab={setActiveTab}
          />
        )}
        {activeTab === 'timeline' && <TimelineTab caseData={c} />}
        {activeTab === 'evidence' && <EvidenceTab caseData={c} evidenceList={evidence} />}
        {activeTab === 'actions' && (
          <ActionsTab caseData={c} onToggleAction={toggleAction} />
        )}
        {activeTab === 'documents' && (
          <DocumentsTab
            caseData={c}
            draftingType={draftingType}
            onGenerateDoc={handleGenerateDoc}
            onViewDoc={setSelectedDoc}
          />
        )}
      </ScrollView>

      {/* Document Viewer Modal */}
      <Modal
        visible={Boolean(selectedDoc)}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedDoc(null)}
      >
        <SafeAreaView style={styles.docModalSafe}>
          <View style={styles.docModalHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.docModalTitle} numberOfLines={1}>{selectedDoc?.title}</Text>
              <Text style={styles.docModalSub}>Generated by Gemini Legal Assistant</Text>
            </View>
            <Pressable onPress={() => setSelectedDoc(null)} hitSlop={10} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={Colors.neutral[700]} />
            </Pressable>
          </View>
          <ScrollView style={styles.docModalScroll} contentContainerStyle={styles.docModalContent}>
            <View style={styles.docTypeBadgeRow}>
              <StatusBadge label={selectedDoc?.type.replace('_', ' ') || 'NOTICE'} variant="info" />
              <Text style={styles.docGeneratedAt}>
                {selectedDoc ? new Date(selectedDoc.generatedAt).toLocaleDateString() : ''}
              </Text>
            </View>
            <View style={styles.docPaper}>
              <Text style={styles.docTextContent}>{selectedDoc?.content}</Text>
            </View>
            <Button
              title="Close Document"
              onPress={() => setSelectedDoc(null)}
              variant="primary"
              size="md"
              fullWidth
              style={{ marginTop: Spacing.xl }}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// -------------------------------------------------------------
// Overview Tab
// -------------------------------------------------------------
function OverviewTab({ caseData, cat, contradictions, onToggleAction, onSwitchTab }: any) {
  const verifiedFactsCount = caseData.facts.filter((f: any) => f.status === 'VERIFIED').length;
  const doneActionsCount = caseData.actionItems.filter((a: any) => a.status === 'DONE').length;

  return (
    <>
      {/* Hero Card */}
      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          {cat && (
            <View style={[styles.heroCatBadge, { backgroundColor: cat.bgColor }]}>
              <Ionicons name={cat.icon} size={13} color={cat.color} />
              <Text style={[styles.heroCatText, { color: cat.color }]}>{cat.label}</Text>
            </View>
          )}
          {caseData.jurisdiction && (
            <View style={styles.jurisdictionChip}>
              <Ionicons name="location-outline" size={11} color={Colors.neutral[500]} />
              <Text style={styles.jurisdictionChipText} numberOfLines={1}>{caseData.jurisdiction}</Text>
            </View>
          )}
        </View>

        <Text style={styles.heroTitle}>{caseData.title}</Text>
        <Text style={styles.heroDesc}>{caseData.description}</Text>

        {/* Quick Dossier Stats */}
        <View style={styles.statsStrip}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{caseData.facts.length}</Text>
            <Text style={styles.statLabel}>Facts ({verifiedFactsCount} Verified)</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{caseData.evidenceIds?.length || 0}</Text>
            <Text style={styles.statLabel}>Proof Files</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{doneActionsCount}/{caseData.actionItems.length}</Text>
            <Text style={styles.statLabel}>Tasks Done</Text>
          </View>
        </View>
      </View>

      {/* Visually Prominent Next Action Card */}
      {(() => {
        const nextAction = caseData.actionItems.find((a: any) => a.status !== 'DONE');
        if (!nextAction) return null;
        return (
          <Card variant="elevated" style={styles.prominentNextActionCard}>
            <View style={styles.nextActionTopRow}>
              <View style={styles.nextActionBadge}>
                <Ionicons name="flash" size={13} color="#B45309" />
                <Text style={styles.nextActionBadgeText}>RECOMMENDED NEXT STEP</Text>
              </View>
              <Text style={styles.nextActionStepNum}>Step {nextAction.order} of {caseData.actionItems.length}</Text>
            </View>
            <Text style={styles.nextActionTitle}>{nextAction.title}</Text>
            <Text style={styles.nextActionDesc} numberOfLines={2}>{nextAction.description}</Text>
            <View style={styles.nextActionBtnRow}>
              <Pressable
                style={styles.nextActionCompleteBtn}
                onPress={() => onToggleAction(nextAction.id)}
              >
                <Ionicons name="checkmark-circle" size={16} color={Colors.neutral[0]} />
                <Text style={styles.nextActionCompleteText}>Mark Step as Done</Text>
              </Pressable>
              <Pressable
                style={styles.nextActionViewAllBtn}
                onPress={() => onSwitchTab('actions')}
              >
                <Text style={styles.nextActionViewAllText}>View Plan →</Text>
              </Pressable>
            </View>
          </Card>
        );
      })()}

      {/* Case Preparation Progress */}
      <Card variant="elevated" style={styles.prepCard}>
        <View style={styles.prepHeader}>
          <View style={styles.prepHeaderLeft}>
            <Ionicons name="speedometer-outline" size={18} color={Colors.primary[600]} />
            <Text style={styles.sectionTitle}>Legal Readiness Score</Text>
          </View>
          <Text style={styles.prepScoreTotal}>{caseData.preparation.actionReadiness}% Ready</Text>
        </View>
        <ProgressBar label="Factual Understanding" value={caseData.preparation.understanding} color={Colors.primary[500]} />
        <ProgressBar label="Documentary Evidence" value={caseData.preparation.evidence} color={Colors.info[600]} />
        <ProgressBar label="Action Readiness" value={caseData.preparation.actionReadiness} color={Colors.success[600]} />
      </Card>

      {/* Key Objective Facts */}
      <Card variant="elevated" style={styles.cardSection}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.sectionTitle}>Verified Facts ({caseData.facts.length})</Text>
          <Pressable onPress={() => onSwitchTab('timeline')}>
            <Text style={styles.headerActionText}>View Timeline →</Text>
          </Pressable>
        </View>

        {caseData.facts.slice(0, 4).map((fact: any) => {
          const isVerified = fact.status === 'VERIFIED';
          return (
            <View key={fact.id} style={styles.factRow}>
              <View style={[styles.factStatusIcon, isVerified ? styles.factVerifiedBg : styles.factStatedBg]}>
                <Ionicons
                  name={isVerified ? 'shield-checkmark' : 'information'}
                  size={12}
                  color={isVerified ? Colors.success[600] : Colors.info[600]}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.factStatement}>{fact.statement}</Text>
                <Text style={styles.factMeta}>
                  {fact.status.replace('_', ' ')}
                  {fact.source ? ` · Source: ${fact.source}` : ''}
                </Text>
              </View>
            </View>
          );
        })}
      </Card>

      {/* Inconsistencies / Contradictions */}
      {contradictions && contradictions.length > 0 && (
        <Card variant="outlined" style={styles.contradictionCard}>
          <View style={styles.contradictionHeader}>
            <Ionicons name="alert-circle" size={18} color={Colors.warning[600]} />
            <Text style={styles.contradictionTitle}>Detected Inconsistency</Text>
          </View>
          {contradictions.map((contra: any) => (
            <View key={contra.id} style={styles.contradictionBody}>
              <Text style={styles.contradictionDesc}>{contra.description}</Text>
              <View style={styles.contradictionSources}>
                <View style={styles.contradictionSource}>
                  <Text style={styles.sourceLabel}>{contra.sourceA.label}</Text>
                  <Text style={styles.sourceValue}>{contra.sourceA.value}</Text>
                </View>
                <View style={styles.contradictionVs}>
                  <Text style={styles.vsText}>VS</Text>
                </View>
                <View style={styles.contradictionSource}>
                  <Text style={styles.sourceLabel}>{contra.sourceB.label}</Text>
                  <Text style={styles.sourceValue}>{contra.sourceB.value}</Text>
                </View>
              </View>
            </View>
          ))}
        </Card>
      )}

      {/* Immediate Next Actions */}
      <Card variant="elevated" style={styles.cardSection}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.sectionTitle}>Immediate Action Checklist</Text>
          <Pressable onPress={() => onSwitchTab('actions')}>
            <Text style={styles.headerActionText}>Full Plan →</Text>
          </Pressable>
        </View>

        {caseData.actionItems.map((action: any, i: number) => {
          const isDone = action.status === 'DONE';
          return (
            <Pressable
              key={action.id}
              style={[styles.actionRow, i < caseData.actionItems.length - 1 && styles.actionBorder]}
              onPress={() => onToggleAction(action.id)}
            >
              <View style={[styles.actionCheck, isDone && styles.actionCheckDone]}>
                {isDone ? (
                  <Ionicons name="checkmark" size={13} color={Colors.neutral[0]} />
                ) : (
                  <Text style={styles.actionNumber}>{action.order}</Text>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.actionTitle, isDone && styles.actionTitleDone]}>
                  {action.title}
                </Text>
                <Text style={styles.actionDesc} numberOfLines={2}>{action.description}</Text>
              </View>
            </Pressable>
          );
        })}
      </Card>

      <View style={{ height: Spacing['4xl'] }} />
    </>
  );
}

// -------------------------------------------------------------
// Timeline Tab
// -------------------------------------------------------------
function TimelineTab({ caseData }: any) {
  return (
    <>
      <View style={styles.tabHeadingRow}>
        <Text style={styles.tabSectionTitle}>Chronological Timeline</Text>
        <Text style={styles.tabSubtitle}>Reconstructed from evidence timestamps & statements</Text>
      </View>

      {caseData.timeline.map((event: any, i: number) => (
        <View key={event.id} style={styles.timelineItem}>
          <View style={styles.timelineLeft}>
            <View style={styles.timelineDot} />
            {i < caseData.timeline.length - 1 && <View style={styles.timelineLine} />}
          </View>
          <Card variant="outlined" style={styles.timelineCard}>
            <View style={styles.timelineHeader}>
              <Text style={styles.timelineDate}>{event.date}</Text>
              <View style={styles.timelineSource}>
                <Ionicons name="shield-outline" size={10} color={Colors.primary[600]} />
                <Text style={styles.timelineSourceText}>{event.sourceType.replace('_', ' ')}</Text>
              </View>
            </View>
            <Text style={styles.timelineTitle}>{event.title}</Text>
            {event.description && <Text style={styles.timelineDesc}>{event.description}</Text>}
          </Card>
        </View>
      ))}
      <View style={{ height: Spacing['4xl'] }} />
    </>
  );
}

// -------------------------------------------------------------
// Evidence Tab
// -------------------------------------------------------------
function EvidenceTab({ caseData, evidenceList }: any) {
  return (
    <>
      <View style={styles.tabHeadingRow}>
        <Text style={styles.tabSectionTitle}>Proof & Claims Mapping</Text>
        <Text style={styles.tabSubtitle}>Evidence linked to statutory claims</Text>
      </View>

      {/* Claims */}
      {caseData.claims.map((claim: any) => (
        <Card key={claim.id} variant="elevated" style={styles.claimCard}>
          <View style={styles.claimHeader}>
            <Text style={styles.claimBadgeTitle}>LEGAL CLAIM</Text>
            <StatusBadge
              label={`Strength: ${claim.strength}`}
              variant={claim.strength === 'STRONG' ? 'success' : claim.strength === 'MODERATE' ? 'active' : 'warning'}
            />
          </View>
          <Text style={styles.claimStatement}>{claim.statement}</Text>
          <View style={styles.claimProofRow}>
            <Ionicons name="link-outline" size={13} color={Colors.neutral[500]} />
            <Text style={styles.claimProofSub}>Supporting Evidence: {evidenceList.length} verified item(s)</Text>
          </View>
        </Card>
      ))}

      {/* Evidence Items */}
      <Text style={[styles.tabSectionTitle, { marginTop: Spacing.md, marginBottom: Spacing.xs }]}>
        Attached Proof Files ({evidenceList.length})
      </Text>
      {evidenceList.map((evi: any) => (
        <Card key={evi.id} variant="outlined" style={styles.eviCard}>
          <View style={styles.eviHeader}>
            <View style={styles.eviIconBg}>
              <Ionicons name="document-text" size={16} color={Colors.primary[600]} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.eviTitle}>{evi.title}</Text>
              <Text style={styles.eviMeta}>{evi.type.replace(/_/g, ' ')} · {evi.documentDate || 'Dated'}</Text>
            </View>
          </View>
          {evi.extractedFacts && evi.extractedFacts.length > 0 && (
            <View style={styles.eviFacts}>
              {evi.extractedFacts.map((f: any) => (
                <View key={f.id} style={styles.eviFactChip}>
                  <Ionicons name="flash" size={11} color={Colors.success[600]} />
                  <Text style={styles.eviFactText}>{f.statement}</Text>
                </View>
              ))}
            </View>
          )}
        </Card>
      ))}

      <Button
        title="Upload New Proof File"
        onPress={() => router.push('/(tabs)/evidence')}
        variant="secondary"
        icon="add-circle-outline"
        size="md"
        style={{ marginTop: Spacing.md }}
      />
      <View style={{ height: Spacing['4xl'] }} />
    </>
  );
}

// -------------------------------------------------------------
// Actions Tab
// -------------------------------------------------------------
function ActionsTab({ caseData, onToggleAction }: any) {
  return (
    <>
      <View style={styles.tabHeadingRow}>
        <Text style={styles.tabSectionTitle}>Action Roadmap</Text>
        <Text style={styles.tabSubtitle}>
          Tap any step to mark complete. Completing actions updates your readiness score.
        </Text>
      </View>

      {caseData.actionItems.map((action: any) => {
        const isDone = action.status === 'DONE';
        return (
          <Card
            key={action.id}
            variant="elevated"
            style={[styles.actionCard, isDone && styles.actionCardDone]}
            onPress={() => onToggleAction(action.id)}
          >
            <View style={styles.actionDetailHeader}>
              <View style={styles.actionNumBadge}>
                <Text style={styles.actionNumText}>STEP {action.order}</Text>
              </View>
              <StatusBadge
                label={isDone ? 'Completed' : 'Pending'}
                variant={isDone ? 'success' : 'action_required'}
              />
            </View>
            <Text style={[styles.actionDetailTitle, isDone && styles.actionTitleDone]}>
              {action.title}
            </Text>
            <Text style={styles.actionDetailDesc}>{action.description}</Text>

            {action.reason && (
              <View style={styles.reasonBox}>
                <Ionicons name="bulb-outline" size={13} color={Colors.info[700]} />
                <Text style={styles.reasonText}>{action.reason}</Text>
              </View>
            )}

            {action.requirements && action.requirements.length > 0 && (
              <View style={styles.requirementsList}>
                <Text style={styles.requirementsTitle}>Required Prerequisites:</Text>
                {action.requirements.map((req: string, i: number) => (
                  <View key={i} style={styles.requirementItem}>
                    <Ionicons name="checkmark-circle-outline" size={12} color={Colors.success[600]} />
                    <Text style={styles.requirementText}>{req}</Text>
                  </View>
                ))}
              </View>
            )}
          </Card>
        );
      })}
      <View style={{ height: Spacing['4xl'] }} />
    </>
  );
}

// -------------------------------------------------------------
// Documents Tab (Studio Format)
// -------------------------------------------------------------
function DocumentsTab({ caseData, draftingType, onGenerateDoc, onViewDoc }: any) {
  const documents: CaseDocument[] = caseData.documents || [];

  const TEMPLATES: { type: CaseDocument['type']; title: string; desc: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    {
      type: 'REFUND_REQUEST',
      title: 'Formal Legal Demand Notice',
      desc: '7-15 day cure demand notice citing contracts & statutory codes.',
      icon: 'document-text',
    },
    {
      type: 'COMPLAINT',
      title: 'Statutory Authority Complaint',
      desc: 'Draft complaint for Consumer Commission, RERA, or Cyber Cell.',
      icon: 'business',
    },
    {
      type: 'LAWYER_BRIEF',
      title: 'Advocate Case Summary Brief',
      desc: 'Chronological summary of verified facts for your lawyer consultation.',
      icon: 'reader',
    },
  ];

  return (
    <>
      <View style={styles.tabHeadingRow}>
        <Text style={styles.tabSectionTitle}>Legal Document Studio</Text>
        <Text style={styles.tabSubtitle}>Draft formal notices and complaints grounded in your verified facts</Text>
      </View>

      {/* Generated Documents List */}
      {documents.length > 0 ? (
        <View style={{ marginBottom: Spacing.lg }}>
          <Text style={styles.subSectionTitle}>Drafted Dossier Documents ({documents.length})</Text>
          {documents.map((doc) => (
            <Card
              key={doc.id}
              variant="elevated"
              style={styles.docItemCard}
              onPress={() => onViewDoc(doc)}
            >
              <View style={styles.docRow}>
                <View style={styles.docIconBg}>
                  <Ionicons name="document-text" size={20} color={Colors.primary[600]} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.docTitleText}>{doc.title}</Text>
                  <Text style={styles.docDateText}>
                    Drafted {new Date(doc.generatedAt).toLocaleDateString()} · {doc.type.replace('_', ' ')}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.neutral[400]} />
              </View>
            </Card>
          ))}
        </View>
      ) : (
        <View style={styles.docEmptyCard}>
          <Ionicons name="document-text-outline" size={24} color={Colors.neutral[400]} />
          <Text style={styles.docEmptyTitle}>No documents drafted yet</Text>
          <Text style={styles.docEmptySub}>Select a template below to generate formal legal notices or briefs with AI.</Text>
        </View>
      )}

      {/* Available Draft Templates */}
      <Text style={styles.subSectionTitle}>Draft New Document with AI</Text>

      {TEMPLATES.map((tmpl) => {
        const isDrafting = draftingType === tmpl.type;
        return (
          <Card key={tmpl.type} variant="outlined" style={styles.templateCard}>
            <View style={styles.templateRow}>
              <View style={styles.templateIconBg}>
                <Ionicons name={tmpl.icon} size={20} color={Colors.primary[600]} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.templateTitle}>{tmpl.title}</Text>
                <Text style={styles.templateDesc}>{tmpl.desc}</Text>
              </View>
            </View>
            <View style={styles.templateFooter}>
              <Button
                title={isDrafting ? 'Drafting with Gemini...' : 'Draft Document'}
                onPress={() => onGenerateDoc(tmpl.type)}
                variant={tmpl.type === 'REFUND_REQUEST' ? 'primary' : 'secondary'}
                size="sm"
                icon={isDrafting ? undefined : 'sparkles-outline'}
                disabled={Boolean(draftingType)}
              />
            </View>
          </Card>
        );
      })}

      <View style={{ height: Spacing['4xl'] }} />
    </>
  );
}

// -------------------------------------------------------------
// Styles
// -------------------------------------------------------------
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.neutral[0],
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  backButton: {
    padding: Spacing.xs,
    marginRight: Spacing.xs,
  },
  topBarCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  topBarTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.neutral[900],
    flex: 1,
  },
  // Compact Segmented Tabs
  segmentedContainer: {
    backgroundColor: Colors.neutral[0],
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral[100],
    borderRadius: BorderRadius.md,
    padding: 2,
  },
  segmentTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 7,
    borderRadius: BorderRadius.sm,
  },
  segmentTabActive: {
    backgroundColor: Colors.neutral[0],
    ...Shadow.sm,
  },
  segmentLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.neutral[600],
  },
  segmentLabelActive: {
    fontWeight: '700',
    color: Colors.primary[700],
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: Spacing.md,
    paddingBottom: Spacing['6xl'],
  },
  notFoundCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  notFoundText: {
    fontSize: FontSize.md,
    color: Colors.neutral[600],
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  heroCard: {
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  heroCatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  heroCatText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  jurisdictionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    maxWidth: 180,
  },
  jurisdictionChipText: {
    fontSize: FontSize.xs,
    color: Colors.neutral[500],
  },
  heroTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.neutral[900],
    letterSpacing: -0.3,
    marginTop: Spacing.xs,
    marginBottom: 4,
  },
  heroDesc: {
    fontSize: FontSize.xs,
    color: Colors.neutral[600],
    lineHeight: 18,
  },
  statsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.primary[700],
  },
  statLabel: {
    fontSize: 10,
    color: Colors.neutral[500],
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: Colors.neutral[200],
  },
  prominentNextActionCard: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
    borderWidth: 1.5,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  nextActionTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  nextActionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  nextActionBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#92400E',
    letterSpacing: 0.5,
  },
  nextActionStepNum: {
    fontSize: 10,
    fontWeight: '600',
    color: '#B45309',
  },
  nextActionTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.neutral[900],
    letterSpacing: -0.2,
  },
  nextActionDesc: {
    fontSize: FontSize.xs,
    color: '#78350F',
    marginTop: 3,
    lineHeight: 18,
  },
  nextActionBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#FDE68A',
  },
  nextActionCompleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary[600],
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: BorderRadius.md,
  },
  nextActionCompleteText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.neutral[0],
  },
  nextActionViewAllBtn: {
    paddingVertical: 4,
    paddingHorizontal: Spacing.xs,
  },
  nextActionViewAllText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.primary[700],
  },
  prepCard: {
    marginBottom: Spacing.md,
  },
  prepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  prepHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  prepScoreTotal: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.primary[700],
  },
  cardSection: {
    marginBottom: Spacing.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.neutral[900],
  },
  headerActionText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.primary[600],
  },
  factRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  factStatusIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  factVerifiedBg: {
    backgroundColor: Colors.success[50],
  },
  factStatedBg: {
    backgroundColor: Colors.info[50],
  },
  factStatement: {
    fontSize: FontSize.xs,
    color: Colors.neutral[900],
    lineHeight: 18,
    fontWeight: '500',
  },
  factMeta: {
    fontSize: 10,
    color: Colors.neutral[400],
    marginTop: 2,
    textTransform: 'capitalize',
  },
  contradictionCard: {
    borderColor: Colors.warning[300],
    backgroundColor: Colors.warning[50],
    marginBottom: Spacing.md,
  },
  contradictionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.xs,
  },
  contradictionTitle: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.warning[700],
    textTransform: 'uppercase',
  },
  contradictionBody: {
    marginTop: 2,
  },
  contradictionDesc: {
    fontSize: FontSize.xs,
    color: Colors.warning[700],
    marginBottom: Spacing.xs,
  },
  contradictionSources: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contradictionSource: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
    padding: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  sourceLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.neutral[400],
    textTransform: 'uppercase',
  },
  sourceValue: {
    fontSize: FontSize.xs,
    color: Colors.neutral[800],
    marginTop: 1,
  },
  contradictionVs: {
    paddingHorizontal: 2,
  },
  vsText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.warning[600],
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  actionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  actionCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: Colors.neutral[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionCheckDone: {
    backgroundColor: Colors.success[500],
    borderColor: Colors.success[500],
  },
  actionNumber: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.neutral[500],
  },
  actionTitle: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.neutral[900],
  },
  actionTitleDone: {
    textDecorationLine: 'line-through',
    color: Colors.neutral[400],
  },
  actionDesc: {
    fontSize: 11,
    color: Colors.neutral[500],
    marginTop: 1,
  },
  tabHeadingRow: {
    marginBottom: Spacing.sm,
  },
  tabSectionTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.neutral[900],
  },
  tabSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.neutral[500],
    marginTop: 2,
  },
  subSectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.neutral[600],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
  },
  timelineLeft: {
    width: 20,
    alignItems: 'center',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary[600],
    marginTop: 6,
    borderWidth: 2,
    borderColor: Colors.primary[100],
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.primary[100],
    marginTop: 2,
  },
  timelineCard: {
    flex: 1,
    marginLeft: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.neutral[0],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    marginBottom: Spacing.xs,
    ...Shadow.sm,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  timelineDate: {
    fontSize: FontSize.xs,
    fontWeight: '800',
    color: Colors.primary[700],
    letterSpacing: 0.2,
  },
  timelineTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.neutral[900],
  },
  timelineDesc: {
    fontSize: FontSize.xs,
    color: Colors.neutral[600],
    marginTop: 3,
    lineHeight: 18,
  },
  timelineSource: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  timelineSourceText: {
    fontSize: 9,
    color: Colors.neutral[400],
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  claimCard: {
    marginBottom: Spacing.sm,
  },
  claimHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  claimBadgeTitle: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.neutral[400],
    letterSpacing: 0.5,
  },
  claimStatement: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.neutral[900],
    lineHeight: 18,
  },
  claimProofRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  claimProofSub: {
    fontSize: 10,
    color: Colors.neutral[500],
  },
  eviCard: {
    marginBottom: Spacing.sm,
    padding: Spacing.md,
  },
  eviHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  eviIconBg: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  eviTitle: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.neutral[900],
  },
  eviMeta: {
    fontSize: 10,
    color: Colors.neutral[500],
    marginTop: 1,
  },
  eviFacts: {
    gap: 3,
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
  },
  eviFactChip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
  },
  eviFactText: {
    fontSize: 11,
    color: Colors.neutral[700],
    flex: 1,
    lineHeight: 16,
  },
  actionCard: {
    marginBottom: Spacing.sm,
  },
  actionCardDone: {
    opacity: 0.7,
  },
  actionDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  actionNumBadge: {
    backgroundColor: Colors.primary[50],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  actionNumText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.primary[700],
  },
  actionDetailTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.neutral[900],
  },
  actionDetailDesc: {
    fontSize: FontSize.xs,
    color: Colors.neutral[600],
    lineHeight: 18,
    marginTop: 2,
  },
  reasonBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: Colors.info[50],
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.sm,
  },
  reasonText: {
    fontSize: 11,
    color: Colors.info[700],
    flex: 1,
    lineHeight: 16,
  },
  requirementsList: {
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
  },
  requirementsTitle: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.neutral[500],
    marginBottom: 2,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  requirementText: {
    fontSize: 11,
    color: Colors.neutral[700],
  },
  docItemCard: {
    marginBottom: Spacing.xs,
    padding: Spacing.sm,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  docIconBg: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  docTitleText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.neutral[900],
  },
  docDateText: {
    fontSize: 10,
    color: Colors.neutral[500],
    marginTop: 1,
  },
  docEmptyCard: {
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.neutral[300],
    marginBottom: Spacing.lg,
  },
  docEmptyTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.neutral[800],
    marginTop: Spacing.xs,
  },
  docEmptySub: {
    fontSize: FontSize.xs,
    color: Colors.neutral[500],
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  templateCard: {
    marginBottom: Spacing.sm,
    padding: Spacing.md,
  },
  templateRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  templateIconBg: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  templateTitle: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.neutral[900],
  },
  templateDesc: {
    fontSize: 11,
    color: Colors.neutral[500],
    marginTop: 2,
    lineHeight: 16,
  },
  templateFooter: {
    marginTop: Spacing.sm,
    alignItems: 'flex-end',
  },
  docModalSafe: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  docModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.neutral[0],
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  docModalTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.neutral[900],
  },
  docModalSub: {
    fontSize: 10,
    color: Colors.neutral[400],
    marginTop: 1,
  },
  closeBtn: {
    padding: 4,
  },
  docModalScroll: {
    flex: 1,
  },
  docModalContent: {
    padding: Spacing.lg,
  },
  docTypeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  docGeneratedAt: {
    fontSize: 10,
    color: Colors.neutral[500],
  },
  docPaper: {
    backgroundColor: Colors.neutral[0],
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    ...Shadow.sm,
  },
  docTextContent: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: Colors.neutral[900],
    lineHeight: 18,
  },
});
