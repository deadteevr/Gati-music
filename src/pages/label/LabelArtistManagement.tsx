import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Plus, 
  Search, 
  Trash2, 
  Mail, 
  Instagram, 
  Music, 
  ChevronRight, 
  ArrowLeft,
  UserPlus,
  Loader2,
  CheckCircle2,
  X
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  onSnapshot,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';

export default function LabelArtistManagement({ user, userData }: { user: any, userData: any }) {
  const navigate = useNavigate();
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteStatus, setInviteStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    if (!userData.labelId) return;

    // Real-time listener for artists belonging to this label
    const q = query(collection(db, 'users'), where('labelId', '==', userData.labelId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setArtists(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'users');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userData.labelId]);

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setInviting(true);
    setInviteStatus(null);

    try {
      // 1. Check if user exists
      const userQuery = query(collection(db, 'users'), where('email', '==', inviteEmail.toLowerCase()));
      const userSnap = await getDocs(userQuery);

      if (userSnap.empty) {
        setInviteStatus({ type: 'error', message: 'User not found. They must have a Gati account first.' });
        return;
      }

      const existingUser = userSnap.docs[0].data();
      const userUid = userSnap.docs[0].id;

      if (existingUser.labelId) {
        setInviteStatus({ type: 'error', message: 'Artist is already associated with a label.' });
        return;
      }

      // 2. Update the user with labelId
      await updateDoc(doc(db, 'users', userUid), {
        labelId: userData.labelId,
        managedBy: userData.uid
      });

      // 3. Update the label record
      await updateDoc(doc(db, 'labels', userData.labelId), {
        artistUids: arrayUnion(userUid)
      });

      // 4. Log activity
      await setDoc(doc(collection(db, 'labels', userData.labelId, 'activity')), {
        type: 'artist_added',
        description: `added ${existingUser.displayName || existingUser.name} to the roster.`,
        actorUid: user.uid,
        actorName: userData.displayName || userData.name,
        createdAt: serverTimestamp()
      });

      setInviteStatus({ type: 'success', message: 'Artist successfully added to your roster!' });
      setTimeout(() => {
        setIsAddModalOpen(false);
        setInviteEmail('');
        setInviteStatus(null);
      }, 2000);

    } catch (err) {
      console.error(err);
      setInviteStatus({ type: 'error', message: 'Failed to add artist. Please try again.' });
    } finally {
      setInviting(false);
    }
  };

  const removeArtist = async (artistUid: string, artistName: string) => {
    if (!window.confirm(`Are you sure you want to remove ${artistName} from your label?`)) return;

    try {
      await updateDoc(doc(db, 'users', artistUid), {
        labelId: null,
        managedBy: null
      });

      await updateDoc(doc(db, 'labels', userData.labelId), {
        artistUids: arrayRemove(artistUid)
      });

      await setDoc(doc(collection(db, 'labels', userData.labelId, 'activity')), {
        type: 'artist_removed',
        description: `removed ${artistName} from the roster.`,
        actorUid: user.uid,
        actorName: userData.displayName || userData.name,
        createdAt: serverTimestamp()
      });

    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'users');
    }
  };

  const filteredArtists = artists.filter(a => 
    (a.displayName || a.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 pb-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="flex items-center gap-4">
            <Link to="/label/dashboard" className="p-2 hover:bg-white/5 rounded-xl transition-colors">
              <ArrowLeft size={20} className="text-gray-400" />
            </Link>
            <div>
              <h1 className="text-3xl font-display font-black uppercase tracking-tight">Artist <span className="text-[#8B5CF6]">Roster</span></h1>
              <p className="text-gray-500 text-xs uppercase tracking-widest mt-1 font-bold">Manage {artists.length} artists in your label</p>
            </div>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#8B5CF6] text-white font-display font-black uppercase tracking-widest rounded-xl hover:bg-white hover:text-black transition-all shadow-lg shadow-purple-500/20"
          >
            <UserPlus size={18} />
            <span>Add Artist</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input 
            type="text" 
            placeholder="Search roster by name or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#111] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:border-[#8B5CF6]/50 transition-colors"
          />
        </div>

        {/* Artists Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-[200px] bg-[#111] rounded-[32px] animate-pulse border border-white/5" />
            ))
          ) : filteredArtists.length > 0 ? (
            filteredArtists.map((artist) => (
              <motion.div 
                key={artist.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#111] border border-white/5 rounded-[32px] overflow-hidden group hover:border-[#8B5CF6]/30 transition-all flex flex-col pt-8"
              >
                <div className="px-8 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-white/5 rounded-2xl mb-4 flex items-center justify-center text-gray-500 group-hover:scale-110 transition-transform">
                    <Users size={32} />
                  </div>
                  <h3 className="text-xl font-display font-black uppercase group-hover:text-[#8B5CF6] transition-colors">{artist.displayName || artist.name}</h3>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1 mb-6">{artist.email}</p>
                </div>

                <div className="mt-auto border-t border-white/5 bg-black/30 p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex gap-4">
                       <a href={artist.spotifyLink} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-[#1DB954] hover:bg-[#1DB954]/10 transition-all">
                         <Music size={16} />
                       </a>
                       <a href={`https://instagram.com/${artist.instagram}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-pink-400 hover:bg-pink-400/10 transition-all">
                         <Instagram size={16} />
                       </a>
                    </div>
                    <button 
                      onClick={() => removeArtist(artist.id, artist.displayName || artist.name)}
                      className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <Link 
                    to={`/label/artists/${artist.id}`}
                    className="flex items-center justify-between w-full p-4 bg-white/5 border border-white/10 rounded-xl group/btn hover:bg-white hover:text-black transition-all"
                  >
                    <span className="text-[10px] uppercase font-black tracking-widest">Artist Catalog</span>
                    <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-[#111] border border-dashed border-white/5 rounded-[40px]">
              <Users size={48} className="mx-auto text-gray-700 mb-6" />
              <h3 className="text-xl font-display font-black uppercase text-gray-500 mb-2">No artists found</h3>
              <p className="text-gray-600 text-sm">Add your first artist to start managing their releases.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Artist Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-[#111] border border-white/10 rounded-[32px] p-10 overflow-hidden"
            >
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <UserPlus size={32} />
                </div>
                <h2 className="text-2xl font-display font-black uppercase tracking-tight mb-2">Add New Artist</h2>
                <p className="text-gray-500 text-sm">Enter the email of an artist who already has a Gati account to add them to your label.</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-black text-gray-500 mb-2 block">Artist Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                    <input 
                      type="email" 
                      placeholder="artist@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-[#8B5CF6] transition-colors"
                    />
                  </div>
                </div>

                {inviteStatus && (
                  <div className={`p-4 rounded-xl flex items-start gap-3 ${inviteStatus.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {inviteStatus.type === 'success' ? <CheckCircle2 size={18} className="shrink-0" /> : <X size={18} className="shrink-0" />}
                    <p className="text-xs font-bold leading-relaxed">{inviteStatus.message}</p>
                  </div>
                )}

                <button 
                  onClick={handleInvite}
                  disabled={inviting || !inviteEmail}
                  className="w-full py-4 bg-[#8B5CF6] text-white font-display font-black uppercase tracking-widest rounded-xl hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {inviting ? <Loader2 size={20} className="animate-spin" /> : <span>Confirm Connection</span>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
