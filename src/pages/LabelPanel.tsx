import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  Music, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Bell, 
  Zap,
  LayoutDashboard,
  ShieldCheck,
  CreditCard,
  UserPlus
} from 'lucide-react';
import { logout } from '../lib/auth';
import { useState, lazy, Suspense, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import PremiumLoader from '../components/PremiumLoader';
import BackButton from '../components/BackButton';

const LabelDashboard = lazy(() => import('./label/LabelDashboard'));
const LabelArtistManagement = lazy(() => import('./label/LabelArtistManagement'));
const LabelArtistCatalog = lazy(() => import('./label/LabelArtistCatalog'));
const LabelCatalog = lazy(() => import('./label/LabelCatalog'));
const LabelAnalytics = lazy(() => import('./label/LabelAnalytics'));
const LabelSettings = lazy(() => import('./label/LabelSettings'));

export default function LabelPanel({ user, userData, globalSettings }: { user: any, userData: any, globalSettings: any }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'notifications'), where('uid', '==', user.uid), where('read', '==', false));
    const unsub = onSnapshot(q, (snap) => {
      setUnreadCount(snap.size);
    }, (error) => {
      console.error("Notifications snapshot error:", error);
    });
    return unsub;
  }, [user]);

  const handleLogout = async () => {
    await logout();
  };

  const navItems = [
    { name: "Overview", path: "/label", icon: <LayoutDashboard size={20} /> },
    { name: "Artist Roster", path: "/label/artists", icon: <Users size={20} /> },
    { name: "Label Catalog", path: "/label/catalog", icon: <Music size={20} /> },
    { name: "Team Analytics", path: "/label/analytics", icon: <BarChart3 size={20} /> },
    { name: "Billing & Plans", path: "/pricing", icon: <CreditCard size={20} /> },
    { name: "Label Settings", path: "/label/settings", icon: <Settings size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row">
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-white/5 bg-[#0A0A0A]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#8B5CF6] rounded-lg flex items-center justify-center font-display font-black text-white italic">G.</div>
          <span className="font-display font-black tracking-tighter text-white">LABEL.</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-white">
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <nav className={`
        ${mobileMenuOpen ? 'flex' : 'hidden'} md:flex 
        flex-col w-full md:w-64 bg-[#0A0A0A] border-r border-white/5 
        fixed md:sticky top-[65px] md:top-0 h-[calc(100vh-65px)] md:h-screen z-40
      `}>
        <div className="hidden md:flex p-6 border-b border-white/5 items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#8B5CF6] to-[#6366F1] rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
             <Building2 size={24} className="text-white" />
          </div>
          <div className="font-display font-black tracking-tighter text-white leading-none">
            <span className="block text-xl">GATI</span>
            <span className="text-[10px] text-[#8B5CF6] tracking-widest uppercase">Label Panel</span>
          </div>
        </div>

        <div className="flex-1 py-8 px-4 overflow-y-auto flex flex-col gap-2">
          {/* Request Dashboard Quick Link */}
          <a 
            href="https://wa.me/917626841258?text=Hi, I want to request dashboard access."
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 px-4 py-3 mb-4 bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 rounded-xl font-display uppercase tracking-widest text-[10px] font-black text-[#8B5CF6] hover:bg-[#8B5CF6] hover:text-white transition-all group"
          >
            <LayoutDashboard size={16} />
            Request Admin Dashboard
          </a>

          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/label' && location.pathname.startsWith(item.path));
            
            return (
              <Link 
                key={item.name} 
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-4 px-4 py-3.5 font-display uppercase tracking-widest text-[11px] font-black transition-all rounded-xl group ${
                  isActive 
                    ? 'bg-[#8B5CF6] text-white shadow-lg shadow-purple-500/20' 
                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className={`${isActive ? 'text-white' : 'text-gray-600 group-hover:text-[#8B5CF6] transition-colors'}`}>{item.icon}</span>
                {item.name}
              </Link>
            )
          })}
        </div>

        <div className="p-6 border-t border-white/5 space-y-4">
           <div className="p-4 bg-gradient-to-br from-[#111] to-black border border-white/5 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={14} className="text-[#8B5CF6]" />
                <span className="text-[10px] uppercase font-black tracking-widest text-gray-400">Status</span>
              </div>
              <p className="text-xs font-bold">{userData.subscription?.planType || 'Standard Label'}</p>
              <div className="mt-3 w-full bg-white/5 h-1 rounded-full overflow-hidden">
                <div className="bg-[#8B5CF6] h-full w-[70%]" />
              </div>
           </div>

          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 text-[11px] uppercase font-black tracking-widest text-gray-500 hover:text-red-500 transition-colors bg-white/5 rounded-xl border border-white/5"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col max-h-screen overflow-hidden relative">
        <div className="flex-1 overflow-y-auto">
          <Suspense fallback={<PremiumLoader />}>
            <Routes>
              <Route path="/" element={<LabelDashboard user={user} userData={userData} />} />
              <Route path="/artists" element={<LabelArtistManagement user={user} userData={userData} />} />
              <Route path="/artists/:aid" element={<LabelArtistCatalog user={user} userData={userData} />} />
              <Route path="/catalog" element={<LabelCatalog user={user} userData={userData} />} />
              <Route path="/analytics" element={<LabelAnalytics user={user} userData={userData} />} />
              <Route path="/settings" element={<LabelSettings user={user} userData={userData} />} />
              <Route path="*" element={<Navigate to="/label" replace />} />
            </Routes>
          </Suspense>
        </div>
      </main>
    </div>
  );
}
