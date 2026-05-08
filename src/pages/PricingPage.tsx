import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  Globe2,
  Users,
  Building2,
  ChevronRight,
  Plus,
  ArrowRight,
  TrendingUp,
  Music,
  Award,
  Headphones,
  MessageSquare,
  Monitor,
  Layout,
  Globe
} from 'lucide-react';
import { PLANS, formatPrice, Plan } from '../constants/plans';

const WHATSAPP_NUMBER = "917626841258";

function PlanIcon({ planId, isPopular }: { planId: string, isPopular?: boolean }) {
  const iconProps = { size: 24, className: isPopular ? 'text-[#B6FF00]' : planId === 'yearly' ? 'text-[#8B5CF6]' : 'text-white' };
  
  if (planId === 'basic') return <Music {...iconProps} />;
  if (planId === 'monthly') return <Zap {...iconProps} />;
  if (planId === 'yearly') return <TrendingUp {...iconProps} />;
  return <Award {...iconProps} />;
}

export default function PricingPage() {
  const [currency, setCurrency] = useState<'INR' | 'USD' | 'BOTH'>('BOTH');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Pricing Plans | Gati Music Distribution";
    
    // Simple currency detection based on locale (optional, can be expanded)
    const locale = navigator.language;
    if (locale.includes('en-IN') || locale.includes('hi')) {
      setCurrency('BOTH');
    } else {
      setCurrency('BOTH'); // Defaulting to both as requested
    }
  }, []);

  const [reelsBudget, setReelsBudget] = useState(799);
  const [ytBudget, setYtBudget] = useState(499);
  const [spotifyBudget, setSpotifyBudget] = useState(2199);
  const [reelsTarget, setReelsTarget] = useState('');
  const [reelsEstimate, setReelsEstimate] = useState<number | null>(null);
  const [ytTarget, setYtTarget] = useState('');
  const [ytEstimate, setYtEstimate] = useState<number | null>(null);

  const calculateReelsCost = (val: string) => {
    setReelsTarget(val);
    const num = parseInt(val.replace(/[^0-9]/g, ''));
    if (!isNaN(num)) {
      setReelsEstimate(num * 0.12);
    } else {
      setReelsEstimate(null);
    }
  };

  const calculateYTCost = (val: string) => {
    setYtTarget(val);
    const num = parseInt(val.replace(/[^0-9]/g, ''));
    if (!isNaN(num)) {
      setYtEstimate(num * 0.19);
    } else {
      setYtEstimate(null);
    }
  };

  const getReelsViewsFromBudget = (budget: number) => {
    const views = Math.round(budget / 0.12);
    const rangeMin = Math.round(views * 0.8);
    const rangeMax = Math.round(views * 1.2);
    return `${(rangeMin/1000).toFixed(1)}k - ${(rangeMax/1000).toFixed(1)}k`;
  };

  const getYtViewsFromBudget = (budget: number) => {
    let rate = 0.199;
    if (budget >= 499) rate = 0.166;
    if (budget >= 1499) rate = 0.149;
    const views = Math.round(budget / rate);
    return `${(views/1000).toFixed(1)}k`;
  };

  const getSpotifyStreamsFromBudget = (budget: number) => {
    const streams = Math.round(budget / 0.5);
    return `${(streams/1000).toFixed(1)}k`;
  };

  const artistPlans = PLANS.filter(p => p.type === 'artist');
  const labelPlans = PLANS.filter(p => p.type === 'label');

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#f5f5f5] font-sans selection:bg-[#B6FF00] selection:text-black overflow-x-hidden">
      {/* Canonical URL for SEO */}
      <link rel="canonical" href="https://www.gatimusic.in/pricing" />

      {/* Product Schema to fix GSC errors */}
      <script type="application/ld+json">
        {JSON.stringify([
          {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "Basic Distribution Plan",
            "description": "Distribute your music on 150+ platforms with 80% royalties, Content ID, and WhatsApp support for just ₹75 per song.",
            "image": "https://www.gatimusic.in/basic-plan.jpg",
            "brand": {
              "@type": "Brand",
              "name": "Gati Music Distribution"
            },
            "offers": {
              "@type": "Offer",
              "price": "75",
              "priceCurrency": "INR",
              "availability": "https://schema.org/InStock",
              "url": "https://www.gatimusic.in/pricing"
            }
          },
          {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "Monthly Distribution Plan",
            "description": "Unlimited distribution plan with Verified Profile help, Reels audio availability, and WhatsApp Chat + Call Support.",
            "image": "https://www.gatimusic.in/monthly-plan.jpg",
            "brand": {
              "@type": "Brand",
              "name": "Gati Music Distribution"
            },
            "offers": {
              "@type": "Offer",
              "price": "199",
              "priceCurrency": "INR",
              "availability": "https://schema.org/InStock",
              "url": "https://www.gatimusic.in/pricing"
            }
          },
          {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "Yearly Distribution Plan",
            "description": "Best value yearly plan with artist branding guidance, release strategy, and catalog management support.",
            "image": "https://www.gatimusic.in/yearly-plan.jpg",
            "brand": {
              "@type": "Brand",
              "name": "Gati Music Distribution"
            },
            "offers": {
              "@type": "Offer",
              "price": "999",
              "priceCurrency": "INR",
              "availability": "https://schema.org/InStock",
              "url": "https://www.gatimusic.in/pricing"
            }
          }
        ])}
      </script>
      
      {/* Header */}
      <header className="fixed top-0 w-full px-4 md:px-6 py-4 flex justify-between items-center z-50 bg-[#0A0A0A]/90 backdrop-blur-2xl border-b border-white/5">
        <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-[#B6FF00] transition-all group">
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#B6FF00] group-hover:text-black transition-all">
            <ArrowLeft size={16} />
          </div>
          <span className="font-display uppercase tracking-widest text-[10px] font-black">Home</span>
        </Link>
        <div className="font-display font-black tracking-tighter flex items-center gap-1.5 cursor-default">
          <span className="text-[#B6FF00] text-3xl">gati</span>
          <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-[#00D8F5] animate-pulse"></div>
        </div>
        <div className="hidden md:block">
          <a href={`https://wa.me/${WHATSAPP_NUMBER}`} className="text-[10px] uppercase font-black tracking-widest text-gray-500 hover:text-[#B6FF00] transition-colors">Help Center</a>
        </div>
      </header>

      <section className="pt-44 pb-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#B6FF00]/5 blur-[120px] rounded-full -z-10 pointer-events-none opacity-50"></div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#B6FF00]/10 border border-[#B6FF00]/20 rounded-full mb-6"
          >
            <Zap size={14} className="text-[#B6FF00]" />
            <span className="text-[10px] font-display font-black uppercase tracking-[0.2em] text-[#B6FF00]">Global Distribution</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-display uppercase font-black tracking-tighter mb-8 leading-[0.9]"
          >
            Choose Your <br/> <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500">Distribution Plan</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-medium leading-relaxed"
          >
            Release your music globally, reach new fans on every major platform, and keep 100% of your ownership. Simple pricing, zero hidden fees.
          </motion.p>

          <div className="flex flex-col items-center gap-8">
            {/* Billing Toggle Style UI */}
            <div className="inline-flex bg-[#111] p-1.5 rounded-2xl border border-white/5 relative shadow-inner">
               <div 
                 className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-xl transition-all duration-300 ease-out z-0 shadow-xl ${billingCycle === 'yearly' ? 'translate-x-full' : 'translate-x-0'}`}
               ></div>
               <button 
                 onClick={() => setBillingCycle('monthly')}
                 className={`relative z-10 px-8 py-3 rounded-xl text-[11px] uppercase tracking-widest font-black transition-colors duration-300 ${billingCycle === 'monthly' ? 'text-black' : 'text-gray-500 hover:text-gray-300'}`}
               >
                 Monthly Billing
               </button>
               <button 
                 onClick={() => setBillingCycle('yearly')}
                 className={`relative z-10 px-8 py-3 rounded-xl text-[11px] uppercase tracking-widest font-black transition-colors duration-300 ${billingCycle === 'yearly' ? 'text-black' : 'text-gray-500 hover:text-gray-300'}`}
               >
                 Yearly Billing <span className="ml-1 text-[9px] opacity-70">(Save 40%)</span>
               </button>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setCurrency('BOTH')}
                className={`text-[9px] uppercase tracking-widest font-black pb-1 border-b-2 transition-all ${currency === 'BOTH' ? 'border-[#B6FF00] text-white' : 'border-transparent text-gray-600 hover:text-gray-400'}`}
              >
                Dual (INR/USD)
              </button>
              <button 
                onClick={() => setCurrency('INR')}
                className={`text-[9px] uppercase tracking-widest font-black pb-1 border-b-2 transition-all ${currency === 'INR' ? 'border-[#B6FF00] text-white' : 'border-transparent text-gray-600 hover:text-gray-400'}`}
              >
                INR Only
              </button>
              <button 
                onClick={() => setCurrency('USD')}
                className={`text-[9px] uppercase tracking-widest font-black pb-1 border-b-2 transition-all ${currency === 'USD' ? 'border-[#B6FF00] text-white' : 'border-transparent text-gray-600 hover:text-gray-400'}`}
              >
                USD Only
              </button>
            </div>
          </div>
        </div>

        {/* Artist Plans */}
        <div className="mb-32">
          <div className="flex items-center gap-3 mb-12 justify-center">
             <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-[#B6FF00]/50"></div>
             <Users className="text-[#B6FF00]" size={20} />
             <h2 className="text-sm font-display uppercase tracking-[0.3em] font-black text-gray-500">Artist Tier Plans</h2>
             <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-[#B6FF00]/50"></div>
          </div>
          <div className="grid lg:grid-cols-3 gap-8 items-stretch">
            {artistPlans.map((plan, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`flex flex-col group transition-all duration-500 ${
                  plan.popular ? 'lg:scale-105 z-10' : ''
                }`}
              >
                <div className={`flex-grow p-10 rounded-[2.5rem] border relative overflow-hidden transition-all duration-500 ${
                  plan.popular 
                    ? 'bg-[#0F0F0F] border-[#B6FF00]/40 shadow-[0_20px_60px_rgba(182,255,0,0.15)] ring-1 ring-[#B6FF00]/20' 
                    : 'bg-[#111]/30 border-white/5 hover:border-white/10 hover:bg-[#111]/50'
                }`}>
                  {/* Subtle Glow Background */}
                  {plan.popular && (
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#B6FF00]/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-[#B6FF00]/20 transition-all duration-700"></div>
                  )}

                  {plan.popular && (
                    <div className="absolute top-0 right-0 left-0 flex justify-center">
                      <div className="bg-[#B6FF00] text-black text-[9px] font-display font-black uppercase tracking-[0.2em] px-6 py-2 rounded-b-2xl shadow-[0_4px_20px_rgba(182,255,0,0.4)] z-20">
                        Most Popular
                      </div>
                    </div>
                  )}

                  <div className="mb-12">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 ${
                      plan.popular ? 'bg-[#B6FF00]/10 text-[#B6FF00]' : plan.id === 'yearly' ? 'bg-[#8B5CF6]/10 text-[#8B5CF6]' : 'bg-white/5 text-white/40'
                    }`}>
                       <PlanIcon planId={plan.id} isPopular={plan.popular} />
                    </div>
                    
                    <h2 className={`text-2xl font-display font-black uppercase tracking-widest mb-3 transition-colors ${plan.popular ? 'text-[#B6FF00]' : 'text-white'}`}>{plan.name}</h2>
                    <p className="text-gray-500 text-xs font-sans font-medium uppercase tracking-widest opacity-80">{plan.desc}</p>
                    
                    <div className="mt-8 flex items-baseline gap-2">
                      <span className="text-5xl font-display font-black tracking-tighter tabular-nums leading-none">{formatPrice(plan, currency)}</span>
                      <span className="text-gray-500 text-[10px] uppercase font-black tracking-widest opacity-60">/ {plan.period}</span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-12 flex-grow">
                    {plan.features.map((feature, j) => (
                      <div key={j} className="flex gap-4 group/item">
                        <div className={`mt-1 w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                          plan.popular ? 'border-[#B6FF00]/30 group-hover/item:bg-[#B6FF00] group-hover/item:text-black' : 'border-white/10 group-hover/item:border-white'
                        }`}>
                           <CheckCircle2 size={10} className={plan.popular ? 'text-[#B6FF00] group-hover/item:text-inherit' : 'text-gray-600 group-hover/item:text-white'} />
                        </div>
                        <span className="text-[13px] text-gray-400 group-hover/item:text-white transition-colors leading-tight font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto pt-8 border-t border-white/5">
                    <a 
                      href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi, I want to purchase the Gati Music ${plan.name} plan.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`relative overflow-hidden group/btn block w-full py-5 rounded-[1.25rem] text-center font-display font-black uppercase tracking-widest text-[11px] transition-all duration-300 ${
                        plan.popular 
                          ? 'bg-[#B6FF00] text-black hover:shadow-[0_0_40px_rgba(182,255,0,0.3)] hover:scale-[1.02]' 
                          : plan.id === 'yearly'
                          ? 'bg-[#8B5CF6] text-white hover:bg-white hover:text-black shadow-lg shadow-[#8B5CF6]/10'
                          : 'bg-white text-black hover:bg-[#B6FF00] hover:shadow-[0_0_30px_rgba(182,255,0,0.2)]'
                      }`}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        Get Started <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                      </span>
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Label Plans */}
        <div className="pt-32 border-t border-white/5">
          <div className="flex flex-col items-center mb-16 text-center">
            <div className="w-16 h-16 rounded-[2rem] bg-[#8B5CF6]/10 flex items-center justify-center mb-6">
              <Building2 className="text-[#8B5CF6]" size={32} />
            </div>
            <h2 className="text-4xl md:text-5xl font-display uppercase font-black tracking-tighter mb-4 leading-none">Music <span className="text-[#8B5CF6]">Label</span> Plans</h2>
            <p className="text-gray-500 max-w-xl text-lg font-medium">Empower your entire roster with advanced management tools and dedicated support systems.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
            {labelPlans.map((plan, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`flex flex-col group h-full`}
              >
                <div className={`flex-grow p-12 rounded-[3.5rem] border relative overflow-hidden transition-all duration-500 ${
                  plan.popular 
                    ? 'bg-[#0F0F0F] border-[#8B5CF6]/40 shadow-[0_30px_60px_rgba(139,92,246,0.1)] ring-1 ring-[#8B5CF6]/20' 
                    : 'bg-[#111]/30 border-white/5 hover:border-white/10 hover:bg-[#111]/50'
                }`}>
                  {plan.popular && (
                    <div className="absolute top-0 right-0 left-0 flex justify-center">
                      <div className="bg-[#8B5CF6] text-white text-[9px] font-display font-black uppercase tracking-[0.2em] px-8 py-2.5 rounded-b-2xl shadow-[0_5px_20px_rgba(139,92,246,0.4)] z-20">
                        Professional Choice
                      </div>
                    </div>
                  )}

                  <div className="mb-12">
                    <div className="flex items-center gap-4 mb-6">
                       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${plan.popular ? 'bg-[#8B5CF6]/10 text-[#8B5CF6]' : 'bg-white/5 text-gray-500'}`}>
                         {plan.id === 'pro-label' ? <Plus size={32} /> : <Globe size={32} />}
                       </div>
                    </div>
                    <h2 className="text-3xl font-display uppercase font-black tracking-widest mb-3 text-white transition-colors">{plan.name}</h2>
                    <p className="text-gray-500 text-xs font-sans mb-8 leading-relaxed font-black uppercase tracking-widest opacity-60">{plan.desc}</p>
                    <div className="flex items-baseline gap-2">
                       <span className="text-6xl font-display font-black leading-none tracking-tighter">{formatPrice(plan, currency)}</span>
                       <span className="text-gray-500 text-[10px] uppercase font-black tracking-widest opacity-60">/ {plan.period}</span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-16 flex-grow">
                    <p className="text-[10px] uppercase font-black tracking-widest text-[#8B5CF6] mb-6 flex items-center gap-2">
                       <Layout size={12} /> Management Features
                    </p>
                    {plan.features.map((feature, j) => (
                      <div key={j} className="flex gap-4 group/item items-center">
                        <Plus size={14} className="text-[#8B5CF6] opacity-40 group-hover/item:opacity-100 transition-opacity" />
                        <span className="text-[14px] text-gray-400 font-medium group-hover/item:text-white transition-colors leading-tight">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto">
                    <a 
                      href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi, I'm interested in the Gati Music ${plan.name} for my label.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`block w-full py-6 rounded-[2rem] text-center font-display font-black uppercase tracking-widest text-[11px] transition-all duration-300 ${
                        plan.popular 
                          ? 'bg-[#8B5CF6] text-white hover:bg-white hover:text-black shadow-xl shadow-[#8B5CF6]/20' 
                          : 'bg-white text-black hover:bg-[#8B5CF6] hover:text-white'
                      }`}
                    >
                      Setup My Label
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-24 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-[#8B5CF6]/10 to-[#B6FF00]/10 blur-3xl opacity-30 group-hover:opacity-50 transition-opacity rounded-[40px]"></div>
            <div className="relative bg-[#0A0A0A] border border-white/5 p-12 md:p-16 rounded-[40px] flex flex-col md:flex-row items-center gap-12 overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                 <Building2 size={300} />
               </div>
               <div className="flex-1 relative z-10">
                 <div className="inline-flex items-center gap-2 px-4 py-1 bg-white/5 rounded-full mb-6 border border-white/10">
                    <Monitor size={14} className="text-[#8B5CF6]" />
                    <span className="text-[9px] uppercase font-black tracking-[0.2em] text-gray-400">Enterprise Solutions</span>
                 </div>
                 <h3 className="text-3xl md:text-4xl font-display font-black uppercase mb-6 tracking-tighter leading-none">Managing massive <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">rosters?</span></h3>
                 <p className="text-gray-500 text-lg font-medium leading-relaxed max-w-xl">
                   If you manage more than 20 artists or have high-volume catalogs (1000+ songs), we offer custom enterprise solutions with dedicated infrastructure and deeper royalty splits.
                 </p>
               </div>
               <Link 
                 to="/contact"
                 className="px-12 py-6 bg-[#B6FF00] text-black font-display font-black uppercase tracking-[0.15em] text-[11px] rounded-2xl hover:bg-white hover:scale-105 transition-all shadow-xl shadow-[#B6FF00]/10 shrink-0 relative z-10"
               >
                 Request Custom Quote
               </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Massive Rosters CTA */}
      <section className="py-20 px-6 max-w-6xl mx-auto border-t border-white/5">
        <div className="bg-gradient-to-br from-[#111] via-[#050505] to-[#111] border border-[#333] rounded-[3rem] p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Building2 size={240} className="text-[#8B5CF6]" />
          </div>
          
          <div className="max-w-xl relative z-10">
            <div className="inline-block px-4 py-1.5 bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 text-[#8B5CF6] text-[10px] font-display font-black uppercase tracking-widest rounded-full mb-6">
              Enterprise Solutions
            </div>
            <h2 className="text-4xl md:text-5xl font-display uppercase tracking-tighter mb-6 leading-none">
              Managing massive <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-[#EC4899]">rosters?</span>
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              We offer customized volume pricing for labels with 20+ artists or high-frequency release cycles. Get a dedicated label manager and white-glove support.
            </p>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#8B5CF6]" />
                <span className="text-xs uppercase tracking-widest font-bold text-gray-500">Custom API Access</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#8B5CF6]" />
                <span className="text-xs uppercase tracking-widest font-bold text-gray-500">Post-Payment Terms</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#8B5CF6]" />
                <span className="text-xs uppercase tracking-widest font-bold text-gray-500">Priority Delivery</span>
              </div>
            </div>
          </div>

          <div className="w-full md:w-auto relative z-10 shrink-0">
            <a 
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi, I have a music label and I want a custom quote for Gati Distribution.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 bg-white text-black px-12 py-6 rounded-2xl font-display font-black uppercase tracking-widest hover:bg-[#8B5CF6] hover:text-white transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(139,92,246,0.3)] w-full md:w-auto"
            >
              Get Custom Quote <ArrowRight />
            </a>
          </div>
        </div>
      </section>

      {/* Promotion Services Section */}
      <section className="py-20 px-6 max-w-6xl mx-auto border-t border-[#1a1a1a]">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-display uppercase tracking-tighter mb-4">Growth <span className="text-[#8B5CF6]">Promotion</span> Tools</h2>
          <p className="text-gray-500 max-w-xl mx-auto">Boost your releases with verified marketing campaigns.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Reels Promotion */}
          <div className="p-8 bg-[#111] border border-[#222] rounded-3xl relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Zap size={80} className="text-[#ccff00]" />
            </div>
            <h3 className="text-2xl font-display uppercase font-black mb-2">Reels Promotion</h3>
            <p className="text-gray-400 text-sm mb-8">Viral Reach on IG & FB.</p>
            
            <div className="space-y-6 flex-grow">
               <ul className="space-y-3 mb-8">
                <li className="flex gap-2 text-xs text-gray-500 items-center"><CheckCircle2 size={14} className="text-[#ccff00]" /> Organic viral growth</li>
                <li className="flex gap-2 text-xs text-gray-500 items-center"><CheckCircle2 size={14} className="text-[#ccff00]" /> High retention views</li>
              </ul>

              <div className="bg-black/50 p-4 border border-[#333] rounded-xl flex flex-col gap-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] uppercase font-display tracking-widest text-gray-500">Budget Range</label>
                    <span className="text-[#ccff00] font-display font-black">₹{reelsBudget}</span>
                  </div>
                  <input 
                    type="range" 
                    min="799" 
                    max="50000" 
                    step="100"
                    value={reelsBudget}
                    onChange={(e) => setReelsBudget(parseInt(e.target.value))}
                    className="w-full h-1 bg-[#222] rounded-lg appearance-none cursor-pointer accent-[#ccff00]"
                  />
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t border-[#333]">
                  <span className="text-[10px] uppercase tracking-widest text-gray-500">Est. Views:</span>
                  <span className="text-white font-display font-black text-lg">{getReelsViewsFromBudget(reelsBudget)}</span>
                </div>
              </div>

              <div className="bg-black/50 p-4 border border-[#333] rounded-xl flex flex-col gap-3">
                <label className="text-[10px] uppercase font-display tracking-widest text-gray-500">Custom Target (AI)</label>
                <input 
                  type="text" 
                  placeholder="e.g. 5k-8k views" 
                  value={reelsTarget}
                  onChange={(e) => calculateReelsCost(e.target.value)}
                  className="bg-transparent border-b border-[#333] py-2 text-white font-sans focus:outline-none focus:border-[#ccff00] transition-colors"
                />
                {reelsEstimate !== null && (
                  <div className="flex justify-between items-center mt-2 animate-in fade-in slide-in-from-top-1">
                    <span className="text-[10px] uppercase tracking-widest text-gray-500">Estimated Cost:</span>
                    <span className="text-[#ccff00] font-display font-black text-xl">₹{reelsEstimate.toLocaleString()}*</span>
                  </div>
                )}
              </div>

              <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi, I want to start a Reels Promotion with budget ₹${reelsBudget}`} className="block w-full py-4 bg-[#ccff00] text-black text-center font-display font-black uppercase tracking-widest rounded-xl hover:bg-white transition-all">Start Campaign</a>
            </div>
          </div>

          {/* YouTube Promotion */}
          <div className="p-8 bg-[#111] border border-[#222] rounded-3xl relative overflow-hidden flex flex-col">
             <div className="absolute top-0 right-0 p-6 opacity-10">
              <Globe2 size={80} className="text-[#FF0000]" />
            </div>
            <h3 className="text-2xl font-display uppercase font-black mb-2">YouTube Ads</h3>
            <p className="text-gray-400 text-sm mb-8">Official Google Video Ads.</p>

            <div className="space-y-6 flex-grow">
              <ul className="space-y-3 mb-8">
                <li className="flex gap-2 text-xs text-gray-500 items-center"><CheckCircle2 size={14} className="text-[#FF0000]" /> High retention views</li>
                <li className="flex gap-2 text-xs text-gray-500 items-center"><CheckCircle2 size={14} className="text-[#FF0000]" /> Verified by Google</li>
              </ul>

              <div className="bg-black/50 p-4 border border-[#333] rounded-xl flex flex-col gap-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] uppercase font-display tracking-widest text-gray-500">Campaign Budget</label>
                    <span className="text-[#FF0000] font-display font-black">₹{ytBudget}</span>
                  </div>
                  <input 
                    type="range" 
                    min="199" 
                    max="100000" 
                    step="100"
                    value={ytBudget}
                    onChange={(e) => setYtBudget(parseInt(e.target.value))}
                    className="w-full h-1 bg-[#222] rounded-lg appearance-none cursor-pointer accent-[#FF0000]"
                  />
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t border-[#333]">
                  <span className="text-[10px] uppercase tracking-widest text-gray-500">Est. Views:</span>
                  <span className="text-white font-display font-black text-lg">{getYtViewsFromBudget(ytBudget)}</span>
                </div>
              </div>

              <div className="bg-black/50 p-4 border border-[#333] rounded-xl flex flex-col gap-3">
                <label className="text-[10px] uppercase font-display tracking-widest text-gray-500">Custom Target (AI)</label>
                <input 
                  type="text" 
                  placeholder="e.g. 5000 views" 
                  value={ytTarget}
                  onChange={(e) => calculateYTCost(e.target.value)}
                  className="bg-transparent border-b border-[#333] py-2 text-white font-sans focus:outline-none focus:border-[#FF0000] transition-colors"
                />
                {ytEstimate !== null && (
                  <div className="flex justify-between items-center mt-2 animate-in fade-in slide-in-from-top-1">
                    <span className="text-[10px] uppercase tracking-widest text-gray-500">Est. Total:</span>
                    <span className="text-[#FF0000] font-display font-black text-xl">₹{ytEstimate.toLocaleString()}*</span>
                  </div>
                )}
              </div>

              <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi, I want to start a YouTube Ad Campaign with budget ₹${ytBudget}`} className="block w-full py-4 bg-white text-black text-center font-display font-black uppercase tracking-widest rounded-xl hover:bg-[#FF0000] hover:text-white transition-all">Setup Ad Campaign</a>
            </div>
          </div>

          {/* Spotify Promotion */}
          <div className="p-8 bg-[#111] border border-[#222] rounded-3xl relative overflow-hidden flex flex-col">
             <div className="absolute top-0 right-0 p-6 opacity-10">
              <ShieldCheck size={80} className="text-[#1DB954]" />
            </div>
            <h3 className="text-2xl font-display uppercase font-black mb-2">Spotify Hub</h3>
            <p className="text-gray-400 text-sm mb-8">Playlist pitching & growth.</p>

            <div className="space-y-6 flex-grow">
              <ul className="space-y-3 mb-8">
                <li className="flex gap-2 text-xs text-gray-500 items-center"><CheckCircle2 size={14} className="text-[#1DB954]" /> Targeted playlists</li>
                <li className="flex gap-2 text-xs text-gray-500 items-center"><CheckCircle2 size={14} className="text-[#1DB954]" /> Organic stream growth</li>
              </ul>

              <div className="bg-black/50 p-4 border border-[#333] rounded-xl flex flex-col gap-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] uppercase font-display tracking-widest text-gray-500">Pitch Budget</label>
                    <span className="text-[#1DB954] font-display font-black">₹{spotifyBudget}</span>
                  </div>
                  <input 
                    type="range" 
                    min="2199" 
                    max="100000" 
                    step="500"
                    value={spotifyBudget}
                    onChange={(e) => setSpotifyBudget(parseInt(e.target.value))}
                    className="w-full h-1 bg-[#222] rounded-lg appearance-none cursor-pointer accent-[#1DB954]"
                  />
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t border-[#333]">
                  <span className="text-[10px] uppercase tracking-widest text-gray-500">Est. Streams:</span>
                  <span className="text-white font-display font-black text-lg">{getSpotifyStreamsFromBudget(spotifyBudget)}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                 <p className="text-[9px] text-gray-500 uppercase tracking-widest text-center">* Estimates based on current platform rates</p>
              </div>

              <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi, I want to start a Spotify Promotion with budget ₹${spotifyBudget}`} className="block w-full py-4 bg-transparent border border-[#1DB954] text-[#1DB954] text-center font-display font-black uppercase tracking-widest rounded-xl hover:bg-[#1DB954] hover:text-black transition-all">Submit for Pitch</a>
            </div>
          </div>
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
