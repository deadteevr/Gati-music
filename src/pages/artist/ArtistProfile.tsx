import { useState, useEffect } from 'react';
import { Phone, Edit2, Check, X, Key, Mail, Instagram, Youtube, Music, CreditCard, Banknote } from 'lucide-react';
import { updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../../firebase';

export default function ArtistProfile({ user }: { user: any }) {
  const whatsappNumber = "917626841258";
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user.displayName || '');
  const [savingName, setSavingName] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  const [socials, setSocials] = useState({
    instagram: '',
    spotify: '',
    youtube: '',
    bio: ''
  });
  const [payout, setPayout] = useState({
    upiId: '',
    bankName: '',
    accountNumber: '',
    ifscCode: ''
  });
  const [savingExtra, setSavingExtra] = useState(false);

  useEffect(() => {
    const fetchExtra = async () => {
      try {
        const d = await getDoc(doc(db, 'users', user.uid));
        if (d.exists()) {
          const data = d.data();
          setSocials({
            instagram: data.socials?.instagram || '',
            spotify: data.socials?.spotify || '',
            youtube: data.socials?.youtube || '',
            bio: data.socials?.bio || ''
          });
          setPayout({
            upiId: data.payout?.upiId || '',
            bankName: data.payout?.bankName || '',
            accountNumber: data.payout?.accountNumber || '',
            ifscCode: data.payout?.ifscCode || ''
          });
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchExtra();
  }, [user.uid]);

  const handleSaveExtra = async () => {
    setSavingExtra(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        socials,
        payout
      });
      alert("Settings updated successfully.");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setSavingExtra(false);
    }
  };

  const handleSaveName = async () => {
    if (!newName.trim() || newName.trim() === user.displayName) {
      setIsEditingName(false);
      return;
    }
    setSavingName(true);
    try {
      if (user) {
        await updateProfile(user, { displayName: newName.trim() });
        await updateDoc(doc(db, 'users', user.uid), {
          displayName: newName.trim()
        });
      }
      setIsEditingName(false);
      window.location.reload();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setSavingName(false);
    }
  };

  const handlePasswordReset = async () => {
    setSendingReset(true);
    try {
      if (user?.email) {
        await sendPasswordResetEmail(auth, user.email);
        setResetSent(true);
        setTimeout(() => setResetSent(false), 5000);
      }
    } catch (error) {
      console.error("Error sending reset email:", error);
      alert("Failed to send reset email. Please try again later.");
    } finally {
      setSendingReset(false);
    }
  };

  return (
    <div className="max-w-4xl pb-20">
      <div className="mb-10">
        <h1 className="text-4xl font-display uppercase tracking-tighter mb-2">My Profile</h1>
        <p className="text-gray-400 font-sans">Manage your account details, social links, and payout information.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-[#111] p-6 sm:p-8 border border-[#333]">
          <h2 className="text-xl font-display uppercase tracking-widest text-[#ccff00] mb-6 border-b border-[#333] pb-4">Personal Details</h2>
          <div className="space-y-6">
            <div className="flex flex-col">
              <label className="text-xs font-display uppercase tracking-widest text-gray-500 mb-2">Artist Name</label>
              {isEditingName ? (
                <div className="flex items-center gap-2 border-b border-[#ccff00] py-1">
                  <input 
                    type="text" 
                    value={newName} 
                    onChange={(e) => setNewName(e.target.value)}
                    className="bg-transparent text-white font-sans focus:outline-none flex-1"
                    placeholder="Enter new name"
                  />
                  <button onClick={handleSaveName} disabled={savingName} className="text-[#ccff00] hover:text-white transition-colors p-1">
                    <Check size={16} />
                  </button>
                  <button onClick={() => { setIsEditingName(false); setNewName(user.displayName || ''); }} disabled={savingName} className="text-red-500 hover:text-red-400 transition-colors p-1">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="border-b border-[#333] py-2 text-white font-sans flex items-center justify-between">
                  <span>{user.displayName || 'No Name Provided'}</span>
                  <button onClick={() => setIsEditingName(true)} className="text-[#ccff00] flex items-center gap-1 text-xs uppercase tracking-widest font-display font-bold px-2 py-1 bg-[#222] hover:bg-[#333] transition-colors rounded">
                    <Edit2 size={12} /> Edit
                  </button>
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-display uppercase tracking-widest text-gray-500 mb-2">Email Address</label>
              <div className="border-b border-[#333] py-2 text-gray-400 font-sans">{user.email}</div>
            </div>
          </div>
        </div>

        <div className="bg-[#111] p-6 sm:p-8 border border-[#333]">
          <h2 className="text-xl font-display uppercase tracking-widest text-[#ccff00] mb-6 border-b border-[#333] pb-4">Social Links</h2>
          <div className="space-y-4">
            <div className="relative">
               <Instagram className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
               <input 
                 placeholder="Instagram Username"
                 value={socials.instagram}
                 onChange={e => setSocials({...socials, instagram: e.target.value})}
                 className="w-full bg-transparent border-b border-[#333] pl-6 py-2 text-sm text-white focus:outline-none focus:border-[#ccff00]"
               />
            </div>
            <div className="relative">
               <Music className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
               <input 
                 placeholder="Spotify Artist URL"
                 value={socials.spotify}
                 onChange={e => setSocials({...socials, spotify: e.target.value})}
                 className="w-full bg-transparent border-b border-[#333] pl-6 py-2 text-sm text-white focus:outline-none focus:border-[#ccff00]"
               />
            </div>
            <div className="relative">
               <Youtube className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
               <input 
                 placeholder="YouTube Channel URL"
                 value={socials.youtube}
                 onChange={e => setSocials({...socials, youtube: e.target.value})}
                 className="w-full bg-transparent border-b border-[#333] pl-6 py-2 text-sm text-white focus:outline-none focus:border-[#ccff00]"
               />
            </div>
            <textarea 
              placeholder="Short bio..."
              value={socials.bio}
              onChange={e => setSocials({...socials, bio: e.target.value})}
              className="w-full bg-[#1a1a1a] border border-[#333] p-3 text-sm text-white focus:outline-none focus:border-[#ccff00] mt-2 h-20 resize-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-[#111] p-6 sm:p-8 border border-[#333] mb-8">
        <h2 className="text-xl font-display uppercase tracking-widest text-[#ccff00] mb-6 border-b border-[#333] pb-4">Payout Settings</h2>
        <div className="grid md:grid-cols-2 gap-8">
           <div className="space-y-4">
              <div className="flex flex-col gap-2">
                 <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">UPI ID</label>
                 <div className="relative">
                   <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                   <input 
                    placeholder="example@upi"
                    value={payout.upiId}
                    onChange={e => setPayout({...payout, upiId: e.target.value})}
                    className="w-full bg-black border border-[#333] pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#ccff00]"
                   />
                 </div>
              </div>
           </div>
           <div className="space-y-4">
              <div className="flex flex-col gap-2">
                 <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Bank Details</label>
                 <div className="space-y-3">
                   <div className="relative">
                     <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                     <input 
                      placeholder="Bank Name"
                      value={payout.bankName}
                      onChange={e => setPayout({...payout, bankName: e.target.value})}
                      className="w-full bg-black border border-[#333] pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#ccff00]"
                     />
                   </div>
                   <input 
                    placeholder="Account Number"
                    value={payout.accountNumber}
                    onChange={e => setPayout({...payout, accountNumber: e.target.value})}
                    className="w-full bg-black border border-[#333] px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ccff00]"
                   />
                   <input 
                    placeholder="IFSC Code"
                    value={payout.ifscCode}
                    onChange={e => setPayout({...payout, ifscCode: e.target.value})}
                    className="w-full bg-black border border-[#333] px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ccff00]"
                   />
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="flex justify-start mb-12">
        <button 
          onClick={handleSaveExtra}
          disabled={savingExtra}
          className="bg-[#ccff00] text-black px-12 py-4 font-display uppercase font-black tracking-widest text-sm hover:bg-white transition-all disabled:opacity-50"
        >
          {savingExtra ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>

      <div className="bg-[#111] p-6 sm:p-8 border border-[#333]">
        <h2 className="text-xl font-display uppercase tracking-widest text-white mb-6 border-b border-[#333] pb-4">Security & Support</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={handlePasswordReset}
            disabled={sendingReset || resetSent}
            className={`flex-1 flex items-center justify-center gap-2 font-display uppercase tracking-widest font-bold py-4 transition-all text-sm ${
              resetSent 
              ? 'bg-[#ccff00] text-black cursor-default' 
              : 'bg-white text-black hover:bg-[#ccff00]'
            }`}
          >
            {resetSent ? (
              <>
                <Check size={16} /> Link Sent
              </>
            ) : sendingReset ? (
              "Sending..."
            ) : (
              <>
                <Key size={16} /> Password Reset
              </>
            )}
          </button>
          <a 
            href={`https://wa.me/${whatsappNumber}?text=Hi,%20I%20need%20support%20with%20my%20Gati%20account.`}
            target="_blank" rel="noopener noreferrer"
            className="flex-1 bg-transparent border border-white text-white text-center font-display uppercase tracking-widest font-bold py-4 hover:bg-white hover:text-black transition-colors text-sm flex items-center justify-center gap-2"
          >
            <Phone size={16} /> Direct Chat
          </a>
        </div>
      </div>
    </div>
  );
}
