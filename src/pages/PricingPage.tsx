import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle2, 
  IndianRupee, 
  Zap, 
  ShieldCheck, 
  Globe2,
  MessageCircle
} from 'lucide-react';
import { useEffect } from 'react';

const WHATSAPP_NUMBER = "917626841258";

export default function PricingPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Pricing Plans | Gati Music Distribution";
  }, []);

  const plans = [
    {
      name: "Basic",
      price: "75",
      period: "per song",
      desc: "Perfect for single releases",
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
      name: "Monthly",
      price: "199",
      period: "per month",
      desc: "Unlimited uploads for active artists",
      popular: true,
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
      name: "Yearly",
      price: "999",
      period: "per year",
      desc: "Best value for professional artists",
      features: [
        "Everything in Monthly Plan",
        "Effective ₹83/month Billing",
        "Custom Release Strategies",
        "Promo Opportunity Access",
        "Early Beta Feature Access",
        "Priority Metadata Approval"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#f5f5f5] font-sans selection:bg-[#B6FF00] selection:text-black overflow-x-hidden">
      {/* Canonical URL for SEO */}
      <link rel="canonical" href="https://www.gatimusic.in/pricing" />
      
      {/* Header */}
      <header className="fixed top-0 w-full px-4 md:px-6 py-4 flex justify-between items-center z-50 bg-[#0A0A0A]/80 md:backdrop-blur-xl border-b border-[#1a1a1a]">
        <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-[#B6FF00] transition-colors group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-display uppercase tracking-widest text-[10px] md:text-xs font-bold">Back</span>
        </Link>
        <div className="font-display font-black tracking-tighter flex items-center gap-1">
          <span className="text-[#B6FF00] text-2xl">gati</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] mt-2"></span>
        </div>
      </header>

      <section className="pt-40 pb-20 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-7xl font-display uppercase tracking-tighter mb-6">
            Affordable <span className="text-[#B6FF00]">Pricing</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
            Transparent plans designed for independent artists in India. Release your music on Spotify and Apple Music without breaking the bank.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`p-8 rounded-3xl border ${plan.popular ? 'border-[#B6FF00] bg-[#B6FF00]/5' : 'border-[#222] bg-[#111]/30'} flex flex-col`}
            >
              <div className="mb-8">
                <h2 className="text-2xl font-display uppercase tracking-widest mb-2 font-black">{plan.name}</h2>
                <p className="text-gray-500 text-sm font-sans mb-6">{plan.desc}</p>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-display font-black">₹{plan.price}</span>
                  <span className="text-gray-500 text-xs uppercase tracking-widest pb-1">{plan.period}</span>
                </div>
              </div>

              <div className="space-y-4 mb-8 flex-grow">
                {plan.features.map((feature, j) => (
                  <div key={j} className="flex gap-3 text-sm text-gray-400">
                    <CheckCircle2 size={16} className="text-[#B6FF00] flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mb-6">
                <a 
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi, I want to purchase the Gati Music ${plan.name} plan.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block w-full py-4 rounded-xl text-center font-display font-black uppercase tracking-widest transition-all ${plan.popular ? 'bg-[#B6FF00] text-black hover:bg-white' : 'bg-white text-black hover:bg-[#B6FF00]'}`}
                >
                  Choose {plan.name}
                </a>
              </div>
              
              <div className="text-center">
                <Link to="/contact" className="text-[10px] uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Questions? Contact Support</Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-20 px-6 max-w-4xl mx-auto text-center border-t border-[#1a1a1a]">
        <h2 className="text-3xl font-display uppercase tracking-tighter mb-4">Compare Gati Music Distribution India</h2>
        <p className="text-gray-500 text-sm mb-12">Looking for more details? Visit our <Link to="/faq" className="text-[#B6FF00] hover:underline">FAQ</Link> or read about <Link to="/blog/gati-vs-others" className="text-[#B6FF00] hover:underline">Gati vs other distributors</Link>.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-[#111]/50 rounded-2xl">
            <Zap className="mx-auto mb-4 text-[#B6FF00]" />
            <h3 className="font-bold mb-2">Fastest Approval</h3>
            <p className="text-xs text-gray-500">7-8 hours manual review to ensure your release is error-free.</p>
          </div>
          <div className="p-6 bg-[#111]/50 rounded-2xl">
            <Globe2 className="mx-auto mb-4 text-[#8B5CF6]" />
            <h3 className="font-bold mb-2">Global Reach</h3>
            <p className="text-xs text-gray-500">250+ platforms including Instagram, TikTok, and JioSaavn.</p>
          </div>
          <div className="p-6 bg-[#111]/50 rounded-2xl">
            <ShieldCheck className="mx-auto mb-4 text-[#3B82F6]" />
            <h3 className="font-bold mb-2">Secure Payouts</h3>
            <p className="text-xs text-gray-500">Direct bank withdrawals with transparent royalty reporting.</p>
          </div>
        </div>
      </section>

      <footer className="py-12 px-6 text-center border-t border-[#1a1a1a] bg-[#050505]">
        <p className="text-gray-500 text-xs font-sans">
          © 2026 Gati Music Distribution. All rights reserved. <br/>
          <span className="text-[#B6FF00] font-bold">Search Gati Music Distribution on Google</span> to find us again!
        </p>
      </footer>
    </div>
  );
}
