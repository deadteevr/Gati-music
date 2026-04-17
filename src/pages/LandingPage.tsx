import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Headphones, Music, Zap } from 'lucide-react';

const WHATSAPP_NUMBER = "917626841258";

function WhatsAppCheckout({ plan, amount }: { plan: string; amount: string }) {
  const text = encodeURIComponent(`Hi, I want to purchase ${plan} (₹${amount}).`);
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
  
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className="block w-full py-4 text-center font-display font-bold uppercase tracking-widest text-[#050505] transition-colors hover:bg-white bg-[#ccff00]"
    >
      Purchase via WhatsApp
    </a>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-[#f5f5f5] overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full p-6 flex justify-between items-center z-50 mix-blend-difference">
        <div className="text-3xl font-display font-black tracking-tighter text-[#ccff00]">GATI.</div>
        <Link to="/login" className="px-6 py-2 border-2 border-[#ccff00] text-[#ccff00] hover:bg-[#ccff00] hover:text-[#050505] font-display font-bold tracking-widest uppercase text-xs transition-colors">
          Artist Login
        </Link>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-40 pb-20 px-6 sm:px-12 md:px-24 flex flex-col justify-center items-start min-h-[90vh]">
        <motion.div 
          initial={{ opacity: 0, y: 50, skewX: -5 }} animate={{ opacity: 1, y: 0, skewX: -5 }} transition={{ duration: 0.6 }}
          className="mb-6 inline-block bg-[#ccff00] text-[#050505] px-4 py-2 font-bold font-display uppercase tracking-widest text-sm"
        >
          For the Artist, By the Artists
        </motion.div>
        
        <motion.h1 
          className="text-[12vw] sm:text-[10vw] leading-[0.85] font-display uppercase tracking-tighter mb-8"
          initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
        >
          Release.<br/>
          <span className="text-transparent stroke-text" style={{ WebkitTextStroke: "2px #ccff00" }}>Worldwide.</span><br/>
          <span className="text-[#9d4edd]">Fast.</span>
        </motion.h1>

        <motion.div className="max-w-xl text-lg sm:text-xl font-sans text-gray-400 mb-12"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.4 }}
        >
          <p className="mb-2 text-white">Gati is a fast and artist-first music distribution service.</p>
          <p>We deliver your music worldwide with speed, accuracy, and real human support.</p>
        </motion.div>

        <motion.a 
          href="#pricing"
          className="flex items-center gap-4 bg-white text-[#050505] px-10 py-5 font-display font-bold text-xl uppercase tracking-wider hover:bg-[#ccff00] transition-colors"
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.6 }}
        >
          Start Releasing Now <ArrowRight size={24} />
        </motion.a>
      </header>

      {/* Features / Why Choose Us */}
      <section className="py-24 px-6 md:px-24 bg-[#1a1a1a] border-t border-[#333]">
        <div className="grid md:grid-cols-2 gap-16">
          <div>
            <h2 className="text-6xl md:text-8xl font-display uppercase tracking-tighter mb-8 text-[#ccff00]">Why<br/>Gati?</h2>
            <p className="text-xl text-gray-400">Best choice in the music distribution industry. Built for speed, trust, and artist growth.</p>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-8">
            <Feature 
              icon={<Headphones className="text-[#9d4edd]" size={32} />}
              title="250+ Platforms" 
              desc="Get on Spotify, Apple Music, and globally recognized audio/video platforms instantly."
            />
            <Feature 
              icon={<Zap className="text-[#ccff00]" size={32} />}
              title="Budget Friendly" 
              desc="One of the most budget-friendly services in India without compromising support."
            />
            <Feature 
              icon={<Music className="text-white" size={32} />}
              title="Monetization" 
              desc="YouTube monetization even without channel monetization. Earn from Insta, FB, Snap."
            />
            <Feature 
              icon={<CheckCircle2 className="text-[#ccff00]" size={32} />}
              title="Direct WhatsApp" 
              desc="Real human chat & call support. No Emails - No Lafda."
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 md:px-24">
        <h2 className="text-5xl md:text-7xl font-display uppercase font-bold text-center tracking-tighter mb-20 text-white">Choose Your Plan</h2>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Plan 1 */}
          <PricingCard 
            title="Basic"
            price="75"
            period="/ song"
            desc="Perfect for beginners who want to release single tracks quickly."
            features={[
              "Upload to Spotify, Apple, YT & 250+",
              "80% royalties to artist",
              "Delivery in 2–3 days",
              "YouTube Content ID",
              "Metadata + cover checking",
              "Free 1 re-upload (if error)",
              "WhatsApp chat support"
            ]}
          />

          {/* Plan 2 */}
          <PricingCard 
            title="Monthly"
            price="199"
            period="/ month"
            desc="Best for active artists releasing music regularly."
            highlight
            features={[
              "Unlimited uploads (30 days)",
              "80% royalties to artist",
              "Distribution to 250+ platforms",
              "YouTube Content ID + Insta/Snap",
              "Verified Artist YT & Spotify",
              "Artist Dashboard access",
              "Monthly royalty report",
              "Fast priority support (<2 hr)",
              "Release scheduling"
            ]}
          />

          {/* Plan 3 */}
          <PricingCard 
            title="Yearly"
            price="999"
            period="/ year"
            subtext="(≈ ₹80/month)"
            desc="Best value for serious artists building long-term presence."
            features={[
              "Unlimited releases for 12 months",
              "80% royalties to artist",
              "All Monthly features included",
              "Custom release strategy",
              "Featured artist promotion",
              "Early promo opportunities"
            ]}
          />
        </div>
      </section>

      {/* Auth Callout */}
      <section className="py-24 px-6 text-center border-t border-[#333] bg-[#050505]">
        <h2 className="text-4xl font-display uppercase tracking-tight mb-8">Already an Artist?</h2>
        <a 
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi,%20I%20want%20to%20request%20dashboard%20access.`}
          target="_blank" rel="noopener noreferrer"
          className="inline-block px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-black font-display uppercase tracking-widest font-bold transition-all"
        >
          Request Dashboard Access
        </a>
      </section>
    </div>
  );
}

function Feature({ title, desc, icon }: { title: string, desc: string, icon: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 p-6 border border-[#333] hover:border-[#ccff00] transition-colors">
      <div>{icon}</div>
      <h3 className="text-xl font-display uppercase tracking-tight text-white">{title}</h3>
      <p className="text-sm text-gray-400 font-sans">{desc}</p>
    </div>
  );
}

function PricingCard({ title, price, period, subtext, desc, features, highlight = false }: any) {
  return (
    <div className={`p-8 border-2 flex flex-col ${highlight ? 'border-[#ccff00] bg-[#0a0a0a]' : 'border-[#333] bg-[#111]'}`}>
      <h3 className={`text-4xl font-display uppercase tracking-tighter mb-4 ${highlight ? 'text-[#ccff00]' : 'text-white'}`}>{title}</h3>
      <div className="mb-4">
        <span className="text-5xl font-display font-medium">₹{price}</span>
        <span className="text-lg text-gray-400 font-sans ml-2">{period}</span>
        {subtext && <div className="text-sm text-[#ccff00] font-sans mt-1">{subtext}</div>}
      </div>
      <p className="text-sm text-gray-400 font-sans mb-8 min-h-[40px] border-b border-[#333] pb-6">{desc}</p>
      
      <ul className="flex flex-col gap-4 mb-10 flex-grow font-sans text-sm text-gray-300">
        {features.map((f: string, i: number) => (
          <li key={i} className="flex gap-3 items-start">
            <CheckCircle2 size={16} className={highlight ? "text-[#ccff00] shrink-0 mt-0.5" : "text-gray-500 shrink-0 mt-0.5"} />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <WhatsAppCheckout plan={title.toUpperCase()} amount={price} />
    </div>
  );
}
