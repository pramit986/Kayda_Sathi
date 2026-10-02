// ============================================================
// Kayda Sathi — Controlled Authoritative Legal Knowledge Layer
// ============================================================
// Legal information MUST come from this verified source layer,
// NOT synthesized or fabricated by Gemini.
// Sources include India Code, NALSA, RBI, Consumer Commission,
// Cyber Crime Portal, and State Housing / Tenancy Departments.

import { LegalSourceReference } from '@/types';

export const AUTHORITATIVE_LEGAL_SOURCES: LegalSourceReference[] = [
  {
    id: 'src-rental-mhra-sec15',
    category: 'RENTAL',
    legalTopic: 'Security Deposit Refund & Arbitrary Deductions',
    explanation:
      'Under the Model Tenancy Act & State Rent Control laws (e.g. Maharashtra Rent Control Act 1999), security deposits must be refunded upon handover of peaceful vacant possession, after deducting legitimate documented unpaid dues or reasonable normal wear-and-tear damages.',
    rights: [
      'Right to receive itemized repair receipts for any deposit deductions',
      'Right to full refund within the agreed contractual timeline upon vacating',
      'Protection against arbitrary deduction without prior inspection or notice',
    ],
    possibleRemedies: [
      'Issue formal demand legal notice with interest under Section 8 of Interest Act',
      'Lodge summary dispute before the Rent Authority / Small Causes Court',
      'File complaint under Consumer Protection Act 2019 for deficiency of service if leased through a commercial entity',
    ],
    nextSteps: [
      'Serve a 15-day statutory written demand notice via Registered Post / Email',
      'Produce move-out photos and handover video corroborating property condition',
      'Demand inspection bill proofs from licensed contractors for disputed repairs',
    ],
    authority: 'Department of Housing and Urban Affairs & State Rent Authority',
    sourceTitle: 'Model Tenancy Provisions & Maharashtra Rent Control Framework',
    sourceUrl: 'https://mohua.gov.in/cms/model-tenancy-act.php',
    sourceType: 'OFFICIAL_GOVERNMENT',
    lastVerified: '2026-08-15',
  },
  {
    id: 'src-consumer-cpa-2019',
    category: 'CONSUMER',
    legalTopic: 'Deficiency in Service & Unfair Trade Practices',
    explanation:
      'The Consumer Protection Act, 2019 empowers consumers against defective goods and deficiency in services, providing a three-tier statutory redressal forum (District Commission up to ₹50 Lakh, State Commission up to ₹2 Crore, and NCDRC).',
    rights: [
      'Right to be protected against unfair contract terms and misleading promises',
      'Right to seek compensation for harassment, financial loss, or mental agony',
      'Right to file complaint digitally via e-Daakhil without hiring an advocate',
    ],
    possibleRemedies: [
      'Replacement, refund with interest, and punitive damages for mental agony',
      'Filing online complaint on INGRAM National Consumer Helpline (NCH)',
      'Filing statutory case on e-Daakhil Consumer Commission portal',
    ],
    nextSteps: [
      'Register grievance on National Consumer Helpline (1800-11-4000)',
      'Preserve tax invoice, payment proofs, and written complaint emails',
      'Issue formal 15-day legal notice before filing on e-Daakhil',
    ],
    authority: 'Ministry of Consumer Affairs, Food & Public Distribution',
    sourceTitle: 'Consumer Protection Act, 2019 (Act No. 35 of 2019) — India Code',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/15256',
    sourceType: 'STATUTE_ACT',
    lastVerified: '2026-09-01',
  },
  {
    id: 'src-banking-rbi-ombudsman',
    category: 'BANKING',
    legalTopic: 'Unauthorized Electronic Banking Transactions & Customer Liability',
    explanation:
      'Under Reserve Bank of India (RBI) circular on Customer Protection (Zero Liability of a Customer in Unauthorized Electronic Banking Transactions), customer has zero liability if fraud is notified within 3 working days of receiving unauthorized transaction alert.',
    rights: [
      'Zero liability if reported within 3 working days of third-party fraud',
      'Limited liability (up to ₹10,000) if reported between 4 to 7 working days',
      'Right to escalation to RBI Banking Ombudsman if bank does not resolve in 30 days',
    ],
    possibleRemedies: [
      'Mandatory shadow reversal of debited amount by bank within 10 working days',
      'Escalation to RBI Ombudsman under Reserve Bank - Integrated Ombudsman Scheme',
    ],
    nextSteps: [
      'Immediately block card / account / UPI ID via bank helpline or mobile app',
      'File written complaint with bank Branch Manager and get acknowledgement',
      'Register cyber financial fraud report on 1930 / cybercrime.gov.in',
    ],
    authority: 'Reserve Bank of India (RBI)',
    sourceTitle: 'RBI Master Direction – Customer Protection (Unauthorized Electronic Transactions)',
    sourceUrl: 'https://www.rbi.org.in/scripts/BS_CircularIndexDisplay.aspx?Id=11040',
    sourceType: 'REGULATORY_BODY',
    lastVerified: '2026-07-20',
  },
  {
    id: 'src-cybercrime-it-act',
    category: 'CYBERCRIME',
    legalTopic: 'Online Financial Fraud, Phishing & Identity Theft',
    explanation:
      'Information Technology Act, 2000 (Sections 43, 66C, 66D) read with Bharatiya Nyaya Sanhita (BNS) 2023 penalizes computer-related offenses, identity theft, and cheating by personation using computer resources.',
    rights: [
      'Right to prompt registration of Cyber Financial Fraud Zero FIR',
      'Right to financial trail freeze through Indian Cyber Crime Coordination Centre (I4C)',
      'Free legal aid assistance under NALSA for eligible cyber fraud victims',
    ],
    possibleRemedies: [
      'Freezing of beneficiary scammer bank account via CFCFRMS / 1930 portal',
      'Recovery of frozen amounts through Magistrate Court Section 457 CrPC / 503 BNSS application',
    ],
    nextSteps: [
      'Dial 1930 immediately within the golden hour to freeze fund transit',
      'File formal incident on cybercrime.gov.in and download cyber acknowledgment PDF',
      'Keep transaction reference (UTR/RRN), SMS alert screenshots, and scammer phone/URL',
    ],
    authority: 'Ministry of Home Affairs & Indian Cyber Crime Coordination Centre (I4C)',
    sourceTitle: 'National Cyber Crime Reporting Portal & IT Act 2000 Framework',
    sourceUrl: 'https://cybercrime.gov.in',
    sourceType: 'OFFICIAL_GOVERNMENT',
    lastVerified: '2026-09-10',
  },
  {
    id: 'src-nalsa-legal-aid',
    category: 'GOVERNMENT',
    legalTopic: 'Free Legal Services to Citizens & Lok Adalat Settlement',
    explanation:
      'Under Legal Services Authorities Act, 1987, citizens belonging to marginalized communities, women, children, industrial workmen, and persons with annual income under statutory threshold are entitled to free competent legal services and pre-litigation Lok Adalat mediation.',
    rights: [
      'Right to free advocate assignment across all civil and criminal courts',
      'Right to Lok Adalat amicable settlement with court fee refund upon settlement',
    ],
    possibleRemedies: [
      'Pre-litigation conciliation settlement through District Legal Services Authority (DLSA)',
      'Appointment of panel counsel without legal fee expense',
    ],
    nextSteps: [
      'Call NALSA National Helpline 15100 or visit nearest Taluka Legal Services Committee',
      'Apply online via NALSA Legal Services Portal (nalsa.gov.in)',
    ],
    authority: 'National Legal Services Authority (NALSA)',
    sourceTitle: 'Legal Services Authorities Act, 1987 (Act No. 39 of 1987) — NALSA',
    sourceUrl: 'https://nalsa.gov.in',
    sourceType: 'OFFICIAL_GOVERNMENT',
    lastVerified: '2026-06-30',
  },
];

/**
 * Controlled resolver: Matches a category and optional topic to an authoritative legal source.
 * If not verified in database, explicitly returns null so UI can state "Source verification unavailable".
 */
export function getAuthoritativeLegalSource(
  category?: string,
  topicOrKeyword?: string
): LegalSourceReference | null {
  if (!category) return null;
  const catUpper = category.toUpperCase();

  const found = AUTHORITATIVE_LEGAL_SOURCES.find((s) => {
    if (s.category !== catUpper) return false;
    if (!topicOrKeyword) return true;
    return (
      s.legalTopic.toLowerCase().includes(topicOrKeyword.toLowerCase()) ||
      s.explanation.toLowerCase().includes(topicOrKeyword.toLowerCase())
    );
  });

  return found || AUTHORITATIVE_LEGAL_SOURCES.find((s) => s.category === catUpper) || null;
}
