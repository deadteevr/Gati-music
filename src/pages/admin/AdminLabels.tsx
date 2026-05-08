import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy, doc, deleteDoc, updateDoc, where, addDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { 
  Building2, 
  Search, 
  Trash2, 
  ExternalLink, 
  Users, 
  ShieldCheck,
  Zap,
  MoreVertical,
  Edit,
  Mail,
  Loader2,
  Plus,
  X,
  CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminLabels() {
  const [labels, setLabels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newLabel, setNewLabel] = useState({ name: '', ownerEmail: '' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchLabels();
  }, []);

  const fetchLabels = async () => {
    try {
      const q = query(collection(db, 'labels'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setLabels(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const deleteLabel = async (id: string, name: string) => {
    if (!window.confirm(`Delete label "${name}"? This will not delete the artists but they will become independent.`)) return;
    try {
      await deleteDoc(doc(db, 'labels', id));
      setLabels(labels.filter(l => l.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const filteredLabels = labels.filter(l => 
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateLabel = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    setSuccess(false);

    try {
      // 1. Find the owner by email
      const userQuery = query(collection(db, 'users'), where('email', '==', newLabel.ownerEmail.toLowerCase()));
      const userSnap = await getDocs(userQuery);

      if (userSnap.empty) {
        throw new Error('User not found. The owner must have a Gati account first.');
      }

      const ownerDoc = userSnap.docs[0];
      const ownerData = ownerDoc.data();

      if (ownerData.labelId) {
        throw new Error('This user is already associated with a label.');
      }

      // 2. Create the label document
      const labelsRef = collection(db, 'labels');
      const labelDoc = await addDoc(labelsRef, {
        name: newLabel.name,
        ownerUid: ownerDoc.id,
        artistUids: [],
        managerUids: [ownerDoc.id],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        subscription: {
          planType: 'Label Pro',
          status: 'Active',
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year by default for admin created labels
        }
      });

      // 3. Update the user with labelId and role
      await updateDoc(doc(db, 'users', ownerDoc.id), {
        labelId: labelDoc.id,
        role: 'label_owner',
        managedByLabelName: newLabel.name
      });

      setSuccess(true);
      setTimeout(() => {
        setIsCreateModalOpen(false);
        setNewLabel({ name: '', ownerEmail: '' });
        setSuccess(false);
        fetchLabels();
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Failed to create label');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-black uppercase tracking-tight">Label <span className="text-[#9d4edd]">Management</span></h1>
          <p className="text-gray-500 text-xs uppercase font-bold tracking-widest mt-1">{labels.length} Registered Labels</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-[#9d4edd] text-white px-6 py-3 rounded-xl font-display font-black uppercase text-xs tracking-widest hover:bg-white hover:text-black transition-all"
        >
          <Plus size={16} /> Create Label
        </button>
      </div>

      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-[#111] border border-white/10 rounded-[32px] p-8 overflow-hidden"
            >
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-[#9d4edd]/20 text-[#9d4edd] rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Building2 size={32} />
                </div>
                <h2 className="text-2xl font-display font-black uppercase tracking-tight mb-2">New Label</h2>
                <p className="text-gray-500 text-sm">Onboard a new music label and assign an owner.</p>
              </div>

              <form onSubmit={handleCreateLabel} className="space-y-6">
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-black text-gray-500 mb-2 block">Label Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Speed Records"
                    value={newLabel.name}
                    onChange={(e) => setNewLabel({...newLabel, name: e.target.value})}
                    className="w-full bg-black/30 border border-white/10 rounded-xl py-4 px-6 text-sm focus:outline-none focus:border-[#9d4edd] transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest font-black text-gray-500 mb-2 block">Owner Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                    <input 
                      type="email" 
                      placeholder="owner@example.com"
                      value={newLabel.ownerEmail}
                      onChange={(e) => setNewLabel({...newLabel, ownerEmail: e.target.value})}
                      className="w-full bg-black/30 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-[#9d4edd] transition-colors"
                      required
                    />
                  </div>
                  <p className="mt-2 text-[10px] text-gray-500 italic">
                    Note: The owner must have logged into Gati at least once before they can be assigned to a label.
                  </p>
                </div>

                {error && (
                  <div className="p-4 bg-red-500/10 text-red-500 rounded-xl text-xs font-bold border border-red-500/20">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="p-4 bg-green-500/10 text-green-500 rounded-xl text-xs font-bold border border-green-500/20 flex items-center gap-2">
                    <CheckCircle2 size={16} /> Label created successfully!
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={creating || success}
                  className="w-full py-4 bg-[#9d4edd] text-white font-display font-black uppercase tracking-widest rounded-xl hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {creating ? <Loader2 size={20} className="animate-spin" /> : <span>Onboard Label</span>}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
        <input 
          type="text" 
          placeholder="Search labels by name or id..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-[#111] border border-[#333] rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-[#9d4edd]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-48 bg-[#111] animate-pulse rounded-2xl border border-[#333]" />
          ))
        ) : filteredLabels.map((label) => (
          <div key={label.id} className="bg-[#111] border border-[#333] rounded-3xl p-6 hover:border-[#9d4edd]/50 transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <Building2 size={100} className="text-[#9d4edd]" />
            </div>

            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-gray-500 border border-white/5">
                {label.logoUrl ? (
                  <img src={label.logoUrl} className="w-full h-full object-cover rounded-xl" alt="" />
                ) : (
                  <Building2 size={24} />
                )}
              </div>
              <div className="overflow-hidden">
                <h3 className="font-display font-black uppercase text-white truncate">{label.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-500 font-mono italic">ID: {label.id}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
              <div className="bg-black/40 p-3 rounded-2xl border border-white/5">
                <div className="text-[10px] uppercase text-gray-500 font-bold mb-1 flex items-center gap-1"><Users size={10} /> Artists</div>
                <div className="text-lg font-display font-black text-white">{label.artistUids?.length || 0}</div>
              </div>
              <div className="bg-black/40 p-3 rounded-2xl border border-white/5">
                <div className="text-[10px] uppercase text-gray-500 font-bold mb-1 flex items-center gap-1"><Zap size={10} /> Plan</div>
                <div className="text-[10px] font-display font-black text-[#ccff00] uppercase truncate">Label Pro</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#222] relative z-10">
               <div className="text-[10px] text-gray-600 font-sans uppercase font-bold tracking-widest">
                 Created {label.createdAt ? format(label.createdAt.toDate(), 'MMM dd, yyyy') : 'N/A'}
               </div>
               <div className="flex gap-2">
                 <button className="p-2 text-gray-500 hover:text-white transition-colors"><Edit size={16} /></button>
                 <button 
                  onClick={() => deleteLabel(label.id, label.name)}
                  className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                 >
                   <Trash2 size={16} />
                 </button>
                 <Link to={`/label`} className="p-2 text-[#9d4edd] hover:text-white transition-colors"><ExternalLink size={16} /></Link>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
