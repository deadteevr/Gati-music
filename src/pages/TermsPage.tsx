import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, FileText, ChevronRight } from 'lucide-react';
import { useEffect } from 'react';

export default function TermsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Terms & Conditions | Gati Music Distribution";
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#f5f5f5] font-sans selection:bg-[#B6FF00] selection:text-black">
      {/* SEO Canonical */}
      <link rel="canonical" href="https://www.gatimusic.in/terms" />
      
      {/* Background Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[400px] bg-[#B6FF00]/5 filter blur-[120px] -z-10 rounded-full"></div>

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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 text-[#B6FF00] mb-4">
            <FileText size={20} />
            <span className="font-display uppercase tracking-widest text-xs font-bold">Legal Documentation</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-display uppercase tracking-tighter mb-4 text-white">Terms & Conditions</h1>
          <p className="text-gray-500 mb-12 font-sans italic">Last Updated: April 20, 2026</p>

          <div className="space-y-12 text-gray-300 leading-relaxed font-sans">
            <section>
              <h2 className="text-xl font-display uppercase tracking-widest text-white mb-4 flex items-center gap-3">
                <span className="w-8 h-px bg-[#B6FF00]/40"></span> 1. Acceptance of Terms
              </h2>
              <p>
                By accessing and using the Gati Music Distribution platform ("Service"), you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, you must not use our Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display uppercase tracking-widest text-white mb-4 flex items-center gap-3">
                <span className="w-8 h-px bg-[#B6FF00]/40"></span> 2. Service Description
              </h2>
              <p>
                Gati Music Distribution provides a digital music distribution service that deliviers your musical content to various streaming platforms and digital stores, including but not limited to Spotify, Apple Music, JioSaavn, Amazon Music, and YouTube Music.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display uppercase tracking-widest text-white mb-4 flex items-center gap-3">
                <span className="w-8 h-px bg-[#B6FF00]/40"></span> 3. User Responsibility
              </h2>
              <p className="mb-4">
                You represent and warrant that you own or have all necessary rights, licenses, and permissions for all content you upload.
              </p>
              <ul className="list-none space-y-3">
                <li className="flex gap-3"><ChevronRight size={16} className="text-[#B6FF00] shrink-0 mt-1" /> You must not upload copyrighted material belonging to others.</li>
                <li className="flex gap-3"><ChevronRight size={16} className="text-[#B6FF00] shrink-0 mt-1" /> You must not upload illegal, offensive, or prohibited content.</li>
                <li className="flex gap-3"><ChevronRight size={16} className="text-[#B6FF00] shrink-0 mt-1" /> You are responsible for maintaining the confidentiality of your account credentials.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-display uppercase tracking-widest text-white mb-4 flex items-center gap-3">
                <span className="w-8 h-px bg-[#B6FF00]/40"></span> 4. Content Ownership
              </h2>
              <p>
                You retain 100% ownership of your musical compositions and sound recordings. By using Gati, you grant us a non-exclusive, worldwide license to distribute, perform, and display your content solely for the purpose of providing the distribution service.
              </p>
            </section>

            <section className="bg-[#111] p-8 rounded-2xl border border-[#222]">
              <h2 className="text-xl font-display uppercase tracking-widest text-[#B6FF00] mb-4">5. Payments & Royalties</h2>
              <p className="mb-4">
                We pride ourselves on transparency and fairness for independent artists.
              </p>
              <ul className="list-none space-y-3">
                <li className="flex gap-3"><ChevronRight size={16} className="text-[#B6FF00] shrink-0 mt-1" /> Artists keep 80% of generated royalties. Gati retains a 20% commission for service maintenance.</li>
                <li className="flex gap-3"><ChevronRight size={16} className="text-[#B6FF00] shrink-0 mt-1" /> The first royalty report is typically available 3 months after release.</li>
                <li className="flex gap-3"><ChevronRight size={16} className="text-[#B6FF00] shrink-0 mt-1" /> Subsequent reports and payments are processed monthly.</li>
                <li className="flex gap-3"><ChevronRight size={16} className="text-[#B6FF00] shrink-0 mt-1" /> Thresholds and payment methods are specified in your dashboard.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-display uppercase tracking-widest text-white mb-4 flex items-center gap-3">
                <span className="w-8 h-px bg-[#B6FF00]/40"></span> 6. Review & Approval Process
              </h2>
              <p>
                Every submission undergoes a manual review by our team to ensure metadata and audio quality meet store standards. We reserve the right to request changes to cover art, titles, or audio before delivery. Rejection may occur if content violates store policies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display uppercase tracking-widest text-white mb-4 flex items-center gap-3">
                <span className="w-8 h-px bg-[#B6FF00]/40"></span> 7. Delivery Timeline
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="bg-[#0A0A0A] border border-[#222] p-6 rounded-xl">
                  <div className="text-[#B6FF00] font-display font-bold mb-2">7-8 HOURS</div>
                  <div className="text-xs uppercase tracking-widest text-gray-500">Manual Review</div>
                </div>
                <div className="bg-[#0A0A0A] border border-[#222] p-6 rounded-xl">
                  <div className="text-white font-display font-bold mb-2">24-48 HOURS</div>
                  <div className="text-xs uppercase tracking-widest text-gray-500">Processing</div>
                </div>
                <div className="bg-[#0A0A0A] border border-[#222] p-6 rounded-xl">
                  <div className="text-[#8B5CF6] font-display font-bold mb-2">2-3 DAYS</div>
                  <div className="text-xs uppercase tracking-widest text-gray-500">Going Live</div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-display uppercase tracking-widest text-white mb-4 flex items-center gap-3">
                <span className="w-8 h-px bg-[#B6FF00]/40"></span> 8. Prohibited Content
              </h2>
              <p>
                Gati prohibits content that includes: AI-generated tracks without proper licensing, "silent" tracks, non-musical field recordings, deceptive metadata (impersonation), or content that infringes on third-party intellectual property.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display uppercase tracking-widest text-white mb-4 flex items-center gap-3">
                <span className="w-8 h-px bg-[#B6FF00]/40"></span> 9. Limitation of Liability
              </h2>
              <p>
                Gati is not responsible for the decision of any digital store to remove content or for technical errors on the part of third-party platforms. Our total liability is limited to the amount paid by you for the service in the preceding 12 months.
              </p>
            </section>

            <section className="pt-8 border-t border-[#1a1a1a]">
              <h2 className="text-xl font-display uppercase tracking-widest text-[#B6FF00] mb-4 flex items-center gap-3">
                <span className="w-8 h-px bg-[#B6FF00]/40"></span> Contact Information
              </h2>
              <p className="mb-8">
                For any legal queries, support regarding these terms, or account issues, please contact our official support channel via WhatsApp.
              </p>
              <a 
                href="https://wa.me/918299446820?text=Hi, I have a query regarding the Terms and Conditions."
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-[#B6FF00]/10 text-[#B6FF00] px-6 py-3 rounded-full border border-[#B6FF00]/20 font-display uppercase tracking-widest text-xs font-bold hover:bg-[#B6FF00] hover:text-black transition-all"
              >
                Contact Support via WhatsApp
              </a>
            </section>
          </div>
        </motion.div>
      </main>

      <footer className="bg-[#050505] border-t border-[#1a1a1a] py-12 px-6 text-center space-y-4">
        <div className="flex justify-center gap-8 text-xs font-display uppercase tracking-widest text-gray-500">
          <Link to="/refund-policy" className="hover:text-[#B6FF00] transition-colors">Refund Policy</Link>
          <Link to="/privacy" className="hover:text-[#B6FF00] transition-colors">Privacy Policy</Link>
          <Link to="/contact" className="hover:text-[#B6FF00] transition-colors">Contact Support</Link>
        </div>
        <p className="text-gray-600 text-[10px] font-sans uppercase tracking-[0.2em]">
          © 2026 Gati Music Distribution. All rights reserved. Professional Music Distribution for Independent Artists.
        </p>
      </footer>
    </div>
  );
}
