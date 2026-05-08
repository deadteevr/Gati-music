import { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, doc, getDoc, query, where, getDocs } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../../firebase';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, X, CheckCircle, CheckCircle2, Sparkles, ShieldAlert, Mail, AlertCircle, Info, HelpCircle, Gift, ArrowRight } from 'lucide-react';
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
    composer: "",
    producer: "",
    producerSpotify: "",
    otherCredits: "",
    scheduleDate: "",
    mainSpotifyLink: "",
    featureSpotifyLinks: "",
    excludedPlatforms: "",
    audioUrl: "", 
    coverUrl: "",
    isExplicit: "" as "Yes" | "No" | "",
    lyrics: "",
    primaryGenre: [] as string[],
    secondaryGenre: [] as string[],
    language: ["Hindi"],
    isrc: "",
    upc: "",
    copyrightYear: new Date().getFullYear().toString(),
    productionYear: new Date().getFullYear().toString(),
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
        
        setFormData({
          title: data.title || "",
          mainArtist: data.mainArtist || "",
          featuringArtists: Array.isArray(data.featuringArtists) ? data.featuringArtists.join(', ') : (data.featuringArtists || ""),
          labelName: data.labelName || "",
          pLine: data.pLine || "",
          cLine: data.cLine || "",
          lyricist: data.lyricist || "",
          composer: data.composer || "",
          producer: data.producer || "",
          producerSpotify: data.producerSpotify || "",
          otherCredits: data.otherCredits || "",
          scheduleDate: data.scheduleDate || "",
          mainSpotifyLink: data.mainSpotifyLink || "",
          featureSpotifyLinks: data.featureSpotifyLinks || "",
          excludedPlatforms: data.excludedPlatforms || "",
          audioUrl: data.audioUrl || "",
          coverUrl: data.coverUrl || "",
          isExplicit: data.isExplicit === true ? "Yes" : (data.isExplicit === false ? "No" : ""),
          lyrics: data.lyrics || "",
          primaryGenre: Array.isArray(data.primaryGenre) ? data.primaryGenre : (data.primaryGenre ? [data.primaryGenre] : []),
          secondaryGenre: Array.isArray(data.secondaryGenre) ? data.secondaryGenre : (data.secondaryGenre ? [data.secondaryGenre] : []),
          language: Array.isArray(data.language) ? data.language : (data.language ? [data.language] : ["Hindi"]),
          isrc: data.isrc || "",
          upc: data.upc || "",
          copyrightYear: data.copyrightYear || new Date().getFullYear().toString(),
          productionYear: data.productionYear || new Date().getFullYear().toString(),
        });
        
        if (data.additionalContributors) {
          setAdditionalArtists(data.additionalContributors);
        }

        // If it was already successful, we can show it as fixed-path link mode
        if (data.audioUrl) setAudioInputType('link');
        if (data.coverUrl) setCoverInputType('link');
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

    if (audioStatus === 'uploading' || coverStatus === 'uploading') {
      const parts = [];
      const trackAudio = audioStatus === 'uploading' ? Math.max(0, audioProgress === -1 ? 1 : audioProgress) : (audioStatus === 'success' ? 100 : null);
      const trackCover = coverStatus === 'uploading' ? Math.max(0, coverProgress === -1 ? 1 : coverProgress) : (coverStatus === 'success' ? 100 : null);
      
      if (trackAudio !== null) parts.push(trackAudio);
      if (trackCover !== null) parts.push(trackCover);
      
      if (parts.length > 0) {
        let avg = parts.reduce((a, b) => a + b, 0) / parts.length;
        
        // Stuck at 0 check
        if (avg <= 1 && loading) {
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
        setUploadMessage("Uploading assets...");
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
      const missingFields = [];
      if (!formData.title) missingFields.push("Song Title");
      if (!formData.mainArtist) missingFields.push("Artist Name");
      if (!formData.pLine) missingFields.push("P Line");
      if (!formData.cLine) missingFields.push("C Line");
      if (!formData.lyricist) missingFields.push("Lyricist (Full legal name)");
      if (!formData.composer) missingFields.push("Composer (Full legal name)");
      if (!formData.isExplicit) missingFields.push("Parental Advisory selection");
      
      if (missingFields.length > 0) {
        throw new Error(`Please fill required fields: ${missingFields.join(", ")}`);
      }

      if (formData.isExplicit === 'Yes' && !formData.lyrics.trim()) {
        throw new Error("Lyrics are required for explicit content releases.");
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

      // Upload Function (Cloudinary)
      const uploadToCloudinary = async (file: File, type: 'audio' | 'image', setProgress: (p: number) => void, setStatus: (s: any) => void) => {
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

        if (!cloudName || !uploadPreset) {
          throw new Error("Cloudinary not configured correctly. Please check VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in your environment variables.");
        }

        console.log(`Starting Cloudinary upload for ${type}...`);
        setStatus('uploading');
        setProgress(0); 

        const formDataCloud = new FormData();
        formDataCloud.append('file', file);
        formDataCloud.append('upload_preset', uploadPreset);
        formDataCloud.append('folder', `gati/${auth.currentUser?.uid}`);

        const xhr = new XMLHttpRequest();
        // Add a timeout of 10 minutes for large files
        xhr.timeout = 600000; 
        
        // Audio files must use resource_type: "video" to be accepted by Cloudinary if they are mp3/wav/m4a
        const resourceType = type === 'audio' ? 'video' : 'image';
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`);

        return new Promise<string>((resolve, reject) => {
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const percent = (e.loaded / e.total) * 100;
              setProgress(percent);
            }
          };

          xhr.onload = () => {
            if (xhr.status === 200 || xhr.status === 201) {
              const res = JSON.parse(xhr.responseText);
              console.log(`${type} upload success: ${res.secure_url}`);
              setStatus('success');
              setProgress(100);
              resolve(res.secure_url);
            } else {
              console.error(`${type} upload failed status ${xhr.status}:`, xhr.responseText);
              setStatus('error');
              reject(new Error(`Cloudinary Error (${xhr.status}): ${xhr.responseText}`));
            }
          };

          xhr.ontimeout = () => {
            setStatus('error');
            reject(new Error('Upload timed out. Please check your internet connection and try again.'));
          };

          xhr.onerror = (err) => {
            console.error(`${type} upload network error:`, err);
            setStatus('error');
            const errorMsg = 'Network Error: Could not connect to Cloudinary. This happens if the domain gatimusic.in is not allowlisted in your Cloudinary Settings > Security > Restricted allowed referrers.';
            reject(new Error(errorMsg));
          };

          xhr.send(formDataCloud);
        });
      };

      // Execute Uploads
      const uploadPromises: Promise<any>[] = [];

      if (audioInputType === 'file' && audioFile) {
        uploadPromises.push(uploadToCloudinary(audioFile, 'audio', setAudioProgress, setAudioStatus).then(url => finalAudioUrl = url));
      }

      if (coverInputType === 'file' && coverFile) {
        uploadPromises.push(uploadToCloudinary(coverFile, 'image', setCoverProgress, setCoverStatus).then(url => finalCoverUrl = url));
      }

      if (uploadPromises.length > 0) {
        setUploadMessage("Uploading assets...");
        await Promise.all(uploadPromises);
      }

      
      console.log("All uploads finished. Saving metadata to Firestore...");

      const submissionData = {
        uid: user.uid,
        title: formData.title,
        mainArtist: formData.mainArtist,
        featuringArtists: formData.featuringArtists.split(',').map(s => s.trim()).filter(Boolean),
        additionalContributors: additionalArtists,
        labelName: formData.labelName || userData.managedByLabelName || "",
        labelId: userData.labelId || null,
        pLine: formData.pLine,
        cLine: formData.cLine,
        lyricist: formData.lyricist,
        composer: formData.composer,
        producer: formData.producer,
        producerSpotify: formData.producerSpotify,
        otherCredits: formData.otherCredits,
        scheduleDate: formData.scheduleDate,
        mainSpotifyLink: formData.mainSpotifyLink,
        featureSpotifyLinks: formData.featureSpotifyLinks,
        excludedPlatforms: formData.excludedPlatforms,
        audioUrl: finalAudioUrl,
        coverUrl: finalCoverUrl,
        isExplicit: formData.isExplicit === 'Yes',
        primaryGenre: formData.primaryGenre,
        secondaryGenre: formData.secondaryGenre,
        language: formData.language,
        isrc: formData.isrc,
        upc: formData.upc,
        copyrightYear: formData.copyrightYear,
        productionYear: formData.productionYear,
        status: "Reviewing",
        updatedAt: new Date().toISOString(),
      };

      try {
        if (id) {
          await updateDoc(doc(db, 'submissions', id), submissionData);
        } else {
          await addDoc(collection(db, 'submissions'), {
            ...submissionData,
            createdAt: new Date().toISOString(),
          });
        }
      } catch (err: any) {
        handleFirestoreError(err, id ? OperationType.UPDATE : OperationType.CREATE, 'submissions', false);
        throw err;
      }

      // Update User Upload Count & Expiry Logic (Only for new uploads)
      if (!id) {
        try {
          const isLabelPlan = ['Label Monthly', 'Label Yearly'].includes(userData.subscription?.planType);
          const newUploadCount = (userData.subscription?.uploadCount || 0) + 1;
          const isBasic = userData.subscription?.planType === 'Basic';
          const shouldExpire = isBasic && newUploadCount >= 1;

          await updateDoc(doc(db, 'users', user.uid), {
            'subscription.uploadCount': newUploadCount,
            'subscription.status': (isLabelPlan || !shouldExpire) ? userData.subscription?.status : 'Expired'
          });
        } catch (err: any) {
          handleFirestoreError(err, OperationType.UPDATE, 'users', false);
          // Fixed issues with business logic failure
        }
      }

      // Log Activity
      try {
        await addDoc(collection(db, 'activity_logs'), {
          uid: user.uid,
          type: id ? 'song_updated' : 'song_uploaded',
          message: id ? `Resubmitted release: ${formData.title}` : `Uploaded new release: ${formData.title}`,
          timestamp: new Date().toISOString()
        });
      } catch (err: any) {
        handleFirestoreError(err, OperationType.CREATE, 'activity_logs', false);
      }
      
      console.log("Submission successful!");
      // Show Success screen
      setSuccess(true);
      
    } catch (err: any) {
      console.error("Submission error:", err);
      let message = "Failed to submit release.";
      
      if (err.message && err.message.startsWith('{')) {
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
    if (!loading) return id ? "Resubmit Release" : "Submit Release";
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
          {id ? 'Fix Your Release' : 'Upload New Release'}
        </h1>
        <p className="text-gray-400">
          {id ? 'Review and correct the requested fields.' : 'Fill details carefully to avoid delays.'}
        </p>
      </div>

      {id && formData.title && (
        <div className="mb-8 p-6 bg-red-500/5 border border-red-500/20 rounded-lg flex gap-4 items-start">
          <AlertCircle className="text-red-500 shrink-0 mt-1" size={24} />
          <div>
            <h3 className="text-red-500 font-display uppercase tracking-widest text-sm font-bold mb-2">Admin Feedback</h3>
            <p className="text-gray-300 text-sm font-sans italic">
              "Please check the fields highlighted or read the 'Changes Required' notes in your status tab."
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 pb-20">
        {/* ... Sections A to D remain same ... */}
        <div className="bg-[#111] p-6 sm:p-8 border border-[#333]">
          <div className="mb-6 border-b border-[#333] pb-4">
            <h2 className="text-xl font-display uppercase tracking-widest text-[#ccff00] mb-1">Section A: Basic Info</h2>
            <p className="text-xs text-gray-500 font-sans">Provide the core details of your release. Ensure spelling is exactly as you want it on streaming platforms.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <InputField 
              label="Song Title *" 
              name="title" 
              value={formData.title} 
              onChange={handleChange} 
              required 
              tooltip="Title of your song. Example: 'Pasoori', 'Tera Ghata'."
            />
            <InputField 
              label="Artist Name *" 
              name="mainArtist" 
              value={formData.mainArtist} 
              onChange={handleChange} 
              required 
              tooltip="The primary artist seen on the release. Example: 'Gurbax', 'Ali Sethi'."
            />
            
            <MultiSelectField 
              label="Primary Genre *" 
              name="primaryGenre" 
              value={formData.primaryGenre} 
              onChange={handleChange} 
              options={GENRES} 
              required 
              tooltip="Main genre of the track. Example: 'Bollywood', 'Hip-Hop'."
            />
            <MultiSelectField 
              label="Language *" 
              name="language" 
              value={formData.language} 
              onChange={handleChange} 
              options={LANGUAGES} 
              required 
              tooltip="Language of the lyrics. Example: 'Hindi', 'Punjabi'."
            />
            <MultiSelectField 
              label="Secondary Genre (Optional)" 
              name="secondaryGenre" 
              value={formData.secondaryGenre} 
              onChange={handleChange} 
              options={GENRES} 
              tooltip="A second genre for better algorithm tagging. Example: 'Pop', 'Lo-Fi'."
            />
            
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
              <h2 className="text-xl font-display uppercase tracking-widest text-[#ccff00] mb-1">Section B: Credits & Label</h2>
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
            <InputField 
              label="Label Name (Optional)" 
              name="labelName" 
              value={formData.labelName} 
              onChange={handleChange} 
              tooltip="Your record label. If independent, write your stage name. Example: 'Gati Records', 'Self-Released'."
            />
            
            <div className="space-y-4">
              <InputField 
                label="Producer (Optional)" 
                name="producer" 
                value={formData.producer} 
                onChange={handleChange} 
                tooltip="Who produced the beat/music. Example: 'Sez On The Beat', 'Gurbax'."
              />
              {formData.producer && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <InputField 
                    label="Producer Spotify Link (Optional)" 
                    name="producerSpotify" 
                    value={formData.producerSpotify} 
                    onChange={handleChange}
                    placeholder="https://open.spotify.com/artist/..."
                    tooltip="Spotify profile link of the producer for automatic credit mapping."
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
              tooltip="Phonographic copyright. Usually the owner of the master recording. Example: '2024 Gati Music Distribution'."
              helperText="Example: 2026 Karan Aujla"
            />
            <InputField 
              label="C Line (Composition) *" 
              name="cLine" 
              value={formData.cLine} 
              onChange={handleChange} 
              required 
              tooltip="Composition copyright. Usually the owner of the lyrics/composition. Example: '2024 Gati Music Distribution'."
              helperText="Example: 2026 Karan Aujla"
            />
            
            <InputField 
              label="Lyricist (Real Full Name) *" 
              name="lyricist" 
              value={formData.lyricist} 
              onChange={handleChange} 
              required
              tooltip="Enter the real legal name (First + Last). NO STAGE NAMES. Required for collecting royalties from public performances (Clubs, Radio, etc.)."
              helperText="Legal First + Last Name"
            />
            <InputField 
              label="Composer (Real Full Name) *" 
              name="composer" 
              value={formData.composer} 
              onChange={handleChange} 
              required
              tooltip="Enter the real legal name (First + Last) of who composed the music. NO ALIASES. Correct legal names ensure accurate royalty distribution."
              helperText="Legal First + Last Name"
            />
            
            <InputField 
              label="Other Credits (Optional)" 
              name="otherCredits" 
              value={formData.otherCredits} 
              onChange={handleChange} 
              tooltip="Any other roles like Mixing, Mastering, or Arranger."
            />

            <div className="md:col-span-2 p-4 bg-blue-500/5 border border-blue-500/20 rounded">
              <p className="text-[10px] text-blue-400 font-display uppercase tracking-widest font-bold mb-2 flex items-center gap-1">
                <Info size={12} /> Important: Metadata IDs
              </p>
              <p className="text-[10px] text-gray-500 font-sans leading-relaxed">
                Leave ISRC and UPC blank if this is a <span className="text-white font-bold underline">NEW RELEASE</span>. 
                Our system will generate these codes for you automatically. 
                Only enter codes if you are <span className="text-white font-bold underline">RE-RELEASING</span> a song that already exists on other platforms with these exact codes.
              </p>
            </div>

            <InputField 
              label="ISRC (Optional)" 
              name="isrc" 
              value={formData.isrc} 
              onChange={handleChange} 
              helperText="WANT RE-RELEASE? Enter existing ISRC. ELSE LEAVE BLANK." 
              tooltip="International Standard Recording Code. Leave blank for first-time releases."
            />
            <InputField 
              label="UPC / EAN (Optional)" 
              name="upc" 
              value={formData.upc} 
              onChange={handleChange} 
              helperText="WANT RE-RELEASE? Enter existing UPC. ELSE LEAVE BLANK." 
              tooltip="Universal Product Code. Leave blank for first-time releases."
            />
            
            <InputField 
              label="Copyright Year (Line P)" 
              name="copyrightYear" 
              value={formData.copyrightYear} 
              onChange={handleChange} 
              tooltip="The year the recording was made."
            />
            <InputField 
              label="Production Year (Line C)" 
              name="productionYear" 
              value={formData.productionYear} 
              onChange={handleChange} 
              tooltip="The year the composition was created."
            />
          </div>
        </div>

        <div className="bg-[#111] p-6 sm:p-8 border border-[#333]">
          <div className="mb-6 border-b border-[#333] pb-4">
            <h2 className="text-xl font-display uppercase tracking-widest text-[#ccff00] mb-1">Section C: Release Settings</h2>
            <p className="text-xs text-gray-500 font-sans">Choose exactly when you want your audience to hear your music.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="border border-[#333] p-4 bg-[#0a0a0a]">
              <div className="flex items-center mb-2">
                <label className="block text-sm font-display uppercase tracking-widest text-white">Schedule Date (Optional)</label>
                <Tooltip text="When you want the song to go live. Choose at least 2-3 days from now. Leave empty for ASAP release." />
              </div>
              <p className="text-xs text-gray-400 font-sans mb-4">It takes 2-3 days to be live, so Choose release date accordingly. Leave empty for ASAP release.</p>
              <input 
                type="date" 
                name="scheduleDate" 
                value={formData.scheduleDate} 
                onChange={handleChange}
                className="w-full bg-transparent border-b border-[#333] py-2 text-white focus:outline-none focus:border-[#ccff00] font-sans"
              />
            </div>

            <div className="border border-[#333] p-4 bg-[#0a0a0a]">
              <div className="flex items-center mb-2">
                <label className="block text-sm font-display uppercase tracking-widest text-[#ccff00] font-bold">Parental Advisory Content *</label>
                <Tooltip text="Select 'Yes' if the song contains bad language or sensitive themes. Lyrics will be required for explicit content." />
              </div>
              <p className="text-[10px] text-gray-400 font-sans mb-4 uppercase tracking-widest">Does this song contain explicit lyrics or strong language?</p>
              
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isExplicit: 'Yes' })}
                  className={`flex-1 py-3 font-display uppercase tracking-widest text-xs font-bold transition-all border ${
                    formData.isExplicit === 'Yes' 
                      ? 'bg-red-500/20 border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                      : 'bg-[#111] border-[#333] text-gray-500 hover:border-gray-500'
                  }`}
                >
                  Yes (Explicit)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isExplicit: 'No' })}
                  className={`flex-1 py-3 font-display uppercase tracking-widest text-xs font-bold transition-all border ${
                    formData.isExplicit === 'No' 
                      ? 'bg-[#ccff00]/10 border-[#ccff00] text-[#ccff00] shadow-[0_0_15px_rgba(204,255,0,0.1)]' 
                      : 'bg-[#111] border-[#333] text-gray-500 hover:border-gray-500'
                  }`}
                >
                  No (Clean)
                </button>
              </div>
            </div>

            {formData.isExplicit === 'Yes' && (
              <div className="md:col-span-2 space-y-4 animate-in fade-in slide-in-from-top-4">
                <div className="flex items-center mb-2">
                  <label className="text-xs font-display uppercase tracking-widest text-red-500 font-bold">Full Lyrics (Required) *</label>
                  <Tooltip text="Full lyrics of the song. Required because explicit content is selected." />
                </div>
                <textarea 
                  name="lyrics"
                  value={formData.lyrics}
                  onChange={handleChange}
                  placeholder="Paste full lyrics here..."
                  className="w-full bg-black border border-[#333] p-4 text-white font-sans text-sm focus:border-red-500 outline-none transition-all min-h-[150px]"
                  required
                />
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#111] p-6 sm:p-8 border border-[#333]">
          <div className="mb-6 border-b border-[#333] pb-4">
            <h2 className="text-xl font-display uppercase tracking-widest text-[#ccff00] mb-1">Section D: Spotify Links</h2>
            <p className="text-xs text-gray-500 font-sans">Ensure this release is perfectly mapped to your existing Spotify artist profiles so you don't lose streams.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <InputField 
              label="Main Artist Spotify Link (Optional)" 
              name="mainSpotifyLink" 
              value={formData.mainSpotifyLink} 
              onChange={handleChange} 
              tooltip="Spotify profile link of the main artist for automatic credit mapping."
            />
            <InputField 
              label="Feature Artists Spotify Links (Optional)" 
              name="featureSpotifyLinks" 
              value={formData.featureSpotifyLinks} 
              onChange={handleChange} 
              tooltip="Comma-separated Spotify profile links of the feature artists."
            />
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
              <div className="flex items-center gap-2">
                <label className="text-xs font-display uppercase tracking-widest text-[#ccff00] font-bold">Audio File *</label>
                <Tooltip text="High quality audio file (MP3, WAV, or M4A). Max 100MB." />
              </div>
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
              <div className="flex items-center gap-2">
                <label className="text-xs font-display uppercase tracking-widest text-[#ccff00] font-bold">Cover Art *</label>
                <Tooltip text="Crisp cover artwork. Minimum 3000x3000px. PNG or JPG format." />
              </div>
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
                      accept=".png,.jpg,.jpeg,image/*"
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
          <InputField 
            label="Exclude Platforms (Optional)" 
            name="excludedPlatforms" 
            value={formData.excludedPlatforms} 
            onChange={handleChange} 
            tooltip="Type comma-separated platforms you do NOT want your music on (e.g. Spotify, TikTok). Leave blank to distribute everywhere."
          />
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
