// ============================================================
// Kayda Sathi — Mock AI Service (Fallback & Local Dev)
// ============================================================
// Provides realistic, legally structured responses based on Indian Law
// when Gemini API key is absent, offline, or for rapid testing.

import { v4 as uuidv4 } from 'uuid';
import {
  CaseCategory,
  Fact,
  Claim,
  TimelineEvent,
  ActionItem,
  IntakeQuestion,
  CasePreparation,
  ExtractedFact,
  Contradiction,
  EvidenceGap,
  CaseDocument,
} from '../types';

export class MockAiService {
  /**
   * Classify story, extract initial facts, claims, timeline & intake questions
   */
  static classifyAndIntake(description: string): {
    title: string;
    category: CaseCategory;
    subCategory: string;
    jurisdiction: string;
    facts: Fact[];
    claims: Claim[];
    timeline: TimelineEvent[];
    intakeQuestions: IntakeQuestion[];
    preparation: CasePreparation;
    actionItems: ActionItem[];
  } {
    const text = description.toLowerCase();

    // Determine category based on keywords
    let category: CaseCategory = 'CONSUMER';
    let subCategory = 'Deficiency of Service';
    let title = 'Consumer Dispute / Service Deficiency';
    let jurisdiction = 'District Consumer Disputes Redressal Commission';

    if (text.includes('rent') || text.includes('flat') || text.includes('deposit') || text.includes('landlord') || text.includes('tenant') || text.includes('owner')) {
      category = 'RENTAL';
      subCategory = 'Security Deposit Withholding';
      title = 'Rental Dispute — Security Deposit Recovery';
      jurisdiction = 'Rent Authority / Small Causes Court';
    } else if (text.includes('bank') || text.includes('upi') || text.includes('fraud') || text.includes('unauthorized') || text.includes('otp') || text.includes('transaction')) {
      category = 'BANKING';
      subCategory = 'Unauthorized Transaction';
      title = 'Banking Dispute — Unauthorized Electronic Transaction';
      jurisdiction = 'RBI Banking Ombudsman / Cyber Police';
    } else if (text.includes('cyber') || text.includes('scam') || text.includes('hacked') || text.includes('whatsapp') || text.includes('telegram') || text.includes('apk')) {
      category = 'CYBERCRIME';
      subCategory = 'Online Financial Fraud';
      title = 'Cybercrime Incident — Online Impersonation / Fraud';
      jurisdiction = 'National Cyber Crime Reporting Portal (1930)';
    } else if (text.includes('salary') || text.includes('boss') || text.includes('company') || text.includes('fired') || text.includes('resignation') || text.includes('pf') || text.includes('workplace')) {
      category = 'WORKPLACE';
      subCategory = 'Unpaid Salary & Full & Final Settlement';
      title = 'Workplace Grievance — Non-Payment of Dues';
      jurisdiction = 'Labour Commissioner / Labour Court';
    } else if (text.includes('notice') || text.includes('advocate') || text.includes('summons') || text.includes('court')) {
      category = 'LEGAL_NOTICE';
      subCategory = 'Legal Notice Reply';
      title = 'Legal Notice Defense & Reply';
      jurisdiction = 'Civil Court / Arbitrator';
    }

    // Extract facts
    const facts: Fact[] = [
      {
        id: uuidv4(),
        statement: `Complainant submitted formal grievance regarding: "${description.slice(0, 120)}..."`,
        status: 'USER_STATED',
        source: 'Citizen Initial Narrative',
        extractedAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        statement: 'A dispute occurred between the parties regarding monetary consideration and promised obligations.',
        status: 'USER_STATED',
        source: 'Citizen Statement',
        extractedAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        statement: 'The citizen asserts that written or electronic communications exist documenting the grievance.',
        status: 'AI_INFERRED',
        source: 'Story Analysis',
        extractedAt: new Date().toISOString(),
      },
    ];

    // Build timeline
    const today = new Date();
    const timeline: TimelineEvent[] = [
      {
        id: uuidv4(),
        date: new Date(today.getTime() - 25 * 86400000).toISOString().split('T')[0],
        title: 'Initial Transaction / Agreement',
        description: 'Agreement entered into or service transaction initiated between parties.',
        sourceType: 'USER_STATEMENT',
      },
      {
        id: uuidv4(),
        date: new Date(today.getTime() - 7 * 86400000).toISOString().split('T')[0],
        title: 'Dispute / Breach Occurred',
        description: 'Opposite party failed to perform obligation, deliver service, or refund dues.',
        sourceType: 'USER_STATEMENT',
      },
      {
        id: uuidv4(),
        date: today.toISOString().split('T')[0],
        title: 'Grievance Registered on Kayda Sathi',
        description: 'Citizen organized facts and initiated legal readiness protocol.',
        sourceType: 'AI_INFERRED',
      },
    ];

    // Build Claims
    const claims: Claim[] = [
      {
        id: uuidv4(),
        statement: category === 'RENTAL'
          ? 'Entitled to immediate refund of security deposit with statutory interest'
          : category === 'BANKING'
          ? 'Zero liability for unauthorized electronic transaction reported promptly under RBI 2017 circular'
          : 'Entitled to full restitution and statutory compensation for deficiency of service under CPA 2019',
        supportingEvidenceIds: [],
        supportingFacts: [facts[0].statement],
        strength: 'MODERATE',
      },
      {
        id: uuidv4(),
        statement: 'No contractual breach or legitimate grounds for deduction exists against the complainant',
        supportingEvidenceIds: [],
        supportingFacts: [facts[1].statement],
        strength: 'WEAK',
      },
    ];

    // Build Intake Questions
    const intakeQuestions: IntakeQuestion[] = [
      {
        questionId: 'q1_amount',
        question: 'What is the exact financial amount in dispute (in ₹)?',
        type: 'AMOUNT',
        required: true,
      },
      {
        questionId: 'q2_written_doc',
        question: 'Do you possess a written agreement, signed contract, or invoice?',
        type: 'SELECT',
        options: ['Yes, fully signed/valid', 'Only digital receipts / chats', 'No written agreement'],
        required: true,
      },
      {
        questionId: 'q3_opposite_party',
        question: 'What is the full legal name and contact phone/email of the opposite party?',
        type: 'TEXT',
        required: true,
      },
    ];

    // Action items
    const actionItems: ActionItem[] = [
      {
        id: uuidv4(),
        title: 'Compile Written Communications & Financial Proofs',
        description: 'Export all WhatsApp chats, payment receipts (UTR numbers), and relevant emails into PDF format.',
        reason: 'Under Bharatiya Sakshya Adhiniyam 2023, electronic evidence requires verifiable date and sender metadata.',
        requirements: ['Bank statement showing deduction', 'Chat export text/PDF'],
        status: 'TODO',
        order: 1,
      },
      {
        id: uuidv4(),
        title: 'Issue Formal Written Demand Notice',
        description: 'Send a formal, dated demand giving the opposite party a strict 7 or 15-day cure window to resolve.',
        reason: 'Establishing a clear paper trail is mandatory before filing formal complaints before Indian statutory forums.',
        requirements: ['Opposite party full address or email', 'Detailed calculation of claims'],
        status: 'TODO',
        order: 2,
      },
      {
        id: uuidv4(),
        title: category === 'CONSUMER'
          ? 'File Grievance on National Consumer Helpline (NCH / INGRAM)'
          : category === 'BANKING'
          ? 'File Formal Complaint with Banking Ombudsman via CMS Portal'
          : 'Lodge Formal Complaint with Jurisdiction Authority',
        description: 'Submit an online grievance with all supporting transaction IDs and documents.',
        reason: 'Statutory dispute mechanisms resolve the majority of documented claims without heavy advocate fees.',
        requirements: ['Case Summary PDF', 'Evidence bundle'],
        status: 'TODO',
        order: 3,
      },
    ];

    return {
      title,
      category,
      subCategory,
      jurisdiction,
      facts,
      claims,
      timeline,
      intakeQuestions,
      preparation: {
        understanding: 60,
        evidence: 25,
        actionReadiness: 45,
      },
      actionItems,
    };
  }

