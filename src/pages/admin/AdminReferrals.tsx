import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, writeBatch, serverTimestamp, getDocs, where, addDoc } from 'firebase/firestore';
import { Users, Search, Filter, Gift, Zap, ShieldCheck, ArrowRight, Trash2, CheckCircle2, History, Plus, Instagram, Mail, Phone, ExternalLink } from 'lucide-react';

export default function AdminReferrals() {
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [newReward, setNewReward] = useState({ uid: '', type: 'free_song' });

  useEffect(() => {
    const q = query(collection(db, 'referrals'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setReferrals(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleStatusUpdate = async (id: string, currentStatus: string, newStatus: string, referrerUid: string) => {
    try {
      await updateDoc(doc(db, 'referrals', id), { 
        status: newStatus,
        updatedAt: serverTimestamp()
      });

      // Automatically grant a reward if status moves to Reward Unlocked
      if (newStatus === 'Reward Unlocked' && currentStatus !== 'Reward Unlocked') {
        await addDoc(collection(db, 'rewards'), {
          uid: referrerUid,
          type: 'free_song', // Default reward for a successful referral
          status: 'active',
          earnedAt: serverTimestamp()
        });
      }
    } catch (e) {
      console.error(e);
      alert("Error updating status: " + (e as any).message);
    }
  };

  const handleAddReward = async () => {
    if (!newReward.uid) return;
    try {
      await addDoc(collection(db, 'rewards'), {
        uid: newReward.uid,
        type: newReward.type,
        status: 'active',
        earnedAt: serverTimestamp()
      });
      setModalOpen(false);
      setNewReward({ uid: '', type: 'free_song' });
    } catch (e) {
      console.error(e);
    }
  };

  const filteredReferrals = referrals.filter(r => 
    (r.referrerName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (r.artistName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.instagramUsername || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: any) => {
    if (!date) return 'Recently';
    if (typeof date === 'object' && date.toDate) return date.toDate().toLocaleDateString();
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-black text-white tracking-tighter uppercase">Referral Network</h1>
          <p className="text-gray-500 font-sans text-xs">Monitor artist growth and distribute rewards manually.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
            <input 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search referrals..."
              className="w-full md:w-64 bg-[#111] border border-[#222] text-white pl-10 pr-4 py-2 text-xs font-sans focus:border-[#9d4edd] outline-none"
            />
          </div>
          <button 
            onClick={() => setModalOpen(true)}
            className="bg-[#9d4edd] text-white px-4 py-2 text-[10px] font-display uppercase font-black tracking-widest flex items-center gap-2 hover:bg-white hover:text-black transition-all"
          >
            <Plus size={14} /> Add Reward
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="bg-[#111] border border-[#222] p-6 rounded-xl text-center">
          <p className="text-[10px] font-display uppercase tracking-widest text-gray-500 mb-1">Total Submissions</p>
          <p className="text-3xl font-display font-black text-white">{referrals.length}</p>
        </div>
        <div className="bg-[#111] border border-[#222] p-6 rounded-xl text-center">
          <p className="text-[10px] font-display uppercase tracking-widest text-[#ccff00] mb-1">Unlocked</p>
          <p className="text-3xl font-display font-black text-[#ccff00]">{referrals.filter(r => r.status === 'Reward Unlocked').length}</p>
        </div>
        <div className="bg-[#111] border border-[#222] p-6 rounded-xl text-center">
          <p className="text-[10px] font-display uppercase tracking-widest text-blue-500 mb-1">Approved</p>
          <p className="text-3xl font-display font-black text-blue-500">{referrals.filter(r => r.status === 'Approved').length}</p>
        </div>
        <div className="bg-[#111] border border-[#222] p-6 rounded-xl text-center">
          <p className="text-[10px] font-display uppercase tracking-widest text-yellow-500 mb-1">Pending</p>
          <p className="text-3xl font-display font-black text-yellow-500">{referrals.filter(r => r.status === 'Pending').length}</p>
        </div>
      </div>

      <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#222] bg-[#0a0a0a]">
                <th className="p-4 text-[10px] font-display uppercase tracking-widest text-gray-500">Referrer</th>
                <th className="p-4 text-[10px] font-display uppercase tracking-widest text-gray-500">Referred Artist</th>
                <th className="p-4 text-[10px] font-display uppercase tracking-widest text-gray-500">Contact Details</th>
                <th className="p-4 text-[10px] font-display uppercase tracking-widest text-gray-500">Status</th>
                <th className="p-4 text-[10px] font-display uppercase tracking-widest text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-gray-600 animate-pulse text-xs uppercase font-display tracking-widest">Loading Submissions...</td>
                </tr>
              ) : filteredReferrals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-gray-600 text-xs font-sans italic">No referral submissions found.</td>
                </tr>
              ) : (
                filteredReferrals.map(r => (
                  <tr key={r.id} className="border-b border-[#222] hover:bg-[#1a1a1a] transition-colors">
                    <td className="p-4">
                      <div className="text-xs font-bold text-white font-sans">{r.referrerName}</div>
                      <div className="text-[9px] font-mono text-gray-500 mt-0.5">{r.referrerUid}</div>
                      <div className="text-[8px] text-gray-600 mt-1 uppercase font-display">{formatDate(r.createdAt)}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-xs font-bold text-[#ccff00] font-sans">{r.artistName}</div>
                      <div className="flex items-center gap-1.5 mt-1 text-gray-400">
                        <Instagram size={10} />
                        <span className="text-[10px] font-mono">@{r.instagramUsername}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Mail size={12} />
                          <span className="text-[10px] font-sans">{r.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Phone size={12} />
                          <span className="text-[10px] font-sans">{r.whatsapp}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`text-[9px] font-display uppercase tracking-widest px-2 py-1 font-black rounded ${
                        r.status === 'Reward Unlocked' ? 'bg-[#ccff00]/10 text-[#ccff00]' : 
                        r.status === 'Approved' ? 'bg-blue-500/10 text-blue-500' :
                        'bg-yellow-500/10 text-yellow-500'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        {r.status === 'Pending' && (
                          <button 
                            onClick={() => handleStatusUpdate(r.id, r.status, 'Approved', r.referrerUid)}
                            className="bg-blue-500/10 text-blue-500 px-3 py-1.5 text-[8px] font-display uppercase font-black tracking-widest hover:bg-blue-500 hover:text-white transition-all rounded"
                          >
                            Approve
                          </button>
                        )}
                        {(r.status === 'Pending' || r.status === 'Approved') && (
                          <button 
                            onClick={() => handleStatusUpdate(r.id, r.status, 'Reward Unlocked', r.referrerUid)}
                            className="bg-[#ccff00]/10 text-[#ccff00] px-3 py-1.5 text-[8px] font-display uppercase font-black tracking-widest hover:bg-[#ccff00] hover:text-black transition-all rounded flex items-center gap-1"
                          >
                            <Gift size={10} /> Unlock Reward
                          </button>
                        )}
                        <button 
                          onClick={async () => {
                            if (confirm("Delete this referral submission?")) {
                              await deleteDoc(doc(db, 'referrals', r.id));
                            }
                          }}
                          className="bg-red-500/10 text-red-500 p-1.5 hover:bg-red-500 hover:text-white transition-all rounded"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Reward Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-[#111] border border-[#333] p-8 rounded-2xl max-w-md w-full shadow-2xl">
            <h2 className="text-xl font-display font-black text-white uppercase tracking-tighter mb-6">Manually Add Reward</h2>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-display uppercase tracking-widest text-gray-500 font-black">Artist UID</label>
                <input 
                  value={newReward.uid}
                  onChange={e => setNewReward({...newReward, uid: e.target.value})}
                  className="w-full bg-black border border-[#222] text-white p-3 text-xs font-mono outline-none focus:border-[#9d4edd]"
                  placeholder="Paste Artist UID here"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-display uppercase tracking-widest text-gray-500 font-black">Reward Type</label>
                <select 
                  value={newReward.type}
                  onChange={e => setNewReward({...newReward, type: e.target.value})}
                  className="w-full bg-black border border-[#222] text-white p-3 text-xs outline-none focus:border-[#9d4edd]"
                >
                  <option value="free_song">1 Free Song Release</option>
                  <option value="free_plan_month">1 Month Free Plan</option>
                </select>
              </div>

              <div className="flex gap-4 pt-4 text-center">
                <button 
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 text-gray-500 font-display uppercase tracking-widest text-[10px] font-black hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddReward}
                  className="flex-1 py-3 bg-[#9d4edd] text-white font-display uppercase tracking-widest text-[10px] font-black hover:bg-white hover:text-black transition-all"
                >
                  Grant Reward
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
