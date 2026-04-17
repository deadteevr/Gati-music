import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { Bell } from 'lucide-react';

export default function ArtistNotifications({ user }: { user: any }) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'notifications'), where('uid', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: any[] = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setNotifications(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'notifications');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user.uid]);

  const markAsRead = async (id: string, read: boolean) => {
    if (read) return;
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `notifications/${id}`);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-10">
        <h1 className="text-4xl font-display uppercase tracking-tighter mb-2">Notifications</h1>
        <p className="text-gray-400">Stay updated with every step of your release and earnings.</p>
      </div>

      {loading ? (
        <div className="text-[#ccff00]">Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="border border-[#333] p-12 text-center bg-[#111]">
          <Bell className="mx-auto text-gray-600 mb-4" size={48} />
          <p className="text-gray-500 font-sans mb-4">You're all caught up! No notifications right now.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map(n => (
            <div 
              key={n.id} 
              onClick={() => markAsRead(n.id, n.read)}
              className={`p-6 border transition-colors cursor-pointer ${n.read ? 'bg-[#0a0a0a] border-[#222]' : 'bg-[#111] border-[#ccff00]'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className={`text-sm font-sans ${n.read ? 'text-gray-400' : 'text-white'}`}>
                  {n.message}
                </div>
                {!n.read && <div className="w-2 h-2 rounded-full bg-[#ccff00] shrink-0 mt-1.5 ml-4"></div>}
              </div>
              <div className="text-xs text-gray-600 font-sans">
                {new Date(n.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
