import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Copy, Check, Share2, Award, Zap, Clock, Star, Gift, ArrowUpRight, Music, Megaphone } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';

export default function ArtistReferrals({ user, userData }: { user: any, userData: any }) {
  const [referrals, setReferrals] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  const referralCode = userData?.referralCode;

  const handleGenerateCode = async () => {
    if (generating) return;
    setGenerating(true);
    try {
      const { generateReferralCode, saveReferralCode } = await import('../../lib/referralUtils');
      const code = await generateReferralCode(userData?.displayName || userData?.name || 'GATI');
      await saveReferralCode(user.uid, code);
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const successfulCount = referrals.filter(r => r.status === 'successful').length;
  const pendingCount = referrals.filter(r => r.status === 'pending').length;

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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getMilestoneProgress = () => {
    // 5 referrals grant 1 month plan
    if (successfulCount < 5) return { next: 5, current: successfulCount, label: 'Free Monthly Plan', icon: <Zap size={14} /> };
    if (successfulCount < 10) return { next: 10, current: successfulCount, label: 'Custom Marketing Bonus', icon: <Megaphone size={14} /> };
    return { next: successfulCount + 5, current: successfulCount, label: 'Elite Producer Perk', icon: <Zap size={14} /> };
  };

  const progress = getMilestoneProgress();
  const progressPercent = Math.min(100, (progress.current / progress.next) * 100);
  const percent = Math.min(100, (progress.current / progress.next) * 100);

  return (
    <div className="space-y-10 py-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-display font-black text-white tracking-tighter uppercase mb-2">Referrals</h1>
          <p className="text-gray-500 font-sans text-sm">Bring your artist community to Gati and earn exclusive rewards.</p>
        </div>
        
        <div className="bg-[#ccff00]/10 border border-[#ccff00]/20 px-6 py-4 rounded-xl flex items-center gap-6">
          <div className="text-center border-r border-[#ccff00]/10 pr-6">
            <p className="text-[10px] font-display uppercase tracking-widest text-gray-500 mb-1">Successful</p>
            <p className="text-2xl font-display font-black text-[#ccff00] leading-none">{successfulCount}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-display uppercase tracking-widest text-gray-500 mb-1">Pending</p>
            <p className="text-2xl font-display font-black text-white leading-none">{pendingCount}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Referral Code Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#111] border border-[#333] p-8 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Users size={80} />
            </div>
            
            <h2 className="text-xl font-display font-black text-white uppercase mb-6 tracking-tighter">Your Invite Code</h2>
            
            <div className="bg-black border border-[#222] p-6 text-center rounded-xl mb-6 min-h-[140px] flex flex-col justify-center">
              {referralCode ? (
                <>
                  <p className="text-4xl font-mono font-black text-[#ccff00] tracking-[0.2em] mb-4 select-all">{referralCode}</p>
                  <button 
                    onClick={copyToClipboard}
                    className="w-full py-3 bg-[#222] hover:bg-white hover:text-black text-white transition-all text-[10px] font-display uppercase font-black tracking-widest flex items-center justify-center gap-2"
                  >
                    {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy Code</>}
                  </button>
                </>
              ) : (
                <div className="space-y-4">
                  <p className="text-[10px] text-gray-500 font-display uppercase tracking-widest">No code assigned yet</p>
                  <button 
                    onClick={handleGenerateCode}
                    disabled={generating}
                    className="w-full py-4 bg-[#ccff00] text-black hover:bg-white transition-all text-[10px] font-display uppercase font-black tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {generating ? 'Generating...' : 'Generate My Code'}
                  </button>
                </div>
              )}
            </div>

            <p className="text-[10px] text-gray-500 font-sans leading-relaxed text-center uppercase tracking-widest">
              Share this code manually with your artist friends. They should enter it when requesting an account.
            </p>
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

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-black border border-[#222] p-4 text-center">
                <p className="text-2xl font-display font-black text-white mb-1">{referrals.length}</p>
                <p className="text-[8px] font-sans uppercase text-gray-500 tracking-widest">Total Invited</p>
              </div>
              <div className="bg-black border border-[#222] p-4 text-center">
                <p className="text-2xl font-display font-black text-[#ccff00] mb-1">{successfulCount}</p>
                <p className="text-[8px] font-sans uppercase text-gray-500 tracking-widest">Successful</p>
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
                    No referrals yet. Share your code to get started!
                  </div>
                ) : (
                  referrals.map(ref => (
                    <div key={ref.id} className="bg-[#111] border border-[#222] p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-white font-sans">{ref.refereeEmail}</p>
                        <p className="text-[9px] text-gray-500 uppercase font-mono mt-1">Joined {new Date(ref.createdAt?.toDate()).toLocaleDateString()}</p>
                      </div>
                      <span className={`text-[8px] font-display uppercase tracking-widest px-2 py-1 font-black ${
                        ref.status === 'successful' ? 'bg-[#ccff00]/10 text-[#ccff00]' : 'bg-yellow-500/10 text-yellow-500'
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
                          <p className="text-[9px] text-gray-500 uppercase font-mono mt-1">Earned {new Date(rew.earnedAt?.toDate()).toLocaleDateString()}</p>
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
