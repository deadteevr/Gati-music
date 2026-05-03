import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, updateDoc, doc, addDoc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { CheckCircle2, IndianRupee, X, Loader2 } from 'lucide-react';

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [note, setNote] = useState("Processed");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'withdrawals'));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({id: d.id, ...d.data()}));
      list.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setWithdrawals(list);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'withdrawals', false);
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleMarkPaid = async () => {
    if (!processingId) return;
    const w = withdrawals.find(item => item.id === processingId);
    if (!w) return;

    setSubmitting(true);
    try {
      await updateDoc(doc(db, 'withdrawals', w.id), { 
        status: 'Paid', 
        transactionNote: note,
        updatedAt: new Date().toISOString()
      });
      
      // Fetch artist email
      let artistEmail = '';
      const userSnap = await getDoc(doc(db, 'users', w.uid));
      if (userSnap.exists()) {
        artistEmail = userSnap.data()?.email;
      }

      // Auto Notification
      await addDoc(collection(db, 'notifications'), {
        uid: w.uid,
        title: "Withdrawal Processed",
        message: `Your withdrawal of ₹${w.amount} has been processed. Note: ${note}`,
        read: false,
        createdAt: new Date().toISOString()
      });

      // Send Email Notification
      if (artistEmail) {
        try {
          await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: artistEmail,
              subject: `Withdrawal Processed: ₹${w.amount}`,
              text: `Hello, your withdrawal request for ₹${w.amount} has been processed.\n\nNote/TxID: ${note}\n\nLog in to your Gati dashboard for details.`
            })
          });
        } catch (emailErr) {
          console.error("Failed to send email notification:", emailErr);
        }
      }

      setProcessingId(null);
      setNote("Processed");
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `withdrawals/${w.id}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-[#ccff00]" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 relative">
      <div>
        <h1 className="text-3xl font-display uppercase tracking-tighter mb-2">Withdrawal Requests</h1>
        <p className="text-gray-400 font-sans text-sm">Review and process payment requests from artists.</p>
      </div>

      <div className="bg-[#111] border border-[#333] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm font-sans">
            <thead className="bg-[#1a1a1a] text-gray-400 font-display uppercase tracking-widest text-[10px] border-b border-[#333]">
              <tr>
                <th className="px-6 py-4">Artist / Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Payout Details</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              {withdrawals.map(w => (
                <tr key={w.id} className="hover:bg-[#151515] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-white font-mono text-[10px] uppercase truncate max-w-[120px]" title={w.uid}>{w.uid}</span>
                      <span className="text-[10px] text-gray-500 mt-1">{new Date(w.createdAt).toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-lg font-display text-[#ccff00] font-black tracking-tighter">₹{w.amount}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="bg-[#050505] p-3 border border-[#222] rounded-sm space-y-1">
                      {w.upiId && (
                        <div className="flex justify-between gap-4">
                          <span className="text-[10px] uppercase text-gray-500">UPI ID</span>
                          <span className="text-xs text-white font-mono">{w.upiId}</span>
                        </div>
                      )}
                      {w.bankAccount && (
                        <div className="flex justify-between gap-4">
                          <span className="text-[10px] uppercase text-gray-500">Bank A/C</span>
                          <span className="text-xs text-white font-mono">{w.bankAccount}</span>
                        </div>
                      )}
                      {w.ifscCode && (
                        <div className="flex justify-between gap-4">
                          <span className="text-[10px] uppercase text-gray-500">IFSC</span>
                          <span className="text-xs text-white font-mono">{w.ifscCode}</span>
                        </div>
                      )}
                      {w.accountHolderName && (
                        <div className="flex justify-between gap-4 border-t border-[#111] pt-1 mt-1">
                          <span className="text-[10px] uppercase text-gray-500">Holder</span>
                          <span className="text-xs text-gray-300">{w.accountHolderName}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${w.status === 'Paid' ? 'bg-[#ccff00]' : 'animate-pulse bg-yellow-500'}`}></div>
                      <span className={`text-[10px] font-display uppercase tracking-widest font-black ${w.status === 'Paid' ? 'text-[#ccff00]' : 'text-yellow-500'}`}>
                        {w.status}
                      </span>
                    </div>
                    {w.transactionNote && (
                      <p className="text-[10px] text-gray-500 mt-1 italic">"{w.transactionNote}"</p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {w.status === 'Pending' ? (
                      <button 
                        onClick={() => setProcessingId(w.id)}
                        className="bg-white hover:bg-[#ccff00] text-black px-4 py-2 font-display uppercase tracking-widest text-[10px] font-black transition-all hover:scale-105 active:scale-95"
                      >
                        Process Payout
                      </button>
                    ) : (
                      <div className="flex items-center justify-end gap-2 text-gray-600">
                        <CheckCircle2 size={14} />
                        <span className="text-[10px] font-display uppercase tracking-widest font-black">Settled</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {withdrawals.length === 0 && (
           <div className="py-20 text-center">
            <p className="text-gray-600 font-display uppercase tracking-widest text-sm">No pending requests at this time</p>
          </div>
        )}
      </div>

      {/* Processing Modal */}
      {processingId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111] border border-[#333] w-full max-w-md p-8 relative shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <button 
              onClick={() => setProcessingId(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            <div className="mb-6">
              <h3 className="text-2xl font-display uppercase font-black text-white tracking-tighter mb-2">Confirm Payment</h3>
              <p className="text-sm text-gray-400 font-sans">Enter a transaction ID or note to the artist.</p>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="flex flex-col">
                <label className="text-[10px] font-display uppercase tracking-widest text-gray-500 mb-2">Note / Tx ID</label>
                <input 
                  type="text" 
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="e.g. UPI Ref: 123456789"
                  className="bg-[#050505] border border-[#333] p-4 text-white focus:outline-none focus:border-[#ccff00] transition-colors"
                  autoFocus
                />
              </div>
            </div>

            <button 
              onClick={handleMarkPaid}
              disabled={submitting}
              className="w-full bg-[#ccff00] text-black py-4 font-display font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white transition-colors disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Processing...
                </>
              ) : (
                <>
                  <IndianRupee size={20} />
                  Complete Payment
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
