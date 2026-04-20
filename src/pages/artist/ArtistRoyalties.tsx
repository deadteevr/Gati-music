import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { Download } from 'lucide-react';

export default function ArtistRoyalties({ user }: { user: any }) {
  const [royalties, setRoyalties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'royalties'), where('uid', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: any[] = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setRoyalties(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'royalties', false);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user.uid]);

  const totalEarned = royalties.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-4xl font-display uppercase tracking-tighter mb-2">Royalties</h1>
        <p className="text-gray-400">First report arrives after 3 months, then updates monthly.</p>
      </div>

      <div className="bg-[#ccff00] text-black p-8 mb-10 w-full max-w-sm">
        <div className="text-sm font-display uppercase tracking-widest font-bold mb-2 opacity-70">Total Earnings</div>
        <div className="text-6xl font-display font-medium tracking-tighter">₹{totalEarned.toFixed(2)}</div>
      </div>

      <h2 className="text-xl font-display uppercase tracking-widest text-white mb-6">Monthly Reports</h2>

      {loading ? (
        <div className="text-[#ccff00]">Loading...</div>
      ) : royalties.length === 0 ? (
        <div className="border border-[#333] p-12 text-center bg-[#111]">
          <p className="text-gray-500 font-sans mb-4">No royalty reports available yet. Keep grinding!</p>
        </div>
      ) : (
        <div className="border border-[#333] bg-[#111] overflow-hidden">
          <div className="grid grid-cols-3 p-4 border-b border-[#333] font-display tracking-widest uppercase text-xs text-gray-500">
            <div>Month</div>
            <div>Amount</div>
            <div>Report</div>
          </div>
          <div className="divide-y divide-[#333]">
            {royalties.map(roy => (
              <div key={roy.id} className="grid grid-cols-3 p-4 items-center font-sans text-sm hover:bg-[#1a1a1a]">
                <div className="text-white font-medium">{roy.reportMonth}</div>
                <div className="text-[#ccff00]">₹{roy.amount.toFixed(2)}</div>
                <div>
                  {roy.reportLink ? (
                    <a href={roy.reportLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                      <Download size={16} /> Download
                    </a>
                  ) : (
                    <span className="text-gray-600">Pending link</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
