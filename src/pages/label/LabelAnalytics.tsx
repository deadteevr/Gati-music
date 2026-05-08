import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Music, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingDown,
  Activity,
  Globe,
  PieChart as PieChartIcon,
  BarChart3
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';

const MOCK_DATA = [
  { name: 'Jan', streams: 4000, revenue: 240 },
  { name: 'Feb', streams: 3000, revenue: 139 },
  { name: 'Mar', streams: 2000, revenue: 980 },
  { name: 'Apr', streams: 2780, revenue: 390 },
  { name: 'May', streams: 1890, revenue: 480 },
  { name: 'Jun', streams: 2390, revenue: 380 },
  { name: 'Jul', streams: 3490, revenue: 430 },
];

const PLATFORM_DATA = [
  { name: 'Spotify', value: 45, color: '#1DB954' },
  { name: 'Apple Music', value: 25, color: '#FA2D48' },
  { name: 'YouTube', value: 20, color: '#FF0000' },
  { name: 'JioSaavn', value: 10, color: '#00D8F5' },
];

export default function LabelAnalytics({ user, userData }: { user: any, userData: any }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalArtists: 0,
    totalReleases: 0,
    monthlyStreams: '1.2M',
    totalRevenue: '₹42,340'
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const artistsSnap = await getDocs(query(collection(db, 'users'), where('labelId', '==', userData.labelId)));
        const submissionsSnap = await getDocs(query(collection(db, 'submissions'), where('labelId', '==', userData.labelId)));
        
        setStats(prev => ({
          ...prev,
          totalArtists: artistsSnap.size,
          totalReleases: submissionsSnap.size
        }));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userData.labelId]);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10">
      <header>
        <h1 className="text-3xl font-display font-black uppercase tracking-tight">Label <span className="text-[#8B5CF6]">Analytics</span></h1>
        <p className="text-gray-500 text-xs uppercase tracking-widest mt-1 font-bold">Deep dive into your roster's performance</p>
      </header>

      {/* Hero Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Artists" value={stats.totalArtists} change="+4" trend="up" icon={Users} />
        <StatCard title="Total Catalog" value={stats.totalReleases} change="+12" trend="up" icon={Music} />
        <StatCard title="Monthly Streams" value={stats.monthlyStreams} change="+18%" trend="up" icon={Activity} />
        <StatCard title="Total Revenue" value={stats.totalRevenue} change="-2%" trend="down" icon={TrendingUp} />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Streams Area Chart */}
        <div className="lg:col-span-2 bg-[#111] border border-white/5 rounded-[40px] p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-sm uppercase font-display font-black tracking-widest text-[#8B5CF6] flex items-center gap-2">
              <TrendingUp size={16} /> Consumption Trends
            </h3>
            <div className="flex gap-2">
               <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white">Streams</button>
               <button className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Revenue</button>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_DATA}>
                <defs>
                  <linearGradient id="colorStreams" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="name" stroke="#555" fontSize={10} axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="#555" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '16px', fontSize: '12px' }}
                  itemStyle={{ color: '#8B5CF6' }}
                />
                <Area type="monotone" dataKey="streams" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorStreams)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform Share */}
        <div className="bg-[#111] border border-white/5 rounded-[40px] p-8 flex flex-col">
          <h3 className="text-sm uppercase font-display font-black tracking-widest text-[#8B5CF6] flex items-center gap-2 mb-8">
            <Globe size={16} /> Platform Distribution
          </h3>
          <div className="h-[250px] w-full mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={PLATFORM_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {PLATFORM_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '16px', fontSize: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
            {PLATFORM_DATA.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[10px] items-center uppercase font-bold tracking-widest text-gray-400">{item.name}</span>
                </div>
                <span className="text-xs font-black">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Artists / Releases */}
      <div className="grid md:grid-cols-2 gap-8">
         <div className="bg-[#111] border border-white/5 rounded-[40px] p-8">
            <h3 className="text-sm uppercase font-display font-black tracking-widest text-[#8B5CF6] flex items-center gap-2 mb-8">
              <Users size={16} /> Top Performing Artists
            </h3>
            <div className="space-y-6">
               {[1,2,3,4].map(i => (
                 <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-[#8B5CF6]/30 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-white/10 rounded-xl" />
                       <div>
                          <p className="text-sm font-bold">Artist {i}</p>
                          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">342K Monthly Streams</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-xs font-bold text-green-400">+12%</p>
                    </div>
                 </div>
               ))}
            </div>
         </div>
         <div className="bg-[#111] border border-white/5 rounded-[40px] p-8">
            <h3 className="text-sm uppercase font-display font-black tracking-widest text-[#8B5CF6] flex items-center gap-2 mb-8">
              <Music size={16} /> Hot Releases
            </h3>
            <div className="space-y-6">
               {[1,2,3,4].map(i => (
                 <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-[#8B5CF6]/30 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-white/10 rounded-xl" />
                       <div>
                          <p className="text-sm font-bold">Track Name {i}</p>
                          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Released 2 weeks ago</p>
                       </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                       <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
                          <div className="bg-[#8B5CF6] h-full" style={{ width: `${100 - i * 15}%` }} />
                       </div>
                       <span className="text-[8px] text-gray-500 uppercase font-bold mt-1">Trending Velocity</span>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, trend, icon: Icon }: any) {
  return (
    <div className="p-6 bg-[#111] border border-white/5 rounded-[32px] hover:border-white/10 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-[#8B5CF6]">
          <Icon size={20} />
        </div>
        <div className={`flex items-center gap-1 ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
          {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          <span className="text-[10px] font-black uppercase tracking-widest">{change}</span>
        </div>
      </div>
      <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold mb-1">{title}</p>
      <h3 className="text-2xl font-display font-black tracking-tight">{value}</h3>
    </div>
  );
}
