import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, updateDoc, doc, addDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { CheckCircle2, IndianRupee } from 'lucide-react';

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'withdrawals'));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({id: d.id, ...d.data()}));
      list.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setWithdrawals(list);
    });
    return unsub;
  }, []);

  const markPaid = async (w: any) => {
    // Don't auto-prompt here because it requires a browser prompt. Using a simpler flow
    const confirmNote = window.prompt("Optionally provide a transaction ID or note to the user:", "Processed");
    if (confirmNote === null) return; // cancelled

    try {
      await updateDoc(doc(db, 'withdrawals', w.id), { status: 'Paid', transactionNote: confirmNote });
      
      // Auto Notification
      await addDoc(collection(db, 'notifications'), {
        uid: w.uid,
        title: "Withdrawal Processed",
        message: `Your withdrawal of ₹${w.amount} has been structurally processed. Note: ${confirmNote}`,
        read: false,
        createdAt: new Date().toISOString()
      });

    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `withdrawals/${w.id}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-display uppercase tracking-tighter mb-2">Withdrawals</h1>
        <p className="text-gray-400 font-sans text-sm">Manage payment requests from artists</p>
      </div>

      <div className="bg-[#111] border border-[#333] overflow-x-auto">
        <table className="w-full text-left text-sm font-sans">
          <thead className="bg-[#1a1a1a] text-gray-400 font-display uppercase tracking-widest text-xs border-b border-[#333]">
            <tr>
              <th className="px-6 py-4">Request Info</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Bank/UPI Details</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222]">
            {withdrawals.map(w => (
              <tr key={w.id} className="hover:bg-[#151515] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-white mb-1">UID: <span className="font-mono text-xs font-normal text-gray-400">{w.uid}</span></span>
                    <span className="text-xs text-gray-500">{new Date(w.createdAt).toLocaleString()}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-[#ccff00] font-mono font-bold text-lg">
                  ₹{w.amount}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col text-xs text-gray-300 gap-1 bg-[#222] p-2 border border-[#333]">
                    {w.upiId && <p><span className="text-gray-500 font-display uppercase tracking-widest">UPI:</span> {w.upiId}</p>}
                    {w.bankAccount && <p><span className="text-gray-500 font-display uppercase tracking-widest">A/C:</span> {w.bankAccount}</p>}
                    {w.ifscCode && <p><span className="text-gray-500 font-display uppercase tracking-widest">IFSC:</span> {w.ifscCode}</p>}
                    {w.accountHolderName && <p><span className="text-gray-500 font-display uppercase tracking-widest">Name:</span> {w.accountHolderName}</p>}
                  </div>
                </td>
                <td className="px-6 py-4">
                   <span className={`text-xs uppercase tracking-widest font-bold ${w.status === 'Paid' ? 'text-green-500' : 'text-yellow-500'}`}>
                    {w.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {w.status === 'Pending' ? (
                    <button 
                      onClick={() => markPaid(w)}
                      className="inline-flex items-center gap-1 bg-white hover:bg-[#ccff00] text-black px-4 py-2 font-display uppercase tracking-widest text-xs font-bold transition-colors"
                    >
                      <IndianRupee size={14} /> Mark Paid
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-green-500 font-display uppercase tracking-widest text-xs font-bold px-4 py-2 opacity-50 cursor-not-allowed">
                      <CheckCircle2 size={14} /> Paid
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {withdrawals.length === 0 && (
               <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500 font-sans">
                  No withdrawal requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
