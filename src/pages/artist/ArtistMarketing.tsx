import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Youtube, 
  Music, 
  Instagram, 
  Zap, 
  Check, 
  ArrowRight, 
  Sparkles, 
  TrendingUp, 
  Users, 
  Globe,
  BarChart3,
  PieChart as PieChartIcon,
  MousePointer2,
  Target,
  RefreshCcw,
  ExternalLink
} from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';

const PROMO_CATEGORIES = [
  {
    id: 'youtube',
    title: 'YouTube Promotion',
    subtitle: 'Google Ads - Estimate',
    icon: <Youtube className="text-[#FF0000]" />,
    description: [
      'Real views via Google Ads (no bots)',
      'Improves video ranking & discovery',
      'Boosts social proof (more organic clicks)',
      'Fast delivery (24–72 hrs start)',
      'Safe for monetization'
    ],
    plans: [
      { name: '1K Views', price: 199 },
      { name: '3K Views', price: 499 },
      { name: '5K Views', price: 899 },
      { name: '10K Views', price: 1699, popular: true },
      { name: '50K Views', price: 7799 },
      { name: '100K Views', price: 14999 },
    ]
  },
  {
    id: 'micro-playlist',
    title: 'Micro Playlist Plan',
    subtitle: 'Organic Growth',
    icon: <Music className="text-[#ccff00]" />,
    description: [
      '1 Major Playlist placement',
      '100+ Micro Playlists',
      'Expected 3–5K streams/month',
      'No guaranteed streams (organic reach)',
      'Improves Spotify algorithm reach',
      'Helps in Release Radar & Discover Weekly',
      'Builds consistent daily streams',
      'Better artist credibility'
    ],
    plans: [
      { name: 'Micro Plan - 1 Month', price: 2199 },
      { name: 'Micro Plan - 2 Months', price: 3799, popular: true },
    ]
  },
  {
    id: 'spotify-pitch',
    title: 'Spotify Playlist Pitching',
    subtitle: 'Targeted Reach',
    icon: <Sparkles className="text-[#1DB954]" />,
    description: [
      'Targeted audience reach',
      'Higher chances of going viral',
      'Boosts song popularity score',
      'Helps in algorithmic playlists',
      'Strong social proof for new listeners'
    ],
    plans: [
      { name: '10K Streams', price: 5699 },
      { name: '20K Streams', price: 9499, popular: true },
      { name: '50K Streams', price: 22999 },
      { name: '100K Streams', price: 39999 },
    ]
  },
  {
    id: 'reels',
    title: 'Reels Promotion',
    subtitle: 'Meta Ads - Estimate',
    icon: <Instagram className="text-[#E1306C]" />,
    description: [
      'Increases chances of going viral',
      'Brings real audience engagement',
      'Boosts Instagram reach & followers',
      'Drives traffic to Spotify/YouTube',
      'Fast exposure for new releases'
    ],
    plans: [
      { name: '5K–8K Views', price: 799 },
      { name: '20K–35K Views', price: 2299, popular: true },
      { name: '100K–200K Views', price: 12999 },
    ]
  }
];

