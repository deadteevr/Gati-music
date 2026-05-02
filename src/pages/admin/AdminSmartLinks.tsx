import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { Search, Music, ExternalLink, Edit2, Check, X, Link as LinkIcon, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminSmartLinks() {
  const [releases, setReleases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLinks, setEditLinks] = useState<any>({});

  useEffect(() => {
    const q = query(collection(db, 'submissions'), where('status', '==', 'Live'));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReleases(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'submissions');
      setLoading(false);
    });
    return unsub;
  }, []);

  const filteredReleases = releases.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.mainArtist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startEditing = (release: any) => {
    setEditingId(release.id);
    setEditLinks(release.storeLinks || {});
  };

  const saveLinks = async (id: string) => {
    try {
      await updateDoc(doc(db, 'submissions', id), {
        storeLinks: editLinks
      });
      setEditingId(null);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `submissions/${id}`);
    }
  };

  const autoGenerateLinks = (title: string, artist: string) => {
    const slug = `${title}-${artist}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    setEditLinks({
      spotify: `https://open.spotify.com/search/${encodeURIComponent(title + ' ' + artist)}`,
      appleMusic: `https://music.apple.com/search?term=${encodeURIComponent(title + ' ' + artist)}`,
      youtubeMusic: `https://music.youtube.com/search?q=${encodeURIComponent(title + ' ' + artist)}`,
      deezer: `https://www.deezer.com/search/${encodeURIComponent(title + ' ' + artist)}`,
      amazonMusic: `https://music.amazon.com/search/${encodeURIComponent(title + ' ' + artist)}`,
      instagram: `https://www.instagram.com/reels/audio/`
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display uppercase tracking-tighter mb-2">Smart Link Manager</h1>
        <p className="text-gray-400 font-sans text-sm">Manage store integrations and smart links for all live releases.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text"
            placeholder="Search by song or artist..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#111] border border-[#333] pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#ccff00] transition-colors"
          />
        </div>
        <div className="text-[10px] uppercase font-display tracking-widest text-gray-500">
          Total Live Releases: <span className="text-[#ccff00]">{releases.length}</span>
        </div>
      </div>

      <div className="grid gap-6">
        {loading ? (
           <div className="text-center py-20 text-[#ccff00] font-display animate-pulse uppercase tracking-[0.3em]">Syncing Links...</div>
        ) : filteredReleases.length === 0 ? (
           <div className="text-center py-20 border border-dashed border-[#222]">
             <p className="text-gray-500 font-display uppercase tracking-widest text-xs">No live releases found</p>
           </div>
        ) : (
          filteredReleases.map(release => (
            <div key={release.id} className="bg-[#111] border border-[#222] p-6 group hover:border-[#333] transition-all">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Release Info */}
                <div className="flex gap-4 lg:w-1/3">
                  <img 
                    src={release.coverUrl} 
                    alt="" 
                    className="w-20 h-20 object-cover rounded border border-[#333]" 
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h3 className="text-lg font-display uppercase font-black text-white">{release.title}</h3>
                    <p className="text-gray-500 text-sm font-sans underline decoration-gray-800 underline-offset-4">{release.mainArtist}</p>
                    <div className="mt-4 flex gap-2">
                       <Link 
                        to={`/release/${release.id}`} 
                        target="_blank"
                        className="p-2 bg-[#222] text-gray-400 hover:text-[#ccff00] transition-colors rounded"
                        title="View Public Link"
                       >
                         <Eye size={16} />
                       </Link>
                       <button 
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/release/${release.id}`);
                          alert('Copied!');
                        }}
                        className="p-2 bg-[#222] text-gray-400 hover:text-white transition-colors rounded"
                        title="Copy URL"
                       >
                         <LinkIcon size={16} />
                       </button>
                    </div>
                  </div>
                </div>

                {/* Links Management */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] uppercase font-display tracking-widest text-gray-500">Store Integrations</span>
                    {editingId === release.id ? (
                      <div className="flex gap-3">
                        <button onClick={() => autoGenerateLinks(release.title, release.mainArtist)} className="text-purple-400 flex items-center gap-1 text-[10px] font-display uppercase font-black tracking-widest hover:text-white transition-colors">
                          <Zap size={14} /> Auto-fill Search Links
                        </button>
                        <button onClick={() => saveLinks(release.id)} className="text-[#ccff00] flex items-center gap-1 text-[10px] font-display uppercase font-black tracking-widest">
                          <Check size={14} /> Save Changes
                        </button>
                        <button onClick={() => setEditingId(null)} className="text-red-500 flex items-center gap-1 text-[10px] font-display uppercase font-black tracking-widest">
                          <X size={14} /> Cancel
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => startEditing(release)} className="text-blue-400 hover:text-white flex items-center gap-1 text-[10px] font-display uppercase font-black tracking-widest transition-colors">
                        <Edit2 size={14} /> Edit Links
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Object.entries({
                        spotify: 'Spotify',
                        appleMusic: 'Apple',
                        youtubeMusic: 'YouTube',
                        deezer: 'Deezer',
                        amazonMusic: 'Amazon',
                        instagram: 'Insta'
                    }).map(([key, label]) => (
                      <div key={key} className="bg-black/30 border border-[#222] p-3 rounded">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[9px] uppercase tracking-widest text-gray-600 font-black">{label}</span>
                          {(release.storeLinks?.[key] || editLinks[key]) && (
                            <ExternalLink size={10} className="text-gray-700" />
                          )}
                        </div>
                        {editingId === release.id ? (
                          <input 
                            type="text"
                            value={editLinks[key] || ''}
                            onChange={(e) => setEditLinks({...editLinks, [key]: e.target.value})}
                            placeholder="URL..."
                            className="w-full bg-[#151515] text-white text-[10px] py-1 border-b border-[#333] focus:outline-none focus:border-[#ccff00]"
                          />
                        ) : (
                          <span className={`text-[10px] truncate block ${release.storeLinks?.[key] ? 'text-gray-300' : 'text-gray-700 italic'}`}>
                            {release.storeLinks?.[key] || 'Empty'}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
