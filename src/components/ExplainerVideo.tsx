import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Globe, BarChart3, Wallet, CheckCircle2, Play, Pause, RotateCcw, Music, DollarSign, TrendingUp, Zap } from 'lucide-react';

const STEPS = [
  {
    id: 1,
    title: "Upload Your Magic",
    hook: "Release your music worldwide in minutes.",
    subtitle: "Drop your FLAC/WAV files and high-res cover art. Our system handles the heavy lifting of metadata validation.",
    icon: <Upload className="w-12 h-12 text-[#B6FF00]" />,
    color: "#B6FF00",
    particleColor: "rgba(182, 255, 0, 0.2)"
  },
  {
    id: 2,
    title: "Reach 150+ Stores",
    hook: "Your sound. Every platform.",
    subtitle: "Spotify, Apple Music, JioSaavn, and 150+ more in 48 hours. Real-time delivery to major giants.",
    icon: <Globe className="w-12 h-12 text-[#8B5CF6]" />,
    color: "#8B5CF6",
    particleColor: "rgba(139, 92, 246, 0.2)"
  },
  {
    id: 3,
    title: "Real-Time Analytics",
    hook: "Watch your fanbase grow.",
    subtitle: "Daily stream data and detailed demographics. See where your fans are and what they're listening to.",
    icon: <BarChart3 className="w-12 h-12 text-[#B6FF00]" />,
    color: "#B6FF00",
    particleColor: "rgba(182, 255, 0, 0.2)"
  },
  {
    id: 4,
    title: "Withdraw Anytime",
    hook: "Your revenue, your way.",
    subtitle: "Zero thresholds. Keep 100% of your earnings. Withdraw your royalties easily whenever you want.",
    icon: <Wallet className="w-12 h-12 text-[#8B5CF6]" />,
    color: "#8B5CF6",
    particleColor: "rgba(139, 92, 246, 0.2)"
  }
];

