// ============================================================
// Kayda Sathi — Case Detail Screen (Phases 2, 3, 4)
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing, BorderRadius } from '@/constants';
import { Card, StatusBadge, ProgressBar, Button, type BadgeVariant } from '@/components/ui';
import { useCase, useEvidence } from '@/store/caseStore';
import { DEMO_CASE, DEMO_CONTRADICTIONS } from '@/store/demoData';
import { getCategoryById } from '@/constants';
import { CaseDocument } from '@/types';

type TabKey = 'overview' | 'timeline' | 'evidence' | 'actions' | 'documents';

const TABS: { key: TabKey; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'overview', label: 'Overview', icon: 'grid-outline' },
  { key: 'timeline', label: 'Timeline', icon: 'time-outline' },
  { key: 'evidence', label: 'Evidence', icon: 'shield-checkmark-outline' },
  { key: 'actions', label: 'Actions', icon: 'rocket-outline' },
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
  const [draftingDoc, setDraftingDoc] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<CaseDocument | null>(null);

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
    setDraftingDoc(true);
    try {
      const doc = await generateDocument(type);
      setSelectedDoc(doc);
    } catch (err: any) {
      Alert.alert('Drafting Error', err?.message || 'Could not draft document.');
    } finally {
      setDraftingDoc(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={Colors.neutral[700]} />
        </Pressable>
        <View style={styles.topBarCenter}>
          <Text style={styles.topBarTitle} numberOfLines={1}>{c.title}</Text>
          <StatusBadge label={statusInfo.label} variant={statusInfo.variant} />
        </View>
      </View>

      {/* Tab Navigation */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabContainer}
      >
        {TABS.map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
          >
            <Ionicons
              name={tab.icon}
              size={16}
              color={activeTab === tab.key ? Colors.primary[500] : Colors.neutral[400]}
            />
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Content */}
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
            draftingDoc={draftingDoc}
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
            <Text style={styles.docModalTitle} numberOfLines={1}>{selectedDoc?.title}</Text>
            <Pressable onPress={() => setSelectedDoc(null)} hitSlop={10}>
              <Ionicons name="close" size={24} color={Colors.neutral[700]} />
            </Pressable>
          </View>
          <ScrollView style={styles.docModalScroll} contentContainerStyle={styles.docModalContent}>
            <View style={styles.docTypeBadgeRow}>
              <StatusBadge label={selectedDoc?.type.replace('_', ' ') || 'NOTICE'} variant="info" />
              <Text style={styles.docGeneratedAt}>Drafted by Gemini Legal Engine</Text>
            </View>
            <View style={styles.docPaper}>
              <Text style={styles.docTextContent}>{selectedDoc?.content}</Text>
            </View>
            <Button
              title="Done Reading"
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
function OverviewTab({ caseData, cat, contradictions, onToggleAction }: any) {
  return (
    <>
      {/* Category & Description */}
      <Card variant="elevated" style={{ marginBottom: Spacing.md }}>
        <View style={styles.overviewHeader}>
          {cat && (
            <View style={[styles.catBadge, { backgroundColor: cat.bgColor }]}>
              <Ionicons name={cat.icon} size={15} color={cat.color} />
              <Text style={[styles.catLabel, { color: cat.color }]}>{cat.label}</Text>
            </View>
          )}
          {caseData.jurisdiction && (
            <View style={styles.jurisdictionBadge}>
              <Ionicons name="location-outline" size={12} color={Colors.neutral[500]} />
              <Text style={styles.jurisdictionText}>{caseData.jurisdiction}</Text>
            </View>
          )}
        </View>
        <Text style={styles.description}>{caseData.description}</Text>
      </Card>

      {/* Case Preparation Progress */}
      <Card variant="elevated" style={{ marginBottom: Spacing.md }}>
        <Text style={styles.sectionTitle}>Case Preparation Progress</Text>
        <ProgressBar label="Understanding" value={caseData.preparation.understanding} color={Colors.primary[500]} />
        <ProgressBar label="Evidence" value={caseData.preparation.evidence} color={Colors.info[500]} />
        <ProgressBar label="Action Readiness" value={caseData.preparation.actionReadiness} color={Colors.success[500]} />
      </Card>

      {/* Key Facts */}
      <Card variant="elevated" style={{ marginBottom: Spacing.md }}>
        <Text style={styles.sectionTitle}>Key Objective Facts ({caseData.facts.length})</Text>
        {caseData.facts.map((fact: any) => (
          <View key={fact.id} style={styles.factRow}>
            <View style={[
              styles.factDot,
              {
                backgroundColor: fact.status === 'VERIFIED' ? Colors.success[500]
                  : fact.status === 'USER_STATED' ? Colors.info[500]
                  : Colors.neutral[400],
              },
            ]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.factStatement}>{fact.statement}</Text>
              <Text style={styles.factStatus}>
                {fact.status.replace('_', ' ')}
                {fact.source ? ` · ${fact.source}` : ''}
              </Text>
            </View>
          </View>
        ))}
      </Card>

      {/* Inconsistencies / Contradictions */}
      {contradictions && contradictions.length > 0 && (
        <Card variant="outlined" style={styles.contradictionCard}>
          <View style={styles.contradictionHeader}>
            <Ionicons name="alert-circle" size={20} color={Colors.warning[500]} />
            <Text style={styles.contradictionTitle}>Potential Inconsistency</Text>
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
                  <Text style={styles.vsText}>vs</Text>
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

      {/* Next 3 Actions */}
      <Card variant="elevated" style={{ marginBottom: Spacing.md }}>
        <Text style={styles.sectionTitle}>Immediate Next Actions</Text>
        {caseData.actionItems.map((action: any, i: number) => (
          <Pressable
            key={action.id}
            style={[styles.actionRow, i < caseData.actionItems.length - 1 && styles.actionBorder]}
            onPress={() => onToggleAction(action.id)}
          >
            <View style={[
              styles.actionCheck,
              action.status === 'DONE' && styles.actionCheckDone,
            ]}>
              {action.status === 'DONE' ? (
                <Ionicons name="checkmark" size={14} color={Colors.neutral[0]} />
              ) : (
                <Text style={styles.actionNumber}>{action.order}</Text>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[
                styles.actionTitle,
                action.status === 'DONE' && styles.actionTitleDone,
              ]}>
                {action.title}
              </Text>
              <Text style={styles.actionDesc} numberOfLines={2}>{action.description}</Text>
            </View>
          </Pressable>
        ))}
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
      <Text style={styles.tabSectionTitle}>Chronological Sequence of Events</Text>
      {caseData.timeline.map((event: any, i: number) => (
        <View key={event.id} style={styles.timelineItem}>
          <View style={styles.timelineLeft}>
            <View style={styles.timelineDot} />
            {i < caseData.timeline.length - 1 && <View style={styles.timelineLine} />}
          </View>
          <Card variant="outlined" style={styles.timelineCard}>
            <Text style={styles.timelineDate}>{event.date}</Text>
            <Text style={styles.timelineTitle}>{event.title}</Text>
            {event.description && <Text style={styles.timelineDesc}>{event.description}</Text>}
            <View style={styles.timelineSource}>
              <Ionicons name="shield-outline" size={12} color={Colors.primary[500]} />
              <Text style={styles.timelineSourceText}>{event.sourceType.replace('_', ' ')}</Text>
            </View>
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
      <Text style={styles.tabSectionTitle}>Legal Claims & Proof Mapping</Text>

      {/* Claims */}
      {caseData.claims.map((claim: any) => (
        <Card key={claim.id} variant="elevated" style={{ marginBottom: Spacing.md }}>
          <View style={styles.claimHeader}>
            <StatusBadge
              label={`Strength: ${claim.strength}`}
              variant={claim.strength === 'STRONG' ? 'success' : claim.strength === 'MODERATE' ? 'active' : 'warning'}
            />
          </View>
          <Text style={styles.claimStatement}>{claim.statement}</Text>
          <Text style={styles.claimProofSub}>Supporting Evidence: {evidenceList.length} item(s)</Text>
        </Card>
      ))}

      {/* Evidence Items */}
      <Text style={[styles.tabSectionTitle, { marginTop: Spacing.md }]}>Attached Evidence Files</Text>
      {evidenceList.map((evi: any) => (
        <Card key={evi.id} variant="outlined" style={{ marginBottom: Spacing.sm }}>
          <View style={styles.eviHeader}>
            <Ionicons name="document-text" size={18} color={Colors.primary[600]} />
            <Text style={styles.eviTitle}>{evi.title}</Text>
          </View>
          {evi.extractedFacts && evi.extractedFacts.length > 0 && (
            <View style={styles.eviFacts}>
              {evi.extractedFacts.map((f: any) => (
                <View key={f.id} style={styles.eviFactChip}>
                  <Ionicons name="flash" size={12} color={Colors.success[600]} />
                  <Text style={styles.eviFactText}>{f.statement}</Text>
                </View>
              ))}
            </View>
          )}
        </Card>
      ))}

      <Button
        title="Add Proof to this Case"
        onPress={() => router.push('/(tabs)/evidence')}
        variant="secondary"
        icon="add-circle-outline"
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
      <Text style={styles.tabSectionTitle}>Step-by-Step Action Plan</Text>
      <Text style={styles.tabSubtitle}>
        Tap any step to mark complete. Completing steps updates your overall action readiness.
      </Text>
      {caseData.actionItems.map((action: any) => (
        <Card
          key={action.id}
          variant="elevated"
          style={styles.actionCard}
          onPress={() => onToggleAction(action.id)}
        >
          <View style={styles.actionDetailHeader}>
            <View style={[
              styles.actionCheck,
              action.status === 'DONE' && styles.actionCheckDone,
            ]}>
              {action.status === 'DONE' ? (
                <Ionicons name="checkmark" size={14} color={Colors.neutral[0]} />
              ) : (
                <Text style={styles.actionNumber}>{action.order}</Text>
              )}
            </View>
            <StatusBadge
              label={action.status === 'DONE' ? 'Completed' : 'Action Required'}
              variant={action.status === 'DONE' ? 'success' : 'action_required'}
            />
          </View>
          <Text style={styles.actionDetailTitle}>{action.title}</Text>
          <Text style={styles.actionDetailDesc}>{action.description}</Text>
          {action.reason && (
            <View style={styles.reasonBox}>
              <Ionicons name="bulb-outline" size={14} color={Colors.info[600]} />
              <Text style={styles.reasonText}>{action.reason}</Text>
            </View>
          )}
          {action.requirements && action.requirements.length > 0 && (
            <View style={styles.requirementsList}>
              <Text style={styles.requirementsTitle}>Required:</Text>
              {action.requirements.map((req: string, i: number) => (
                <View key={i} style={styles.requirementItem}>
                  <View style={styles.requirementDot} />
                  <Text style={styles.requirementText}>{req}</Text>
                </View>
              ))}
            </View>
          )}
        </Card>
      ))}
      <View style={{ height: Spacing['4xl'] }} />
    </>
  );
}

// -------------------------------------------------------------
// Documents Tab
// -------------------------------------------------------------
function DocumentsTab({ caseData, draftingDoc, onGenerateDoc, onViewDoc }: any) {
  const documents: CaseDocument[] = caseData.documents || [];

  return (
    <>
      <Text style={styles.tabSectionTitle}>Drafted Legal Documents</Text>

      {documents.length > 0 ? (
        documents.map((doc) => (
          <Card
            key={doc.id}
            variant="elevated"
            style={{ marginBottom: Spacing.md }}
            onPress={() => onViewDoc(doc)}
          >
            <View style={styles.docRow}>
              <View style={styles.docIconBg}>
                <Ionicons name="document-text" size={22} color={Colors.primary[600]} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.docTitleText}>{doc.title}</Text>
                <Text style={styles.docDateText}>
                  {new Date(doc.generatedAt).toLocaleDateString()} · {doc.type.replace('_', ' ')}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.neutral[400]} />
            </View>
          </Card>
        ))
      ) : (
        <Card variant="outlined" style={{ marginBottom: Spacing.md }}>
          <View style={styles.docEmptyContainer}>
            <Ionicons name="document-text-outline" size={36} color={Colors.neutral[400]} />
            <Text style={styles.docEmptyTitle}>No documents drafted yet</Text>
            <Text style={styles.docEmptyDesc}>
              Generate formal legal demand notices, complaints, and advocate briefs grounded in your verified facts.
            </Text>
          </View>
        </Card>
      )}

      {draftingDoc && (
        <View style={styles.draftingIndicator}>
          <ActivityIndicator size="small" color={Colors.primary[500]} />
          <Text style={styles.draftingText}>AI Legal Draftsman is preparing formal notice...</Text>
        </View>
      )}

      <Text style={[styles.tabSectionTitle, { marginTop: Spacing.md }]}>Draft With AI</Text>
      <View style={styles.docActionsWrap}>
        <Button
          title="Draft Formal Demand Notice"
          onPress={() => onGenerateDoc('REFUND_REQUEST')}
          variant="primary"
          icon="document-attach-outline"
          disabled={draftingDoc}
        />
        <Button
          title="Draft Statutory Complaint"
          onPress={() => onGenerateDoc('COMPLAINT')}
          variant="secondary"
          icon="business-outline"
          disabled={draftingDoc}
        />
        <Button
          title="Draft Advocate Case Brief"
          onPress={() => onGenerateDoc('LAWYER_BRIEF')}
          variant="outline"
          icon="reader-outline"
          disabled={draftingDoc}
        />
      </View>

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
    borderBottomColor: Colors.neutral[100],
  },
  backButton: {
    padding: Spacing.xs,
    marginRight: Spacing.sm,
  },
  topBarCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: Spacing.sm,
  },
  topBarTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.neutral[900],
    flex: 1,
    marginRight: Spacing.sm,
  },
  tabContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.neutral[0],
    gap: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neutral[100],
    marginRight: Spacing.xs,
  },
  tabActive: {
    backgroundColor: Colors.primary[50],
    borderWidth: 1,
    borderColor: Colors.primary[300],
  },
  tabText: {
    fontSize: FontSize.xs,
    fontWeight: '500',
    color: Colors.neutral[600],
  },
  tabTextActive: {
    color: Colors.primary[700],
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: Spacing.lg,
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
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  catBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  catLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  jurisdictionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  jurisdictionText: {
    fontSize: FontSize.xs,
    color: Colors.neutral[500],
  },
  description: {
    fontSize: FontSize.sm,
    color: Colors.neutral[800],
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.neutral[900],
    marginBottom: Spacing.sm,
  },
  factRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  factDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  factStatement: {
    fontSize: FontSize.sm,
    color: Colors.neutral[900],
    lineHeight: 20,
  },
  factStatus: {
    fontSize: FontSize.xs,
    color: Colors.neutral[500],
    marginTop: 2,
  },
  contradictionCard: {
    borderColor: Colors.warning[300],
    backgroundColor: Colors.warning[50],
    marginBottom: Spacing.md,
  },
  contradictionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  contradictionTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.warning[700],
  },
  contradictionBody: {
    marginTop: Spacing.xs,
  },
  contradictionDesc: {
    fontSize: FontSize.xs,
    color: Colors.warning[700],
    marginBottom: Spacing.sm,
  },
  contradictionSources: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contradictionSource: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  sourceLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.neutral[500],
  },
  sourceValue: {
    fontSize: FontSize.xs,
    color: Colors.neutral[800],
    marginTop: 2,
  },
  contradictionVs: {
    paddingHorizontal: Spacing.xs,
  },
  vsText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.neutral[400],
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  actionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  actionCheck: {
    width: 26,
    height: 26,
    borderRadius: 13,
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
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.neutral[600],
  },
  actionTitle: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.neutral[900],
  },
  actionTitleDone: {
    textDecorationLine: 'line-through',
    color: Colors.neutral[400],
  },
  actionDesc: {
    fontSize: FontSize.xs,
    color: Colors.neutral[500],
    marginTop: 2,
  },
  tabSectionTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.neutral[900],
    marginBottom: Spacing.xs,
  },
  tabSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.neutral[500],
    marginBottom: Spacing.md,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  timelineLeft: {
    width: 24,
    alignItems: 'center',
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary[500],
    marginTop: 4,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.neutral[200],
    marginTop: 4,
  },
  timelineCard: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  timelineDate: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.primary[600],
  },
  timelineTitle: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.neutral[900],
    marginTop: 2,
  },
  timelineDesc: {
    fontSize: FontSize.xs,
    color: Colors.neutral[600],
    marginTop: 4,
  },
  timelineSource: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.xs,
  },
  timelineSourceText: {
    fontSize: FontSize.xs,
    color: Colors.primary[700],
    fontWeight: '500',
  },
  claimHeader: {
    marginBottom: Spacing.xs,
  },
  claimStatement: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.neutral[900],
  },
  claimProofSub: {
    fontSize: FontSize.xs,
    color: Colors.neutral[500],
    marginTop: Spacing.xs,
  },
  eviHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  eviTitle: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.neutral[900],
  },
  eviFacts: {
    gap: 4,
    marginTop: 4,
  },
  eviFactChip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
  },
  eviFactText: {
    fontSize: FontSize.xs,
    color: Colors.neutral[700],
    flex: 1,
  },
  actionCard: {
    marginBottom: Spacing.md,
  },
  actionDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  actionDetailTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.neutral[900],
    marginTop: 4,
  },
  actionDetailDesc: {
    fontSize: FontSize.sm,
    color: Colors.neutral[600],
    lineHeight: 20,
    marginTop: 4,
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
    fontSize: FontSize.xs,
    color: Colors.info[700],
    flex: 1,
    lineHeight: 18,
  },
  requirementsList: {
    marginTop: Spacing.sm,
  },
  requirementsTitle: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.neutral[600],
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  requirementDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.neutral[400],
  },
  requirementText: {
    fontSize: FontSize.xs,
    color: Colors.neutral[700],
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  docIconBg: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  docTitleText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.neutral[900],
  },
  docDateText: {
    fontSize: FontSize.xs,
    color: Colors.neutral[500],
    marginTop: 2,
  },
  docEmptyContainer: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  docEmptyTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.neutral[800],
    marginTop: Spacing.sm,
  },
  docEmptyDesc: {
    fontSize: FontSize.xs,
    color: Colors.neutral[500],
    textAlign: 'center',
    lineHeight: 18,
    marginTop: Spacing.xs,
    maxWidth: 260,
  },
  draftingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary[50],
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  draftingText: {
    fontSize: FontSize.xs,
    color: Colors.primary[700],
    fontWeight: '600',
  },
  docActionsWrap: {
    gap: Spacing.sm,
  },
  docModalSafe: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  docModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.neutral[0],
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  docModalTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.neutral[900],
    flex: 1,
    marginRight: Spacing.sm,
  },
  docModalScroll: {
    flex: 1,
  },
  docModalContent: {
    padding: Spacing.xl,
  },
  docTypeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  docGeneratedAt: {
    fontSize: FontSize.xs,
    color: Colors.neutral[500],
  },
  docPaper: {
    backgroundColor: Colors.neutral[0],
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  docTextContent: {
    fontSize: FontSize.xs,
    fontFamily: 'monospace',
    color: Colors.neutral[900],
    lineHeight: 20,
  },
});
