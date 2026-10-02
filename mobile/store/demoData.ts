// ============================================================
// Kayda Sathi — Demo Data
// ============================================================
// Complete seeded demo case for Rahul Sharma's security deposit dispute.
// All data here is marked isDemo: true and is clearly separated from real data.

import type { Case, CaseSummary, Fact, Claim, TimelineEvent, ActionItem } from '../../shared/types/case';
import type { Evidence, EvidenceGap, Contradiction } from '../../shared/types/evidence';

const DEMO_CASE_ID = 'demo-rahul-security-deposit';

// ---- Facts ----
const demoFacts: Fact[] = [
  {
    id: 'fact-1',
    statement: 'Security deposit of ₹30,000 was paid to landlord Amit Patil',
    status: 'VERIFIED',
    source: 'UPI Payment Screenshot',
    sourceEvidenceId: 'evi-2',
  },
  {
    id: 'fact-2',
    statement: 'Rental agreement was signed on 01 Sep 2024',
    status: 'VERIFIED',
    source: 'Rental Agreement',
    sourceEvidenceId: 'evi-1',
  },
  {
    id: 'fact-3',
    statement: 'Tenant vacated property on 30 Sep 2025',
    status: 'USER_STATED',
  },
  {
    id: 'fact-4',
    statement: 'Landlord acknowledged receiving ₹30,000 deposit via WhatsApp',
    status: 'VERIFIED',
    source: 'WhatsApp Conversation',
    sourceEvidenceId: 'evi-3',
  },
  {
    id: 'fact-5',
    statement: 'Landlord claims ₹10,000 deduction for repairs',
    status: 'USER_STATED',
    source: 'Landlord WhatsApp Message',
    sourceEvidenceId: 'evi-5',
  },
  {
    id: 'fact-6',
    statement: 'No prior notice given about property damage',
    status: 'USER_STATED',
  },
  {
    id: 'fact-7',
    statement: 'Property is located in Maharashtra',
    status: 'USER_STATED',
  },
];

// ---- Claims ----
const demoClaims: Claim[] = [
  {
    id: 'claim-1',
    statement: '₹30,000 security deposit was paid',
    supportingEvidenceIds: ['evi-1', 'evi-2', 'evi-3'],
    supportingFacts: ['fact-1', 'fact-4'],
    strength: 'STRONG',
  },
  {
    id: 'claim-2',
    statement: 'Deposit was acknowledged by the landlord',
    supportingEvidenceIds: ['evi-3'],
    supportingFacts: ['fact-4'],
    strength: 'STRONG',
  },
  {
    id: 'claim-3',
    statement: 'Property was left in good condition',
    supportingEvidenceIds: ['evi-4'],
    supportingFacts: [],
    strength: 'MODERATE',
  },
  {
    id: 'claim-4',
    statement: 'Deduction of ₹10,000 is unjustified',
    supportingEvidenceIds: ['evi-4', 'evi-5'],
    supportingFacts: ['fact-5', 'fact-6'],
    strength: 'MODERATE',
  },
];

// ---- Timeline ----
const demoTimeline: TimelineEvent[] = [
  {
    id: 'tl-1',
    date: '2024-08-12',
    title: 'Security deposit paid',
    description: '₹30,000 transferred via UPI',
    sourceType: 'EVIDENCE',
    sourceId: 'evi-2',
    sourceLabel: 'UPI Screenshot',
  },
  {
    id: 'tl-2',
    date: '2024-09-01',
    title: 'Rental agreement signed',
    description: '11-month agreement executed',
    sourceType: 'EVIDENCE',
    sourceId: 'evi-1',
    sourceLabel: 'Rental Agreement',
  },
  {
    id: 'tl-3',
    date: '2025-09-30',
    title: 'Property vacated',
    description: 'Tenant moved out after agreement completion',
    sourceType: 'USER_STATEMENT',
  },
  {
    id: 'tl-4',
    date: '2025-10-05',
    title: 'Refund requested',
    description: 'Written request sent via WhatsApp',
    sourceType: 'EVIDENCE',
    sourceId: 'evi-3',
    sourceLabel: 'WhatsApp Conversation',
  },
  {
    id: 'tl-5',
    date: '2025-10-10',
    title: 'Landlord responded',
    description: 'Claimed ₹10,000 deduction for repairs',
    sourceType: 'EVIDENCE',
    sourceId: 'evi-5',
    sourceLabel: 'Landlord Message',
  },
];

