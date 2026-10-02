// ============================================================
// Kayda Sathi — Legal Intelligence Prompts (Gemini API)
// ============================================================

export const SYSTEM_LEGAL_EXPERT = `
You are the AI Legal Intelligence Engine for "Kayda Sathi" (कायदा साथी), a mobile-first legal technology application for Indian citizens.
Your tagline is: "From Story → Evidence → Action".

CORE PRINCIPLES:
1. NEVER offer legal advice. Offer actionable legal information, structured facts, timeline reconstruction, evidence analysis, and standard grievance navigation.
2. Ground all legal analysis strictly in current Indian Law:
   - Bharatiya Nyaya Sanhita (BNS) 2023 & Bharatiya Sakshya Adhiniyam (BSA) 2023 / Section 65B for electronic records
   - Consumer Protection Act (CPA) 2019 & E-Daakhil / National Consumer Helpline (NCH)
   - Transfer of Property Act 1882 / Model Tenancy Act / State Rent Control Acts
   - RBI Integrated Ombudsman Scheme 2021 for banking & UPI fraud
   - National Cyber Crime Reporting Portal (cybercrime.gov.in / 1930)
   - Payment of Wages Act 1936, Industrial Disputes Act 1947
3. Transform messy, emotional user statements into objective, verified or unverified facts.
4. Always produce output strictly matching the requested JSON format without markdown code fences or conversational text.
`;

export const CLASSIFY_AND_INTAKE_PROMPT = `
Analyze the citizen's problem description.

Task:
1. Identify the primary CaseCategory from:
   ['RENTAL', 'CONSUMER', 'BANKING', 'CYBERCRIME', 'WORKPLACE', 'TRAFFIC', 'GOVERNMENT', 'PROPERTY', 'WOMEN_CHILD', 'LEGAL_NOTICE']
2. Extract an objective, professional case title.
3. Identify 3 to 6 atomic, objective facts from the story. Each fact must have:
   - statement: clear, objective statement
   - status: 'USER_STATED' (if only mentioned by user) or 'VERIFIED' (if undeniable)
4. Formulate 1 to 3 primary legal claims (e.g., "Entitled to full security deposit refund within 30 days of vacation", "Unfair trade practice under Consumer Protection Act 2019").
5. Construct an initial chronological timeline of events mentioned in the story.
6. Identify 2 to 3 critical missing pieces of information that an Indian advocate or authority would require, and create 2 to 3 targeted intake questions for the citizen.
7. Generate the initial preparation score (understanding 30-70%, evidence 10-40%, actionReadiness 20-50%).
8. Generate the immediate Next 3 Actions with clear reasons, requirements, and orders.

Return ONLY a valid JSON object matching this schema:
{
  "title": string,
  "category": string,
  "subCategory": string,
  "jurisdiction": string,
  "facts": [
    { "statement": string, "status": "USER_STATED" | "VERIFIED" }
  ],
  "claims": [
    {
      "statement": string,
      "supportingFacts": string[],
      "strength": "STRONG" | "MODERATE" | "WEAK" | "UNSUPPORTED"
    }
  ],
  "timeline": [
    { "date": string, "title": string, "description": string, "sourceType": "USER_STATEMENT" }
  ],
  "intakeQuestions": [
    {
      "questionId": string,
      "question": string,
      "type": "TEXT" | "SELECT" | "DATE" | "AMOUNT",
      "options": string[],
      "required": boolean
    }
  ],
  "preparation": {
    "understanding": number,
    "evidence": number,
    "actionReadiness": number
  },
  "actionItems": [
    {
      "title": string,
      "description": string,
      "reason": string,
      "requirements": string[],
      "order": number
    }
  ]
}
`;

export const REFINE_CASE_WITH_INTAKE_PROMPT = `
The citizen has answered clarifying intake questions about their ongoing legal dispute.
Update the case analysis by incorporating these new answers.

Task:
1. Update and refine the facts list (promote statements to VERIFIED where applicable).
2. Update the claims and recalculate claim strength based on provided details.
3. Add any new timeline milestones.
4. Recalculate preparation scores (typically increasing understanding and actionReadiness).
5. Refine the Next 3 Actions to be concrete and specific to the jurisdiction and answers.

Return ONLY a valid JSON object with:
{
  "facts": [ { "statement": string, "status": string } ],
  "claims": [ { "statement": string, "supportingFacts": string[], "strength": string } ],
  "timeline": [ { "date": string, "title": string, "description": string, "sourceType": string } ],
  "preparation": { "understanding": number, "evidence": number, "actionReadiness": number },
  "actionItems": [ { "title": string, "description": string, "reason": string, "requirements": string[], "order": number } ]
}
`;

export const ANALYZE_EVIDENCE_PROMPT = `
Analyze newly uploaded evidence for a citizen's legal case.
The evidence may be an agreement, payment receipt, WhatsApp screenshot, legal notice, photo, or email.

Task:
1. Extract 2 to 5 concrete facts from this evidence with confidence ratings ('HIGH' | 'MEDIUM' | 'LOW').
2. Identify which existing claims this evidence directly supports.
3. Detect any potential CONTRADICTIONS between this evidence and previously stated facts or other evidence (e.g. discrepancy in dates, amounts, agreed deductions).
4. Identify any remaining EVIDENCE GAPS required under Indian legal standards (e.g. 65B electronic certificate, original bank statement, stamped agreement).

Return ONLY a valid JSON object matching this schema:
{
  "extractedFacts": [
    { "statement": string, "confidence": "HIGH" | "MEDIUM" | "LOW" }
  ],
  "supportedClaims": string[],
  "contradictions": [
    {
      "description": string,
      "labelA": string,
      "valueA": string,
      "labelB": string,
      "valueB": string
    }
  ],
  "evidenceGaps": [
    {
      "description": string,
      "suggestedEvidence": string[],
      "importance": "HIGH" | "MEDIUM" | "LOW"
    }
  ]
}
`;

export const GENERATE_LEGAL_DOCUMENT_PROMPT = `
Draft a formal, professional Indian legal document based on the case facts, timeline, and evidence.
Document types:
- 'REFUND_REQUEST': Formal demand letter for refund/deposit return citing contractual obligations.
- 'COMPLAINT': Formal complaint addressed to relevant statutory authority (e.g., Consumer Commission, Cyber Cell, RERA, Labour Commissioner).
- 'GRIEVANCE': Written grievance for company / corporate grievance redressal officer.
- 'LAWYER_BRIEF': An objective, chronological fact-sheet and evidence bundle summary for an Indian advocate.

Ensure standard Indian legal drafting conventions:
- Proper Subject line
- Chronological recital of facts
- Relevant statutory references (Consumer Protection Act 2019, Section 65B BSA 2023, Model Tenancy Act, etc.)
- Clear demand with specified cure period (e.g., 7 or 15 days)
- Reservation of rights to initiate civil/criminal proceedings

Return ONLY a valid JSON object:
{
  "title": string,
  "type": string,
  "content": string
}
`;
