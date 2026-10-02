// ============================================================
// Kayda Sathi — Legal Analysis Controller
// ============================================================
// POST /api/analyze  — accepts text or audio (multipart)
// Returns structured legal analysis JSON

import { Request, Response } from 'express';
import { geminiClient } from '../ai/geminiClient';
import { LEGAL_ANALYSIS_PROMPT } from '../ai/legalAnalysisPrompt';
import fs from 'fs';

// ── Mock fallback (used when Gemini key is absent) ──────────────────────────
function buildMockAnalysis(text: string) {
  const lower = text.toLowerCase();

  let category = 'Consumer';
  if (/deposit|landlord|rent|tenant|flat|house|evict/i.test(lower)) category = 'Rental';
  else if (/salary|wage|employ|job|boss|fired|termina|posh|harass/i.test(lower)) category = 'Employment';
  else if (/upi|fraud|otp|scam|phish|hack|cyber|online debit|unauthori/i.test(lower)) category = 'Cyber Fraud';

  const categoryData: Record<string, any> = {
    Rental: {
      identified_issue: 'Landlord is allegedly withholding the security deposit without valid contractual justification.',
      legal_rights: [
        'Right to full refund of security deposit within the agreed period (Transfer of Property Act 1882 & Model Tenancy Act).',
        'Right to receive written notice of any deductions with supporting invoices.',
        'Right to file a complaint before the Rent Control Authority or Consumer Commission.',
      ],
      action_steps: [
        { step: 1, title: 'Send Legal Notice', description: 'Serve a written registered notice to the landlord demanding refund within 15 days, citing the rental agreement.', deadline: 'Within 7 days' },
        { step: 2, title: 'File Rent Authority Complaint', description: 'If ignored, file a complaint before the District Rent Control Authority with a copy of your tenancy agreement and payment receipts.', deadline: 'Within 30 days of notice' },
        { step: 3, title: 'Consumer Commission Alternate', description: 'File a complaint at the Consumer Disputes Redressal Commission (CDRC) under Consumer Protection Act 2019 for deficiency of service.', deadline: 'Within 2 years of cause of action' },
      ],
      required_documents: ['Signed rental/lease agreement', 'Security deposit payment proof (bank transfer / cheque)', 'Vacation notice given to landlord', 'Property handover receipt or photos', 'WhatsApp/email communication screenshots'],
      appropriate_authority: { name: 'District Rent Control Authority / Consumer Disputes Redressal Commission', portal: 'edaakhil.nic.in or local Rent Authority office', jurisdiction: 'District where property is located' },
      complaint_draft: `To,
The Hon'ble Rent Control Authority / CDRC,
[District Name]

Subject: Complaint for Wrongful Withholding of Security Deposit by Landlord

Respected Sir/Madam,

I, CITIZEN_NAME, am a former tenant at the premises of RESPONDENT_NAME, located at [Property Address].

1. I had paid a security deposit of ₹[Amount] on DATE_OF_INCIDENT as per the rental agreement dated [Agreement Date].
2. I vacated the premises on [Vacation Date] after serving due notice and returning the property in good condition.
3. Despite repeated requests, RESPONDENT_NAME has refused to return the security deposit and is making unsubstantiated deduction claims.

This constitutes a clear breach of the rental agreement and amounts to deficiency in service under the Consumer Protection Act, 2019.

I pray that this Hon'ble Authority may:
a) Direct RESPONDENT_NAME to refund ₹[Amount] with interest.
b) Award compensation for harassment and mental agony.
c) Award cost of this complaint.

Respectfully submitted,
CITIZEN_NAME
[Date]`,
    },
    Employment: {
      identified_issue: 'Employee facing alleged workplace rights violation including unpaid dues or unfair termination.',
      legal_rights: [
        'Right to timely payment of wages (Payment of Wages Act 1936).',
        'Right to statutory notice period or pay in lieu thereof (Industrial Disputes Act 1947).',
        'Right to full and final settlement within 2 days of separation.',
        'Right to file complaint with Labour Commissioner.',
      ],
      action_steps: [
        { step: 1, title: 'Send Written Demand', description: 'Write a formal email/letter to HR department demanding full and final settlement within 7 days.', deadline: 'Within 3 days' },
        { step: 2, title: 'File Labour Commissioner Complaint', description: 'If company does not respond, file a written complaint at the office of the District/State Labour Commissioner.', deadline: 'Within 14 days' },
        { step: 3, title: 'File at Labour Court', description: 'For disputes above ₹1 lakh or wrongful termination, approach the Labour Court / Industrial Tribunal.', deadline: 'Within 3 years' },
      ],
      required_documents: ['Employment contract/offer letter', 'Salary slips for last 6 months', 'Bank statements showing salary credits', 'Termination/resignation letter', 'Email communication with HR'],
      appropriate_authority: { name: 'District Labour Commissioner / Labour Court', portal: 'shramsuvidha.gov.in or State Labour Department portal', jurisdiction: 'District where employment was based' },
      complaint_draft: `To,
The District Labour Commissioner,
[District Name]

Subject: Complaint Against RESPONDENT_NAME for Non-payment of Dues / Wrongful Termination

Respected Sir/Madam,

I, CITIZEN_NAME, was employed as [Designation] with RESPONDENT_NAME from [Start Date] to DATE_OF_INCIDENT.

1. RESPONDENT_NAME has failed to pay [pending salary/dues/notice pay] amounting to ₹[Amount].
2. I was terminated without due notice/legitimate cause on DATE_OF_INCIDENT, in violation of the terms of my employment contract.

This is a clear violation of the Payment of Wages Act, 1936 and the Industrial Disputes Act, 1947.

I request this office to:
a) Investigate the matter and direct RESPONDENT_NAME to clear all outstanding dues immediately.
b) Take appropriate action under applicable labour laws.

Respectfully,
CITIZEN_NAME
[Date]`,
    },
    Consumer: {
      identified_issue: 'Consumer alleges deficiency in goods/services or unfair trade practice by seller/service provider.',
      legal_rights: [
        'Right to receive goods/services as described (Consumer Protection Act 2019, Section 2(11)).',
        'Right to claim refund or replacement for defective goods (Section 82-87).',
        'Right to compensation for mental agony and harassment.',
        'Right to file complaint with CDRC within 2 years of cause of action.',
      ],
      action_steps: [
        { step: 1, title: 'Formal Complaint to Seller', description: 'Email/write a formal complaint to the company\'s customer care and grievance officer demanding resolution within 15 days.', deadline: 'Within 7 days' },
        { step: 2, title: 'National Consumer Helpline', description: 'Call NCH at 1800-11-4000 or log complaint at consumerhelpline.gov.in for mediation.', deadline: 'Within 15 days of step 1' },
        { step: 3, title: 'E-Daakhil Filing', description: 'File a formal consumer complaint online at edaakhil.nic.in before the appropriate Consumer Disputes Redressal Commission.', deadline: 'Within 2 years' },
      ],
      required_documents: ['Purchase invoice / order confirmation', 'Product photos showing defect', 'Return/refund request emails', 'Courier/delivery proof', 'Bank transaction statement'],
      appropriate_authority: { name: 'Consumer Disputes Redressal Commission (CDRC)', portal: 'edaakhil.nic.in | NCH: 1800-11-4000', jurisdiction: 'District where consumer resides or transaction occurred' },
      complaint_draft: `To,
The President,
District Consumer Disputes Redressal Commission,
[District Name]

Subject: Consumer Complaint Against RESPONDENT_NAME for Defective Product / Deficiency in Service

Respected Sir/Madam,

I, CITIZEN_NAME, am a consumer who purchased [product/service] from RESPONDENT_NAME on DATE_OF_INCIDENT for a consideration of ₹[Amount].

1. The [product/service] delivered was [defective/non-functional/different from description].
2. Despite multiple complaints and [X days], RESPONDENT_NAME has failed to provide refund or replacement.
3. This constitutes deficiency in service and unfair trade practice under the Consumer Protection Act, 2019.

I humbly pray that this Commission may:
a) Direct RESPONDENT_NAME to refund ₹[Amount] with interest at 12% p.a.
b) Award compensation of ₹[Amount] for harassment and mental agony.
c) Award cost of proceedings.

Respectfully,
CITIZEN_NAME
[Date]`,
    },
    'Cyber Fraud': {
      identified_issue: 'Victim of alleged online financial fraud / unauthorized digital transaction.',
      legal_rights: [
        'Right to report and seek reversal of unauthorized transactions (RBI Circular on Customer Liability).',
        'Right to zero liability if fraud reported within 3 working days (RBI Master Direction 2017).',
        'Right to file cyber crime complaint (BNS 2023 Sections 318, 319 — Cheating by personation).',
        'Right to approach Banking Ombudsman if bank fails to resolve within 30 days.',
      ],
      action_steps: [
        { step: 1, title: 'Report to Cyber Crime Portal Immediately', description: 'File complaint at cybercrime.gov.in or call 1930 (Cyber Crime Helpline) with all transaction details. Critical to do within 24 hours.', deadline: 'Within 24 hours' },
        { step: 2, title: 'Notify Your Bank', description: 'Immediately call your bank helpline and email a formal complaint to the nodal officer requesting transaction freeze/reversal.', deadline: 'Within 24 hours' },
        { step: 3, title: 'RBI Ombudsman Complaint', description: 'If bank does not resolve within 30 days, file complaint on RBI Integrated Ombudsman portal: cms.rbi.org.in', deadline: 'Within 1 year of bank\'s final reply' },
        { step: 4, title: 'Local Police FIR', description: 'File a First Information Report (FIR) at the nearest police station or Cyber Cell under BNS Section 318 (Cheating).', deadline: 'As soon as possible' },
      ],
      required_documents: ['Bank statement showing fraudulent transaction', 'Screenshot of fraud SMS/call/email', 'UPI transaction ID or reference number', 'Complaint acknowledgement from cybercrime.gov.in', 'Bank communication / grievance ticket number'],
      appropriate_authority: { name: 'National Cyber Crime Reporting Portal / RBI Integrated Ombudsman', portal: 'cybercrime.gov.in | Helpline: 1930 | RBI Ombudsman: cms.rbi.org.in', jurisdiction: 'Nationwide for cyber crime; banking jurisdiction as per your bank\'s registered state' },
      complaint_draft: `To,
The Station House Officer,
[Cyber Crime Cell / Police Station],
[District Name]

Subject: First Information Report — Online Financial Fraud / Cybercrime

Respected Sir/Madam,

I, CITIZEN_NAME, am filing this complaint regarding an unauthorized financial fraud perpetrated against me.

1. On DATE_OF_INCIDENT, a fraudulent transaction of ₹[Amount] was debited from my account [Account/UPI ID] without my knowledge or OTP authorization.
2. I received a [call/SMS/link] from [Number/Website] which I believe was a phishing/social engineering attempt by RESPONDENT_NAME.
3. I have already reported this at cybercrime.gov.in (Acknowledgement No: [XXXX]) and notified my bank.

This constitutes an offence under Section 318 of the Bharatiya Nyaya Sanhita (BNS) 2023 (Cheating) and Section 66C of the IT Act (Identity Theft).

I request:
a) Registration of FIR and immediate investigation.
b) Tracing and freezing of fraudster's accounts.
c) Recovery and return of defrauded amount.

Respectfully,
CITIZEN_NAME
[Date]
Contact: [Phone Number]`,
    },
  };

  return {
    category,
    ...categoryData[category],
  };
}

