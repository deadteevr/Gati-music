import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ChevronRight, ShieldAlert, Headphones, RefreshCw } from 'lucide-react';

export default function RefundPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Refund Policy | Gati Music Distribution";
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#f5f5f5] font-sans selection:bg-[#B6FF00] selection:text-black">
      {/* Header */}
      <div className="border-b border-[#1a1a1a] p-6 lg:px-12 flex justify-between items-center bg-[#050505]/80 backdrop-blur-xl fixed top-0 w-full z-40">
        <Link to="/" className="font-display font-black tracking-tighter flex items-center gap-1 group">
          <span className="text-[#B6FF00] text-3xl drop-shadow-[0_0_10px_rgba(182,255,0,0.5)]">gati</span>
          <span className="w-2 h-2 rounded-full bg-[#8B5CF6] mt-2 shadow-[0_0_10px_rgba(139,92,246,0.8)]"></span>
        </Link>
        <Link to="/pricing" className="font-display uppercase tracking-widest text-xs font-bold text-gray-400 hover:text-white transition-colors">Pricing Plans</Link>
      </div>

      <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#111] border border-[#222] rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden"
        >
          {/* Subtle Glow */}
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#B6FF00]/5 blur-[100px] rounded-full"></div>
          
          <h1 className="text-4xl md:text-5xl font-display uppercase tracking-tighter mb-8 text-white">Refund Policy</h1>
          
          <div className="space-y-8 text-gray-400 leading-relaxed font-sans text-sm md:text-base">
            <section className="space-y-4">
              <h2 className="text-xl font-display uppercase tracking-widest text-[#B6FF00] flex items-center gap-2">
                <ShieldAlert size={20} /> Digital Goods Policy
              </h2>
              <p>Due to the nature of digital goods and services provided by Gati Music Distribution (distribution of music to streaming platforms), all sales are generally final. Once a distribution order is processed or a subscription plan is activated, resources are allocated and systems are triggered immediately.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-display uppercase tracking-widest text-[#8B5CF6] flex items-center gap-2">
                <RefreshCw size={20} /> Conditions for Refund
              </h2>
              <p>Refunds may only be considered under the following specific circumstances:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white">Duplicate Payment:</strong> If you were accidentally charged twice for the same plan or release.</li>
                <li><strong className="text-white">Technical Failure:</strong> If a technical error on our platform prevented the distribution process from even starting, and our support team is unable to resolve it within 7 business days.</li>
                <li><strong className="text-white">Accidental Subscription:</strong> If you notify us via WhatsApp within 2 hours of payment and NO songs have been uploaded or processed under the new plan.</li>
              </ul>
            </section>

            <section className="bg-[#050505] p-6 rounded-2xl border border-[#222] space-y-4">
              <h2 className="text-lg font-display uppercase tracking-widest text-white">No-Refund Cases</h2>
              <p>Refunds will NOT be issued in the following cases:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>If the streaming platform (Spotify, Apple Music, etc.) rejects your content due to metadata errors, sample clearance issues, or copyright violations.</li>
                <li>If you change your mind after the release has been delivered or is "In Review".</li>
                <li>If your artist account is suspended for fraudulent streaming (bot plays) or copyright strikes.</li>
                <li>Failure to provide necessary documents for royalty withdrawal.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-display uppercase tracking-widest text-[#B6FF00] flex items-center gap-2">
                <Headphones size={20} /> How to Request
              </h2>
              <p>To request a refund review, contact our WhatsApp Support team with your <strong className="text-white">Order ID / Email</strong> and a clear explanation of the issue. Our finance team will review the request within 3-5 business days.</p>
              <div className="pt-4">
                <a 
                  href="https://wa.me/917626841258?text=Hi, I have a question regarding my payment/refund." 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-[#B6FF00] text-black px-6 py-3 rounded-full font-display uppercase tracking-widest font-black text-xs hover:bg-white transition-all shadow-[0_0_20px_rgba(182,255,0,0.3)]"
                >
                  Contact Support on WhatsApp
                </a>
              </div>
            </section>
          </div>
        </motion.div>

        <div className="mt-12 text-center">
          <Link to="/" className="text-gray-500 hover:text-white transition-colors flex items-center justify-center gap-2 font-display uppercase tracking-widest text-xs font-bold">
            Back to Home <ChevronRight size={14} className="text-[#B6FF00]" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#050505] border-t border-[#1a1a1a] py-12 px-6 text-center text-gray-500 font-sans text-xs">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <p>© 2026 Gati Music Distribution</p>
          <div className="flex gap-6 uppercase tracking-widest">
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/faq" className="hover:text-white transition-colors">FAQ</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
