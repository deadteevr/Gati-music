import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Home, Users, Music, Database, Bell, IndianRupee, CreditCard, Megaphone, Settings, LogOut, Menu, X } from 'lucide-react';
import { logout } from '../lib/auth';

import AdminHome from './admin/AdminHome';
import AdminArtists from './admin/AdminArtists';
import AdminArtistProfile from './admin/AdminArtistProfile';
import AdminSongs from './admin/AdminSongs';
import AdminSongDetail from './admin/AdminSongDetail';
import AdminBulkStreams from './admin/AdminBulkStreams';
import AdminNotifications from './admin/AdminNotifications';
import AdminRoyalties from './admin/AdminRoyalties';
import AdminWithdrawals from './admin/AdminWithdrawals';
import AdminSettings from './admin/AdminSettings';

export default function AdminPanel({ user }: { user: any }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
  };

  const navItems = [
    { name: "Dashboard", path: "/admin", icon: <Home size={18} /> },
    { name: "Artists", path: "/admin/artists", icon: <Users size={18} /> },
    { name: "Songs", path: "/admin/songs", icon: <Music size={18} /> },
    { name: "Bulk Streams", path: "/admin/streams", icon: <Database size={18} /> },
    { name: "Notifications", path: "/admin/notifications", icon: <Bell size={18} /> },
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
          <Routes>
            <Route path="/" element={<AdminHome />} />
            <Route path="/artists" element={<AdminArtists />} />
            <Route path="/artists/:uid" element={<AdminArtistProfile />} />
            <Route path="/songs" element={<AdminSongs />} />
            <Route path="/songs/:id" element={<AdminSongDetail />} />
            <Route path="/streams" element={<AdminBulkStreams />} />
            <Route path="/notifications" element={<AdminNotifications />} />
            <Route path="/royalties" element={<AdminRoyalties />} />
            <Route path="/withdrawals" element={<AdminWithdrawals />} />
            <Route path="/settings" element={<AdminSettings />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
