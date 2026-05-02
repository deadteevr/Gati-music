import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { ExternalLink, Copy, Share2, Music, QrCode, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ArtistSmartLinks({ user }: { user: any }) {
  const [releases, setReleases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'submissions'), where('uid', '==', user.uid), where('status', '==', 'Live'));
    const unsub = onSnapshot(q, (snap) => {
      setReleases(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const copyToClipboard = (id: string) => {
    const url = `${window.location.origin}/release/${id}`;
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };

  const handleShare = (id: string, title: string) => {
    const url = `${window.location.origin}/release/${id}`;
    if (navigator.share) {
      navigator.share({
        title: `Listen to ${title}`,
        url: url
      });
    } else {
      copyToClipboard(id);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display uppercase tracking-tighter mb-2">Smart Links</h1>
        <p className="text-gray-400 font-sans text-sm">Your one-stop link for all streaming platforms.</p>
      </div>

      {loading ? (
        <div className="text-[#ccff00] font-display animate-pulse uppercase tracking-[0.3em] py-20 text-center">Loading Links...</div>
      ) : releases.length === 0 ? (
        <div className="bg-[#111] border border-dashed border-[#333] p-20 text-center">
          <Music className="mx-auto text-gray-700 mb-4" size={48} />
          <p className="text-gray-500 font-display uppercase tracking-widest text-xs">No live releases found yet.</p>
          <p className="text-gray-700 text-[10px] uppercase mt-2">Smart links are automatically generated once your release goes live.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {releases.map(release => (
            <div key={release.id} className="bg-[#111] border border-[#222] p-6 hover:border-[#333] transition-all group">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex gap-4">
                  <img 
                    src={release.coverUrl} 
                    alt="" 
                    className="w-20 h-20 object-cover rounded border border-[#333]" 
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h3 className="text-xl font-display uppercase font-black text-white">{release.title}</h3>
                    <p className="text-[#ccff00] text-xs font-display uppercase tracking-widest mb-4">Live on Platforms</p>
                    <div className="flex flex-wrap gap-2">
                       {Object.keys(release.storeLinks || {}).map(store => (
                        <span key={store} className="text-[8px] bg-black border border-[#222] px-2 py-1 rounded uppercase tracking-widest text-gray-500">{store}</span>
                       ))}
                       {(!release.storeLinks || Object.keys(release.storeLinks).length === 0) && (
                         <span className="text-[8px] bg-black border border-yellow-500/20 px-2 py-1 rounded uppercase tracking-widest text-yellow-500">Links Syncing...</span>
                       )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                   <button 
                    onClick={() => setShowQR(release.id)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#222] hover:bg-[#333] text-white px-4 py-3 text-[10px] font-display uppercase font-black tracking-widest transition-all"
                   >
                     <QrCode size={14} /> Scan QR
                   </button>
                   <button 
                    onClick={() => handleShare(release.id, release.title)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#222] hover:bg-[#333] text-white px-4 py-3 text-[10px] font-display uppercase font-black tracking-widest transition-all"
                   >
                     <Share2 size={14} /> Share
                   </button>
                   <button 
                    onClick={() => copyToClipboard(release.id)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#222] hover:bg-[#333] text-white px-4 py-3 text-[10px] font-display uppercase font-black tracking-widest transition-all"
                   >
                     <Copy size={14} /> Copy Link
                   </button>
                   <a 
                    href={`/release/${release.id}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#ccff00] text-black px-6 py-3 text-[10px] font-display uppercase font-black tracking-widest hover:bg-white transition-all shadow-[0_5px_15px_rgba(204,255,0,0.2)]"
                   >
                     <ExternalLink size={14} /> View Page
                   </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR MODAL (SIMULATED) */}
      <AnimatePresence>
        {showQR && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#111] border border-[#333] p-10 max-w-xs w-full text-center relative"
            >
              <button 
                onClick={() => setShowQR(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white"
              >
                <X size={24} />
              </button>
              <h3 className="text-[#ccff00] font-display uppercase tracking-widest text-sm mb-6">Scan to Listen</h3>
              
              <div className="bg-white p-4 rounded-xl mb-6 aspect-square flex items-center justify-center">
                 {/* This would be a real QR code in production using a library like qrcode.react */}
                 <div className="w-full h-full border-4 border-black border-dashed flex flex-col items-center justify-center text-black">
                   <QrCode size={120} strokeWidth={1.5} />
                   <p className="text-[8px] uppercase font-black tracking-widest mt-2">{window.location.origin}/release/{showQR}</p>
                 </div>
              </div>
              
              <p className="text-gray-500 text-[10px] uppercase tracking-widest font-sans">Show this QR code to fans to instantly open your smart link.</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="bg-[#ccff00]/5 border border-[#ccff00]/20 p-6">
        <h3 className="text-[#ccff00] text-xs font-display uppercase tracking-widest font-black mb-2">Smart Link Tip</h3>
        <p className="text-gray-400 text-xs font-sans">Add this link to your Instagram Bio or YouTube description to let your fans choose their favorite streaming service.</p>
      </div>
    </div>
  );
}
