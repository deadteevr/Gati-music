
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
      "Distribution on 150+ Streaming Platforms",
      "Spotify/Apple Music/YouTube Music/JioSaavn/Wynk & More",
      "80% Royalties to Artist",
      "YouTube Content ID Included",
      "Fast 2–3 Day Delivery",
      "Lyrics Distribution Support",
      "Instagram/Facebook Audio Library Support",
      "Explicit Content Tag Support",
      "WAV & MP3 Upload Support",
      "Cover Art & Metadata Check",
      "Release Scheduling",
      "Royalty Dashboard Access",
      "WhatsApp Chat + Call Support"
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
      "Everything in Basic Plan",
      "Unlimited Songs & Albums",
      "Spotify Verified Profile Help",
      "YouTube Official Artist Channel Help",
      "Instagram/Facebook Lyrics Support",
      "Reels & Shorts Audio Availability",
      "Multi-Artist Collaboration Support",
      "Release Tracking Dashboard",
      "Playlist Submission Eligibility",
      "WhatsApp Chat + Call Support"
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
      "Effective ₹83/Month Billing",
      "Promo Opportunity Access",
      "Artist Branding Guidance",
      "Release Strategy Guidance",
      "Catalog Management Support",
      "Early Access to New Features",
      "WhatsApp Chat + Call Support"
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
      "Smart Link Generation",
      "Release Scheduling",
      "Label Analytics Overview",
      "Revenue/Earnings Overview",
      "Verification Badge Eligibility",
      "WhatsApp Chat + Call Support"
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
      "Global PR Opportunities",
      "Metadata Optimization",
      "WhatsApp Chat + Call Support"
    ]
  }
];

export const formatPrice = (plan: Plan, currency: 'INR' | 'USD' | 'BOTH' = 'BOTH') => {
  if (currency === 'INR') return `₹${plan.priceINR}`;
  if (currency === 'USD') return `$${plan.priceUSD}`;
  return `₹${plan.priceINR} / $${plan.priceUSD}`;
};
