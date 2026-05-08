import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Copy, Check, Share2, Award, Zap, Clock, Star, Gift, ArrowUpRight, Music, Megaphone, Send, Instagram, Mail, Phone, Loader2 } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { collection, query, where, onSnapshot, doc, addDoc, serverTimestamp } from 'firebase/firestore';

export default function ArtistReferrals({ user, userData }: { user: any, userData: any }) {
  const [referrals, setReferrals] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    artistName: '',
    instagramUsername: '',
    email: '',
    whatsapp: ''
  });

  const handleSubmitReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await addDoc(collection(db, 'referrals'), {
        referrerUid: user.uid,
        referrerName: userData?.displayName || userData?.name || 'Gati Artist',
        artistName: formData.artistName,
        instagramUsername: formData.instagramUsername,
        email: formData.email,
        whatsapp: formData.whatsapp,
        status: 'Pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setSuccess("Referral submitted successfully! Our team will review it.");
      setFormData({ artistName: '', instagramUsername: '', email: '', whatsapp: '' });
      setShowForm(false);
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      console.error("Error submitting referral:", err);
      setError("Failed to submit referral. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  const successfulCount = referrals.filter(r => r.status === 'Reward Unlocked').length;
  const pendingCount = referrals.filter(r => r.status === 'Pending' || r.status === 'Approved').length;

  useEffect(() => {
    if (!user) return;
    
    const qRef = query(collection(db, 'referrals'), where('referrerUid', '==', user.uid));
    const unsubRef = onSnapshot(qRef, (snap) => {
      setReferrals(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, err => handleFirestoreError(err, OperationType.GET, 'referrals'));

    const qRew = query(collection(db, 'rewards'), where('uid', '==', user.uid));
    const unsubRew = onSnapshot(qRew, (snap) => {
      setRewards(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, err => handleFirestoreError(err, OperationType.GET, 'rewards'));

    return () => {
      unsubRef();
      unsubRew();
    };
  }, [user.uid]);

  const getMilestoneProgress = () => {
    if (successfulCount < 5) return { next: 5, current: successfulCount, label: 'Free Monthly Plan', icon: <Zap size={14} /> };
    if (successfulCount < 10) return { next: 10, current: successfulCount, label: 'Custom Marketing Bonus', icon: <Megaphone size={14} /> };
    return { next: successfulCount + 5, current: successfulCount, label: 'Elite Producer Perk', icon: <Zap size={14} /> };
  };

  const progress = getMilestoneProgress();
  const progressPercent = Math.min(100, (progress.current / progress.next) * 100);

  const formatDate = (date: any) => {
    if (!date) return 'Recently';
    if (typeof date === 'object' && date.toDate) return date.toDate().toLocaleDateString();
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#ccff00] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10 py-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-display font-black text-white tracking-tighter uppercase mb-2">Referrals</h1>
          <p className="text-gray-500 font-sans text-sm">Bring your artist community to Gati and earn exclusive rewards.</p>
        </div>
        
        <div className="bg-[#ccff00]/10 border border-[#ccff00]/20 px-6 py-4 rounded-xl flex items-center gap-6">
          <div className="text-center border-r border-[#ccff00]/10 pr-6">
            <p className="text-[10px] font-display uppercase tracking-widest text-gray-500 mb-1">Unlocked</p>
            <p className="text-2xl font-display font-black text-[#ccff00] leading-none">{successfulCount}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-display uppercase tracking-widest text-gray-500 mb-1">In Review</p>
            <p className="text-2xl font-display font-black text-white leading-none">{pendingCount}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Referral Action Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#111] border border-[#333] p-8 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Users size={80} />
            </div>
            
            <h2 className="text-xl font-display font-black text-white uppercase mb-6 tracking-tighter">Refer an Artist</h2>
            
            {!showForm ? (
              <div className="space-y-6">
                <p className="text-xs text-gray-400 font-sans leading-relaxed">
                  Know an artist who should be on Gati? Submit their details and we'll handle the rest. You get rewarded when they join and purchase a plan.
                </p>
                <button 
                  onClick={() => setShowForm(true)}
                  className="w-full py-4 bg-[#ccff00] text-black hover:bg-white transition-all text-[10px] font-display uppercase font-black tracking-widest flex items-center justify-center gap-2"
                >
                  <Send size={14} /> Submit New Referral
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitReferral} className="space-y-4 relative z-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="space-y-1">
                  <label className="text-[9px] font-display uppercase tracking-widest text-gray-500">Artist Name</label>
                  <input 
                    required
                    type="text"
                    value={formData.artistName}
                    onChange={e => setFormData({...formData, artistName: e.target.value})}
                    placeholder="Artist Legal/Stage Name"
                    className="w-full bg-black border border-[#222] p-3 text-white text-xs font-sans focus:border-[#ccff00] outline-none transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-display uppercase tracking-widest text-gray-500">Instagram Username</label>
                  <div className="relative">
                    <Instagram size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      required
                      type="text"
                      value={formData.instagramUsername}
                      onChange={e => setFormData({...formData, instagramUsername: e.target.value})}
                      placeholder="instagram_handle"
                      className="w-full bg-black border border-[#222] p-3 pl-10 text-white text-xs font-sans focus:border-[#ccff00] outline-none transition-colors"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-display uppercase tracking-widest text-gray-500">Email Address</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      required
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      placeholder="artist@example.com"
                      className="w-full bg-black border border-[#222] p-3 pl-10 text-white text-xs font-sans focus:border-[#ccff00] outline-none transition-colors"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-display uppercase tracking-widest text-gray-500">WhatsApp Number</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      required
                      type="tel"
                      value={formData.whatsapp}
                      onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                      placeholder="+234..."
                      className="w-full bg-black border border-[#222] p-3 pl-10 text-white text-xs font-sans focus:border-[#ccff00] outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 py-3 bg-[#222] text-white hover:bg-[#333] transition-all text-[10px] font-display uppercase font-black tracking-widest"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-[2] py-3 bg-[#ccff00] text-black hover:bg-white transition-all text-[10px] font-display uppercase font-black tracking-widest flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 size={14} className="animate-spin" /> : 'Submit Referral'}
                  </button>
                </div>
              </form>
            )}

            {success && (
              <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-display uppercase tracking-widest text-center">
                {success}
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-display uppercase tracking-widest text-center">
                {error}
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-[#9d4edd]/20 to-black border border-[#9d4edd]/30 p-8 rounded-2xl">
            <h3 className="text-[#9d4edd] font-display uppercase font-black tracking-widest text-[10px] mb-4">Milestone Rewards</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-black border border-[#9d4edd]/50 flex items-center justify-center shrink-0">
                  <Star size={14} className="text-[#9d4edd]" />
                </div>
                <div>
                  <p className="text-white text-sm font-bold font-sans">1 Successful Referral</p>
                  <p className="text-gray-500 text-[10px] font-display uppercase tracking-widest mt-1">Unlock 1 Free Release</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-black border border-[#9d4edd]/50 flex items-center justify-center shrink-0">
                  <Zap size={14} className="text-[#9d4edd]" />
                </div>
                <div>
                  <p className="text-white text-sm font-bold font-sans">5 Successful Referrals</p>
                  <p className="text-gray-500 text-[10px] font-display uppercase tracking-widest mt-1">Free 1-Month Artist Plan</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* List and Progress */}
        <div className="lg:col-span-2 space-y-8">
          {/* Progress Card */}
          <div className="bg-[#111] border border-[#333] p-10 rounded-2xl">
            <h2 className="text-xl font-display font-black text-white uppercase mb-8 tracking-tighter">Referral Progress</h2>
            
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="text-[#ccff00]">{progress.icon}</div>
                  <p className="text-[10px] font-display uppercase tracking-widest text-white font-black">Next Milestone: {progress.label}</p>
                </div>
                <p className="text-[10px] font-mono text-[#ccff00] font-black">{progress.current} / {progress.next}</p>
              </div>
              <div className="w-full bg-black h-4 rounded-full overflow-hidden p-1 border border-[#333]">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  className="h-full bg-gradient-to-r from-[#ccff00] to-[#9d4edd] rounded-full shadow-[0_0_15px_rgba(204,255,0,0.3)]"
                />
              </div>
              <p className="mt-4 text-[10px] text-gray-500 font-sans uppercase tracking-widest text-center">
                {progress.next - progress.current} more successful referrals to reach the next goal.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-black border border-[#222] p-4 text-center">
                <p className="text-2xl font-display font-black text-white mb-1">{referrals.length}</p>
                <p className="text-[8px] font-sans uppercase text-gray-500 tracking-widest">Total Referred</p>
              </div>
              <div className="bg-black border border-[#222] p-4 text-center">
                <p className="text-2xl font-display font-black text-[#ccff00] mb-1">{successfulCount}</p>
                <p className="text-[8px] font-sans uppercase text-gray-500 tracking-widest">Reward Unlocked</p>
              </div>
              <div className="bg-black border border-[#222] p-4 text-center">
                <p className="text-2xl font-display font-black text-purple-500 mb-1">{rewards.filter(r => r.status === 'active').length}</p>
                <p className="text-[8px] font-sans uppercase text-gray-500 tracking-widest">Rewards Ready</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Referrals List */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Users size={16} className="text-[#ccff00]" />
                <h3 className="text-sm font-display uppercase tracking-widest font-black text-white">Your Referrals</h3>
              </div>
              
              <div className="space-y-3">
                {referrals.length === 0 ? (
                  <div className="p-10 border border-dashed border-[#222] text-center text-gray-600 text-xs font-sans italic">
                    No referrals yet. Help your artist friends join Gati!
                  </div>
                ) : (
                  referrals.map(ref => (
                    <div key={ref.id} className="bg-[#111] border border-[#222] p-4 flex items-center justify-between group hover:border-[#333] transition-colors">
                      <div>
                        <p className="text-xs font-bold text-white font-sans">{ref.artistName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-[9px] text-gray-500 uppercase font-mono">@{ref.instagramUsername}</p>
                          <span className="text-gray-700">•</span>
                          <p className="text-[9px] text-gray-500 uppercase font-mono">{formatDate(ref.createdAt)}</p>
                        </div>
                      </div>
                      <span className={`text-[8px] font-display uppercase tracking-widest px-2 py-1 font-black rounded ${
                        ref.status === 'Reward Unlocked' ? 'bg-[#ccff00]/10 text-[#ccff00]' : 
                        ref.status === 'Approved' ? 'bg-blue-500/10 text-blue-500' :
                        'bg-yellow-500/10 text-yellow-500'
                      }`}>
                        {ref.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Reward History */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Gift size={16} className="text-[#9d4edd]" />
                <h3 className="text-sm font-display uppercase tracking-widest font-black text-white">Reward History</h3>
              </div>

              <div className="space-y-3">
                {rewards.length === 0 ? (
                  <div className="p-10 border border-dashed border-[#222] text-center text-gray-600 text-xs font-sans italic">
                    Unlock milestones to see rewards here.
                  </div>
                ) : (
                  rewards.map(rew => (
                    <div key={rew.id} className="bg-black/40 border border-[#9d4edd]/20 p-4 flex items-center justify-between group hover:border-[#9d4edd]/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-[#9d4edd]/10 flex items-center justify-center">
                          {rew.type === 'free_song' ? <Music size={14} className="text-[#9d4edd]" /> : <Zap size={14} className="text-[#9d4edd]" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white font-sans">
                            {rew.type === 'free_song' ? 'Free Song Release' : 'Free Monthly Plan'}
                          </p>
                          <p className="text-[9px] text-gray-500 uppercase font-mono mt-1">Earned {formatDate(rew.earnedAt)}</p>
                        </div>
                      </div>
                      {rew.status === 'active' ? (
                        <div className="flex items-center gap-1 text-[#ccff00] text-[9px] font-display font-black uppercase">
                          Ready <ArrowUpRight size={10} />
                        </div>
                      ) : (
                        <span className="text-gray-700 text-[9px] font-display font-black uppercase">Used</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
