import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useState, lazy, Suspense, useEffect } from 'react';
import { Home, Users, Music, Database, Bell, IndianRupee, CreditCard, Megaphone, Settings, LogOut, Menu, X, CheckSquare, Zap, Link as LinkIcon, UserPlus } from 'lucide-react';
import { logout } from '../lib/auth';
import PremiumLoader from '../components/PremiumLoader';
import BackButton from '../components/BackButton';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const AdminHome = lazy(() => import('./admin/AdminHome'));
const AdminArtists = lazy(() => import('./admin/AdminArtists'));
const AdminArtistProfile = lazy(() => import('./admin/AdminArtistProfile'));
const AdminSongs = lazy(() => import('./admin/AdminSongs'));
const AdminSongDetail = lazy(() => import('./admin/AdminSongDetail'));
const AdminBulkStreams = lazy(() => import('./admin/AdminBulkStreams'));
const AdminNotifications = lazy(() => import('./admin/AdminNotifications'));
const AdminRoyalties = lazy(() => import('./admin/AdminRoyalties'));
const AdminWithdrawals = lazy(() => import('./admin/AdminWithdrawals'));
const AdminSettings = lazy(() => import('./admin/AdminSettings'));
const AdminTasks = lazy(() => import('./admin/AdminTasks'));
const AdminMarketing = lazy(() => import('./admin/AdminMarketing'));
const AdminSmartLinks = lazy(() => import('./admin/AdminSmartLinks'));
const AdminRequests = lazy(() => import('./admin/AdminRequests'));
const AdminReferrals = lazy(() => import('./admin/AdminReferrals'));

export default function AdminPanel({ user, userData }: { user: any, userData: any }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasNewFeedback, setHasNewFeedback] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const q = query(collection(db, 'feedback'), where('status', '==', 'new'));
    const unsub = onSnapshot(q, (snap) => {
      setHasNewFeedback(!snap.empty);
    }, (error) => {
      console.error("Feedback snapshot error:", error);
    });
    return unsub;
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const navItems = [
    { name: "Dashboard", path: "/admin", icon: <Home size={18} /> },
    { name: "Artists", path: "/admin/artists", icon: <Users size={18} /> },
    { name: "Requests", path: "/admin/requests", icon: <UserPlus size={18} /> },
    { name: "Referrals", path: "/admin/referrals", icon: <Users size={18} /> },
    { name: "Smart Links", path: "/admin/smart-links", icon: <LinkIcon size={18} /> },
    { name: "Songs", path: "/admin/songs", icon: <Music size={18} /> },
    { name: "Tasks", path: "/admin/tasks", icon: <CheckSquare size={18} /> },
    { name: "Bulk Streams", path: "/admin/streams", icon: <Database size={18} /> },
    { name: "Marketing", path: "/admin/marketing", icon: <Megaphone size={18} /> },
    { 
      name: "Notifications", 
      path: "/admin/notifications", 
      icon: (
        <div className="relative">
          <Bell size={18} />
          {hasNewFeedback && <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#ccff00] rounded-full shadow-[0_0_5px_#ccff00]" />}
        </div>
      ) 
    },
    { name: "Royalties", path: "/admin/royalties", icon: <IndianRupee size={18} /> },
    { name: "Withdrawals", path: "/admin/withdrawals", icon: <CreditCard size={18} /> },
    { name: "Settings", path: "/admin/settings", icon: <Settings size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row">
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-[#333] bg-[#111]">
        <div className="text-xl font-display font-black text-[#9d4edd] tracking-tighter uppercase">Admin</div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-white">
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <nav className={`
        ${mobileMenuOpen ? 'flex' : 'hidden'} md:flex 
        flex-col w-full md:w-60 bg-[#111] border-r border-[#333] 
        fixed md:sticky top-[61px] md:top-0 h-[calc(100vh-61px)] md:h-screen z-40
      `}>
        <div className="hidden md:flex p-6 border-b border-[#333] items-center justify-between">
          <div className="text-2xl font-display font-black text-[#9d4edd] tracking-tighter uppercase">Gati Admin</div>
        </div>

        <div className="flex-1 py-4 px-3 overflow-y-auto flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link 
                key={item.name} 
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 font-display uppercase tracking-widest text-xs transition-colors rounded ${
                  isActive ? 'bg-[#9d4edd] text-white font-bold' : 'text-gray-400 hover:text-white hover:bg-[#222]'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            )
          })}
        </div>

        <div className="p-4 border-t border-[#333]">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-[#222] flex items-center justify-center text-[#9d4edd] font-sans font-bold text-xs">
              AD
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold font-sans truncate">{user.email}</p>
              <p className="text-[10px] text-gray-500 font-sans uppercase tracking-widest">Administrator</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs text-gray-400 hover:text-red-500 font-display uppercase tracking-widest transition-colors"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-h-screen overflow-hidden bg-[#0a0a0a]">
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <BackButton fallbackPath="/admin" />
          <Suspense fallback={<PremiumLoader />}>
            <Routes>
              <Route path="/" element={<AdminHome />} />
              <Route path="/artists" element={<AdminArtists />} />
              <Route path="/artists/:uid" element={<AdminArtistProfile />} />
              <Route path="/requests" element={<AdminRequests />} />
              <Route path="/referrals" element={<AdminReferrals />} />
              <Route path="/smart-links" element={<AdminSmartLinks />} />
              <Route path="/songs" element={<AdminSongs />} />
              <Route path="/songs/:id" element={<AdminSongDetail />} />
              <Route path="/tasks" element={<AdminTasks />} />
              <Route path="/streams" element={<AdminBulkStreams />} />
              <Route path="/notifications" element={<AdminNotifications />} />
              <Route path="/royalties" element={<AdminRoyalties />} />
              <Route path="/withdrawals" element={<AdminWithdrawals />} />
              <Route path="/marketing" element={<AdminMarketing />} />
              <Route path="/settings" element={<AdminSettings />} />
            </Routes>
          </Suspense>
        </div>
      </main>
    </div>
  );
}
