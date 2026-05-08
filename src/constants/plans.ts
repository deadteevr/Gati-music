
export interface Plan {
  id: string;
  name: string;
  priceINR: number;
  priceUSD: number;
  period: string;
  desc: string;
  popular?: boolean;
  type: 'artist' | 'label';
  features: string[];
}

export const PLANS: Plan[] = [
  {
    id: 'basic',
    name: "Basic Plan",
    priceINR: 75,
    priceUSD: 3,
    period: "per song",
    desc: "Perfect for single releases",
    type: 'artist',
    features: [
      "150+ Streaming Platforms",
      "80% Royalties to Artist",
      "YouTube Content ID Included",
      "Fast 2-3 Day Delivery",
      "Direct WhatsApp Support",
      "Metadata Error Check"
    ]
  },
  {
    id: 'monthly',
    name: "Monthly Plan",
    priceINR: 199,
    priceUSD: 5,
    period: "per month",
    desc: "Unlimited uploads for active artists",
    popular: true,
    type: 'artist',
    features: [
      "Unlimited Songs & Albums",
      "80% Royalties to Artist",
      "YouTube Official Artist Channel",
      "Spotify Verified Profile Help",
      "Priority Support (2hr Reply)",
      "Instagram & Facebook Lyrics"
    ]
  },
  {
    id: 'yearly',
    name: "Yearly Plan",
    priceINR: 999,
    priceUSD: 29,
    period: "per year",
    desc: "Best value for professional artists",
    type: 'artist',
    features: [
      "Everything in Monthly Plan",
      "Effective ₹83/month Billing",
      "Custom Release Strategies",
      "Promo Opportunity Access",
      "Early Beta Feature Access",
      "Priority Metadata Approval"
    ]
  },
  {
    id: 'label_monthly',
    name: "Label Monthly",
    priceINR: 599,
    priceUSD: 15,
    period: "per month",
    desc: "Scale your label or artist team",
    type: 'label',
    features: [
      "Manage Multiple Artists",
      "Unlimited Label Releases",
      "Centralized Team Dashboard",
      "Bulk Upload System",
      "Draft Saving Mode",
      "Fastest Approval Priority",
      "Smart Link Generation",
      "Release Scheduling",
      "Label Analytics Overview",
      "Revenue/Earnings Overview",
      "Verification Badge Eligibility",
      "Dedicated Account Manager"
    ]
  },
  {
    id: 'label_yearly',
    name: "Label Yearly",
    priceINR: 4999,
    priceUSD: 129,
    period: "per year",
    desc: "Professional solution for serious labels",
    popular: true,
    type: 'label',
    features: [
      "Everything in Label Monthly",
      "Unlimited Artist Management",
      "Premium Label Branding",
      "Artist Invitation System",
      "Activity Logging System",
      "Featured Label Eligibility",
      "Bulk Distribution Tools",
      "Priority 24/7 Support",
      "Global PR Opportunities",
      "Metadata Optimization"
    ]
  }
];

export const formatPrice = (plan: Plan, currency: 'INR' | 'USD' | 'BOTH' = 'BOTH') => {
  if (currency === 'INR') return `₹${plan.priceINR}`;
  if (currency === 'USD') return `$${plan.priceUSD}`;
  return `₹${plan.priceINR} / $${plan.priceUSD}`;
};
