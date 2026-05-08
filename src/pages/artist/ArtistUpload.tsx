import { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, doc, getDoc, query, where, getDocs } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../../firebase';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, X, CheckCircle, CheckCircle2, Sparkles, ShieldAlert, Mail, AlertCircle, Info, HelpCircle, Gift, ArrowRight, ChevronDown } from 'lucide-react';
import { geminiService } from '../../services/geminiService';
import { AIActionButton } from '../../components/AIComponents';
import PremiumLoader from '../../components/PremiumLoader';
import { GENRES, LANGUAGES } from '../../constants';

import { getRemainingDays, isPlanActive } from '../../lib/planUtils';

import { sendEmailVerification } from 'firebase/auth';

import { useGlobalError } from '../../components/ErrorProvider';

export default function ArtistUpload({ user, userData }: { user: any, userData: any }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showError } = useGlobalError();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | undefined>(undefined);
  const [rewards, setRewards] = useState<any[]>([]);
  
  const activeFreeSong = rewards.find(r => r.type === 'free_song' && r.status === 'active');
  const isSubscribed = isPlanActive(userData?.subscription) || !!activeFreeSong;
  const isEmailVerified = user?.emailVerified;
  const daysLeft = getRemainingDays(userData?.subscription?.expiryDate);

  const [uploadMessage, setUploadMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [releaseType, setReleaseType] = useState<'Single' | 'EP' | 'Album'>('Single');
  
  const [formData, setFormData] = useState({
    title: "",
    mainArtist: "",
    featuringArtists: "",
    labelName: "",
    pLine: "",
    cLine: "",
    scheduleDate: "",
    mainSpotifyLink: "",
    featureSpotifyLinks: "",
    excludedPlatforms: "",
    coverUrl: "",
    upc: "",
    primaryGenre: [] as string[],
    secondaryGenre: [] as string[],
    language: ["Hindi"],
    copyrightYear: new Date().getFullYear().toString(),
    productionYear: new Date().getFullYear().toString(),
  });

  interface Contributor {
    name: string;
    role: string;
    spotify: string;
  }

  interface TrackSub {
    id: string; // for UI
    title: string;
    audioUrl: string;
    audioFile: File | null;
    audioProgress: number;
    audioStatus: 'idle' | 'uploading' | 'success' | 'error';
    audioError: string;
    isrc: string;
    lyricist: string;
    composer: string;
    producer: string;
    producerSpotify: string;
    otherCredits: string;
    isExplicit: "Yes" | "No" | "";
    lyrics: string;
    trackNumber: number;
    isExpanded: boolean;
    additionalContributors: Contributor[];
  }

  const createNewTrack = (num: number): TrackSub => ({
    id: Math.random().toString(36).substr(2, 9),
    title: "",
    audioUrl: "",
    audioFile: null,
    audioProgress: -1,
    audioStatus: 'idle',
    audioError: "",
    isrc: "",
    lyricist: "",
    composer: "",
    producer: "",
    producerSpotify: "",
    otherCredits: "",
    isExplicit: "",
    lyrics: "",
    trackNumber: num,
    isExpanded: true,
    additionalContributors: []
  });

  const [tracks, setTracks] = useState<TrackSub[]>([createNewTrack(1)]);
  const [additionalArtists, setAdditionalArtists] = useState<Contributor[]>([]);
  const [coverInputType, setCoverInputType] = useState('file'); // 'file' or 'link'
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverProgress, setCoverProgress] = useState(-1);
  const [coverStatus, setCoverStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [coverError, setCoverError] = useState("");
  const [stuckAtZero, setStuckAtZero] = useState(false);

  const [processingAI, setProcessingAI] = useState(false);
  const [rawCredits, setRawCredits] = useState("");
  const [showAIInput, setShowAIInput] = useState(false);

  const [resendingVerification, setResendingVerification] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      fetchExistingRelease();
    }
    fetchRewards();
  }, [id, user.uid]);

  const fetchRewards = async () => {
    try {
      const q = query(collection(db, 'rewards'), where('uid', '==', user.uid), where('status', '==', 'active'));
      const snap = await getDocs(q);
      setRewards(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error("Error fetching rewards:", e);
    }
  };

  const fetchExistingRelease = async () => {
    setFetching(true);
    try {
      const docSnap = await getDoc(doc(db, 'submissions', id!));
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.uid !== user.uid) {
          setError("Unauthorized access to this release.");
          return;
        }
        
        setReleaseType(data.releaseType || 'Single');
        setFormData({
          title: data.title || "",
          mainArtist: data.mainArtist || "",
          featuringArtists: Array.isArray(data.featuringArtists) ? data.featuringArtists.join(', ') : (data.featuringArtists || ""),
          labelName: data.labelName || "",
          pLine: data.pLine || "",
          cLine: data.cLine || "",
          scheduleDate: data.scheduleDate || "",
          mainSpotifyLink: data.mainSpotifyLink || "",
          featureSpotifyLinks: data.featureSpotifyLinks || "",
          excludedPlatforms: data.excludedPlatforms || "",
          coverUrl: data.coverUrl || "",
          upc: data.upc || "",
          primaryGenre: Array.isArray(data.primaryGenre) ? data.primaryGenre : (data.primaryGenre ? [data.primaryGenre] : []),
          secondaryGenre: Array.isArray(data.secondaryGenre) ? data.secondaryGenre : (data.secondaryGenre ? [data.secondaryGenre] : []),
          language: Array.isArray(data.language) ? data.language : (data.language ? [data.language] : ["Hindi"]),
          copyrightYear: data.copyrightYear || new Date().getFullYear().toString(),
          productionYear: data.productionYear || new Date().getFullYear().toString(),
        });
        
        if (data.tracks && data.tracks.length > 0) {
          setTracks(data.tracks.map((t: any, i: number) => ({
            ...createNewTrack(i + 1),
            ...t,
            id: t.id || Math.random().toString(36).substr(2, 9),
            audioStatus: t.audioUrl ? 'success' : 'idle',
            audioProgress: t.audioUrl ? 100 : -1,
            isExplicit: t.isExplicit === true ? "Yes" : (t.isExplicit === false ? "No" : ""),
            isExpanded: i === 0 // Expand first track by default
          })));
        } else {
          // Migration from old single format
          setTracks([{
            ...createNewTrack(1),
            title: data.title || "",
            audioUrl: data.audioUrl || "",
            audioStatus: data.audioUrl ? 'success' : 'idle',
            audioProgress: data.audioUrl ? 100 : -1,
            isrc: data.isrc || "",
            lyricist: data.lyricist || "",
            composer: data.composer || "",
            producer: data.producer || "",
            producerSpotify: data.producerSpotify || "",
            otherCredits: data.otherCredits || "",
            isExplicit: data.isExplicit === true ? "Yes" : (data.isExplicit === false ? "No" : ""),
            lyrics: data.lyrics || "",
            additionalContributors: data.additionalContributors || []
          }]);
        }

        if (data.additionalContributors) {
          setAdditionalArtists(data.additionalContributors);
        }

        if (data.coverUrl) {
          setCoverInputType('link');
          setCoverStatus('success');
          setCoverProgress(100);
        }
      }
    } catch (err: any) {
      console.error("Fetch existing release error:", err);
      setError("Failed to load existing release details.");
    } finally {
      setFetching(false);
    }
  };

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

    const parts: number[] = [];
    
    // Cover progress
    if (coverStatus === 'uploading') parts.push(Math.max(0, coverProgress === -1 ? 1 : coverProgress));
    else if (coverStatus === 'success') parts.push(100);

    // Audio progress per track
    tracks.forEach(track => {
      if (track.audioStatus === 'uploading') parts.push(Math.max(0, track.audioProgress === -1 ? 1 : track.audioProgress));
      else if (track.audioStatus === 'success') parts.push(100);
    });

    if (parts.length > 0) {
      const avg = parts.reduce((a, b) => a + b, 0) / parts.length;
      
      if (avg <= 1) {
        const timeout = setTimeout(() => {
          if (uploadProgress !== undefined && uploadProgress <= 1) {
            setStuckAtZero(true);
            setUploadMessage("Connection throttled. Checking CORS...");
          }
        }, 8000);
        return () => clearTimeout(timeout);
      } else {
        setStuckAtZero(false);
      }

      setUploadProgress(Math.min(99, avg));
      setUploadMessage(`Uploading Assets (${Math.round(avg)}%)...`);
    } else {
      setUploadProgress(95);
      setUploadMessage("Finalizing Submission...");
    }
  }, [tracks, coverProgress, coverStatus, loading]);

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
    if (!['png', 'jpg', 'jpeg'].includes(ext || '')) {
      throw new Error("Invalid cover format! Please upload a PNG, JPG, or JPEG file.");
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

  const updateTrack = (id: string, updates: Partial<TrackSub>) => {
    setTracks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const addTrack = () => {
    setTracks(prev => [...prev, createNewTrack(prev.length + 1)]);
  };

  const removeTrack = (id: string) => {
    if (tracks.length <= 1) return;
    setTracks(prev => {
      const filtered = prev.filter(t => t.id !== id);
      return filtered.map((t, i) => ({ ...t, trackNumber: i + 1 }));
    });
  };

  const uploadToCloudinary = async (
    file: File, 
    type: 'audio' | 'image', 
    onProgress: (p: number) => void, 
    onStatus: (s: any) => void
  ): Promise<string> => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = `gati/${auth.currentUser?.uid}`;
    
    console.log(`[Cloudinary] Preparing signed upload for: ${file.name} (${type})`);
    
    // 1. Get Signature from our backend
    const sigResponse = await fetch('/api/cloudinary-signature', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        params_to_sign: {
          timestamp,
          folder
        }
      })
    });
    
    if (!sigResponse.ok) {
      const errData = await sigResponse.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to get upload authorization from server.");
    }
    
    const { signature, apiKey } = await sigResponse.json();

    // 2. Perform Upload with XHR for better progress and domain handling
    return new Promise((resolve, reject) => {
      onStatus('uploading');
      const xhr = new XMLHttpRequest();
      const resourceType = type === 'audio' ? 'video' : 'image';
      
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`);
      
      // Critical for domain-restricted accounts: Ensure the request identifies itself correctly
      xhr.withCredentials = false;

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = (e.loaded / e.total) * 100;
          onProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const resp = JSON.parse(xhr.responseText);
            onStatus('success');
            onProgress(100);
            resolve(resp.secure_url);
          } catch (e) {
            reject(new Error("Failed to parse Cloudinary response."));
          }
        } else {
          console.error(`[Cloudinary] Error Response (${xhr.status}):`, xhr.responseText);
          onStatus('error');
          reject(new Error(`Cloudinary Error (${xhr.status}). Ensure gatimusic.in is allowlisted.`));
        }
      };

      xhr.onerror = () => {
        onStatus('error');
        reject(new Error("Network Error connecting to Cloudinary. Check your internet."));
      };

      xhr.ontimeout = () => {
        onStatus('error');
        reject(new Error("Upload timed out."));
      };

      xhr.timeout = 900000;

      const fd = new FormData();
      fd.append('file', file);
      fd.append('api_key', apiKey);
      fd.append('timestamp', timestamp.toString());
      fd.append('signature', signature);
      fd.append('folder', folder);

      xhr.send(fd);
    });
  };

  const uploadWithRetry = async (
    file: File, 
    type: 'audio' | 'image', 
    onProgress: (p: number) => void, 
    onStatus: (s: any) => void,
    retries = 2
  ): Promise<string> => {
    try {
      return await uploadToCloudinary(file, type, onProgress, onStatus);
    } catch (err: any) {
      if (retries > 0) {
        console.warn(`[Upload] Attempt failed for ${file.name}. Retrying... (${retries} left)`);
        await new Promise(r => setTimeout(r, 2000));
        return uploadWithRetry(file, type, onProgress, onStatus, retries - 1);
      }
      throw err;
    }
  };

  const isUploading = coverStatus === 'uploading' || tracks.some(t => t.audioStatus === 'uploading');
  const hasUploadErrors = coverStatus === 'error' || tracks.some(t => t.audioStatus === 'error');

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setUploadProgress(0);
    setUploadMessage("Validating release...");
    setError("");
    
    try {
      const missingFields = [];
      if (!formData.title) missingFields.push("Release Title");
      if (!formData.mainArtist) missingFields.push("Main Artist");
      if (!formData.pLine) missingFields.push("P Line");
      if (!formData.cLine) missingFields.push("C Line");
      if (formData.primaryGenre.length === 0) missingFields.push("Primary Genre");
      
      if (missingFields.length > 0) {
        throw new Error(`Release errors: ${missingFields.join(", ")}`);
      }

      // Check tracks
      tracks.forEach((track, i) => {
        if (!track.title) throw new Error(`Track #${i + 1} is missing a title.`);
        if (!track.audioUrl && !track.audioFile) throw new Error(`Track #${i + 1} is missing an audio file.`);
        if (track.isExplicit === 'Yes' && !track.lyrics.trim()) throw new Error(`Lyrics required for track #${i + 1} (Explicit).`);
        if (!track.lyricist) throw new Error(`Lyricist required for track #${i + 1}.`);
        if (!track.composer) throw new Error(`Composer required for track #${i + 1}.`);
        
        if (track.audioFile) validateAudioFile(track.audioFile);
      });

      if (coverInputType === 'file') {
        if (!coverFile) throw new Error("Please upload a cover art file.");
        validateCoverFile(coverFile);
      } else if (!isValidUrl(formData.coverUrl)) {
        throw new Error("Invalid cover art URL.");
      }

      let finalCoverUrl = formData.coverUrl;
      if (coverInputType === 'file' && coverFile && coverStatus !== 'success') {
        setUploadMessage("Uploading cover art...");
        finalCoverUrl = await uploadWithRetry(coverFile, 'image', setCoverProgress, setCoverStatus);
        setFormData(prev => ({ ...prev, coverUrl: finalCoverUrl }));
      }

      const finalTracks = await Promise.all(tracks.map(async (track) => {
        let finalAudioUrl = track.audioUrl;
        if (track.audioFile && track.audioStatus !== 'success') {
          setUploadMessage(`Uploading Track: ${track.title}`);
          finalAudioUrl = await uploadWithRetry(
            track.audioFile, 
            'audio', 
            (p) => updateTrack(track.id, { audioProgress: p }), 
            (s) => updateTrack(track.id, { audioStatus: s })
          );
          // Persist the URL in state so it survives if following tracks fail
          updateTrack(track.id, { audioUrl: finalAudioUrl, audioStatus: 'success' });
        }
        return {
          title: track.title,
          audioUrl: finalAudioUrl,
          isrc: track.isrc,
          lyricist: track.lyricist,
          composer: track.composer,
          producer: track.producer,
          producerSpotify: track.producerSpotify,
          otherCredits: track.otherCredits,
          isExplicit: track.isExplicit === 'Yes',
          lyrics: track.lyrics,
          trackNumber: track.trackNumber,
          additionalContributors: track.additionalContributors
        };
      }));

      setUploadMessage("Saving to database...");

      const submissionData = {
        uid: user.uid,
        releaseType,
        title: formData.title,
        mainArtist: formData.mainArtist,
        featuringArtists: formData.featuringArtists.split(',').map(s => s.trim()).filter(Boolean),
        additionalContributors: additionalArtists,
        labelName: formData.labelName || userData.managedByLabelName || "",
        labelId: userData.labelId || null,
        pLine: formData.pLine,
        cLine: formData.cLine,
        scheduleDate: formData.scheduleDate,
        mainSpotifyLink: formData.mainSpotifyLink,
        featureSpotifyLinks: formData.featureSpotifyLinks,
        excludedPlatforms: formData.excludedPlatforms,
        coverUrl: finalCoverUrl,
        primaryGenre: formData.primaryGenre,
        secondaryGenre: formData.secondaryGenre,
        language: formData.language,
        upc: formData.upc,
        copyrightYear: formData.copyrightYear,
        productionYear: formData.productionYear,
        status: "Reviewing",
        updatedAt: new Date().toISOString(),
        tracks: finalTracks,
      };

      if (id) {
        await updateDoc(doc(db, 'submissions', id), submissionData);
      } else {
        await addDoc(collection(db, 'submissions'), {
          ...submissionData,
          createdAt: new Date().toISOString(),
        });
      }

      // Update User Upload Count & Expiry Logic (Only for new uploads)
      if (!id) {
        const isLabelPlan = ['Label Monthly', 'Label Yearly'].includes(userData.subscription?.planType);
        const newUploadCount = (userData.subscription?.uploadCount || 0) + 1;
        const isBasic = userData.subscription?.planType === 'Basic';
        const shouldExpire = isBasic && newUploadCount >= 1;

        await updateDoc(doc(db, 'users', user.uid), {
          'subscription.uploadCount': newUploadCount,
          'subscription.status': (isLabelPlan || !shouldExpire) ? userData.subscription?.status : 'Expired'
        });
      }

      // Log Activity
      await addDoc(collection(db, 'activity_logs'), {
        uid: user.uid,
        type: id ? 'release_updated' : 'release_uploaded',
        message: `${id ? 'Updated' : 'Uploaded'} ${releaseType}: ${formData.title}`,
        timestamp: new Date().toISOString()
      });
      
      setSuccess(true);
      
    } catch (err: any) {
      console.error("Submission error:", err);
      showError(err.message || "Failed to submit release.", () => handleSubmit(e));
    } finally {
      setLoading(false);
    }
  };

  const getButtonText = () => {
    if (!loading) return id ? `Resubmit ${releaseType}` : `Submit ${releaseType}`;
    
    if (coverStatus === 'uploading' || tracks.some(t => t.audioStatus === 'uploading')) {
       return `Uploading Assets...`;
    }
    return "Processing...";
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
        
        <div className="bg-[#ccff00]/5 border border-[#ccff00]/10 p-6 mb-8 rounded-xl max-w-md">
          <p className="text-xs text-gray-500 font-sans uppercase tracking-widest mb-3">Hack: Unlock with Referrals</p>
          <p className="text-sm text-[#ccff00] font-bold font-sans mb-4">Refer 1 friend to unlock 1 Free Release instantly.</p>
          <button 
            onClick={() => navigate('/dashboard/referrals')}
            className="flex items-center gap-2 mx-auto text-[10px] font-display uppercase font-black tracking-widest text-white hover:text-[#ccff00]"
          >
            Invite Friends <ArrowRight size={12} />
          </button>
        </div>

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

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh]">
        <PremiumLoader message="Fetching release details..." />
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
      {activeFreeSong && (
        <div className="mb-6 p-4 bg-[#ccff00]/10 border border-[#ccff00]/20 rounded-xl flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <Gift className="text-[#ccff00]" size={20} />
            <div>
              <p className="text-[10px] font-display uppercase tracking-widest text-[#ccff00] font-black">Reward Applied</p>
              <p className="text-sm text-white font-bold font-sans uppercase">Free Song Release Active</p>
            </div>
          </div>
          <div className="text-[9px] font-mono text-gray-500 uppercase">Will be used on submission</div>
        </div>
      )}
      {loading && (
        <div className="relative">
          <PremiumLoader progress={uploadProgress} message={uploadMessage} />
          {stuckAtZero && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
              <div className="max-w-md bg-[#111] border border-red-500/50 p-8 rounded-2xl text-center shadow-[0_0_50px_rgba(239,68,68,0.2)]">
                <ShieldAlert className="text-red-500 mx-auto mb-4" size={48} />
                <h3 className="text-xl font-display uppercase tracking-widest text-white mb-4">CORS Block Detected</h3>
                <p className="text-gray-400 text-sm font-sans mb-6">
                  The upload is stuck at 0%. This usually means your new domain <span className="text-white font-bold">gatimusic.in</span> is being blocked by the storage provider's security policy.
                </p>
                <div className="space-y-3">
                  <a 
                    href="https://wa.me/917626841258?text=Hi, my uploads are stuck at 0% on gatimusic.in. It seems like a CORS policy issue."
                    target="_blank"
                    className="block w-full bg-[#ccff00] text-black py-3 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors"
                  >
                    Get Admin to Fix CORS
                  </a>
                  <button 
                    onClick={() => window.location.reload()}
                    className="block w-full border border-[#333] text-gray-500 py-3 rounded-lg font-bold text-xs uppercase tracking-widest hover:text-white transition-colors"
                  >
                    Cancel & Retry
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      <div className="mb-10">
        <h1 className="text-4xl font-display uppercase tracking-tighter mb-2">
          {id ? `Fix Your ${releaseType}` : `New ${releaseType} Distribution`}
        </h1>
        <p className="text-gray-400">
          {id ? 'Review and correct the requested fields.' : 'Fill details carefully to ensure global platform delivery.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 pb-32">
        {/* Release Type */}
        {!id && (
          <div className="bg-[#111] p-6 sm:p-8 border border-[#333]">
            <div className="mb-6 border-b border-[#333] pb-4">
              <h2 className="text-xl font-display uppercase tracking-widest text-[#ccff00] mb-1">Release Type</h2>
              <p className="text-xs text-gray-500 font-sans">Choose your distribution format. This cannot be edited after submission.</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {['Single', 'EP', 'Album'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setReleaseType(type as any);
                    if (type === 'Single' && tracks.length > 1) {
                      setTracks([tracks[0]]);
                    } else if (type !== 'Single' && tracks.length === 1) {
                      addTrack();
                    }
                  }}
                  className={`py-4 font-display font-black uppercase tracking-widest text-xs transition-all border ${
                    releaseType === type 
                      ? 'bg-[#ccff00] text-black border-[#ccff00] shadow-[0_0_20px_rgba(204,255,0,0.15)]' 
                      : 'bg-black border-[#222] text-gray-500 hover:border-gray-500'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Section A: Release Metadata */}
        <div className="bg-[#111] p-6 sm:p-8 border border-[#333]">
          <div className="mb-6 border-b border-[#333] pb-4">
            <h2 className="text-xl font-display uppercase tracking-widest text-[#ccff00] mb-1">Section A: Release Metadata</h2>
            <p className="text-xs text-gray-500 font-sans">Primary details that apply to the entire {releaseType}.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <InputField 
              label={releaseType === 'Single' ? "Song Title *" : "Album Title *"}
              name="title" 
              value={formData.title} 
              onChange={handleChange} 
              required 
              tooltip={`The main title of this ${releaseType}.`}
            />
            <InputField 
              label={releaseType === 'Single' ? "Main Artist *" : "Album Artist *"}
              name="mainArtist" 
              value={formData.mainArtist} 
              onChange={handleChange} 
              required 
              tooltip="The primary artist name as it appears on official charts."
            />
            <MultiSelectField 
              label="Primary Genre *" 
              name="primaryGenre" 
              value={formData.primaryGenre} 
              onChange={handleChange} 
              options={GENRES} 
              required 
            />
            <MultiSelectField 
              label="Secondary Genre (Optional)" 
              name="secondaryGenre" 
              value={formData.secondaryGenre} 
              onChange={handleChange} 
              options={GENRES} 
            />
            <MultiSelectField 
              label="Release Languages *" 
              name="language" 
              value={formData.language} 
              onChange={handleChange} 
              options={LANGUAGES} 
              required 
            />
          </div>

          {/* Additional Contributors (Release Level) */}
          <div className="mb-8 p-4 bg-white/5 border border-[#222]">
            <div className="flex justify-between items-center mb-4">
              <label className="text-[10px] font-display uppercase tracking-widest text-gray-500 font-bold">Release Contributors (Optional)</label>
              <button 
                type="button" 
                onClick={() => setAdditionalArtists(prev => [...prev, { name: "", role: "Singer", spotify: "" }])}
                className="text-[#ccff00] text-[10px] font-display uppercase tracking-widest font-black flex items-center gap-1 hover:text-white transition-colors"
              >
                <Plus size={12} /> Add Contributor
              </button>
            </div>
            {additionalArtists.length > 0 && (
              <div className="space-y-4">
                {additionalArtists.map((artist, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-black border border-[#222] relative group">
                    <button 
                      type="button" 
                      onClick={() => setAdditionalArtists(prev => prev.filter((_, i) => i !== idx))}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <X size={12} />
                    </button>
                    <div className="flex flex-col">
                      <label className="text-[9px] font-display uppercase tracking-widest text-gray-600 mb-1">Name</label>
                      <input 
                        className="bg-transparent border-b border-[#222] py-1 text-white font-sans text-xs focus:outline-none focus:border-[#ccff00]" 
                        value={artist.name} 
                        onChange={(e) => {
                          const newArr = [...additionalArtists];
                          newArr[idx].name = e.target.value;
                          setAdditionalArtists(newArr);
                        }}
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[9px] font-display uppercase tracking-widest text-gray-600 mb-1">Role</label>
                      <select 
                        className="bg-black border-b border-[#222] py-1 text-white font-sans text-xs focus:outline-none focus:border-[#ccff00]"
                        value={artist.role}
                        onChange={(e) => {
                          const newArr = [...additionalArtists];
                          newArr[idx].role = e.target.value;
                          setAdditionalArtists(newArr);
                        }}
                      >
                        <option value="Singer">Singer</option>
                        <option value="Rapper">Rapper</option>
                        <option value="Composer">Composer</option>
                        <option value="Lyricist">Lyricist</option>
                        <option value="Feature">Feature</option>
                        <option value="Mixing Engineer">Mixing Engineer</option>
                        <option value="Mastering Engineer">Mastering Engineer</option>
                      </select>
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[9px] font-display uppercase tracking-widest text-gray-600 mb-1">Spotify Link</label>
                      <input 
                        className="bg-transparent border-b border-[#222] py-1 text-white font-sans text-xs focus:outline-none focus:border-[#ccff00]" 
                        placeholder="https://..."
                        value={artist.spotify} 
                        onChange={(e) => {
                          const newArr = [...additionalArtists];
                          newArr[idx].spotify = e.target.value;
                          setAdditionalArtists(newArr);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cover Upload at Release Level */}
          <div className="border border-[#333] bg-[#0a0a0a] overflow-hidden">
            <div className="flex justify-between items-center px-4 py-3 border-b border-[#333] bg-[#111]">
              <div className="flex items-center gap-2">
                <label className="text-xs font-display uppercase tracking-widest text-[#ccff00] font-bold">Release Artwork *</label>
                <Tooltip text="Crisp cover artwork. Minimum 3000x3000px. PNG or JPG format." />
              </div>
              <div className="flex gap-1">
                <button type="button" onClick={() => setCoverInputType('file')} className={`text-[10px] font-display px-3 py-1 uppercase font-bold transition-colors ${coverInputType === 'file' ? 'bg-[#ccff00] text-black' : 'bg-[#222] text-gray-500 hover:text-white'}`}>Upload</button>
                <button type="button" onClick={() => setCoverInputType('link')} className={`text-[10px] font-display px-3 py-1 uppercase font-bold transition-colors ${coverInputType === 'link' ? 'bg-[#ccff00] text-black' : 'bg-[#222] text-gray-500 hover:text-white'}`}>Link</button>
              </div>
            </div>
            <div className="p-6">
              {coverInputType === 'file' ? (
                <div className="relative group">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          validateCoverFile(file);
                          setCoverFile(file);
                          setCoverError("");
                          
                          // AUTO UPLOAD
                          console.log("[AutoUpload] Triggering cover art upload...");
                          const url = await uploadWithRetry(file, 'image', setCoverProgress, setCoverStatus);
                          setFormData(prev => ({ ...prev, coverUrl: url }));
                        } catch (err: any) {
                          setCoverError(err.message);
                          console.error("[AutoUpload] Cover error:", err);
                        }
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className={`border-2 border-dashed p-8 text-center transition-all ${coverFile ? 'border-[#ccff00] bg-[#ccff00]/5' : 'border-[#333] group-hover:border-white'} relative`}>
                    {coverStatus === 'uploading' && (
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-20">
                         <div className="w-12 h-12 border-2 border-[#ccff00] border-t-transparent rounded-full animate-spin mb-2"></div>
                         <span className="text-[10px] font-display font-black text-[#ccff00]">{Math.round(coverProgress)}%</span>
                      </div>
                    )}
                    {coverFile ? (
                      <div className="flex flex-col items-center gap-2 text-[#ccff00]">
                        <CheckCircle2 size={32} />
                        <span className="text-xs font-bold uppercase truncate max-w-full italic">{coverFile.name}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Plus className="text-gray-500" size={32} />
                        <span className="text-gray-400 text-[10px] uppercase tracking-widest font-display">Click to select Artwork (3000x3000px)</span>
                      </div>
                    )}
                  </div>
                  {coverError && <p className="text-[10px] text-red-500 mt-2 uppercase text-center font-display tracking-widest">{coverError}</p>}
                </div>
              ) : (
                <div className="space-y-4">
                  <InputField 
                    label="Direct Cover Link" 
                    name="coverUrl" 
                    value={formData.coverUrl} 
                    onChange={handleChange} 
                    placeholder="https://..."
                  />
                  <p className="text-[10px] text-gray-500 font-sans italic">Use public Drive or Dropbox link if hosting externally.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section B: Tracks */}
        <div className="bg-[#111] p-6 sm:p-8 border border-[#333]">
          <div className="mb-8 border-b border-[#333] pb-4 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-display uppercase tracking-widest text-[#ccff00] mb-1">Section B: Tracklist ({tracks.length} Songs)</h2>
              <p className="text-xs text-gray-500 font-sans">Upload your songs and enter song-specific metadata.</p>
            </div>
            {releaseType !== 'Single' && (
              <button 
                type="button" 
                onClick={addTrack}
                className="flex items-center gap-2 bg-[#ccff00] text-black px-4 py-2 text-[10px] font-display font-black uppercase tracking-widest hover:bg-white transition-all shadow-lg"
              >
                <Plus size={14} /> Add Track
              </button>
            )}
          </div>

          <div className="space-y-6">
            {tracks.map((track, trackIndex) => (
              <div 
                key={track.id} 
                className={`border transition-all duration-300 ${track.isExpanded ? 'border-[#ccff00]/50 bg-black' : 'border-[#333] bg-white/5 hover:border-gray-500'}`}
              >
                <div 
                  className={`flex items-center justify-between px-6 py-4 cursor-pointer select-none ${track.isExpanded ? 'border-b border-white/5' : ''}`}
                  onClick={() => updateTrack(track.id, { isExpanded: !track.isExpanded })}
                >
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center font-mono text-xs text-[#ccff00]">
                      {trackIndex + 1}
                    </span>
                    <div>
                      <h3 className="text-sm font-display font-black uppercase tracking-widest text-white">
                        {track.title || `Untitled Track ${trackIndex + 1}`}
                      </h3>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-[9px] font-display uppercase tracking-widest text-gray-500">
                          {track.audioFile ? track.audioFile.name : (track.audioUrl ? "Audio Linked" : "No Audio")}
                        </span>
                        {track.audioStatus === 'success' && <CheckCircle size={10} className="text-[#ccff00]" />}
                        {track.isExplicit === 'Yes' && <span className="text-[8px] bg-red-500/20 text-red-500 px-1 border border-red-500/30 font-bold">EXPLICIT</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {releaseType !== 'Single' && (
                      <button 
                        type="button" 
                        onClick={(e) => { e.stopPropagation(); removeTrack(track.id); }}
                        className="text-gray-600 hover:text-red-500 p-2 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    )}
                    <ChevronDown size={16} className={`text-gray-500 transition-transform ${track.isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {track.isExpanded && (
                  <div className="p-8 space-y-8 animate-in fade-in slide-in-from-top-2">
                    <div className="grid md:grid-cols-2 gap-6">
                      <InputField 
                        label="Track Title *" 
                        name="trackTitle" 
                        value={track.title} 
                        onChange={(e: any) => updateTrack(track.id, { title: e.target.value })} 
                        required 
                        placeholder="e.g. My Awesome Song"
                      />
                      <InputField 
                        label="ISRC (Optional)" 
                        name="isrc" 
                        value={track.isrc} 
                        onChange={(e: any) => updateTrack(track.id, { isrc: e.target.value })} 
                        tooltip="Enter if you are re-releasing this exact version. Leave blank for new songs."
                      />
                    </div>

                    {/* Audio Upload */}
                    <div className="border border-white/5 bg-white/5 overflow-hidden">
                       <div className="p-4 bg-white/5 flex justify-between items-center text-[10px] font-display uppercase tracking-widest font-black text-gray-400">
                         <span>Audio File (MP3/WAV/M4A)</span>
                         <div className="flex gap-2">
                           <button type="button" onClick={() => updateTrack(track.id, { audioUrl: "", audioFile: null })} className="hover:text-red-500">Reset</button>
                         </div>
                       </div>
                       <div className="p-6">
                         {!track.audioFile && !track.audioUrl ? (
                           <div className="relative group">
                             <input 
                               type="file" 
                               accept="audio/*"
                               onChange={async (e) => {
                                 const file = e.target.files?.[0];
                                 if (file) {
                                   try {
                                     validateAudioFile(file);
                                     updateTrack(track.id, { audioFile: file, audioError: "", audioStatus: 'idle' });
                                     
                                     // AUTO UPLOAD
                                     console.log(`[AutoUpload] Triggering audio upload for track: ${track.title || trackIndex + 1}`);
                                     const url = await uploadWithRetry(
                                       file, 
                                       'audio', 
                                       (p) => updateTrack(track.id, { audioProgress: p }), 
                                       (s) => updateTrack(track.id, { audioStatus: s })
                                     );
                                     updateTrack(track.id, { audioUrl: url, audioStatus: 'success' });
                                   } catch (err: any) {
                                     updateTrack(track.id, { audioError: err.message, audioStatus: 'error' });
                                     console.error("[AutoUpload] Audio error:", err);
                                   }
                                 }
                               }}
                               className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                             />
                             <div className="border-2 border-dashed border-white/10 p-8 text-center group-hover:border-[#ccff00]/50 transition-all">
                               <Plus className="text-gray-600 mx-auto mb-2" size={24} />
                               <span className="text-[10px] uppercase font-display tracking-widest text-gray-500">Add Audio File</span>
                             </div>
                             {track.audioError && <p className="text-[10px] text-red-500 mt-2 text-center uppercase tracking-widest">{track.audioError}</p>}
                           </div>
                         ) : (
                           <div className="flex items-center gap-4 p-4 bg-black/40 border border-white/5">
                             <div className="w-10 h-10 rounded-full bg-[#ccff00]/10 flex items-center justify-center text-[#ccff00]">
                               <CheckCircle size={20} />
                             </div>
                             <div className="flex-1 min-w-0">
                               <p className="text-xs text-white font-bold truncate">{track.audioFile ? track.audioFile.name : "Remote File Linked"}</p>
                               <div className="flex items-center gap-2 mt-1">
                                 {track.audioStatus === 'uploading' && (
                                   <div className="flex-1 bg-white/5 h-1 rounded-full overflow-hidden">
                                     <div 
                                       className="h-full bg-[#ccff00] transition-all duration-300" 
                                       style={{ width: `${track.audioProgress}%` }}
                                     />
                                   </div>
                                 )}
                                 <span className={`text-[9px] uppercase tracking-widest font-black ${track.audioStatus === 'error' ? 'text-red-500' : 'text-gray-500'}`}>
                                   {track.audioStatus === 'idle' ? "Waiting for submission" : 
                                    (track.audioStatus === 'uploading' ? `Uploading ${Math.round(track.audioProgress)}%` : 
                                    (track.audioStatus === 'error' ? "Upload Failed" : "Verified & Ready"))}
                                 </span>
                               </div>
                               {track.audioError && <p className="text-[8px] text-red-500 mt-1 uppercase font-display">{track.audioError}</p>}
                             </div>
                           </div>
                         )}
                       </div>
                    </div>

                    {/* Metadata Overrides */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <InputField 
                        label="Lyricist Real Name *" 
                        name="lyricist" 
                        value={track.lyricist} 
                        onChange={(e: any) => updateTrack(track.id, { lyricist: e.target.value })} 
                        required 
                        tooltip="Real legal name of the lyricist."
                      />
                      <InputField 
                        label="Composer Real Name *" 
                        name="composer" 
                        value={track.composer} 
                        onChange={(e: any) => updateTrack(track.id, { composer: e.target.value })} 
                        required 
                        tooltip="Real legal name of the composer."
                      />
                      <InputField 
                        label="Producer *" 
                        name="producer" 
                        value={track.producer} 
                        onChange={(e: any) => updateTrack(track.id, { producer: e.target.value })} 
                        required
                        tooltip="The person/entity who produced this track."
                      />
                      <InputField 
                        label="Producer Spotify Link (Optional)" 
                        name="producerSpotify" 
                        value={track.producerSpotify} 
                        onChange={(e: any) => updateTrack(track.id, { producerSpotify: e.target.value })} 
                      />
                    </div>

                    {/* Track Contributors */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-display uppercase tracking-widest text-gray-500 font-bold">Track Contributors (Features/Singers)</label>
                        <button 
                          type="button" 
                          onClick={() => {
                            const newContribs = [...track.additionalContributors, { name: "", role: "Singer", spotify: "" }];
                            updateTrack(track.id, { additionalContributors: newContribs });
                          }}
                          className="text-[#ccff00] text-[10px] font-display uppercase tracking-widest font-black flex items-center gap-1 hover:text-white transition-colors"
                        >
                          <Plus size={10} /> Add Feature
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {track.additionalContributors.map((c, i) => (
                          <div key={i} className="p-4 border border-white/5 bg-black/40 relative group">
                            <button 
                              type="button" 
                              onClick={() => {
                                const newContribs = track.additionalContributors.filter((_, idx) => idx !== i);
                                updateTrack(track.id, { additionalContributors: newContribs });
                              }}
                              className="absolute top-2 right-2 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={12} />
                            </button>
                            <input 
                              placeholder="Artist Name"
                              className="w-full bg-transparent border-b border-white/10 py-1 text-xs text-white mb-2 focus:outline-none focus:border-[#ccff00]"
                              value={c.name}
                              onChange={(e) => {
                                const newContribs = [...track.additionalContributors];
                                newContribs[i].name = e.target.value;
                                updateTrack(track.id, { additionalContributors: newContribs });
                              }}
                            />
                            <div className="flex gap-2">
                              <select 
                                className="bg-black text-[9px] text-gray-400 border-none outline-none"
                                value={c.role}
                                onChange={(e) => {
                                  const newContribs = [...track.additionalContributors];
                                  newContribs[i].role = e.target.value;
                                  updateTrack(track.id, { additionalContributors: newContribs });
                                }}
                              >
                                <option value="Singer">Singer</option>
                                <option value="Rapper">Rapper</option>
                                <option value="Feature">Feature</option>
                              </select>
                              <input 
                                placeholder="Spotify link"
                                className="flex-1 bg-transparent border-none text-[9px] text-gray-600 focus:outline-none focus:text-[#ccff00]"
                                value={c.spotify}
                                onChange={(e) => {
                                  const newContribs = [...track.additionalContributors];
                                  newContribs[i].spotify = e.target.value;
                                  updateTrack(track.id, { additionalContributors: newContribs });
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                       <label className="text-xs font-display uppercase tracking-widest text-gray-500 block">Explicit Content?</label>
                       <div className="flex gap-4">
                         {['Yes', 'No'].map(v => (
                           <button
                             key={v}
                             type="button"
                             onClick={() => updateTrack(track.id, { isExplicit: v as any })}
                             className={`flex-1 py-3 border font-display uppercase tracking-widest text-[10px] font-black transition-all ${
                               track.isExplicit === v 
                                 ? 'bg-white text-black border-white' 
                                 : 'bg-black border-white/10 text-gray-600 hover:border-gray-500'
                             }`}
                           >
                             {v}
                           </button>
                         ))}
                       </div>
                       {track.isExplicit === 'Yes' && (
                         <textarea 
                           className="w-full bg-black border border-red-500/20 p-4 text-white font-sans text-xs min-h-[120px] outline-none focus:border-red-500 transition-all"
                           placeholder="Full lyrics required for explicit tracks..."
                           value={track.lyrics}
                           onChange={(e) => updateTrack(track.id, { lyrics: e.target.value })}
                           required
                         />
                       )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Section C: Credits & Label */}
        <div className="bg-[#111] p-6 sm:p-8 border border-[#333]">
          <div className="mb-6 border-b border-[#333] pb-4">
            <h2 className="text-xl font-display uppercase tracking-widest text-[#ccff00] mb-1">Section C: Distribution Info</h2>
            <p className="text-xs text-gray-500 font-sans">Legal ownership and platform mappings.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <InputField 
              label="Label Name (Optional)" 
              name="labelName" 
              value={formData.labelName} 
              onChange={handleChange} 
              tooltip="Official label name."
            />
            <InputField label="UPC (Optional)" name="upc" value={formData.upc} onChange={handleChange} tooltip="Album-level barcode." />
            
            <InputField 
              label="P Line (Copyright) *" 
              name="pLine" 
              value={formData.pLine} 
              onChange={handleChange} 
              required 
              helperText="e.g. 2026 Gati Music"
            />
            <InputField 
              label="C Line (Composition) *" 
              name="cLine" 
              value={formData.cLine} 
              onChange={handleChange} 
              required 
              helperText="e.g. 2026 Gati Music"
            />
            
            <InputField 
              label="Production Year" 
              name="productionYear" 
              value={formData.productionYear} 
              onChange={handleChange} 
            />
            <InputField 
              label="Copyright Year" 
              name="copyrightYear" 
              value={formData.copyrightYear} 
              onChange={handleChange} 
            />
          </div>
        </div>

        {/* Section D: Release Controls */}
        <div className="bg-[#111] p-6 sm:p-8 border border-[#333]">
           <div className="mb-6 border-b border-[#333] pb-4">
            <h2 className="text-xl font-display uppercase tracking-widest text-[#ccff00] mb-1">Section D: Release Timeline</h2>
            <p className="text-xs text-gray-500 font-sans">Set your global release window.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-xs font-display uppercase tracking-widest text-gray-500">Release Date (Optional)</label>
              <input 
                type="date"
                name="scheduleDate"
                value={formData.scheduleDate}
                onChange={handleChange}
                className="w-full bg-black border-b border-[#333] py-3 text-white font-sans text-sm focus:outline-none focus:border-[#ccff00]"
              />
              <p className="text-[10px] text-gray-600 font-sans italic italic">Leave blank for ASAP release. Suggested: 14+ days for pitch.</p>
            </div>
            
            <InputField 
              label="Exclude Platforms (Optional)" 
              name="excludedPlatforms" 
              value={formData.excludedPlatforms} 
              onChange={handleChange} 
              placeholder="e.g. Resso, Amazon"
            />
          </div>
        </div>

        {/* Section E: Profile Mapping */}
        <div className="bg-[#111] p-6 sm:p-8 border border-[#333]">
          <div className="mb-4 border-b border-[#333] pb-4">
            <h2 className="text-xl font-display uppercase tracking-widest text-[#ccff00] mb-1">Section E: Profile Mapping</h2>
            <p className="text-xs text-gray-500 font-sans">Connect your store profiles.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <InputField label="Spotify Artist Link" name="mainSpotifyLink" value={formData.mainSpotifyLink} onChange={handleChange} />
            <InputField label="Additional Spotify Links" name="featureSpotifyLinks" value={formData.featureSpotifyLinks} onChange={handleChange} />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading || isUploading}
          className="relative w-full overflow-hidden bg-white text-black font-display font-black py-6 uppercase tracking-[0.2em] text-lg hover:bg-[#ccff00] transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {getButtonText()} 
            {!loading && !isUploading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
            {isUploading && <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>}
          </span>
          {hasUploadErrors && !loading && (
            <p className="absolute bottom-1 left-0 right-0 text-[8px] text-red-500 font-display font-black tracking-widest">
              Please fix upload errors before distributing
            </p>
          )}
        </button>
      </form>
    </div>
  );
}

function Tooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block ml-2 group">
      <button 
        type="button"
        onClick={() => setShow(!show)}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="text-gray-600 hover:text-[#ccff00] transition-colors"
      >
        <HelpCircle size={14} />
      </button>
      {show && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-[#222] border border-[#333] text-[10px] text-gray-300 font-sans leading-relaxed shadow-xl rounded-lg animate-in fade-in slide-in-from-bottom-1">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[#222]"></div>
        </div>
      )}
    </div>
  );
}

function MultiSelectField({ label, name, value, onChange, options, tooltip, required = false }: any) {
  const toggleOption = (opt: string) => {
    const newValue = value.includes(opt) 
      ? value.filter((v: string) => v !== opt)
      : [...value, opt];
    onChange({ target: { name, value: newValue } });
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center mb-2">
        <label className="text-xs font-display uppercase tracking-widest text-gray-500">{label}</label>
        {tooltip && <Tooltip text={tooltip} />}
      </div>
      <div className="flex flex-wrap gap-2 p-3 bg-black border border-[#333] min-h-[50px] items-center">
        {value.length === 0 && <span className="text-[10px] text-gray-700 uppercase font-sans">Select Multiple...</span>}
        {value.map((v: string) => (
          <span key={v} className="bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] text-[10px] px-2 py-1 flex items-center gap-1 font-sans">
            {v}
            <button type="button" onClick={() => toggleOption(v)} className="hover:text-white"><X size={10} /></button>
          </span>
        ))}
      </div>
      <div className="mt-2 max-h-32 overflow-y-auto border border-[#222] bg-[#0a0a0a]">
        {options.map((opt: string) => (
          <button
            key={opt}
            type="button"
            onClick={() => toggleOption(opt)}
            className={`w-full text-left px-3 py-2 text-[10px] font-sans border-b border-[#111] transition-colors ${value.includes(opt) ? 'bg-[#ccff00]/5 text-[#ccff00]' : 'text-gray-500 hover:bg-[#111]'}`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function SelectField({ label, name, value, onChange, options, tooltip, required = false }: any) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center mb-2">
        <label className="text-xs font-display uppercase tracking-widest text-gray-500">{label}</label>
        {tooltip && <Tooltip text={tooltip} />}
      </div>
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="bg-black border-b border-[#333] py-2 text-white font-sans focus:outline-none focus:border-white transition-colors cursor-pointer"
      >
        <option value="">Select...</option>
        {options.map((opt: string) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

function InputField({ label, name, value, onChange, tooltip, required = false, helperText = "", placeholder = "", type = "text" }: any) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center mb-2">
        <label className="text-xs font-display uppercase tracking-widest text-gray-500">{label}</label>
        {tooltip && <Tooltip text={tooltip} />}
      </div>
      <input 
        type={type}
        name={name} 
        value={value} 
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="bg-transparent border-b border-[#333] py-2 text-white font-sans focus:outline-none focus:border-white transition-colors placeholder:text-gray-700"
      />
      {helperText && <p className="text-[10px] text-gray-500 mt-2 font-sans italic">{helperText}</p>}
    </div>
  );
}
