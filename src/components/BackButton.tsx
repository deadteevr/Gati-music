import { ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function BackButton({ fallbackPath = '/dashboard' }: { fallbackPath?: string }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show back button on main dashboard/home pages
  const isMainPage = location.pathname === '/dashboard' || location.pathname === '/admin' || location.pathname === '/';
  if (isMainPage) return null;

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallbackPath);
    }
  };

  return (
    <button
      onClick={handleBack}
      className="flex items-center gap-2 group mb-6 transition-all hover:translate-x-[-4px]"
      id="global-back-button"
    >
      <div className="w-8 h-8 rounded-full border border-[#333] flex items-center justify-center text-gray-400 group-hover:border-[#ccff00] group-hover:text-[#ccff00] transition-colors">
        <ArrowLeft size={16} />
      </div>
      <span className="text-[10px] font-display uppercase tracking-[0.2em] text-gray-500 group-hover:text-white transition-colors">
        Back
      </span>
    </button>
  );
}
