import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage, handleFirestoreError, OperationType } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { Plus, X, CheckCircle } from 'lucide-react';

export default function ArtistUpload({ user }: { user: any }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
    otherCredits: "",
    scheduleDate: "",
    mainSpotifyLink: "",
    featureSpotifyLinks: "",
    excludedPlatforms: "",
    audioUrl: "", 
    coverUrl: ""
  });

  const [additionalArtists, setAdditionalArtists] = useState<string[]>([]);
  const [audioInputType, setAudioInputType] = useState('file'); // 'file' or 'link'
  const [coverInputType, setCoverInputType] = useState('file'); // 'file' or 'link'
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [audioProgress, setAudioProgress] = useState(-1);
  const [coverProgress, setCoverProgress] = useState(-1);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addArtistField = () => {
    setAdditionalArtists([...additionalArtists, ""]);
  };

  const updateAdditionalArtist = (index: number, value: string) => {
    const newArtists = [...additionalArtists];
    newArtists[index] = value;
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
  };

  const validateCoverFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['png', 'jpg', 'jpeg', 'pdf'].includes(ext || '')) {
      throw new Error("Invalid cover format! Please upload a PNG, JPG, JPEG, or PDF file.");
    }
  };

  const isValidUrl = (url: string) => {
    return /^https?:\/\/.+/.test(url.trim());
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setAudioProgress(-1);
    setCoverProgress(-1);

    try {
      if (!formData.title || !formData.mainArtist || !formData.pLine || !formData.cLine || !formData.lyricist) {
        throw new Error("Please fill all required text fields.");
      }

      let finalAudioUrl = formData.audioUrl;
      let finalCoverUrl = formData.coverUrl;

      // Validate Audio
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

      // Uploads (Parallel)
      const uploadPromises: Promise<void>[] = [];

      if (audioInputType === 'file' && audioFile) {
        setAudioProgress(0);
        const audioRef = ref(storage, `uploads/${user.uid}/${Date.now()}_audio_${audioFile.name}`);
        const uploadTask = uploadBytesResumable(audioRef, audioFile);
        uploadPromises.push(new Promise((resolve, reject) => {
          uploadTask.on('state_changed',
            (snapshot) => setAudioProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
            (error) => reject(error),
            async () => {
              finalAudioUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve();
            }
          );
        }));
      }

      if (coverInputType === 'file' && coverFile) {
        setCoverProgress(0);
        const coverRef = ref(storage, `uploads/${user.uid}/${Date.now()}_cover_${coverFile.name}`);
        const uploadTask = uploadBytesResumable(coverRef, coverFile);
        uploadPromises.push(new Promise((resolve, reject) => {
          uploadTask.on('state_changed',
            (snapshot) => setCoverProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
            (error) => reject(error),
            async () => {
              finalCoverUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve();
            }
          );
        }));
      }

      await Promise.all(uploadPromises);

      const combinedFeatureArtists = [
        ...formData.featuringArtists.split(',').map(s => s.trim()).filter(Boolean),
        ...additionalArtists.map(s => s.trim()).filter(Boolean)
      ];

      await addDoc(collection(db, 'submissions'), {
        uid: user.uid,
        title: formData.title,
        mainArtist: formData.mainArtist,
        featuringArtists: combinedFeatureArtists,
        labelName: formData.labelName,
        pLine: formData.pLine,
        cLine: formData.cLine,
        lyricist: formData.lyricist,
        producer: formData.producer,
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
      
      // Show Success screen
      setSuccess(true);
      
    } catch (err: any) {
      if(err.message?.includes('Missing or insufficient permissions')) {
        handleFirestoreError(err, OperationType.CREATE, 'submissions');
      } else {
        if (err.code?.startsWith('storage/')) {
          setError("UPLOAD_ERROR");
        } else {
          setError(err.message || "Failed to submit release.");
        }
      }
    } finally {
      setLoading(false);
      setAudioProgress(-1);
      setCoverProgress(-1);
    }
  };

  if (success) {
    return (
      <div className="max-w-3xl pb-20 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-[#ccff00]/20 text-[#ccff00] rounded-full flex items-center justify-center mb-6">
          <CheckCircle size={40} />
        </div>
        <h1 className="text-3xl lg:text-4xl font-display uppercase tracking-tighter mb-4 text-white">Release Submitted!</h1>
        <p className="text-gray-400 font-sans text-lg mb-8 max-w-lg">
          Your song has been submitted for review, It usually takes 6-8 hours to be reviewed.
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

  return (
    <div className="max-w-3xl">
      <div className="mb-10">
        <h1 className="text-4xl font-display uppercase tracking-tighter mb-2">Upload New Release</h1>
        <p className="text-gray-400">Fill details carefully to avoid delays.</p>
      </div>

      {error === "UPLOAD_ERROR" ? (
        <div className="bg-red-500/10 border border-red-500 p-6 mb-8">
          <h3 className="text-red-500 font-display font-bold uppercase tracking-widest mb-2 text-lg">Upload Failed</h3>
          <p className="text-gray-300 font-sans text-sm mb-6">
            There was a problem uploading your audio or image files to the server. This can happen due to restricted file size policies or network errors.
          </p>
          <a 
            href="https://wa.me/917626841258?text=Hi,%20I%20am%20getting%20an%20error%20while%20uploading%20my%20files%20on%20the%20Gati%20Dashboard." 
            target="_blank" rel="noopener noreferrer"
            className="inline-block bg-[#ccff00] text-black font-display font-bold tracking-widest uppercase px-6 py-3 text-sm hover:bg-white transition-colors"
          >
            Message Support on WhatsApp
          </a>
        </div>
      ) : error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 mb-8 font-sans">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 pb-20">
        <div className="bg-[#111] p-6 sm:p-8 border border-[#333]">
          <div className="mb-6 border-b border-[#333] pb-4">
            <h2 className="text-xl font-display uppercase tracking-widest text-[#ccff00] mb-1">Section A: Basic Info</h2>
            <p className="text-xs text-gray-500 font-sans">Provide the core details of your release. Ensure spelling is exactly as you want it on streaming platforms.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <InputField label="Song Title *" name="title" value={formData.title} onChange={handleChange} required />
            <InputField label="Artist Name *" name="mainArtist" value={formData.mainArtist} onChange={handleChange} required />
            <div className="md:col-span-2 space-y-4">
              <label className="text-xs font-display uppercase tracking-widest text-gray-500">Additional Artists (Optional)</label>
              {additionalArtists.map((artist, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={artist}
                    onChange={(e) => updateAdditionalArtist(index, e.target.value)}
                    placeholder="Enter artist name"
                    className="flex-1 bg-transparent border-b border-[#333] py-2 text-white font-sans focus:outline-none focus:border-white transition-colors"
                  />
                  <button type="button" onClick={() => removeAdditionalArtist(index)} className="text-gray-500 hover:text-red-500 transition-colors p-2">
                    <X size={18} />
                  </button>
                </div>
              ))}
              <button 
                type="button" 
                onClick={addArtistField}
                className="flex items-center gap-2 text-[#ccff00] text-xs font-display uppercase tracking-widest font-bold hover:text-white transition-colors"
              >
                <Plus size={16} /> Add More Artists
              </button>
            </div>
          </div>
        </div>

        <div className="bg-[#111] p-6 sm:p-8 border border-[#333]">
          <div className="mb-6 border-b border-[#333] pb-4">
            <h2 className="text-xl font-display uppercase tracking-widest text-[#ccff00] mb-1">Section B: Credits</h2>
            <p className="text-xs text-gray-500 font-sans">Credit the people behind your music. Required by all major streaming services.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <InputField label="Label Name (Optional)" name="labelName" value={formData.labelName} onChange={handleChange} />
            <InputField label="Producer (Optional)" name="producer" value={formData.producer} onChange={handleChange} />
            
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
          <div className="mb-8 border border-[#333] p-4 bg-[#0a0a0a]">
            <div className="flex justify-between items-center mb-4 border-b border-[#333] pb-2">
              <label className="text-sm font-display uppercase tracking-widest text-white">Audio File *</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setAudioInputType('file')} className={`text-xs font-display px-3 py-1 uppercase font-bold ${audioInputType === 'file' ? 'bg-[#ccff00] text-black' : 'bg-[#333] text-gray-400'}`}>Upload</button>
                <button type="button" onClick={() => setAudioInputType('link')} className={`text-xs font-display px-3 py-1 uppercase font-bold ${audioInputType === 'link' ? 'bg-[#ccff00] text-black' : 'bg-[#333] text-gray-400'}`}>Link</button>
              </div>
            </div>
            
            {audioInputType === 'file' ? (
              <div>
                <input 
                  type="file" 
                  accept=".mp3,.m4a,.wav,audio/*"
                  onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                  className="w-full text-sm font-sans text-gray-400 file:mr-4 file:py-2 file:px-4 file:bg-[#333] file:border-none file:text-white file:cursor-pointer"
                />
                <p className="text-xs text-gray-500 mt-2 font-sans">Supported formats: MP3, M4A, WAV.</p>
              </div>
            ) : (
              <div>
                <input 
                  type="url" 
                  name="audioUrl"
                  value={formData.audioUrl} 
                  onChange={handleChange}
                  placeholder="https://drive.google.com/..."
                  className="w-full bg-transparent border-b border-[#333] py-2 text-white font-sans focus:outline-none focus:border-[#ccff00]"
                />
                <p className="text-xs text-gray-500 mt-2 font-sans">Provide a publicly accessible URL (Google Drive, Dropbox, etc).</p>
              </div>
            )}
          </div>

          {/* Cover Upload */}
          <div className="border border-[#333] p-4 bg-[#0a0a0a]">
            <div className="flex justify-between items-center mb-4 border-b border-[#333] pb-2">
              <label className="text-sm font-display uppercase tracking-widest text-white">Cover Art *</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setCoverInputType('file')} className={`text-xs font-display px-3 py-1 uppercase font-bold ${coverInputType === 'file' ? 'bg-[#ccff00] text-black' : 'bg-[#333] text-gray-400'}`}>Upload</button>
                <button type="button" onClick={() => setCoverInputType('link')} className={`text-xs font-display px-3 py-1 uppercase font-bold ${coverInputType === 'link' ? 'bg-[#ccff00] text-black' : 'bg-[#333] text-gray-400'}`}>Link</button>
              </div>
            </div>
            
            {coverInputType === 'file' ? (
              <div>
                <input 
                  type="file" 
                  accept=".png,.jpg,.jpeg,.pdf,image/*"
                  onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                  className="w-full text-sm font-sans text-gray-400 file:mr-4 file:py-2 file:px-4 file:bg-[#333] file:border-none file:text-white file:cursor-pointer"
                />
                <p className="text-xs text-gray-500 mt-2 font-sans">Supported formats: PNG, JPG, JPEG, PDF. Minimum size 3000x3000px.</p>
              </div>
            ) : (
              <div>
                <input 
                  type="url" 
                  name="coverUrl"
                  value={formData.coverUrl} 
                  onChange={handleChange}
                  placeholder="https://drive.google.com/..."
                  className="w-full bg-transparent border-b border-[#333] py-2 text-white font-sans focus:outline-none focus:border-[#ccff00]"
                />
                <p className="text-xs text-gray-500 mt-2 font-sans">Provide a publicly accessible URL for your artwork.</p>
              </div>
            )}
          </div>

          {/* Progress Bars */}
          {(audioProgress >= 0 || coverProgress >= 0) && (
            <div className="mt-6 space-y-4">
              {audioProgress >= 0 && (
                <div>
                  <div className="flex justify-between text-xs font-sans text-gray-400 mb-2">
                    <span className="font-display tracking-widest uppercase text-white font-bold">Uploading Audio...</span>
                    <span>{Math.round(audioProgress)}%</span>
                  </div>
                  <div className="w-full bg-[#333] h-2 overflow-hidden">
                    <div className="bg-[#ccff00] h-full transition-all duration-300" style={{ width: `${audioProgress}%` }}></div>
                  </div>
                </div>
              )}
              {coverProgress >= 0 && (
                <div>
                  <div className="flex justify-between text-xs font-sans text-gray-400 mb-2">
                    <span className="font-display tracking-widest uppercase text-white font-bold">Uploading Cover...</span>
                    <span>{Math.round(coverProgress)}%</span>
                  </div>
                  <div className="w-full bg-[#333] h-2 overflow-hidden">
                    <div className="bg-[#ccff00] h-full transition-all duration-300" style={{ width: `${coverProgress}%` }}></div>
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
          {loading ? "Submitting..." : "Submit Release"}
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
