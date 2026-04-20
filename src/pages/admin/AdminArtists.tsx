import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import firebaseConfig from '../../../firebase-applet-config.json';
import { Link } from 'react-router-dom';
import { Search, ChevronRight, X } from 'lucide-react';

export default function AdminArtists() {
  const [artists, setArtists] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  
  // Create Artist Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newArtist, setNewArtist] = useState({
    name: '',
    email: '',
    password: '',
    plan: 'Basic',
    planExpiry: ''
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs
        .map(d => ({ uid: d.id, ...(d.data() as any) }))
        .filter((user: any) => user.role !== 'admin');
      setArtists(list);
    });
    return unsub;
  }, []);

  const handleCreateArtist = async () => {
    if (!newArtist.name || !newArtist.email || !newArtist.password) {
      return alert("Name, Email, and Password are required");
    }
    setCreating(true);
    let secondaryApp = null;
    
    try {
      // Initialize secondary auth app so admin does not get logged out
      secondaryApp = initializeApp(firebaseConfig, `SecondaryApp_${Date.now()}`);
      const secondaryAuth = getAuth(secondaryApp);
      
      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth,
        newArtist.email,
        newArtist.password
      );
      const newUid = userCredential.user.uid;

      await setDoc(doc(db, 'users', newUid), {
        uid: newUid,
        displayName: newArtist.name,
        name: newArtist.name,
        email: newArtist.email,
        role: 'artist',
        plan: newArtist.plan,
        planExpiry: newArtist.planExpiry,
        createdAt: new Date().toISOString(),
        manualAccount: true
      });
      
      setShowAddModal(false);
      setNewArtist({ name: '', email: '', password: '', plan: 'Basic', planExpiry: '' });
      alert("Artist profile created successfully with password authentication.");
    } catch (e: any) {
      alert("Error creating account: " + e.message);
      handleFirestoreError(e, OperationType.WRITE, 'users');
    } finally {
      if (secondaryApp) {
        await deleteApp(secondaryApp);
      }
      setCreating(false);
    }
  };

  const filteredArtists = artists.filter(a => 
    (a.displayName || '').toLowerCase().includes(search.toLowerCase()) || 
    (a.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#333] pb-6">
        <div>
          <h1 className="text-3xl font-display uppercase tracking-tighter mb-2">Artists</h1>
          <p className="text-gray-400 font-sans text-sm">Manage all {artists.length} artists on the platform</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text" 
              placeholder="Search artists..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#111] border border-[#333] pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#9d4edd] transition-colors font-sans"
            />
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-[#9d4edd] text-white px-6 py-3 font-display uppercase tracking-widest text-xs font-bold hover:bg-[#7b2cbf] transition-colors whitespace-nowrap"
          >
            Add Artist
          </button>
        </div>
      </div>

      <div className="bg-[#111] border border-[#333] overflow-x-auto">
        <table className="w-full text-left text-sm font-sans">
          <thead className="bg-[#1a1a1a] text-gray-400 font-display uppercase tracking-widest text-xs border-b border-[#333]">
            <tr>
              <th className="px-6 py-4">Artist Info</th>
              <th className="px-6 py-4">Plan</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222]">
            {filteredArtists.map(artist => (
              <tr key={artist.uid} className="hover:bg-[#151515] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-white">{artist.displayName || artist.name || 'Unnamed Artist'}</span>
                    <span className="text-xs text-gray-500">{artist.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-[#222] px-2 py-1 text-xs uppercase tracking-widest text-[#9d4edd] font-bold border border-[#333]">
                    {artist.plan || 'Free'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs uppercase tracking-widest text-green-400 font-bold">Active</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link 
                    to={`/admin/artists/${artist.uid}`}
                    className="inline-flex items-center gap-1 text-[#9d4edd] hover:text-white transition-colors uppercase font-display text-xs tracking-widest font-bold"
                  >
                    View <ChevronRight size={14} />
                  </Link>
                </td>
              </tr>
            ))}
            {filteredArtists.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500 font-sans">
                  No artists found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE ARTIST MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-[#333] p-6 max-w-md w-full relative">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
               <X size={20} />
            </button>
            <h2 className="text-xl font-display uppercase tracking-widest text-[#9d4edd] mb-6">Create Artist Account</h2>
            
            <div className="space-y-4 font-sans">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-display tracking-widest text-gray-500">Artist Name</label>
                <input 
                  type="text" value={newArtist.name} onChange={e => setNewArtist({...newArtist, name: e.target.value})}
                  className="bg-[#0a0a0a] border border-[#333] p-3 text-white text-sm focus:outline-none focus:border-[#9d4edd]" 
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-display tracking-widest text-gray-500">Email Address (for login)</label>
                <input 
                  type="email" value={newArtist.email} onChange={e => setNewArtist({...newArtist, email: e.target.value})}
                  className="bg-[#0a0a0a] border border-[#333] p-3 text-white text-sm focus:outline-none focus:border-[#9d4edd]" 
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-display tracking-widest text-gray-500">Temporary Password</label>
                <input 
                  type="password" value={newArtist.password} onChange={e => setNewArtist({...newArtist, password: e.target.value})}
                  placeholder="Min 6 characters"
                  className="bg-[#0a0a0a] border border-[#333] p-3 text-white text-sm focus:outline-none focus:border-[#9d4edd]" 
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-display tracking-widest text-gray-500">Plan Type</label>
                <select 
                  value={newArtist.plan} onChange={e => setNewArtist({...newArtist, plan: e.target.value})}
                  className="bg-[#0a0a0a] border border-[#333] p-3 text-white text-sm focus:outline-none focus:border-[#9d4edd]"
                >
                  <option>Free</option>
                  <option>Basic</option>
                  <option>Monthly</option>
                  <option>Yearly</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-display tracking-widest text-gray-500">Plan Expiry Date</label>
                <input 
                  type="date" value={newArtist.planExpiry} onChange={e => setNewArtist({...newArtist, planExpiry: e.target.value})}
                  className="bg-[#0a0a0a] border border-[#333] p-3 text-white text-sm focus:outline-none focus:border-[#9d4edd]" 
                />
              </div>

              <button 
                onClick={handleCreateArtist}
                disabled={creating}
                className="w-full mt-4 bg-[#9d4edd] text-white py-3 font-display uppercase tracking-widest text-xs font-bold hover:bg-[#7b2cbf] transition-colors"
              >
                {creating ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
