import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, addDoc, updateDoc, deleteDoc, serverTimestamp, getDocs, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  Youtube, 
  Instagram, 
  Music, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Save,
  Loader2,
  TrendingUp,
  Users,
  Target,
  BarChart3,
  MousePointer2,
  PieChart
} from 'lucide-react';

export default function AdminMarketing() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    uid: '',
    artistName: '',
    songTitle: '',
    type: 'YouTube',
    budget: 0,
    status: 'active',
    metrics: {
      impressions: 0,
      views: 0,
      clicks: 0,
      conversion: 0,
      roi: 0
    }
  });

  useEffect(() => {
    // Fetch campaigns
    const q = query(collection(db, 'campaigns'));
    const unsub = onSnapshot(q, (snap) => {
      const camps = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCampaigns(camps);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'campaigns', false);
      setLoading(false);
    });

    // Fetch artists for the dropdown
    const fetchArtists = async () => {
      try {
        const artistSnap = await getDocs(collection(db, 'users'));
        const artistsData = artistSnap.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
        setArtists(artistsData);
      } catch (err) {
        console.error("Error fetching artists:", err);
      }
    };
    fetchArtists();

    return unsub;
  }, []);

  const handleSave = async (id?: string) => {
    if (!formData.uid) return alert("Please select an artist.");
    if (!formData.songTitle) return alert("Please enter a song title.");
    
    setSaving(true);
    try {
      const dataToSave = {
        ...formData,
        budget: Number(formData.budget) || 0,
        metrics: {
          impressions: Number(formData.metrics.impressions) || 0,
          views: Number(formData.metrics.views) || 0,
          clicks: Number(formData.metrics.clicks) || 0,
          conversion: Number(formData.metrics.conversion) || 0,
          roi: Number(formData.metrics.roi) || 0
        }
      };

      if (id) {
        await updateDoc(doc(db, 'campaigns', id), {
          ...dataToSave,
          updatedAt: serverTimestamp()
        });
        setEditingId(null);
      } else {
        await addDoc(collection(db, 'campaigns'), {
          ...dataToSave,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        setIsAdding(false);
      }
      setFormData({
        uid: '',
        artistName: '',
        songTitle: '',
        type: 'YouTube',
        budget: 0,
        status: 'active',
        metrics: { impressions: 0, views: 0, clicks: 0, conversion: 0, roi: 0 }
      });
      alert("Campaign saved successfully!");
    } catch (error) {
      console.error("Error saving campaign:", error);
      handleFirestoreError(error, OperationType.WRITE, 'campaigns');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;
    try {
      await deleteDoc(doc(db, 'campaigns', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'campaigns');
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'campaigns', id), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `campaigns/${id}`);
    }
  };

  const filteredCampaigns = campaigns.filter(c => {
    const matchesSearch = c.artistName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         c.songTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || c.type === filterType;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-[#9d4edd]" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-black text-white uppercase tracking-tighter">Marketing Manager</h1>
          <p className="text-gray-500 font-sans text-sm">Manage promotion campaigns and update metrics for artists.</p>
        </div>
        <button 
          onClick={() => {
            setIsAdding(true);
            setEditingId(null);
            setFormData({
              uid: '', artistName: '', songTitle: '', type: 'YouTube', budget: 0, status: 'active',
              metrics: { impressions: 0, views: 0, clicks: 0, conversion: 0, roi: 0 }
            });
          }}
          className="bg-[#9d4edd] text-white px-6 py-3 font-display uppercase font-black tracking-widest text-[10px] flex items-center gap-2 hover:bg-[#8b5cf6] transition-colors rounded shadow-lg shadow-[#9d4edd]/20"
        >
          <Plus size={14} /> New Campaign
        </button>
      </div>

      <div className="grid md:grid-cols-4 gap-4 bg-[#111] p-6 border border-[#222]">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input 
            type="text" 
            placeholder="Search by artist or song..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black border border-[#333] pl-10 pr-4 py-3 text-sm text-white font-sans focus:outline-none focus:border-[#9d4edd] transition-colors"
          />
        </div>
        <div>
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full bg-black border border-[#333] px-4 py-3 text-sm text-white font-display uppercase tracking-widest focus:outline-none focus:border-[#9d4edd] transition-colors"
          >
            <option value="all">All Types</option>
            <option value="YouTube">YouTube</option>
            <option value="Reels">Reels</option>
            <option value="Spotify">Spotify</option>
          </select>
        </div>
        <div className="bg-black border border-[#333] px-4 py-3 flex items-center justify-between">
           <span className="text-[10px] text-gray-500 uppercase tracking-widest">Active</span>
           <span className="text-white font-display font-black">{campaigns.filter(c => c.status === 'active').length}</span>
        </div>
      </div>

      <AnimatePresence>
        {(isAdding || editingId) && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-[#111] border border-[#9d4edd]/30 p-8 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4">
               <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="text-gray-500 hover:text-white transition-colors"><X size={20} /></button>
            </div>
            <h2 className="text-xl font-display font-black text-white uppercase tracking-widest mb-8 flex items-center gap-3">
              <Plus className="text-[#9d4edd]" size={20} /> {editingId ? 'Edit Campaign' : 'Create Campaign'}
            </h2>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
               <div className="flex flex-col gap-2">
                 <label className="text-[10px] text-gray-500 uppercase tracking-widest">Select Artist</label>
                 <select 
                    value={formData.uid}
                    onChange={(e) => {
                      const artist = artists.find(a => a.uid === e.target.value);
                      setFormData({...formData, uid: e.target.value, artistName: artist?.displayName || artist?.email || ''});
                    }}
                    className="bg-black border border-[#333] p-3 text-sm text-white"
                  >
                   <option value="">Choose an artist...</option>
                   {artists.map(a => (
                     <option key={a.uid} value={a.uid}>{a.displayName} ({a.email})</option>
                   ))}
                 </select>
               </div>
               <div className="flex flex-col gap-2">
                 <label className="text-[10px] text-gray-500 uppercase tracking-widest">Song Title</label>
                 <input 
                   type="text" 
                   value={formData.songTitle}
                   onChange={(e) => setFormData({...formData, songTitle: e.target.value})}
                   className="bg-black border border-[#333] p-3 text-sm text-white font-sans"
                 />
               </div>
               <div className="flex flex-col gap-2">
                 <label className="text-[10px] text-gray-500 uppercase tracking-widest">Campaign Type</label>
                 <select 
                   value={formData.type}
                   onChange={(e) => setFormData({...formData, type: e.target.value})}
                   className="bg-black border border-[#333] p-3 text-sm text-white font-display uppercase tracking-widest"
                 >
                   <option value="YouTube">YouTube</option>
                   <option value="Reels">Reels</option>
                   <option value="Spotify">Spotify</option>
                 </select>
               </div>
            </div>

            <div className="grid md:grid-cols-4 gap-6 mb-8">
               <div className="flex flex-col gap-2">
                 <label className="text-[10px] text-gray-500 uppercase tracking-widest">Budget (₹)</label>
                 <input 
                   type="number" 
                   value={formData.budget}
                   onChange={(e) => setFormData({...formData, budget: parseInt(e.target.value)})}
                   className="bg-black border border-[#333] p-3 text-sm text-white font-sans"
                 />
               </div>
               <div className="flex flex-col gap-2">
                 <label className="text-[10px] text-gray-500 uppercase tracking-widest">Status</label>
                 <select 
                   value={formData.status}
                   onChange={(e) => setFormData({...formData, status: e.target.value})}
                   className="bg-black border border-[#333] p-3 text-sm text-white font-display uppercase tracking-widest"
                 >
                   <option value="active">Active</option>
                   <option value="pending">Pending</option>
                   <option value="completed">Completed</option>
                 </select>
               </div>
            </div>

            <div className="border-t border-[#222] pt-8 mb-8">
               <h3 className="text-xs font-display font-bold text-gray-500 uppercase tracking-widest mb-6">Metrics & Performance</h3>
               <div className="grid md:grid-cols-5 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] text-gray-500 uppercase tracking-widest">Impressions</label>
                    <input 
                      type="number" 
                      value={formData.metrics.impressions}
                      onChange={(e) => setFormData({...formData, metrics: {...formData.metrics, impressions: parseInt(e.target.value)}})}
                      className="bg-black border border-[#333] p-2 text-xs text-white"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] text-gray-500 uppercase tracking-widest">Views</label>
                    <input 
                      type="number" 
                      value={formData.metrics.views}
                      onChange={(e) => setFormData({...formData, metrics: {...formData.metrics, views: parseInt(e.target.value)}})}
                      className="bg-black border border-[#333] p-2 text-xs text-white text-[#ccff00]"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] text-gray-500 uppercase tracking-widest">Clicks</label>
                    <input 
                      type="number" 
                      value={formData.metrics.clicks}
                      onChange={(e) => setFormData({...formData, metrics: {...formData.metrics, clicks: parseInt(e.target.value)}})}
                      className="bg-black border border-[#333] p-2 text-xs text-white"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] text-gray-500 uppercase tracking-widest">Conv %</label>
                    <input 
                      type="number" 
                      value={formData.metrics.conversion}
                      onChange={(e) => setFormData({...formData, metrics: {...formData.metrics, conversion: parseFloat(e.target.value)}})}
                      className="bg-black border border-[#333] p-2 text-xs text-white"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] text-gray-500 uppercase tracking-widest">ROI (x)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={formData.metrics.roi}
                      onChange={(e) => setFormData({...formData, metrics: {...formData.metrics, roi: parseFloat(e.target.value)}})}
                      className="bg-black border border-[#333] p-2 text-xs text-white text-[#9d4edd]"
                    />
                  </div>
               </div>
            </div>

            <div className="flex justify-end gap-4">
              <button 
                onClick={() => { setIsAdding(false); setEditingId(null); }}
                className="px-8 py-3 bg-[#222] text-white font-display uppercase font-black tracking-widest text-[10px]"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleSave(editingId || undefined)}
                disabled={saving}
                className="px-8 py-3 bg-[#ccff00] text-black font-display uppercase font-black tracking-widest text-[10px] flex items-center gap-2 hover:bg-white transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                {editingId ? 'Update Campaign' : 'Save Campaign'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {filteredCampaigns.length > 0 ? filteredCampaigns.map((c) => (
          <div key={c.id} className="bg-[#111] border border-[#222] p-6 hover:border-[#333] transition-colors group">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 bg-black border border-[#333] rounded-sm ${c.type === 'YouTube' ? 'text-[#FF0000]' : c.type === 'Reels' ? 'text-[#E1306C]' : 'text-[#1DB954]'}`}>
                  {c.type === 'YouTube' ? <Youtube size={20} /> : c.type === 'Reels' ? <Instagram size={20} /> : <Music size={20} />}
                </div>
                <div>
                  <h3 className="text-white font-display uppercase font-black text-lg leading-none mb-1">{c.songTitle}</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-[#ccff00] font-sans font-bold">{c.artistName}</span>
                    <span className="text-[10px] text-gray-600 uppercase tracking-widest">•</span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest">{c.type} Campaign</span>
                    <select 
                      value={c.status}
                      onChange={(e) => handleStatusUpdate(c.id, e.target.value)}
                      className={`text-[8px] px-1.5 py-0.5 rounded uppercase font-bold tracking-widest bg-black border border-[#333] cursor-pointer focus:outline-none ${
                        c.status === 'active' ? 'text-[#ccff00] border-[#ccff00]/50' : 
                        c.status === 'completed' ? 'text-blue-400 border-blue-400/50' : 
                        'text-gray-400 border-gray-700'
                      }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 md:grid-cols-5 gap-8">
                 <div className="text-center">
                    <p className="text-[8px] text-gray-600 uppercase tracking-widest mb-1">Budget</p>
                    <p className="text-sm font-display font-black text-white">₹{c.budget}</p>
                 </div>
                 <div className="text-center">
                    <p className="text-[8px] text-gray-600 uppercase tracking-widest mb-1">Views</p>
                    <p className="text-sm font-display font-black text-[#ccff00]">{c.metrics?.views?.toLocaleString() || 0}</p>
                 </div>
                 <div className="text-center">
                    <p className="text-[8px] text-gray-600 uppercase tracking-widest mb-1">ROI</p>
                    <p className="text-sm font-display font-black text-[#9d4edd]">{c.metrics?.roi || 0}x</p>
                 </div>
                 <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        setEditingId(c.id);
                        setFormData({
                          uid: c.uid || '',
                          artistName: c.artistName || '',
                          songTitle: c.songTitle || '',
                          type: c.type || 'YouTube',
                          budget: c.budget || 0,
                          status: c.status || 'active',
                          metrics: c.metrics || { impressions: 0, views: 0, clicks: 0, conversion: 0, roi: 0 }
                        });
                        setIsAdding(false);
                      }}
                      className="p-2 bg-black border border-[#333] text-gray-400 hover:text-white transition-colors rounded"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => handleDelete(c.id)}
                      className="p-2 bg-black border border-[#333] text-gray-400 hover:text-red-500 transition-colors rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                 </div>
              </div>
            </div>
          </div>
        )) : (
          <div className="bg-[#111] border border-dashed border-[#222] p-20 flex flex-col items-center justify-center text-center">
             <BarChart3 className="text-gray-700 mb-4" size={48} />
             <p className="text-gray-500 font-sans text-sm">No campaigns found. Start by creating a new one.</p>
          </div>
        )}
      </div>
    </div>
  );
}