export default function ArtistMarketing({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState<'packages' | 'campaigns' | 'estimator'>('packages');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [activeCampaigns, setActiveCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Estimator state
  const [estimateType, setEstimateType] = useState<'youtube' | 'reels'>('youtube');
  const [budget, setBudget] = useState(1000);

  const getEstimate = (type: 'youtube' | 'reels', cost: number) => {
    if (type === 'youtube') {
      // ~₹0.15 to ₹0.20 per view for YouTube via Google Ads
      const minViews = Math.floor(cost / 0.2);
      const maxViews = Math.floor(cost / 0.15);
      return `${minViews.toLocaleString()} - ${maxViews.toLocaleString()}`;
    } else {
      // ~₹0.10 to ₹0.15 per view for Meta Ads
      const minViews = Math.floor(cost / 0.15);
      const maxViews = Math.floor(cost / 0.08);
      return `${minViews.toLocaleString()} - ${maxViews.toLocaleString()}`;
    }
  };

  useEffect(() => {
    const q = query(collection(db, 'campaigns'), where('uid', '==', user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const campaigns = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setActiveCampaigns(campaigns);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'campaigns', false);
      setLoading(false);
    });
    return unsub;
  }, [user.uid]);

  const handlePromotion = (planName: string) => {
    const encodedMsg = encodeURIComponent(`Hi I want to buy ${planName} from Gati Music`);
    window.open(`https://wa.me/917626841258?text=${encodedMsg}`, '_blank');
  };

  const handleCustomPromo = () => {
    const encodedMsg = encodeURIComponent(`Hi Gati Team, I want to start a custom ${estimateType} campaign with a budget of ₹${budget}. Please guide me.`);
    window.open(`https://wa.me/917626841258?text=${encodedMsg}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto pb-24 px-4 sm:px-6">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-[#ccff00]/10 border border-[#ccff00]/20 rounded-full mb-6"
          >
            <Zap size={14} className="text-[#ccff00]" />
            <span className="text-[10px] font-display uppercase tracking-[0.2em] text-[#ccff00] font-bold">Promotion Hub</span>
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-display uppercase tracking-tighter leading-none font-black italic">
            Go <span className="text-[#ccff00]">Viral</span> 
          </h1>
          <p className="text-gray-400 font-sans text-lg max-w-xl mt-4">
            Professional marketing campaigns powered by Google & Meta Ads to boost your streams and audience engagement.
          </p>
        </div>

        {activeCampaigns.length > 0 && (
          <div className="hidden lg:flex gap-4">
             <div className="bg-[#111] p-4 border border-[#333] rounded-sm min-w-[140px]">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Active Campaigns</p>
                <p className="text-2xl font-display font-black text-white">{activeCampaigns.filter(c => c.status === 'active').length}</p>
             </div>
             <div className="bg-[#111] p-4 border border-[#333] rounded-sm min-w-[140px]">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Impact (Views)</p>
                <p className="text-2xl font-display font-black text-[#ccff00]">
                  {activeCampaigns.reduce((acc, c) => acc + (c.metrics?.views || 0), 0).toLocaleString()}
                </p>
             </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[#222] mb-10 overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setActiveTab('packages')}
          className={`px-6 py-4 font-display uppercase tracking-widest text-[10px] font-black whitespace-nowrap transition-all border-b-2 ${
            activeTab === 'packages' ? 'border-[#ccff00] text-[#ccff00]' : 'border-transparent text-gray-500 hover:text-white'
          }`}
        >
          Promotion Packages
        </button>
        <button 
          onClick={() => setActiveTab('campaigns')}
          className={`px-6 py-4 font-display uppercase tracking-widest text-[10px] font-black whitespace-nowrap transition-all border-b-2 ${
            activeTab === 'campaigns' ? 'border-[#ccff00] text-[#ccff00]' : 'border-transparent text-gray-500 hover:text-white'
          }`}
        >
          My Campaigns ({activeCampaigns.length})
        </button>
        <button 
          onClick={() => setActiveTab('estimator')}
          className={`px-6 py-4 font-display uppercase tracking-widest text-[10px] font-black whitespace-nowrap transition-all border-b-2 ${
            activeTab === 'estimator' ? 'border-[#ccff00] text-[#ccff00]' : 'border-transparent text-gray-500 hover:text-white'
          }`}
        >
          AI Tool: Estimate Reach
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'packages' && (
          <motion.div 
            key="packages"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12"
          >
            {PROMO_CATEGORIES.map((category, catIdx) => (
              <section 
                key={category.id}
                className="flex flex-col bg-[#0a0a0a] border border-[#1a1a1a] overflow-hidden group hover:border-[#ccff00]/30 transition-colors"
              >
                <div className="p-8 border-b border-[#1a1a1a] bg-gradient-to-br from-[#111] to-black">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-black border border-[#222] rounded-xl">
                      {category.icon}
                    </div>
                    <div>
                      <h2 className="text-2xl font-display uppercase font-black text-white">{category.title}</h2>
                      <p className="text-[10px] font-display uppercase tracking-[0.3em] text-[#ccff00] font-bold">{category.subtitle}</p>
                    </div>
                  </div>
                  <ul className="space-y-2 mt-6">
                    {category.description.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-500 font-sans">
                        <Check size={14} className="text-[#ccff00] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-8 flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {category.plans.map((plan, planIdx) => (
                    <div
                      key={`${category.id}-${planIdx}`}
                      onClick={() => setSelectedPlan(`${category.id}-${planIdx}`)}
                      className={`relative p-6 border transition-all cursor-pointer flex flex-col justify-between ${
                        selectedPlan === `${category.id}-${planIdx}` 
                        ? 'border-[#ccff00] bg-[#ccff00]/5' 
                        : 'border-[#1a1a1a] bg-[#0d0d0d]'
                      }`}
                    >
                      {plan.popular && (
                        <div className="absolute top-0 right-0 bg-[#ccff00] text-black text-[8px] font-display uppercase font-black px-2 py-1 tracking-widest">
                          Popular
                        </div>
                      )}
                      <div className="mb-4">
                        <h4 className="text-white font-display uppercase text-sm font-bold leading-tight">{plan.name}</h4>
                        <p className="text-2xl font-display font-black text-white mt-1">₹{plan.price.toLocaleString()}</p>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handlePromotion(plan.name); }}
                        className={`w-full py-3 text-[10px] font-display uppercase font-black tracking-widest ${
                          selectedPlan === `${category.id}-${planIdx}` ? 'bg-[#ccff00] text-black' : 'bg-white/5 text-white'
                        }`}
                      >
                        Start
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </motion.div>
        )}

        {activeTab === 'campaigns' && (
          <motion.div 
            key="campaigns"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {activeCampaigns.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-[#222]">
                <p className="text-gray-500 font-display uppercase tracking-widest text-xs">No promotion campaigns found</p>
                <button 
                  onClick={() => setActiveTab('packages')}
                  className="mt-4 text-[#ccff00] text-[10px] font-display uppercase font-bold tracking-widest underline decoration-[#ccff00]/30 underline-offset-4"
                >
                  Start your first campaign
                </button>
              </div>
            ) : (
              activeCampaigns.map((camp) => (
                <div key={camp.id} className="bg-[#111] border border-[#222] p-6 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`p-2 rounded bg-black border border-[#333] ${camp.type === 'YouTube' ? 'text-[#FF0000]' : camp.type === 'Reels' ? 'text-[#E1306C]' : 'text-[#1DB954]'}`}>
                        {camp.type === 'YouTube' ? <Youtube size={20} /> : camp.type === 'Reels' ? <Instagram size={20} /> : <Music size={20} />}
                      </div>
                      <div>
                        <h3 className="font-display uppercase font-black text-white">{camp.songTitle}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] text-gray-500 uppercase tracking-widest">{camp.type} Ads</span>
                          <span className={`text-[8px] px-1.5 py-0.5 rounded uppercase font-bold tracking-widest ${
                            camp.status === 'active' ? 'bg-[#ccff00] text-black' : 'bg-gray-800 text-gray-400'
                          }`}>
                            {camp.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full md:w-auto">
                    <div className="flex flex-col">
                      <span className="text-[8px] text-gray-500 uppercase tracking-widest font-black mb-1">Views</span>
                      <span className="text-lg font-display font-black text-white">{(camp.metrics?.views || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] text-gray-500 uppercase tracking-widest font-black mb-1">Clicks</span>
                      <span className="text-lg font-display font-black text-white">{(camp.metrics?.clicks || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] text-gray-500 uppercase tracking-widest font-black mb-1">Conv.</span>
                      <span className="text-lg font-display font-black text-white">{camp.metrics?.conversion || 0}%</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] text-gray-500 uppercase tracking-widest font-black mb-1">ROI</span>
                      <span className="text-lg font-display font-black text-[#9d4edd]">{camp.metrics?.roi || 1}x</span>
                    </div>
                  </div>
                  <div className="w-full md:w-auto mt-4 md:mt-0">
                     <button className="w-full md:w-auto px-6 py-3 bg-white/5 border border-white/10 hover:bg-[#ccff00] hover:text-black transition-all text-[10px] font-display uppercase font-black tracking-widest inline-flex items-center justify-center gap-2">
                       Full Analytics <ExternalLink size={12} />
                     </button>
                  </div>
                </div>
              )
            ))}
          </motion.div>
        )}

        {activeTab === 'estimator' && (
          <motion.div 
            key="estimator"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-[#111] border border-[#333] p-8 lg:p-12 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-10">
                 <Sparkles size={120} className="text-[#ccff00]" />
               </div>
               
               <div className="relative z-10">
                  <h2 className="text-3xl font-display uppercase font-black text-white italic mb-2">Campaign <span className="text-[#ccff00]">Estimator</span></h2>
                  <p className="text-gray-400 text-sm mb-10 uppercase tracking-widest">Select target and budget to calculate estimated AI reach</p>

                  <div className="grid md:grid-cols-2 gap-12">
                     <div className="space-y-8">
                       <div>
                         <label className="text-[10px] font-display uppercase tracking-widest text-gray-500 mb-4 block">Target Platform</label>
                         <div className="flex gap-4">
                            <button 
                              onClick={() => setEstimateType('youtube')}
                              className={`flex-1 flex flex-col items-center gap-3 p-6 border transition-all ${
                                estimateType === 'youtube' ? 'border-[#FF0000] bg-[#FF0000]/5 text-[#FF0000]' : 'border-[#222] text-gray-500'
                              }`}
                            >
                               <Youtube size={32} />
                               <span className="text-[10px] font-display uppercase font-black tracking-[0.2em]">YouTube</span>
                            </button>
                            <button 
                              onClick={() => setEstimateType('reels')}
                              className={`flex-1 flex flex-col items-center gap-3 p-6 border transition-all ${
                                estimateType === 'reels' ? 'border-[#E1306C] bg-[#E1306C]/5 text-[#E1306C]' : 'border-[#222] text-gray-500'
                              }`}
                            >
                               <Instagram size={32} />
                               <span className="text-[10px] font-display uppercase font-black tracking-[0.2em]">Insta Reels</span>
                            </button>
                         </div>
                       </div>

                       <div>
                         <div className="flex items-center justify-between mb-4">
                           <label className="text-[10px] font-display uppercase tracking-widest text-gray-500 block">Campaign Budget</label>
                           <span className="text-2xl font-display font-black text-white">₹{budget.toLocaleString()}</span>
                         </div>
                         <input 
                           type="range"
                           min="500"
                           max="50000"
                           step="500"
                           value={budget}
                           onChange={(e) => setBudget(Number(e.target.value))}
                           className="w-full h-1 bg-[#222] rounded-lg appearance-none cursor-pointer accent-[#ccff00]"
                         />
                         <div className="flex justify-between mt-2 text-[9px] text-gray-600 font-sans uppercase tracking-widest">
                           <span>₹500</span>
                           <span>₹50,000+</span>
                         </div>
                       </div>
                     </div>

                     <div className="bg-black/50 border border-[#222] p-8 flex flex-col justify-center text-center">
                        <RefreshCcw className="mx-auto text-[#ccff00] mb-4 animate-spin-slow" size={24} />
                        <h3 className="text-sm font-display uppercase tracking-[0.2em] text-gray-500 mb-6">AI Estimated Impact</h3>
                        
                        <div className="mb-8">
                           <p className="text-5xl font-display font-black text-[#ccff00] tracking-tighter mb-2">
                             {getEstimate(estimateType, budget)}
                           </p>
                           <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">Estimated Real Views</p>
                        </div>

                        <div className="space-y-4 pt-6 border-t border-[#222]">
                           <div className="flex justify-between text-[10px] uppercase tracking-widest">
                              <span className="text-gray-500">Fast Delivery</span>
                              <span className="text-white">Active</span>
                           </div>
                           <div className="flex justify-between text-[10px] uppercase tracking-widest">
                              <span className="text-gray-500">Ad Placement</span>
                              <span className="text-white">Professional</span>
                           </div>
                        </div>

                        <button 
                          onClick={handleCustomPromo}
                          className="w-full bg-[#ccff00] text-black py-4 mt-8 font-display uppercase font-black tracking-widest text-[10px] hover:bg-white transition-all shadow-[0_0_20px_rgba(204,255,0,0.2)]"
                        >
                          Request This Campaign
                        </button>
                     </div>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trust Bar */}
      <div className="mt-20 pt-10 border-t border-[#1a1a1a] grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="flex flex-col items-center text-center">
            <Globe className="text-gray-600 mb-2" size={24} />
            <span className="text-[10px] font-display uppercase tracking-widest text-gray-500 font-bold">Global Reach</span>
        </div>
        <div className="flex flex-col items-center text-center">
            <TrendingUp className="text-gray-600 mb-2" size={24} />
            <span className="text-[10px] font-display uppercase tracking-widest text-gray-500 font-bold">Organic Growth</span>
        </div>
        <div className="flex flex-col items-center text-center">
            <Zap className="text-gray-600 mb-2" size={24} />
            <span className="text-[10px] font-display uppercase tracking-widest text-gray-500 font-bold">Fast Approval</span>
        </div>
        <div className="flex flex-col items-center text-center">
            <Users className="text-gray-600 mb-2" size={24} />
            <span className="text-[10px] font-display uppercase tracking-widest text-gray-500 font-bold">Real Audience</span>
        </div>
      </div>
    </div>
  );
}
