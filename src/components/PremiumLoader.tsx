import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface PremiumLoaderProps {
  progress?: number;
  message?: string;
}

export default function PremiumLoader({ progress, message }: PremiumLoaderProps) {
  const [loadMessageIndex, setLoadMessageIndex] = useState(0);
  const loadingMessages = [
    "Optimizing Audio Engine...",
    "Syncing with Global Platforms...",
    "Securing Your Royalties...",
    "Analyzing Performance Data...",
    "Finalizing Interface..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] bg-[#050505] flex items-center justify-center overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-[#ccff00] opacity-[0.07] blur-[100px] rounded-full mix-blend-screen animate-pulse"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] max-w-[400px] max-h-[400px] bg-[#9d4edd] opacity-[0.08] blur-[80px] rounded-full mix-blend-screen animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-sm px-6">
        {/* Animated Logo */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: [1, 1.05, 1] }}
          transition={{ 
            duration: 2.5, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="text-6xl md:text-7xl font-display font-black tracking-tighter text-white mb-10 drop-shadow-[0_0_20px_rgba(204,255,0,0.4)]"
        >
          GATI
        </motion.div>

        {/* Sound-wave style loader */}
        <div className="flex items-center gap-2 mb-10 h-8">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 bg-[#ccff00] rounded-full shadow-[0_0_10px_rgba(204,255,0,0.5)]"
              animate={{ 
                height: ["12px", "32px", "12px"] 
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.15
              }}
            />
          ))}
        </div>

        {/* Progress Bar */}
        {typeof progress === 'number' && (
          <div className="w-full h-1 bg-[#1a1a1a] rounded-full overflow-hidden mb-6">
            <motion.div 
              className="h-full bg-[#ccff00] shadow-[0_0_15px_rgba(204,255,0,0.6)]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        )}

        {/* Progress Text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center"
        >
          <h2 className="text-sm md:text-base font-display uppercase tracking-widest text-[#ccff00] mb-2 font-black lg:text-xl">
            {message || loadingMessages[loadMessageIndex]}
          </h2>
          <motion.p 
            key={loadMessageIndex}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] md:text-xs text-gray-500 font-display uppercase tracking-[0.2em]"
          >
            Premium Music Distribution
          </motion.p>
          {typeof progress === 'number' && (
            <div className="mt-4 text-[20px] font-display font-black text-white/50">
              {Math.round(progress)}%
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
