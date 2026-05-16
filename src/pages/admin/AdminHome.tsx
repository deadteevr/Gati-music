import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { Users, Music, Activity, PlayCircle, IndianRupee, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function AdminHome() {
  const [stats, setStats] = useState({
    totalArtists: 0,
    totalSongs: 0,
    songsInReview: 0,
    liveSongs: 0,
    totalStreams: 0,
    pendingWithdrawals: 0,
    activeSubscriptions: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [recentFeedback, setRecentFeedback] = useState<any[]>([]);
  const [monthlyEarningsData, setMonthlyEarningsData] = useState<any[]>([]);
  const [monthlyStreamsData, setMonthlyStreamsData] = useState<any[]>([]);

  useEffect(() => {
    // Fetch users
    const qUsers = query(collection(db, 'users'));
    const unsubUsers = onSnapshot(qUsers, (snap) => {
      const users = snap.docs.filter(d => d.data().role !== 'admin');
      
      let totalPlatformStreams = 0;
      let activeSubs = 0;
      users.forEach(u => {
        if (u.data().streams?.total) {
          totalPlatformStreams += u.data().streams.total;
        }
        if (u.data().subscription?.status === 'Active') {
          const expiry = u.data().subscription.expiryDate;
          const isExpired = expiry && new Date() > (expiry.toDate ? expiry.toDate() : new Date(expiry));
          if (!isExpired) activeSubs++;
        }
      });
      
      setStats(s => ({ ...s, totalArtists: users.length, totalStreams: totalPlatformStreams, activeSubscriptions: activeSubs }));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users', false);
    });

    // Fetch songs
    const qSongs = query(collection(db, 'submissions'));
    const unsubSongs = onSnapshot(qSongs, (snap) => {
      let reviewing = 0;
      let live = 0;
      snap.docs.forEach(d => {
        if (d.data().status === 'Reviewing') reviewing++;
        if (d.data().status === 'Live') live++;
      });
      setStats(s => ({ ...s, totalSongs: snap.size, songsInReview: reviewing, liveSongs: live }));
      
      // Recent Activity - using songs as a proxy for recent activity for now
      const sortedSongs = snap.docs.map(d => ({id: d.id, ...d.data(), type: 'submission'})).sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 5);
      setRecentActivity(sortedSongs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'submissions', false);
    });

    // Fetch withdrawals
    const qWithdrawals = query(collection(db, 'withdrawals'));
    const unsubWithdrawals = onSnapshot(qWithdrawals, (snap) => {
      let pending = 0;
      snap.docs.forEach(d => {
        if (d.data().status === 'Pending') pending++;
      });
      setStats(s => ({ ...s, pendingWithdrawals: pending }));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'withdrawals', false);
    });

    // Fetch global Royalties for Charts
    const qRoyalties = query(collection(db, 'royalties'));
    const unsubRoyalties = onSnapshot(qRoyalties, (snap) => {
      const earningsByMonth: Record<string, number> = {};
      const streamsByMonth: Record<string, number> = {};

      snap.docs.forEach(d => {
        const data = d.data();
        const month = data.reportMonth;
        if (!month) return;

        // Aggregate Earnings
        earningsByMonth[month] = (earningsByMonth[month] || 0) + Number(data.amount || 0);

        // Aggregate Streams
        if (data.streamsBreakdown) {
          try {
            const parsed = JSON.parse(data.streamsBreakdown);
            let monthStreams = 0;
            for (const value of Object.values(parsed)) {
              monthStreams += Number(value);
            }
            streamsByMonth[month] = (streamsByMonth[month] || 0) + monthStreams;
          } catch(e) {}
        }
      });

      // Format and sort Data
      const formatData = (obj: Record<string, number>, key: string) => {
        const arr = Object.keys(obj).map(month => ({
          name: month.split(' ')[0].substring(0, 3) + (month.split(' ')[1] ? ' ' + month.split(' ')[1].substring(2, 4) : ''), // e.g. "Jun 24"
          rawMonth: month,
          [key]: obj[month]
        }));
        
        arr.sort((a, b) => {
           return new Date(`${a.rawMonth} 1`).getTime() - new Date(`${b.rawMonth} 1`).getTime();
        });
        return arr;
      };

      setMonthlyEarningsData(formatData(earningsByMonth, 'earnings'));
      setMonthlyStreamsData(formatData(streamsByMonth, 'streams'));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'royalties', false);
    });

    // Fetch Feedback
    const qFeedback = query(collection(db, 'feedback'), orderBy('createdAt', 'desc'), limit(3));
    const unsubFeedback = onSnapshot(qFeedback, (snap) => {
      setRecentFeedback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'feedback', false);
    });
    
    return () => {
      unsubUsers();
      unsubSongs();
      unsubWithdrawals();
      unsubRoyalties();
      unsubFeedback();
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-display uppercase tracking-tighter mb-2">Dashboard</h1>
        <p className="text-gray-400 font-sans text-sm">System Overview & Analytics</p>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="Total Artists" value={stats.totalArtists} icon={<Users size={18} />} />
        <StatCard title="Active Plans" value={stats.activeSubscriptions} icon={<Zap size={18} />} color="text-[#ccff00]" />
        <StatCard title="In Review" value={stats.songsInReview} icon={<Activity size={18} />} color="text-yellow-500" />
        <StatCard title="Live Songs" value={stats.liveSongs} icon={<PlayCircle size={18} />} color="text-[#9d4edd]" />
        <StatCard title="Total Streams" value={stats.totalStreams.toLocaleString() || "0"} icon={<PlayCircle size={18} />} />
        <StatCard title="Pending W/D" value={stats.pendingWithdrawals} icon={<IndianRupee size={18} />} color={stats.pendingWithdrawals > 0 ? "text-red-400" : "text-gray-400"} />
      </div>

      {/* MINI ANALYTICS CHARTS */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-[#111] p-6 border border-[#333]">
           <h2 className="text-lg font-display uppercase tracking-widest text-green-400 mb-6">Monthly Earnings</h2>
           {monthlyEarningsData.length > 0 ? (
             <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyEarningsData.slice(-12)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis dataKey="name" stroke="#666" tick={{fill: '#666', fontSize: 12}} axisLine={false} tickLine={false} />
                    <YAxis stroke="#666" tick={{fill: '#666', fontSize: 12}} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                    <Tooltip contentStyle={{backgroundColor: '#111', borderColor: '#333', color: '#fff'}} itemStyle={{color: '#4ade80'}} />
                    <Line type="monotone" dataKey="earnings" stroke="#4ade80" strokeWidth={2} dot={{fill: '#111', stroke: '#4ade80', strokeWidth: 2}} />
                  </LineChart>
               </ResponsiveContainer>
             </div>
           ) : (
             <div className="h-64 flex items-center justify-center border border-dashed border-[#333]">
               <p className="text-gray-500 font-sans text-sm">Not enough data for chart.</p>
             </div>
           )}
        </div>

        <div className="bg-[#111] p-6 border border-[#333]">
           <h2 className="text-lg font-display uppercase tracking-widest text-[#9d4edd] mb-6">Monthly Streams</h2>
           {monthlyStreamsData.length > 0 ? (
             <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyStreamsData.slice(-12)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis dataKey="name" stroke="#666" tick={{fill: '#666', fontSize: 12}} axisLine={false} tickLine={false} />
                    <YAxis stroke="#666" tick={{fill: '#666', fontSize: 12}} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                    <Tooltip contentStyle={{backgroundColor: '#111', borderColor: '#333', color: '#fff'}} itemStyle={{color: '#9d4edd'}} cursor={{fill: '#222'}} />
                    <Bar dataKey="streams" fill="#9d4edd" radius={[4, 4, 0, 0]} />
                  </BarChart>
               </ResponsiveContainer>
             </div>
           ) : (
             <div className="h-64 flex items-center justify-center border border-dashed border-[#333]">
               <p className="text-gray-500 font-sans text-sm">Not enough data for chart.</p>
             </div>
           )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* RECENT ACTIVITY */}
        <div className="col-span-2 bg-[#111] p-6 border border-[#333]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-display uppercase tracking-widest text-[#9d4edd]">Recent Submissions</h2>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity, i) => (
              <div key={i} className="flex flex-col border-b border-[#222] pb-4 last:border-0 last:pb-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-sm bg-[#222] inline-block px-2 py-1 uppercase tracking-widest text-xs mb-2 text-[#9d4edd] border border-[#333]">{activity.status}</p>
                    <div className="flex flex-col gap-2">
                      <p className="font-sans text-sm text-white">{activity.title} <span className="text-gray-500">by</span> {activity.mainArtist}</p>
                      {activity.tracks && activity.tracks.length > 0 ? (
                        <audio src={activity.tracks[0].audioUrl} controls className="h-4 w-32 filter invert opacity-50" />
                      ) : activity.audioUrl ? (
                        <audio src={activity.audioUrl} controls className="h-4 w-32 filter invert opacity-50" />
                      ) : null}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 font-mono">{new Date(activity.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            {recentActivity.length === 0 && <p className="text-gray-500 text-sm">No recent activity.</p>}
          </div>
        </div>

      {/* QUICK ACTIONS */}
      <div className="col-span-1 bg-[#111] p-6 border border-[#333]">
        <h2 className="text-lg font-display uppercase tracking-widest text-[#9d4edd] mb-6">Quick Actions</h2>
        <div className="flex flex-col gap-3">
          <Link to="/admin/artists" className="bg-[#ccff00] text-black border border-[#ccff00] hover:bg-white hover:border-white p-4 font-display uppercase tracking-widest text-xs text-center font-black transition-colors">Manage Artists & Plans</Link>
          <Link to="/admin/smart-links" className="bg-[#222] border border-[#333] hover:border-white text-white p-4 font-display uppercase tracking-widest text-xs text-center transition-colors">Manage Smart Links</Link>
          <Link to="/admin/songs" className="bg-[#222] border border-[#333] hover:border-white text-white p-4 font-display uppercase tracking-widest text-xs text-center transition-colors">View Submissions</Link>
          <Link to="/admin/notifications" className="bg-[#9d4edd] text-white p-4 font-display uppercase tracking-widest text-xs text-center font-bold hover:bg-[#7b2cbf] transition-colors">Send Announcement</Link>
        </div>
      </div>
      </div>

      {/* RECENT FEEDBACK */}
      <div className="bg-[#111] p-6 border border-[#333]">
         <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-display uppercase tracking-widest text-[#ccff00]">Recent Feedback</h2>
            <Link to="/admin/notifications" className="text-[10px] text-gray-500 hover:text-white uppercase tracking-widest">View All Feedback</Link>
         </div>
         <div className="grid md:grid-cols-3 gap-6">
            {recentFeedback.length > 0 ? recentFeedback.map((f) => (
              <div key={f.id} className="p-4 bg-black border border-[#222] relative overflow-hidden group">
                 {f.status === 'new' && <div className="absolute top-0 right-0 w-16 h-16 bg-[#ccff00]/10 rounded-full -mr-8 -mt-8" />}
                 <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-white truncate max-w-[120px]">{f.userName || 'Artist'}</span>
                    <span className="text-[8px] text-gray-600 font-mono">{new Date(f.createdAt?.toDate ? f.createdAt.toDate() : f.createdAt).toLocaleDateString()}</span>
                 </div>
                 <p className="text-[11px] text-gray-400 font-sans line-clamp-3 italic">"{f.message}"</p>
              </div>
            )) : (
              <p className="text-gray-600 text-xs italic">No recent feedback.</p>
            )}
         </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color = "text-[#9d4edd]" }: any) {
  return (
    <div className="bg-[#111] p-4 border border-[#333] flex flex-col justify-between h-28">
      <div className="flex justify-between items-center text-gray-500">
        <h3 className="text-[10px] sm:text-xs font-display uppercase tracking-widest">{title}</h3>
        <span className={color}>{icon}</span>
      </div>
      <div className="text-2xl sm:text-3xl font-display font-black tracking-tighter truncate">{value}</div>
    </div>
  );
}
