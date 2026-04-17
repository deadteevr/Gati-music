import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { Link } from 'react-router-dom';
import { ArrowRight, Music, TrendingUp, TrendingDown, Radio, Activity, CalendarDays, Bell } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';

export default function ArtistHome({ user }: { user: any }) {
  const [stats, setStats] = useState({ 
    totalSongs: 0, 
    liveSongs: 0, 
    inProgress: 0, 
    totalEarnings: 0, 
    currentMonthEarnings: 0 
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  const [growth, setGrowth] = useState<number | null>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#ccff00', '#9d4edd', '#ffffff', '#777777', '#333333', '#111111'];

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        // Fetch Submissions
        const subQuery = query(collection(db, 'submissions'), where('uid', '==', user.uid));
        const subDocs = await getDocs(subQuery);
        
        let liveCount = 0;
        let progressCount = 0;
        
        subDocs.forEach(d => {
          const status = d.data().status;
          if (status === 'live') {
            liveCount++;
          } else {
            progressCount++;
          }
        });

        // Fetch Royalties
        const royQuery = query(collection(db, 'royalties'), where('uid', '==', user.uid));
        const royDocs = await getDocs(royQuery);
        
        let totalEarnings = 0;
        const royaltiesList: any[] = [];
        
        royDocs.forEach(d => {
          const data = d.data();
          totalEarnings += data.amount || 0;
          royaltiesList.push(data);
        });

        royaltiesList.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

        const monthlyData = royaltiesList.map(r => ({
          month: r.reportMonth,
          earnings: r.amount
        }));

        setChartData(monthlyData);

        let currentMonthEarnings = 0;
        if (royaltiesList.length > 0) {
          currentMonthEarnings = royaltiesList[royaltiesList.length - 1].amount;
        }

        // Calc Growth
        if (royaltiesList.length >= 2) {
          const curr = royaltiesList[royaltiesList.length - 1].amount;
          const prev = royaltiesList[royaltiesList.length - 2].amount;
          if (prev > 0) {
            setGrowth(((curr - prev) / prev) * 100);
          } else if (curr > 0) {
            setGrowth(100);
          } else {
            setGrowth(0);
          }
        } else if (royaltiesList.length === 1) {
          if (royaltiesList[0].amount > 0) setGrowth(100);
        }

        // Streams Breakdown
        const aggregatedStreams: Record<string, number> = {};
        let hasStreams = false;
        
        royaltiesList.forEach(r => {
          if (r.streamsBreakdown) {
            try {
              const breakdown = JSON.parse(r.streamsBreakdown);
              for (const [platform, streams] of Object.entries(breakdown)) {
                aggregatedStreams[platform] = (aggregatedStreams[platform] || 0) + Number(streams);
                hasStreams = true;
              }
            } catch (e) {
              console.error("Failed to parse streams breakdown", e);
            }
          }
        });

        if (hasStreams) {
          const formattedPieData = Object.keys(aggregatedStreams)
            .map(platform => ({
              name: platform,
              value: aggregatedStreams[platform]
            }))
            .sort((a, b) => b.value - a.value); 
          
          setPieData(formattedPieData);
        }

        // Recent Activity (Notifications limit 3)
        const notifQuery = query(collection(db, 'notifications'), where('uid', '==', user.uid), orderBy('createdAt', 'desc'), limit(3));
        const notifDocs = await getDocs(notifQuery);
        const activityList: any[] = [];
        notifDocs.forEach(d => {
          activityList.push({ id: d.id, ...d.data() });
        });
        setRecentActivity(activityList);

        setStats({
          totalSongs: subDocs.size,
          liveSongs: liveCount,
          inProgress: progressCount,
          totalEarnings,
          currentMonthEarnings
        });

      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [user.uid]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#111] border border-[#333] p-3 shadow-xl">
          <p className="text-gray-400 text-xs font-display uppercase tracking-widest mb-1">{label}</p>
          <p className="text-[#ccff00] font-sans font-bold text-lg">₹{payload[0].value.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#111] border border-[#333] p-3 shadow-xl font-sans">
          <p className="text-white font-bold text-sm mb-1">{payload[0].name}</p>
          <p className="text-gray-400 text-xs">{payload[0].value.toLocaleString()} Streams</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="pb-20 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-display uppercase tracking-tighter mb-2">Welcome, {user.displayName?.split(' ')[0] || 'Artist'}</h1>
        <p className="text-gray-400 font-sans tracking-wide">Track your performance, earnings & releases</p>
      </div>
      
      {/* 6 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-10">
        <div className="bg-[#111] border border-[#333] p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between text-gray-400 mb-4">
            <span className="font-display font-medium uppercase text-xs tracking-widest z-10 relative">Total Songs</span>
            <Music size={18} className="z-10 relative" opacity={0.5} />
          </div>
          <div className="text-4xl font-display text-white z-10 relative">
            {loading ? '-' : stats.totalSongs}
          </div>
        </div>

        <div className="bg-[#111] border border-[#333] p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between text-[#ccff00] mb-4">
            <span className="font-display font-medium uppercase text-xs tracking-widest z-10 relative">Live Songs</span>
            <Radio size={18} className="z-10 relative" opacity={0.8} />
          </div>
          <div className="text-4xl font-display text-white z-10 relative">
            {loading ? '-' : stats.liveSongs}
          </div>
        </div>

        <div className="bg-[#111] border border-[#333] p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between text-yellow-500 mb-4">
            <span className="font-display font-medium uppercase text-xs tracking-widest z-10 relative">In Progress</span>
            <Activity size={18} className="z-10 relative" opacity={0.8} />
          </div>
          <div className="text-4xl font-display text-white z-10 relative">
            {loading ? '-' : stats.inProgress}
          </div>
        </div>

        <div className="bg-[#111] border border-[#333] p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between text-gray-400 mb-4">
            <span className="font-display font-medium uppercase text-xs tracking-widest z-10 relative">Total Earnings</span>
            <IndianRupeeIcon opacity={0.5} className="z-10 relative" />
          </div>
          <div className="text-4xl font-display text-white z-10 relative truncate">
            ₹{loading ? '-' : stats.totalEarnings.toFixed(2)}
          </div>
        </div>

        <div className="bg-[#111] border border-[#333] p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between text-[#9d4edd] mb-4">
            <span className="font-display font-medium uppercase text-xs tracking-widest z-10 relative">This Month</span>
            <CalendarDays size={18} className="z-10 relative" opacity={0.8} />
          </div>
          <div className="text-4xl font-display text-white z-10 relative truncate">
            ₹{loading ? '-' : stats.currentMonthEarnings.toFixed(2)}
          </div>
        </div>

        <div className="bg-[#111] border border-[#333] p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between text-gray-400 mb-4">
            <span className="font-display font-medium uppercase text-xs tracking-widest z-10 relative">Growth %</span>
            {growth !== null && growth >= 0 ? (
              <TrendingUp size={18} className="text-[#ccff00] z-10 relative" />
            ) : growth !== null && growth < 0 ? (
              <TrendingDown size={18} className="text-red-500 z-10 relative" />
            ) : null}
          </div>
          <div className="text-4xl font-display text-white z-10 relative">
            {loading ? '-' : growth !== null ? (
              <span className={growth >= 0 ? 'text-[#ccff00]' : 'text-red-500'}>
                {growth > 0 ? '+' : ''}{growth.toFixed(1)}%
              </span>
            ) : '0%'}
          </div>
        </div>
      </div>

      {/* Row 1 Charts */}
      <div className="grid lg:grid-cols-3 gap-6 mb-12">
        {/* Earnings Chart */}
        <div className="lg:col-span-2 bg-[#111] border border-[#333] p-6 lg:p-8">
          <div>
            <h3 className="text-lg font-display uppercase tracking-widest text-white mb-1">Monthly Earnings Trend</h3>
            <p className="text-gray-500 font-sans text-sm mb-6">Track your revenue growth over time</p>
          </div>
          {chartData.length > 0 ? (
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ccff00" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ccff00" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    stroke="#666" 
                    fontSize={12} 
                    fontFamily="Space Grotesk" 
                    tickLine={false} 
                    axisLine={false} 
                    tickMargin={10}
                  />
                  <YAxis 
                    stroke="#666" 
                    fontSize={12} 
                    fontFamily="Inter" 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="earnings" 
                    stroke="#ccff00" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorEarnings)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[250px] w-full flex items-center justify-center border border-dashed border-[#333]">
              <p className="text-gray-500 font-sans text-sm">Not enough data to calculate trends.</p>
            </div>
          )}
        </div>

        {/* Platform Breakdown PieChart */}
        <div className="lg:col-span-1 bg-[#111] border border-[#333] p-6 lg:p-8">
          <div>
            <h3 className="text-lg font-display uppercase tracking-widest text-white mb-1">Streams by Platform</h3>
            <p className="text-gray-500 font-sans text-sm mb-6">Where your audience is listening</p>
          </div>
          {pieData.length > 0 ? (
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="40%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    formatter={(value) => <span className="text-gray-400 font-sans text-xs ml-1">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[250px] w-full flex flex-col items-center justify-center border border-dashed border-[#333] text-center p-6">
              <p className="text-gray-500 font-sans text-sm mb-2">Data not available yet</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-12">
        {/* Earnings Comparison Bar Chart */}
        <div className="bg-[#111] border border-[#333] p-6 lg:p-8">
          <div>
            <h3 className="text-lg font-display uppercase tracking-widest text-white mb-1">Earnings Comparison</h3>
            <p className="text-gray-500 font-sans text-sm mb-6">Compare current vs previous months</p>
          </div>
          {chartData.length > 0 ? (
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.slice(-6)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    stroke="#666" 
                    fontSize={12} 
                    fontFamily="Space Grotesk" 
                    tickLine={false} 
                    axisLine={false} 
                    tickMargin={10}
                  />
                  <YAxis 
                    stroke="#666" 
                    fontSize={12} 
                    fontFamily="Inter" 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{fill: '#222'}} />
                  <Bar dataKey="earnings" fill="#9d4edd" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[250px] w-full flex items-center justify-center border border-dashed border-[#333]">
              <p className="text-gray-500 font-sans text-sm">Not enough data for comparison.</p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-[#111] border border-[#333] p-6 lg:p-8 flex flex-col">
          <div>
            <h3 className="text-lg font-display uppercase tracking-widest text-white mb-1">Recent Activity</h3>
            <p className="text-gray-500 font-sans text-sm mb-6">Latest updates from Gati</p>
          </div>
          
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
            {recentActivity.length > 0 ? recentActivity.map((notif: any) => (
              <div key={notif.id} className="p-4 border-l-2 border-[#ccff00] bg-[#1a1a1a]">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-white font-sans font-bold text-sm mb-1">{notif.title}</h4>
                    <p className="text-gray-400 font-sans text-xs">{notif.message}</p>
                  </div>
                  <span className="text-xs text-gray-500 font-mono whitespace-nowrap ml-4">
                    {new Date(notif.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )) : (
               <div className="flex-1 flex items-center justify-center border border-dashed border-[#333]">
                 <p className="text-gray-500 font-sans text-sm">No recent activity.</p>
               </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-[#111] border border-[#333] p-6 lg:p-8">
        <div>
          <h3 className="text-lg font-display uppercase tracking-widest text-white mb-6">Quick Actions</h3>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <Link 
            to="/dashboard/upload" 
            className="flex items-center justify-between bg-white text-black px-6 py-4 font-display uppercase tracking-widest font-bold hover:bg-[#ccff00] transition-colors"
          >
            Upload New Song <ArrowRight size={18} />
          </Link>
          <Link 
            to="/dashboard/status" 
            className="flex items-center justify-between border border-[#333] bg-[#1a1a1a] text-white px-6 py-4 font-display uppercase tracking-widest font-bold hover:border-[#ccff00] transition-colors"
          >
            View My Songs <ArrowRight size={18} />
          </Link>
          <Link 
            to="/dashboard/withdrawals" 
            className="flex items-center justify-between border border-[#333] bg-[#1a1a1a] text-white px-6 py-4 font-display uppercase tracking-widest font-bold hover:border-[#9d4edd] transition-colors"
          >
            Request Withdrawal <ArrowRight size={18} />
          </Link>
        </div>
      </div>

    </div>
  );
}

function IndianRupeeIcon({ opacity = 1, className = "" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} opacity={opacity} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12"/><path d="M6 8h12"/><path d="M6 13h8.5l-1-1.5h2L14 17l-1 1.5-1-1.5-2 3c-1.5 2-4 3-6 3"/><path d="M6 13h12"/><path d="M10 8c-3 0-4 2-4 5"/></svg>
  )
}