// ── Transcribe audio using Gemini (Speech-to-text via multimodal) ───────────
async function transcribeAudio(filePath: string, mimeType: string): Promise<string> {
  if (!geminiClient.isAvailable()) {
    return '[Voice transcription requires Gemini API key — please type your problem instead.]';
  }

  const fileBuffer = fs.readFileSync(filePath);
  const base64Data = fileBuffer.toString('base64');

  const result = await geminiClient.analyzeEvidenceFile<{ transcript: string }>(
    base64Data,
    mimeType,
    'Transcribe this audio recording accurately into English text. The speaker is describing a legal problem. Return ONLY valid JSON: {"transcript": "the transcribed text"}'
  );

  return result?.transcript || '';
}

// ── Main handler ────────────────────────────────────────────────────────────
export const analyzeQuery = async (req: Request, res: Response) => {
  try {
    let userText = '';
    let fromVoice = false;

    // Handle multipart (voice upload), base64 JSON, or text body
    if (req.file) {
      fromVoice = true;
      const filePath = req.file.path;
      const mimeType = req.file.mimetype || 'audio/m4a';

      try {
        userText = await transcribeAudio(filePath, mimeType);
      } catch (transcribeErr) {
        console.warn('Transcription failed:', transcribeErr);
        userText = req.body?.fallback_text || '';
      } finally {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
    } else if (req.body?.audio_base64) {
      fromVoice = true;
      const mimeType = req.body.mime_type || 'audio/m4a';
      try {
        if (geminiClient.isAvailable()) {
          const result = await geminiClient.analyzeEvidenceFile<{ transcript: string }>(
            req.body.audio_base64,
            mimeType,
            'Transcribe this audio recording accurately into English text. The speaker is describing a legal problem. Return ONLY valid JSON: {"transcript": "the transcribed text"}'
          );
          userText = result?.transcript || req.body?.fallback_text || '';
        } else {
          userText = req.body?.fallback_text || 'Landlord withholding security deposit without valid justification.';
        }
      } catch (transcribeErr) {
        console.warn('Transcription from base64 failed:', transcribeErr);
        userText = req.body?.fallback_text || '';
      }
    } else {
      userText = (req.body?.text || req.body?.description || '').trim();
    }

    if (!userText || userText.length < 5) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a problem description (at least 5 characters) as text or voice recording.',
      });
    }

    // Run Gemini legal analysis
    let analysisResult: any;

    if (geminiClient.isAvailable()) {
      try {
        const prompt = `${LEGAL_ANALYSIS_PROMPT}\n\nCITIZEN PROBLEM DESCRIPTION:\n"""\n${userText}\n"""`;
        analysisResult = await geminiClient.generateJson(prompt);
      } catch (geminiErr) {
        console.warn('Gemini analysis failed, using mock:', geminiErr);
        analysisResult = buildMockAnalysis(userText);
      }
    } else {
      analysisResult = buildMockAnalysis(userText);
    }

    // Attach the transcribed text if came from voice
    if (fromVoice && userText) {
      analysisResult.transcribed_text = userText;
    }

    return res.json({
      success: true,
      data: analysisResult,
    });
  } catch (err: any) {
    console.error('Error in analyzeQuery:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Internal server error during legal analysis',
    });
  }
};
