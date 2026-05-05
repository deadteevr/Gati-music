import { useState, useEffect, useMemo } from 'react';
import { collection, addDoc, query, where, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { CreditCard, Wallet, Landmark, History, AlertCircle, CheckCircle2, ChevronRight, Share2 } from 'lucide-react';

export default function ArtistWithdrawal({ user }: { user: any }) {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [royalties, setRoyalties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [method, setMethod] = useState<'bank' | 'upi' | 'paypal'>('upi');
  const [formData, setFormData] = useState({ bankAccount: "", ifsc: "", upiId: "", paypalEmail: "", amount: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Fetch withdrawals
    const qW = query(collection(db, 'withdrawals'), where('uid', '==', user.uid));
    const unsubW = onSnapshot(qW, (snapshot) => {
      const data: any[] = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setWithdrawals(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'withdrawals', false);
    });

    // Fetch royalties for balance
    const qR = query(collection(db, 'royalties'), where('uid', '==', user.uid));
    const unsubR = onSnapshot(qR, (snapshot) => {
      const data: any[] = [];
      snapshot.forEach(doc => data.push(doc.data()));
      setRoyalties(data);
    });

    return () => {
      unsubW();
      unsubR();
    };
  }, [user.uid]);

  const totalEarned = useMemo(() => royalties.reduce((sum, r) => sum + r.amount, 0), [royalties]);
  const totalWithdrawn = useMemo(() => 
    withdrawals.filter(w => w.status === 'Paid' || w.status === 'Pending').reduce((sum, w) => sum + w.amount, 0), 
  [withdrawals]);
  
  const currentBalance = totalEarned - totalWithdrawn;

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSubmitting(true);

    const amount = Number(formData.amount);

    if (amount <= 0) {
      setError(`Please enter a valid amount.`);
      setSubmitting(false);
      return;
    }

    if (amount > currentBalance) {
      setError("Insufficient balance.");
      setSubmitting(false);
      return;
    }

    if (method === 'bank' && (!formData.bankAccount || !formData.ifsc)) {
      setError("Please provide bank account and IFSC code.");
      setSubmitting(false);
      return;
    }

    if (method === 'upi' && !formData.upiId) {
      setError("Please provide a valid UPI ID.");
      setSubmitting(false);
      return;
    }

    if (method === 'paypal' && !formData.paypalEmail) {
      setError("Please provide a valid PayPal email.");
      setSubmitting(false);
      return;
    }

    try {
      await addDoc(collection(db, 'withdrawals'), {
        uid: user.uid,
        method,
        details: {
          bankAccount: formData.bankAccount,
          ifsc: formData.ifsc,
          upiId: formData.upiId,
          paypalEmail: formData.paypalEmail,
        },
        amount: amount,
        status: "Pending",
        createdAt: new Date().toISOString()
      });
      setFormData({ bankAccount: "", ifsc: "", upiId: "", paypalEmail: "", amount: "" });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.CREATE, 'withdrawals');
      setError("Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pb-20">
      <div className="mb-10">
        <h1 className="text-4xl font-display uppercase tracking-tighter mb-2">Payouts</h1>
        <p className="text-gray-400">Securely withdraw your hard-earned royalties.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          {/* Balance Card */}
          <div className="bg-[#ccff00] p-8 text-black">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-[10px] font-display uppercase tracking-widest font-black opacity-60 mb-1">Available for Withdrawal</div>
                <div className="text-5xl font-display font-medium tracking-tighter">₹{currentBalance.toFixed(2)}</div>
              </div>
              <Wallet size={32} strokeWidth={1.5} />
            </div>
            
            <div className="pt-4 border-t border-black/10">
              <p className="text-[10px] font-display uppercase tracking-widest font-black opacity-60 leading-relaxed">
                Note: All available royalties are processed automatically into your linked payment method every month. 
                Manual requests are processed within 3-5 business days.
              </p>
            </div>
          </div>

          {/* Request Form */}
          <div className="bg-[#111] border border-[#333] overflow-hidden">
            <div className="p-1 bg-[#222] flex">
              <button 
                onClick={() => setMethod('upi')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-display uppercase tracking-widest font-bold transition-all ${method === 'upi' ? 'bg-[#111] text-[#ccff00]' : 'text-gray-500 hover:text-white'}`}
              >
                <Share2 size={14} /> UPI
              </button>
              <button 
                onClick={() => setMethod('bank')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-display uppercase tracking-widest font-bold transition-all ${method === 'bank' ? 'bg-[#111] text-[#ccff00]' : 'text-gray-500 hover:text-white'}`}
              >
                <Landmark size={14} /> Bank
              </button>
              <button 
                onClick={() => setMethod('paypal')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-display uppercase tracking-widest font-bold transition-all ${method === 'paypal' ? 'bg-[#111] text-[#ccff00]' : 'text-gray-500 hover:text-white'}`}
              >
                <CreditCard size={14} /> PayPal
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 text-xs font-sans flex items-center gap-2">
                  <AlertCircle size={14} /> {error}
                </div>
              )}
              {success && (
                <div className="bg-[#ccff00]/10 border border-[#ccff00]/20 text-[#ccff00] p-4 text-xs font-sans flex items-center gap-2">
                  <CheckCircle2 size={14} /> Request submitted successfully!
                </div>
              )}
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex flex-col space-y-2">
                  <label className="text-[10px] font-display uppercase tracking-widest text-gray-500">Withdrawal Amount (₹)</label>
                  <input 
                    type="number" 
                    value={formData.amount} 
                    onChange={e => setFormData({...formData, amount: e.target.value})} 
                    placeholder={`Enter amount`}
                    className="bg-transparent border-b border-[#333] py-2 text-white font-sans focus:outline-none focus:border-[#ccff00] transition-colors" 
                  />
                  <p className="text-[9px] text-gray-600 uppercase font-display tracking-widest">Available: ₹{currentBalance.toFixed(0)}</p>
                </div>

                {method === 'upi' && (
                  <div className="flex flex-col space-y-2">
                    <label className="text-[10px] font-display uppercase tracking-widest text-gray-500">UPI ID</label>
                    <input 
                      type="text" 
                      value={formData.upiId} 
                      onChange={e => setFormData({...formData, upiId: e.target.value})} 
                      placeholder="username@bank"
                      className="bg-transparent border-b border-[#333] py-2 text-white font-sans focus:outline-none focus:border-[#ccff00] transition-colors" 
                    />
                  </div>
                )}

                {method === 'bank' && (
                  <>
                    <div className="flex flex-col space-y-2">
                      <label className="text-[10px] font-display uppercase tracking-widest text-gray-500">Account Number</label>
                      <input 
                        type="text" 
                        value={formData.bankAccount} 
                        onChange={e => setFormData({...formData, bankAccount: e.target.value})} 
                        className="bg-transparent border-b border-[#333] py-2 text-white font-sans focus:outline-none focus:border-[#ccff00]" 
                      />
                    </div>
                    <div className="flex flex-col space-y-2">
                      <label className="text-[10px] font-display uppercase tracking-widest text-gray-500">IFSC Code</label>
                      <input 
                        type="text" 
                        value={formData.ifsc} 
                        onChange={e => setFormData({...formData, ifsc: e.target.value})} 
                        placeholder="SBIN0001234"
                        className="bg-transparent border-b border-[#333] py-3 text-white font-sans focus:outline-none focus:border-[#ccff00]" 
                      />
                    </div>
                  </>
                )}

                {method === 'paypal' && (
                  <div className="flex flex-col space-y-2">
                    <label className="text-[10px] font-display uppercase tracking-widest text-gray-500">PayPal Email</label>
                    <input 
                      type="email" 
                      value={formData.paypalEmail} 
                      onChange={e => setFormData({...formData, paypalEmail: e.target.value})} 
                      placeholder="your@email.com"
                      className="bg-transparent border-b border-[#333] py-2 text-white font-sans focus:outline-none focus:border-[#ccff00] transition-colors" 
                    />
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                disabled={submitting || currentBalance <= 0} 
                className="w-full bg-white text-black font-display font-bold py-5 uppercase tracking-widest text-xs hover:bg-[#ccff00] transition-all disabled:opacity-30 disabled:hover:bg-white"
              >
                {submitting ? "Processing..." : "Submit Payout Request"}
              </button>
            </form>
          </div>
        </div>

        {/* History & Royalties Sidebar */}
        <div className="space-y-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Wallet size={16} className="text-[#ccff00]" />
              <h2 className="text-lg font-display uppercase tracking-widest text-white">Recent Earnings</h2>
            </div>
            
            {royalties.length === 0 ? (
              <div className="p-6 border border-dashed border-[#333] text-center text-gray-500 text-xs">
                No royalty records yet.
              </div>
            ) : (
              <div className="space-y-3">
                {royalties.slice(0, 5).map((r, i) => (
                  <div key={i} className="bg-[#111] border border-[#222] p-4 flex justify-between items-center text-xs">
                    <div>
                      <div className="text-white font-medium">{r.reportMonth || 'General Royalty'}</div>
                      <div className="text-gray-500 text-[10px] uppercase font-mono mt-1">{new Date(r.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className="text-[#ccff00] font-display font-bold">₹{r.amount.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <History size={16} className="text-[#9d4edd]" />
              <h2 className="text-lg font-display uppercase tracking-widest text-white">Payout History</h2>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1,2,3].map(i => <div key={i} className="h-20 bg-[#111] animate-pulse"></div>)}
              </div>
            ) : withdrawals.length === 0 ? (
              <div className="p-10 border border-dashed border-[#333] text-center">
                <p className="text-gray-500 text-xs font-sans">No transactions found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {withdrawals.map(w => (
                  <div key={w.id} className="bg-[#111] border border-[#333] p-5 group hover:border-[#ccff00]/50 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="text-xl font-display font-bold text-white">₹{w.amount.toFixed(2)}</div>
                        <div className="text-[10px] text-gray-500 font-sans mt-1 uppercase tracking-widest">
                          {new Date(w.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                      <span className={`text-[9px] font-display uppercase tracking-widest px-2 py-1 font-black ${
                        w.status === 'Paid' ? 'bg-[#ccff00] text-black shadow-[0_0_10px_rgba(204,255,0,0.2)]' : 
                        w.status === 'Rejected' ? 'bg-red-500/20 text-red-500' :
                        'bg-yellow-500/10 text-yellow-500'
                      }`}>
                        {w.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-[#222] pt-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-black rounded">
                          {w.method === 'upi' ? <Share2 size={10} className="text-blue-400" /> : 
                           w.method === 'bank' ? <Landmark size={10} className="text-purple-400" /> : 
                           <CreditCard size={10} className="text-gray-400" />}
                        </div>
                        <span className="text-[10px] text-gray-400 font-sans uppercase truncate max-w-[120px]">
                          {w.method === 'upi' ? w.details?.upiId : 
                           w.method === 'bank' ? `AC ending in ...${w.details?.bankAccount?.slice(-4)}` : 
                           w.details?.paypalEmail}
                        </span>
                      </div>
                      <button className="text-gray-600 hover:text-white transition-colors">
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
