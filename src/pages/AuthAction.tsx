import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { auth } from '../firebase';
import { applyActionCode, verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { motion } from 'motion/react';
import { CheckCircle2, AlertCircle, Loader2, Key, Mail, ArrowRight } from 'lucide-react';

export default function AuthAction() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'reset-form'>('loading');
  const [message, setMessage] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const mode = searchParams.get('mode');
  const oobCode = searchParams.get('oobCode');

  useEffect(() => {
    if (!oobCode || !mode) {
      setStatus('error');
      setMessage('Invalid or expired link. Please request a new one.');
      return;
    }

    const handleAction = async () => {
      try {
        if (mode === 'verifyEmail') {
          await applyActionCode(auth, oobCode);
          setStatus('success');
          setMessage('Email verified successfully! You can now access all features.');
        } else if (mode === 'resetPassword') {
          const email = await verifyPasswordResetCode(auth, oobCode);
          setStatus('reset-form');
          setMessage(`Resetting password for ${email}`);
        } else {
          setStatus('error');
          setMessage('Unsupported action.');
        }
      } catch (error: any) {
        console.error("Auth action error:", error);
        setStatus('error');
        setMessage(error.message || 'Action failed. The link may have expired.');
      }
    };

    handleAction();
  }, [oobCode, mode]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }
    if (!oobCode) return;

    setStatus('loading');
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setStatus('success');
      setMessage('Password reset successful! You can now login with your new password.');
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'Failed to reset password.');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-[#111] border border-[#222] p-10 rounded-2xl text-center"
      >
        <Link to="/" className="inline-block mb-10 text-2xl font-display font-black text-[#ccff00] tracking-tighter uppercase italic">
          GATI<span className="text-white">.</span>
        </Link>

        {status === 'loading' && (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 text-[#ccff00] animate-spin mx-auto" />
            <h2 className="text-xl font-display uppercase tracking-widest text-white">Processing...</h2>
            <p className="text-gray-500 text-sm">Please wait while we verify your request.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6">
            <CheckCircle2 className="w-16 h-16 text-[#ccff00] mx-auto" />
            <h2 className="text-xl font-display uppercase tracking-widest text-white">Success!</h2>
            <p className="text-gray-400 text-sm leading-relaxed">{message}</p>
            <Link 
              to="/login"
              className="mt-6 w-full py-4 bg-[#ccff00] text-black font-display font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-white transition-colors"
            >
              Login to Gati Music <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
            <h2 className="text-xl font-display uppercase tracking-widest text-white">Link Invalid</h2>
            <p className="text-gray-400 text-sm leading-relaxed">{message}</p>
            <Link 
              to="/login"
              className="mt-6 w-full py-4 bg-[#222] text-white font-display font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-white hover:text-black transition-colors"
            >
              Back to Login
            </Link>
          </div>
        )}

        {status === 'reset-form' && (
          <div className="space-y-6 text-left">
            <div className="text-center mb-6">
              <Key className="w-12 h-12 text-[#ccff00] mx-auto mb-4" />
              <h2 className="text-xl font-display uppercase tracking-widest text-white">Secure New Password</h2>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">{message}</p>
            </div>
            
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-display uppercase tracking-widest text-gray-500 font-black">New Password</label>
                <div className="relative group">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#ccff00] transition-colors" size={16} />
                  <input 
                    required
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-black border border-[#222] text-white pl-10 pr-4 py-3 text-sm focus:border-[#ccff00] outline-none transition-all placeholder:text-gray-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-display uppercase tracking-widest text-gray-500 font-black">Confirm Password</label>
                <div className="relative group">
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#ccff00] transition-colors" size={16} />
                  <input 
                    required
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-black border border-[#222] text-white pl-10 pr-4 py-3 text-sm focus:border-[#ccff00] outline-none transition-all placeholder:text-gray-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-[#ccff00] text-black font-display font-black uppercase text-xs tracking-widest mt-4 hover:bg-white transition-colors"
              >
                Update Password
              </button>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function ShieldCheck({ size, className }: { size: number, className: string }) {
  return (
    <svg 
      width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="m9 12 2 2 4-4" />
    </svg>
  );
}
