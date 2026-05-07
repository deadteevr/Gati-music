import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, writeBatch, serverTimestamp, getDocs, where, addDoc } from 'firebase/firestore';
import { Users, Search, Filter, Gift, Zap, ShieldCheck, ArrowRight, Trash2, CheckCircle2, History, Plus } from 'lucide-react';

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

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'referrals', id), { status });
    } catch (e) {
      console.error(e);
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
    r.referrerUid.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.refereeEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-black text-white tracking-tighter uppercase">Referral Network</h1>
          <p className="text-gray-500 font-sans text-xs">Monitor artist growth and distribute rewards.</p>
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
          <p className="text-[10px] font-display uppercase tracking-widest text-gray-500 mb-1">Total Referrals</p>
          <p className="text-3xl font-display font-black text-white">{referrals.length}</p>
        </div>
        <div className="bg-[#111] border border-[#222] p-6 rounded-xl text-center">
          <p className="text-[10px] font-display uppercase tracking-widest text-[#ccff00] mb-1">Successful</p>
          <p className="text-3xl font-display font-black text-[#ccff00]">{referrals.filter(r => r.status === 'successful').length}</p>
        </div>
        <div className="bg-[#111] border border-[#222] p-6 rounded-xl text-center">
          <p className="text-[10px] font-display uppercase tracking-widest text-yellow-500 mb-1">Pending</p>
          <p className="text-3xl font-display font-black text-yellow-500">{referrals.filter(r => r.status === 'pending').length}</p>
        </div>
        <div className="bg-[#111] border border-[#222] p-6 rounded-xl text-center">
          <p className="text-[10px] font-display uppercase tracking-widest text-blue-500 mb-1">Active Rewards</p>
          <p className="text-3xl font-display font-black text-blue-500">-</p>
        </div>
      </div>

      <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#222] bg-[#0a0a0a]">
                <th className="p-4 text-[10px] font-display uppercase tracking-widest text-gray-500">Referrer (UID)</th>
                <th className="p-4 text-[10px] font-display uppercase tracking-widest text-gray-500">Referee</th>
                <th className="p-4 text-[10px] font-display uppercase tracking-widest text-gray-500">Status</th>
                <th className="p-4 text-[10px] font-display uppercase tracking-widest text-gray-500">Requirements</th>
                <th className="p-4 text-[10px] font-display uppercase tracking-widest text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-gray-600 animate-pulse text-xs uppercase font-display tracking-widest">Loading Network...</td>
                </tr>
              ) : filteredReferrals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-gray-600 text-xs font-sans italic">No data found.</td>
                </tr>
              ) : (
                filteredReferrals.map(r => (
                  <tr key={r.id} className="border-b border-[#222] hover:bg-[#1a1a1a] transition-colors">
                    <td className="p-4">
                      <div className="text-[10px] font-mono text-gray-400">{r.referrerUid}</div>
                      <div className="text-[8px] text-gray-600 mt-1 uppercase font-display">{new Date(r.createdAt?.toDate()).toLocaleDateString()}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-xs font-bold text-white font-sans">{r.refereeEmail}</div>
                      {r.refereeUid && <div className="text-[9px] text-gray-500 font-mono mt-0.5">{r.refereeUid}</div>}
                    </td>
                    <td className="p-4">
                      <span className={`text-[9px] font-display uppercase tracking-widest px-2 py-1 font-black rounded ${
                        r.status === 'successful' ? 'bg-[#ccff00]/10 text-[#ccff00]' : 'bg-yellow-500/10 text-yellow-500'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <span className={`text-[8px] px-1.5 py-0.5 rounded border ${r.hasUploaded ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-gray-800 border-gray-700 text-gray-600'}`}>
                          Uploaded
                        </span>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded border ${r.hasPaid ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-gray-800 border-gray-700 text-gray-600'}`}>
                          Paid
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      {r.status === 'pending' && (
                        <button 
                          onClick={() => handleStatusUpdate(r.id, 'successful')}
                          className="text-[9px] font-display uppercase tracking-widest font-black text-[#9d4edd] hover:text-[#ccff00] transition-colors"
                        >
                          Mark Success
                        </button>
                      )}
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
