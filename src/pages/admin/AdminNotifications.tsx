import { useState, useEffect } from 'react';
import { collection, query, addDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { Bell, Send, Megaphone } from 'lucide-react';

export default function AdminNotifications() {
  const [formData, setFormData] = useState({ title: '', message: '', uid: '' });
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    // Get users for dropdown
    const q = query(collection(db, 'users'));
    const unsub = onSnapshot(q, (snap) => {
      setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const handleSendSingle = async (e: any) => {
    e.preventDefault();
    if (!formData.uid || formData.uid === 'ALL') {
      alert("Please select a specific artist from the dropdown.");
      return;
    }

    try {
      await addDoc(collection(db, 'notifications'), {
        uid: formData.uid,
        title: formData.title || 'System Notification',
        message: formData.message,
        read: false,
        createdAt: new Date().toISOString()
      });
      alert('Notification sent to artist.');
      setFormData({ ...formData, message: '', title: ''});
    } catch (err: any) {
      alert('Error sending notification: ' + err.message);
    }
  };

  const handleBroadcast = async (e: any) => {
    e.preventDefault();
    if (!formData.message || !formData.title) {
        alert("Broadcasts require a title and message.");
        return;
    }

    if (!window.confirm(`Are you sure you want to broadcast this message to ${users.length} users?`)) return;

    try {
      const promises = users.map(u => 
        addDoc(collection(db, 'notifications'), {
          uid: u.uid,
          title: `📢 ANNOUNCEMENT: ${formData.title}`,
          message: formData.message,
          read: false,
          createdAt: new Date().toISOString()
        })
      );
      await Promise.all(promises);
      alert(`Broadcast sent completely to ${users.length} users.`);
      setFormData({ uid: '', message: '', title: '' });
    } catch (err: any) {
      alert('Error sending broadcast: ' + err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-display uppercase tracking-tighter mb-2">Notifications & Announcements</h1>
        <p className="text-gray-400 font-sans text-sm">Send targeted updates or global platform broadcasts</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Single Target Notification */}
        <div className="bg-[#111] border border-[#333] p-6 lg:p-8 space-y-6">
          <div className="border-b border-[#333] pb-4">
            <h2 className="text-xl font-display uppercase tracking-widest text-[#9d4edd] flex items-center gap-2"><Bell size={20} /> Targeted Push</h2>
            <p className="text-xs text-gray-500 font-sans mt-1">Send a notification to a specific artist dashboard</p>
          </div>

          <form onSubmit={handleSendSingle} className="space-y-4">
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
              <label className="text-xs font-display uppercase tracking-widest text-gray-400">Title</label>
              <input 
                placeholder="e.g. Account Update" 
                value={formData.title} 
                onChange={e=>setFormData({...formData, title: e.target.value})} 
                className="w-full bg-[#222] border border-[#444] p-3 text-white font-sans focus:outline-none focus:border-[#9d4edd]" 
                required 
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-display uppercase tracking-widest text-gray-400">Message</label>
              <textarea 
                placeholder="Type your message here..." 
                value={formData.message} 
                onChange={e=>setFormData({...formData, message: e.target.value})} 
                className="w-full bg-[#222] border border-[#444] p-3 text-white font-sans min-h-[120px] focus:outline-none focus:border-[#9d4edd]" 
                required 
              />
            </div>

            <button type="submit" className="w-full bg-white text-black py-4 font-display uppercase tracking-widest text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#9d4edd] hover:text-white transition-colors">
              <Send size={14} /> Send Directly
            </button>
          </form>
        </div>

        {/* Global Broadcast */}
        <div className="bg-[#111] border border-[#333] p-6 lg:p-8 space-y-6">
          <div className="border-b border-[#333] pb-4">
            <h2 className="text-xl font-display uppercase tracking-widest text-[#ccff00] flex items-center gap-2"><Megaphone size={20} /> Global Broadcast</h2>
            <p className="text-xs text-gray-500 font-sans mt-1">Send an announcement to ALL users simultaneously.</p>
          </div>

          <form onSubmit={handleBroadcast} className="space-y-4 flex flex-col h-full">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-display uppercase tracking-widest text-gray-400">Broadcast Title</label>
              <input 
                placeholder="e.g. Platform update: New features!" 
                value={formData.title} 
                onChange={e=>setFormData({...formData, title: e.target.value})} 
                className="w-full bg-[#222] border border-[#444] p-3 text-white font-sans focus:outline-none focus:border-[#ccff00]" 
              />
            </div>

            <div className="flex flex-col gap-2 flex-1">
              <label className="text-xs font-display uppercase tracking-widest text-gray-400">Message body</label>
              <textarea 
                placeholder="Alert all your artists here..." 
                value={formData.message} 
                onChange={e=>setFormData({...formData, message: e.target.value})} 
                className="w-full h-full bg-[#222] border border-[#444] p-3 text-white font-sans min-h-[188px] flex-1 focus:outline-none focus:border-[#ccff00]" 
              />
            </div>

            <button type="button" onClick={handleBroadcast} className="w-full bg-[#ccff00] text-black py-4 font-display uppercase tracking-widest text-xs font-bold flex items-center justify-center gap-2 hover:bg-white transition-colors mt-auto">
              <Send size={14} /> Blast to All Artists
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
