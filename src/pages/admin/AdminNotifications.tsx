import { useState, useEffect } from 'react';
import { collection, query, addDoc, onSnapshot, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { Bell, Send, Megaphone } from 'lucide-react';

export default function AdminNotifications() {
  const [singleData, setSingleData] = useState({ title: '', message: '', uid: '' });
  const [broadcastData, setBroadcastData] = useState({ title: '', message: '' });
  const [users, setUsers] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'send' | 'feedback'>('send');

  useEffect(() => {
    // Get users for dropdown
    const qUsers = query(collection(db, 'users'));
    const unsubUsers = onSnapshot(qUsers, (snap) => {
      const fetchedUsers = snap.docs.map(d => ({ uid: d.id, ...d.data() }));
      setUsers(fetchedUsers);
    }, (error) => {
      console.error("AdminNotifications: users snapshot error", error);
    });

    // Get feedback
    const qFeedback = query(collection(db, 'feedback'), orderBy('createdAt', 'desc'));
    const unsubFeedback = onSnapshot(qFeedback, (snap) => {
      setFeedback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => {
      console.error("AdminNotifications: feedback snapshot error", error);
    });

    return () => {
      unsubUsers();
      unsubFeedback();
    };
  }, []);

  const handleSendSingle = async (e: any) => {
    e.preventDefault();
    if (!singleData.uid || singleData.uid === 'ALL') {
      alert("Please select a specific artist from the dropdown.");
      return;
    }

    try {
      await addDoc(collection(db, 'notifications'), {
        uid: singleData.uid,
        title: singleData.title || 'System Notification',
        message: singleData.message,
        read: false,
        createdAt: new Date().toISOString()
      });
      alert('Notification sent to artist.');
      setSingleData({ ...singleData, message: '', title: ''});
    } catch (err: any) {
      alert('Error sending notification: ' + err.message);
    }
  };

  const handleBroadcast = async (e: any) => {
    e.preventDefault();
    if (!broadcastData.message || !broadcastData.title) {
        alert("Broadcasts require a title and message.");
        return;
    }

    if (!window.confirm(`Are you sure you want to broadcast this message to ${users.length} users?`)) return;

    try {
      const promises = users.map(u => 
        addDoc(collection(db, 'notifications'), {
          uid: u.uid,
          title: `📢 ANNOUNCEMENT: ${broadcastData.title}`,
          message: broadcastData.message,
          read: false,
          createdAt: new Date().toISOString()
        })
      );
      await Promise.all(promises);
      alert(`Broadcast sent completely to ${users.length} users.`);
      setBroadcastData({ message: '', title: '' });
    } catch (err: any) {
      alert('Error sending broadcast: ' + err.message);
    }
  };

  const templates = [
    { title: 'New Feature Alert', message: 'We have just launched a new feature! Check out the "Marketing" tab in your dashboard to promote your songs better.' },
    { title: 'Maintenance Update', message: 'Scheduled maintenance will occur tomorrow at 2:00 AM IST. The platform will be offline for approximately 30 minutes.' },
    { title: 'Payout Processed', message: 'Good news! All pending royalty payouts for the previous month have been processed. Please check your "Royalties" section.' },
    { title: 'New Content Guidelines', message: 'We have updated our content guidelines. Please ensure all new submissions adhere to the latest metadata requirements.' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-display uppercase tracking-tighter mb-2">Notifications & Announcements</h1>
        <p className="text-gray-400 font-sans text-sm">Send targeted updates or global platform broadcasts</p>
      </div>

      <div className="flex border-b border-[#333] mb-8">
        <button 
          onClick={() => setActiveTab('send')}
          className={`px-8 py-4 text-xs font-display uppercase tracking-[0.2em] relative transition-colors ${activeTab === 'send' ? 'text-[#9d4edd]' : 'text-gray-500 hover:text-white'}`}
        >
          Send Notifications
          {activeTab === 'send' && <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#9d4edd]" />}
        </button>
        <button 
          onClick={() => setActiveTab('feedback')}
          className={`px-8 py-4 text-xs font-display uppercase tracking-[0.2em] relative transition-colors ${activeTab === 'feedback' ? 'text-[#ccff00]' : 'text-gray-500 hover:text-white'}`}
        >
          Artist Feedback {feedback.filter(f => f.status === 'new').length > 0 && `(${feedback.filter(f => f.status === 'new').length})`}
          {activeTab === 'feedback' && <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#ccff00]" />}
        </button>
      </div>

      {activeTab === 'send' ? (
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
                  value={singleData.uid} 
                  onChange={e=>setSingleData({...singleData, uid: e.target.value})}
                  className="bg-[#222] border border-[#444] text-white p-3 font-sans focus:outline-none focus:border-[#9d4edd]"
                  required
                >
                  <option value="">-- Choose Artist --</option>
                  {users.filter(u => u.role === 'artist').map(u => (
                    <option key={u.uid} value={u.uid}>{u.displayName || 'No Name'} ({u.email})</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-display uppercase tracking-widest text-gray-400">Title</label>
                <input 
                  placeholder="e.g. Account Update" 
                  value={singleData.title} 
                  onChange={e=>setSingleData({...singleData, title: e.target.value})} 
                  className="w-full bg-[#222] border border-[#444] p-3 text-white font-sans focus:outline-none focus:border-[#9d4edd]" 
                  required 
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-display uppercase tracking-widest text-gray-400">Message</label>
                <textarea 
                  placeholder="Type your message here..." 
                  value={singleData.message} 
                  onChange={e=>setSingleData({...singleData, message: e.target.value})} 
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
                <label className="text-[10px] font-display uppercase tracking-widest text-gray-500 mb-1">Quick Templates</label>
                <div className="grid grid-cols-2 gap-2">
                   {templates.map((t, i) => (
                     <button 
                       key={i}
                       type="button"
                       onClick={() => setBroadcastData({ title: t.title, message: t.message })}
                       className="text-[9px] text-left p-2 border border-[#333] hover:border-[#ccff00] transition-colors bg-black/50 truncate"
                     >
                        {t.title}
                     </button>
                   ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-display uppercase tracking-widest text-gray-400">Broadcast Title</label>
                <input 
                  placeholder="e.g. Platform update: New features!" 
                  value={broadcastData.title} 
                  onChange={e=>setBroadcastData({...broadcastData, title: e.target.value})} 
                  className="w-full bg-[#222] border border-[#444] p-3 text-white font-sans focus:outline-none focus:border-[#ccff00]" 
                />
              </div>

              <div className="flex flex-col gap-2 flex-1">
                <label className="text-xs font-display uppercase tracking-widest text-gray-400">Message body</label>
                <textarea 
                  placeholder="Alert all your artists here..." 
                  value={broadcastData.message} 
                  onChange={e=>setBroadcastData({...broadcastData, message: e.target.value})} 
                  className="w-full h-full bg-[#222] border border-[#444] p-3 text-white font-sans min-h-[188px] flex-1 focus:outline-none focus:border-[#ccff00]" 
                />
              </div>

              <button type="submit" className="w-full bg-[#ccff00] text-black py-4 font-display uppercase tracking-widest text-xs font-bold flex items-center justify-center gap-2 hover:bg-white transition-colors mt-auto">
                <Send size={14} /> Blast to All Artists
              </button>
            </form>
          </div>

        </div>
      ) : (
        <div className="space-y-4">
           {feedback.length === 0 ? (
             <div className="p-20 text-center border border-dashed border-[#333] bg-[#111]">
               <p className="text-gray-500 font-sans italic">No artist feedback received yet.</p>
             </div>
           ) : (
             feedback.map((f) => (
                <div key={f.id} className={`p-6 border ${f.status === 'new' ? 'border-[#ccff00] bg-[#111]' : 'border-[#333] bg-[#0a0a0a] opacity-70'} group`}>
                   <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-white font-bold text-sm mb-1">{f.userName || 'Anonymous Artist'}</h4>
                        <p className="text-gray-500 text-[10px] font-mono">{f.userEmail}</p>
                      </div>
                      <div className="text-right">
                         <span className="text-[10px] text-gray-500 font-mono block mb-1">{new Date(f.createdAt?.toDate ? f.createdAt.toDate() : f.createdAt).toLocaleString()}</span>
                         {f.status === 'new' && <span className="bg-[#ccff00] text-black text-[8px] font-display font-black px-2 py-0.5 uppercase tracking-widest">New</span>}
                      </div>
                   </div>
                   <p className="text-gray-300 font-sans text-sm leading-relaxed border-l-2 border-[#333] pl-4 py-2 italic bg-black/30">
                      "{f.message}"
                   </p>
                   <div className="mt-4 flex gap-2">
                      <button 
                        onClick={async () => {
                          try {
                            await updateDoc(doc(db, 'feedback', f.id), { status: 'reviewed' });
                          } catch (e) {
                            console.error(e);
                          }
                        }}
                        className="text-[10px] font-display uppercase tracking-widest text-gray-500 hover:text-[#ccff00] transition-colors"
                      >
                         Mark as Reviewed
                      </button>
                   </div>
                </div>
             ))
           )}
        </div>
      )}
    </div>
  );
}
