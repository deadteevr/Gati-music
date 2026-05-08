import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserPlus, Mail, Phone, Instagram, Key, CheckCircle2, Loader2, ArrowRight, ShieldCheck, Globe } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';

export default function RequestAccount() {
  const [formData, setFormData] = useState({
    applicantName: '',
    email: '',
    phone: '',
    instagram: '',
    spotifyLink: '',
    heardFrom: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await addDoc(collection(db, 'requests'), {
        ...formData,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-[#111] border border-[#333] p-10 rounded-2xl shadow-2xl"
        >
          <div className="w-20 h-20 bg-[#ccff00]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-[#ccff00]" />
          </div>
          <h1 className="text-3xl font-display font-black text-white mb-4 tracking-tighter uppercase">Request Received!</h1>
          <p className="text-gray-400 font-sans leading-relaxed mb-8">
            Thank you for your interest in Gati. Our team will review your application and Instagram profile. You'll receive an email once your account is ready.
          </p>
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-[#ccff00] font-display uppercase tracking-widest text-xs font-black hover:text-white transition-colors"
          >
            Return to Homepage <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-purple-900/10 via-black to-black">
      <div className="max-w-xl w-full">
        <div className="mb-10 text-center">
          <Link to="/" className="text-3xl font-display font-black text-[#ccff00] tracking-tighter inline-block mb-4">GATI.</Link>
          <h1 className="text-4xl font-display font-black text-white mb-2 tracking-tighter uppercase leading-none">Request Artist Account</h1>
          <p className="text-gray-500 font-sans text-sm">Join the ecosystem of elite independent artists.</p>
        </div>

        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="bg-[#111] border border-[#333] p-8 md:p-10 rounded-2xl shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 bg-[#ccff00]/5 text-[#ccff00] rounded-bl-2xl">
            <ShieldCheck size={20} />
          </div>

          <div className="space-y-6">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-sans rounded">
                {error}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-display uppercase tracking-widest text-gray-500 font-black">Artist Name</label>
                <div className="relative group">
                  <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#ccff00] transition-colors" size={16} />
                  <input 
                    required
                    value={formData.applicantName}
                    onChange={e => setFormData({...formData, applicantName: e.target.value})}
                    placeholder="e.g. Divine"
                    className="w-full bg-black border border-[#333] text-white pl-10 pr-4 py-3 text-sm focus:border-[#ccff00] outline-none transition-all placeholder:text-gray-700"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-display uppercase tracking-widest text-gray-500 font-black">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#ccff00] transition-colors" size={16} />
                  <input 
                    required
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="rahul@example.com"
                    className="w-full bg-black border border-[#333] text-white pl-10 pr-4 py-3 text-sm focus:border-[#ccff00] outline-none transition-all placeholder:text-gray-700"
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-display uppercase tracking-widest text-gray-500 font-black">Instagram Username</label>
                <div className="relative group">
                  <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#ccff00] transition-colors" size={16} />
                  <input 
                    required
                    value={formData.instagram}
                    onChange={e => setFormData({...formData, instagram: e.target.value})}
                    placeholder="@username"
                    className="w-full bg-black border border-[#333] text-white pl-10 pr-4 py-3 text-sm focus:border-[#ccff00] outline-none transition-all placeholder:text-gray-700"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-display uppercase tracking-widest text-gray-500 font-black">Spotify Artist Link (Optional)</label>
                <div className="relative group">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#ccff00] transition-colors" size={16} />
                  <input 
                    value={formData.spotifyLink}
                    onChange={e => setFormData({...formData, spotifyLink: e.target.value})}
                    placeholder="https://open.spotify.com/artist/..."
                    className="w-full bg-black border border-[#333] text-white pl-10 pr-4 py-3 text-sm focus:border-[#ccff00] outline-none transition-all placeholder:text-gray-700"
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-display uppercase tracking-widest text-gray-500 font-black">Phone Number</label>
                <div className="relative group">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#ccff00] transition-colors" size={16} />
                  <input 
                    required
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    placeholder="+91 00000 00000"
                    className="w-full bg-black border border-[#333] text-white pl-10 pr-4 py-3 text-sm focus:border-[#ccff00] outline-none transition-all placeholder:text-gray-700"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-display uppercase tracking-widest text-[#ccff00] font-black">How did you hear about us? (Optional)</label>
                <div className="relative group">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#ccff00] transition-colors" size={16} />
                  <input 
                    value={formData.heardFrom}
                    onChange={e => setFormData({...formData, heardFrom: e.target.value})}
                    placeholder="e.g. Referral by Rahul"
                    className="w-full bg-black border border-[#333] text-white pl-10 pr-4 py-3 text-sm focus:border-[#ccff00] outline-none transition-all placeholder:text-gray-700"
                  />
                </div>
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full bg-[#ccff00] text-black py-4 font-display uppercase tracking-widest font-black text-xs hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>Submit Request <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </div>
        </motion.form>
        
        <p className="mt-8 text-center text-gray-600 text-[10px] font-display uppercase tracking-widest">
          Already have an account? <Link to="/login" className="text-white hover:text-[#ccff00] transition-colors">Login Here</Link>
        </p>
      </div>
    </div>
  );
}
