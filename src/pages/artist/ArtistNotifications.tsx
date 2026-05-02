import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { Bell, Info, ShieldAlert, Sparkles, CheckCircle2, TrendingUp, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ArtistNotifications({ user }: { user: any }) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'personal' | 'announcements'>('personal');

  useEffect(() => {
    // Personal Notifications
    const q = query(collection(db, 'notifications'), where('uid', '==', user.uid));
    const unsubscribeNotifications = onSnapshot(q, (snapshot) => {
      const data: any[] = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setNotifications(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'notifications', false);
    });

    // Global Announcements (Mock for now, or fetch from a global 'news' collection)
    const fetchAnnouncements = async () => {
      // For now, let's just make some up to show "more detail" as requested
      const mockNews = [
        { 
          id: 'news1', 
          type: 'update',
          title: 'New Store: Audiomack!', 
          message: 'Gati now supports Audiomack distribution. Upload your latest tracks to reach a whole new audience.', 
          createdAt: new Date().toISOString(),
          read: false 
        },
        { 
          id: 'news2', 
          type: 'feature',
          title: 'Marketing Toolbox Live', 
          message: 'The new Marketing Toolbox is now available in your dashboard. Generate AI captions and smart links instantly.', 
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          read: true 
        }
      ];
      setAnnouncements(mockNews);
      setLoading(false);
    };

    fetchAnnouncements();

    return () => unsubscribeNotifications();
  }, [user.uid]);

  const markAsRead = async (id: string, read: boolean) => {
    if (read) return;
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `notifications/${id}`);
    }
  };

  const getTypeIcon = (type: string = '') => {
    switch (type) {
      case 'update': return <Sparkles className="text-[#ccff00]" size={16} />;
      case 'feature': return <TrendingUp className="text-[#9d4edd]" size={16} />;
      case 'alert': return <ShieldAlert className="text-red-500" size={16} />;
      default: return <Info className="text-blue-500" size={16} />;
    }
  };

  const getNotificationIcon = (title: string = '') => {
    const t = title.toLowerCase();
    if (t.includes('live')) return <CheckCircle2 className="text-[#ccff00]" size={18} />;
    if (t.includes('earth')) return <TrendingUp className="text-[#9d4edd]" size={18} />;
    if (t.includes('action')) return <ShieldAlert className="text-red-500" size={18} />;
    return <Bell className="text-gray-400" size={18} />;
  };

  return (
    <div className="max-w-4xl pb-20">
      <div className="mb-10">
        <h1 className="text-4xl font-display uppercase tracking-tighter mb-2">Notification Hub</h1>
        <p className="text-gray-400 font-sans tracking-wide">Stay informed about your career, trends, and system updates.</p>
      </div>

      <div className="flex border-b border-white/5 mb-8">
        <button 
          onClick={() => setActiveTab('personal')}
          className={`px-8 py-4 text-xs font-display uppercase tracking-[0.2em] relative transition-colors ${activeTab === 'personal' ? 'text-[#ccff00]' : 'text-gray-500 hover:text-white'}`}
        >
          Personal {notifications.filter(n => !n.read).length > 0 && `(${notifications.filter(n => !n.read).length})`}
          {activeTab === 'personal' && <motion.div layoutId="activeTabNotif" className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#ccff00]" />}
        </button>
        <button 
          onClick={() => setActiveTab('announcements')}
          className={`px-8 py-4 text-xs font-display uppercase tracking-[0.2em] relative transition-colors ${activeTab === 'announcements' ? 'text-[#ccff00]' : 'text-gray-500 hover:text-white'}`}
        >
          Announcements
          {activeTab === 'announcements' && <motion.div layoutId="activeTabNotif" className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#ccff00]" />}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'personal' ? (
          <motion.div 
            key="personal"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-4"
          >
            {loading ? (
              <div className="text-[#ccff00] font-display uppercase tracking-widest text-xs">Syncing updates...</div>
            ) : notifications.length === 0 ? (
              <div className="border border-white/5 p-16 text-center bg-black/40">
                <Bell className="mx-auto text-gray-800 mb-4" size={48} />
                <p className="text-gray-500 font-sans text-sm italic">Nothing personal yet. Your activity will appear here.</p>
              </div>
            ) : (
              notifications.map((n, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={n.id} 
                  onClick={() => markAsRead(n.id, n.read)}
                  className={`p-6 border transition-all cursor-pointer group flex gap-4 ${n.read ? 'bg-[#0a0a0a] border-white/5 opacity-60' : 'bg-[#111] border-[#ccff00]'}`}
                >
                  <div className="pt-1">
                    {getNotificationIcon(n.title)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                       <h3 className={`text-sm font-display uppercase tracking-widest font-bold ${n.read ? 'text-gray-400' : 'text-white'}`}>
                        {n.title}
                      </h3>
                      {!n.read && <span className="text-[8px] font-display uppercase tracking-widest bg-[#ccff00] text-black px-2 py-0.5 font-black">NEW</span>}
                    </div>
                    <p className={`text-xs font-sans leading-relaxed mb-3 ${n.read ? 'text-gray-500' : 'text-gray-300'}`}>
                      {n.message}
                    </p>
                    <div className="flex items-center gap-4 text-[10px] text-gray-600 font-mono">
                       <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(n.createdAt).toLocaleDateString()}</span>
                       <span className="flex items-center gap-1 uppercase tracking-widest">PERSONAL</span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="announcements"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-4"
          >
            {announcements.map((a, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={a.id} 
                className="p-6 bg-[#111] border border-white/5 hover:border-[#9d4edd] transition-all group flex gap-4"
              >
                <div className="pt-1">
                  {getTypeIcon(a.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                     <h3 className="text-sm font-display uppercase tracking-widest font-bold text-white group-hover:text-[#9d4edd] transition-colors">
                      {a.title}
                    </h3>
                  </div>
                  <p className="text-xs font-sans text-gray-400 leading-relaxed mb-4 italic">
                    {a.message}
                  </p>
                  <div className="flex items-center gap-4 text-[10px] text-gray-600 font-mono">
                     <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(a.createdAt).toLocaleDateString()}</span>
                     <span className="flex items-center gap-1 uppercase tracking-widest">SYSTEM NEWS</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
