import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { IndianRupee, Trash2, Link as LinkIcon } from 'lucide-react';

export default function AdminRoyalties() {
  const [reports, setReports] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({ 
    uid: '', 
    reportMonth: '', 
    amount: '', 
    reportLink: '', 
    streamsBreakdown: '' // Format: {"Spotify": 1500, "Apple Music": 400}
  });

  useEffect(() => {
    // Fetch users for dropdown
    const qUsers = query(collection(db, 'users'));
    const unsubUsers = onSnapshot(qUsers, (snap) => {
      setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() })));
    });

    // Fetch reports for table
    const qReports = query(collection(db, 'royalties'));
    const unsubReports = onSnapshot(qReports, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setReports(list);
    });

    return () => {
      unsubUsers();
      unsubReports();
    };
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const payload: any = {
        uid: formData.uid,
        reportMonth: formData.reportMonth,
        amount: Number(formData.amount),
        reportLink: formData.reportLink,
        status: 'Available',
        createdAt: new Date().toISOString()
      };
      
      if (formData.streamsBreakdown) {
        // Basic JSON validation before saving
        JSON.parse(formData.streamsBreakdown);
        payload.streamsBreakdown = formData.streamsBreakdown;
      }
      
      await addDoc(collection(db, 'royalties'), payload);
      
      // Auto Notification
      await addDoc(collection(db, 'notifications'), {
        uid: formData.uid,
        title: "New Royalty Report Available",
        message: `Your royalty report for ${formData.reportMonth} has been uploaded. You earned ₹${formData.amount}.`,
        read: false,
        createdAt: new Date().toISOString()
      });

      alert('Royalty successfully added and artist notified.');
      setFormData({ uid: '', reportMonth: '', amount: '', reportLink: '', streamsBreakdown: '' });
    } catch (err: any) {
      if (err instanceof SyntaxError) {
        alert('Invalid JSON in Streams Breakdown. Please format like: {"Spotify": 100, "Apple": 200}');
      } else {
        alert('Error adding royalty: ' + err.message);
      }
    }
  };

  const handleDelete = async (id: string, uid: string) => {
    if (!window.confirm("Delete this royalty report? This cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, 'royalties', id));
    } catch (err: any) {
      handleFirestoreError(err, OperationType.DELETE, `royalties/${id}`);
    }
  };

  const getUserName = (uid: string) => {
    const user = users.find(u => u.uid === uid);
    return user ? user.displayName || user.email : uid;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-display uppercase tracking-tighter mb-2">Royalty Management</h1>
        <p className="text-gray-400 font-sans text-sm">Upload monthly reports and assign earnings to artists</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        
        {/* Upload Form */}
        <div className="col-span-1 bg-[#111] border border-[#333] p-6 lg:p-8">
          <div className="border-b border-[#333] pb-4 mb-6">
            <h2 className="text-xl font-display uppercase tracking-widest text-[#9d4edd]">Add Report</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-display uppercase tracking-widest text-gray-400">Select Artist</label>
              <select 
                value={formData.uid} 
                onChange={e=>setFormData({...formData, uid: e.target.value})}
                className="bg-[#222] border border-[#444] text-white p-3 font-sans focus:outline-none focus:border-[#9d4edd]"
                required
              >
                <option value="">-- Choose Artist --</option>
                {users.map(u => (
                  <option key={u.uid} value={u.uid}>{u.displayName || 'No Name'} ({u.email})</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-display uppercase tracking-widest text-gray-400">Report Month</label>
              <input 
                placeholder="e.g. Jan 2024" 
                value={formData.reportMonth} 
                onChange={e=>setFormData({...formData, reportMonth: e.target.value})} 
                className="w-full bg-[#222] border border-[#444] p-3 text-white font-sans focus:outline-none focus:border-[#9d4edd]" 
                required 
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-display uppercase tracking-widest text-gray-400">Amount (₹)</label>
              <input 
                type="number" 
                placeholder="0.00" 
                value={formData.amount} 
                onChange={e=>setFormData({...formData, amount: e.target.value})} 
                className="w-full bg-[#222] border border-[#444] p-3 text-white font-display font-mono focus:outline-none focus:border-[#9d4edd]" 
                required 
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-display uppercase tracking-widest text-gray-400">File URL (Google Drive/PDF)</label>
              <input 
                placeholder="https://..." 
                value={formData.reportLink} 
                onChange={e=>setFormData({...formData, reportLink: e.target.value})} 
                className="w-full bg-[#222] border border-[#444] p-3 text-white font-sans text-sm focus:outline-none focus:border-[#9d4edd]" 
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-display uppercase tracking-widest text-gray-400 flex items-center justify-between">
                <span>Streams Breakdown</span>
                <span className="text-gray-600 text-[10px]">(JSON Format)</span>
              </label>
              <textarea 
                placeholder='{"Spotify": 1000, "Apple": 500}' 
                value={formData.streamsBreakdown} 
                onChange={e=>setFormData({...formData, streamsBreakdown: e.target.value})} 
                className="w-full bg-[#222] border border-[#444] p-3 text-white font-mono text-xs min-h-[80px] focus:outline-none focus:border-[#9d4edd]" 
              />
            </div>

            <button type="submit" className="w-full bg-[#9d4edd] text-white py-4 font-display uppercase tracking-widest text-xs font-bold hover:bg-[#7b2cbf] transition-colors mt-4">
              Push to Artist
            </button>
          </form>
        </div>

        {/* History Table */}
        <div className="col-span-1 lg:col-span-2 bg-[#111] border border-[#333] overflow-x-auto">
           <table className="w-full text-left text-sm font-sans">
              <thead className="bg-[#1a1a1a] text-gray-400 font-display uppercase tracking-widest text-[10px] border-b border-[#333]">
                <tr>
                  <th className="px-4 py-4">Artist</th>
                  <th className="px-4 py-4">Month</th>
                  <th className="px-4 py-4">Amount</th>
                  <th className="px-4 py-4 text-center">Attachment</th>
                  <th className="px-4 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222]">
                {reports.map((r, i) => (
                  <tr key={r.id || i} className="hover:bg-[#151515] transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-white block truncate max-w-[150px]">{getUserName(r.uid)}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{r.reportMonth}</td>
                    <td className="px-4 py-3 text-[#ccff00] font-mono font-bold">₹{r.amount}</td>
                    <td className="px-4 py-3 text-center">
                      {r.reportLink ? (
                        <a href={r.reportLink} target="_blank" rel="noopener noreferrer" className="inline-flex text-[#9d4edd] hover:text-white transition-colors">
                          <LinkIcon size={16} />
                        </a>
                      ) : (
                        <span className="text-gray-600">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => handleDelete(r.id, r.uid)}
                        className="text-gray-500 hover:text-red-500 transition-colors p-2"
                        title="Delete Report"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {reports.length === 0 && (
                   <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500 font-sans">
                      No royalty reports issued.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
        </div>

      </div>
    </div>
  );
}
