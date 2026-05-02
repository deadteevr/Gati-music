import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

interface AIActionButtonProps {
  onClick: (e: React.MouseEvent) => void;
  loading: boolean;
  text: string;
  className?: string;
}

export const AIActionButton: React.FC<AIActionButtonProps> = ({ onClick, loading, text, className = "" }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`
        relative overflow-hidden flex items-center justify-center gap-2 
        bg-black border border-[#ccff00]/30 text-[#ccff00] 
        px-4 py-2 rounded-full font-display uppercase tracking-widest text-[10px] font-bold
        hover:border-[#ccff00] hover:shadow-[0_0_15px_rgba(204,255,0,0.3)] transition-all
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <Sparkles size={14} />
      )}
      {loading ? "Magic in progress..." : text}
      
      {/* Shimmer effect */}
      {!loading && (
        <motion.div
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ccff00]/10 to-transparent skew-x-12 translate-x-[-100%]"
        />
      )}
    </motion.button>
  );
};

export const AIThinking = () => (
  <div className="flex flex-col items-center justify-center py-6 gap-3">
    <div className="relative">
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute inset-0 bg-[#ccff00] rounded-full blur-xl"
      />
      <Sparkles size={32} className="text-[#ccff00] relative z-10 animate-pulse" />
    </div>
    <span className="text-[10px] font-display uppercase tracking-[0.3em] text-[#ccff00] font-bold">Gati AI is thinking...</span>
  </div>
);
