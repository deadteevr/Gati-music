import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, updateDoc, addDoc, getDocs, where, Timestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { Search, Filter, Edit2, Calendar, Zap, ShieldAlert, History, X } from 'lucide-react';

export default function AdminSubscriptions() {
  const [loading, setLoading] = useState(true);
  const [artists, setArtists] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all"); // all, active, expired, free
  const [editingArtist, setEditingArtist] = useState<any>(null);
  const [showLogId, setShowLogId] = useState<string | null>(null);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', '==', 'artist'));
    const unsub = onSnapshot(q, (snap) => {
      setArtists(snap.docs.map(d => ({ uid: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  const fetchLogs = async (uid: string) => {
    try {
      const q = query(collection(db, 'activity_logs'), where('uid', '==', uid));
      const snap = await getDocs(q);
      setLogs(snap.docs.map(d => d.data()).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      setShowLogId(uid);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateSubscription = async (uid: string, data: any) => {
    try {
      const expiryDate = new Date();
      if (data.planType === 'Monthly') expiryDate.setMonth(expiryDate.getMonth() + 1);
      else if (data.planType === 'Yearly') expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      else if (data.planType === 'Basic') expiryDate.setMonth(expiryDate.getMonth() + 1); // Basic is monthly in this context

      const subData = {
        planType: data.planType,
        startDate: Timestamp.now(),
        expiryDate: Timestamp.fromDate(expiryDate),
        status: 'Active',
        paymentStatus: data.paymentStatus || 'Manual',
        uploadCount: 0 // Reset or initialize count on new plan assignment
      };

      await updateDoc(doc(db, 'users', uid), {
        subscription: subData
      });

      // Log activity
      await addDoc(collection(db, 'activity_logs'), {
        uid,
        type: 'plan_purchased',
        message: `Admin manually assigned ${data.planType} plan.`,
        timestamp: new Date().toISOString()
      });

      setEditingArtist(null);
      alert("Subscription updated successfully!");
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'users');
    }
  };

  const filteredArtists = artists.filter(a => {
    const matchesSearch = a.name?.toLowerCase().includes(searchTerm.toLowerCase()) || a.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const sub = a.subscription;
    const isExpired = sub?.expiryDate && new Date() > (sub.expiryDate instanceof Timestamp ? sub.expiryDate.toDate() : new Date(sub.expiryDate));
    
    if (filterType === 'active') return matchesSearch && sub?.status === 'Active' && !isExpired;
    if (filterType === 'expired') return matchesSearch && isExpired;
    if (filterType === 'free') return matchesSearch && (!sub || sub.planType === 'Free');
    return matchesSearch;
  });

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-black text-white uppercase tracking-tighter">Subscriptions</h1>
          <p className="text-gray-500 text-sm font-sans">Manage artist plans and access control.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Search by artist or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#111] border border-[#333] pl-10 pr-4 py-3 text-white font-sans text-sm focus:border-[#9d4edd] outline-none"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'active', 'expired', 'free'].map(type => (
            <button 
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 font-display uppercase tracking-widest text-[10px] font-bold border transition-all ${
                filterType === type ? 'bg-[#9d4edd] border-[#9d4edd] text-white' : 'border-[#333] text-gray-500 hover:border-gray-500'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-[#111] border border-[#333]"></div>)}
          </div>
        ) : filteredArtists.length === 0 ? (
          <div className="p-10 text-center border border-dashed border-[#333] text-gray-500 font-sans">No artists found matching your filters.</div>
        ) : (
          filteredArtists.map(artist => {
            const sub = artist.subscription;
            const isExpired = sub?.expiryDate && new Date() > (sub.expiryDate instanceof Timestamp ? sub.expiryDate.toDate() : new Date(sub.expiryDate));
            
            return (
              <div key={artist.uid} className="bg-[#111] border border-[#333] p-6 hover:border-[#9d4edd]/50 transition-colors">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-[#222] rounded-full flex items-center justify-center text-[#9d4edd] font-display font-black text-xl">
                      {artist.name?.charAt(0) || 'A'}
                    </div>
                    <div>
                      <h3 className="text-white font-display uppercase font-bold tracking-tight">{artist.name || 'Unknown Artist'}</h3>
                      <p className="text-xs text-gray-500 font-sans mb-2">{artist.email}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div>
                          <p className="text-[9px] uppercase tracking-widest text-gray-600 mb-1">Plan / Status</p>
                          <div className="flex flex-wrap gap-2">
                            <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-widest ${
                              sub?.planType === 'Free' || !sub ? 'bg-gray-800 text-gray-400' : 'bg-[#9d4edd]/20 text-[#9d4edd]'
                            }`}>
                              {sub?.planType || 'Free'}
                            </span>
                            <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-widest ${
                              isExpired ? 'bg-red-500/20 text-red-500' : sub?.status === 'Active' ? 'bg-[#ccff00]/20 text-[#ccff00]' : 'bg-gray-800 text-gray-400'
                            }`}>
                              {isExpired ? 'Expired' : sub?.status || 'No Status'}
                            </span>
                          </div>
                        </div>

                        <div>
                          <p className="text-[9px] uppercase tracking-widest text-gray-600 mb-1">Upload Usage</p>
                          <span className={`text-[10px] font-bold ${sub?.planType === 'Basic' && (sub?.uploadCount || 0) >= 1 ? 'text-red-500' : 'text-white'}`}>
                            {sub?.planType === 'Basic' ? `${sub?.uploadCount || 0}/1` : 'Unlimited'}
                          </span>
                        </div>

                        <div>
                          <p className="text-[9px] uppercase tracking-widest text-gray-600 mb-1">Start Date</p>
                          <span className="text-[10px] text-gray-400">
                            {sub?.startDate ? (sub.startDate instanceof Timestamp ? sub.startDate.toDate().toLocaleDateString() : new Date(sub.startDate).toLocaleDateString()) : 'N/A'}
                          </span>
                        </div>

                        <div>
                          <p className="text-[9px] uppercase tracking-widest text-gray-600 mb-1">Expiry Date</p>
                          <span className={`text-[10px] ${isExpired ? 'text-red-500' : 'text-gray-400'}`}>
                            {sub?.expiryDate ? (sub.expiryDate instanceof Timestamp ? sub.expiryDate.toDate().toLocaleDateString() : new Date(sub.expiryDate).toLocaleDateString()) : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between items-end gap-4 min-w-[200px]">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => fetchLogs(artist.uid)}
                        className="flex items-center gap-2 px-3 py-2 bg-black border border-[#333] text-[9px] font-display uppercase tracking-widest font-bold text-gray-400 hover:text-white transition-colors"
                      >
                        <History size={12} /> Activity
                      </button>
                      <button 
                        onClick={() => setEditingArtist(artist)}
                        className="flex items-center gap-2 px-3 py-2 bg-[#9d4edd] text-white text-[9px] font-display uppercase tracking-widest font-bold hover:bg-white hover:text-black transition-colors"
                      >
                        <Edit2 size={12} /> Manage Plan
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Manual Assign Modal */}
      {editingArtist && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111] border border-[#333] w-full max-w-md p-8 relative">
            <button 
              onClick={() => setEditingArtist(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-display font-black text-white uppercase tracking-tighter mb-6">Manage Subscription</h2>
            <div className="mb-6 p-4 bg-black/50 border border-[#333]">
              <p className="text-xs text-gray-500 font-sans uppercase mb-1">Editing for:</p>
              <p className="text-white font-display font-bold uppercase">{editingArtist.name}</p>
              <p className="text-[10px] text-gray-400">{editingArtist.email}</p>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleUpdateSubscription(editingArtist.uid, {
                planType: formData.get('planType'),
                paymentStatus: formData.get('paymentStatus')
              });
            }} className="space-y-6">
              <div>
                <label className="block text-[10px] font-display uppercase tracking-widest text-gray-500 mb-2">Select Plan Type</label>
                <select name="planType" className="w-full bg-black border border-[#333] p-3 text-white text-sm outline-none focus:border-[#9d4edd]">
                  <option value="Basic">Basic (Monthly)</option>
                  <option value="Monthly">Monthly Premium</option>
                  <option value="Yearly">Yearly Pro</option>
                  <option value="Free">Free / Cancel</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-display uppercase tracking-widest text-gray-500 mb-2">Payment Source</label>
                <select name="paymentStatus" className="w-full bg-black border border-[#333] p-3 text-white text-sm outline-none focus:border-[#9d4edd]">
                  <option value="Manual">Manual Override</option>
                  <option value="Paid">Verified Payment</option>
                  <option value="Pending">Pending (Trial)</option>
                </select>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full bg-[#9d4edd] text-white py-4 font-display font-black uppercase tracking-[0.2em] text-xs hover:bg-white hover:text-black transition-all"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Activity Logs Modal */}
      {showLogId && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111] border border-[#333] w-full max-w-2xl p-8 relative max-h-[80vh] flex flex-col">
            <button 
              onClick={() => setShowLogId(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-display font-black text-white uppercase tracking-tighter mb-6">Activity Timeline</h2>
            
            <div className="flex-1 overflow-y-auto pr-4 space-y-4">
              {logs.length === 0 ? (
                <p className="text-center text-gray-500 py-10 font-sans">No logs recorded for this artist yet.</p>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="border-l-2 border-[#9d4edd] pl-4 py-2 bg-black/20">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-widest ${
                        log.type === 'song_uploaded' ? 'bg-blue-500 text-white' : 'bg-[#9d4edd] text-white'
                      }`}>
                        {log.type.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 font-sans">{log.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
