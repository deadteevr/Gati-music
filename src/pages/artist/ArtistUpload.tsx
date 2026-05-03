import { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage, auth, handleFirestoreError, OperationType } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { Plus, X, CheckCircle, CheckCircle2, Sparkles, ShieldAlert, Mail } from 'lucide-react';
import { geminiService } from '../../services/geminiService';
import { AIActionButton } from '../../components/AIComponents';
import PremiumLoader from '../../components/PremiumLoader';

import { getRemainingDays, isPlanActive } from '../../lib/planUtils';

import { sendEmailVerification } from 'firebase/auth';

import { useGlobalError } from '../../components/ErrorProvider';

export default function ArtistUpload({ user, userData }: { user: any, userData: any }) {
  const navigate = useNavigate();
  const { showError } = useGlobalError();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | undefined>(undefined);
  
  const isSubscribed = isPlanActive(userData?.subscription);
  const isEmailVerified = user?.emailVerified;
  const daysLeft = getRemainingDays(userData?.subscription?.expiryDate);

  const [uploadMessage, setUploadMessage] = useState("");
  const [error, setError] = useState("");
  const [audioError, setAudioError] = useState("");
  const [coverError, setCoverError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    mainArtist: "",
    featuringArtists: "",
    labelName: "",
    pLine: "",
    cLine: "",
    lyricist: "",
    producer: "",
    producerSpotify: "",
    otherCredits: "",
    scheduleDate: "",
    mainSpotifyLink: "",
    featureSpotifyLinks: "",
    excludedPlatforms: "",
    audioUrl: "", 
    coverUrl: ""
  });

  interface Contributor {
    name: string;
    role: string;
    spotify: string;
  }

  const [additionalArtists, setAdditionalArtists] = useState<Contributor[]>([]);
  const [audioInputType, setAudioInputType] = useState('file'); // 'file' or 'link'
  const [coverInputType, setCoverInputType] = useState('file'); // 'file' or 'link'
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [audioProgress, setAudioProgress] = useState(-1);
  const [coverProgress, setCoverProgress] = useState(-1);
  const [audioStatus, setAudioStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [coverStatus, setCoverStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

  const [processingAI, setProcessingAI] = useState(false);
  const [rawCredits, setRawCredits] = useState("");
  const [showAIInput, setShowAIInput] = useState(false);

  const [resendingVerification, setResendingVerification] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleResendVerification = async () => {
    if (!user) return;
    setResendingVerification(true);
    setResendSuccess(false);
    setError("");
    try {
      await sendEmailVerification(user);
      setResendSuccess(true);
    } catch (err: any) {
      console.error("Resend error:", err);
      if (err.code === 'auth/too-many-requests') {
        setError("Too many requests. Please wait a few minutes before trying again.");
      } else {
        setError("Failed to send verification email: " + err.message);
      }
    } finally {
      setResendingVerification(false);
    }
  };

  const handleManualVerifyCheck = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await user.reload();
      // Force refresh the token to get the updated custom claims (specifically email_verified)
      await user.getIdToken(true);
      window.location.reload();
    } catch (err: any) {
      console.error("Verification check error:", err);
      window.location.reload();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading) return;

    if (audioStatus === 'uploading' || coverStatus === 'uploading') {
      setUploadMessage("Uploading assets...");
      const parts = [];
      if (audioProgress >= 0) parts.push(audioProgress);
      if (coverProgress >= 0) parts.push(coverProgress);
      
      if (parts.length > 0) {
        const avg = parts.reduce((a, b) => a + b, 0) / parts.length;
        setUploadProgress(avg);
      }
    } else if (audioStatus === 'success' && coverStatus === 'success') {
      setUploadProgress(95);
      setUploadMessage("Finalizing submission...");
    } else if (audioStatus === 'error' || coverStatus === 'error') {
      setUploadMessage("Upload failed.");
      setUploadProgress(undefined);
    }
  }, [audioProgress, coverProgress, audioStatus, coverStatus, loading]);

  const handleMagicFill = async () => {
    if (!rawCredits.trim()) return;
    setProcessingAI(true);
    try {
      const formatted = await geminiService.formatCredits(rawCredits);
      setFormData(prev => ({
        ...prev,
        mainArtist: formatted.artist || prev.mainArtist,
        featuringArtists: formatted.featuring || prev.featuringArtists,
        producer: formatted.producer || prev.producer,
        lyricist: formatted.lyricist || prev.lyricist,
        otherCredits: formatted.mixing || formatted.mastering 
          ? `Mixing: ${formatted.mixing || 'N/A'}, Mastering: ${formatted.mastering || 'N/A'}`
          : prev.otherCredits
      }));
      setShowAIInput(false);
    } catch (err) {
      console.error("AI Formatting error:", err);
    } finally {
      setProcessingAI(false);
    }
  };

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addArtistField = () => {
    setAdditionalArtists([...additionalArtists, { name: "", role: "Singer", spotify: "" }]);
  };

  const updateAdditionalArtist = (index: number, field: keyof Contributor, value: string) => {
    const newArtists = [...additionalArtists];
    newArtists[index] = { ...newArtists[index], [field]: value };
    setAdditionalArtists(newArtists);
  };

  const removeAdditionalArtist = (index: number) => {
    const newArtists = additionalArtists.filter((_, i) => i !== index);
    setAdditionalArtists(newArtists);
  };

  const validateAudioFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['mp3', 'm4a', 'wav'].includes(ext || '')) {
      throw new Error("Invalid audio format! Please upload an MP3, M4A, or WAV file.");
    }
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      throw new Error("Audio file size exceeds the 100MB limit. Please upload a smaller file or provide a link.");
    }
  };

  const validateCoverFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['png', 'jpg', 'jpeg', 'pdf'].includes(ext || '')) {
      throw new Error("Invalid cover format! Please upload a PNG, JPG, JPEG, or PDF file.");
    }
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error("Cover art file size exceeds the 10MB limit. Please upload a smaller file or provide a link.");
    }
  };

  const isValidUrl = (url: string) => {
    return /^https?:\/\/.+/.test(url.trim());
  };

  const isValidSpotifyUrl = (url: string) => {
    if (!url.trim()) return true; // Optional allows empty
    return /^https?:\/\/(open|play)\.spotify\.com\/(artist|track|album|playlist)\/.+/.test(url.trim().split('?')[0]);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setUploadProgress(0);
    setUploadMessage("Validating form...");
    setError("");
    setAudioProgress(-1);
    setCoverProgress(-1);
    
    console.log("Upload process initiated...");

    try {
      if (!formData.title || !formData.mainArtist || !formData.pLine || !formData.cLine) {
        throw new Error("Please fill all required text fields (Title, Artist, P Line, C Line).");
      }

      // Validate Spotify Links
      if (formData.mainSpotifyLink && !isValidSpotifyUrl(formData.mainSpotifyLink)) throw new Error("Invalid Main Artist Spotify Link.");
      if (formData.producerSpotify && !isValidSpotifyUrl(formData.producerSpotify)) throw new Error("Invalid Producer Spotify Link.");
      
      additionalArtists.forEach((a, i) => {
        if (!a.name.trim()) throw new Error(`Artist name required for entry #${i + 1}`);
        if (!a.role.trim()) throw new Error(`Role required for artist entry #${i + 1}`);
        if (a.spotify && !isValidSpotifyUrl(a.spotify)) throw new Error(`Invalid Spotify link for artist ${a.name}`);
      });

      let finalAudioUrl = formData.audioUrl;
      let finalCoverUrl = formData.coverUrl;

      if (audioInputType === 'file') {
        if (!audioFile) throw new Error("Please upload an audio file or provide a link.");
        validateAudioFile(audioFile);
      } else {
        if (!isValidUrl(finalAudioUrl)) throw new Error("Please provide a valid, publicly accessible URL for your audio.");
      }

      // Validate Cover
      if (coverInputType === 'file') {
        if (!coverFile) throw new Error("Please upload a cover art file or provide a link.");
        validateCoverFile(coverFile);
      } else {
        if (!isValidUrl(finalCoverUrl)) throw new Error("Please provide a valid, publicly accessible URL for your cover artwork.");
      }

      // Upload Function (Cloudinary vs Firebase)
      const uploadToCloudinary = async (file: File, type: 'audio' | 'image', setProgress: (p: number) => void, setStatus: (s: any) => void) => {
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

        if (!cloudName || !uploadPreset) {
          throw new Error("Cloudinary not configured correctly. Please check VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.");
        }

        console.log(`Starting Cloudinary upload for ${type}...`);
        setStatus('uploading');
        setProgress(0); // Ensure it starts at 0

        const formDataCloud = new FormData();
        formDataCloud.append('file', file);
        formDataCloud.append('upload_preset', uploadPreset);
        formDataCloud.append('folder', `gati/${auth.currentUser?.uid}`);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`);

        return new Promise<string>((resolve, reject) => {
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const percent = (e.loaded / e.total) * 100;
              console.log(`${type} upload progress: ${Math.round(percent)}%`);
              setProgress(percent);
            }
          };

          xhr.onload = () => {
            if (xhr.status === 200) {
              const res = JSON.parse(xhr.responseText);
              console.log(`${type} upload success: ${res.secure_url}`);
              setStatus('success');
              resolve(res.secure_url);
            } else {
              console.error(`${type} upload failed status ${xhr.status}:`, xhr.responseText);
              setStatus('error');
              reject(new Error(`Cloudinary Error (${xhr.status}): ${xhr.responseText}`));
            }
          };

          xhr.onerror = (err) => {
            console.error(`${type} upload network error:`, err);
            setStatus('error');
            reject(new Error('Network Error during Cloudinary upload'));
          };

          xhr.send(formDataCloud);
        });
      };

      const uploadToFirebase = (file: File, path: string, setProgress: (p: number) => void, setStatus: (s: any) => void, type: string) => {
        console.log(`Starting Firebase Storage upload for ${type} at path: ${path}`);
        const storageRef = ref(storage, path);
        const uploadTask = uploadBytesResumable(storageRef, file);
        setStatus('uploading');
        setProgress(0); // Ensure it starts at 0

        return new Promise<string>((resolve, reject) => {
          uploadTask.on('state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              console.log(`${type} upload progress: ${Math.round(progress)}%`);
              setProgress(progress);
            },
            (error) => {
              console.error(`${type} upload error:`, error);
              setStatus('error');
              reject(error);
            },
            async () => {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              console.log(`${type} upload success: ${url}`);
              setStatus('success');
              resolve(url);
            }
          );
        });
      };

      // Execute Uploads in Parallel
      const useCloudinary = !!import.meta.env.VITE_CLOUDINARY_CLOUD_NAME && import.meta.env.VITE_CLOUDINARY_CLOUD_NAME !== "MY_CLOUD_NAME";
      const uploadPromises: Promise<any>[] = [];

      if (audioInputType === 'file' && audioFile) {
        if (useCloudinary) {
          uploadPromises.push(uploadToCloudinary(audioFile, 'audio', setAudioProgress, setAudioStatus).then(url => finalAudioUrl = url));
        } else {
          const path = `uploads/${user.uid}/audio_${Date.now()}_${audioFile.name.replace(/\s+/g, '_')}`;
          uploadPromises.push(uploadToFirebase(audioFile, path, setAudioProgress, setAudioStatus, 'audio').then(url => finalAudioUrl = url));
        }
      }

      if (coverInputType === 'file' && coverFile) {
        if (useCloudinary) {
          uploadPromises.push(uploadToCloudinary(coverFile, 'image', setCoverProgress, setCoverStatus).then(url => finalCoverUrl = url));
        } else {
          const path = `uploads/${user.uid}/cover_${Date.now()}_${coverFile.name.replace(/\s+/g, '_')}`;
          uploadPromises.push(uploadToFirebase(coverFile, path, setCoverProgress, setCoverStatus, 'image').then(url => finalCoverUrl = url));
        }
      }

      if (uploadPromises.length > 0) {
        setUploadMessage("Uploading assets...");
        await Promise.all(uploadPromises);
      }

      
      console.log("All uploads finished. Saving metadata to Firestore...");

      try {
        await addDoc(collection(db, 'submissions'), {
          uid: user.uid,
          title: formData.title,
          mainArtist: formData.mainArtist,
          featuringArtists: formData.featuringArtists.split(',').map(s => s.trim()).filter(Boolean),
          additionalContributors: additionalArtists,
          labelName: formData.labelName,
          pLine: formData.pLine,
          cLine: formData.cLine,
          lyricist: formData.lyricist,
          producer: formData.producer,
          producerSpotify: formData.producerSpotify,
          otherCredits: formData.otherCredits,
          scheduleDate: formData.scheduleDate,
          mainSpotifyLink: formData.mainSpotifyLink,
          featureSpotifyLinks: formData.featureSpotifyLinks,
          excludedPlatforms: formData.excludedPlatforms,
          audioUrl: finalAudioUrl,
          coverUrl: finalCoverUrl,
          status: "Reviewing",
          createdAt: new Date().toISOString(),
        });
      } catch (err: any) {
        handleFirestoreError(err, OperationType.CREATE, 'submissions', false);
        throw err;
      }

      // Update User Upload Count & Expiry Logic
      try {
        const newUploadCount = (userData.subscription?.uploadCount || 0) + 1;
        const isBasic = userData.subscription?.planType === 'Basic';
        const shouldExpire = isBasic && newUploadCount >= 1;

        await updateDoc(doc(db, 'users', user.uid), {
          'subscription.uploadCount': newUploadCount,
          'subscription.status': shouldExpire ? 'Expired' : userData.subscription?.status
        });
      } catch (err: any) {
        handleFirestoreError(err, OperationType.UPDATE, 'users', false);
        // We don't necessarily want to fail the whole submission if just the count fails, 
        // but it's important for the business logic.
        throw err;
      }

      // Log Activity
      try {
        await addDoc(collection(db, 'activity_logs'), {
          uid: user.uid,
          type: 'song_uploaded',
          message: `Uploaded new release: ${formData.title}`,
          timestamp: new Date().toISOString()
        });
      } catch (err: any) {
        handleFirestoreError(err, OperationType.CREATE, 'activity_logs', false);
        // Non-critical
      }
      
      console.log("Submission successful!");
      // Show Success screen
      setSuccess(true);
      
    } catch (err: any) {
      console.error("Submission error:", err);
      let message = "Failed to submit release.";
      
      if (err.code?.startsWith('storage/')) {
        message = "Firebase Storage Error: " + err.message;
      } else if (err.message && err.message.startsWith('{')) {
        try {
          const parsed = JSON.parse(err.message);
          message = parsed.userFriendlyMessage || `Database Error: ${parsed.error}`;
        } catch {
          message = err.message;
        }
      } else if (err.message?.includes('Missing or insufficient permissions')) {
        message = "Permission Denied: Ensure you are logged in and have permission to upload.";
      } else {
        message = err.message || "Failed to submit release.";
      }

      showError(message, () => handleSubmit(e));
    } finally {
      setLoading(false);
      // Don't reset progress here so user can see it's 100% on success/error screens if needed
      // Or at least delay it.
    }
  };

  const getButtonText = () => {
    if (!loading) return "Submit Release";
    if (audioStatus === 'uploading' || coverStatus === 'uploading') {
      const activeProgress = [];
      if (audioProgress >= 0) activeProgress.push(audioProgress);
      if (coverProgress >= 0) activeProgress.push(coverProgress);
      const avgProgress = activeProgress.length > 0 
        ? Math.round(activeProgress.reduce((a, b) => a + b, 0) / activeProgress.length) 
        : 0;
      return `Uploading (${avgProgress}%)`;
    }
    if (audioStatus === 'success' || coverStatus === 'success') {
      return "Processing...";
    }
    return "Submitting...";
  };

  if (success) {
    return (
      <div className="max-w-3xl pb-20 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-[#ccff00]/20 text-[#ccff00] rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={40} />
        </div>
        <h1 className="text-3xl lg:text-4xl font-display uppercase tracking-tighter mb-4 text-white">Release Submitted!</h1>
        <p className="text-gray-400 font-sans text-lg mb-8 max-w-lg">
          Your song has been submitted for review. It usually takes 6-8 hours to be reviewed and processed.
        </p>
        <button 
          onClick={() => navigate('/dashboard/status')}
          className="bg-white text-black font-display font-bold px-8 py-4 uppercase tracking-widest hover:bg-[#ccff00] transition-colors"
        >
          View My Songs
        </button>
      </div>
    );
  }

  if (!isSubscribed) {
    return (
      <div className="max-w-3xl pb-20 flex flex-col items-center justify-center min-h-[60vh] text-center bg-[#111] border border-[#333] p-10">
        <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
          <ShieldAlert size={40} />
        </div>
        <h1 className="text-3xl font-display uppercase tracking-tighter mb-4 text-white">Uploads Locked</h1>
        <p className="text-gray-400 font-sans text-lg mb-8 max-w-lg">
          {userData?.subscription?.status === 'Expired' 
            ? "Your subscription has expired. Please renew to continue releasing music."
            : "You are currently on the Free plan. Upgrade to a distribution plan to upload your tracks to streaming platforms."
          }
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={() => navigate('/pricing')}
            className="bg-[#ccff00] text-black font-display font-bold px-10 py-4 uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_20px_rgba(204,255,0,0.2)]"
          >
            Check Plans
          </button>
          <a 
            href="https://wa.me/917626841258?text=Hi,%20I%20want%20to%20upgrade%20my%20Gati%20plan." 
            target="_blank" rel="noopener noreferrer"
            className="border border-white text-white font-display font-bold px-10 py-4 uppercase tracking-widest hover:bg-white hover:text-black transition-all"
          >
            Contact Support
          </a>
        </div>
      </div>
    );
  }

  if (!isEmailVerified) {
    return (
      <div className="max-w-3xl pb-20 flex flex-col items-center justify-center min-h-[60vh] text-center bg-[#111] border border-[#333] p-10">
        <div className="w-20 h-20 bg-yellow-500/10 text-yellow-500 rounded-full flex items-center justify-center mb-6 border border-yellow-500/20">
          <ShieldAlert size={40} />
        </div>
        <h1 className="text-3xl font-display uppercase tracking-tighter mb-4 text-white">Verification Required</h1>
        <p className="text-gray-400 font-sans text-lg mb-8 max-w-lg">
          Your email address (<span className="text-white">{user?.email}</span>) is not verified. 
          For security reasons, distribution is locked until you verify your account.
        </p>
        
        {resendSuccess && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-4 mb-6 rounded flex items-center gap-3">
            <Mail size={20} />
            <p className="text-sm font-sans">Verification email sent! Please check your inbox.</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 mb-6 rounded">
            <p className="text-sm font-sans">{error}</p>
          </div>
        )}

        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button 
            onClick={handleManualVerifyCheck}
            className="w-full bg-[#ccff00] text-black font-display font-bold py-4 uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_20px_rgba(204,255,0,0.2)]"
          >
            I've Verified My Email
          </button>
          
          <button 
            onClick={handleResendVerification}
            disabled={resendingVerification}
            className="w-full bg-transparent border border-[#333] text-gray-400 font-display font-medium py-3 uppercase tracking-widest text-[10px] hover:border-white hover:text-white transition-all disabled:opacity-50"
          >
            {resendingVerification ? 'Sending...' : 'Resend Verification Email'}
          </button>
        </div>

        <p className="mt-8 text-xs text-gray-500 italic font-sans">Please check your inbox (and spam folder) for a verification link.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      {loading && <PremiumLoader progress={uploadProgress} message={uploadMessage} />}
      <div className="mb-10">
        <h1 className="text-4xl font-display uppercase tracking-tighter mb-2">Upload New Release</h1>
        <p className="text-gray-400">Fill details carefully to avoid delays.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 pb-20">
        {/* ... Sections A to D remain same ... */}
        <div className="bg-[#111] p-6 sm:p-8 border border-[#333]">
          <div className="mb-6 border-b border-[#333] pb-4">
            <h2 className="text-xl font-display uppercase tracking-widest text-[#ccff00] mb-1">Section A: Basic Info</h2>
            <p className="text-xs text-gray-500 font-sans">Provide the core details of your release. Ensure spelling is exactly as you want it on streaming platforms.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <InputField label="Song Title *" name="title" value={formData.title} onChange={handleChange} required />
            <InputField label="Artist Name *" name="mainArtist" value={formData.mainArtist} onChange={handleChange} required />
            <div className="md:col-span-2 space-y-6">
              <label className="text-xs font-display uppercase tracking-widest text-gray-500 block border-b border-[#222] pb-2">Additional Contributors (Optional)</label>
              
              {additionalArtists.length > 0 && (
                <div className="space-y-6">
                  {additionalArtists.map((artist, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-[#222] bg-black/30 relative pt-10 md:pt-4">
                      <button 
                        type="button" 
                        onClick={() => removeAdditionalArtist(index)} 
                        className="absolute top-2 right-2 text-gray-600 hover:text-red-500 transition-colors p-2 md:bg-transparent"
                      >
                        <X size={16} />
                      </button>
                      
                      <div className="flex flex-col">
                        <label className="text-[10px] font-display uppercase tracking-widest text-gray-600 mb-2">Artist Name *</label>
                        <input
                          type="text"
                          value={artist.name}
                          onChange={(e) => updateAdditionalArtist(index, 'name', e.target.value)}
                          placeholder="e.g. Divine"
                          className="bg-transparent border-b border-[#333] py-2 text-white font-sans text-sm focus:outline-none focus:border-[#ccff00] transition-colors"
                          required
                        />
                      </div>
                      
                      <div className="flex flex-col">
                        <label className="text-[10px] font-display uppercase tracking-widest text-gray-600 mb-2">Role / Credit *</label>
                        <select
                          value={artist.role}
                          onChange={(e) => updateAdditionalArtist(index, 'role', e.target.value)}
                          className="bg-black border-b border-[#333] py-2 text-white font-sans text-sm focus:outline-none focus:border-[#ccff00] transition-colors cursor-pointer"
                        >
                          <option value="Singer">Singer</option>
                          <option value="Rapper">Rapper</option>
                          <option value="Composer">Composer</option>
                          <option value="Lyricist">Lyricist</option>
                          <option value="Feature">Feature</option>
                          <option value="Mixing Engineer">Mixing Engineer</option>
                          <option value="Mastering Engineer">Mastering Engineer</option>
                          <option value="Guitarist">Guitarist</option>
                        </select>
                      </div>

                      <div className="flex flex-col">
                        <label className="text-[10px] font-display uppercase tracking-widest text-gray-600 mb-2">Spotify Link (Optional)</label>
                        <input
                          type="url"
                          value={artist.spotify}
                          onChange={(e) => updateAdditionalArtist(index, 'spotify', e.target.value)}
                          placeholder="https://open.spotify.com/..."
                          className="bg-transparent border-b border-[#333] py-2 text-white font-sans text-sm focus:outline-none focus:border-[#ccff00] transition-colors"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button 
                type="button" 
                onClick={addArtistField}
                className="flex items-center gap-2 text-[#ccff00] text-[10px] font-display uppercase tracking-widest font-black border border-[#ccff00]/30 px-4 py-2 hover:bg-[#ccff00] hover:text-black transition-all"
              >
                <Plus size={14} /> Add Artist / Contributor
              </button>
            </div>
          </div>
        </div>

        <div className="bg-[#111] p-6 sm:p-8 border border-[#333]">
          <div className="mb-6 border-b border-[#333] pb-4 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-display uppercase tracking-widest text-[#ccff00] mb-1">Section B: Credits</h2>
              <p className="text-xs text-gray-500 font-sans">Credit the people behind your music. Required by all major streaming services.</p>
            </div>
            <AIActionButton 
              text="Magic Format" 
              loading={processingAI} 
              onClick={() => setShowAIInput(!showAIInput)} 
            />
          </div>

          {showAIInput && (
            <div className="mb-8 p-6 bg-black border border-[#ccff00]/20 rounded-lg animate-in fade-in slide-in-from-top-4">
              <h3 className="text-[#ccff00] text-xs font-display uppercase tracking-widest font-bold mb-4 flex items-center gap-2">
                <Sparkles size={14} /> Paste Metadata for Magic Fill
              </h3>
              <textarea
                value={rawCredits}
                onChange={(e) => setRawCredits(e.target.value)}
                placeholder="Example: Produced by DJ Snake, Lyrics by Justin, Mixed by Serban Ghenea..."
                className="w-full bg-[#0a0a0a] border border-[#333] p-4 text-white font-sans text-sm focus:border-[#ccff00] transition-all min-h-[100px] outline-none mb-4"
              />
              <div className="flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setShowAIInput(false)}
                  className="text-[10px] font-display uppercase tracking-widest text-gray-500 hover:text-white"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={handleMagicFill}
                  disabled={processingAI || !rawCredits.trim()}
                  className="bg-[#ccff00] text-black px-4 py-2 font-display uppercase tracking-widest text-[10px] font-black hover:bg-white transition-all disabled:opacity-50"
                >
                  {processingAI ? "Extracting..." : "Apply Metadata"}
                </button>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-x-6 gap-y-8">
            <InputField label="Label Name (Optional)" name="labelName" value={formData.labelName} onChange={handleChange} />
            
            <div className="space-y-4">
              <InputField label="Producer (Optional)" name="producer" value={formData.producer} onChange={handleChange} />
              {formData.producer && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <InputField 
                    label="Producer Spotify Link (Optional)" 
                    name="producerSpotify" 
                    value={formData.producerSpotify} 
                    onChange={handleChange}
                    placeholder="https://open.spotify.com/..."
                  />
                </div>
              )}
            </div>
            
            <InputField 
              label="P Line (Sound Recording) *" 
              name="pLine" 
              value={formData.pLine} 
              onChange={handleChange} 
              required 
              helperText="Example: 2026 Karan Aujla"
            />
            <InputField 
              label="C Line (Composition) *" 
              name="cLine" 
              value={formData.cLine} 
              onChange={handleChange} 
              required 
              helperText="Example: 2026 Karan Aujla"
            />
            
            <InputField 
              label="Lyricist (First + Last Name) (Optional)" 
              name="lyricist" 
              value={formData.lyricist} 
              onChange={handleChange} 
            />
            <InputField 
              label="Other Credits (Optional)" 
              name="otherCredits" 
              value={formData.otherCredits} 
              onChange={handleChange} 
            />
          </div>
        </div>

        <div className="bg-[#111] p-6 sm:p-8 border border-[#333]">
          <div className="mb-6 border-b border-[#333] pb-4">
            <h2 className="text-xl font-display uppercase tracking-widest text-[#ccff00] mb-1">Section C: Release Settings</h2>
            <p className="text-xs text-gray-500 font-sans">Choose exactly when you want your audience to hear your music.</p>
          </div>
          <div className="border border-[#333] p-4 bg-[#0a0a0a]">
            <label className="block text-sm font-display uppercase tracking-widest text-white mb-2">Schedule Date (Optional)</label>
            <p className="text-xs text-gray-400 font-sans mb-4">It takes 2-3 days to be live, so Choose release date accordingly. Leave empty for ASAP release.</p>
            <input 
              type="date" 
              name="scheduleDate" 
              value={formData.scheduleDate} 
              onChange={handleChange}
              className="w-full md:w-1/2 bg-transparent border-b border-[#333] py-2 text-white focus:outline-none focus:border-[#ccff00] font-sans"
            />
          </div>
        </div>

        <div className="bg-[#111] p-6 sm:p-8 border border-[#333]">
          <div className="mb-6 border-b border-[#333] pb-4">
            <h2 className="text-xl font-display uppercase tracking-widest text-[#ccff00] mb-1">Section D: Spotify Links</h2>
            <p className="text-xs text-gray-500 font-sans">Ensure this release is perfectly mapped to your existing Spotify artist profiles so you don't lose streams.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <InputField label="Main Artist Spotify Link (Optional)" name="mainSpotifyLink" value={formData.mainSpotifyLink} onChange={handleChange} />
            <InputField label="Feature Artists Spotify Links (Optional)" name="featureSpotifyLinks" value={formData.featureSpotifyLinks} onChange={handleChange} />
          </div>
        </div>

        <div className="bg-[#111] p-6 sm:p-8 border border-[#ccff00]">
          <div className="mb-6 border-b border-[#333] pb-4">
            <h2 className="text-xl font-display uppercase tracking-widest text-[#ccff00] mb-1">Section E: File Upload</h2>
            <p className="text-xs text-gray-500 font-sans">Provide high-quality audio and crisp cover artwork. You can upload directly or provide a link.</p>
          </div>
          
          {/* Audio Upload */}
          <div className="mb-8 border border-[#333] bg-[#0a0a0a] overflow-hidden">
            <div className="flex justify-between items-center px-4 py-3 border-b border-[#333] bg-[#111]">
              <label className="text-xs font-display uppercase tracking-widest text-[#ccff00] font-bold">Audio File *</label>
              <div className="flex gap-1">
                <button type="button" onClick={() => setAudioInputType('file')} className={`text-[10px] font-display px-3 py-1 uppercase font-bold transition-colors ${audioInputType === 'file' ? 'bg-[#ccff00] text-black' : 'bg-[#222] text-gray-500 hover:text-white'}`}>Upload</button>
                <button type="button" onClick={() => setAudioInputType('link')} className={`text-[10px] font-display px-3 py-1 uppercase font-bold transition-colors ${audioInputType === 'link' ? 'bg-[#ccff00] text-black' : 'bg-[#222] text-gray-500 hover:text-white'}`}>Link</button>
              </div>
            </div>
            
            <div className="p-6">
              {audioInputType === 'file' ? (
                <div className="space-y-4">
                  <div className="relative group">
                    <input 
                      type="file" 
                      id="audio-file"
                      accept=".mp3,.m4a,.wav,audio/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        if (file) {
                          try {
                            validateAudioFile(file);
                            setAudioFile(file);
                            setAudioError("");
                            setError("");
                          } catch (err: any) {
                            setAudioError(err.message);
                            setAudioFile(null);
                            e.target.value = ''; // Reset input
                          }
                        } else {
                          setAudioFile(null);
                          setAudioError("");
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className={`
                      border-2 border-dashed p-6 text-center transition-all duration-300
                      ${audioFile && !audioError ? 'border-[#ccff00] bg-[#ccff00]/5' : 'border-[#333] bg-[#0f0f0f] group-hover:border-gray-500'}
                    `}>
                      {audioFile && !audioError ? (
                        <div className="flex flex-col items-center gap-2">
                          <CheckCircle2 className="text-[#ccff00]" size={32} />
                          <div className="text-white font-sans text-sm font-bold truncate max-w-full px-4">{audioFile.name}</div>
                          <span className="text-[#ccff00] text-[10px] uppercase font-display tracking-widest font-black">Ready to upload</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Plus className="text-gray-500 group-hover:text-white transition-colors" size={32} />
                          <span className="text-gray-400 text-xs font-display uppercase tracking-widest">Click or Drag Audio File</span>
                          <span className="text-[10px] text-gray-600 font-sans uppercase">MP3, M4A, WAV (Max 100MB)</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {audioError && <p className="text-xs text-red-500 font-display uppercase tracking-widest text-center">{audioError}</p>}
                </div>
              ) : (
                <div className="space-y-2">
                  <input 
                    type="url" 
                    name="audioUrl"
                    value={formData.audioUrl} 
                    onChange={handleChange}
                    placeholder="Paste link here (Google Drive / Dropbox)"
                    className="w-full bg-[#151515] border border-[#333] p-3 text-white font-sans text-sm focus:outline-none focus:border-[#ccff00] transition-colors"
                  />
                  <p className="text-[10px] text-gray-500 font-sans uppercase">Ensure the link is public</p>
                </div>
              )}
            </div>
          </div>

          {/* Cover Upload */}
          <div className="border border-[#333] bg-[#0a0a0a] overflow-hidden">
            <div className="flex justify-between items-center px-4 py-3 border-b border-[#333] bg-[#111]">
              <label className="text-xs font-display uppercase tracking-widest text-[#ccff00] font-bold">Cover Art *</label>
              <div className="flex gap-1">
                <button type="button" onClick={() => setCoverInputType('file')} className={`text-[10px] font-display px-3 py-1 uppercase font-bold transition-colors ${coverInputType === 'file' ? 'bg-[#ccff00] text-black' : 'bg-[#222] text-gray-500 hover:text-white'}`}>Upload</button>
                <button type="button" onClick={() => setCoverInputType('link')} className={`text-[10px] font-display px-3 py-1 uppercase font-bold transition-colors ${coverInputType === 'link' ? 'bg-[#ccff00] text-black' : 'bg-[#222] text-gray-500 hover:text-white'}`}>Link</button>
              </div>
            </div>
            
            <div className="p-6">
              {coverInputType === 'file' ? (
                <div className="space-y-4">
                  <div className="relative group">
                    <input 
                      type="file" 
                      id="cover-file"
                      accept=".png,.jpg,.jpeg,.pdf,image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        if (file) {
                          try {
                            validateCoverFile(file);
                            setCoverFile(file);
                            setCoverError("");
                            setError("");
                          } catch (err: any) {
                            setCoverError(err.message);
                            setCoverFile(null);
                            e.target.value = ''; // Reset input
                          }
                        } else {
                          setCoverFile(null);
                          setCoverError("");
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className={`
                      border-2 border-dashed p-6 text-center transition-all duration-300
                      ${coverFile && !coverError ? 'border-[#ccff00] bg-[#ccff00]/5' : 'border-[#333] bg-[#0f0f0f] group-hover:border-gray-500'}
                    `}>
                      {coverFile && !coverError ? (
                        <div className="flex flex-col items-center gap-2">
                          <CheckCircle2 className="text-[#ccff00]" size={32} />
                          <div className="text-white font-sans text-sm font-bold truncate max-w-full px-4">{coverFile.name}</div>
                          <span className="text-[#ccff00] text-[10px] uppercase font-display tracking-widest font-black">Artwork Linked</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Plus className="text-gray-500 group-hover:text-white transition-colors" size={32} />
                          <span className="text-gray-400 text-xs font-display uppercase tracking-widest">Select Cover Art</span>
                          <span className="text-[10px] text-gray-600 font-sans uppercase">PNG, JPG (Min 3000x3000px)</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {coverError && <p className="text-xs text-red-500 font-display uppercase tracking-widest text-center">{coverError}</p>}
                </div>
              ) : (
                <div className="space-y-2">
                  <input 
                    type="url" 
                    name="coverUrl"
                    value={formData.coverUrl} 
                    onChange={handleChange}
                    placeholder="Link to hosted artwork"
                    className="w-full bg-[#151515] border border-[#333] p-3 text-white font-sans text-sm focus:outline-none focus:border-[#ccff00] transition-colors"
                  />
                  <p className="text-[10px] text-gray-500 font-sans uppercase">Drive links must be accessible</p>
                </div>
              )}
            </div>
          </div>

          {/* Progress Overlay / Bars */}
          {(audioProgress >= 0 || coverProgress >= 0) && (
            <div className="mt-8 pt-6 border-t border-[#333] space-y-6">
              {audioProgress >= 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-display uppercase tracking-[0.2em] text-gray-500 mb-1">Status</span>
                      <span className="text-xs font-display uppercase tracking-widest text-white font-bold">
                        {audioStatus === 'uploading' && "Uploading Audio Core"}
                        {audioStatus === 'success' && "Audio Core Uploaded"}
                        {audioStatus === 'error' && "Audio Upload Failed"}
                      </span>
                    </div>
                    <span className={`text-xs font-mono ${audioStatus === 'error' ? 'text-red-500' : 'text-[#ccff00]'}`}>{Math.round(audioProgress)}%</span>
                  </div>
                  <div className="w-full bg-[#222] h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 shadow-[0_0_10px_rgba(0,0,0,0.5)] ${
                        audioStatus === 'error' ? 'bg-red-500 shadow-red-500/50' : 
                        audioStatus === 'success' ? 'bg-[#ccff00] shadow-[#ccff00]/50' : 
                        'bg-[#ccff00] shadow-[#ccff00]/50'
                      }`}
                      style={{ width: `${audioProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
              {coverProgress >= 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-display uppercase tracking-[0.2em] text-gray-500 mb-1">Status</span>
                      <span className="text-xs font-display uppercase tracking-widest text-white font-bold">
                        {coverStatus === 'uploading' && "Processing Visual Assets"}
                        {coverStatus === 'success' && "Visual Assets Processed"}
                        {coverStatus === 'error' && "Visual Asset Error"}
                      </span>
                    </div>
                    <span className={`text-xs font-mono ${coverStatus === 'error' ? 'text-red-500' : 'text-[#ccff00]'}`}>{Math.round(coverProgress)}%</span>
                  </div>
                  <div className="w-full bg-[#222] h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 shadow-[0_0_10px_rgba(0,0,0,0.5)] ${
                        coverStatus === 'error' ? 'bg-red-500 shadow-red-500/50' : 
                        coverStatus === 'success' ? 'bg-[#ccff00] shadow-[#ccff00]/50' : 
                        'bg-[#ccff00] shadow-[#ccff00]/50'
                      }`}
                      style={{ width: `${coverProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-[#111] p-6 sm:p-8 border border-[#333]">
          <div className="mb-6 border-b border-[#333] pb-4">
            <h2 className="text-xl font-display uppercase tracking-widest text-[#ccff00] mb-1">Section F: Platform Control</h2>
            <p className="text-xs text-gray-500 font-sans">Fine-tune where your music should NOT appear.</p>
          </div>
          <InputField label="Exclude Platforms (Optional)" name="excludedPlatforms" value={formData.excludedPlatforms} onChange={handleChange} />
          <p className="text-xs text-gray-500 mt-2 font-sans">Type comma-separated platforms you do NOT want your music on (e.g. Spotify, TikTok). Leave blank to distribute everywhere.</p>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-white text-black font-display font-bold py-5 uppercase tracking-widest text-lg hover:bg-[#ccff00] transition-colors disabled:opacity-50"
        >
          {getButtonText()}
        </button>
      </form>
    </div>
  );
}

function InputField({ label, name, value, onChange, required = false, helperText = "" }: any) {
  return (
    <div className="flex flex-col">
      <label className="text-xs font-display uppercase tracking-widest text-gray-500 mb-2">{label}</label>
      <input 
        type="text" 
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="bg-transparent border-b border-[#333] py-2 text-white font-sans focus:outline-none focus:border-white transition-colors"
      />
      {helperText && <p className="text-xs text-gray-500 mt-2 font-sans">{helperText}</p>}
    </div>
  );
}