export default function ExplainerVideo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasIntersected, setHasIntersected] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const STEP_DURATION = 5000; // 5 seconds per step (faster)

  // Particle background logic
  const particles = useMemo(() => [...Array(20)].map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 10 + 10
  })), []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
          setIsPlaying(true);
        }
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [hasIntersected]);

  useEffect(() => {
    if (isPlaying) {
      const startTime = Date.now() - (progress * STEP_DURATION) / 100;
      
      const update = () => {
        const elapsed = Date.now() - startTime;
        const newProgress = (elapsed / STEP_DURATION) * 100;
        
        if (newProgress >= 100) {
          setCurrentStep((prev) => (prev + 1) % STEPS.length);
          setProgress(0);
        } else {
          setProgress(newProgress);
          timerRef.current = setTimeout(update, 50);
        }
      };
      
      update();
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentStep]);

  const handleStepClick = (index: number) => {
    setCurrentStep(index);
    setProgress(0);
  };

  return (
    <div ref={containerRef} className="w-full max-w-5xl mx-auto rounded-[2rem] sm:rounded-[3rem] overflow-hidden border border-[#222] bg-[#050505] shadow-[0_40px_100px_-20px_rgba(0,0,0,1)] relative group select-none z-10">
      {/* Background Particles Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{ 
              left: `${p.x}%`, 
              top: `${p.y}%`, 
              width: p.size, 
              height: p.size,
              backgroundColor: STEPS[currentStep].particleColor,
              boxShadow: `0 0 10px ${STEPS[currentStep].particleColor}`
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0.1, 0.4, 0.1],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Main Content Area */}
      <div className="aspect-[4/5] sm:aspect-video relative overflow-hidden flex flex-col">
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 z-0 opacity-30">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 45, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(182,255,0,0.05)_0%,transparent_70%)]"
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50, scale: 0.98, filter: "blur(10px)" }}
            animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: -50, scale: 1.02, filter: "blur(10px)" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full h-full flex items-center justify-center p-6 lg:p-20"
          >
            <div className="w-full h-full flex flex-col lg:flex-row items-center gap-8 lg:gap-24 overflow-y-auto sm:overflow-visible">
              
              {/* Visual Visuals Cell */}
              <div className="flex-1 w-full h-full flex items-center justify-center perspective-[1000px] min-h-[250px] sm:min-h-0">
                {currentStep === 0 && (
                  <motion.div 
                    initial={{ rotateX: 20, rotateY: -10 }}
                    animate={{ rotateX: 0, rotateY: 0 }}
                    transition={{ duration: 1 }}
                    className="relative w-full max-w-[320px] aspect-square rounded-[2rem] border-2 border-dashed border-[#B6FF00]/20 flex flex-col items-center justify-center bg-[#0d0d0d] shadow-2xl"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.4, 1], opacity: [0.1, 0.3, 0.1] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="absolute w-40 h-40 bg-[#B6FF00] rounded-full blur-[80px]"
                    />
                    <div className="relative z-10 flex flex-col items-center">
                      <motion.div
                        animate={{ y: [0, -15, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <Upload className="w-24 h-24 text-[#B6FF00]" />
                      </motion.div>
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-8 px-6 py-2.5 bg-[#B6FF00] text-black rounded-xl font-black text-xs uppercase tracking-widest shadow-[0_0_30px_rgba(182,255,0,0.5)]"
                      >
                        MY_NEW_HIT.WAV
                      </motion.div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 1 && (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                      className="w-64 h-64 border border-[#8B5CF6]/10 rounded-full flex items-center justify-center"
                    >
                      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-12 h-12 bg-[#111] border border-white/5 rounded-2xl flex items-center justify-center shadow-lg"
                          style={{
                            transform: `rotate(${angle}deg) translate(120px) rotate(-${angle}deg)`
                          }}
                        >
                           <Music className="text-[#8B5CF6]/40" size={20} />
                        </motion.div>
                      ))}
                    </motion.div>
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className="absolute w-32 h-32 bg-[#8B5CF6]/10 rounded-full blur-3xl"
                    />
                    <Globe className="absolute w-24 h-24 text-[#8B5CF6] drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]" />
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="w-full max-w-[340px] h-64 flex flex-col justify-center bg-[#0d0d0d] rounded-3xl border border-white/5 p-8 relative overflow-hidden">
                    <motion.div 
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-[#B6FF00]/5 to-transparent z-0"
                    />
                    <div className="flex items-end justify-between gap-2 h-32 relative z-10 mb-6">
                      {[30, 45, 35, 80, 60, 100, 50, 70].map((h, i) => (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ delay: i * 0.1, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                          className="flex-1 bg-gradient-to-t from-[#B6FF00]/20 to-[#B6FF00] rounded-t-full shadow-[0_0_15px_rgba(182,255,0,0.2)]"
                        />
                      ))}
                    </div>
                    <div className="flex justify-between items-center bg-[#1a1a1a] p-3 rounded-xl border border-white/5">
                      <div className="text-[10px] uppercase font-bold text-gray-500">Peak Listener Time</div>
                      <div className="text-[10px] font-black text-[#B6FF00]">09:30 PM IST</div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="relative">
                    <motion.div 
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="bg-[#0d0d0d] p-12 rounded-[2.5rem] border border-white/5 text-center shadow-2xl relative z-10"
                    >
                      <div className="w-16 h-16 bg-[#B6FF00]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <DollarSign className="text-[#B6FF00]" size={28} />
                      </div>
                      <div className="text-gray-500 text-xs uppercase tracking-[0.3em] mb-4 font-black">Net Revenue Available</div>
                      <motion.div 
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        className="text-6xl lg:text-7xl font-display font-black text-white mb-10 tracking-tighter"
                      >
                        ₹42<span className="text-[#8B5CF6]">,</span>850
                      </motion.div>
                      <motion.button
                        whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(139,92,246,0.3)" }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full py-5 bg-[#8B5CF6] text-white rounded-2xl text-sm font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-[0_15px_30px_-5px_rgba(139,92,246,0.5)]"
                      >
                        Withdraw To Bank <Zap size={18} fill="currentColor" />
                      </motion.button>
                    </motion.div>
                    {/* Floating Coins */}
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-8 h-8 rounded-full border-4 border-[#B6FF00] opacity-20"
                        animate={{ 
                          y: [-20, 20], 
                          rotate: 360,
                          x: [0, (i % 2 === 0 ? 50 : -50)]
                        }}
                        transition={{ 
                          duration: 3 + i, 
                          repeat: Infinity, 
                          repeatType: "reverse"
                        }}
                        style={{
                          top: `${i * 20}%`,
                          left: `${i * 15}%`,
                          zIndex: 0
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Textual Content Container */}
              <div className="flex-1 flex flex-col justify-center text-center lg:text-left">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center gap-4 mb-8 justify-center lg:justify-start">
                    <span className="w-12 h-px bg-white/10" />
                    <span className="text-[#8B5CF6] text-[10px] uppercase font-black tracking-[0.4em]">Feature Focus</span>
                    <span className="w-12 h-px bg-white/10" />
                  </div>

                  <h3 className="text-4xl lg:text-6xl font-display uppercase tracking-tighter text-white mb-6 leading-[0.95]">
                    {STEPS[currentStep].title}
                  </h3>
                  
                  <div className="relative inline-block mb-8">
                    <p className="text-2xl lg:text-3xl font-black text-[#B6FF00] leading-tight italic tracking-tight">
                      "{STEPS[currentStep].hook}"
                    </p>
                    <motion.div 
                      className="absolute -right-2 -top-2 w-3 h-3 bg-[#8B5CF6] rounded-full blur-[2px]"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>

                  <p className="text-gray-400 text-lg lg:text-xl leading-relaxed max-w-lg mb-12">
                    {STEPS[currentStep].subtitle}
                  </p>

                  {/* Enhanced Progress Bar */}
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-end">
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#333]">Transition Progress</div>
                      <div className="text-[10px] font-mono text-white/40">{(progress).toFixed(0)}%</div>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden p-[2px]">
                      <motion.div 
                        className="h-full rounded-full bg-gradient-to-r from-[#B6FF00] to-[#8B5CF6]" 
                        initial={{ width: "0%" }}
                        animate={{ width: `${progress}%` }}
                        transition={{ ease: "linear" }}
                      />
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Video Control Overlays */}
        <div className="absolute top-4 left-4 sm:top-10 sm:left-10 z-50">
          <div className="flex items-center gap-3 sm:gap-4 bg-black/60 backdrop-blur-xl px-3 py-2 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl border border-white/5 group">
             <div className="p-1.5 sm:p-2 bg-white/5 rounded-lg group-hover:bg-[#B6FF00]/10 transition-colors">
                <Play size={12} className="text-[#B6FF00] sm:w-[14px]" />
             </div>
             <div className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-white/60">
               Explainer <span className="text-white">v2.4</span>
             </div>
          </div>
        </div>

        <div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 sm:gap-6 z-50 bg-black/80 backdrop-blur-3xl px-4 py-2 sm:px-8 sm:py-4 rounded-2xl sm:rounded-[2rem] border border-white/10 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all duration-500 scale-90 sm:scale-95 group-hover:scale-100 shadow-2xl">
          <button 
            onClick={() => setIsPlaying(!isPlaying)} 
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-white/5 hover:bg-[#B6FF00] hover:text-black transition-all"
          >
            {isPlaying ? <Pause size={16} className="sm:w-[20px]" /> : <Play size={16} className="ml-1 sm:w-[20px]" />}
          </button>
          
          <div className="w-px h-5 sm:h-6 bg-white/10"></div>
          
          <div className="flex gap-2 sm:gap-4">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => handleStepClick(i)}
                className="relative group/btn"
              >
                <div 
                  className={`w-3 h-3 rounded-full transition-all duration-500 ${currentStep === i ? 'bg-[#B6FF00] scale-125' : 'bg-white/20 hover:bg-white/40'}`}
                />
                {currentStep === i && (
                  <motion.div 
                    layoutId="active-dot"
                    className="absolute -inset-2 rounded-full border border-[#B6FF00]/30"
                  />
                )}
              </button>
            ))}
          </div>

          <div className="w-px h-6 bg-white/10"></div>
          
          <button onClick={() => { setCurrentStep(0); setProgress(0); }} className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-all text-white/60 hover:text-white">
            <RotateCcw size={18} />
          </button>
        </div>
      </div>
      
      {/* Footer Meta */}
      <div className="bg-[#080808] border-t border-[#1a1a1a] px-10 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex gap-8">
           <div className="flex items-center gap-2">
             <CheckCircle2 size={12} className="text-[#B6FF00]" />
             <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Auto-Metadata Engine</span>
           </div>
           <div className="flex items-center gap-2">
             <CheckCircle2 size={12} className="text-[#B6FF00]" />
             <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">DSD Core Distribution</span>
           </div>
        </div>
        <div className="text-[10px] font-mono text-[#333]">
          GATI_PLATFORM_VR_04 // 2026_BUILD
        </div>
      </div>
    </div>
  );
}
