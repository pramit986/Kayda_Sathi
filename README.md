# Kayda Sathi

**"From Story → Evidence → Action"**

A mobile-first legal technology application that helps ordinary Indian citizens understand what to do when they face a legal problem.

## What It Does

1. **Describe your problem** — in simple language or voice
2. **AI classifies & extracts facts** — identifies the type of issue and key facts
3. **Evidence Vault** — upload and organize proof (screenshots, documents, photos)
4. **Evidence Intelligence** — automatically extract facts from evidence, map evidence to claims, detect contradictions and gaps
5. **Legal GPS** — understand available paths, what each path means, and what you need
6. **Action Plan** — clear next steps with requirements
7. **Document Generation** — refund requests, complaints, lawyer briefs

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌────────────┐
│  Mobile App │ ──→ │  Backend API │ ──→ │ Gemini API │
│  (Expo/RN)  │     │  (Express)   │     │            │
└─────────────┘     └──────────────┘     └────────────┘
                           │
                    ┌──────┴──────┐
                    │  Firebase   │
                    │  Firestore  │
                    │  Storage    │
                    │  Auth       │
                    └─────────────┘
```

**Security:** The Gemini API key exists only on the backend. Never in the mobile app.

## Project Structure

```
kayda/
├── mobile/          # Expo + React Native + TypeScript
│   ├── app/         # Expo Router screens
│   │   ├── (tabs)/  # Bottom navigation tabs
│   │   │   ├── index.tsx      # Home
│   │   │   ├── cases.tsx      # Cases
│   │   │   ├── evidence.tsx   # Evidence Vault
│   │   │   ├── resources.tsx  # Resources
│   │   │   └── profile.tsx    # Profile
│   │   ├── case/[id].tsx      # Case detail
│   │   └── new-case.tsx       # New case intake
│   ├── components/
│   │   ├── ui/      # Reusable design system components
│   │   ├── cases/   # Case-specific components
│   │   └── home/    # Home screen components
│   ├── constants/   # Theme, categories, design tokens
│   ├── services/    # API, Firebase
│   └── store/       # Demo data, state
├── server/          # Node.js + Express + TypeScript
│   └── src/
│       └── index.ts # API entry point
└── shared/          # Shared TypeScript types
    └── types/
        ├── case.ts
        ├── evidence.ts
        ├── legal.ts
        ├── user.ts
        └── api.ts
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | Expo, React Native, TypeScript, Expo Router |
| Backend | Node.js, Express, TypeScript |
| Database | Firebase Firestore |
| Auth | Firebase Authentication |
| Storage | Firebase Storage |
| AI | Gemini API (server-side only) |

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Expo CLI (`npm install -g expo-cli`)
- Android Studio / Emulator (for Android builds)

### Mobile App

```bash
cd mobile
npm install
npx expo start
```

Press `a` to open on Android emulator/device.

### Backend

```bash
cd server
cp .env.example .env   # Fill in your credentials
npm install
npm run dev
```

### Environment Variables

Create `.env` files from the provided `.env.example` templates:

- `mobile/.env.example` → Firebase config for the mobile app
- `server/.env.example` → Firebase Admin + Gemini API key (NEVER expose in mobile)

## Supported Categories

1. Rental / Landlord-Tenant
2. Consumer Complaints
3. Banking / Unauthorized Transactions
4. Cybercrime / Online Fraud
5. Workplace / Salary
6. Traffic / Vehicle
7. Government Service Grievances
8. Property / Document Disputes
9. Women / Child Protection
10. Legal Notices

## Development Phases

- [x] **Phase 1** — Project setup, navigation, theme, core screens
- [ ] **Phase 2** — Case creation and management
- [ ] **Phase 3** — Evidence vault
- [ ] **Phase 4** — Gemini backend integration
- [ ] **Phase 5** — Evidence intelligence
- [ ] **Phase 6** — Legal knowledge engine
- [ ] **Phase 7** — Action engine
- [ ] **Phase 8** — Document generation
- [ ] **Phase 9** — Demo mode
- [ ] **Phase 10** — Testing & polish

## Demo Data

The app ships with a seeded demo case:

**Rahul Sharma vs. Amit Patil** — Security deposit refund dispute (₹30,000)

Includes 5 evidence items, timeline, contradictions, evidence gaps, and action items.

## Legal Disclaimer

Kayda Sathi provides legal information and action guidance. It is **not** a lawyer and does **not** provide legal advice. Always consult a qualified legal professional for specific legal matters.

## License

Private — Hackathon project
