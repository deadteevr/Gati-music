import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

export default function PremiumLoader() {
  const [showLongLoadMsg, setShowLongLoadMsg] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLongLoadMsg(true);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] bg-[#050505] flex items-center justify-center overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-[#ccff00] opacity-[0.07] blur-[100px] rounded-full mix-blend-screen animate-pulse"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] max-w-[400px] max-h-[400px] bg-[#9d4edd] opacity-[0.08] blur-[80px] rounded-full mix-blend-screen animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="relative z-10 flex flex-col items-center justify-center">
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

        {/* Progress Text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center"
        >
          <h2 className="text-sm md:text-base font-display uppercase tracking-widest text-[#ccff00] mb-2 font-medium">
            Launching Gati...
          </h2>
          <motion.p 
            key={showLongLoadMsg ? 'long' : 'short'}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs md:text-sm text-gray-400 font-sans tracking-wide"
          >
            {showLongLoadMsg ? "Still loading... almost there" : "Fast distribution. Real results."}
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
