import { useState } from 'react';
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

  const [reelsTarget, setReelsTarget] = useState("");
  const [reelsEstimate, setReelsEstimate] = useState<number | null>(null);
  const [reelsBudget, setReelsBudget] = useState(799);
  
  const [ytTarget, setYtTarget] = useState("");
  const [ytEstimate, setYtEstimate] = useState<number | null>(null);
  const [ytBudget, setYtBudget] = useState(499);

  const [spotifyTarget, setSpotifyTarget] = useState("");
  const [spotifyEstimate, setSpotifyEstimate] = useState<number | null>(null);
  const [spotifyBudget, setSpotifyBudget] = useState(2199);

  const calculateReelsCost = (input: string) => {
    setReelsTarget(input);
    // Handle ranges like 5k-8k
    const parts = input.toLowerCase().split(/[^\d.k]/);
    const lastPart = parts[parts.length - 1];
    let num = parseFloat(lastPart.replace(/k/g, '')) * (lastPart.includes('k') ? 1000 : 1);
    
    if (isNaN(num)) {
      setReelsEstimate(null);
      return;
    }
    // Base rate: approx ₹120 per 1000 views for reels campaign
    setReelsEstimate(Math.round(num * 0.12)); 
  };

  const calculateYTCost = (input: string) => {
    setYtTarget(input);
    const num = parseFloat(input.replace(/k/g, '')) * (input.toLowerCase().includes('k') ? 1000 : 1);
    if (isNaN(num)) {
      setYtEstimate(null);
      return;
    }
    // Plans: 1k -> 199, 3k -> 499 (~166), 10k -> 1499 (~149)
    let rate = 0.199;
    if (num >= 3000) rate = 0.166;
    if (num >= 10000) rate = 0.149;
    setYtEstimate(Math.round(num * rate));
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
    // Approx ₹0.5 per stream for micro-playlists
    const streams = Math.round(budget / 0.5);
    return `${(streams/1000).toFixed(1)}k`;
  };

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
