import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Users, 
  Target, 
  Globe2, 
  Zap, 
  Heart, 
  MessageCircle,
  TrendingUp,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { useEffect } from 'react';

const WHATSAPP_NUMBER = "918299446820";

export default function AboutPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "About Us | Gati Music Distribution";
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#f5f5f5] font-sans selection:bg-[#B6FF00] selection:text-black overflow-x-hidden">
      {/* Canonical URL for SEO */}
      <link rel="canonical" href="https://www.gatimusic.in/about" />
      
      {/* Background Decorative Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#B6FF00]/5 filter blur-[60px] md:blur-[120px] rounded-full pointer-events-none -z-10 opacity-50 md:opacity-100"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#8B5CF6]/5 filter blur-[60px] md:blur-[120px] rounded-full pointer-events-none -z-10 opacity-50 md:opacity-100"></div>

      {/* Header */}
      <header className="fixed top-0 w-full px-4 md:px-6 py-4 flex justify-between items-center z-50 bg-[#0A0A0A]/80 md:backdrop-blur-xl border-b border-[#1a1a1a]">
        <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-[#B6FF00] transition-colors group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-display uppercase tracking-widest text-[10px] md:text-xs font-bold">Home</span>
        </Link>
        <div className="font-display font-black tracking-tighter flex items-center gap-1">
          <span className="text-[#B6FF00] text-2xl">gati</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] mt-2"></span>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 max-w-6xl mx-auto text-center">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6 }}
        >
          <span className="inline-block py-1.5 px-4 rounded-full bg-[#B6FF00]/10 border border-[#B6FF00]/20 text-[#B6FF00] font-display uppercase tracking-widest text-[10px] font-bold mb-6">
            For the Artists, By the Artists
          </span>
          <h1 className="text-5xl md:text-8xl font-display uppercase tracking-tighter mb-8 leading-none drop-shadow-2xl">
            We move your <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B6FF00] to-[#8B5CF6]">music forward.</span>
          </h1>
          <p className="font-sans text-lg md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-12">
            Gati Music Distribution was built to make distribution fast, simple, and affordable. No delays, no confusion—just real results for independent Indian artists.
          </p>
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <Link to="/pricing" className="bg-[#B6FF00] text-black px-10 py-4 rounded-full font-display uppercase tracking-widest font-black text-sm hover:bg-white transition-all">
              View Pricing
            </Link>
            <Link to="/blog" className="border border-[#222] text-white px-10 py-4 rounded-full font-display uppercase tracking-widest font-black text-sm hover:border-[#B6FF00] transition-all">
              Read Our Blog
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Introduction Cards */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-3xl bg-[#111]/40 border border-[#222] backdrop-blur-xl"
          >
            <div className="w-12 h-12 rounded-xl bg-[#B6FF00]/10 flex items-center justify-center text-[#B6FF00] mb-6">
              <Zap size={24} />
            </div>
            <h2 className="text-2xl font-display uppercase tracking-tight text-white mb-4">The Problem</h2>
            <p className="text-gray-400 font-sans leading-relaxed">
              Traditional distribution is often broken—long email wait times, hidden fees, and automated rejections. Artists in India deserve better than "pending" status for weeks. Check our <a href="/faq" className="text-[#B6FF00] hover:underline">FAQ</a> to see how we handle these issues.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-3xl bg-[#B6FF00]/5 border border-[#B6FF00]/20 backdrop-blur-xl"
          >
            <div className="w-12 h-12 rounded-xl bg-[#B6FF00]/20 flex items-center justify-center text-[#B6FF00] mb-6">
              <Heart size={24} />
            </div>
            <h2 className="text-2xl font-display uppercase tracking-tight text-white mb-4">Our Solution</h2>
            <p className="text-gray-400 font-sans leading-relaxed">
              We replaced email bots with WhatsApp human support. We replaced the 4-week wait with 48-hour delivery. We empower independent creators with professional tools.
            </p>
          </motion.div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-24 px-6 bg-[#050505] border-y border-[#1a1a1a]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display uppercase tracking-tighter text-white mb-4">Powering Your Global Reach</h2>
            <p className="text-gray-500 max-w-xl mx-auto">We don't just "upload"—we handle the heavy lifting of worldwide delivery.</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: <Globe2 />, title: "250+ Platforms", desc: "Spotify, Apple, Amazon, JioSaavn & more." },
              { icon: <Zap />, title: "Precision Metadata", desc: "Store-standard metadata optimization." },
              { icon: <CheckCircle2 />, title: "Manual Review", desc: "Every release is checked by an expert." },
              { icon: <Users />, title: "Artist Support", desc: "Real human help when you need it." }
            ].map((item, i) => (
              <div key={i} className="text-center group">
                <div className="w-16 h-16 rounded-full bg-[#111] border border-[#222] flex items-center justify-center mx-auto mb-6 text-gray-400 group-hover:text-[#B6FF00] group-hover:border-[#B6FF00]/50 transition-all duration-300">
                  {item.icon}
                </div>
                <h3 className="text-white font-display uppercase tracking-widest text-sm mb-2">{item.title}</h3>
                <p className="text-xs text-gray-500 font-sans leading-relaxed px-4">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Gati - List with Highlights */}
      <section className="py-32 px-6 max-w-5xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-display uppercase tracking-tighter text-center mb-20 text-white">Why Independent Artists <br/> <span className="text-[#B6FF00]">Choose Gati</span></h2>
        
        <div className="space-y-6">
          {[
            { tag: "01", title: "Lightning Fast Delivery", desc: "Your track goes from 'Submitted' to 'Live' in just 2-3 days. No more guessing." },
            { tag: "02", title: "80% Artist Commission", desc: "Keep the majority of your earnings. We only grow when you grow." },
            { tag: "03", title: "Human Review Team", desc: "No auto-rejections. If there's an issue, we tell you how to fix it via WhatsApp." },
            { tag: "04", title: "WhatsApp Support", desc: "Skip the tickets. Direct access to our team in India, 7 days a week." }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row gap-6 md:items-center p-8 rounded-3xl bg-[#111]/20 border border-[#222] hover:bg-[#111]/40 transition-all group"
            >
              <div className="font-display font-black text-4xl text-[#B6FF00]/20 group-hover:text-[#B6FF00] transition-colors">{item.tag}</div>
              <div className="flex-grow">
                <h3 className="text-xl font-display uppercase tracking-wide text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Who It's For & Our Approach */}
      <section className="py-24 px-6 bg-gradient-to-b from-transparent to-[#050505]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16">
          <div>
            <h2 className="text-4xl font-display uppercase tracking-tighter text-white mb-8">Who is Gati For?</h2>
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="mt-1 text-[#8B5CF6]"><TrendingUp /></div>
                <div>
                  <h4 className="text-white font-display uppercase tracking-widest text-xs mb-2">Beginners</h4>
                  <p className="text-gray-400 text-sm">Releasing your first single? We'll guide you through every step of metadata and cover art standards.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="mt-1 text-[#3B82F6]"><Users /></div>
                <div>
                  <h4 className="text-white font-display uppercase tracking-widest text-xs mb-2">Steady Creators</h4>
                  <p className="text-gray-400 text-sm">Growing a fanbase? Get stable,monthly reports and reliable payouts with zero hidden deductions.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-4xl font-display uppercase tracking-tighter text-white mb-8">Our Approach</h2>
            <p className="text-gray-400 leading-relaxed font-sans mb-8">
              We operate on three principles: <span className="text-[#B6FF00]">Speed</span>, <span className="text-[#B6FF00]">Simplicity</span>, and <span className="text-[#B6FF00]">Transparency</span>. 
              We don't make fake promises about playlists or "overnight fame." We provide the best-in-class distribution tools and support so you can focus on making music.
            </p>
            <div className="p-6 rounded-2xl bg-[#8B5CF6]/5 border border-[#8B5CF6]/20">
               <div className="flex items-center gap-3 text-[#8B5CF6] font-display uppercase tracking-widest text-[10px] font-black mb-2">
                 <ShieldCheck size={14} /> Mission Statement
               </div>
               <p className="text-white font-sans font-medium italic">
                 "To empower every independent artist in India with professional, affordable, and incredibly fast global distribution channels."
               </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 px-6 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#B6FF00]/10 blur-[150px] -z-10"></div>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-8xl font-display uppercase tracking-tighter mb-8 leading-none">
            Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B6FF00] to-[#8B5CF6]">make noise?</span>
          </h2>
          <p className="font-sans text-xl text-gray-400 mb-12">No fancy emails. Just direct WhatsApp help.</p>
          
          <motion.a 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi Gati, I'd like to learn more about distributing my music.")}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#B6FF00] text-black px-12 py-6 rounded-full font-display uppercase tracking-widest font-black text-lg shadow-[0_0_50px_rgba(182,255,0,0.3)] hover:shadow-[0_0_70px_rgba(182,255,0,0.5)] transition-all"
          >
            <MessageCircle /> Support {WHATSAPP_NUMBER}
          </motion.a>
        </div>
      </section>

      <footer className="bg-[#050505] border-t border-[#1a1a1a] py-12 px-6 text-center">
        <p className="text-gray-500 text-xs font-sans">
          © 2026 Gati Music Distribution. For the Artists, By the Artists.
        </p>
      </footer>
    </div>
  );
}
