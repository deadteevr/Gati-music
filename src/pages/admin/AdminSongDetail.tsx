import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, addDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { ArrowLeft, Save, Download, AlertTriangle, ExternalLink, Sparkles, History, RotateCcw, Trash2, CheckCircle, Info, ShieldAlert } from 'lucide-react';
import { geminiService } from '../../services/geminiService';
import { AIActionButton } from '../../components/AIComponents';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminSongDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [song, setSong] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<any>({});
  
  // UI Tabs
  const [activeTab, setActiveTab] = useState('Basic'); // Basic, Credits, Platform, History
  
  // AI State
  const [aiChecking, setAiChecking] = useState(false);
  const [aiCheckReport, setAiCheckReport] = useState<string | null>(null);
  const [aiGenerating, setAiGenerating] = useState(false);

  // Changes Required Modal State
  const [showChangesModal, setShowChangesModal] = useState(false);
  const [issueType, setIssueType] = useState('Metadata Error');
  const [problemDesc, setProblemDesc] = useState('');
  const [solutionDesc, setSolutionDesc] = useState('');

  useEffect(() => {
    fetchSong();
  }, [id]);

  const PREDEFINED_TEMPLATES: Record<string, { problem: string; solution: string }> = {
    "Audio Quality Issue": {
      problem: "The uploaded audio file has noticeable quality issues, such as clipping, background noise, or low bitrate.",
      solution: "Please upload a high-quality WAV or MP3 (320kbps) file that is clean and mastered properly."
    },
    "Incorrect File Format": {
      problem: "The audio or cover art file was uploaded in an unsupported format.",
      solution: "Please ensure audio is WAV, MP3, or M4A, and cover art is JPG or PNG."
    },
    "Cover Art Quality/Size": {
      problem: "The artwork is blurry, pixelated, or does not meet the minimum size requirement (3000x3000px).",
      solution: "Please upload a high-resolution, square image (3000x3000px) without any blur or pixelation."
    },
    "Missing/Incorrect Metadata": {
      problem: "There are typos in the song title, artist name, or other metadata fields.",
      solution: "Please review your submission details and correct any spelling mistakes or formatting errors."
    },
    "Copyright/Trademark Concern": {
      problem: "The submission appears to use copyrighted material (samples, cover art) without clear authorization.",
      solution: "Please provide proof of rights or remove the copyrighted elements from your release."
    },
    "Explicit Tag Missing": {
      problem: "The song contains explicit language but was marked as 'Clean'.",
      solution: "Please update the Parental Advisory field to 'Yes (Explicit)' so it matches the content."
    }
  };

  const applyTemplate = (type: string) => {
    const template = PREDEFINED_TEMPLATES[type];
    if (template) {
      setProblemDesc(template.problem);
      setSolutionDesc(template.solution);
      setIssueType(type);
    }
  };

  const fetchSong = async () => {
    if (!id) return;
    try {
      const docSnap = await getDoc(doc(db, 'submissions', id));
      if (docSnap.exists()) {
        setSong({ id: docSnap.id, ...docSnap.data() });
        setFormData(docSnap.data());
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, `submissions/${id}`, false);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackMetadataChange = (index: number, field: string, value: any) => {
    const nextTracks = [...(formData.tracks || [])];
    nextTracks[index] = { ...nextTracks[index], [field]: value };
    setFormData({ ...formData, tracks: nextTracks });
  };

  const handleMetadataChange = (e: any) => {
    const { name, value } = e.target;
    // Special handling for array fields
    if (['primaryGenre', 'secondaryGenre', 'language'].includes(name) && typeof value === 'string') {
      const arrayValue = value.split(',').map(s => s.trim()).filter(Boolean);
      setFormData({ ...formData, [name]: arrayValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSaveMetadata = async () => {
    setSaving(true);
    try {
      const prevVersions = song.metadataVersions || [];
      const currentSnapshot = { ...song };
      delete currentSnapshot.id;
      delete currentSnapshot.metadataVersions;

      await updateDoc(doc(db, 'submissions', id!), {
        ...formData,
        metadataVersions: [
          {
            timestamp: new Date().toISOString(),
            editor: 'Administrator',
            snapshot: currentSnapshot
          },
          ...prevVersions
        ]
      });
      alert('Metadata saved successfully!');
      fetchSong();
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `submissions/${id}`);
    } finally {
      setSaving(false);
    }
  };

  const revertToVersion = async (version: any) => {
    if (!window.confirm("Are you sure you want to revert to this version? Current unsaved changes will be lost, and a new version will be created.")) return;
    
    setSaving(true);
    try {
      const prevVersions = song.metadataVersions || [];
      const currentSnapshot = { ...song };
      delete currentSnapshot.id;
      delete currentSnapshot.metadataVersions;

      await updateDoc(doc(db, 'submissions', id!), {
        ...version.snapshot,
        metadataVersions: [
          {
            timestamp: new Date().toISOString(),
            editor: 'Administrator (Revert Action)',
            snapshot: currentSnapshot
          },
          ...prevVersions
        ]
      });
      alert('Successfully reverted to historical version.');
      fetchSong();
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `submissions/${id}`);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      await updateDoc(doc(db, 'submissions', id!), { status: newStatus });
      
      // Fetch artist email
      let artistEmail = '';
      const userSnap = await getDoc(doc(db, 'users', song.uid));
      if (userSnap.exists()) {
        artistEmail = userSnap.data()?.email;
      }

      // Notify artist transparently
      await addDoc(collection(db, 'notifications'), {
        uid: song.uid,
        title: 'Status Update',
        message: `Your track "${song.title}" status has been updated to: ${newStatus}`,
        read: false,
        createdAt: new Date().toISOString()
      });

      // Send Email Notification
      if (artistEmail) {
        try {
          await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: artistEmail,
              subject: `Update on your Release: ${song.title}`,
              text: `Hello, the status of your track "${song.title}" has been updated to ${newStatus}. Log in to your Gati dashboard to see more details.`
            })
          });
        } catch (emailErr) {
          console.error("Failed to send email notification:", emailErr);
        }
      }

      fetchSong();
      alert(`Status updated to ${newStatus} and notification sent.`);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `submissions/${id}`);
    }
  };

  const handleSubmitChangesRequired = async () => {
    if (!problemDesc || !solutionDesc) {
      alert("Please fill out both problem and solution descriptions.");
      return;
    }
    
    try {
      // 1. Update Status
      await updateDoc(doc(db, 'submissions', id!), { 
        status: 'Changes Required',
        changesRequiredNotes: {
          issueType,
          problemDesc,
          solutionDesc,
          timestamp: new Date().toISOString()
        }
      });

      // Fetch artist email
      let artistEmail = '';
      const userSnap = await getDoc(doc(db, 'users', song.uid));
      if (userSnap.exists()) {
        artistEmail = userSnap.data()?.email;
      }
      
      // 2. Send App Notification
      await addDoc(collection(db, 'notifications'), {
        uid: song.uid,
        title: `ACTION REQUIRED: "${song.title}"`,
        message: `Issue: ${issueType}. Problem: ${problemDesc}. Solution: ${solutionDesc}. Please edit your submission in the "My Releases" tab.`,
        read: false,
        createdAt: new Date().toISOString()
      });

      // 3. Send Email Notification
      if (artistEmail) {
        try {
          await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: artistEmail,
              subject: `Action Required for your Release: ${song.title}`,
              text: `Hello, an admin has requested changes for your track "${song.title}".\n\nIssue: ${issueType}\nProblem: ${problemDesc}\nSolution: ${solutionDesc}\n\nPlease log in to your dashboard to fix these issues.`
            })
          });
        } catch (emailErr) {
          console.error("Failed to send email notification:", emailErr);
        }
      }

      setShowChangesModal(false);
      fetchSong();
      alert('Changes required sent to artist.');
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `submissions/${id}`);
    }
  };

  const handleDeleteSong = async () => {
    if (!window.confirm("CRITICAL: Are you sure you want to delete this song? This will permanently remove all metadata, artwork, and audio links from the database. This action is irreversible.")) return;
    
    try {
      await deleteDoc(doc(db, 'submissions', id!));
      alert("Song and associated metadata deleted successfully.");
      navigate('/admin/songs');
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `submissions/${id}`);
    }
  };

  const handleAiMetaCheck = async () => {
    setAiChecking(true);
    setAiCheckReport(null);
    try {
      const prompt = `Review this music metadata. Check for potential issues like capitalization errors (e.g. all caps or non-standard title casing), spelling mistakes, and inconsistent naming conventions. Provide a brief, actionable report.
      Title: "${formData.title || ''}"
      Main Artist: "${formData.mainArtist || ''}"
      Genre: "${formData.primaryGenre || ''}"
      P Line: "${formData.pLine || ''}"`;
      
      const ai = new (await import('@google/genai')).GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });
      
      setAiCheckReport(response.text || "No issues found during analysis.");
    } catch (e) {
      console.error(e);
      alert("AI Meta-Check Failed.");
    } finally {
      setAiChecking(false);
    }
  };

  const handleAiGenerateNotes = async () => {
    setAiGenerating(true);
    try {
      const generated = await geminiService.generateChangesRequired(issueType, problemDesc);
      
      // Parse the generated text to extract explanation vs steps if possible, 
      // but the persona says it returns a specific format.
      // We can just set it to the solution and problem fields.
      
      const lines = generated.split('\n');
      const changesText = lines.find(l => l.includes('Changes Required:')) ? generated.split('How to Fix:')[0].replace('Changes Required:', '').trim() : '';
      const fixSteps = lines.find(l => l.includes('How to Fix:')) ? generated.split('How to Fix:')[1].trim() : generated;

      if (changesText) setProblemDesc(changesText);
      setSolutionDesc(fixSteps);
    } catch (e) {
      console.error(e);
      alert("AI Note Generation Failed.");
    } finally {
      setAiGenerating(false);
    }
  };

  if (loading) return <div className="text-white p-8">Loading submission...</div>;
  if (!song) return <div className="text-white p-8">Song not found</div>;

  const versions = song.metadataVersions || [];

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-8 relative">
      <Link to="/admin/songs" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors font-display uppercase tracking-widest text-xs">
        <ArrowLeft size={16} /> Back to Songs
      </Link>

      {/* Header & Status Control Strip */}
      <div className="bg-[#111] border border-[#333] p-6 lg:p-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-display font-bold uppercase tracking-tighter text-white mb-2">{song.title || 'Untitled'}</h1>
          <div className="flex items-center gap-3">
            <p className="text-gray-400 font-sans">by {song.mainArtist}</p>
            {song.uid && (
              <Link to={`/admin/artists/${song.uid}`} className="text-[10px] text-[#9d4edd] hover:text-white uppercase font-display tracking-widest flex items-center gap-1 transition-colors border border-[#333] bg-[#222] px-2 py-1">
                <ExternalLink size={10} /> View Profile
              </Link>
            )}
          </div>
          <div className="mt-3 inline-block px-3 py-1 bg-[#222] border border-[#444] text-xs uppercase tracking-widest font-bold">
             Current Status: <span className="text-[#9d4edd]">{song.status}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          <button onClick={() => handleUpdateStatus('Reviewing')} className="flex-1 lg:flex-none border border-yellow-500 text-yellow-500 px-4 py-2 text-xs uppercase font-display font-bold tracking-widest hover:bg-yellow-500 hover:text-black transition-colors">Reviewing</button>
          <button onClick={() => handleUpdateStatus('Processing')} className="flex-1 lg:flex-none border border-blue-400 text-blue-400 px-4 py-2 text-xs uppercase font-display font-bold tracking-widest hover:bg-blue-400 hover:text-black transition-colors">Processing</button>
          <button onClick={() => handleUpdateStatus('Sent to Stores')} className="flex-1 lg:flex-none border border-purple-400 text-purple-400 px-4 py-2 text-xs uppercase font-display font-bold tracking-widest hover:bg-purple-400 hover:text-white transition-colors">Sent to Stores</button>
          <button onClick={() => handleUpdateStatus('Live')} className="flex-1 lg:flex-none border border-[#ccff00] text-[#ccff00] px-4 py-2 text-xs uppercase font-display font-bold tracking-widest hover:bg-[#ccff00] hover:text-black transition-colors">Live</button>
          <button onClick={() => setShowChangesModal(true)} className="flex-1 lg:flex-none bg-red-600 text-white px-4 py-2 text-xs uppercase font-display font-bold tracking-widest hover:bg-red-700 transition-colors">Changes Required</button>
          <button onClick={handleDeleteSong} className="flex-1 lg:flex-none border border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 text-xs uppercase font-display font-bold tracking-widest transition-colors flex items-center justify-center gap-1">
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* LEFT COMP: METADATA TABS */}
        <div className="col-span-2 space-y-6">
          <div className="bg-[#111] border border-[#333] p-6">
            
            {/* Header & Main Actions */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-lg font-display uppercase tracking-widest text-[#9d4edd]">Edit Metadata</h2>
                <p className="text-xs text-gray-500 font-sans">Fix spelling or missing info manually before delivery</p>
              </div>
              <div className="flex items-center gap-3">
                 <button 
                  onClick={handleAiMetaCheck}
                  disabled={aiChecking}
                  className="bg-[#222] border border-[#9d4edd] text-[#9d4edd] px-4 py-2 text-xs uppercase font-display font-bold tracking-widest flex items-center gap-2 hover:bg-[#9d4edd] hover:text-white transition-colors"
                >
                  <Sparkles size={14} /> {aiChecking ? 'Checking...' : 'AI Meta-Check'}
                </button>
                <button 
                  onClick={handleSaveMetadata}
                  disabled={saving}
                  className="bg-[#9d4edd] text-white px-4 py-2 text-xs uppercase font-display font-bold tracking-widest flex items-center gap-2 hover:bg-[#7b2cbf] transition-colors"
                >
                  <Save size={14} /> {saving ? 'Saving...' : 'Save Meta'}
                </button>
              </div>
            </div>

            {/* TAB CONTROLS */}
            <div className="flex gap-2 border-b border-[#333] pb-4 mb-6 overflow-x-auto">
              {['Basic', 'Tracks', 'Credits', 'Platform', 'History'].map(tab => (
                 <button 
                   key={tab}
                   onClick={() => setActiveTab(tab)}
                   className={`px-4 py-2 font-display uppercase tracking-widest text-xs font-bold transition-colors whitespace-nowrap ${
                     activeTab === tab 
                       ? 'bg-[#ccff00] text-black' 
                       : 'bg-[#222] text-gray-400 hover:text-white'
                   }`}
                 >
                   {tab === 'History' && <History size={12} className="inline mr-1" />}
                   {tab}
                 </button>
              ))}
            </div>

            {/* TAB CONTENTS */}
            <div className="font-sans">
              
              {aiCheckReport && (
                <div className="mb-6 bg-[#1a1a1a] border border-[#9d4edd]/50 p-4 relative">
                  <button onClick={() => setAiCheckReport(null)} className="absolute top-2 right-2 text-gray-400 hover:text-white">x</button>
                  <h3 className="text-[#9d4edd] font-display uppercase tracking-widest text-xs font-bold mb-2 flex items-center gap-2"><Sparkles size={14}/> Metadata Analysis Report</h3>
                  <div className="text-sm text-gray-300 font-sans whitespace-pre-wrap">{aiCheckReport}</div>
                </div>
              )}

              {activeTab === 'Basic' && (
                <div className="grid md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                  <Input name="title" label="Song Title" value={formData.title} onChange={handleMetadataChange} />
                  <Input name="mainArtist" label="Main Artist" value={formData.mainArtist} onChange={handleMetadataChange} />
                  <Input name="primaryGenre" label="Primary Genre" value={formData.primaryGenre} onChange={handleMetadataChange} />
                  <Input name="secondaryGenre" label="Secondary Genre" value={formData.secondaryGenre} onChange={handleMetadataChange} />
                  <Input name="language" label="Language" value={formData.language} onChange={handleMetadataChange} />
                  
                  <div className="col-span-1 md:col-span-2 space-y-4 border-t border-[#333] pt-4 mt-2">
                    <h3 className="text-xs font-display uppercase tracking-widest text-gray-400">Distribution IDs</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <Input name="isrc" label="ISRC" value={formData.isrc} onChange={handleMetadataChange} />
                      <Input name="upc" label="UPC" value={formData.upc} onChange={handleMetadataChange} />
                    </div>
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase font-display tracking-widest text-gray-500">Explicit Content</label>
                      <div className={`text-sm font-sans font-bold flex items-center gap-2 p-2 border ${formData.isExplicit ? 'border-red-500/20 text-red-500 bg-red-500/5' : 'border-[#333] text-gray-400'}`}>
                        {formData.isExplicit ? 'YES (Explicit)' : 'NO (Clean)'}
                      </div>
                    </div>
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <Input name="scheduleDate" label="Schedule Release Date" type="date" value={formData.scheduleDate} onChange={handleMetadataChange} />
                  </div>
                  
                  <div className="col-span-1 md:col-span-2 border-t border-[#333] pt-4 mt-2">
                    <h3 className="text-xs font-display uppercase tracking-widest text-gray-400 mb-4">Copyright & Ownership</h3>
                  </div>
                  <Input name="copyrightYear" label="Copyright Year (C)" value={formData.copyrightYear} onChange={handleMetadataChange} />
                  <Input name="productionYear" label="Production Year (P)" value={formData.productionYear} onChange={handleMetadataChange} />
                  <Input name="pLine" label="P Line (Phonographic)" value={formData.pLine} onChange={handleMetadataChange} />
                  <Input name="cLine" label="C Line (Copyright)" value={formData.cLine} onChange={handleMetadataChange} />
                  <div className="col-span-1 md:col-span-2">
                    <Input name="labelName" label="Label Name" value={formData.labelName} onChange={handleMetadataChange} />
                  </div>
                </div>
              )}

              {activeTab === 'Tracks' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  {formData.tracks && formData.tracks.length > 0 ? (
                    formData.tracks.map((track: any, idx: number) => (
                      <div key={idx} className="p-6 bg-black border border-[#333] space-y-6">
                        <div className="flex justify-between items-center border-b border-[#222] pb-4">
                          <h3 className="font-display font-bold uppercase tracking-widest text-[#ccff00]">
                            Track {track.trackNumber || idx + 1}: {track.title}
                          </h3>
                          <div className="flex items-center gap-4">
                             <div className="flex items-center gap-2">
                               <label className="text-[10px] text-gray-500 uppercase">Explicit</label>
                               <input 
                                 type="checkbox" 
                                 checked={!!track.isExplicit} 
                                 onChange={(e) => handleTrackMetadataChange(idx, 'isExplicit', e.target.checked)}
                                 className="accent-[#ccff00]"
                               />
                             </div>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <Input label="Track Title" value={track.title} onChange={(e: any) => handleTrackMetadataChange(idx, 'title', e.target.value)} />
                          <Input label="ISRC" value={track.isrc} onChange={(e: any) => handleTrackMetadataChange(idx, 'isrc', e.target.value)} />
                          <Input label="Lyricist" value={track.lyricist} onChange={(e: any) => handleTrackMetadataChange(idx, 'lyricist', e.target.value)} />
                          <Input label="Composer" value={track.composer} onChange={(e: any) => handleTrackMetadataChange(idx, 'composer', e.target.value)} />
                          <Input label="Producer" value={track.producer} onChange={(e: any) => handleTrackMetadataChange(idx, 'producer', e.target.value)} />
                          <Input label="Producer Spotify" value={track.producerSpotify} onChange={(e: any) => handleTrackMetadataChange(idx, 'producerSpotify', e.target.value)} />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-display tracking-widest text-gray-500">Lyrics</label>
                          <textarea 
                            value={track.lyrics || ''}
                            onChange={(e) => handleTrackMetadataChange(idx, 'lyrics', e.target.value)}
                            className="w-full bg-[#0a0a0a] border border-[#333] p-3 text-gray-300 font-sans text-xs focus:border-[#9d4edd] transition-all min-h-[100px] outline-none"
                            placeholder="Full lyrics..."
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center p-8 bg-black border border-[#333] text-gray-500">
                      No track data found in metadata. This might be an old single release.
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'Credits' && (
                <div className="grid md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                  <Input name="lyricist" label="Lyricist" value={formData.lyricist} onChange={handleMetadataChange} />
                  <Input name="composer" label="Composer" value={formData.composer} onChange={handleMetadataChange} />
                  <Input name="producer" label="Producer" value={formData.producer} onChange={handleMetadataChange} />
                  <Input name="producerSpotify" label="Producer Spotify" value={formData.producerSpotify} onChange={handleMetadataChange} />
                  
                  <div className="col-span-1 md:col-span-2 space-y-4">
                    <h3 className="text-[10px] font-display uppercase tracking-widest text-[#9d4edd] border-b border-[#333] pb-1">Additional Contributors</h3>
                    {formData.additionalContributors && formData.additionalContributors.length > 0 ? (
                      <div className="grid gap-4">
                        {formData.additionalContributors.map((c: any, i: number) => (
                          <div key={i} className="p-3 bg-black border border-[#333] grid grid-cols-3 gap-3">
                            <div className="text-[10px] uppercase font-display text-gray-500">Name: <span className="text-white">{c.name}</span></div>
                            <div className="text-[10px] uppercase font-display text-gray-500">Role: <span className="text-white">{c.role}</span></div>
                            <div className="text-[10px] uppercase font-display text-gray-500">Spotify: <span className="text-[#ccff00] break-all">{c.spotify || 'None'}</span></div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-600 italic">No additional contributors provided.</p>
                    )}
                  </div>

                    <Input name="featuredArtists" label="Featured Artists (Legacy String)" value={formData.featuredArtists} onChange={handleMetadataChange} />
                  <div className="col-span-1 md:col-span-2">
                    <Input name="otherCredits" label="Misc / Other Credits" value={formData.otherCredits} onChange={handleMetadataChange} />
                  </div>

                  {formData.lyrics && (
                    <div className="col-span-1 md:col-span-2 space-y-2 mt-4 bg-black border border-red-500/20 p-4">
                      <h3 className="text-[10px] font-display uppercase tracking-widest text-red-500 font-bold border-b border-[#333] pb-1 flex items-center gap-2">
                        <ShieldAlert size={12} /> Lyrics (Explicit/Verified)
                      </h3>
                      <textarea
                        name="lyrics"
                        value={formData.lyrics}
                        onChange={handleMetadataChange}
                        className="w-full bg-[#0a0a0a] border border-[#333] p-3 text-gray-300 font-sans text-xs focus:border-red-500 transition-all min-h-[150px] outline-none"
                      />
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'Platform' && (
                <div className="grid md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                  <div className="col-span-1 md:col-span-2">
                    <Input name="excludedPlatforms" label="Excluded Platforms" value={formData.excludedPlatforms} onChange={handleMetadataChange} />
                  </div>
                  <Input name="mainSpotifyLink" label="Artist Spotify Link" value={formData.mainSpotifyLink} onChange={handleMetadataChange} />
                  <Input name="featureSpotifyLinks" label="Featured Spotify Links" value={formData.featureSpotifyLinks} onChange={handleMetadataChange} />

                  <div className="col-span-1 md:col-span-2 border-t border-[#333] pt-6 mt-2">
                    <h3 className="text-sm font-display uppercase tracking-widest text-[#ccff00] mb-4">Official Store Links (Smart Link)</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <Input 
                        label="Spotify URL" 
                        value={formData.storeLinks?.spotify || ''} 
                        onChange={(e: any) => setFormData({...formData, storeLinks: {...(formData.storeLinks || {}), spotify: e.target.value}})} 
                      />
                      <Input 
                        label="Apple Music URL" 
                        value={formData.storeLinks?.appleMusic || ''} 
                        onChange={(e: any) => setFormData({...formData, storeLinks: {...(formData.storeLinks || {}), appleMusic: e.target.value}})} 
                      />
                      <Input 
                        label="YouTube Music URL" 
                        value={formData.storeLinks?.youtubeMusic || ''} 
                        onChange={(e: any) => setFormData({...formData, storeLinks: {...(formData.storeLinks || {}), youtubeMusic: e.target.value}})} 
                      />
                      <Input 
                        label="Amazon Music URL" 
                        value={formData.storeLinks?.amazonMusic || ''} 
                        onChange={(e: any) => setFormData({...formData, storeLinks: {...(formData.storeLinks || {}), amazonMusic: e.target.value}})} 
                      />
                      <Input 
                        label="Deezer URL" 
                        value={formData.storeLinks?.deezer || ''} 
                        onChange={(e: any) => setFormData({...formData, storeLinks: {...(formData.storeLinks || {}), deezer: e.target.value}})} 
                      />
                      <Input 
                        label="Instagram/Facebook URL" 
                        value={formData.storeLinks?.instagram || ''} 
                        onChange={(e: any) => setFormData({...formData, storeLinks: {...(formData.storeLinks || {}), instagram: e.target.value}})} 
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'History' && (
                <div className="animate-in fade-in duration-300">
                  {versions.length === 0 ? (
                    <div className="text-center p-8 bg-[#1a1a1a] border border-[#333] text-gray-500 text-sm">
                      No version history found. Save changes to create a new version.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {versions.map((ver: any, i: number) => (
                        <div key={i} className="bg-[#1a1a1a] border border-[#333] p-4 flex justify-between items-center group">
                          <div>
                            <div className="font-display tracking-widest text-[#9d4edd] uppercase text-xs font-bold mb-1">
                              {new Date(ver.timestamp).toLocaleString()}
                            </div>
                            <div className="text-gray-400 text-xs font-sans">
                              Saved by: {ver.editor || 'System'}
                            </div>
                          </div>
                          <button 
                            onClick={() => revertToVersion(ver)}
                            className="text-[#ccff00] border border-[#ccff00] px-3 py-1 font-display uppercase tracking-widest text-[10px] font-bold hover:bg-[#ccff00] hover:text-black transition-colors flex items-center gap-1 opacity-0 group-hover:opacity-100"
                          >
                            <RotateCcw size={12} /> Revert
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>

        {/* RIGHT COMP: FILES & STREAMS */}
        <div className="col-span-1 space-y-6">
          <div className="bg-[#111] border border-[#333] p-6 space-y-6">
            <div>
              <h2 className="text-sm font-display uppercase tracking-widest text-[#9d4edd] border-b border-[#333] pb-2 mb-4">Provided Media</h2>
              
              <div className="mb-6">
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-2 border-b border-[#222] pb-1">Cover Art</p>
                {song.coverUrl ? (
                  <div className="space-y-3">
                    <img src={song.coverUrl} alt="Cover" className="w-full aspect-square object-cover border border-[#333]" referrerPolicy="no-referrer" />
                    <a href={song.coverUrl} download={`Cover_${song.title}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full bg-[#222] hover:bg-[#333] text-white py-2 text-xs font-display uppercase tracking-widest transition-colors">
                      <Download size={14} /> Download Cover Art
                    </a>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No cover provided.</p>
                )}
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-2 border-b border-[#222] pb-1">Audio Files</p>
                {/* Check for tracks array (new format) or audioUrl (old format) */}
                {song.tracks && song.tracks.length > 0 ? (
                  <div className="space-y-4 mt-4">
                    {song.tracks.map((track: any, idx: number) => (
                      <div key={idx} className="p-3 bg-black/40 border border-[#333] space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-display font-bold text-[#ccff00] uppercase tracking-widest">
                            Track {track.trackNumber || idx + 1}: {track.title}
                          </span>
                          {track.isExplicit && <span className="text-[8px] bg-red-500 text-white px-1 font-bold">E</span>}
                        </div>
                        {track.audioUrl ? (
                          <div className="space-y-2">
                            <audio 
                              controls 
                              className="w-full h-8 filter invert opacity-80"
                              src={track.audioUrl}
                            >
                              Your browser does not support the audio element.
                            </audio>
                            <a 
                              href={track.audioUrl} 
                              download={`Track_${idx + 1}_${track.title}`} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="flex items-center justify-center gap-2 w-full bg-[#ccff00] text-black hover:bg-white py-2 text-[10px] font-display font-bold uppercase tracking-widest transition-colors"
                            >
                              <Download size={12} /> Download Audio
                            </a>
                          </div>
                        ) : (
                          <p className="text-[10px] text-red-500 italic">No audio uploaded for this track</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : song.audioUrl ? (
                  <div className="space-y-4">
                    <audio 
                      controls 
                      className="w-full h-10 filter invert opacity-80"
                      src={song.audioUrl}
                    >
                      Your browser does not support the audio element.
                    </audio>
                    <a href={song.audioUrl} download={`Audio_${song.title}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full bg-[#ccff00] text-black hover:bg-white py-3 text-xs font-display font-bold uppercase tracking-widest transition-colors shadow">
                      <Download size={14} /> Download Audio
                    </a>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No audio provided.</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-[#111] border border-[#333] p-6">
             <h2 className="text-sm font-display uppercase tracking-widest border-b border-[#333] pb-2 mb-4">Song Level Analytics</h2>
             <p className="text-xs text-gray-500 font-sans mb-4">Update streams for this specific track if needed. (Bulk tool recommended for scale).</p>
             <Link to="/admin/streams" className="flex items-center justify-center gap-2 w-full border border-gray-600 text-gray-300 hover:bg-[#222] hover:border-white py-3 text-xs font-display uppercase tracking-widest transition-colors">
                Go to Bulk Streams <ExternalLink size={14} />
             </Link>
          </div>

        </div>
      </div>

      {/* CHANGES REQUIRED MODAL */}
      {showChangesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-red-500 p-6 md:p-8 max-w-lg w-full relative">
            <div className="flex items-center gap-3 text-red-500 mb-6 border-b border-[#333] pb-4">
              <AlertTriangle size={24} />
              <h2 className="text-xl font-display uppercase tracking-widest">Request Changes</h2>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-display uppercase tracking-widest text-gray-400">Quick Templates</label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(PREDEFINED_TEMPLATES).map(type => (
                    <button 
                      key={type}
                      onClick={() => applyTemplate(type)}
                      className="text-[9px] border border-[#333] px-2 py-1 uppercase font-display tracking-widest text-gray-500 hover:border-[#9d4edd] hover:text-[#9d4edd] transition-colors"
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-display uppercase tracking-widest text-gray-400">Issue Type</label>
                  <button 
                    onClick={handleAiGenerateNotes}
                    disabled={aiGenerating}
                    className="text-[10px] text-[#9d4edd] hover:text-white uppercase font-display tracking-widest flex items-center gap-1 transition-colors"
                  >
                    <Sparkles size={12} /> {aiGenerating ? 'Generating...' : 'Auto-Generate Notes'}
                  </button>
                </div>
                <select 
                  value={issueType} 
                  onChange={e => setIssueType(e.target.value)}
                  className="bg-[#222] border border-[#444] text-white p-3 font-sans focus:outline-none focus:border-red-500"
                >
                  <option value="Audio Quality Issue">Audio Quality Issue</option>
                  <option value="Incorrect File Format">Incorrect File Format</option>
                  <option value="Cover Art Quality/Size">Cover Art Quality/Size</option>
                  <option value="Missing/Incorrect Metadata">Missing/Incorrect Metadata</option>
                  <option value="Copyright/Trademark Concern">Copyright/Trademark Concern</option>
                  <option value="Explicit Tag Missing">Explicit Tag Missing</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-display uppercase tracking-widest text-gray-400">Problem Description</label>
                <textarea 
                  value={problemDesc} 
                  onChange={e => setProblemDesc(e.target.value)}
                  placeholder="e.g. Cover art is blurry, audio is clipping..."
                  className="bg-[#222] border border-[#444] text-white p-3 font-sans focus:outline-none focus:border-red-500 min-h-[80px]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-display uppercase tracking-widest text-gray-400">Solution Instructions</label>
                <textarea 
                  value={solutionDesc} 
                  onChange={e => setSolutionDesc(e.target.value)}
                  placeholder="e.g. Please upload a 3000x3000px high quality image."
                  className="bg-[#222] border border-[#444] text-white p-3 font-sans focus:outline-none focus:border-red-500 min-h-[80px]"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={() => setShowChangesModal(false)} className="flex-1 bg-transparent border border-[#555] text-white py-3 font-display uppercase tracking-widest text-xs hover:bg-[#222]">Cancel</button>
                <button onClick={handleSubmitChangesRequired} className="flex-1 bg-red-600 text-white py-3 font-display uppercase tracking-widest text-xs font-bold hover:bg-red-700">Send to Artist</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function Input({ label, name, value, onChange, type = "text" }: any) {
  const displayValue = Array.isArray(value) ? value.join(', ') : (value || '');
  
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] uppercase font-display tracking-widest text-gray-500">{label}</label>
      <input 
        type={type} 
        name={name} 
        value={displayValue} 
        onChange={onChange}
        className="bg-[#0a0a0a] border border-[#333] p-2 text-white text-sm focus:outline-none focus:border-[#9d4edd] transition-colors" 
      />
    </div>
  );
}