// ---- Action Items ----
const demoActions: ActionItem[] = [
  {
    id: 'action-1',
    title: 'Collect move-out photographs',
    description: 'Gather any photographs taken at the time of vacating the property that show its condition.',
    reason: 'Visual proof of property condition strengthens the claim that the deposit deduction is unjustified.',
    requirements: ['Photographs of rooms', 'Timestamps visible if possible'],
    status: 'IN_PROGRESS',
    order: 1,
  },
  {
    id: 'action-2',
    title: 'Send a written refund request',
    description: 'Send a formal written request to the landlord demanding refund of the full ₹30,000 security deposit.',
    reason: 'A written demand creates a documented trail and is often required before escalation.',
    requirements: ['Rental agreement copy', 'Payment proof', 'Communication history'],
    status: 'TODO',
    order: 2,
  },
  {
    id: 'action-3',
    title: 'Preserve all communication records',
    description: 'Take screenshots and backups of all WhatsApp messages, calls, and emails with the landlord.',
    reason: 'Digital communications can be deleted. Preserving them early protects your evidence.',
    requirements: ['WhatsApp export', 'Email archives', 'Call records'],
    status: 'DONE',
    order: 3,
  },
];

// ---- The Demo Case ----
export const DEMO_CASE: Case = {
  id: DEMO_CASE_ID,
  userId: 'demo-user',
  title: 'Security Deposit Refund — Amit Patil',
  category: 'RENTAL',
  subCategory: 'SECURITY_DEPOSIT',
  description:
    'My landlord Amit Patil is refusing to return my ₹30,000 security deposit. I moved out after completing the rental period but he is now claiming ₹10,000 for repairs that were never discussed.',
  jurisdiction: 'Maharashtra',
  facts: demoFacts,
  claims: demoClaims,
  timeline: demoTimeline,
  evidenceIds: ['evi-1', 'evi-2', 'evi-3', 'evi-4', 'evi-5'],
  actionItems: demoActions,
  documents: [],
  status: 'ACTION_REQUIRED',
  preparation: {
    understanding: 80,
    evidence: 65,
    actionReadiness: 40,
  },
  isDemo: true,
  createdAt: '2025-10-01T10:00:00.000Z',
  updatedAt: '2025-10-10T14:30:00.000Z',
};

