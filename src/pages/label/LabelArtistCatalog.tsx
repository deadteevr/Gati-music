import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Music, 
  Users, 
  ExternalLink, 
  Calendar,
  Clock,
  Play,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { format } from 'date-fns';

export default function LabelArtistCatalog() {
  const { aid } = useParams();
  const [artist, setArtist] = useState<any>(null);
  const [releases, setReleases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!aid) return;

    const fetchData = async () => {
      try {
        const artistDoc = await getDoc(doc(db, 'users', aid));
        if (artistDoc.exists()) {
          setArtist(artistDoc.data());
        }

        const q = query(
          collection(db, 'submissions'), 
          where('uid', '==', aid),
          orderBy('createdAt', 'desc')
        );
        const releasesSnap = await getDocs(q);
        setReleases(releasesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, 'users');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [aid]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-10 h-10 border-4 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!artist) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black p-6">
      <AlertCircle className="text-red-500 mb-4" size={48} />
      <h2 className="text-2xl font-display font-black uppercase mb-4">Artist Not Found</h2>
      <Link to="/label/artists" className="px-6 py-2 bg-white/10 rounded-xl text-sm font-bold uppercase">Back to Roster</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <Link to="/label/artists" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-10 group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] uppercase font-black tracking-widest">Back to Roster</span>
        </Link>

        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center gap-8 mb-16 p-10 bg-gradient-to-br from-[#111] to-[#0A0A0A] border border-white/5 rounded-[40px] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5">
            <Users size={200} className="text-[#8B5CF6]" />
          </div>
          
          <div className="w-32 h-32 bg-white/5 rounded-[32px] flex items-center justify-center text-gray-700 shadow-2xl relative z-10">
            <Users size={64} />
          </div>
          
          <div className="text-center md:text-left relative z-10">
            <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tighter mb-4">{artist.displayName || artist.name}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
               <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
                 <Music size={14} className="text-[#8B5CF6]" />
                 <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">{releases.length} Releases</span>
               </div>
               <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
                 <Calendar size={14} className="text-[#8B5CF6]" />
                 <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Joined {artist.createdAt ? format(new Date(artist.createdAt), 'MMM yyyy') : 'Recently'}</span>
               </div>
            </div>
          </div>
        </div>

        {/* Catalog */}
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-display font-black uppercase tracking-tighter">Artist Catalog</h2>
            <div className="text-[10px] uppercase font-bold text-gray-500 tracking-widest px-4 py-2 bg-[#111] rounded-full border border-white/5">
              Managed Catalog
            </div>
          </div>

          {releases.length > 0 ? (
            <div className="grid gap-4">
              {releases.map((release) => (
                <div key={release.id} className="p-6 bg-[#111] border border-white/5 rounded-3xl flex flex-col md:flex-row items-center justify-between group hover:border-[#8B5CF6]/30 transition-all gap-6">
                  <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
                    <div className="w-20 h-20 bg-white/5 rounded-2xl overflow-hidden border border-white/10 group-hover:scale-105 transition-transform flex-shrink-0 relative">
                      {release.coverUrl ? (
                         <img src={release.coverUrl} className="w-full h-full object-cover" alt={release.title} />
                      ) : (
                         <Music className="w-full h-full p-6 text-gray-700" />
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <Play size={24} className="text-white fill-current" />
                      </div>
                    </div>
                    <div className="text-center md:text-left">
                      <h4 className="text-lg font-display font-black uppercase leading-tight group-hover:text-[#8B5CF6] transition-colors mb-1">{release.title}</h4>
                      <div className="flex flex-wrap justify-center md:justify-start gap-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2">
                        <span className="flex items-center gap-1"><Clock size={12} /> {format(release.createdAt.toDate(), 'MMM dd, yyyy')}</span>
                        <span className="flex items-center gap-1">• {release.labelName || 'Independent'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                    <StatusBadge status={release.status} />
                    <div className="flex gap-2">
                      <button className="p-3 bg-white/5 border border-white/5 rounded-xl text-gray-400 hover:text-[#8B5CF6] hover:border-[#8B5CF6]/30 transition-colors">
                        <ExternalLink size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-[#111] border border-dashed border-white/5 rounded-[40px]">
              <Music size={48} className="mx-auto text-gray-700 mb-6" />
              <p className="text-gray-500 uppercase tracking-widest font-black text-xs">No catalog items available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    'Reviewing': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'Processing': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    'Sent to Stores': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    'Live': 'bg-[#ccff00]/10 text-[#ccff00] border-[#ccff00]/20',
    'Changes Required': 'bg-red-500/10 text-red-500 border-red-500/20'
  };
  
  const colorClass = (colors as any)[status] || 'bg-gray-500/10 text-gray-500 border-gray-500/20';

  return (
    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${colorClass}`}>
      {status}
    </span>
  );
}
