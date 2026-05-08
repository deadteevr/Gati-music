import { useState, useEffect } from 'react';
import { 
  Music, 
  Search, 
  Filter, 
  ExternalLink, 
  Play,
  Calendar,
  Clock,
  ChevronRight,
  TrendingUp,
  BarChart2
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export default function LabelCatalog({ user, userData }: { user: any, userData: any }) {
  const [releases, setReleases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    if (!userData.labelId) return;

    const fetchCatalog = async () => {
      try {
        const q = query(
          collection(db, 'submissions'),
          where('labelId', '==', userData.labelId),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        setReleases(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'submissions');
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, [userData.labelId]);

  const filteredReleases = releases.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         r.mainArtist.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statuses = ['All', 'Reviewing', 'Processing', 'Sent to Stores', 'Live', 'Changes Required'];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-display font-black uppercase tracking-tight">Label <span className="text-[#8B5CF6]">Catalog</span></h1>
          <p className="text-gray-500 text-xs uppercase tracking-widest mt-1 font-bold">Consolidated discography of all managed artists</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
           <BarChart2 size={14} className="text-[#8B5CF6]" />
           <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">{releases.length} Total Releases</span>
        </div>
      </header>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
          <input 
            type="text"
            placeholder="Search by title or artist..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#111] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:border-[#8B5CF6]/50 transition-colors"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {statuses.map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${
                statusFilter === status 
                  ? 'bg-[#8B5CF6] border-[#8B5CF6] text-white shadow-lg shadow-purple-500/20' 
                  : 'bg-white/5 border-white/10 text-gray-500 hover:text-white hover:border-white/20'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog List */}
      <div className="space-y-4">
        {loading ? (
          Array(5).fill(0).map((_, i) => (
            <div key={i} className="h-24 bg-[#111] animate-pulse rounded-3xl border border-white/5" />
          ))
        ) : filteredReleases.length > 0 ? (
          filteredReleases.map((release) => (
            <div key={release.id} className="p-4 md:p-6 bg-[#111] border border-white/5 rounded-[32px] flex flex-col md:flex-row items-center justify-between group hover:border-[#8B5CF6]/30 transition-all gap-6">
              <div className="flex items-center gap-6 w-full md:w-auto">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-white/5 rounded-2xl overflow-hidden border border-white/10 group-hover:scale-105 transition-transform flex-shrink-0 relative">
                  {release.coverUrl ? (
                    <img src={release.coverUrl} className="w-full h-full object-cover" alt={release.title} />
                  ) : (
                    <Music className="w-full h-full p-6 text-gray-700" />
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play size={24} className="text-white fill-current" />
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-display font-black uppercase text-white group-hover:text-[#8B5CF6] transition-colors leading-tight">{release.title}</h4>
                  <p className="text-xs text-gray-400 mt-1 mb-2 font-bold uppercase tracking-wider">{release.mainArtist}</p>
                  <div className="flex flex-wrap items-center gap-4 text-[9px] text-gray-600 font-black uppercase tracking-widest">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {format(release.createdAt.toDate(), 'MMM dd, yyyy')}</span>
                    <span className="flex items-center gap-1"><TrendingUp size={12} /> Premium High</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                 <StatusBadge status={release.status} />
                 <div className="flex items-center gap-2">
                    <Link 
                      to={`/label/artists/${release.uid}`} 
                      className="p-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-all shadow-sm"
                      title="View Artist Catalog"
                    >
                      <ChevronRight size={18} />
                    </Link>
                    <button className="p-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-[#8B5CF6] transition-all">
                      <ExternalLink size={18} />
                    </button>
                 </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center bg-[#111] border border-dashed border-white/5 rounded-[40px]">
            <Music size={48} className="mx-auto text-gray-700 mb-6" />
            <p className="text-gray-500 uppercase tracking-widest font-black text-xs">No catalog items found matching your criteria.</p>
          </div>
        )}
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
