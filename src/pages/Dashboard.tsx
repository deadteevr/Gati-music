import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, Upload, Clock, Bell, IndianRupee, LogOut, Menu, X, User } from 'lucide-react';
import { logout } from '../lib/auth';
import { useState } from 'react';
import ArtistHome from './artist/ArtistHome';
import ArtistUpload from './artist/ArtistUpload';
import ArtistStatus from './artist/ArtistStatus';
import ArtistRoyalties from './artist/ArtistRoyalties';
import ArtistWithdrawal from './artist/ArtistWithdrawal';
import ArtistNotifications from './artist/ArtistNotifications';
import ArtistProfile from './artist/ArtistProfile';

export default function Dashboard({ user }: { user: any }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
  };

  const navItems = [
    { name: "Overview", path: "/dashboard", icon: <Home size={20} /> },
    { name: "Upload Song", path: "/dashboard/upload", icon: <Upload size={20} /> },
    { name: "My Releases", path: "/dashboard/status", icon: <Clock size={20} /> },
    { name: "Notifications", path: "/dashboard/notifications", icon: <Bell size={20} /> },
    { name: "Royalties", path: "/dashboard/royalties", icon: <IndianRupee size={20} /> },
    { name: "Withdrawals", path: "/dashboard/withdrawals", icon: <IndianRupee size={20} /> },
    { name: "Profile", path: "/dashboard/profile", icon: <User size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row">
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-[#333] bg-[#111]">
        <div className="text-2xl font-display font-black text-[#ccff00] tracking-tighter">GATI.</div>
        <div className="flex items-center gap-4">
          <Link to="/dashboard/notifications" className="text-gray-400 hover:text-[#ccff00] transition-colors relative">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#ccff00]"></span>
          </Link>
          <div className="w-8 h-8 rounded-full bg-[#333] flex items-center justify-center text-[#ccff00] font-sans font-bold text-xs">
            {user.displayName?.charAt(0) || 'A'}
          </div>
          <button 
            onClick={handleLogout}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <LogOut size={20} />
          </button>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 ml-2 text-white">
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <nav className={`
        ${mobileMenuOpen ? 'flex' : 'hidden'} md:flex 
        flex-col w-full md:w-64 bg-[#111] border-r border-[#333] 
        fixed md:sticky top-[73px] md:top-0 h-[calc(100vh-73px)] md:h-screen z-40
      `}>
        <div className="hidden md:flex p-6 border-b border-[#333] items-center justify-between">
          <div className="text-3xl font-display font-black text-[#ccff00] tracking-tighter">GATI.</div>
        </div>

        <div className="flex-1 py-6 px-4 overflow-y-auto flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            return (
              <Link 
                key={item.name} 
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-4 px-4 py-3 font-display uppercase tracking-widest text-sm transition-colors ${
                  isActive ? 'bg-[#333] text-[#ccff00] border-l-2 border-[#ccff00]' : 'text-gray-400 hover:text-white hover:bg-[#222]'
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
            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-[#ccff00] font-sans font-bold">
              {user.displayName?.charAt(0) || 'A'}
            </div>
            <div>
              <p className="text-sm font-bold font-sans truncate">{user.displayName || 'Artist'}</p>
              <p className="text-xs text-gray-500 font-sans truncate">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-400 hover:text-red-500 font-display uppercase tracking-widest transition-colors"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col max-h-screen overflow-hidden relative">
        {/* Topbar Desktop */}
        <header className="hidden md:flex items-center justify-end p-6 border-b border-[#333] bg-[#050505] z-10 gap-6">
          <Link to="/dashboard/notifications" className="text-gray-400 hover:text-[#ccff00] transition-colors relative">
            <Bell size={24} />
            <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-[#ccff00]"></span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-display uppercase tracking-widest font-bold text-white">{user.displayName || 'Artist'}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#333] flex items-center justify-center text-[#ccff00] font-sans font-bold">
              {user.displayName?.charAt(0) || 'A'}
            </div>
          </div>
          <div className="h-6 w-px bg-[#333] mx-2"></div>
          <button 
            onClick={handleLogout}
            className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-2"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 pb-24">
          <Routes>
            <Route path="/" element={<ArtistHome user={user} />} />
            <Route path="/upload" element={<ArtistUpload user={user} />} />
            <Route path="/status" element={<ArtistStatus user={user} />} />
            <Route path="/royalties" element={<ArtistRoyalties user={user} />} />
            <Route path="/withdrawals" element={<ArtistWithdrawal user={user} />} />
            <Route path="/notifications" element={<ArtistNotifications user={user} />} />
            <Route path="/profile" element={<ArtistProfile user={user} />} />
          </Routes>
        </div>

        {/* Floating WhatsApp Button */}
        <a 
          href="https://wa.me/917626841258?text=Hi,%20I%20am%20from%20the%20Gati%20Dashboard%20and%20need%20help." 
          target="_blank" rel="noopener noreferrer"
          className="fixed bottom-6 right-6 bg-[#25D366] text-white p-4 rounded-full shadow-[0_0_20px_rgba(37,211,102,0.3)] hover:scale-110 transition-transform z-50 flex items-center justify-center cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.347-.272.297-1.04 1.016-1.04 2.479 0 1.463 1.065 2.876 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
        </a>
      </main>
    </div>
  );
}
