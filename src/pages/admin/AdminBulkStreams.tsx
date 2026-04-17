import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { Search, Save } from 'lucide-react';

export default function AdminBulkStreams() {
  const [songs, setSongs] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    // Note: requires a composite index if combining where() and orderBy()
    const q = query(collection(db, 'submissions'));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ 
        id: d.id, 
        ...d.data(),
        // Initialize streams locally if not present
        streamsRef: d.data().streams || { spotify: 0, youtube: 0, apple: 0, other: 0 }
      }));
      list.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setSongs(list);
    });
    return unsub;
  }, []);

  const handleStreamChange = (id: string, platform: string, value: string) => {
    setSongs(prev => prev.map(s => {
      if (s.id === id) {
        return {
          ...s,
          streamsRef: {
            ...s.streamsRef,
            [platform]: Number(value)
          }
        };
      }
      return s;
    }));
  };

  const handleSaveSingle = async (song: any) => {
    setSavingId(song.id);
    try {
      const total = Number(song.streamsRef.spotify) + Number(song.streamsRef.youtube) + Number(song.streamsRef.apple) + Number(song.streamsRef.other);
      await updateDoc(doc(db, 'submissions', song.id), {
        streams: {
          ...song.streamsRef,
          total: total
        }
      });
      // Adding brief success indicator without blocking UI
      setTimeout(() => setSavingId(null), 1000);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `submissions/${song.id}`);
      setSavingId(null);
    }
  };

  const filteredSongs = songs.filter(song => 
    (song.title || '').toLowerCase().includes(search.toLowerCase()) || 
    (song.mainArtist || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#333] pb-6">
        <div>
          <h1 className="text-3xl font-display uppercase tracking-tighter mb-2">Bulk Streams Update</h1>
          <p className="text-gray-400 font-sans text-sm">Update streams linearly for individual tracks</p>
        </div>
        <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text" 
              placeholder="Search songs or artists..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#111] border border-[#333] pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#1DB954] transition-colors font-sans"
            />
        </div>
      </div>

      <div className="bg-[#111] border border-[#333] overflow-x-auto">
        <table className="w-full text-left text-sm font-sans min-w-[800px]">
          <thead className="bg-[#1a1a1a] text-gray-400 font-display uppercase tracking-widest text-xs border-b border-[#333]">
            <tr>
              <th className="px-4 py-4 w-1/4">Track & Artist</th>
              <th className="px-2 py-4 text-[#1DB954]">Spotify</th>
              <th className="px-2 py-4 text-[#FF0000]">YouTube</th>
              <th className="px-2 py-4 text-[#FA243C]">Apple</th>
              <th className="px-2 py-4">Other</th>
              <th className="px-4 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222]">
            {filteredSongs.map(song => (
              <tr key={song.id} className="hover:bg-[#151515] transition-colors">
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="font-bold text-white truncate max-w-[200px]">{song.title || 'Untitled'}</span>
                    <span className="text-xs text-gray-500 truncate max-w-[200px]">{song.mainArtist}</span>
                  </div>
                </td>
                <td className="px-2 py-3">
                  <input 
                    type="number" 
                    value={song.streamsRef.spotify || ''} 
                    onChange={e => handleStreamChange(song.id, 'spotify', e.target.value)}
                    className="w-24 bg-[#0a0a0a] border border-[#333] p-1.5 focus:border-[#1DB954] focus:outline-none text-white font-mono"
                  />
                </td>
                <td className="px-2 py-3">
                  <input 
                    type="number" 
                    value={song.streamsRef.youtube || ''} 
                    onChange={e => handleStreamChange(song.id, 'youtube', e.target.value)}
                    className="w-24 bg-[#0a0a0a] border border-[#333] p-1.5 focus:border-[#FF0000] focus:outline-none text-white font-mono"
                  />
                </td>
                <td className="px-2 py-3">
                  <input 
                    type="number" 
                    value={song.streamsRef.apple || ''} 
                    onChange={e => handleStreamChange(song.id, 'apple', e.target.value)}
                    className="w-24 bg-[#0a0a0a] border border-[#333] p-1.5 focus:border-[#FA243C] focus:outline-none text-white font-mono"
                  />
                </td>
                <td className="px-2 py-3">
                  <input 
                    type="number" 
                    value={song.streamsRef.other || ''} 
                    onChange={e => handleStreamChange(song.id, 'other', e.target.value)}
                    className="w-24 bg-[#0a0a0a] border border-[#333] p-1.5 focus:border-white focus:outline-none text-white font-mono"
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <button 
                    onClick={() => handleSaveSingle(song)}
                    disabled={savingId === song.id}
                    className="inline-flex items-center justify-center gap-1 bg-[#222] hover:bg-[#9d4edd] text-white px-3 py-1.5 font-display uppercase tracking-widest text-[10px] sm:text-xs transition-colors disabled:opacity-50 min-w-[70px]"
                  >
                    {savingId === song.id ? 'Saved' : <><Save size={12}/> Save</>}
                  </button>
                </td>
              </tr>
            ))}
            {filteredSongs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500 font-sans">
                  No songs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