  /**
   * Refine case based on intake answers
   */
  static refineCaseWithIntake(
    existingCase: any,
    answers: { questionId: string; answer: string }[]
  ): {
    facts: Fact[];
    claims: Claim[];
    preparation: CasePreparation;
    actionItems: ActionItem[];
  } {
    const updatedFacts = [...existingCase.facts];

    for (const ans of answers) {
      if (ans.questionId.includes('amount')) {
        updatedFacts.push({
          id: uuidv4(),
          statement: `Total disputed financial claim is ₹${ans.answer.replace(/[^0-9]/g, '') || ans.answer}.`,
          status: 'USER_STATED',
          source: 'Citizen Intake Clarification',
          extractedAt: new Date().toISOString(),
        });
      } else if (ans.questionId.includes('doc')) {
        updatedFacts.push({
          id: uuidv4(),
          statement: `Documentary status: ${ans.answer}`,
          status: ans.answer.includes('Yes') ? 'VERIFIED' : 'USER_STATED',
          source: 'Intake Questionnaire',
          extractedAt: new Date().toISOString(),
        });
      } else if (ans.questionId.includes('party')) {
        updatedFacts.push({
          id: uuidv4(),
          statement: `Opposite party identified as: ${ans.answer}`,
          status: 'USER_STATED',
          source: 'Citizen Intake Clarification',
          extractedAt: new Date().toISOString(),
        });
      }
    }

    // Boost claims
    const updatedClaims = existingCase.claims.map((claim: Claim) => ({
      ...claim,
      strength: claim.strength === 'WEAK' ? 'MODERATE' : 'STRONG',
    }));

    // Recalculate preparation
    const preparation: CasePreparation = {
      understanding: Math.min(100, (existingCase.preparation?.understanding || 50) + 20),
      evidence: Math.min(100, (existingCase.preparation?.evidence || 20) + 15),
      actionReadiness: Math.min(100, (existingCase.preparation?.actionReadiness || 40) + 20),
    };

    return {
      facts: updatedFacts,
      claims: updatedClaims,
      preparation,
      actionItems: existingCase.actionItems,
    };
  }

