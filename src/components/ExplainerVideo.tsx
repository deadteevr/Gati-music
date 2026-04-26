import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Globe, BarChart3, Wallet, CheckCircle2, Play, Pause, RotateCcw } from 'lucide-react';

const STEPS = [
  {
    id: 1,
    title: "Step 1: Upload Your Music",
    hook: "Release your music worldwide in minutes.",
    subtitle: "Drop your track and cover art. Our system handles the rest.",
    icon: <Upload className="w-12 h-12 text-[#B6FF00]" />,
    color: "#B6FF00"
  },
  {
    id: 2,
    title: "Step 2: Reach 150+ Stores",
    hook: "Your sound. Every platform.",
    subtitle: "Spotify, Apple Music, JioSaavn, and 150+ more in 48 hours.",
    icon: <Globe className="w-12 h-12 text-[#8B5CF6]" />,
    color: "#8B5CF6"
  },
  {
    id: 3,
    title: "Step 3: Real-Time Analytics",
    hook: "Watch your fanbase grow.",
    subtitle: "Daily stream data and detailed earnings reports at your fingertips.",
    icon: <BarChart3 className="w-12 h-12 text-[#B6FF00]" />,
    color: "#B6FF00"
  },
  {
    id: 4,
    title: "Step 4: Withdraw Anytime",
    hook: "Your revenue, your way.",
    subtitle: "Zero thresholds. Withdraw your earnings easily whenever you want.",
    icon: <Wallet className="w-12 h-12 text-[#8B5CF6]" />,
    color: "#8B5CF6"
  }
];

