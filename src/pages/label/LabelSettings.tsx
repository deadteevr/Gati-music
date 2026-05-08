import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  Save, 
  Upload, 
  Globe, 
  Mail, 
  Instagram, 
  Twitter,
  Facebook,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  X,
  Plus,
  Trash2,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { doc, getDoc, updateDoc, serverTimestamp, setDoc, collection } from 'firebase/firestore';

export default function LabelSettings({ user, userData }: { user: any, userData: any }) {
  const [labelData, setLabelData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    logoUrl: '',
    contactEmail: '',
    website: '',
    instagram: '',
    twitter: '',
    facebook: '',
    phone: '',
    description: '',
    primaryColor: '#8B5CF6',
    isPublic: true
  });

  useEffect(() => {
    if (!userData.labelId) return;

    const fetchLabel = async () => {
      try {
        const snap = await getDoc(doc(db, 'labels', userData.labelId));
        if (snap.exists()) {
          const data = snap.data();
          setLabelData(data);
          setFormData({
            name: data.name || '',
            logoUrl: data.logoUrl || '',
            contactEmail: data.contactEmail || '',
            website: data.website || '',
            instagram: data.instagram || '',
            twitter: data.twitter || '',
            facebook: data.facebook || '',
            phone: data.phone || '',
            description: data.description || '',
            primaryColor: data.primaryColor || '#8B5CF6',
            isPublic: data.isPublic !== undefined ? data.isPublic : true
          });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, 'labels');
      } finally {
        setLoading(false);
      }
    };

    fetchLabel();
  }, [userData.labelId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      await updateDoc(doc(db, 'labels', userData.labelId), {
        ...formData,
        updatedAt: serverTimestamp()
      });

      // Log activity
      await setDoc(doc(collection(db, 'labels', userData.labelId, 'activity')), {
        type: 'settings_updated',
        description: `updated label brand settings.`,
        actorUid: user.uid,
        actorName: userData.displayName || userData.name,
        createdAt: serverTimestamp()
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'labels');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-[#8B5CF6]" size={40} />
    </div>
  );

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <header className="mb-12">
        <h1 className="text-3xl font-display font-black uppercase tracking-tight">Label <span className="text-[#8B5CF6]">Settings</span></h1>
        <p className="text-gray-500 text-xs uppercase tracking-widest mt-1 font-bold">Customize your public label identity</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-12">
        {/* Basic Brand */}
        <section className="bg-[#111] border border-white/5 rounded-[40px] p-8 md:p-12">
          <h3 className="text-sm uppercase font-display font-black tracking-widest mb-8 text-[#8B5CF6]">Brand Identity</h3>
          
          <div className="grid md:grid-cols-3 gap-10">
            <div className="md:col-span-1">
              <p className="text-xs text-gray-400 leading-relaxed mb-6">Your logo appears on the dashboard and internal reports.</p>
              <div className="relative w-40 h-40 group">
                <div className="w-full h-full bg-black/40 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-gray-500 overflow-hidden relative transition-all group-hover:border-[#8B5CF6]/50">
                  {formData.logoUrl ? (
                    <img src={formData.logoUrl} className="w-full h-full object-cover" alt="Label Logo" />
                  ) : (
                    <>
                      <Building2 size={40} className="mb-4 opacity-20" />
                      <span className="text-[10px] uppercase font-black tracking-widest">No Logo</span>
                    </>
                  )}
                </div>
                <button 
                  type="button" 
                  className="absolute bottom-2 right-2 bg-[#8B5CF6] p-3 rounded-2xl text-white shadow-xl hover:scale-110 active:scale-95 transition-all"
                  onClick={() => {
                    const url = prompt('Enter Logo URL:', formData.logoUrl);
                    if (url !== null) setFormData({...formData, logoUrl: url});
                  }}
                >
                  <Upload size={18} />
                </button>
              </div>

              <div className="mt-8">
                <label className="text-[10px] uppercase tracking-widest font-black text-gray-500 mb-2 block">Brand Color</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="color" 
                    value={formData.primaryColor}
                    onChange={e => setFormData({...formData, primaryColor: e.target.value})}
                    className="w-10 h-10 rounded-lg bg-transparent border-none cursor-pointer"
                  />
                  <span className="text-xs font-mono text-gray-400 uppercase">{formData.primaryColor}</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 space-y-6">
              <div>
                <label className="text-[10px] uppercase tracking-widest font-black text-gray-500 mb-2 block">Label Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-[#8B5CF6] transition-colors"
                  placeholder="The Sound Label"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest font-black text-gray-500 mb-2 block">Label Bio / Description</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-[#8B5CF6] transition-colors min-h-[120px] resize-none"
                  placeholder="Briefly describe your label..."
                />
              </div>
            </div>
          </div>
        </section>

        {/* Contact Info */}
        <section className="bg-[#111] border border-white/5 rounded-[40px] p-8 md:p-12">
          <h3 className="text-sm uppercase font-display font-black tracking-widest mb-8 text-[#8B5CF6]">Public Contact</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-black text-gray-500 block">Support Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                <input 
                  type="email" 
                  value={formData.contactEmail}
                  onChange={e => setFormData({...formData, contactEmail: e.target.value})}
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:border-[#8B5CF6] transition-colors"
                  placeholder="hello@mylabel.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-black text-gray-500 block">Website (Optional)</label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                <input 
                  type="url" 
                  value={formData.website}
                  onChange={e => setFormData({...formData, website: e.target.value})}
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:border-[#8B5CF6] transition-colors"
                  placeholder="https://mylabel.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-black text-gray-500 block">Instagram Username</label>
              <div className="relative">
                <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                <input 
                  type="text" 
                  value={formData.instagram}
                  onChange={e => setFormData({...formData, instagram: e.target.value})}
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:border-[#8B5CF6] transition-colors"
                  placeholder="@mylabel"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-black text-gray-500 block">Twitter / X Handle</label>
              <div className="relative">
                <Twitter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                <input 
                  type="text" 
                  value={formData.twitter}
                  onChange={e => setFormData({...formData, twitter: e.target.value})}
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:border-[#8B5CF6] transition-colors"
                  placeholder="@mylabel"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-black text-gray-500 block">Facebook Page</label>
              <div className="relative">
                <Facebook className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                <input 
                  type="text" 
                  value={formData.facebook}
                  onChange={e => setFormData({...formData, facebook: e.target.value})}
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:border-[#8B5CF6] transition-colors"
                  placeholder="facebook.com/mylabel"
                />
              </div>
            </div>
             <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-black text-gray-500 block">Office Phone</label>
              <div className="relative">
                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                <input 
                  type="text" 
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:border-[#8B5CF6] transition-colors"
                  placeholder="+91 000 000 0000"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Public Profile Settings */}
        <section className="bg-[#111] border border-white/5 rounded-[40px] p-8 md:p-12">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm uppercase font-display font-black tracking-widest text-[#8B5CF6]">Public Visibility</h3>
              <button 
                type="button"
                onClick={() => setFormData({...formData, isPublic: !formData.isPublic})}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] uppercase font-black tracking-widest border transition-all ${
                  formData.isPublic 
                    ? 'bg-[#ccff00]/10 border-[#ccff00]/30 text-[#ccff00]' 
                    : 'bg-red-500/10 border-red-500/30 text-red-500'
                }`}
              >
                {formData.isPublic ? <><Eye size={14} /> Public Profile Active</> : <><EyeOff size={14} /> Hidden from Public</>}
              </button>
           </div>
           <p className="text-xs text-gray-400 mb-6 max-w-2xl">
             When enabled, your label will have a public profile page showing your roster and recent releases. Link this on your social bios to showcase your team.
           </p>
           {formData.isPublic && (
             <div className="p-4 bg-black/40 border border-white/5 rounded-2xl flex items-center justify-between gap-4 overflow-hidden">
               <div className="flex-1 min-w-0">
                 <p className="text-[10px] uppercase font-black tracking-widest text-gray-500 mb-1">Your Public URL</p>
                 <p className="text-xs font-mono text-[#8B5CF6] truncate">https://gatimusic.in/label/{userData.labelId}</p>
               </div>
               <button 
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`https://gatimusic.in/label/${userData.labelId}`);
                  alert('URL copied to clipboard!');
                }}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] uppercase font-black tracking-widest transition-colors shrink-0"
               >
                 Copy
               </button>
             </div>
           )}
        </section>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-1 bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 rounded-3xl p-6">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-[#8B5CF6] rounded-xl flex items-center justify-center text-white">
                <ShieldCheck size={20} />
             </div>
             <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-[#8B5CF6]">Auto-Save Disabled</p>
                <p className="text-xs text-gray-400">Remember to save changes to update your roster visibility.</p>
             </div>
          </div>
          <button 
            type="submit"
            disabled={saving}
            className={`w-full sm:w-auto px-12 py-5 rounded-2xl font-display font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-2 ${
              success 
                ? 'bg-[#ccff00] text-black shadow-lg shadow-[#ccff00]/20' 
                : 'bg-white text-black hover:bg-[#8B5CF6] hover:text-white'
            }`}
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : success ? <><CheckCircle2 size={18} /> Saved</> : <><Save size={18} /> Update Label</>}
          </button>
        </div>
      </form>
    </div>
  );
}