  /**
   * Analyze newly uploaded evidence
   */
  static analyzeEvidence(
    evidenceTitle: string,
    evidenceType: string,
    description?: string
  ): {
    extractedFacts: ExtractedFact[];
    supportedClaims: string[];
    contradictions: Contradiction[];
    evidenceGaps: EvidenceGap[];
  } {
    const extractedFacts: ExtractedFact[] = [
      {
        id: uuidv4(),
        statement: `Document "${evidenceTitle}" validates transaction record and party correspondence.`,
        confidence: 'HIGH',
      },
      {
        id: uuidv4(),
        statement: `Electronic metadata confirms document created/transmitted on or before current date.`,
        confidence: 'HIGH',
      },
    ];

    if (evidenceType.includes('AGREEMENT') || evidenceTitle.toLowerCase().includes('agreement')) {
      extractedFacts.push({
        id: uuidv4(),
        statement: 'Contractual terms establish refund and notice period obligations on both parties.',
        confidence: 'HIGH',
      });
    }

    if (evidenceType.includes('PAYMENT') || evidenceTitle.toLowerCase().includes('payment')) {
      extractedFacts.push({
        id: uuidv4(),
        statement: 'Bank transaction proof verifies monetary transfer to opposite party account.',
        confidence: 'HIGH',
      });
    }

    const contradictions: Contradiction[] = [];
    if (evidenceType === 'WHATSAPP_SCREENSHOT' || evidenceTitle.toLowerCase().includes('chat')) {
      contradictions.push({
        id: uuidv4(),
        description: 'Opposite party informal message claims deductions not sanctioned in original agreement.',
        sourceA: { evidenceId: 'ev-1', label: 'Original Agreement', value: 'Clause 6: Refund within 15 days without repair deductions' },
        sourceB: { evidenceId: 'ev-chat', label: 'WhatsApp Message', value: 'Landlord asserts unilateral deduction for normal wear-and-tear' },
      });
    }

    const evidenceGaps: EvidenceGap[] = [
      {
        id: uuidv4(),
        description: 'Formal written move-out or hand-over receipt signed by both parties is not yet attached.',
        suggestedEvidence: ['Signed Inspection Checklist', 'Move-out Key Handover Receipt', 'Video walk-through'],
        importance: 'MEDIUM',
      },
    ];

    return {
      extractedFacts,
      supportedClaims: ['Entitled to immediate refund of security deposit with statutory interest'],
      contradictions,
      evidenceGaps,
    };
  }

