// ============================================================
// Kayda Sathi — Category Definitions
// ============================================================

import { Ionicons } from '@expo/vector-icons';
import { Colors } from './Theme';

export type CategoryId =
  | 'RENTAL'
  | 'CONSUMER'
  | 'BANKING'
  | 'CYBERCRIME'
  | 'WORKPLACE'
  | 'TRAFFIC'
  | 'GOVERNMENT'
  | 'PROPERTY'
  | 'WOMEN_CHILD'
  | 'LEGAL_NOTICE';

export interface CategoryDefinition {
  id: CategoryId;
  label: string;
  shortLabel: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
  description: string;
}

export const CATEGORIES: CategoryDefinition[] = [
  {
    id: 'RENTAL',
    label: 'Rental / Landlord-Tenant',
    shortLabel: 'Landlord Issue',
    icon: 'home-outline',
    color: Colors.primary[500],
    bgColor: Colors.primary[50],
    description: 'Security deposits, eviction, maintenance issues',
  },
  {
    id: 'CONSUMER',
    label: 'Consumer Complaints',
    shortLabel: 'Consumer Complaint',
    icon: 'bag-handle-outline',
    color: '#7C3AED',
    bgColor: '#F5F3FF',
    description: 'Defective products, services, refunds',
  },
  {
    id: 'BANKING',
    label: 'Banking / Unauthorized Transactions',
    shortLabel: 'Bank Transaction',
    icon: 'card-outline',
    color: Colors.info[600],
    bgColor: Colors.info[50],
    description: 'Unauthorized debits, fraud, bank issues',
  },
  {
    id: 'CYBERCRIME',
    label: 'Cybercrime / Online Fraud',
    shortLabel: 'Online Fraud',
    icon: 'shield-outline',
    color: Colors.error[600],
    bgColor: Colors.error[50],
    description: 'Scams, phishing, identity theft',
  },
  {
    id: 'WORKPLACE',
    label: 'Workplace / Salary',
    shortLabel: 'Salary Not Paid',
    icon: 'briefcase-outline',
    color: '#B45309',
    bgColor: '#FFFBEB',
    description: 'Unpaid salary, wrongful termination, harassment',
  },
  {
    id: 'TRAFFIC',
    label: 'Traffic / Vehicle',
    shortLabel: 'Traffic / Vehicle',
    icon: 'car-outline',
    color: '#0F766E',
    bgColor: '#F0FDFA',
    description: 'Accidents, challans, insurance claims',
  },
  {
    id: 'GOVERNMENT',
    label: 'Government Service Grievances',
    shortLabel: 'Government Service',
    icon: 'business-outline',
    color: '#4338CA',
    bgColor: '#EEF2FF',
    description: 'Ration card, passport, pension, PF issues',
  },
  {
    id: 'PROPERTY',
    label: 'Property / Document Disputes',
    shortLabel: 'Property Dispute',
    icon: 'document-text-outline',
    color: '#9D174D',
    bgColor: '#FFF1F2',
    description: 'Land, property documents, encroachment',
  },
  {
    id: 'WOMEN_CHILD',
    label: 'Women / Child Protection',
    shortLabel: 'Women & Child',
    icon: 'people-outline',
    color: '#BE185D',
    bgColor: '#FDF2F8',
    description: 'Domestic violence, harassment, child welfare',
  },
  {
    id: 'LEGAL_NOTICE',
    label: 'Legal Notices',
    shortLabel: 'Legal Notice',
    icon: 'mail-outline',
    color: Colors.neutral[700],
    bgColor: Colors.neutral[50],
    description: 'Drafting and responding to legal notices',
  },
];

export const getCategoryById = (id: CategoryId): CategoryDefinition | undefined =>
  CATEGORIES.find(c => c.id === id);

export const COMMON_PROBLEMS = CATEGORIES.slice(0, 6); // First 6 for home screen
