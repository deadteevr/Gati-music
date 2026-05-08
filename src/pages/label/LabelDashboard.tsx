import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  Users, 
  Music, 
  TrendingUp, 
  Clock, 
  Plus, 
  Settings, 
  LayoutDashboard,
  Bell,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Zap,
  BarChart3,
  CreditCard,
  CheckCircle2
} from 'lucide-react';
import { db, auth, handleFirestoreError, OperationType } from '../../firebase';
import { collection, query, where, getDocs, doc, onSnapshot, limit, orderBy } from 'firebase/firestore';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export default function LabelDashboard({ user, userData }: { user: any, userData: any }) {
  const [labelData, setLabelData] = useState<any>(null);
  const [stats, setStats] = useState({
    totalArtists: 0,
    totalReleases: 0,
    activeUploads: 0,
    totalEarnings: 0
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [recentReleases, setRecentReleases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userData.labelId) return;

    // Listen to Label document
    const unsubscribeLabel = onSnapshot(doc(db, 'labels', userData.labelId), (doc) => {
      if (doc.exists()) {
        setLabelData(doc.data());
      }
    });

    // Fetch Stats
    const fetchStats = async () => {
      try {
        const artistsSnap = await getDocs(query(collection(db, 'users'), where('labelId', '==', userData.labelId)));
        const submissionsSnap = await getDocs(query(collection(db, 'submissions'), where('labelId', '==', userData.labelId)));
        
        setStats({
          totalArtists: artistsSnap.size,
          totalReleases: submissionsSnap.size,
          activeUploads: submissionsSnap.docs.filter(d => ['Reviewing', 'Processing'].includes(d.data().status)).length,
          totalEarnings: 0 // Will integrate with royalty system later
        });

        // Recent releases
        const qReleases = query(
          collection(db, 'submissions'), 
          where('labelId', '==', userData.labelId),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const releasesSnap = await getDocs(qReleases);
        setRecentReleases(releasesSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        // Activity Logs
        const qLogs = query(
          collection(db, 'labels', userData.labelId, 'activity'),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
        const logsSnap = await getDocs(qLogs);
        setRecentActivities(logsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    return () => unsubscribeLabel();
  }, [userData.labelId]);

  if (!userData.labelId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-6">
        <div className="max-w-md w-full text-center p-10 bg-[#111] border border-white/10 rounded-[32px]">
          <Building2 className="mx-auto text-gray-500 mb-6" size={48} />
          <h2 className="text-2xl font-display font-black uppercase mb-4 tracking-tighter">No Label Found</h2>
          <p className="text-gray-400 text-sm mb-8">It looks like you haven't set up a label yet or your account is still being processed.</p>
          <Link to="/pricing" className="block py-4 bg-[#B6FF00] text-black font-display font-black uppercase tracking-widest rounded-xl">View Label Plans</Link>
        </div>
      </div>
    );
  }

  const isExpired = userData.subscription?.status === 'Expired';

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-20">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-[#8B5CF6] to-[#6366F1] rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
             {labelData?.logoUrl ? (
               <img src={labelData.logoUrl} className="w-full h-full object-cover rounded-xl" alt="Label" />
             ) : (
               <Building2 size={20} className="text-white" />
             )}
          </div>
          <div>
            <h1 className="text-sm md:text-lg font-display font-black uppercase tracking-tight">{labelData?.name || 'Label Dashboard'}</h1>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Label ID: {userData.labelId}</span>
              {userData.subscription?.status === 'Active' && (
                <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[8px] font-black uppercase rounded tracking-widest">Active</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <button className="p-2 text-gray-400 hover:text-white transition-colors"><Bell size={20} /></button>
          <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors">
            <Settings size={16} />
            <span>Settings</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {isExpired && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 bg-red-500/10 border border-red-500/20 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center text-red-500">
                <Clock size={24} />
              </div>
              <div>
                <h3 className="font-display font-black uppercase text-red-500">Subscription Expired</h3>
                <p className="text-gray-400 text-xs">New uploads are disabled. Please renew to continue distributing music.</p>
              </div>
            </div>
            <Link to="/pricing" className="px-8 py-3 bg-red-500 text-white font-display font-black uppercase tracking-widest rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20">Renew Now</Link>
          </motion.div>
        )}

        {/* Hero Section */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <StatCard title="Total Artists" value={stats.totalArtists} icon={Users} color="text-blue-400" bgColor="bg-blue-400/10" />
          <StatCard title="Total Releases" value={stats.totalReleases} icon={Music} color="text-[#8B5CF6]" bgColor="bg-purple-400/10" />
          <StatCard title="Active Uploads" value={stats.activeUploads} icon={Zap} color="text-[#ccff00]" bgColor="bg-[#ccff00]/10" />
          <StatCard title="Total Earnings" value={`₹${stats.totalEarnings.toFixed(2)}`} icon={TrendingUp} color="text-green-400" bgColor="bg-green-400/10" />
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main Dashboard Area */}
          <div className="lg:col-span-2 space-y-10">
            {/* Recent Releases */}
            <section>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-display font-black uppercase tracking-tighter">Recent Releases</h2>
                <Link to="/label/releases" className="text-[10px] uppercase font-bold text-gray-500 hover:text-[#8B5CF6] transition-colors flex items-center gap-1">
                  View All <ChevronRight size={14} />
                </Link>
              </div>
              <div className="space-y-4">
                {recentReleases.length > 0 ? (
                  recentReleases.map((release) => (
                    <div key={release.id} className="p-4 bg-[#111] border border-white/5 rounded-2xl flex items-center justify-between group hover:border-[#8B5CF6]/30 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/5 rounded-lg overflow-hidden border border-white/10 group-hover:scale-105 transition-transform">
                          {release.coverUrl ? (
                            <img src={release.coverUrl} className="w-full h-full object-cover" alt={release.title} />
                          ) : (
                            <Music className="w-full h-full p-3 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-sans font-bold text-sm leading-tight group-hover:text-[#8B5CF6] transition-colors">{release.title}</h4>
                          <p className="text-[11px] text-gray-500 uppercase tracking-wider mt-1">{release.mainArtist}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <StatusBadge status={release.status} />
                        <button className="p-2 text-gray-500 hover:text-white transition-colors"><ExternalLink size={16} /></button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 border-2 border-dashed border-white/5 rounded-3xl text-center">
                    <Music className="mx-auto text-gray-700 mb-4" size={32} />
                    <p className="text-gray-500 text-sm">No releases found yet.</p>
                  </div>
                )}
              </div>
            </section>

            {/* Quick Actions */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <ActionButton title="Add Artist" icon={Plus} to="/label/artists" />
               <ActionButton title="New Release" icon={Plus} to="/artist/upload" variant="accent" />
               <ActionButton title="Analytics" icon={BarChart3} to="/label/analytics" />
               <ActionButton title="Billing" icon={CreditCard} to="/pricing" />
            </section>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-10">
            {/* Plan Overview */}
            <section className="p-8 bg-gradient-to-br from-[#111] to-black border border-white/5 rounded-[32px] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <ShieldCheck size={100} className="text-[#8B5CF6]" />
              </div>
              <h3 className="text-xs uppercase font-display tracking-widest text-gray-400 mb-6">Plan Overview</h3>
              <div className="mb-8">
                <span className="text-4xl font-display font-black uppercase tracking-tighter text-[#8B5CF6]">
                  {userData.subscription?.planType || 'Free'}
                </span>
                <p className="text-gray-500 text-xs mt-2">Active until {userData.subscription?.expiryDate ? format(new Date(userData.subscription.expiryDate), 'MMM dd, yyyy') : 'N/A'}</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-xs text-gray-300">
                  <CheckCircle2 size={14} className="text-[#8B5CF6]" />
                  <span>Unlimited Managed Artists</span>
                </li>
                <li className="flex items-center gap-3 text-xs text-gray-300">
                  <CheckCircle2 size={14} className="text-[#8B5CF6]" />
                  <span>Priority Content Approval</span>
                </li>
              </ul>
              <Link to="/pricing" className="block w-full py-4 bg-white/5 border border-white/10 rounded-xl text-center text-[10px] uppercase font-black tracking-widest hover:bg-white hover:text-black transition-all">Manage Plan</Link>
            </section>

            {/* Recent Activity */}
            <section>
               <h2 className="text-xl font-display font-black uppercase mb-6 tracking-tighter">Activity Stream</h2>
               <div className="space-y-6">
                 {recentActivities.length > 0 ? (
                   recentActivities.map((log) => (
                     <div key={log.id} className="flex gap-4">
                       <div className="w-2 rounded-full bg-[#8B5CF6]/20 self-stretch" />
                       <div>
                         <p className="text-xs text-gray-300 leading-relaxed"><span className="font-bold text-white">{log.actorName || 'Manager'}</span> {log.description}</p>
                         <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-1">{format(log.createdAt.toDate(), 'HH:mm • MMM dd')}</p>
                       </div>
                     </div>
                   ))
                 ) : (
                   <p className="text-xs text-gray-500 text-center py-6">No recent label activity.</p>
                 )}
               </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bgColor }: any) {
  return (
    <div className="p-6 bg-[#111] border border-white/5 rounded-3xl hover:border-white/10 transition-all">
      <div className={`w-10 h-10 ${bgColor} ${color} rounded-xl flex items-center justify-center mb-4`}>
        <Icon size={20} />
      </div>
      <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold mb-1">{title}</p>
      <h3 className="text-2xl font-display font-black tracking-tight">{value}</h3>
    </div>
  );
}

function ActionButton({ title, icon: Icon, to, variant }: any) {
  return (
    <Link 
      to={to} 
      className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all border ${
        variant === 'accent' 
          ? 'bg-[#8B5CF6] border-[#8B5CF6] text-white hover:bg-white hover:text-black hover:border-white' 
          : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20 hover:bg-white/10'
      }`}
    >
      <Icon size={20} />
      <span className="text-[10px] uppercase font-black tracking-widest text-center">{title}</span>
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    'Reviewing': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'Processing': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    'Sent to Stores': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    'Live': 'bg-[#ccff00]/10 text-[#ccff00] border-[#ccff00]/20',
    'Changes Required': 'bg-red-500/10 text-red-500 border-red-500/20'
  };
  
  const colorClass = (colors as any)[status] || 'bg-gray-500/10 text-gray-500 border-gray-500/20';

  return (
    <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border ${colorClass}`}>
      {status}
    </span>
  );
}
