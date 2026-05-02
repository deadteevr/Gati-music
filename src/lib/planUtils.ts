import { Timestamp } from 'firebase/firestore';

export type PlanType = 'Free' | 'Basic' | 'Monthly' | 'Yearly';
export type PaymentStatus = 'Paid' | 'Pending' | 'Manual';
export type SubscriptionStatus = 'Active' | 'Expired' | 'Pending';

export interface Subscription {
  planType: PlanType;
  startDate: any; // Firestore Timestamp
  expiryDate: any; // Firestore Timestamp
  status: SubscriptionStatus;
  paymentStatus: PaymentStatus;
  uploadCount?: number;
}

export function isPlanActive(sub?: Subscription): boolean {
  if (!sub) return false;
  if (sub.planType === 'Free') return false; 
  if (sub.status === 'Expired') return false;
  
  // Basic plan check: 1 song limit
  if (sub.planType === 'Basic' && (sub.uploadCount || 0) >= 1) {
    return false;
  }

  const now = new Date();
  const expiry = sub.expiryDate instanceof Timestamp ? sub.expiryDate.toDate() : new Date(sub.expiryDate);
  
  if (now >= expiry) return false;

  return sub.status === 'Active';
}

export function getRemainingDays(expiryDate: any): number {
  if (!expiryDate) return 0;
  const now = new Date();
  const expiry = expiryDate instanceof Timestamp ? expiryDate.toDate() : new Date(expiryDate);
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}
