import { Timestamp } from 'firebase/firestore';

export type PlanType = 'Basic' | 'Monthly' | 'Yearly' | 'Free';
export type PaymentStatus = 'Paid' | 'Pending' | 'Manual';
export type SubscriptionStatus = 'Active' | 'Expired';

export interface Subscription {
  planType: PlanType;
  startDate: any; // Firestore Timestamp or ISO string
  expiryDate: any; // Firestore Timestamp or ISO string
  status: SubscriptionStatus;
  paymentStatus: PaymentStatus;
  uploadCount: number;
}

const getAsDate = (val: any) => {
  if (!val) return new Date(0);
  if (val instanceof Timestamp) return val.toDate();
  if (typeof val === 'string' || typeof val === 'number') return new Date(val);
  if (val?.seconds !== undefined) return new Date(val.seconds * 1000); // Plain object from Firestore
  return new Date(val);
};

export function isPlanActive(sub?: Subscription): boolean {
  if (!sub) return false;
  if (sub.status === 'Expired') return false;
  
  // Basic plan check: 1 song limit
  if (sub.planType === 'Basic' && (sub.uploadCount || 0) >= 1) {
    return false;
  }

  const now = new Date();
  const expiry = getAsDate(sub.expiryDate);
  
  if (now >= expiry) return false;

  return sub.status === 'Active';
}

export function getRemainingDays(expiryDate: any): number {
  if (!expiryDate) return 0;
  const now = new Date();
  const expiry = getAsDate(expiryDate);
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

export function formatExpiryDate(expiryDate: any): string {
  if (!expiryDate) return 'N/A';
  const date = getAsDate(expiryDate);
  if (date.getTime() === 0) return 'N/A';
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}
