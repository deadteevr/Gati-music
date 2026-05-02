import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { Link } from 'react-router-dom';
import ExplainerVideo from '../components/ExplainerVideo';
import { 
  ArrowRight, 
  Headphones, 
  Music, 
  Zap, 
  Globe2,
  Clock,
  ShieldCheck,
  PenTool,
  UploadCloud,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  MoreVertical,
  LayoutDashboard,
  MessageCircle,
  PiggyBank,
  BarChart3,
  Activity,
  Play,
  CheckCheck,
  TrendingUp
} from 'lucide-react';

const WHATSAPP_NUMBER = "917626841258";

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

// --- Components ---

function Logo({ className = "", isScrolled = false }: { className?: string; isScrolled?: boolean }) {
  return (
    <div className={`font-display font-black tracking-tighter flex items-center gap-1 group transition-all duration-500 hover:scale-105 ${className}`}>
      <span className={`text-[#B6FF00] text-3xl md:text-4xl transition-all duration-500 ${isScrolled ? 'drop-shadow-[0_0_20px_rgba(182,255,0,0.8)]' : 'drop-shadow-[0_0_10px_rgba(182,255,0,0.5)] group-hover:drop-shadow-[0_0_20px_rgba(182,255,0,0.9)]'}`}>gati</span>
      <span className="w-2 h-2 rounded-full bg-[#8B5CF6] mt-2 md:mt-3 inline-block shadow-[0_0_10px_rgba(139,92,246,0.8)] group-hover:shadow-[0_0_20px_rgba(139,92,246,1)] transition-all duration-500"></span>
    </div>
  );
}

