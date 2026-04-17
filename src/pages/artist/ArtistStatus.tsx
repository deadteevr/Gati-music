import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { CheckCircle2, Clock, PlayCircle, Loader2 } from 'lucide-react';

export default function ArtistStatus({ user }: { user: any }) {
  const [releases, setReleases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'submissions'), where('uid', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: any[] = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
      // sort by date descending
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setReleases(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'submissions');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user.uid]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Reviewing': return <Clock size={16} className="text-yellow-500" />;
      case 'Processing': return <Loader2 size={16} className="text-[#9d4edd] animate-spin" />;
      case 'Sent to Stores': return <PlayCircle size={16} className="text-blue-500" />;
      case 'Live': return <CheckCircle2 size={16} className="text-[#ccff00]" />;
      default: return <Clock size={16} />;
    }
  };

  if (loading) return <div className="text-[#ccff00] font-display p-10">Loading...</div>;

  return (
    <div className="max-w-7xl">
      <div className="mb-10">
        <h1 className="text-4xl font-display uppercase tracking-tighter mb-2">My Songs</h1>
        <p className="text-gray-400 font-sans">Track the status of your releases.</p>
      </div>

      {releases.length === 0 ? (
        <div className="border border-[#333] p-12 text-center bg-[#111]">
          <p className="text-gray-500 font-sans mb-4">You haven't uploaded any songs yet.</p>
        </div>
      ) : (
        <div className="bg-[#111] border border-[#333] overflow-x-auto">
          <table className="w-full text-left font-sans">
            <thead className="bg-[#0a0a0a] border-b border-[#333]">
              <tr>
                <th className="px-6 py-4 text-xs font-display uppercase tracking-widest text-gray-500 font-medium">Cover</th>
                <th className="px-6 py-4 text-xs font-display uppercase tracking-widest text-gray-500 font-medium">Title</th>
                <th className="px-6 py-4 text-xs font-display uppercase tracking-widest text-gray-500 font-medium">Artist</th>
                <th className="px-6 py-4 text-xs font-display uppercase tracking-widest text-gray-500 font-medium">Date Released</th>
                <th className="px-6 py-4 text-xs font-display uppercase tracking-widest text-gray-500 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333]">
              {releases.map((release) => (
                <tr key={release.id} className="hover:bg-[#1a1a1a] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {release.coverUrl ? (
                      <img 
                        src={release.coverUrl} 
                        alt="Cover" 
                        className="w-12 h-12 object-cover rounded shadow-md border border-[#333]" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-[#222] rounded flex items-center justify-center border border-[#333]">
                        <span className="text-[10px] text-gray-500 uppercase">No IMG</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-white font-medium">{release.title}</div>
                    {release.featuringArtists && release.featuringArtists.length > 0 && (
                      <div className="text-xs text-gray-500 mt-1">feat. {release.featuringArtists.join(', ')}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    {release.mainArtist}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {new Date(release.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(release.status)}
                      <span className={`text-sm font-display uppercase tracking-widest font-bold ${
                        release.status === 'Reviewing' ? 'text-yellow-500' :
                        release.status === 'Processing' ? 'text-[#9d4edd]' :
                        release.status === 'Sent to Stores' ? 'text-blue-500' :
                        release.status === 'Live' ? 'text-[#ccff00]' : 'text-gray-400'
                      }`}>
                        {release.status}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
