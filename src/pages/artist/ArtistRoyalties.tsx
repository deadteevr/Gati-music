import { useState, useEffect, useMemo } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { Download, TrendingUp, Music, ArrowUpRight, DollarSign, PieChart } from 'lucide-react';
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
  Cell
} from 'recharts';

export default function ArtistRoyalties({ user, userData }: { user: any, userData?: any }) {
  const [royalties, setRoyalties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'royalties'), where('uid', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: any[] = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setRoyalties(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'royalties', false);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user.uid]);

  const totalEarned = useMemo(() => royalties.reduce((sum, r) => sum + r.amount, 0), [royalties]);
  
  const chartData = useMemo(() => {
    return [...royalties].reverse().map(r => ({
      name: r.reportMonth.split(' ')[0],
      amount: r.amount
    }));
  }, [royalties]);

  const platformData = [
    { name: 'Spotify', value: 45, color: '#1DB954' },
    { name: 'YouTube', value: 25, color: '#FF0000' },
    { name: 'Apple', value: 15, color: '#FFFFFF' },
    { name: 'Instagram', value: 10, color: '#E1306C' },
    { name: 'Other', value: 5, color: '#333333' },
  ];

  const StatCard = ({ title, value, icon: Icon, color = "text-[#ccff00]" }: any) => (
    <div className="bg-[#111] border border-[#333] p-6 flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div className="p-2 bg-white/5 rounded-lg">
          <Icon className={color} size={20} />
        </div>
        <div className="flex items-center gap-1 text-[10px] text-green-500 font-display font-bold">
          <ArrowUpRight size={12} />
          <span>+12%</span>
        </div>
      </div>
      <div>
        <div className="text-[10px] font-display uppercase tracking-widest text-gray-500 mb-1">{title}</div>
        <div className="text-2xl font-display font-bold text-white">{value}</div>
      </div>
    </div>
  );

  return (
    <div className="pb-20">
      <div className="mb-10">
        <h1 className="text-4xl font-display uppercase tracking-tighter mb-2">Royalties & Analytics</h1>
        <p className="text-gray-400">Detailed overview of your earnings and streaming performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        <StatCard title="Total Balance" value={`₹${totalEarned.toFixed(2)}`} icon={DollarSign} />
        <StatCard title="Last Payout" value={`₹${royalties[0]?.amount.toFixed(2) || '0.00'}`} icon={TrendingUp} color="text-blue-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Earnings Chart */}
        <div className="lg:col-span-2 bg-[#111] border border-[#333] p-6 lg:p-10">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-lg font-display uppercase tracking-widest text-white">Earnings Trend</h3>
            <select className="bg-black border border-[#333] text-[10px] px-3 py-1 font-display uppercase tracking-widest outline-none">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          
          <div className="h-[300px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ccff00" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ccff00" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#444" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tick={{ fill: '#666', fontFamily: 'Inter' }}
                  />
                  <YAxis 
                    stroke="#444" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tick={{ fill: '#666', fontFamily: 'Inter' }}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', border: '1px solid #333', fontSize: '12px', borderRadius: '4px' }}
                    itemStyle={{ color: '#ccff00' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#ccff00" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorAmt)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-600 font-sans italic">
                Not enough data for trend analysis
              </div>
            )}
          </div>
        </div>

        {/* Platform Breakdown */}
        <div className="bg-[#111] border border-[#333] p-6 flex flex-col">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-lg font-display uppercase tracking-widest text-white">By Platform</h3>
            <PieChart size={16} className="text-gray-500" />
          </div>

          <div className="h-[180px] w-full mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformData} layout="vertical" margin={{ left: -20, right: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#666" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: '#000', border: '1px solid #333', fontSize: '12px' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {platformData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3 flex-1 overflow-auto">
            {platformData.map((platform) => (
              <div key={platform.name} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: platform.color }}></div>
                  <span className="text-gray-300 font-sans">{platform.name}</span>
                </div>
                <span className="text-white font-mono font-bold">{platform.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-display uppercase tracking-widest text-white">Monthly Reports</h2>
        <button className="text-[10px] font-display uppercase tracking-widest text-gray-500 border border-[#333] px-4 py-2 hover:border-white hover:text-white transition-all">
          Export history (CSV)
        </button>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-[#111] animate-pulse rounded"></div>)}
        </div>
      ) : royalties.length === 0 ? (
        <div className="border border-[#333] p-12 text-center bg-[#111]">
          <p className="text-gray-500 font-sans mb-4">No royalty reports available yet. Keep grinding!</p>
        </div>
      ) : (
        <div className="border border-[#333] bg-[#111] overflow-hidden">
          <div className="grid grid-cols-4 p-4 border-b border-[#333] font-display tracking-widest uppercase text-xs text-gray-500">
            <div>Month</div>
            <div>Streams</div>
            <div>Amount</div>
            <div className="text-right">Report</div>
          </div>
          <div className="divide-y divide-[#333]">
            {royalties.map(roy => (
              <div key={roy.id} className="grid grid-cols-4 p-4 items-center font-sans text-sm hover:bg-[#1a1a1a] transition-colors">
                <div className="text-white font-medium">{roy.reportMonth}</div>
                <div className="text-gray-400">{(roy.streams || 0).toLocaleString()}</div>
                <div className="text-[#ccff00] font-bold font-mono">₹{roy.amount.toFixed(2)}</div>
                <div className="flex justify-end">
                  {roy.reportLink ? (
                    <a href={roy.reportLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-[#222] px-3 py-1.5 rounded text-[10px] uppercase font-display font-bold tracking-widest">
                      <Download size={14} /> XLSX
                    </a>
                  ) : (
                    <span className="text-gray-600 text-[10px] uppercase font-display tracking-widest">Processing...</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
