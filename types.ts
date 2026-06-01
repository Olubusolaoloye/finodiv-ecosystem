
export enum UserRole {
  GUEST = 'GUEST',
  LEARNER = 'LEARNER',
  EMPLOYER = 'EMPLOYER',
  ADMIN = 'ADMIN',
  MOD = 'MOD'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar: string;
  authProvider: 'google' | 'wallet';
  createdAt: string;
  status: 'active' | 'banned' | 'suspended';
  badge?: string;
}

export interface WalletBinding {
  userId: string;
  address: string;
  chainId: number;
  boundAt: string;
  isPrimary: boolean;
}

export type PaymentMethod = 'crypto_usdt' | 'fiat_paystack';
export type PaymentStatus = 'pending' | 'confirmed' | 'failed';

export interface PaymentRecord {
  id: string;
  userId: string;
  courseId: string;
  method: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  txHash?: string;
  reference?: string;
  createdAt: string;
}

export interface CertificateNFT {
  id: string;
  userId: string;
  walletAddress: string;
  courseId: string;
  tokenId?: string;
  txHash?: string;
  status: 'unclaimed' | 'minting' | 'minted';
  issuedAt?: string;
}

export interface SystemSettings {
  maintenanceMode: boolean;
  allowSignups: boolean;
  allowLogins: boolean;
  siteName: string;
  supportEmail: string;
  announcement?: string;
}

export interface CareerPath {
  id: string;
  title: string;
  description: string;
  traits: string[];
  skills: string[];
  duration: string;
  demand: 'High' | 'Very High' | 'Growing';
  overlap: number;
  freelanceRate?: string;
  platforms?: string[];
}

export interface AssessmentQuestion {
  id: number;
  question: string;
  options: {
    label: string;
    impact: Record<string, number>;
  }[];
}

export interface CommunityMessage {
  id: string;
  senderName: string;
  senderRole: UserRole;
  senderAvatar: string;
  content: string;
  timestamp: string;
  attachment?: string;
  isPinned?: boolean;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  price: number;
  category: string;
  level: string;
  duration: string;
  image: string;
  rating?: number;
  niche?: string;
}

export interface Talent {
  id: string;
  name: string;
  title: string;
  bio: string;
  skills: string[];
  avatar: string;
  verified: boolean;
  badge?: string;
  rating: number;
  feedback: Feedback[];
  portfolio: Project[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
}

export interface Feedback {
  id: string;
  author: string;
  role: string;
  avatar: string;
  comment: string;
  rating: number;
}

export interface Achievement {
  id: string;
  title: string;
  issuedAt: string;
  image: string;
  chain: string;
}
