import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Minus, 
  MessageCircle, 
  HelpCircle,
  Clock,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  Music,
  Globe2
} from 'lucide-react';
import { useState, useEffect } from 'react';

const WHATSAPP_NUMBER = "+91 7626841258";

interface FAQItemProps {
  key?: number | string;
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}

function FAQAccordionItem({ question, answer, isOpen, onClick }: FAQItemProps) {
  return (
    <div className="border-b border-[#1a1a1a] last:border-b-0">
      <button 
        onClick={onClick}
        className="w-full py-6 flex items-center justify-between text-left group"
      >
        <span className={`text-lg md:text-xl font-display uppercase tracking-tight transition-colors ${isOpen ? 'text-[#B6FF00]' : 'text-gray-300 group-hover:text-white'}`}>
          {question}
        </span>
        <div className={`shrink-0 ml-4 w-8 h-8 rounded-full border border-[#222] flex items-center justify-center transition-all ${isOpen ? 'bg-[#B6FF00] border-[#B6FF00] text-black' : 'text-gray-500'}`}>
          {isOpen ? <Minus size={16} /> : <Plus size={16} />}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-gray-400 font-sans leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "FAQ | Gati Music Distribution";
  }, []);

  const faqs = [
    {
      question: "How to release music with Gati?",
      answer: "Releasing with Gati is simple. 1. Pick a plan that fits your needs. 2. Contact us on WhatsApp to confirm your plan. 3. Receive your dashboard access. 4. Upload your song, metadata, and artwork. Our team reviews it within 8 hours and delivers it worldwide."
    },
    {
      question: "What is the release timeline?",
      answer: "We offer some of the fastest delivery times in India. Our manual review takes 7–8 hours. Processing and delivery to stores takes 24–48 hours. Your music typically goes live on stores like Spotify and Apple Music in just 2–3 days."
    },
    {
      question: "How much royalties do I keep?",
      answer: "Artists keep 80% of their royalties on all Gati plans. We believe in high profit-sharing for independent artists. We only deduct a 20% flat commission for maintenance and support."
    },
    {
      question: "When do I get my royalty reports?",
      answer: "The first royalty report is generated after 3 months of your release going live. After this initial period, reports are updated monthly within your artist dashboard."
    },
    {
      question: "Which platforms do you distribute to?",
      answer: "We distribute to 250+ platforms globally, including Spotify, Apple Music, YouTube Music, JioSaavn, Amazon Music, Wynk, Shazam, and TikTok."
    },
    {
      question: "What happens if my song is rejected?",
      answer: "We use a manual approval system, meaning no 'auto-rejections'. If there is an issue with your metadata or audio quality, our team will message you on WhatsApp with specific instructions on how to fix and resubmit it."
    },
    {
      question: "Can I edit my release if I made a mistake?",
      answer: "Yes, you can edit and resubmit your release if we haven't delivered it to stores yet. If it’s already live, you can request a metadata update through the dashboard or by messaging support."
    },
    {
      question: "What kind of support does Gati provide?",
      answer: "We provide direct human support via WhatsApp. No bots, no support tickets, and no slow email delays. You get direct access to our Indian support team 7 days a week."
    },
    {
      question: "How do I withdraw my earnings?",
      answer: "You can request a withdrawal directly through your dashboard using professional UPI or Bank Transfer systems. Payments are typically processed within a few business days of the request."
    },
    {
      question: "Are there song limits on the plans?",
      answer: "Song limits depend on your chosen plan. Our 'Basic' and 'Monthly' plans are perfect for single releases or growing artists, while our 'Yearly' plans offer high-volume distribution for consistent creators."
    },
    {
      question: "Do I keep 100% ownership of my music?",
      answer: "Yes, you keep 100% of your ownership and copyrights. Gati is purely a distribution service. You are giving us the non-exclusive rights to deliver and display your music on platforms, but you remain the owner of your work."
    },
    {
      question: "Can I earn from YouTube if my channel isn't monetized?",
      answer: "Yes! Even if your YouTube channel doesn't meet the monetization threshold, you can earn from 'YouTube Content ID' and 'YouTube Art Tracks' through Gati whenever someone uses your music in a video."
    }
  ];

  // Schema.org FAQ Data
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#f5f5f5] font-sans selection:bg-[#B6FF00] selection:text-black">
      {/* SEO Canonical */}
      <link rel="canonical" href="https://www.gatimusic.in/faq" />
      
      {/* SEO Schema */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Background Decorative Glow */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#B6FF00]/5 filter blur-[120px] rounded-full pointer-events-none -z-10"></div>

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
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 text-[#B6FF00] mb-4">
              <HelpCircle size={20} />
              <span className="font-display uppercase tracking-widest text-xs font-bold font-sans">Support Center</span>
            </div>
            <h1 className="text-4xl md:text-7xl font-display uppercase tracking-tighter mb-4 text-white leading-none">
              FAQs – <span className="text-[#B6FF00]">Gati Music</span>
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-sans">
              Everything you need to know about music distribution India and how to release your song on Spotify and beyond.
            </p>
          </div>

          {/* FAQ Accordion */}
          <div className="bg-[#111]/40 border border-[#222] rounded-3xl p-6 md:p-8 md:backdrop-blur-xl">
            {faqs.map((faq, index) => (
              <FAQAccordionItem 
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === index}
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              />
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Don't see your question? Learn more about our <Link to="/blog" className="text-[#B6FF00] hover:underline">distribution guides</Link> or <Link to="/contact" className="text-[#B6FF00] hover:underline">contact support</Link>.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="p-6 rounded-2xl bg-[#0F0F0F] border border-[#1A1A1A] flex flex-col items-center text-center">
               <TrendingUp className="text-[#B6FF00] mb-4" />
               <h4 className="text-white font-display uppercase text-xs tracking-widest mb-1">80% Royalties</h4>
               <p className="text-gray-500 text-[10px]">Best in class payouts</p>
             </div>
             <div className="p-6 rounded-2xl bg-[#0F0F0F] border border-[#1A1A1A] flex flex-col items-center text-center">
               <Globe2 className="text-[#8B5CF6] mb-4" />
               <h4 className="text-white font-display uppercase text-xs tracking-widest mb-1">Global Reach</h4>
               <p className="text-gray-500 text-[10px]">250+ Digital stores</p>
             </div>
             <div className="p-6 rounded-2xl bg-[#0F0F0F] border border-[#1A1A1A] flex flex-col items-center text-center">
               <ShieldCheck className="text-blue-500 mb-4" />
               <h4 className="text-white font-display uppercase text-xs tracking-widest mb-1">100% Rights</h4>
               <p className="text-gray-500 text-[10px]">You own your music</p>
             </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-20 py-12 md:py-16 px-6 md:px-8 rounded-3xl bg-gradient-to-br from-[#B6FF00]/10 via-[#0A0A0A] to-[#8B5CF6]/10 border border-[#1a1a1a] text-center"
        >
          <h2 className="text-3xl md:text-5xl font-display uppercase tracking-tighter text-white mb-6">
            Still have questions?
          </h2>
          <p className="text-gray-400 mb-10 max-w-xl mx-auto font-sans">
            Our team is available daily on WhatsApp for instant assistance. Contact us if you have any doubts before or after releasing.
          </p>
          <motion.a 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\s+/g, '')}?text=${encodeURIComponent("Hi Gati Team, I have some questions about releasing my music.")}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#B6FF00] text-black px-10 py-5 rounded-full font-display uppercase tracking-widest font-black text-lg shadow-[0_0_40px_rgba(182,255,0,0.3)] transition-all hover:bg-white"
          >
            <MessageCircle /> Support {WHATSAPP_NUMBER}
          </motion.a>
        </motion.section>
      </main>

      <footer className="bg-[#050505] border-t border-[#1a1a1a] py-12 px-6 text-center">
        <p className="text-gray-500 text-xs font-sans uppercase tracking-[0.2em] font-bold">
          © 2026 Gati Music Distribution. Professional Distribution India.
        </p>
      </footer>
    </div>
  );
}