function WhatsAppButton({ text, className = "" }: { text: string, className?: string }) {
  const msg = encodeURIComponent("Hi, I want to distribute my music through Gati.");
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 font-display uppercase tracking-widest font-bold transition-all ${className}`}
    >
      <MessageCircleIcon /> {text}
    </a>
  );
}

function WhatsAppCheckout({ plan, highlight }: { plan: string, highlight?: boolean }) {
  const msg = encodeURIComponent(`Hi, I want to purchase the ${plan} plan.`);
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
  
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className={`block w-full py-4 text-center font-display font-bold uppercase tracking-widest transition-all rounded-full ${highlight ? 'bg-[#B6FF00] text-black hover:bg-white hover:scale-105 shadow-[0_0_20px_rgba(182,255,0,0.3)] duration-300' : 'bg-[#222] border border-[#333] text-white hover:bg-[#333] hover:border-[#555]'}`}
    >
      Buy Now
    </a>
  );
}

const MessageCircleIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
  </svg>
);

// --- Hooks ---
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const heroRef = useRef(null);

  // Close more menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    document.title = "Gati Music Distribution | Best Music Distribution in India";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', "Release your song on Spotify in India with Gati Music Distribution. 48-hour delivery, WhatsApp support, and 80% artist royalties. The top choice for independent music distribution in India.");
    }
  }, []);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", isMobile ? "0%" : "30%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", isMobile ? "0%" : "50%"]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#f5f5f5] selection:bg-[#B6FF00] selection:text-black font-sans overflow-x-hidden">
      {/* SEO Canonical */}
      <link rel="canonical" href="https://www.gatimusic.in/" />

      {/* Product Schema to fix GSC errors */}
      <script type="application/ld+json">
        {JSON.stringify([
          {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "Basic Distribution Plan",
            "description": "Release your music on Spotify, Apple Music and 250+ platforms with fast delivery and 80% royalties.",
            "image": "https://www.gatimusic.in/basic-plan.jpg",
            "brand": {
              "@type": "Brand",
              "name": "Gati Music Distribution"
            },
            "offers": {
              "@type": "Offer",
              "price": "75",
              "priceCurrency": "INR",
              "availability": "https://schema.org/InStock",
              "url": "https://www.gatimusic.in/pricing"
            }
          },
          {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "Monthly Distribution Plan",
            "description": "Monthly music distribution plan with unlimited releases, verified artist profiles, and 80% royalties.",
            "image": "https://www.gatimusic.in/monthly-plan.jpg",
            "brand": {
              "@type": "Brand",
              "name": "Gati Music Distribution"
            },
            "offers": {
              "@type": "Offer",
              "price": "199",
              "priceCurrency": "INR",
              "availability": "https://schema.org/InStock",
              "url": "https://www.gatimusic.in/pricing"
            }
          },
          {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "Yearly Distribution Plan",
            "description": "Best value yearly plan for artists with unlimited uploads, priority support, and maximum earnings.",
            "image": "https://www.gatimusic.in/yearly-plan.jpg",
            "brand": {
              "@type": "Brand",
              "name": "Gati Music Distribution"
            },
            "offers": {
              "@type": "Offer",
              "price": "999",
              "priceCurrency": "INR",
              "availability": "https://schema.org/InStock",
              "url": "https://www.gatimusic.in/pricing"
            }
          }
        ])}
      </script>
      
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 w-full px-4 md:px-6 flex justify-between items-center z-50 transition-all duration-300 ${isScrolled ? 'bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-[#222] shadow-[0_4px_30px_rgba(0,0,0,0.5)] py-3' : 'bg-transparent py-5'}`}>
        <Logo isScrolled={isScrolled} />
        
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8 font-display uppercase tracking-widest text-xs font-bold text-gray-400">
          <a href="#how-it-works" className="hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all">How it Works</a>
          <a href="#features" className="hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all">Why Us</a>
          <Link to="/pricing" className="hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all">Plans</Link>
          <Link to="/blog" className="hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all">Blog</Link>
          <Link to="/faq" className="hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all">FAQ</Link>
          
          {/* More Menu (3 Dots) */}
          <div className="relative" ref={moreMenuRef}>
            <button 
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              className="p-2 hover:bg-white/5 rounded-full transition-all text-gray-400 hover:text-[#B6FF00]"
            >
              <MoreVertical size={18} />
            </button>
            
            <AnimatePresence>
              {isMoreMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-48 bg-[#111] border border-[#222] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden z-50 py-2"
                >
                  <Link to="/about" className="block px-4 py-3 text-xs font-display uppercase tracking-widest text-gray-400 hover:text-white hover:bg-[#1a1a1a] transition-all">About Gati</Link>
                  <Link to="/terms" className="block px-4 py-3 text-xs font-display uppercase tracking-widest text-gray-400 hover:text-white hover:bg-[#1a1a1a] transition-all">Terms of Use</Link>
                  <Link to="/privacy" className="block px-4 py-3 text-xs font-display uppercase tracking-widest text-gray-400 hover:text-white hover:bg-[#1a1a1a] transition-all">Privacy Policy</Link>
                  <div className="border-t border-[#222] my-1"></div>
                  <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="block px-4 py-3 text-xs font-display uppercase tracking-widest text-[#B6FF00] hover:bg-[#1a1a1a] transition-all">WhatsApp Help</a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-6">
          <Link 
            to="/login" 
            className="flex items-center gap-2 px-3 py-1.5 bg-[#B6FF00]/10 border border-[#B6FF00]/20 rounded-lg hover:bg-[#B6FF00] hover:text-black transition-all group whitespace-nowrap"
          >
            <LayoutDashboard size={14} className="group-hover:scale-110 transition-transform" />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">Dashboard</span>
          </Link>

          <Link to="/login" className="hidden md:block font-display uppercase tracking-widest text-[11px] font-black text-white hover:text-[#B6FF00] hover:drop-shadow-[0_0_8px_rgba(182,255,0,0.5)] transition-all bg-white/5 border border-white/10 px-5 py-2 rounded-full hover:bg-white/10">Artist Login</Link>
          <Link 
            to="/contact"
            className="hidden md:block border border-[#B6FF00]/50 text-[#B6FF00] px-5 py-2.5 rounded-full font-display uppercase tracking-widest text-xs font-bold hover:bg-[#B6FF00] hover:text-black hover:shadow-[0_0_15px_rgba(182,255,0,0.4)] transition-all duration-300"
          >
            Contact
          </Link>
          
          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-white p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-[#0a0a0a]/95 backdrop-blur-2xl lg:hidden"
          >
            <motion.div
              initial={{ x: '100%', opacity: 0 }} 
              animate={{ x: 0, opacity: 1 }} 
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute right-0 top-0 bottom-0 w-full sm:w-[400px] bg-[#0a0a0a] border-l border-white/10 pt-24 px-8 flex flex-col h-screen overflow-y-auto"
            >
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-8 right-8 p-3 bg-white/5 rounded-full text-white hover:bg-white/10 transition-colors"
                aria-label="Close Menu"
              >
                <X size={24} />
              </button>

              <div className="flex flex-col gap-2">
                {[
                  { name: "How it Works", href: "#how-it-works" },
                  { name: "Why Gati", href: "#features" },
                  { name: "Plans & Pricing", href: "/pricing" },
                  { name: "FAQ", href: "/faq" },
                  { name: "Artist Login", href: "/login", highlight: true }
                ].map((link, i) => (
                  <motion.div
                    key={link.name}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                  >
                    <Link 
                      to={link.href.startsWith('#') ? '/' : link.href}
                      onClick={(e) => {
                        if (link.href.startsWith('#')) {
                          setIsMobileMenuOpen(false);
                          setTimeout(() => {
                            const el = document.getElementById(link.href.substring(1));
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }, 100);
                        } else {
                          setIsMobileMenuOpen(false);
                        }
                      }}
                      className={`block py-5 text-3xl font-display font-black uppercase tracking-tighter border-b border-white/5 transition-all active:scale-95 ${link.highlight ? 'text-[#B6FF00]' : 'text-white'}`}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-col gap-6 mt-12 mb-20">
                <div>
                  <h4 className="text-[10px] font-display uppercase tracking-[0.4em] text-gray-500 font-black mb-6">Discovery</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-display uppercase tracking-widest text-gray-400 py-2">About</Link>
                    <Link to="/blog" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-display uppercase tracking-widest text-gray-400 py-2">Blog</Link>
                    <Link to="/terms" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-display uppercase tracking-widest text-gray-400 py-2">Terms</Link>
                    <Link to="/privacy" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-display uppercase tracking-widest text-gray-400 py-2">Privacy</Link>
                  </div>
                </div>
                
                <WhatsAppButton 
                  text="Contact Support" 
                  className="mt-4 bg-[#B6FF00] text-black w-full px-8 py-6 rounded-2xl shadow-[0_20px_50px_rgba(182,255,0,0.2)] font-black text-lg" 
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-32 pb-20 px-6 sm:px-12 flex flex-col items-center justify-center min-h-[90vh] text-center overflow-hidden">
        {/* Parallax Background Image */}
        <motion.div 
          style={{ y: bgY }}
          className="absolute inset-0 -z-30 scale-110 h-[120%]"
        >
          <img 
            src="https://picsum.photos/seed/studio-recording/1920/1080?blur=10" 
            alt="Music Studio Background" 
            className="w-full h-full object-cover grayscale opacity-30 brightness-[0.4]"
            referrerPolicy="no-referrer"
            loading="eager"
            decoding="async"
          />
          {/* Dark Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-[#0A0A0A]/40 to-[#0A0A0A]"></div>
        </motion.div>

        {/* Animated Gradient Grids & Glows */}
        {!isMobile && (
          <>
            <div className="absolute top-1/4 left-1/4 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-gradient-to-tr from-[#8B5CF6]/10 to-[#B6FF00]/10 rounded-full mix-blend-screen filter blur-[80px] md:blur-[120px] opacity-30 md:opacity-50 animate-pulse -z-10 will-change-[filter,opacity]"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-gradient-to-bl from-[#3B82F6]/10 to-[#8B5CF6]/10 rounded-full mix-blend-screen filter blur-[60px] md:blur-[100px] opacity-20 md:opacity-40 animate-pulse -z-10 will-change-[filter,opacity]" style={{ animationDelay: '2s' }}></div>
          </>
        )}
        <div className="absolute inset-0 opacity-[0.05] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')] -z-10 bg-repeat"></div>
        
        {/* Subtle Watermark Logo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[30vw] font-display font-black text-white/[0.01] leading-none pointer-events-none select-none -z-10 tracking-tighter mix-blend-overlay">
          gati.
        </div>

        <motion.div 
          style={{ y: textY }}
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <div className="mb-8 inline-block border border-[#B6FF00]/40 text-[#B6FF00] px-5 py-2.5 font-bold font-display uppercase tracking-widest text-[10px] md:text-xs bg-[#B6FF00]/5 rounded-full backdrop-blur-md shadow-[0_0_20px_rgba(182,255,0,0.15)]">
            For the Artist, By the Artists
          </div>
          
          <div className="relative mb-8">
            {/* Soft glow behind heading */}
            {!isMobile && <div className="absolute inset-0 bg-[#B6FF00]/20 blur-[80px] -z-10 rounded-full scale-75 opacity-50 will-change-transform"></div>}
            <h1 className="text-[10vw] sm:text-[7vw] md:text-7xl leading-[0.85] font-display uppercase tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
              Gati Music Distribution – Release <br className="hidden md:block"/> 
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#B6FF00] via-[#8B5CF6] to-[#3B82F6] drop-shadow-[0_0_15px_rgba(182,255,0,0.3)]">
                Song on Spotify in India
              </span>
            </h1>
          </div>

          <p className="text-base md:text-xl text-gray-400 font-sans max-w-2xl mx-auto mb-12 leading-relaxed px-4">
            The most reliable and affordable music distribution service in India. Get your songs on Spotify, Apple Music, and 250+ global platforms with human WhatsApp support.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center px-6">
            <WhatsAppButton 
              text="Release Your Music" 
              className="bg-[#B6FF00] text-black w-full sm:w-auto px-10 py-5 rounded-full hover:bg-white hover:scale-105 hover:shadow-[0_0_40px_rgba(182,255,0,0.5)] duration-300 font-black text-lg" 
            />
            <Link 
              to="/pricing"
              className="inline-flex items-center justify-center gap-2 font-display uppercase tracking-widest font-bold border border-[#333] bg-[#0A0A0A]/50 backdrop-blur-md text-white w-full sm:w-auto px-10 py-5 rounded-full hover:bg-[#111] hover:border-[#8B5CF6] hover:shadow-[0_0_20px_rgba(139,92,246,0.2)] transition-all duration-300 text-sm"
            >
              View Plans
            </Link>
          </div>
          
          <div className="mt-8 text-gray-500 text-[10px] uppercase tracking-[0.4em] font-bold">
            Search <span className="text-[#B6FF00]">Gati Music Distribution</span> on Google
          </div>
        </motion.div>
      </section>

      {/* Trust Bar */}
      <section className="relative py-20 border-y border-[#1a1a1a] bg-[#0A0A0A] overflow-hidden">
        {/* Animated Waveform Background */}
        {!isMobile && (
          <motion.div 
            animate={{ opacity: [0.05, 0.2, 0.05] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 flex items-center justify-center gap-2 md:gap-3 px-4 mix-blend-screen pointer-events-none"
          >
            {[...Array(40)].map((_, i) => (
              <motion.div 
                key={i} 
                className="w-1 md:w-2 bg-gradient-to-t from-[#B6FF00] to-[#8B5CF6] rounded-full will-change-[height]" 
                animate={{ height: ['20%', '80%', '40%', '100%', '30%'] }}
                transition={{ repeat: Infinity, duration: 1.5 + Math.random() * 2, ease: "easeInOut", delay: Math.random() }}
              />
            ))}
          </motion.div>
        )}
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="flex justify-center items-center gap-8 md:gap-20 flex-wrap opacity-60 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-500">
            <a href="#" className="hover:scale-110 transition-all duration-300 group">
              <img loading="lazy" decoding="async" src="https://upload.wikimedia.org/wikipedia/commons/2/26/Spotify_logo_with_text.svg" alt="Spotify" className="h-8 md:h-10 object-contain group-hover:drop-shadow-[0_0_20px_rgba(182,255,0,0.8)] transition-all duration-300" referrerPolicy="no-referrer" />
            </a>
            <a href="#" className="hover:scale-110 transition-all duration-300 group">
              <div className="flex items-center gap-1.5 opacity-90 group-hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] transition-all duration-300">
                <svg className="h-7 md:h-9 text-white fill-current" viewBox="0 0 384 512" xmlns="http://www.w3.org/2000/svg">
                   <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 24 184.8 8 273.5q-9 54.5 23.8 133.8c15.8 38.7 52.8 142.6 150 102.3 24.2-10 40-10.4 69.1 0 96.9 34.6 122.9-63.5 138.8-102.3-39.7-16.7-70.4-55.5-71-100.2zM276.9 104.9c-21.7 26.2-56 42.1-84.3 39-6.3-37.1 11.2-70.5 35.8-97.1 21.6-23.7 55-40 84.1-36.5 6.4 38.2-12.7 69.1-35.6 94.6z"/>
                </svg>
                <span className="font-sans font-medium text-2xl md:text-3xl tracking-tight text-white mb-0.5">Music</span>
              </div>
            </a>
            <a href="#" className="hover:scale-110 transition-all duration-300 group">
              <div className="flex items-center gap-2 group-hover:drop-shadow-[0_0_20px_rgba(255,0,0,0.8)] transition-all duration-300">
                <img loading="lazy" decoding="async" src="https://upload.wikimedia.org/wikipedia/commons/6/6a/Youtube_Music_icon.svg" alt="YouTube Music" className="h-8 md:h-10 object-contain" referrerPolicy="no-referrer" />
                <span className="font-display font-bold text-xl md:text-2xl tracking-tighter text-white">Music</span>
              </div>
            </a>
          </div>
          <p className="text-center font-display uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#B6FF00] to-[#8B5CF6] text-xs font-bold mt-12">Distributed to 250+ platforms worldwide</p>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 md:py-32 px-6 md:px-12 bg-gradient-to-b from-[#0A0A0A] to-[#0d0a14] relative overflow-hidden">
        {/* Soft abstract graphic background behind steps */}
        <div className="absolute top-1/2 left-[10%] w-[300px] h-[300px] bg-[#8B5CF6]/10 rounded-full mix-blend-screen filter blur-[80px] md:blur-[100px] opacity-50 md:opacity-100 -z-10 hidden md:block"></div>
        <div className="absolute top-[40%] right-[10%] w-[400px] h-[400px] bg-[#B6FF00]/5 rounded-full mix-blend-screen filter blur-[80px] md:blur-[100px] opacity-50 md:opacity-100 -z-10 hidden md:block" style={{ animationDelay: '1s' }}></div>
        {/* Faint sound waves pattern */}
        <div className="absolute inset-0 opacity-[0.02] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMjBMNSA1TDEwIDIwTDE1IDM1TDIwIDIwTDI1IDVMMzAgMjBMMzUgMzVMNDAgMjAiIHN0cm9rZT0iI2ZmZiIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+')] -z-10"></div>
        
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#333] to-transparent"></div>
        
        <div className="max-w-6xl mx-auto relative z-10 flex flex-col items-center">
          <h2 className="text-4xl md:text-5xl font-display uppercase tracking-tighter mb-10 text-center text-white">How Gati Distribution Works</h2>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-4xl mx-auto mb-20 relative px-4"
          >
            <ExplainerVideo />
          </motion.div>
          
          <motion.div 
            variants={containerVariants} 
            initial="hidden" 
            whileInView="show" 
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6 lg:gap-8 w-full relative"
          >
            {/* Horizontal Line connecting steps on large screens */}
            <div className="hidden lg:block absolute top-[110px] left-[15%] right-[15%] h-px bg-gradient-to-r from-[#B6FF00]/30 via-[#3B82F6]/30 to-[#EC4899]/30 -z-10"></div>
            
            {/* Vertical Line on mobile/tablet */}
            <div className="lg:hidden absolute top-[10%] bottom-[10%] left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-[#B6FF00]/20 via-[#3B82F6]/20 to-[#EC4899]/20 -z-10"></div>
            
            <motion.div variants={itemVariants} className="w-full">
              <StepCard index={0} number="01" icon={<Zap />} title="Choose Plan" desc="Select the premium distribution plan that fits your goals correctly." colorTheme="green" isMobile={isMobile} />
            </motion.div>
            <motion.div variants={itemVariants} className="w-full">
              <StepCard index={1} number="02" icon={<UploadCloud />} title="Upload Song" desc="Fill details, metadata, and upload your high quality audio." colorTheme="blue" isMobile={isMobile} />
            </motion.div>
            <motion.div variants={itemVariants} className="w-full">
              <StepCard index={2} number="03" icon={<ShieldCheck />} title="We Review" desc="Strict manual approval within 7–8 hours to prevent future errors." colorTheme="purple" isMobile={isMobile} />
            </motion.div>
            <motion.div variants={itemVariants} className="w-full">
              <StepCard index={3} number="04" icon={<Globe2 />} title="Goes Live" desc="Your release pushes live on 250+ stores in just 2–3 days." colorTheme="pink" isMobile={isMobile} />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Gati */}
      <section id="features" className="py-32 px-6 md:px-12 bg-[#050505] relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#8B5CF6]/5 via-[#0A0A0A] to-[#0A0A0A] pointer-events-none"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <h2 className="text-4xl md:text-5xl font-display uppercase tracking-tighter mb-20 text-center text-transparent bg-clip-text bg-gradient-to-r from-white via-[#8B5CF6] to-[#B6FF00]">Why Choose Gati India Distribution</h2>
          
          <motion.div 
            variants={containerVariants} 
            initial="hidden" 
            whileInView="show" 
            viewport={{ once: true, amount: 0.1 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <motion.div variants={itemVariants} className="w-full">
              <FeatureCard icon={<Clock />} title="Fast Delivery" desc="Your song goes live within 2–3 days on major platforms." colorTheme="green" isMobile={isMobile} />
            </motion.div>
            <motion.div variants={itemVariants} className="w-full">
              <FeatureCard icon={<ShieldCheck />} title="Manual Approval" desc="No auto rejection, every release is checked personally." colorTheme="blue" isMobile={isMobile} />
            </motion.div>
            <motion.div variants={itemVariants} className="w-full">
              <FeatureCard icon={<MessageCircle />} title="Direct WhatsApp Support" desc="No emails, instant communication with real humans." colorTheme="purple" isMobile={isMobile} />
            </motion.div>
            <motion.div variants={itemVariants} className="w-full">
              <FeatureCard icon={<PiggyBank />} title="Budget Friendly" desc="One of the most affordable premium distribution services." colorTheme="green" isMobile={isMobile} />
            </motion.div>
            <motion.div variants={itemVariants} className="w-full">
              <FeatureCard icon={<PenTool />} title="Metadata Correction Include" desc="We help fix cover art and metadata errors before release." colorTheme="blue" isMobile={isMobile} />
            </motion.div>
            <motion.div variants={itemVariants} className="w-full">
              <FeatureCard icon={<Globe2 />} title="Worldwide Distribution" desc="Reach global audiences on 250+ streaming platforms." colorTheme="purple" isMobile={isMobile} />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Plans & Pricing */}
      <section id="pricing" className="py-32 px-6 md:px-12 bg-[#0A0A0A] relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20 relative">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[600px] h-[300px] bg-[#B6FF00]/10 filter blur-[150px] -z-10 rounded-full"></div>
            
            <h2 className="text-4xl md:text-6xl font-display uppercase tracking-tighter text-white mb-6">Plans & Pricing</h2>
            <p className="text-gray-400 font-sans text-lg max-w-xl mx-auto">Affordable options for every stage of your career. Keep <span className="text-white font-bold">80% of your royalties</span> across all tiers.</p>
          </div>

          <motion.div 
            variants={containerVariants} 
            initial="hidden" 
            whileInView="show" 
            viewport={{ once: true, amount: 0.1 }}
            className="grid lg:grid-cols-3 gap-8 items-stretch pt-8"
          >
            <motion.div variants={itemVariants} className="w-full h-full">
              <PricingCard 
                name="Basic" price="75" period="/ SONG" tag="95% OFF" highlight colorTheme="blue" isMobile={isMobile}
                groups={[
                  {
                    name: "Distribution Features",
                    items: [
                      { text: "Upload to 150+ platforms" },
                      { text: "Delivery in 2-3 days", subtext: "(If no issues)" }
                    ]
                  },
                  {
                    name: "Revenue Features",
                    items: [
                      { text: "80% royalties to artist", subtext: "(20% cut)" },
                      { text: "YouTube Content ID", subtext: "Song earns royalties without channel monetization" }
                    ]
                  },
                  {
                    name: "Support & Services",
                    items: [
                      { text: "Metadata & cover checked before release" },
                      { text: "Release proof links shared after publishing" },
                      { text: "Free re-upload once if error occurs" },
                      { text: "WhatsApp chat Standard support" }
                    ]
                  }
                ]}
              />
            </motion.div>
            
            <motion.div variants={itemVariants} className="w-full h-full">
              <PricingCard 
                name="Monthly" price="199" period="/ MONTH" tag="90% OFF" badge="Most Popular" highlight colorTheme="purple" isMobile={isMobile}
                groups={[
                  {
                    name: "Distribution Features",
                    items: [
                      { text: "Unlimited song uploads", subtext: "(For 30 days)" },
                      { text: "Global distribution", subtext: "(Spotify, Apple, JioSaavn, YouTube, etc.)" },
                      { text: "Release date scheduling", subtext: "Choose your own drop date" },
                      { text: "Delivery in 2-3 days" }
                    ]
                  },
                  {
                    name: "Revenue & Verification",
                    items: [
                      { text: "YouTube Content ID + IG/FB/Snapchat Music" },
                      { text: "YouTube verified official artist channel" },
                      { text: "Spotify Verified Artist Account" },
                      { text: "Monthly Royalty Report sent on WhatsApp" }
                    ]
                  },
                  {
                    name: "Support & Promo",
                    items: [
                      { text: "Fast-track priority support", subtext: "WhatsApp Chat + Call (Reply under 2 hours)" },
                      { text: "Basic promo shoutout on IG Story" },
                      { text: "Artist profile link highlight on IG" }
                    ]
                  }
                ]}
              />
            </motion.div>

            <motion.div variants={itemVariants} className="w-full h-full">
              <PricingCard 
                name="Yearly" price="999" period="/ YEAR" tag="98% OFF" badge="Best Value" highlight colorTheme="green" isMobile={isMobile}
                groups={[
                  {
                    name: "Distribution Features",
                    items: [
                      { text: "Unlimited releases for 12 months" },
                      { text: "Includes all features of Monthly Plan" }
                    ]
                  },
                  {
                    name: "Promo Opportunities",
                    items: [
                      { text: "Early access to promo opportunities", subtext: "Spotify promotion, YT promo, IG reels, collabs" },
                      { text: "Custom release strategy & guidance" },
                      { text: "Featured Artist of the Month chance", subtext: "Promoted on your page" }
                    ]
                  },
                  {
                    name: "Support Features",
                    items: [
                      { text: "Lifetime artist profile verification help", subtext: "If renewed annually" },
                      { text: "Effective ₹80/Month pricing" }
                    ]
                  }
                ]}
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="relative py-32 px-6 overflow-hidden bg-[#050505]">
        {/* Abstract Background for Dashboard */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-blue-600 rounded-full mix-blend-screen filter blur-[100px] opacity-[0.05] md:opacity-10 pointer-events-none"></div>
        <div className="relative max-w-6xl mx-auto text-center z-10">
          <h2 className="text-4xl md:text-5xl font-display uppercase tracking-tighter text-white mb-6">Manage Your Music</h2>
          <p className="text-gray-400 max-w-xl mx-auto mb-16 font-sans">Track your releases, status, and earnings from your dashboard.</p>
          
          <div className="relative mx-auto max-w-5xl rounded-xl border border-[#333] bg-[#0a0a0a] p-2 md:p-4 shadow-[0_0_50px_rgba(0,0,0,0.8)] transform perspective-[2000px] rotateX-12 rotateY-0 hover:rotate-0 transition-transform duration-1000 ease-out cursor-default">
            {/* Mock UI Top Bar */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#222]">
              <div className="flex gap-2 px-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              <div className="h-6 px-4 bg-[#1a1a1a] rounded text-[10px] text-gray-500 flex items-center justify-center font-display tracking-widest border border-[#333]">admin.gati.io</div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
              {/* Sidebar */}
              <div className="col-span-1 hidden md:flex flex-col gap-2 border-r border-[#222] pr-4">
                {['Overview', 'Releases', 'Analytics', 'Royalties', 'Support'].map((item, idx) => (
                  <div key={idx} className={`h-8 rounded px-3 flex items-center text-xs font-display uppercase tracking-widest ${idx === 0 ? 'bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/20' : 'text-gray-500 hover:bg-[#111]'}`}>{item}</div>
                ))}
              </div>
              
              {/* Main Content */}
              <div className="col-span-3">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {/* Stat Cards */}
                  <div className="bg-[#111] p-4 rounded-xl border border-[#222] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#ccff00] blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest font-display mb-1 flex justify-between">Total Streams <Activity size={12} className="text-[#ccff00]" /></div>
                    <div className="text-2xl font-bold text-white">124,592</div>
                    <div className="text-xs text-green-400 mt-2 flex items-center gap-1">+12.5% <TrendingUp size={10} /></div>
                  </div>
                  <div className="bg-[#111] p-4 rounded-xl border border-[#222] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500 blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest font-display mb-1 flex justify-between">Earnings <BarChart3 size={12} className="text-purple-400" /></div>
                    <div className="text-2xl font-bold text-white">₹14,290</div>
                    <div className="text-xs text-green-400 mt-2 flex items-center gap-1">+8.2% <TrendingUp size={10} /></div>
                  </div>
                  <div className="bg-[#111] p-4 rounded-xl border border-[#222] relative overflow-hidden hidden md:block group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500 blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest font-display mb-1 flex justify-between">Status <UploadCloud size={12} className="text-blue-400" /></div>
                    <div className="text-sm font-bold text-white flex items-center gap-2 mt-1">
                      <span className="text-gray-400 line-through decoration-[#333]">Reviewing</span>
                      <ArrowRight size={12} className="text-gray-500"/>
                      <span className="text-[#ccff00]">Live</span>
                    </div>
                  </div>
                </div>
                
                {/* Chart Area */}
                <div className="h-48 w-full bg-[#111] border border-[#222] rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest font-display absolute top-4 left-4 z-10">Stream Performance</div>
                  
                  {/* SVG Line Chart */}
                  <div className="absolute inset-x-0 bottom-0 h-32 opacity-80">
                    <svg className="w-full h-full drop-shadow-[0_0_15px_rgba(204,255,0,0.3)]" viewBox="0 0 100 30" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ccff00" stopOpacity="0.4"/>
                          <stop offset="100%" stopColor="#ccff00" stopOpacity="0"/>
                        </linearGradient>
                        <linearGradient id="chartLine" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#ccff00"/>
                          <stop offset="100%" stopColor="#b3e600"/>
                        </linearGradient>
                      </defs>
                      <path d="M0,30 L0,20 C10,25 20,15 30,18 C40,21 50,8 60,12 C70,16 80,4 90,8 C95,10 100,2 100,2 L100,30 Z" fill="url(#chartGlow)" className="animate-pulse" style={{ animationDuration: '3s' }} />
                      <path d="M0,20 C10,25 20,15 30,18 C40,21 50,8 60,12 C70,16 80,4 90,8 C95,10 100,2 100,2" fill="none" stroke="url(#chartLine)" strokeWidth="0.8" />
                    </svg>
                  </div>
                  
                  {/* Vertical grid lines */}
                  <div className="absolute inset-0 flex justify-between px-4 pointer-events-none opacity-20">
                    {[1,2,3,4,5,6].map((i) => <div key={i} className="w-px h-full bg-[#333]"></div>)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="relative py-32 px-6 max-w-6xl mx-auto overflow-hidden">
        {/* Glow behind chat map */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-green-500/10 rounded-full filter blur-[100px] md:blur-[150px] opacity-50 md:opacity-100 pointer-events-none -z-10"></div>
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-display uppercase tracking-tighter text-white mb-4">Artists ♥ Gati</h2>
          <p className="text-gray-400 font-sans text-lg max-w-xl mx-auto">Real conversations. Real results. Our whatsapp support means you're never left in the dark.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 relative">
          <WhatsAppMockup 
            time="10:42 AM" 
            msg1="Hey team! Just submitted my new EP." 
            msg2="Awesome! We're reviewing it now. Should be live on Spotify in 48 hours 🚀" 
            delay={0.1}
          />
          <WhatsAppMockup 
            time="2:15 PM" 
            msg1="Is my song live yet?" 
            msg2="Yes! Here are your links for Spotify, Apple Music. Congrats! 🎉" 
            delay={0.3}
          />
          <WhatsAppMockup 
            time="6:30 PM" 
            msg1="Thanks for fixing my cover art btw 🙏" 
            msg2="Always! We want your release to look perfect. Drop us a message anytime." 
            delay={0.5}
          />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6 md:px-12 bg-[#0a0a0a]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-display uppercase tracking-tighter text-center text-white mb-16">FAQs</h2>
          <div className="space-y-4">
            <FaqItem q="How to release music on Spotify in India?" a="You can release your music on Spotify in India quickly by using Gati Music Distribution. Choose an affordable plan, upload your tracks, cover art, and metadata, and we will deliver it to Spotify and 250+ platforms worldwide." />
            <FaqItem q="How does Gati Music Distribution work?" a="Sign up, choose an affordable plan (Basic, Monthly, or Yearly), and upload your song. Our manual review team checks your release and sends it to worldwide streaming stores." />
            <FaqItem q="How long does release take?" a="Manual approval takes 7-8 hours, and your release will go live on platforms like Spotify and Apple Music in just 2-3 days." />
            <FaqItem q="How do royalties work?" a="Artists keep 80% of their royalties on all tiers. Your earnings are reported monthly directly within your artist dashboard." />
            <FaqItem q="How to withdraw earnings?" a="You can withdraw your earnings directly to your bank account via the artist dashboard once the threshold is met." />
          </div>
          <div className="mt-12 text-center">
            <Link 
              to="/faq" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#111] border border-[#222] rounded-full text-gray-400 hover:text-[#B6FF00] hover:border-[#B6FF00]/50 transition-all font-display uppercase tracking-widest text-xs font-bold"
            >
              View All FAQs <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Contact / Support CTA */}
      <section className="relative py-40 px-6 bg-[#0A0A0A] text-white text-center overflow-hidden border-t border-[#1a1a1a]">
        {/* Strong CTA Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#B6FF00]/10 via-[#8B5CF6]/10 to-[#0A0A0A] pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-gradient-to-t from-[#B6FF00]/20 to-transparent blur-[100px]"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <h2 className="text-4xl sm:text-5xl md:text-8xl font-display uppercase tracking-tighter mb-8 text-white drop-shadow-2xl leading-none">
            You got music?<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B6FF00] to-[#8B5CF6]">We got you.</span>
          </h2>
          <p className="font-sans text-lg md:text-2xl mb-12 max-w-2xl mx-auto font-medium text-gray-300">Direct WhatsApp Support – No Emails, No Delays.</p>
          
          <motion.a 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi, I have a question.")}`} 
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 bg-[#B6FF00] text-black px-6 md:px-12 py-5 md:py-6 rounded-full font-display uppercase tracking-widest font-black text-sm md:text-lg hover:bg-white shadow-[0_0_40px_rgba(182,255,0,0.4)] hover:shadow-[0_0_60px_rgba(255,255,255,0.6)] transition-shadow w-full md:w-auto"
          >
            <MessageCircleIcon /> Message {WHATSAPP_NUMBER}
          </motion.a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#050505] border-t border-[#1a1a1a] pt-16 pb-8 px-6 text-gray-500 font-sans text-sm">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Logo className="mb-4 grayscale opacity-50 block w-full" />
            <p className="max-w-sm">For the Artist, By the Artists. Gati Music Distribution provides lightning-fast delivery and direct WhatsApp support for independent creators in India.</p>
          </div>
          <div>
            <h4 className="font-display uppercase tracking-widest text-[#f5f5f5] mb-4">Quick Links</h4>
            <div className="flex flex-col gap-2">
              <Link to="/about" className="hover:text-white transition-colors">About Us</Link>
              <Link to="/pricing" className="hover:text-white transition-colors">Pricing Plans</Link>
              <Link to="/blog" className="hover:text-white transition-colors">Our Blog</Link>
              <Link to="/contact" className="hover:text-white transition-colors">Contact Support</Link>
              <Link to="/faq" className="hover:text-white transition-colors">Distribution FAQ</Link>
            </div>
          </div>
          <div>
            <h4 className="font-display uppercase tracking-widest text-[#f5f5f5] mb-4">Legal</h4>
            <div className="flex flex-col gap-2">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto border-t border-[#1a1a1a] pt-8 text-center text-[10px] uppercase tracking-[0.3em]">
          © 2026 Gati Music Distribution. <span className="text-[#B6FF00]">Search for us on Google.</span>
        </div>
      </footer>

    </div>
  );
}

// --- Sub Components ---

function StepCard({ index = 0, number, title, desc, icon, colorTheme = "green", isMobile }: any) {
  const themes: Record<string, { icon: string, glow: string, bg: string, ring: string }> = {
    green: {
      icon: "text-[#B6FF00]",
      glow: "shadow-[0_0_30px_rgba(182,255,0,0.5)]",
      bg: "bg-[#B6FF00]/10",
      ring: "group-hover:border-[#B6FF00]/50"
    },
    blue: {
      icon: "text-[#3B82F6]",
      glow: "shadow-[0_0_30px_rgba(59,130,246,0.5)]",
      bg: "bg-[#3B82F6]/10",
      ring: "group-hover:border-[#3B82F6]/50"
    },
    purple: {
      icon: "text-[#8B5CF6]",
      glow: "shadow-[0_0_30px_rgba(139,92,246,0.5)]",
      bg: "bg-[#8B5CF6]/10",
      ring: "group-hover:border-[#8B5CF6]/50"
    },
    pink: { // Mapping pink to electric purple as requested colors were green, blue, purple
      icon: "text-[#8B5CF6]",
      glow: "shadow-[0_0_30px_rgba(139,92,246,0.5)]",
      bg: "bg-[#8B5CF6]/10",
      ring: "group-hover:border-[#8B5CF6]/50"
    }
  };

  const t = themes[colorTheme] || themes.green;

  return (
    <motion.div 
      initial={{ opacity: 0, y: isMobile ? 20 : 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: isMobile ? 0 : index * 0.1, ease: "easeOut" }}
      viewport={{ once: true, margin: "-50px" }}
      className={`relative flex flex-col items-center text-center group w-full max-w-[340px] mx-auto p-8 rounded-3xl bg-[#111]/30 ${!isMobile ? 'backdrop-blur-xl' : ''} border border-[#222] transition-all duration-500 hover:-translate-y-2 hover:bg-[#1A1A1A]/40 ${t.ring} will-change-transform`}
    >
      <div className={`absolute top-4 right-6 font-display font-black text-6xl text-white/[0.03] select-none pointer-events-none group-hover:text-white/[0.06] transition-colors duration-500 z-0`}>{number}</div>
      
      <motion.div 
        animate={isMobile ? {} : { y: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 4 + index * 0.5, ease: "easeInOut" }}
        className={`relative w-20 h-20 rounded-full flex items-center justify-center mb-6 z-10 transition-all duration-500 ${t.bg} ${t.icon} ${!isMobile ? t.glow : ''} border border-white/5 will-change-transform`}
      >
        {!isMobile && <div className={`absolute inset-0 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 ${t.bg}`}></div>}
        {React.cloneElement(icon, { size: 28, strokeWidth: 2.5, className: "relative z-10" })}
      </motion.div>
      
      <h3 className="text-xl font-display uppercase tracking-wide text-white mb-3 relative z-10">{title}</h3>
      <p className="text-sm text-gray-400 font-sans leading-relaxed relative z-10">{desc}</p>
    </motion.div>
  );
}

function FeatureCard({ icon, title, desc, colorTheme = "green", isMobile }: any) {
  const themes: Record<string, { icon: string, border: string, glow: string, bg: string }> = {
    green: { icon: "text-[#B6FF00]", border: "group-hover:border-[#B6FF00]/50", glow: "shadow-[0_0_30px_rgba(182,255,0,0.3)]", bg: "bg-[#B6FF00]/5" },
    purple: { icon: "text-[#8B5CF6]", border: "group-hover:border-[#8B5CF6]/50", glow: "shadow-[0_0_30px_rgba(139,92,246,0.3)]", bg: "bg-[#8B5CF6]/5" },
    blue: { icon: "text-[#3B82F6]", border: "group-hover:border-[#3B82F6]/50", glow: "shadow-[0_0_30px_rgba(59,130,246,0.3)]", bg: "bg-[#3B82F6]/5" }
  };
  const t = themes[colorTheme] || themes.green;

  return (
    <div className={`relative p-8 border border-[#222]/60 bg-[#111]/20 ${!isMobile ? 'backdrop-blur-2xl' : ''} transition-all duration-500 overflow-hidden group rounded-3xl shadow-2xl hover:-translate-y-2 ${t.border} hover:bg-[#1A1A1A]/40 will-change-transform`}>
      {/* Glow Highlight */}
      {!isMobile && <div className={`absolute -top-10 -right-10 w-24 h-24 blur-[60px] rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-current ${t.icon}`}></div>}
      
      <div className="relative z-10">
        <div className={`mb-8 w-16 h-16 rounded-2xl flex items-center justify-center bg-[#050505]/80 border border-[#222] transition-all duration-500 group-hover:scale-110 ${t.icon} shadow-inner`}>
          {!isMobile && <div className={`absolute inset-0 rounded-2xl blur-lg opacity-0 group-hover:opacity-40 transition-opacity duration-500 ${t.bg}`}></div>}
          {React.cloneElement(icon, { size: 28, strokeWidth: 1.5, className: "relative z-10" })}
        </div>
        <h3 className="text-lg font-display uppercase tracking-tight text-white mb-3 flex items-center gap-2">
          {title}
        </h3>
        <p className="text-sm text-gray-400 leading-relaxed font-sans">{desc}</p>
      </div>
    </div>
  );
}

interface FeatureGroup {
  name: string;
  items: { text: string; subtext?: string }[];
}

interface PricingCardProps {
  name: string;
  price: string;
  period: string;
  tag?: string;
  badge?: string;
  highlight?: boolean;
  colorTheme?: "green" | "purple" | "blue";
  groups: FeatureGroup[];
  isMobile?: boolean;
}

function PricingCard({ name, price, period, tag, badge, highlight, colorTheme = "green", groups, isMobile }: PricingCardProps) {
  const themes = {
    green: {
      border: "border-[#B6FF00]/30 hover:border-[#B6FF00]/60 ring-[#B6FF00]/20",
      glowBg: "bg-[#B6FF00]",
      shadow: "shadow-[0_0_40px_rgba(182,255,0,0.1)]",
      badgeBg: "bg-gradient-to-r from-[#B6FF00] to-[#8B5CF6] text-black",
      text: "from-[#B6FF00] to-white",
      tagText: "text-[#B6FF00]",
      check: "text-[#B6FF00]",
      btn: "bg-[#B6FF00] text-black hover:bg-white hover:scale-105 shadow-[0_0_20px_rgba(182,255,0,0.3)]",
      line: "from-transparent via-[#B6FF00] to-transparent"
    },
    purple: {
      border: "border-[#8B5CF6]/30 hover:border-[#8B5CF6]/60 ring-[#8B5CF6]/20",
      glowBg: "bg-[#8B5CF6]",
      shadow: "shadow-[0_0_40px_rgba(139,92,246,0.1)]",
      badgeBg: "bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white",
      text: "from-[#8B5CF6] to-white",
      tagText: "text-[#8B5CF6]",
      check: "text-[#8B5CF6]",
      btn: "bg-[#8B5CF6] text-white hover:bg-white hover:text-black hover:scale-105 shadow-[0_0_20px_rgba(139,92,246,0.3)]",
      line: "from-transparent via-[#8B5CF6] to-transparent"
    },
    blue: {
      border: "border-[#3B82F6]/30 hover:border-[#3B82F6]/60 ring-[#3B82F6]/20",
      glowBg: "bg-[#3B82F6]",
      shadow: "shadow-[0_0_40px_rgba(59,130,246,0.1)]",
      badgeBg: "bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white",
      text: "from-[#3B82F6] to-white",
      tagText: "text-[#3B82F6]",
      check: "text-[#3B82F6]",
      btn: "bg-[#3B82F6] text-white hover:bg-white hover:text-black hover:scale-105 shadow-[0_0_20px_rgba(59,130,246,0.3)]",
      line: "from-transparent via-[#3B82F6] to-transparent"
    }
  };
  
  const t = themes[colorTheme] || themes.green;

  return (
    <motion.div 
      whileHover={isMobile ? {} : { y: -10 }}
      className={`relative p-8 flex flex-col rounded-3xl transition-all duration-500 w-full overflow-hidden ${highlight ? `bg-[#0A0A0A]/80 ${!isMobile ? 'backdrop-blur-lg' : ''} border ${t.border} ${!isMobile ? t.shadow : ''} ring-1 overflow-visible` : `bg-[#111]/50 ${!isMobile ? 'backdrop-blur-md' : ''} border border-[#222] hover:border-[#444] hover:shadow-2xl`} will-change-transform`}
    >
      {/* Top soft gradient edge */}
      {highlight && <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${t.line} opacity-80`}></div>}
      
      {/* Internal Background Glow */}
      {!isMobile && (
        <>
          <div className={`absolute -top-32 -right-32 w-64 h-64 ${t.glowBg} blur-[120px] ${highlight ? 'opacity-[0.2]' : 'opacity-[0.05]'} pointer-events-none rounded-full`}></div>
          <div className={`absolute -bottom-32 -left-32 w-64 h-64 ${t.glowBg} blur-[120px] opacity-[0.05] pointer-events-none rounded-full`}></div>
        </>
      )}
      
      {badge && (
        <div className={`absolute -top-4 right-6 font-display uppercase tracking-widest text-[10px] font-bold px-4 py-2 rounded-full shadow-lg z-20 ${highlight ? t.badgeBg : 'bg-[#222] text-white border border-[#333]'}`}>
          {badge}
        </div>
      )}

      <h3 className="text-2xl font-display uppercase tracking-widest text-[#f5f5f5] mb-2">{name}</h3>
      <div className="mb-4 flex flex-col">
        <div className="flex items-baseline gap-2">
          <span className={`text-6xl font-display font-black tracking-tighter ${highlight ? `text-transparent bg-clip-text bg-gradient-to-br ${t.text}` : 'text-white'}`}>₹{price}</span>
          <span className="text-gray-500 font-sans text-sm uppercase tracking-widest">{period}</span>
        </div>
      </div>

      {tag && (
        <div className={`bg-[#1a1a1a]/80 backdrop-blur-sm border border-[#333] ${highlight ? t.tagText : 'text-gray-400'} text-xs px-3 py-1.5 rounded inline-block mb-8 font-mono self-start uppercase font-bold shadow-sm`}>
          {tag}
        </div>
      )}

      <div className="space-y-8 flex-grow relative z-10">
        {groups.map((g, i) => (
          <div key={i}>
            <h4 className="text-[10px] font-display text-gray-500 uppercase tracking-widest border-b border-[#222] pb-2 mb-4">{g.name}</h4>
            <ul className="space-y-4">
              {g.items.map((item, j) => (
                <li key={j} className="flex gap-3 text-sm text-gray-300">
                  <CheckCircle2 size={16} className={`shrink-0 mt-0.5 ${highlight ? t.check : 'text-gray-600'}`} />
                  <div>
                    <span className="block font-medium">{item.text}</span>
                    {item.subtext && <span className="block text-xs text-gray-500 mt-1">{item.subtext}</span>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-10 pt-8 border-t border-[#222] relative z-10">
        {highlight ? (
            <a 
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi, I want to purchase the ${name} plan.`)}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className={`block w-full py-4 text-center font-display font-bold uppercase tracking-widest transition-all rounded-full duration-300 ${t.btn}`}
            >
              Buy Now
            </a>
         ) : (
            <WhatsAppCheckout plan={name} highlight={highlight} />
         )}
      </div>
    </motion.div>
  )
}

function WhatsAppMockup({ time, msg1, msg2, delay = 0 }: { time: string, msg1: string, msg2: string, delay?: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.8, duration: 0.4 }}
      viewport={{ once: true, margin: "-20px" }}
      className="bg-[#0a0a0a] border border-[#222] rounded-2xl p-4 shadow-xl font-sans relative hover:border-[#333] transition-colors"
    >
      <div className="flex border-b border-[#222] pb-3 mb-4 items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#ccff00] text-black flex items-center justify-center font-bold text-xs font-display">G</div>
        <div>
          <div className="text-sm font-bold text-white leading-none">Gati Support</div>
          <div className="text-[10px] text-green-400 mt-1">Online</div>
        </div>
      </div>
      <div className="space-y-4">
        {/* User Msg */}
        <div className="flex justify-end">
          <div className="bg-[#111] text-gray-200 p-3 rounded-2xl rounded-tr-sm text-sm border border-[#222] relative max-w-[85%]">
            {msg1}
            <div className="text-[9px] text-gray-500 text-right mt-1">{time} <CheckCheck size={10} className="inline text-gray-500 ml-1" /></div>
          </div>
        </div>
        {/* Gati Msg */}
        <div className="flex justify-start">
          <div className="bg-gradient-to-br from-[#1a2e10] to-[#111] text-[#ccff00] p-3 rounded-2xl rounded-tl-sm text-sm border border-[#2bcc00]/20 relative max-w-[90%] font-medium">
            {msg2}
            <div className="text-[9px] text-[#ccff00]/60 text-right mt-1">Just now</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function FaqItem({ q, a }: { q: string, a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-[#1a1a1a] bg-[#111] rounded-lg overflow-hidden mb-4">
      <button 
        onClick={() => setOpen(!open)}
        className="w-full text-left p-6 flex justify-between items-center font-display uppercase tracking-wide text-white hover:text-[#ccff00] transition-colors"
      >
        {q}
        <ChevronDown className={`transform transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
           <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: "auto", opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
           >
             <div className="p-6 pt-0 text-gray-400 font-sans border-t border-[#1a1a1a] mt-2 bg-[#111]">
               {a}
             </div>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
