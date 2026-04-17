import { useState, useEffect } from 'react';
import { Save, ShieldAlert, CreditCard } from 'lucide-react';
import { doc, updateDoc, collection, query, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';

export default function AdminSettings() {
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  
  // Quick Artist Plan Override State
  const [overrideData, setOverrideData] = useState({
    uid: '',
    plan: 'Basic',
    planExpiry: ''
  });

  const [settings, setSettings] = useState({
    whatsappOverride: '917626841258',
    minimumWithdrawal: 1000,
    platformNoticeText: ''
  });

  useEffect(() => {
    // Get users for dropdown
    const q = query(collection(db, 'users'));
    const unsub = onSnapshot(q, (snap) => {
      setUsers(snap.docs.filter(d => d.data().role !== 'admin').map(d => ({ uid: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    // Mimic network request saving
    setTimeout(() => {
      setSaving(false);
      alert('Global settings updated. (Note: Handled virtually in this MVP build).');
    }, 800);
  };

  const handlePlanOverride = async () => {
    if (!overrideData.uid) return alert('Select an artist');
    try {
      await updateDoc(doc(db, 'users', overrideData.uid), {
        plan: overrideData.plan,
        planExpiry: overrideData.planExpiry
      });
      alert('Artist plan successfully updated directly from overrides.');
      setOverrideData({ uid: '', plan: 'Basic', planExpiry: '' });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${overrideData.uid}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-display uppercase tracking-tighter mb-2">Platform Settings</h1>
        <p className="text-gray-400 font-sans text-sm">Configure global platform toggles</p>
      </div>

      {/* ARTIST PLAN OVERRIDE */}
      <div className="bg-[#111] border border-[#333] p-6 lg:p-8 space-y-6">
        <div className="border-b border-[#333] pb-4">
           <h2 className="text-lg font-display uppercase tracking-widest text-blue-400 flex items-center gap-2">
             <CreditCard size={18} /> Quick Artist Plan Override
           </h2>
           <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">Rapidly patch a user's subscription tier without opening their full profile.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-display uppercase tracking-widest text-gray-500">Select Artist</label>
              <select 
                value={overrideData.uid} 
                onChange={e=>setOverrideData({...overrideData, uid: e.target.value})}
                className="bg-[#222] border border-[#444] text-white p-3 text-sm font-sans focus:outline-none focus:border-blue-400"
              >
                <option value="">-- Choose Artist --</option>
                {users.map(u => (
                  <option key={u.uid} value={u.uid}>{u.displayName || u.name || 'No Name'} ({u.email})</option>
                ))}
              </select>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-display uppercase tracking-widest text-gray-500">Change Plan</label>
              <select 
                value={overrideData.plan} 
                onChange={e=>setOverrideData({...overrideData, plan: e.target.value})}
                className="bg-[#222] border border-[#444] text-white p-3 text-sm font-sans focus:outline-none focus:border-blue-400"
              >
                  <option>Free</option>
                  <option>Basic</option>
                  <option>Monthly</option>
                  <option>Yearly</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-display uppercase tracking-widest text-gray-500">Change Expiry Date</label>
              <input 
                type="date"
                value={overrideData.planExpiry} 
                onChange={e=>setOverrideData({...overrideData, planExpiry: e.target.value})}
                className="bg-[#222] border border-[#444] text-white p-3 text-sm font-sans focus:outline-none focus:border-blue-400"
              />
            </div>
        </div>
        <div className="flex justify-end pt-2">
          <button onClick={handlePlanOverride} className="bg-blue-600 text-white px-6 py-2 font-display uppercase tracking-widest text-xs font-bold hover:bg-blue-700 transition-colors">
            Update Plan Instantly
          </button>
        </div>
      </div>

      <div className="bg-[#111] border border-[#333] p-6 lg:p-8 space-y-8">
        {/* Core Links */}
        <div>
          <h2 className="text-lg font-display uppercase tracking-widest text-white border-b border-[#222] pb-2 mb-4">Support & Contact</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-display uppercase tracking-widest text-gray-500">Global WhatsApp Number</label>
              <input 
                value={settings.whatsappOverride}
                onChange={e => setSettings({...settings, whatsappOverride: e.target.value})}
                className="bg-[#222] border border-[#444] text-white p-3 text-sm font-mono focus:outline-none focus:border-[#9d4edd]"
              />
              <p className="text-[10px] text-gray-500">Ties to all floating buttons across the platform.</p>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-display uppercase tracking-widest text-gray-500">Notification Templates</label>
              <button disabled className="bg-[#222] border border-[#444] text-gray-500 p-3 text-sm font-display text-left">
                Edit JSON Templates (Locked)
              </button>
            </div>
          </div>
        </div>

        {/* Configurations */}
        <div>
          <h2 className="text-lg font-display uppercase tracking-widest text-white border-b border-[#222] pb-2 mb-4">Financial Rules & Plans</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-display uppercase tracking-widest text-gray-500">Minimum Withdrawal Limit (₹)</label>
              <input 
                type="number"
                value={settings.minimumWithdrawal}
                onChange={e => setSettings({...settings, minimumWithdrawal: Number(e.target.value)})}
                className="bg-[#222] border border-[#444] text-white p-3 text-sm font-mono focus:outline-none focus:border-[#9d4edd]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-display uppercase tracking-widest text-gray-500">Plan Pricing Editor</label>
              <button disabled className="bg-[#222] border border-[#444] text-gray-500 p-3 text-sm font-display text-left">
                Edit Tiers (Locked)
              </button>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-display uppercase tracking-widest text-gray-500">Admin Account</label>
              <button disabled className="bg-[#222] border border-[#444] text-gray-500 p-3 text-sm font-display text-left">
                Change Password (Locked)
              </button>
            </div>
          </div>
        </div>
        
        {/* Alerts */}
        <div>
          <h2 className="text-lg font-display uppercase tracking-widest text-white border-b border-[#222] pb-2 mb-4 flex items-center gap-2">
            <ShieldAlert size={16} className="text-red-500" /> Platform Banner Toggle
          </h2>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-display uppercase tracking-widest text-gray-500">Emergency Maintenance Banner Text</label>
            <textarea 
              placeholder="Leave blank to disable banner..."
              value={settings.platformNoticeText}
              onChange={e => setSettings({...settings, platformNoticeText: e.target.value})}
              className="w-full bg-[#222] border border-[#444] p-3 text-sm text-white font-sans min-h-[80px] focus:outline-none focus:border-[#9d4edd]"
            />
          </div>
        </div>

        <div className="pt-6 border-t border-[#333] flex justify-end">
          <button 
            onClick={handleSaveSettings}
            disabled={saving}
            className="bg-[#9d4edd] text-white px-8 py-3 font-display uppercase tracking-widest text-xs font-bold hover:bg-[#7b2cbf] transition-colors flex items-center gap-2"
          >
            <Save size={16} /> {saving ? 'Saving System...' : 'Commit Settings'}
          </button>
        </div>

      </div>
    </div>
  );
}
