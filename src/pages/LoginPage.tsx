import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { loginWithEmail } from '../lib/auth';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await loginWithEmail(email, password);
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError("Invalid credentials. Please check your email and password.");
      } else {
        setError(err.message || "Authentication failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex justify-center items-center px-6 py-12 relative overflow-hidden">
      {/* Background Graphic */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03]">
        <h1 className="text-[30vw] font-display font-black uppercase text-[#ccff00] tracking-tighter">GATI</h1>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-[#0a0a0a] border border-[#333] p-8 md:p-12 z-10"
      >
        <Link to="/" className="text-4xl font-display font-black text-[#ccff00] tracking-tighter block mb-10">
          GATI.
        </Link>
        
        <h2 className="text-3xl font-display uppercase tracking-tight text-white mb-2">
          DASHBOARD ACCESS
        </h2>
        <p className="text-gray-400 text-base mb-10 font-sans border-b border-[#333] pb-8">
          Access your artist dashboard to upload songs, track releases, and manage royalties.
        </p>

        <div className="mb-8 font-sans">
          <h3 className="text-xl font-display text-white mb-2 tracking-wide uppercase">🔐 LOGIN</h3>
          <p className="text-sm text-gray-500 mb-6 italic">
            Enter your credentials to continue.
          </p>
          
          {error && <div className="bg-red-500/10 border border-red-500 text-red-500 text-sm p-4 mb-6">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input 
              type="email" 
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#111] border border-[#333] p-4 text-white focus:outline-none focus:border-[#ccff00] transition-colors"
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[#111] border border-[#333] p-4 text-white focus:outline-none focus:border-[#ccff00] transition-colors"
            />
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#ccff00] text-black font-display uppercase tracking-widest font-bold py-4 mt-2 hover:bg-white transition-colors disabled:opacity-50"
            >
              {loading ? "AUTHENTICATING..." : "LOGIN"}
            </button>
          </form>
        </div>

        <div className="mt-10 pt-10 border-t border-[#333]">
          <h4 className="text-lg font-display uppercase text-white mb-4 tracking-wide">⚡ How it works:</h4>
          <ol className="text-sm text-gray-400 font-sans space-y-3 mb-8 ml-4 list-decimal marker:text-gray-600">
            <li>Choose a plan from website</li>
            <li>Message us on WhatsApp</li>
            <li>Complete payment</li>
            <li>Get your dashboard login</li>
            <li>Start uploading your music</li>
          </ol>
          <p className="text-sm text-gray-500 font-sans italic">
            Need help? Contact us directly on WhatsApp.
          </p>
        </div>

      </motion.div>
    </div>
  );
}
