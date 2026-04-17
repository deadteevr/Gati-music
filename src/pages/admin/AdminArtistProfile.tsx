import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, onSnapshot, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { User, Music, ArrowLeft, Save, IndianRupee, Link as LinkIcon, Download, Trash2, CheckCircle2 } from 'lucide-react';

export default function AdminArtistProfile() {
  const { uid } = useParams();
  const [artist, setArtist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Plan Editor State
  const [planType, setPlanType] = useState('Free');
  const [planExpiry, setPlanExpiry] = useState('');
  const [updatingPlan, setUpdatingPlan] = useState(false);

  // Streams Editor State
  const [streams, setStreams] = useState({
    spotify: 0,
    youtube: 0,
    apple: 0,
    other: 0
  });

  // Artist Data State
  const [songs, setSongs] = useState<any[]>([]);
  const [royalties, setRoyalties] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);

  useEffect(() => {
    if (!uid) return;
    
    // User doc
    const unsubUser = onSnapshot(doc(db, 'users', uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setArtist(data);
        setPlanType(data.plan || 'Free');
        setPlanExpiry(data.planExpiry || '');
        setStreams({
          spotify: data.streams?.spotify || 0,
          youtube: data.streams?.youtube || 0,
          apple: data.streams?.apple || 0,
          other: data.streams?.other || 0
        });
      }
      setLoading(false);
    });

    // Songs
    const qSongs = query(collection(db, 'submissions'), where('uid', '==', uid));
    const unsubSongs = onSnapshot(qSongs, (snap) => {
      setSongs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Royalties
    const qRoyalties = query(collection(db, 'royalties'), where('uid', '==', uid));
    const unsubRoyalties = onSnapshot(qRoyalties, (snap) => {
      setRoyalties(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));
    });

    // Withdrawals
    const qWithdrawals = query(collection(db, 'withdrawals'), where('uid', '==', uid));
    const unsubWithdrawals = onSnapshot(qWithdrawals, (snap) => {
      setWithdrawals(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));
    });

    return () => {
      unsubUser();
      unsubSongs();
      unsubRoyalties();
      unsubWithdrawals();
    };
  }, [uid]);

  const handleUpdatePlan = async () => {
    setUpdatingPlan(true);
    try {
      await updateDoc(doc(db, 'users', uid!), {
        plan: planType,
        planExpiry: planExpiry
      });
      alert('Plan updated successfully');
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${uid}`);
    } finally {
      setUpdatingPlan(false);
    }
  };

  const handleUpdateStreams = async () => {
    try {
      const totalStreams = Number(streams.spotify) + Number(streams.youtube) + Number(streams.apple) + Number(streams.other);
      await updateDoc(doc(db, 'users', uid!), {
        streams: {
          spotify: Number(streams.spotify),
          youtube: Number(streams.youtube),
          apple: Number(streams.apple),
          other: Number(streams.other),
          total: totalStreams
        }
      });
      alert('Streams updated successfully');
    } catch (e) {
       handleFirestoreError(e, OperationType.UPDATE, `users/${uid}`);
    }
  };

  if (loading) return <div className="text-white p-8">Loading artist profile...</div>;
  if (!artist) return <div className="text-white p-8">Artist not found</div>;

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-8 relative">
      <Link to="/admin/artists" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors font-display uppercase tracking-widest text-xs">
        <ArrowLeft size={16} /> Back to Artists
      </Link>

      <div className="flex items-center gap-6 pb-6 border-b border-[#333]">
        <div className="w-20 h-20 rounded-full bg-[#111] border border-[#333] flex items-center justify-center text-[#9d4edd] text-2xl font-bold font-sans">
          {artist.displayName?.charAt(0) || artist.name?.charAt(0) || 'A'}
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold uppercase tracking-tighter text-white">{artist.displayName || artist.name || 'No Name'}</h1>
          <p className="text-gray-400 font-sans">{artist.email}</p>
          <p className="text-xs text-[#9d4edd] font-mono mt-1">UID: {uid}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Plan Management */}
        <div className="bg-[#111] border border-[#333] p-6 space-y-6">
          <div className="border-b border-[#333] pb-4">
            <h2 className="text-lg font-display uppercase tracking-widest text-[#9d4edd]">Plan Management</h2>
            <p className="text-xs text-gray-500 font-sans">Update the artist's subscription tier</p>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-display uppercase tracking-widest text-gray-400">Plan Type</label>
              <select 
                value={planType} 
                onChange={(e) => setPlanType(e.target.value)}
                className="bg-[#222] border border-[#444] text-white p-3 font-sans focus:outline-none focus:border-[#9d4edd]"
              >
                <option value="Free">Free</option>
                <option value="Basic">Basic</option>
                <option value="Monthly">Monthly Premium</option>
                <option value="Yearly">Yearly Pro</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-xs font-display uppercase tracking-widest text-gray-400">Expiry Date</label>
              <input 
                type="date" 
                value={planExpiry} 
                onChange={(e) => setPlanExpiry(e.target.value)}
                className="bg-[#222] border border-[#444] text-white p-3 font-sans focus:outline-none focus:border-[#9d4edd]"
              />
            </div>

            <button 
              onClick={handleUpdatePlan}
              disabled={updatingPlan}
              className="w-full bg-white text-black font-display font-bold uppercase tracking-widest py-3 hover:bg-[#9d4edd] hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <Save size={16} /> Update Plan
            </button>
          </div>
        </div>

        {/* Streams Analytics Override */}
        <div className="bg-[#111] border border-[#333] p-6 space-y-6">
          <div className="border-b border-[#333] pb-4">
            <h2 className="text-lg font-display uppercase tracking-widest text-[#9d4edd]">Total Stream Overrides</h2>
            <p className="text-xs text-gray-500 font-sans">Manually aggregate streams for artist dashboard display</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-display uppercase tracking-widest text-[#1DB954]">Spotify</label>
                <input type="number" value={streams.spotify} onChange={(e) => setStreams({...streams, spotify: Number(e.target.value)})} className="bg-[#222] border border-[#444] text-white p-2 font-mono text-sm" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-display uppercase tracking-widest text-[#FF0000]">YouTube</label>
                <input type="number" value={streams.youtube} onChange={(e) => setStreams({...streams, youtube: Number(e.target.value)})} className="bg-[#222] border border-[#444] text-white p-2 font-mono text-sm" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-display uppercase tracking-widest text-[#FA243C]">Apple Music</label>
                <input type="number" value={streams.apple} onChange={(e) => setStreams({...streams, apple: Number(e.target.value)})} className="bg-[#222] border border-[#444] text-white p-2 font-mono text-sm" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-display uppercase tracking-widest text-gray-400">Other</label>
                <input type="number" value={streams.other} onChange={(e) => setStreams({...streams, other: Number(e.target.value)})} className="bg-[#222] border border-[#444] text-white p-2 font-mono text-sm" />
              </div>
            </div>

            <div className="pt-4 border-t border-[#333] flex justify-between items-center">
              <div>
                <p className="text-xs font-display uppercase tracking-widest text-gray-500">Aggregated Total</p>
                <p className="text-2xl font-bold font-mono text-white">{(Number(streams.spotify) + Number(streams.youtube) + Number(streams.apple) + Number(streams.other)).toLocaleString()}</p>
              </div>
              <button 
                onClick={handleUpdateStreams}
                className="bg-[#222] text-[#9d4edd] border border-[#9d4edd] font-display font-bold uppercase tracking-widest px-6 py-3 hover:bg-[#9d4edd] hover:text-white transition-colors text-xs"
              >
                Update Streams
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Songs List */}
        <div className="bg-[#111] border border-[#333] p-6 space-y-4">
           <h2 className="text-lg font-display uppercase tracking-widest text-white border-b border-[#222] pb-2">Artist Songs ({songs.length})</h2>
           <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
             {songs.map(song => (
               <div key={song.id} className="flex justify-between items-center bg-[#1a1a1a] p-3 text-sm">
                 <Link to={`/admin/songs/${song.id}`} className="font-bold hover:text-[#9d4edd] transition-colors truncate max-w-[200px]">{song.title || 'Untitled'}</Link>
                 <span className={`text-[10px] font-display uppercase tracking-widest px-2 py-1 ${
                   song.status === 'Live' ? 'bg-[#ccff00] text-black' : 
                   song.status === 'Sent to Stores' ? 'bg-purple-500/20 text-purple-400' :
                   'bg-[#222] text-gray-400'
                 }`}>{song.status || 'Pending'}</span>
               </div>
             ))}
             {songs.length === 0 && <p className="text-gray-500 text-sm">No songs submitted.</p>}
           </div>
        </div>

        {/* Royalties */}
        <div className="bg-[#111] border border-[#333] p-6 space-y-4">
           <div className="flex justify-between items-center border-b border-[#222] pb-2">
              <h2 className="text-lg font-display uppercase tracking-widest text-white">Royalties</h2>
              <Link to="/admin/royalties" className="text-xs text-[#9d4edd] hover:text-white font-display uppercase tracking-widest">Manage All</Link>
           </div>
           
           <div className="space-y-2 max-h-[140px] overflow-y-auto pr-2 custom-scrollbar">
             {royalties.map(r => (
               <div key={r.id} className="flex justify-between items-center bg-[#1a1a1a] p-3 text-sm">
                 <span className="text-gray-400">{r.reportMonth}</span>
                 <div className="flex items-center gap-4">
                   <span className="text-[#ccff00] font-mono font-bold">₹{r.amount}</span>
                   {r.reportLink ? (
                      <a href={r.reportLink} target="_blank" rel="noopener noreferrer" className="text-[#9d4edd] hover:text-white"><LinkIcon size={14}/></a>
                   ) : <span className="w-[14px]"></span>}
                 </div>
               </div>
             ))}
             {royalties.length === 0 && <p className="text-gray-500 text-sm">No royalties issued.</p>}
           </div>

            {/* Withdrawals inside same block for compactness */}
           <div className="flex justify-between items-center border-b border-[#222] pb-2 pt-4">
              <h2 className="text-lg font-display uppercase tracking-widest text-white">Withdrawals</h2>
              <Link to="/admin/withdrawals" className="text-xs text-[#9d4edd] hover:text-white font-display uppercase tracking-widest">Manage All</Link>
           </div>
           <div className="space-y-2 max-h-[140px] overflow-y-auto pr-2 custom-scrollbar">
             {withdrawals.map(w => (
               <div key={w.id} className="flex justify-between items-center bg-[#1a1a1a] p-3 text-sm">
                 <div>
                   <span className="text-[#ccff00] font-mono font-bold block">₹{w.amount}</span>
                   <span className="text-[10px] text-gray-500">{new Date(w.createdAt).toLocaleDateString()}</span>
                 </div>
                 <span className={`text-[10px] font-display uppercase tracking-widest px-2 py-1 ${
                   w.status === 'Paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-500'
                 }`}>{w.status || 'Pending'}</span>
               </div>
             ))}
             {withdrawals.length === 0 && <p className="text-gray-500 text-sm">No withdrawals requested.</p>}
           </div>
        </div>

      </div>
    </div>
  );
}
