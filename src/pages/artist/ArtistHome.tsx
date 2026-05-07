import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, limit, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { Link } from 'react-router-dom';
import { ArrowRight, Music, TrendingUp, TrendingDown, Radio, Activity, CalendarDays, Bell, MessageSquare, Send, CheckCircle2, Sparkles, Lightbulb, Globe, Plus, Megaphone, IndianRupee, ShieldAlert, Star } from 'lucide-react';
import { geminiService, GrowthInsights, NextActions } from '../../services/geminiService';
import { AIThinking } from '../../components/AIComponents';
import { motion, AnimatePresence } from 'motion/react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';

import { getRemainingDays, isPlanActive } from '../../lib/planUtils';

export default function ArtistHome({ user, userData }: { user: any, userData: any }) {
  const [stats, setStats] = useState({ 
    totalSongs: 0, 
    liveSongs: 0, 
    inProgress: 0, 
    totalEarnings: 0, 
    currentMonthEarnings: 0,
    totalStreams: 0 
  });

  const subscription = userData?.subscription;
  const isSubscribed = isPlanActive(subscription);
  const daysLeft = getRemainingDays(subscription?.expiryDate);
  const showExpiryAlert = isSubscribed && daysLeft <= 2;
  const [chartData, setChartData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  const [growth, setGrowth] = useState<number | null>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [feedback, setFeedback] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState<GrowthInsights | null>(null);
  const [aiActions, setAiActions] = useState<NextActions | null>(null);
  const [rewards, setRewards] = useState<any[]>([]);

  const generateAIContext = async () => {
    if (loading || stats.totalSongs === 0) return;
    setAiLoading(true);
    try {
      const [insights, actions] = await Promise.all([
        geminiService.analyzeGrowth({
          currentStreams: stats.totalStreams,
          previousStreams: stats.totalStreams * 0.9,
          currentEarnings: stats.totalEarnings,
          previousEarnings: stats.totalEarnings - stats.currentMonthEarnings,
          totalReleases: stats.totalSongs
        }),
        geminiService.suggestNextActions({
          streamsTrend: growth && growth > 0 ? 'increasing' : growth && growth < 0 ? 'decreasing' : 'stable',
          releaseFrequency: stats.totalSongs > 5 ? 'high' : stats.totalSongs > 2 ? 'medium' : 'low',
          bestSongStreams: stats.totalStreams * 0.4,
          averageStreams: stats.totalStreams / (stats.totalSongs || 1)
        })
      ]);
      setAiInsights(insights);
      setAiActions(actions);
    } catch (err) {
      console.error("AI Context generation error:", err);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && stats.totalSongs > 0 && !aiInsights) {
      generateAIContext();
    }
  }, [loading, stats.totalSongs]);

  const COLORS = ['#ccff00', '#9d4edd', '#ffffff', '#777777', '#333333', '#111111'];

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    setSubmittingFeedback(true);
    try {
      await addDoc(collection(db, 'feedback'), {
        uid: user.uid,
        userName: user.displayName,
        userEmail: user.email,
        message: feedback,
        createdAt: serverTimestamp(),
        status: 'new'
      });
      setFeedback("");
      setFeedbackSent(true);
      setTimeout(() => setFeedbackSent(false), 5000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    
    // Submissions Snapshot
    const subQuery = query(collection(db, 'submissions'), where('uid', '==', user.uid));
    const unsubSub = onSnapshot(subQuery, (subDocs) => {
      let liveCount = 0;
      let progressCount = 0;
      let totalStreamsCalc = 0;
      const aggregatedStreams: Record<string, number> = {};
      
      subDocs.forEach(d => {
        const data = d.data();
        const status = data.status;
        if (status === 'live' || status === 'Live') {
          liveCount++;
        } else {
          progressCount++;
        }

        if (data.streams) {
          totalStreamsCalc += Number(data.streams.total || 0);
          for (const [platform, count] of Object.entries(data.streams)) {
            if (platform !== 'total' && Number(count) > 0) {
              aggregatedStreams[platform] = (aggregatedStreams[platform] || 0) + Number(count);
            }
          }
        }
      });

      const formattedPieData = Object.keys(aggregatedStreams)
        .map(platform => ({
          name: platform.charAt(0).toUpperCase() + platform.slice(1),
          value: aggregatedStreams[platform]
        }))
        .sort((a, b) => b.value - a.value);

      setPieData(formattedPieData);

      setStats(prev => ({
        ...prev,
        totalSongs: subDocs.size,
        liveSongs: liveCount,
        inProgress: progressCount,
        totalStreams: totalStreamsCalc
      }));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'submissions', false);
    });

    // Royalties Snapshot
    const royQuery = query(collection(db, 'royalties'), where('uid', '==', user.uid));
    const unsubRoy = onSnapshot(royQuery, (royDocs) => {
      let totalEarnings = 0;
      const royaltiesList: any[] = [];
      
      royDocs.forEach(d => {
        const data = d.data();
        totalEarnings += data.amount || 0;
        royaltiesList.push(data);
      });

      royaltiesList.sort((a, b) => {
        const parseMonth = (str: string) => new Date(`${str} 1`).getTime();
        return parseMonth(a.reportMonth) - parseMonth(b.reportMonth);
      });

      const monthlyData = royaltiesList.map(r => ({
        month: r.reportMonth,
        earnings: Number(r.amount)
      }));

      setChartData(monthlyData);

      let currentMonthEarnings = 0;
      if (royaltiesList.length > 0) {
        currentMonthEarnings = royaltiesList[royaltiesList.length - 1].amount;
      }

      let growthCalc = null;
      if (royaltiesList.length >= 2) {
        const curr = royaltiesList[royaltiesList.length - 1].amount;
        const prev = royaltiesList[royaltiesList.length - 2].amount;
        if (prev > 0) {
          growthCalc = ((curr - prev) / prev) * 100;
        } else if (curr > 0) {
          growthCalc = 100;
        } else {
          growthCalc = 0;
        }
      } else if (royaltiesList.length === 1) {
        if (royaltiesList[0].amount > 0) growthCalc = 100;
      }
      setGrowth(growthCalc);

      setStats(prev => ({
        ...prev,
        totalEarnings,
        currentMonthEarnings
      }));
      
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'royalties', false);
      setLoading(false);
    });

    // Notifications Snapshot
    const notifQuery = query(collection(db, 'notifications'), where('uid', '==', user.uid), orderBy('createdAt', 'desc'), limit(3));
    const unsubNotif = onSnapshot(notifQuery, (notifDocs) => {
      const activityList: any[] = [];
      notifDocs.forEach(d => {
        activityList.push({ id: d.id, ...d.data() });
      });
      setRecentActivity(activityList);
    }, (error) => {
      console.error("ArtistHome: notifications snapshot error", error);
    });

    // Rewards Fetch (Static)
    const fetchRewards = async () => {
      try {
        const q = query(collection(db, 'rewards'), where('uid', '==', user.uid), where('status', '==', 'active'));
        const snap = await getDocs(q);
        setRewards(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error("Error fetching rewards:", e);
      }
    };
    fetchRewards();

    return () => {
      unsubSub();
      unsubRoy();
      unsubNotif();
    };
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

      {rewards.length > 0 && (
        <div className="mb-10 grid gap-4">
          {rewards.map(reward => (
            <motion.div 
              key={reward.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-gradient-to-r from-[#9d4edd] to-[#c77dff] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_30px_rgba(157,78,221,0.3)]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black/20 rounded-full flex items-center justify-center text-white shrink-0">
                  <Star size={24} />
                </div>
                <div>
                  <p className="font-display font-black uppercase text-sm tracking-widest text-white leading-tight">Reward Unlocked!</p>
                  <p className="text-[10px] font-sans text-white/80 uppercase tracking-widest font-bold">
                    {reward.type === 'free_song' ? 'You have 1 Free Release available.' : 'You have earned 1 Month of Unlimited Gati Plan for free.'}
                  </p>
                </div>
              </div>
              <Link 
                to={reward.type === 'free_song' ? '/dashboard/upload' : '/dashboard/referrals'}
                className="w-full sm:w-auto bg-black text-white px-8 py-3 font-display uppercase font-black text-[10px] tracking-widest hover:bg-white hover:text-black transition-all text-center"
              >
                {reward.type === 'free_song' ? 'Use Now' : 'Claim Reward'}
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {showExpiryAlert && (
        <div className="bg-red-500 text-white p-4 border border-red-600 flex flex-col sm:flex-row items-center justify-between gap-4 mb-10 group animate-pulse hover:animate-none transition-all">
          <div className="flex items-center gap-3">
            <ShieldAlert className="shrink-0" />
            <div>
              <p className="font-display font-black uppercase text-sm tracking-widest">Subscription Expiring Soon</p>
              <p className="text-[10px] font-sans opacity-90 uppercase tracking-widest leading-tight">Your distribution plan ends in {daysLeft} day{daysLeft !== 1 ? 's' : ''}. Renew now to keep your uploads active.</p>
            </div>
          </div>
          <Link to="/pricing" className="w-full sm:w-auto bg-white text-black px-6 py-2 font-display uppercase font-extrabold text-[10px] tracking-widest hover:bg-[#ccff00] transition-colors text-center whitespace-nowrap">Renew Plan</Link>
        </div>
      )}
      
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-10">
        <div className="bg-[#111] border border-[#333] p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between text-gray-400 mb-4">
            <span className="font-display font-medium uppercase text-xs tracking-widest z-10 relative">Total Streams</span>
            <Activity size={18} className="z-10 relative" opacity={0.5} />
          </div>
          <div className="text-4xl font-display text-white z-10 relative truncate">
            {loading ? '-' : stats.totalStreams.toLocaleString()}
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
            <Music size={18} className="z-10 relative" opacity={0.8} />
          </div>
          <div className="text-4xl font-display text-white z-10 relative">
            {loading ? '-' : stats.inProgress}
          </div>
        </div>

        <div className="bg-[#111] border border-[#333] p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between text-gray-400 mb-4">
            <span className="font-display font-medium uppercase text-xs tracking-widest z-10 relative">Total Earnings</span>
            <IndianRupee size={18} opacity={0.5} className="z-10 relative text-gray-400" />
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

      <div className="grid lg:grid-cols-3 gap-6 mb-12">
        <div className="lg:col-span-2 bg-[#ccff00] p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
             <Megaphone size={140} className="text-black" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-md">
              <h3 className="text-3xl font-display uppercase font-black text-black leading-tight mb-4">Go Viral.<br/>Promote Your Song.</h3>
              <p className="text-black/70 text-sm font-sans mb-0 font-medium tracking-tight">Boost your streams with professional Google and Meta ad campaigns. Access YouTube promotion, Spotify playlist pitching, and viral Reel campaigns starting from ₹199.</p>
            </div>
            <Link 
              to="/pricing" 
              className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 text-[10px] font-display uppercase font-black tracking-widest hover:bg-zinc-900 transition-all shadow-xl hover:shadow-[#ccff00]/20 shrink-0"
            >
              Start Promotion <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        <div className="bg-[#111] p-8 border border-[#333] flex flex-col justify-center relative group">
          <div className="absolute top-0 right-0 p-2 text-[#ccff00]/10">
            <Sparkles size={60} />
          </div>
          <h3 className="text-xl font-display uppercase font-black text-white mb-2 leading-none">Need More<br/>Views?</h3>
          <p className="text-gray-500 text-xs font-sans mb-6">Real India-based marketing for your latest release.</p>
          <a 
            href={`https://wa.me/917626841258?text=Hi, I want to promote my new song: ${user.displayName || user.email}`}
            target="_blank" rel="noopener noreferrer"
            className="w-full py-3 bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] text-center text-[10px] uppercase font-display font-black tracking-widest hover:bg-[#ccff00] hover:text-black transition-all"
          >
            Chat with Expert
          </a>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 mb-12">
        <div className="lg:col-span-8 bg-[#111] p-6 lg:p-8 border border-[#333]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h3 className="text-xl font-display uppercase tracking-widest text-white">Consumption Trends</h3>
              <p className="text-gray-500 font-sans text-xs">Monthly performance over time</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#ccff00]"></div>
                <span className="text-[10px] text-gray-400 uppercase tracking-widest">Revenue</span>
              </div>
            </div>
          </div>
          {chartData.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ccff00" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ccff00" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#222" />
                  <XAxis dataKey="month" stroke="#333" fontSize={10} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="earnings" stroke="#ccff00" strokeWidth={2} fillOpacity={1} fill="url(#colorEarnings)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center border border-dashed border-[#222]">
              <p className="text-gray-500 text-xs font-sans">Awaiting payout data...</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 bg-[#111] p-6 lg:p-8 border border-[#333]">
          <h3 className="text-xl font-display uppercase tracking-widest text-white mb-1">Top Platforms</h3>
          <p className="text-gray-500 font-sans text-xs mb-8">Platform-wise stream distribution</p>
          <div className="h-[250px] w-full mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {pieData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {pieData.slice(0, 4).map((item, i) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                  <span className="text-xs font-sans text-gray-300">{item.name}</span>
                </div>
                <span className="text-xs font-mono text-white">{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insights row */}
      <div className="grid lg:grid-cols-2 gap-6 mb-12">
        <div className="bg-[#111] border border-[#ccff00]/20 p-6 lg:p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Sparkles size={120} className="text-[#ccff00]" /></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#ccff00]/10 rounded-full flex items-center justify-center text-[#ccff00]"><Sparkles size={20} /></div>
                <div><h3 className="text-lg font-display uppercase tracking-widest text-[#ccff00]">Smart Insights</h3></div>
              </div>
            </div>
            {aiLoading ? <AIThinking /> : aiInsights ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/40 p-4 rounded border border-white/5">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Streams Growth</span>
                    <span className="text-xl font-display text-white">{aiInsights.streamsGrowth}</span>
                  </div>
                </div>
                <div className="p-4 bg-[#ccff00]/5 border-l-2 border-[#ccff00]"><p className="text-white text-sm font-sans italic">"{aiInsights.performanceSummary}"</p></div>
              </div>
            ) : <div className="py-8 text-center text-gray-500 text-xs">Upload more to unlock AI insights.</div>}
          </div>
        </div>
        <div className="bg-[#111] border border-[#9d4edd]/20 p-6 lg:p-8 relative overflow-hidden">
          <div className="absolute bottom-0 right-0 p-4 opacity-10"><Lightbulb size={120} className="text-[#9d4edd]" /></div>
          <div className="relative z-10">
             <div className="flex items-center gap-3 mb-8">
               <div className="w-10 h-10 bg-[#9d4edd]/10 rounded-full flex items-center justify-center text-[#9d4edd]"><Activity size={20} /></div>
               <div><h3 className="text-lg font-display uppercase tracking-widest text-[#9d4edd]">Next Actions</h3></div>
             </div>
             {aiLoading ? <AIThinking /> : aiActions ? (
               <ul className="space-y-3">
                 {aiActions.actions.map((action, i) => (
                   <li key={i} className="flex items-start gap-3 text-sm text-gray-300 font-sans"><span className="text-[#9d4edd] font-bold">{i+1}.</span> {action}</li>
                 ))}
               </ul>
             ) : <div className="py-8 text-center text-gray-500 text-xs">Complete your profile for actions.</div>}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="bg-[#111] border border-[#333] p-8 flex flex-col">
          <h3 className="text-xs font-display uppercase tracking-widest text-gray-500 mb-6 font-bold">Recent Activity</h3>
          <div className="flex-1 space-y-4">
            {recentActivity.length > 0 ? recentActivity.map((notif: any) => (
              <div key={notif.id} className="flex gap-4 group cursor-pointer border-b border-white/5 pb-4 last:border-0">
                <div className="w-1 h-1 rounded-full bg-[#ccff00] mt-2"></div>
                <div><h4 className="text-white font-sans font-bold text-xs mb-1 hover:text-[#ccff00] transition-colors">{notif.title}</h4><p className="text-gray-500 font-sans text-[10px] line-clamp-1">{notif.message}</p></div>
              </div>
            )) : <div className="flex-1 flex items-center justify-center border border-dashed border-white/5"><p className="text-gray-600 font-sans text-xs italic">No new notifications.</p></div>}
          </div>
        </div>

        <div className="lg:col-span-1 bg-[#111] border border-[#333] p-8 flex flex-col">
          <h3 className="text-xs font-display uppercase tracking-widest text-gray-500 mb-6 font-bold">Quick Navigation</h3>
          <div className="grid grid-cols-1 gap-2">
            <Link to="/dashboard/upload" className="p-4 border border-white/5 bg-white/5 hover:bg-[#ccff00] hover:text-black transition-all flex justify-between items-center group"><span className="text-[10px] font-display uppercase tracking-widest font-black">Release Music</span><Plus size={16} /></Link>
            <Link to="/dashboard/status" className="p-4 border border-white/5 bg-white/5 hover:bg-white hover:text-black transition-all flex justify-between items-center group"><span className="text-[10px] font-display uppercase tracking-widest font-black">My Catalog</span><ArrowRight size={16} /></Link>
          </div>
        </div>

        <div className="lg:col-span-1 bg-[#111] border border-[#333] p-8 flex flex-col relative overflow-hidden">
          <div className="absolute -bottom-4 -right-4 opacity-5"><MessageSquare size={120} /></div>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xs font-display uppercase tracking-widest text-gray-500 font-bold">Platform Feedback</h3>
            <span className="flex h-2 w-2 rounded-full bg-[#ccff00] animate-pulse"></span>
          </div>
          <p className="text-[10px] text-gray-600 font-sans mb-4 uppercase tracking-widest">Share feature requests or report bugs</p>
          
          <form onSubmit={handleFeedbackSubmit} className="flex-1 flex flex-col gap-3 relative z-10">
            <textarea 
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="What can we improve?..."
              className="flex-1 bg-black border border-[#222] p-3 text-xs text-white font-sans focus:outline-none focus:border-[#ccff00] min-h-[100px] resize-none"
              required
            />
            <button 
              type="submit" 
              disabled={submittingFeedback || feedbackSent}
              className={`w-full font-display font-black uppercase tracking-[0.2em] text-[10px] py-3 flex items-center justify-center gap-2 transition-all ${
                feedbackSent ? 'bg-green-500 text-white' : 'bg-[#ccff00] text-black hover:bg-white'
              }`}
            >
              {submittingFeedback ? 'Sending...' : feedbackSent ? <><CheckCircle2 size={14}/> Sent</> : <><Send size={14} /> Submit Feedback</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
