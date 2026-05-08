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
  ArrowRight
} from 'lucide-react';
import { PLANS, formatPrice, Plan } from '../constants/plans';

const WHATSAPP_NUMBER = "917626841258";

export default function PricingPage() {
  const [currency, setCurrency] = useState<'INR' | 'USD' | 'BOTH'>('BOTH');

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
            "description": "Release your music on Spotify, Apple Music and 250+ platforms with fast delivery and 80% royalties.",
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
            "description": "Monthly music distribution plan with unlimited releases, verified artist profiles, and 80% royalties.",
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
            "description": "Best value yearly plan for artists with unlimited uploads, priority support, and maximum earnings.",
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
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-7xl font-display uppercase tracking-tighter mb-6">
            Global <span className="text-[#B6FF00]">Pricing</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Transparent plans for independent artists and labels worldwide.
          </p>

          <div className="inline-flex bg-white/5 p-1 rounded-full border border-white/10 mb-12">
            <button 
              onClick={() => setCurrency('BOTH')}
              className={`px-6 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all ${currency === 'BOTH' ? 'bg-[#B6FF00] text-black' : 'text-gray-500 hover:text-white'}`}
            >
              Dual Pricing (INR/USD)
            </button>
            <button 
              onClick={() => setCurrency('INR')}
              className={`px-6 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all ${currency === 'INR' ? 'bg-[#B6FF00] text-black' : 'text-gray-500 hover:text-white'}`}
            >
              INR Only
            </button>
            <button 
              onClick={() => setCurrency('USD')}
              className={`px-6 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all ${currency === 'USD' ? 'bg-[#B6FF00] text-black' : 'text-gray-500 hover:text-white'}`}
            >
              USD Only
            </button>
          </div>
        </div>

        {/* Artist Plans */}
        <div className="mb-24">
          <div className="flex items-center gap-3 mb-10 justify-center">
            <Users className="text-[#B6FF00]" size={24} />
            <h2 className="text-2xl font-display uppercase tracking-widest font-black">Artist Plans</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {artistPlans.map((plan, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`p-8 rounded-3xl border ${plan.popular ? 'border-[#B6FF00] bg-[#B6FF00]/5' : 'border-[#222] bg-[#111]/30'} flex flex-col relative group`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#B6FF00] text-black text-[9px] font-display uppercase font-black px-4 py-1 rounded-full tracking-widest shadow-[0_0_20px_rgba(182,255,0,0.3)]">
                    Most Popular
                  </div>
                )}
                <div className="mb-8">
                  <h2 className="text-2xl font-display uppercase tracking-widest mb-2 font-black group-hover:text-[#B6FF00] transition-colors">{plan.name}</h2>
                  <p className="text-gray-500 text-sm font-sans mb-6">{plan.desc}</p>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-display font-black">{formatPrice(plan, currency)}</span>
                    <span className="text-gray-500 text-[10px] uppercase tracking-widest pb-1 ml-2">/ {plan.period}</span>
                  </div>
                </div>

                <div className="space-y-4 mb-10 flex-grow">
                  {plan.features.map((feature, j) => (
                    <div key={j} className="flex gap-3 text-sm text-gray-400">
                      <CheckCircle2 size={16} className="text-[#B6FF00] flex-shrink-0 mt-0.5" />
                      <span className="leading-tight">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto">
                  <a 
                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi, I want to purchase the Gati Music ${plan.name} plan.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block w-full py-4 rounded-xl text-center font-display font-black uppercase tracking-widest transition-all ${plan.popular ? 'bg-[#B6FF00] text-black hover:bg-white' : 'bg-white text-black hover:bg-[#B6FF00]'}`}
                  >
                    Get Started
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Label Plans */}
        <div className="pt-20 border-t border-white/5">
          <div className="flex flex-col items-center mb-12 text-center">
            <Building2 className="text-[#8B5CF6] mb-4" size={32} />
            <h2 className="text-4xl font-display uppercase tracking-tighter mb-4">Music <span className="text-[#8B5CF6]">Label</span> Plans</h2>
            <p className="text-gray-500 max-w-xl text-sm">Designed for managers, labels, and teams who need multi-artist management and centralized control.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {labelPlans.map((plan, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`p-10 rounded-3xl border ${plan.popular ? 'border-[#8B5CF6] bg-[#8B5CF6]/5' : 'border-[#222] bg-[#111]/30'} flex flex-col relative group`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#8B5CF6] text-white text-[9px] font-display uppercase font-black px-4 py-1 rounded-full tracking-widest shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                    Professional Choice
                  </div>
                )}
                <div className="mb-10">
                  <h2 className="text-3xl font-display uppercase tracking-widest mb-3 font-black group-hover:text-[#8B5CF6] transition-colors">{plan.name}</h2>
                  <p className="text-gray-400 text-sm font-sans mb-8">{plan.desc}</p>
                  <div className="flex items-end gap-1">
                    <span className="text-5xl font-display font-black">{formatPrice(plan, currency)}</span>
                    <span className="text-gray-500 text-[10px] uppercase tracking-widest pb-2 ml-3">/ {plan.period}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 mb-12 flex-grow">
                  {plan.features.map((feature, j) => (
                    <div key={j} className="flex gap-3 text-sm text-gray-300">
                      <Plus size={16} className="text-[#8B5CF6] flex-shrink-0 mt-0.5" />
                      <span className="leading-tight">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto">
                  <a 
                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi, I'm interested in the Gati Music ${plan.name} for my label.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block w-full py-5 rounded-xl text-center font-display font-black uppercase tracking-widest transition-all ${plan.popular ? 'bg-[#8B5CF6] text-white hover:bg-white hover:text-black' : 'bg-white text-black hover:bg-[#8B5CF6] hover:text-white'}`}
                  >
                    Setup My Label
                  </a>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-20 bg-gradient-to-br from-[#111] to-black border border-white/5 p-12 rounded-[32px] flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1">
              <h3 className="text-2xl font-display font-black uppercase mb-4 tracking-tighter">Managing massive rosters?</h3>
              <p className="text-gray-400 text-sm font-sans leading-relaxed">
                If you manage more than 20 artists or have high-volume catalogs (1000+ songs), we offer custom enterprise solutions with dedicated infrastructure and deeper royalty splits.
              </p>
            </div>
            <Link 
              to="/contact"
              className="px-10 py-5 bg-white text-black font-display font-black uppercase tracking-widest rounded-xl hover:bg-[#B6FF00] transition-colors shrink-0"
            >
              Request Custom Quote
            </Link>
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
