import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Music, Play, Music2, Headphones, Share2, Globe, ExternalLink, Instagram, Facebook, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import PremiumLoader from '../../components/PremiumLoader';

export default function SmartLink() {
  const { id } = useParams();
  const [release, setRelease] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRelease() {
      if (!id) return;
      try {
        const docSnap = await getDoc(doc(db, 'submissions', id));
        if (docSnap.exists()) {
          setRelease(docSnap.id ? { id: docSnap.id, ...docSnap.data() } : null);
        }
      } catch (err) {
        console.error("Error fetching release for smart link:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRelease();
  }, [id]);

  if (loading) return <PremiumLoader />;
  if (!release) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-2xl font-display uppercase tracking-widest text-white mb-4">Release Not Found</h1>
      <Link to="/" className="text-[#ccff00] uppercase font-display text-xs tracking-widest">Back to Gati</Link>
    </div>
  );

  const stores = [
    { id: 'spotify', name: 'Spotify', icon: <Music2 size={18} />, color: '#1DB954', label: 'Listen' },
    { id: 'appleMusic', name: 'Apple Music', icon: <Headphones size={18} />, color: '#FA243C', label: 'Listen' },
    { id: 'youtubeMusic', name: 'YouTube Music', icon: <Play size={18} />, color: '#FF0000', label: 'Watch' },
    { id: 'deezer', name: 'Deezer', icon: <Globe size={18} />, color: '#FF0000', label: 'Stream' },
    { id: 'amazonMusic', name: 'Amazon Music', icon: <Music size={18} />, color: '#00A8E1', label: 'Listen' },
    { id: 'instagram', name: 'Instagram Audio', icon: <Instagram size={18} />, color: '#E1306C', label: 'Use Audio' },
  ].filter(store => release.storeLinks?.[store.id]);

  const handleStoreClick = (url: string) => {
    window.open(url, '_blank');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${release.title} - ${release.mainArtist}`,
        text: `Listen to ${release.title} by ${release.mainArtist} on Gati Music`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Smart link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-[#070707] text-white selection:bg-[#ccff00] selection:text-black font-sans relative overflow-hidden flex flex-col items-center">
      {/* Background Blur */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden opacity-40 select-none pointer-events-none z-0">
        <img src={release.coverUrl} alt="" className="w-full h-full object-cover blur-[100px] scale-150" />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="relative z-10 w-full max-w-md pt-12 pb-24 px-4 sm:px-6">
        
        {/* Main Card */}
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-black/40 backdrop-blur-3xl border border-white/10 rounded-3xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
        >
          {/* Release Header */}
          <div className="p-8 pb-6 text-center">
             <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', damping: 15 }}
             >
               <img 
                src={release.coverUrl} 
                alt={release.title} 
                className="w-full aspect-square object-cover rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.8)] mb-8 mx-auto"
                referrerPolicy="no-referrer"
               />
             </motion.div>
             <h1 className="text-3xl font-display font-black uppercase tracking-tight text-white mb-2 leading-none">{release.title}</h1>
             <p className="text-gray-400 font-display uppercase tracking-widest text-xs font-bold">{release.mainArtist}</p>
          </div>

          {/* Platform List */}
          <div className="px-3 pb-8">
             <div className="space-y-2">
               {stores.length > 0 ? stores.map((store, i) => (
                 <motion.button 
                  key={store.id} 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 + (i * 0.1) }}
                  onClick={() => handleStoreClick(release.storeLinks[store.id])}
                  className="w-full flex items-center justify-between p-4 px-6 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all rounded-2xl group"
                 >
                   <div className="flex items-center gap-4">
                     <div className="w-10 h-10 flex items-center justify-center rounded-full bg-black/50 border border-white/5 group-hover:scale-110 transition-transform">
                       {store.icon}
                     </div>
                     <div className="text-left">
                       <span className="text-[10px] uppercase font-black tracking-widest text-gray-500 mb-0.5 block">{store.label}</span>
                       <span className="text-sm font-bold tracking-wide text-white">{store.name}</span>
                     </div>
                   </div>
                   <div className="p-2.5 rounded-full border border-white/5 bg-black/20 group-hover:bg-[#ccff00] group-hover:text-black transition-all">
                     <ExternalLink size={16} />
                   </div>
                 </motion.button>
               )) : (
                 <div className="text-center p-10 bg-black/20 rounded-2xl border border-dashed border-white/5">
                   <div className="mb-4 flex justify-center">
                     <Music size={40} className="text-gray-700 animate-pulse" />
                   </div>
                   <p className="text-gray-500 text-[10px] uppercase font-black tracking-[0.2em]">Release links are being updated</p>
                   <p className="text-gray-700 text-[8px] uppercase tracking-widest mt-2">Check back in a few hours</p>
                 </div>
               )}
             </div>
          </div>
        </motion.div>

        {/* Action Bar */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 flex items-center justify-center gap-4"
        >
           <button 
             onClick={handleShare}
             className="flex-1 max-w-[200px] flex items-center justify-center gap-3 py-4 bg-[#ccff00] text-black rounded-2xl font-display uppercase font-black tracking-widest text-[11px] hover:bg-white hover:scale-105 transition-all shadow-[0_10px_30px_rgba(204,255,0,0.2)]"
           >
             <Share2 size={16} /> Share Now
           </button>
        </motion.div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <Link to="/" className="inline-block group mb-8">
            <p className="text-[10px] uppercase font-display tracking-[0.4em] font-black text-white/40 group-hover:text-[#ccff00] transition-colors">Distributed by Gati Music</p>
          </Link>
          <div className="flex justify-center gap-8">
            <button className="p-3 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all"><Instagram size={24} /></button>
            <button className="p-3 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all"><Facebook size={24} /></button>
          </div>
        </div>

      </div>

      <div className="fixed bottom-10 left-0 w-full flex justify-center z-50 pointer-events-none scale-90 sm:scale-100">
        <motion.div
           initial={{ y: 100 }}
           animate={{ y: 0 }}
           transition={{ delay: 1.5 }}
           className="pointer-events-auto"
        >
          <Link 
            to="/" 
            className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/10 text-white px-8 py-3 rounded-full font-display uppercase tracking-[0.2em] text-[10px] font-black hover:bg-white hover:text-black transition-all hover:scale-110"
          >
            Join Gati Music <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>

    </div>
  );
}
