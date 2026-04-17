import { useState } from 'react';
import { Phone, Edit2, Check, X } from 'lucide-react';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';

export default function ArtistProfile({ user }: { user: any }) {
  const whatsappNumber = "917626841258";
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user.displayName || '');
  const [savingName, setSavingName] = useState(false);

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

  return (
    <div className="max-w-3xl pb-20">
      <div className="mb-10">
        <h1 className="text-4xl font-display uppercase tracking-tighter mb-2">My Profile</h1>
        <p className="text-gray-400 font-sans">Manage your account details and subscription plan.</p>
      </div>

      <div className="space-y-8">
        <div className="bg-[#111] p-6 sm:p-8 border border-[#333]">
          <h2 className="text-xl font-display uppercase tracking-widest text-[#ccff00] mb-6 border-b border-[#333] pb-4">Personal Details</h2>
          <div className="grid md:grid-cols-2 gap-6">
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
          <h2 className="text-xl font-display uppercase tracking-widest text-[#ccff00] mb-6 border-b border-[#333] pb-4">Plan Details</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className="text-xs font-display uppercase tracking-widest text-gray-500 mb-2">Current Plan</label>
              <div className="border-b border-[#333] py-2 text-[#ccff00] font-sans font-bold uppercase tracking-wider">Premium Distribution</div>
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-display uppercase tracking-widest text-gray-500 mb-2">Status</label>
              <div className="border-b border-[#333] py-2 text-white font-sans uppercase">Active</div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-6 font-sans">Note: Gati plans are currently managed manually via WhatsApp. For upgrades or changes, please contact support.</p>
        </div>

        <div className="bg-[#111] p-6 sm:p-8 border border-[#333]">
          <h2 className="text-xl font-display uppercase tracking-widest text-white mb-6 border-b border-[#333] pb-4">Account Actions</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <a 
              href={`https://wa.me/${whatsappNumber}?text=Hi,%20I%20would%20like%20to%20change%20the%20account%20password%20for%20${user.displayName || user.email}.`}
              target="_blank" rel="noopener noreferrer"
              className="flex-1 bg-white text-black text-center font-display uppercase tracking-widest font-bold py-4 hover:bg-gray-200 transition-colors text-sm"
            >
              Change Password
            </a>
            <a 
              href={`https://wa.me/${whatsappNumber}?text=Hi,%20I%20need%20support%20with%20my%20Gati%20account.`}
              target="_blank" rel="noopener noreferrer"
              className="flex-1 bg-transparent border border-white text-white text-center font-display uppercase tracking-widest font-bold py-4 hover:bg-white hover:text-black transition-colors text-sm flex items-center justify-center gap-2"
            >
              <Phone size={16} /> Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
