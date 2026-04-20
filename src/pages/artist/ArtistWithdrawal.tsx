import { useState, useEffect } from 'react';
import { collection, addDoc, query, where, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';

export default function ArtistWithdrawal({ user }: { user: any }) {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ bankAccount: "", upiId: "", amount: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    const q = query(collection(db, 'withdrawals'), where('uid', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: any[] = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setWithdrawals(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'withdrawals', false);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user.uid]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    if (Number(formData.amount) <= 0 || (!formData.bankAccount && !formData.upiId)) {
      setError("Please provide a valid amount and either Bank Account or UPI ID.");
      setSubmitting(false);
      return;
    }

    try {
      await addDoc(collection(db, 'withdrawals'), {
        uid: user.uid,
        bankAccount: formData.bankAccount,
        upiId: formData.upiId,
        amount: Number(formData.amount),
        status: "Pending",
        createdAt: new Date().toISOString()
      });
      setFormData({ bankAccount: "", upiId: "", amount: "" });
    } catch (err: any) {
      if(err.message.includes('Missing or insufficient permissions')) {
        handleFirestoreError(err, OperationType.CREATE, 'withdrawals');
      } else {
        setError("Failed to submit request.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl grid md:grid-cols-2 gap-10">
      <div>
        <div className="mb-10">
          <h1 className="text-4xl font-display uppercase tracking-tighter mb-2">Withdrawals</h1>
          <p className="text-gray-400">Request your earnings straight to your bank or UPI.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#111] p-6 border border-[#333] space-y-6">
          {error && <div className="text-red-500 text-sm">{error}</div>}
          
          <div className="flex flex-col">
            <label className="text-xs font-display uppercase tracking-widest text-gray-500 mb-2">Amount (₹)</label>
            <input type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required className="bg-transparent border-b border-[#333] py-2 text-white font-sans focus:outline-none focus:border-[#ccff00]" />
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-display uppercase tracking-widest text-gray-500 mb-2">Bank Account Number</label>
            <input type="text" value={formData.bankAccount} onChange={e => setFormData({...formData, bankAccount: e.target.value})} className="bg-transparent border-b border-[#333] py-2 text-white font-sans focus:outline-none focus:border-[#ccff00]" />
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-display uppercase tracking-widest text-gray-500 mb-2">OR UPI ID</label>
            <input type="text" value={formData.upiId} onChange={e => setFormData({...formData, upiId: e.target.value})} className="bg-transparent border-b border-[#333] py-2 text-white font-sans focus:outline-none focus:border-[#ccff00]" />
          </div>

          <button type="submit" disabled={submitting} className="w-full bg-white text-black font-display font-bold py-4 uppercase tracking-widest hover:bg-[#ccff00] transition-colors disabled:opacity-50">
            {submitting ? "Requesting..." : "Request Withdrawal"}
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-xl font-display uppercase tracking-widest text-white mb-6 mt-2">History</h2>
        {loading ? (
          <div className="text-[#ccff00]">Loading...</div>
        ) : withdrawals.length === 0 ? (
          <p className="text-gray-500 font-sans">No withdrawal history.</p>
        ) : (
          <div className="space-y-4">
            {withdrawals.map(w => (
              <div key={w.id} className="bg-[#111] p-4 border border-[#333] flex justify-between items-center">
                <div>
                  <div className="text-lg font-display text-white mb-1">₹{w.amount.toFixed(2)}</div>
                  <div className="text-xs text-gray-500 font-sans">{new Date(w.createdAt).toLocaleDateString()}</div>
                </div>
                <div className={`px-3 py-1 text-xs font-display uppercase tracking-widest font-bold ${w.status === 'Paid' ? 'bg-[#ccff00]/10 text-[#ccff00]' : 'bg-yellow-500/10 text-yellow-500'}`}>
                  {w.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