// ---- Demo Evidence ----
export const DEMO_EVIDENCE: Evidence[] = [
  {
    id: 'evi-1',
    caseId: DEMO_CASE_ID,
    type: 'RENTAL_AGREEMENT',
    title: 'Rental Agreement',
    description: '11-month rental agreement between Rahul Sharma and Amit Patil',
    documentDate: '2024-09-01',
    uploadedAt: '2025-10-02T09:00:00.000Z',
    extractedFacts: [
      { id: 'ef-1', statement: 'Security deposit: ₹30,000', confidence: 'HIGH' },
      { id: 'ef-2', statement: 'Monthly rent: ₹12,000', confidence: 'HIGH' },
      { id: 'ef-3', statement: 'Agreement period: 11 months from 01 Sep 2024', confidence: 'HIGH' },
    ],
    relatedClaims: ['claim-1'],
    isDemo: true,
  },
  {
    id: 'evi-2',
    caseId: DEMO_CASE_ID,
    type: 'PAYMENT_PROOF',
    title: 'UPI Payment Screenshot',
    description: 'UPI transfer of ₹30,000 to Amit Patil on 12 Aug 2024',
    documentDate: '2024-08-12',
    uploadedAt: '2025-10-02T09:15:00.000Z',
    extractedFacts: [
      { id: 'ef-4', statement: '₹30,000 transferred via UPI', confidence: 'HIGH' },
      { id: 'ef-5', statement: 'Recipient: Amit Patil', confidence: 'HIGH' },
      { id: 'ef-6', statement: 'Date: 12 Aug 2024', confidence: 'HIGH' },
    ],
    relatedClaims: ['claim-1'],
    isDemo: true,
  },
  {
    id: 'evi-3',
    caseId: DEMO_CASE_ID,
    type: 'WHATSAPP_SCREENSHOT',
    title: 'WhatsApp Conversation',
    description: 'Messages between Rahul and Amit discussing deposit and refund',
    documentDate: '2025-10-05',
    uploadedAt: '2025-10-02T09:30:00.000Z',
    extractedFacts: [
      { id: 'ef-7', statement: 'Landlord acknowledges receiving ₹30,000 deposit', confidence: 'HIGH' },
      { id: 'ef-8', statement: 'Tenant requests refund on 05 Oct 2025', confidence: 'HIGH' },
    ],
    relatedClaims: ['claim-1', 'claim-2'],
    isDemo: true,
  },
  {
    id: 'evi-4',
    caseId: DEMO_CASE_ID,
    type: 'PHOTOGRAPH',
    title: 'Move-out Photograph',
    description: 'Photograph of living room showing clean condition at time of move-out',
    documentDate: '2025-09-30',
    uploadedAt: '2025-10-02T10:00:00.000Z',
    extractedFacts: [
      { id: 'ef-9', statement: 'Room appears in clean, undamaged condition', confidence: 'MEDIUM' },
    ],
    relatedClaims: ['claim-3', 'claim-4'],
    isDemo: true,
  },
  {
    id: 'evi-5',
    caseId: DEMO_CASE_ID,
    type: 'WHATSAPP_SCREENSHOT',
    title: 'Landlord Response Message',
    description: 'Landlord\'s WhatsApp message claiming ₹10,000 deduction for repairs',
    documentDate: '2025-10-10',
    uploadedAt: '2025-10-10T14:00:00.000Z',
    extractedFacts: [
      { id: 'ef-10', statement: 'Landlord claims ₹10,000 deduction for "repairs"', confidence: 'HIGH' },
      { id: 'ef-11', statement: 'Deposit amount mentioned as ₹20,000 (discrepancy)', confidence: 'HIGH' },
    ],
    relatedClaims: ['claim-4'],
    isDemo: true,
  },
];

// ---- Demo Evidence Gaps ----
export const DEMO_EVIDENCE_GAPS: EvidenceGap[] = [
  {
    id: 'gap-1',
    description: 'Proof of property condition at move-out',
    suggestedEvidence: [
      'Additional move-out photographs (all rooms)',
      'Handover message or acknowledgment',
      'Joint inspection record',
    ],
    importance: 'HIGH',
  },
  {
    id: 'gap-2',
    description: 'Written refund request or formal demand',
    suggestedEvidence: [
      'Formal letter or email requesting refund',
      'Registered post acknowledgment',
    ],
    importance: 'HIGH',
  },
  {
    id: 'gap-3',
    description: 'Proof of rent payments during tenancy',
    suggestedEvidence: [
      'Bank statements showing monthly rent transfers',
      'Rent receipts',
    ],
    importance: 'MEDIUM',
  },
];

// ---- Demo Contradictions ----
export const DEMO_CONTRADICTIONS: Contradiction[] = [
  {
    id: 'contra-1',
    description: 'Security deposit amount differs between sources',
    sourceA: {
      evidenceId: 'evi-1',
      label: 'Rental Agreement',
      value: 'Security deposit: ₹30,000',
    },
    sourceB: {
      evidenceId: 'evi-5',
      label: 'Landlord Message',
      value: 'Deposit mentioned as ₹20,000',
    },
  },
];

// ---- Helper: Summary for lists ----
export const DEMO_CASE_SUMMARY: CaseSummary = {
  id: DEMO_CASE.id,
  title: DEMO_CASE.title,
  category: DEMO_CASE.category,
  status: DEMO_CASE.status,
  preparation: DEMO_CASE.preparation,
  updatedAt: DEMO_CASE.updatedAt,
  isDemo: true,
};
