import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Lock, Eye, ChevronRight } from 'lucide-react';
import { useEffect } from 'react';

export default function PrivacyPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Privacy Policy | Gati Music Distribution";
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#f5f5f5] font-sans selection:bg-[#B6FF00] selection:text-black">
      {/* SEO Canonical */}
      <link rel="canonical" href="https://www.gatimusic.in/privacy-policy" />
      
      {/* Background Glow */}
      <div className="fixed top-0 right-1/2 translate-x-1/2 w-full max-w-[1000px] h-[400px] bg-[#8B5CF6]/5 filter blur-[120px] -z-10 rounded-full"></div>

      {/* Header */}
      <header className="fixed top-0 w-full px-6 py-4 flex justify-between items-center z-50 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-[#1a1a1a]">
        <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-[#B6FF00] transition-colors group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-display uppercase tracking-widest text-xs font-bold">Back to Home</span>
        </Link>
        <div className="font-display font-black tracking-tighter flex items-center gap-1">
          <span className="text-[#B6FF00] text-2xl">gati</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] mt-2"></span>
        </div>
      </header>

      <main className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 text-[#8B5CF6] mb-4">
            <ShieldCheck size={20} />
            <span className="font-display uppercase tracking-widest text-xs font-bold text-gray-400">Security & Privacy</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-display uppercase tracking-tighter mb-4 text-white">Privacy Policy</h1>
          <p className="text-gray-500 mb-12 font-sans italic">Last Updated: April 20, 2026</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="p-6 bg-[#111] rounded-2xl border border-[#222] flex flex-col items-center text-center">
              <Lock className="text-[#B6FF00] mb-4" size={32} />
              <h3 className="text-white font-display text-sm uppercase tracking-widest mb-2">Secure Data</h3>
              <p className="text-gray-500 text-xs">Encryption at rest and in transit.</p>
            </div>
            <div className="p-6 bg-[#111] rounded-2xl border border-[#222] flex flex-col items-center text-center">
              <Eye className="text-[#8B5CF6] mb-4" size={32} />
              <h3 className="text-white font-display text-sm uppercase tracking-widest mb-2">Transparent</h3>
              <p className="text-gray-500 text-xs">No hidden data selling practices.</p>
            </div>
            <div className="p-6 bg-[#111] rounded-2xl border border-[#222] flex flex-col items-center text-center">
              <ShieldCheck className="text-blue-400 mb-4" size={32} />
              <h3 className="text-white font-display text-sm uppercase tracking-widest mb-2">Artist Control</h3>
              <p className="text-gray-500 text-xs">Full rights to your personal data.</p>
            </div>
          </div>

          <div className="space-y-12 text-gray-300 leading-relaxed font-sans">
            <section>
              <h2 className="text-xl font-display uppercase tracking-widest text-white mb-4">1. Information We Collect</h2>
              <p className="mb-4">To provide our music distribution services, we collect several types of Information:</p>
              <ul className="list-none space-y-3">
                <li className="flex gap-3"><ChevronRight size={16} className="text-[#B6FF00] shrink-0 mt-1" /> <span className="text-white font-medium">Personal Details:</span> Name, email address, phone number, and physical address.</li>
                <li className="flex gap-3"><ChevronRight size={16} className="text-[#B6FF00] shrink-0 mt-1" /> <span className="text-white font-medium">Uploads:</span> Your musical tracks (audio files), cover art images, and associated metadata (song titles, artist names).</li>
                <li className="flex gap-3"><ChevronRight size={16} className="text-[#B6FF00] shrink-0 mt-1" /> <span className="text-white font-medium">Payment Information:</span> Necessary bank details for royalty payouts.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-display uppercase tracking-widest text-white mb-4">2. How We Use Your Data</h2>
              <p className="mb-4">Your information is used strictly for the following purposes:</p>
              <ul className="list-none space-y-3">
                <li className="flex gap-3"><ChevronRight size={16} className="text-[#8B5CF6] shrink-0 mt-1" /> Delivering your music to Digital Service Providers (DSPs).</li>
                <li className="flex gap-3"><ChevronRight size={16} className="text-[#8B5CF6] shrink-0 mt-1" /> Processing royalty payouts and generating financial reports.</li>
                <li className="flex gap-3"><ChevronRight size={16} className="text-[#8B5CF6] shrink-0 mt-1" /> Providing direct support via WhatsApp and internal dashboard.</li>
                <li className="flex gap-3"><ChevronRight size={16} className="text-[#8B5CF6] shrink-0 mt-1" /> Communicating important service updates and metadata corrections.</li>
              </ul>
            </section>

            <section className="bg-gradient-to-br from-[#111] to-[#0A0A0A] p-8 rounded-2xl border border-[#222] relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#B6FF00]/5 blur-3xl rounded-full"></div>
               <h2 className="text-xl font-display uppercase tracking-widest text-white mb-4">3. Data Sharing</h2>
               <p>
                 We share your content (music & metadata) ONLY with world-class digital music stores (Spotify, Apple, etc.) specifically for distribution purposes. We <span className="text-[#B6FF00] font-bold underline underline-offset-4">never</span> sell your personal information to third-party marketing companies. 
               </p>
            </section>

            <section>
              <h2 className="text-xl font-display uppercase tracking-widest text-white mb-4">4. Data Security</h2>
              <p>
                We implement industry-standard security measures, including SSL encryption and secure database storage, to protect your personal data from unauthorized access or disclosure.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display uppercase tracking-widest text-white mb-4">5. Cookies Usage</h2>
              <p>
                We use essential cookies to maintain your login session and improve application performance. You can manage cookie preferences through your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display uppercase tracking-widest text-white mb-4">6. Your Rights</h2>
              <p>
                You have the right to request a copy of your personal data or request the deletion of your account. Note that some data may be retained for accounting and compliance purposes related to your distribution history.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display uppercase tracking-widest text-white mb-4">7. Updates to Privacy Policy</h2>
              <p>
                We may update this policy periodically. Significant changes will be announced on the dashboard or through your registered contact method.
              </p>
            </section>

            <div className="pt-12 border-t border-[#1a1a1a]">
               <h3 className="text-white font-display uppercase tracking-widest mb-4">Contact Privacy Officer</h3>
               <p className="text-sm text-gray-500 mb-8">If you have specific questions about your personal data or privacy rights on Gati, message our security team.</p>
               <a 
                href="https://wa.me/918299446820?text=Hi, I have a question about my privacy and data on Gati."
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-[#8B5CF6]/10 text-[#8B5CF6] px-6 py-3 rounded-full border border-[#8B5CF6]/20 font-display uppercase tracking-widest text-xs font-bold hover:bg-[#8B5CF6] hover:text-white transition-all"
               >
                Message Privacy Group
               </a>
            </div>
          </div>
        </motion.div>
      </main>

      <footer className="bg-[#050505] border-t border-[#1a1a1a] py-12 px-6 text-center space-y-4">
        <div className="flex justify-center gap-8 text-xs font-display uppercase tracking-widest text-gray-500">
          <Link to="/refund-policy" className="hover:text-[#B6FF00] transition-colors">Refund Policy</Link>
          <Link to="/terms" className="hover:text-[#B6FF00] transition-colors">Terms of Use</Link>
          <Link to="/contact" className="hover:text-[#B6FF00] transition-colors">Contact Support</Link>
        </div>
        <p className="text-gray-600 text-[10px] font-sans uppercase tracking-[0.2em]">
          © 2026 Gati Music Distribution. All rights reserved. Secure & Private Music Distribution.
        </p>
      </footer>
    </div>
  );
}
