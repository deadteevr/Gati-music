import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { Link } from 'react-router-dom';
import { Search, ChevronRight, Filter } from 'lucide-react';

export default function AdminSongs() {
  const [songs, setSongs] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    // Note: requires a composite index if combining where() and orderBy()
    // Doing client-side sort/filter for this MVP to avoid index requirements initially
    const q = query(collection(db, 'submissions'));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setSongs(list);
    });
    return unsub;
  }, []);

  const filteredSongs = songs.filter(song => {
    const matchesSearch = 
      (song.title || '').toLowerCase().includes(search.toLowerCase()) || 
      (song.mainArtist || '').toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || song.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Reviewing': return 'text-yellow-500';
      case 'Processing': return 'text-blue-400';
      case 'Sent to Stores': return 'text-purple-400';
      case 'Live': return 'text-[#ccff00]';
      case 'Changes Required': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#333] pb-6">
        <div>
          <h1 className="text-3xl font-display uppercase tracking-tighter mb-2">Song Submissions</h1>
          <p className="text-gray-400 font-sans text-sm">Review, approve, and manage {songs.length} audio tracks</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-[#111] p-4 border border-[#333]">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input 
            type="text" 
            placeholder="Search by song title or artist..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-[#333] pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#9d4edd] transition-colors font-sans"
          />
        </div>
        <div className="relative w-full md:w-64 flex items-center bg-[#0a0a0a] border border-[#333] px-3">
          <Filter className="text-gray-500 mr-2" size={16} />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-transparent py-3 text-sm text-white focus:outline-none font-sans appearance-none"
          >
            <option value="All">All Statuses</option>
            <option value="Reviewing">Reviewing</option>
            <option value="Processing">Processing</option>
            <option value="Sent to Stores">Sent to Stores</option>
            <option value="Live">Live</option>
            <option value="Changes Required">Changes Required</option>
          </select>
        </div>
      </div>

      <div className="bg-[#111] border border-[#333] overflow-x-auto">
        <table className="w-full text-left text-sm font-sans">
          <thead className="bg-[#1a1a1a] text-gray-400 font-display uppercase tracking-widest text-xs border-b border-[#333]">
            <tr>
              <th className="px-6 py-4">Release</th>
              <th className="px-6 py-4">Main Artist</th>
              <th className="px-6 py-4">Date Submitted</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222]">
            {filteredSongs.map(song => (
              <tr key={song.id} className="hover:bg-[#151515] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {song.coverUrl ? (
                      <img src={song.coverUrl} alt="Cover" className="w-10 h-10 object-cover bg-[#222]" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-10 h-10 bg-[#222] flex items-center justify-center">
                        <Music size={16} className="text-gray-500" />
                      </div>
                    )}
                    <span className="font-bold text-white">{song.title || 'Untitled'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-300">
                  {song.mainArtist}
                </td>
                <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                  {song.createdAt ? new Date(song.createdAt).toLocaleString() : 'N/A'}
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs uppercase tracking-widest font-bold ${getStatusColor(song.status)}`}>
                    {song.status || 'Pending'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link 
                    to={`/admin/songs/${song.id}`}
                    className="inline-flex items-center gap-1 text-[#9d4edd] hover:text-white transition-colors uppercase font-display text-xs tracking-widest font-bold bg-[#222] px-3 py-1.5"
                  >
                    Manage <ChevronRight size={14} />
                  </Link>
                </td>
              </tr>
            ))}
            {filteredSongs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500 font-sans">
                  No submissions found matching criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
