import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, writeBatch, serverTimestamp, getDocs, where } from 'firebase/firestore';
import { UserPlus, Mail, Instagram, Phone, Clock, CheckCircle2, XCircle, Trash2, Search, Filter, ArrowUpRight, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');

  useEffect(() => {
    const q = query(collection(db, 'requests'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setRequests(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'requests', id), { status });
      // If approved, you might want to trigger account creation or sending email
      // But based on prompt, admin "manually provides dashboard access"
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this request?")) return;
    try {
      await deleteDoc(doc(db, 'requests', id));
    } catch (e) {
      console.error(e);
    }
  };

  const filteredRequests = requests.filter(r => {
    const matchesSearch = r.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' ? true : r.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-black text-white tracking-tighter uppercase">Account Requests</h1>
          <p className="text-gray-500 font-sans text-xs">Review and approve new artist applications.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
            <input 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full bg-[#111] border border-[#222] text-white pl-10 pr-4 py-2 text-xs font-sans focus:border-[#9d4edd] outline-none"
            />
          </div>
          <select 
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-[#111] border border-[#222] text-white px-3 py-2 text-[10px] font-display uppercase font-black outline-none"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#222] bg-[#0a0a0a]">
                <th className="p-4 text-[10px] font-display uppercase tracking-widest text-gray-500">Applicant</th>
                <th className="p-4 text-[10px] font-display uppercase tracking-widest text-gray-500">Contact</th>
                <th className="p-4 text-[10px] font-display uppercase tracking-widest text-gray-500">Referral</th>
                <th className="p-4 text-[10px] font-display uppercase tracking-widest text-gray-500">Status</th>
                <th className="p-4 text-[10px] font-display uppercase tracking-widest text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-gray-600 animate-pulse text-xs uppercase font-display tracking-widest">Loading Requests...</td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-gray-600 text-xs font-sans italic">No requests matching your criteria.</td>
                </tr>
              ) : (
                filteredRequests.map(r => (
                  <tr key={r.id} className="border-b border-[#222] hover:bg-[#1a1a1a] transition-colors group">
                    <td className="p-4">
                      <div className="font-bold text-white font-sans text-sm">{r.applicantName}</div>
                      <div className="flex items-center gap-1 mt-1 text-gray-500 text-[10px] font-mono">
                        <Clock size={10} /> {r.createdAt?.toDate().toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <a href={`mailto:${r.email}`} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors">
                          <Mail size={12} className="text-[#9d4edd]" /> {r.email}
                        </a>
                        <a href={`https://instagram.com/${r.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-[#ccff00] transition-colors">
                          <Instagram size={12} /> {r.instagram}
                        </a>
                        {r.phone && (
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                             <Phone size={12} /> {r.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      {r.heardFrom ? (
                        <div className="text-[10px] text-gray-400 font-sans italic max-w-[150px] truncate" title={r.heardFrom}>
                          "{r.heardFrom}"
                        </div>
                      ) : (
                        <span className="text-gray-700 text-[10px] font-display uppercase tracking-widest">None</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`text-[9px] font-display uppercase tracking-widest px-2 py-1 font-black rounded ${
                        r.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                        r.status === 'approved' ? 'bg-green-500/10 text-green-500' :
                        'bg-red-500/10 text-red-500'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {r.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleStatusUpdate(r.id, 'approved')}
                              className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all rounded"
                              title="Approve"
                            >
                              <CheckCircle2 size={14} />
                            </button>
                            <button 
                              onClick={() => handleStatusUpdate(r.id, 'rejected')}
                              className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all rounded"
                              title="Reject"
                            >
                              <XCircle size={14} />
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => handleDelete(r.id)}
                          className="p-2 bg-[#222] text-gray-500 hover:bg-red-500 hover:text-white transition-all rounded"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