  /**
   * Generate formal draft legal documents
   */
  static generateLegalDocument(
    c: any,
    type: CaseDocument['type']
  ): CaseDocument {
    const today = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    let title = 'Legal Notice';
    let content = '';

    if (type === 'REFUND_REQUEST') {
      title = `Formal Demand Notice for Refund — ${c.title}`;
      content = `
BY REGISTERED POST A.D. / SPEED POST / EMAIL

Date: ${today}

TO:
The Opposite Party / Landlord / Service Provider
Regarding: ${c.title}
Case Reference: ${c.id}

SUBJECT: FORMAL DEMAND NOTICE FOR IMMEDIATE SETTLEMENT AND REFUND

Sir / Madam,

Under instructions from and on behalf of my client / the aggrieved party, I hereby state as follows:

1. That you entered into a valid agreement/transaction with the undersigned regarding ${c.category} matters at ${c.jurisdiction || 'India'}.

2. CHRONOLOGY OF FACTS:
${c.timeline.map((t: TimelineEvent, idx: number) => `   (${idx + 1}) On ${t.date}: ${t.title} — ${t.description || ''}`).join('\n')}

3. SUMMARY OF GRIEVANCE:
   The undersigned has fulfilled all reciprocal obligations. Despite repeated written and verbal requests, you have willfully failed and neglected to refund/settle the rightful monetary dues without any lawful justification.

4. STATUTORY VIOLATION:
   Your unilateral and arbitrary withholding constitutes breach of contract, unjust enrichment, and unfair practice under the relevant statutory provisions of the Consumer Protection Act, 2019 / Transfer of Property Act, 1882.

5. FINAL DEMAND:
   You are hereby called upon to refund and transfer the entire outstanding dues into the bank account of the undersigned within SEVEN (7) DAYS of receipt of this notice, failing which the undersigned shall be constrained to initiate appropriate legal proceedings before the competent forum at your sole risk, cost, and consequences.

Yours faithfully,

Aggrieved Citizen / Complainant
(Generated via Kayda Sathi Legal Assistant)
`.trim();
    } else if (type === 'COMPLAINT') {
      title = `Formal Complaint Before ${c.jurisdiction || 'Appropriate Statutory Forum'}`;
      content = `
BEFORE THE HON'BLE STATUTORY COMMISSION / DISPUTE FORUM
AT: ${c.jurisdiction || 'MUMBAI / NEW DELHI / BENGALURU'}

COMPLAINT NO: _______ OF 2026

IN THE MATTER OF:
Aggrieved Citizen ... COMPLAINANT
VERSUS
Opposite Party ... RESPONDENT

COMPLAINT UNDER SECTION 35 OF CONSUMER PROTECTION ACT 2019 / RELEVANT STATUTE

MOST RESPECTFULLY SHOWETH:

1. That the Complainant is a law-abiding citizen residing at the address stated above.
2. That the Respondent is an entity/individual engaged in commercial transaction / tenancy.
3. FACTS OF THE CASE:
${c.facts.map((f: Fact, idx: number) => `   (${idx + 1}) ${f.statement} [Status: ${f.status}]`).join('\n')}

4. CAUSE OF ACTION:
   The cause of action arose on the date when the Respondent failed to refund the legitimate amount despite formal demand.

5. PRAYER:
   It is most respectfully prayed that this Hon'ble Forum may be pleased to:
   a) Direct the Respondent to immediately refund the disputed consideration amount.
   b) Award reasonable compensation for harassment and mental agony.
   c) Grant litigation costs to the Complainant.

COMPLAINANT
THROUGH ADVOCATE / IN PERSON
`.trim();
    } else {
      title = `Advocate Case Brief — ${c.title}`;
      content = `
KAYDA SATHI — ADVOCATE CASE SUMMARY BRIEF
=========================================
Generated: ${today}
Case Category: ${c.category} (${c.subCategory || 'General'})
Forum/Jurisdiction: ${c.jurisdiction || 'TBD'}

1. EXECUTIVE SUMMARY:
${c.description}

2. KEY OBJECTIVE FACTS:
${c.facts.map((f: Fact) => `• [${f.status}] ${f.statement}`).join('\n')}

3. PRIMARY LEGAL CLAIMS & STRENGTH:
${c.claims.map((cl: Claim) => `• ${cl.statement} (Strength: ${cl.strength})`).join('\n')}

4. CHRONOLOGICAL TIMELINE:
${c.timeline.map((t: TimelineEvent) => `• ${t.date}: ${t.title} (${t.sourceType})`).join('\n')}

5. EVIDENCE ATTACHED:
• Total Evidence Items: ${c.evidenceIds?.length || 0}
• Preparation Readiness: Understanding ${c.preparation?.understanding}%, Evidence ${c.preparation?.evidence}%, Readiness ${c.preparation?.actionReadiness}%
`.trim();
    }

    return {
      id: uuidv4(),
      type,
      title,
      content,
      generatedAt: new Date().toISOString(),
    };
  }
}
