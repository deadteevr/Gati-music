import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  MessageCircle, 
  Mail, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Music,
  PenTool,
  UploadCloud,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useEffect } from 'react';

const WHATSAPP_NUMBER = "+91 7626841258";
const EMAIL_ADDRESS = "gatimusicdistribution@gmail.com";

export default function ContactPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Contact | Gati Music Distribution";
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#f5f5f5] font-sans selection:bg-[#B6FF00] selection:text-black overflow-x-hidden">
      {/* SEO Canonical */}
      <link rel="canonical" href="https://www.gatimusic.in/contact" />
      
      {/* Background Decorative Glows */}
      <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#B6FF00]/5 filter blur-[60px] md:blur-[120px] rounded-full pointer-events-none -z-10 opacity-50 md:opacity-100"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#8B5CF6]/5 filter blur-[60px] md:blur-[120px] rounded-full pointer-events-none -z-10 opacity-50 md:opacity-100"></div>

      {/* Header */}
      <header className="fixed top-0 w-full px-4 md:px-6 py-4 flex justify-between items-center z-50 bg-[#0A0A0A]/80 md:backdrop-blur-xl border-b border-[#1a1a1a]">
        <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-[#B6FF00] transition-colors group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-display uppercase tracking-widest text-[10px] md:text-xs font-bold font-sans">Home</span>
        </Link>
        <div className="font-display font-black tracking-tighter flex items-center gap-1">
          <span className="text-[#B6FF00] text-2xl">gati</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] mt-2"></span>
        </div>
      </header>

      <main className="pt-32 pb-20 px-6 max-w-5xl mx-auto">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <div className="flex items-center justify-center gap-3 text-[#B6FF00] mb-4">
            <MessageCircle size={20} />
            <span className="font-display uppercase tracking-widest text-xs font-bold">Get in Touch</span>
          </div>
          <h1 className="text-4xl md:text-7xl font-display uppercase tracking-tighter mb-6 text-white leading-none">
            Contact Us – <span className="text-[#B6FF00]">Gati Music</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-2xl max-w-2xl mx-auto font-sans">
            Fast, direct support for independent artists. We're here to move your career forward.
          </p>
        </motion.div>

        {/* Primary Contact Methods */}
        <div className="grid md:grid-cols-2 gap-8 mb-24">
          {/* WhatsApp - Highlighted Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="group relative p-8 rounded-3xl bg-[#B6FF00]/5 border border-[#B6FF00]/20 hover:border-[#B6FF00]/50 transition-all overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#B6FF00]/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-500"></div>
            
            <div className="w-14 h-14 rounded-2xl bg-[#B6FF00]/10 flex items-center justify-center text-[#B6FF00] mb-8 group-hover:scale-110 transition-transform">
              <MessageCircle size={32} />
            </div>
            
            <h2 className="text-3xl font-display uppercase tracking-tight text-white mb-4">WhatsApp Support</h2>
            <div className="space-y-4 mb-8">
              <p className="text-gray-400 text-sm leading-relaxed">
                Our primary and fastest support method. Skip the email queue and talk to a real human instantly.
              </p>
              <ul className="space-y-2 text-sm text-gray-300 font-sans">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#B6FF00]" /> Instant replies for urgent issues
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#B6FF00]" /> Quick metadata & song resolution
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#B6FF00]" /> One-on-one plan discussion
                </li>
              </ul>
            </div>

            <motion.a 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\s+/g, '')}?text=${encodeURIComponent("Hi Gati Team, I need support with my music distribution.")}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 bg-[#B6FF00] text-black w-full py-5 rounded-2xl font-display uppercase tracking-widest font-black text-lg hover:bg-white transition-colors shadow-[0_0_30px_rgba(182,255,0,0.2)] group-hover:shadow-[0_0_50px_rgba(182,255,0,0.4)]"
            >
              <MessageCircle size={24} /> Chat on WhatsApp
            </motion.a>
            <p className="text-center mt-4 text-[#B6FF00] font-sans font-bold text-sm">{WHATSAPP_NUMBER}</p>
          </motion.div>

          {/* Email Support */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="p-8 rounded-3xl bg-[#111]/40 border border-[#222] hover:border-[#333] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-[#8B5CF6]/10 flex items-center justify-center text-[#8B5CF6] mb-8">
                <Mail size={32} />
              </div>
              
              <h2 className="text-3xl font-display uppercase tracking-tight text-white mb-4">Email Support</h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                For non-urgent inquiries or official partnerships. Please note that response times via email are slower compared to WhatsApp.
              </p>
              
              <div className="p-4 rounded-xl bg-black/50 border border-[#222] mb-8">
                <span className="text-gray-500 uppercase tracking-widest text-[10px] block mb-1">Official Address</span>
                <a href={`mailto:${EMAIL_ADDRESS}`} className="text-[#8B5CF6] font-display text-xl break-all hover:underline">{EMAIL_ADDRESS}</a>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-[#8B5CF6]/5 border border-[#8B5CF6]/10">
              <Clock size={16} className="text-[#8B5CF6] shrink-0" />
              <p className="text-xs text-gray-500 italic">Expected email response: 12-24 hours</p>
            </div>
          </motion.div>
        </div>

        {/* Support Details */}
        <div className="grid md:grid-cols-2 gap-16 mb-24">
          <section>
            <h3 className="text-2xl font-display uppercase tracking-tight text-white mb-8 flex items-center gap-3">
              <span className="w-8 h-px bg-[#B6FF00]/40"></span> Help Topics
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {[
                { icon: <UploadCloud size={18}/>, title: "Release Status", desc: "Checking when your song will go live." },
                { icon: <Music size={18}/>, title: "Song Upload Issues", desc: "Troubleshooting audio or file errors." },
                { icon: <PenTool size={18}/>, title: "Metadata Corrections", desc: "Fixing spelling, features, or roles." },
                { icon: <ShieldCheck size={18}/>, title: "Payments & Royalties", desc: "Questions about your earnings and reports." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-2xl bg-[#0F0F0F] border border-[#1A1A1A] group">
                  <div className="text-gray-500 group-hover:text-[#B6FF00] transition-colors">{item.icon}</div>
                  <div>
                    <h4 className="text-white font-display uppercase tracking-widest text-xs mb-1">{item.title}</h4>
                    <p className="text-gray-500 text-xs">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-2xl font-display uppercase tracking-tight text-white mb-8 flex items-center gap-3">
              <span className="w-8 h-px bg-[#B6FF00]/40"></span> Before Contacting
            </h3>
            <div className="p-8 rounded-3xl bg-gradient-to-br from-[#111] to-[#0A0A0A] border border-[#222] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <AlertCircle size={40} className="text-[#B6FF00]/10" />
              </div>
              <p className="text-gray-400 text-sm mb-6 font-sans">To help us resolve your issue faster, please have the following ready when you message us:</p>
              <ul className="space-y-4">
                {[
                  "Your Registered Artist Name",
                  "Title of the Release in question",
                  "A clear, brief description of the issue",
                  "Screenshots of any errors you're seeing"
                ].map((text, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                    <div className="w-6 h-6 rounded-full bg-[#B6FF00]/10 flex items-center justify-center text-[#B6FF00] font-black text-[10px] shrink-0 font-display">0{i+1}</div>
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>

        {/* Closing / Final CTA */}
        <section className="py-20 text-center relative">
          <div className="absolute inset-0 bg-[#B6FF00]/5 blur-[100px] -z-10 rounded-full"></div>
          <h2 className="text-3xl md:text-5xl font-display uppercase tracking-tighter mb-8 text-white leading-tight">
            Ready to release your music? <br/>
            Contact us on <span className="text-[#B6FF00]">WhatsApp</span> to get started.
          </h2>
          <motion.a 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\s+/g, '')}?text=${encodeURIComponent("Hi Gati, I'm ready to release my music. How do we get started?")}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#B6FF00] text-black px-12 py-5 rounded-full font-display uppercase tracking-widest font-black text-lg shadow-[0_0_40px_rgba(182,255,0,0.3)]"
          >
            Message Support
          </motion.a>
          
          <div className="mt-12 flex flex-col items-center gap-2">
             <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-widest font-display font-bold">
               <div className="w-1.5 h-1.5 rounded-full bg-[#B6FF00] animate-pulse"></div>
               Support Timing: Available Daily
             </div>
             <p className="text-gray-600 text-[10px] uppercase tracking-widest font-sans">Typical response within a few hours</p>
          </div>
        </section>
      </main>

      <footer className="bg-[#050505] border-t border-[#1a1a1a] py-12 px-6 text-center">
        <p className="text-gray-500 text-xs font-sans uppercase tracking-[0.2em] font-bold">
          © 2026 Gati Music Distribution. Direct Support. Worldwide Freedom.
        </p>
      </footer>
    </div>
  );
}