export default function ExplainerVideo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const STEP_DURATION = 8000; // 8 seconds per step

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
    <div className="w-full max-w-4xl mx-auto rounded-[2.5rem] overflow-hidden border border-[#222] bg-[#050505] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.8)] relative group">
      {/* Video Content Area */}
      <div className="aspect-video relative flex items-center justify-center overflow-hidden">
        {/* Background Glare */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#111] via-black to-[#050505]"></div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 w-full h-full flex items-center justify-center p-8 md:p-16"
          >
            {/* Visual Animation for each step */}
            <div className="w-full h-full flex flex-col md:flex-row items-center gap-8 md:gap-16">
              
              {/* Left: Graphic Animation */}
              <div className="flex-1 w-full h-full flex items-center justify-center">
                {currentStep === 0 && (
                  <motion.div 
                    initial={{ y: 20 }} animate={{ y: 0 }}
                    className="relative w-full max-w-[280px] aspect-square rounded-3xl border-2 border-dashed border-[#B6FF00]/30 flex flex-col items-center justify-center bg-[#111]"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-[#B6FF00]/5 rounded-3xl"
                    />
                    <Upload className="w-16 h-16 text-[#B6FF00] mb-4" />
                    <div className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Drop Audio File</div>
                    <motion.div 
                      initial={{ y: -50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5, type: 'spring' }}
                      className="mt-6 px-4 py-2 bg-[#B6FF00] text-black rounded-lg text-xs font-black uppercase"
                    >
                      song_final.wav
                    </motion.div>
                  </motion.div>
                )}

                {currentStep === 1 && (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                      className="w-48 h-48 border border-[#8B5CF6]/20 rounded-full"
                    />
                    <Globe className="absolute w-20 h-20 text-[#8B5CF6]" />
                    {[0, 72, 144, 216, 288].map((angle, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 * i }}
                        className="absolute w-10 h-10 bg-[#111] border border-[#222] rounded-xl flex items-center justify-center text-[8px] font-bold"
                        style={{
                          transform: `rotate(${angle}deg) translateY(-80px) rotate(-${angle}deg)`
                        }}
                      >
                         STORE
                      </motion.div>
                    ))}
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="w-full max-w-[300px] h-48 flex flex-col justify-end gap-2 px-4">
                    <div className="flex items-end justify-between gap-1 h-32">
                      {[40, 65, 45, 90, 75, 100].map((h, i) => (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ delay: i * 0.1, duration: 1 }}
                          className="flex-1 bg-[#B6FF00] rounded-t-lg"
                        />
                      ))}
                    </div>
                    <div className="h-px bg-[#222] w-full" />
                    <div className="flex justify-between text-[8px] uppercase tracking-widest text-gray-500">
                      <span>Mon</span><span>Wed</span><span>Fri</span><span>Sun</span>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-[#111] p-8 rounded-3xl border border-[#222] text-center"
                  >
                    <div className="text-gray-500 text-[10px] uppercase tracking-[0.2em] mb-2 font-bold">Total Earnings</div>
                    <div className="text-4xl font-display font-black text-[#B6FF00] mb-6">₹42,850.00</div>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-3 bg-[#8B5CF6] text-white rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 group"
                    >
                      Withdraw Anytime <CheckCircle2 size={14} className="group-hover:scale-125 transition-transform" />
                    </motion.button>
                  </motion.div>
                )}
              </div>

              {/* Right: Content & Subtitles */}
              <div className="flex-1 flex flex-col justify-center text-center md:text-left">
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="inline-block px-3 py-1 rounded-full bg-[#111] border border-[#222] text-[#B6FF00] text-[10px] uppercase tracking-widest font-bold mb-4">
                    Step {currentStep + 1} of 4
                  </div>
                  <h3 className="text-2xl md:text-4xl font-display uppercase tracking-tight text-white mb-4 leading-tight">
                    {STEPS[currentStep].title}
                  </h3>
                  <p className="text-lg md:text-xl font-bold text-[#B6FF00] mb-3 leading-tight italic">
                    "{STEPS[currentStep].hook}"
                  </p>
                  <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-sm">
                    {STEPS[currentStep].subtitle}
                  </p>
                </motion.div>
                
                {/* Subtitle Progress Bar */}
                <div className="mt-8 flex items-center gap-4">
                   <div className="flex-1 h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-[#B6FF00]" 
                        initial={{ width: "0%" }}
                        animate={{ width: `${progress}%` }}
                        transition={{ ease: "linear" }}
                      />
                   </div>
                   <div className="text-[#333] text-[10px] font-mono font-bold">
                     0{(currentStep + 1)} / 04
                   </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Video Overlays (Controls) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-40 bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => setIsPlaying(!isPlaying)} className="text-white hover:text-[#B6FF00] transition-colors">
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>
          
          <div className="w-px h-4 bg-white/10"></div>
          
          <div className="flex gap-2">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => handleStepClick(i)}
                className={`w-2 h-2 rounded-full transition-all ${currentStep === i ? 'w-6 bg-[#B6FF00]' : 'bg-white/20 hover:bg-white/40'}`}
              />
            ))}
          </div>

          <div className="w-px h-4 bg-white/10"></div>
          
          <button onClick={() => { setCurrentStep(0); setProgress(0); }} className="text-white hover:text-[#B6FF00] transition-colors">
            <RotateCcw size={16} />
          </button>
        </div>
      </div>
      
      {/* Mobile Steps Indicators (Progress Bar on top) */}
      <div className="grid grid-cols-4 w-full h-1 bg-[#1a1a1a]">
         {STEPS.map((_, i) => (
           <div key={i} className="relative h-full overflow-hidden">
             {i < currentStep && <div className="absolute inset-0 bg-[#B6FF00]" />}
             {i === currentStep && <motion.div className="absolute inset-0 bg-[#B6FF00]" style={{ width: `${progress}%` }} />}
           </div>
         ))}
      </div>
      
      {/* Hover Information */}
      <div className="absolute top-6 right-6 z-40 pointer-events-none opacity-0 group-hover:opacity-60 transition-opacity">
        <div className="bg-black/80 text-white text-[8px] uppercase tracking-widest font-black px-3 py-1 rounded-full border border-white/10">
          Interactive Explainer • Loop Active
        </div>
      </div>
    </div>
  );
}
