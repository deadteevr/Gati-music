import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { CheckCircle2, Clock, PlayCircle, Loader2, AlertCircle, ChevronDown, ChevronUp, Link as LinkIcon, Info, Edit2, Check, X, ExternalLink } from 'lucide-react';
import { updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { isPlanActive } from '../../lib/planUtils';

export default function ArtistStatus({ user, userData }: { user: any, userData: any }) {
  const [releases, setReleases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isSubscribed = isPlanActive(userData?.subscription);

  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'submissions'), where('uid', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: any[] = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
      // sort by date descending
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setReleases(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'submissions', false);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user.uid]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this submission? This action cannot be undone.")) return;
    setDeletingId(id);
    try {
      await deleteDoc(doc(db, 'submissions', id));
      alert("Submission deleted successfully.");
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `submissions/${id}`);
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Reviewing': return 'text-yellow-500';
      case 'Processing': return 'text-[#9d4edd]';
      case 'Changes Required': return 'text-red-500';
      case 'Sent to Stores': return 'text-blue-500';
      case 'Live': return 'text-[#ccff00]';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Reviewing': return <Clock size={16} className="text-yellow-500" />;
      case 'Processing': return <Loader2 size={16} className="text-[#9d4edd] animate-spin" />;
      case 'Changes Required': return <AlertCircle size={16} className="text-red-500" />;
      case 'Sent to Stores': return <PlayCircle size={16} className="text-blue-500" />;
      case 'Live': return <CheckCircle2 size={16} className="text-[#ccff00]" />;
      default: return <Clock size={16} />;
    }
  };

  if (loading) return <div className="text-[#ccff00] font-display p-10">Loading...</div>;

  return (
    <div className="max-w-7xl">
      <div className="mb-10">
        <h1 className="text-4xl font-display uppercase tracking-tighter mb-2">My Songs</h1>
        <p className="text-gray-400 font-sans">Track the status of your releases.</p>
      </div>

      {releases.length === 0 ? (
        <div className="border border-[#333] p-12 text-center bg-[#111]">
          <p className="text-gray-500 font-sans mb-4">You haven't uploaded any songs yet.</p>
        </div>
      ) : (
        <div className="bg-[#111] border border-[#333] overflow-x-auto">
          <table className="w-full text-left font-sans">
            <thead className="bg-[#0a0a0a] border-b border-[#333]">
              <tr>
                <th className="px-6 py-4 text-xs font-display uppercase tracking-widest text-gray-500 font-medium">Cover</th>
                <th className="px-6 py-4 text-xs font-display uppercase tracking-widest text-gray-500 font-medium">Title</th>
                <th className="px-6 py-4 text-xs font-display uppercase tracking-widest text-gray-500 font-medium">Artist</th>
                <th className="px-6 py-4 text-xs font-display uppercase tracking-widest text-gray-500 font-medium">Date Released</th>
                <th className="px-6 py-4 text-xs font-display uppercase tracking-widest text-gray-500 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333]">
              {releases.map((release) => (
                <React.Fragment key={release.id}>
                  <tr 
                    onClick={() => setExpandedId(expandedId === release.id ? null : release.id)}
                    className={`hover:bg-[#1a1a1a] transition-colors cursor-pointer ${expandedId === release.id ? 'bg-[#1a1a1a]' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      {release.coverUrl ? (
                        <img 
                          src={release.coverUrl} 
                          alt="Cover" 
                          className="w-12 h-12 object-cover rounded shadow-md border border-[#333]" 
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-[#222] rounded flex items-center justify-center border border-[#333]">
                          <span className="text-[10px] text-gray-500 uppercase">No IMG</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white font-medium flex items-center gap-2">
                        {release.title}
                        {release.status === 'Changes Required' && <AlertCircle size={14} className="text-red-500" />}
                      </div>
                      {release.featuringArtists && release.featuringArtists.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">feat. {release.featuringArtists.join(', ')}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {release.mainArtist}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(release.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(release.status)}
                          <span className={`text-sm font-display uppercase tracking-widest font-bold ${getStatusColor(release.status)}`}>
                            {release.status}
                          </span>
                        </div>
                        <div className="text-gray-600">
                          {expandedId === release.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Section */}
                  <AnimatePresence>
                    {expandedId === release.id && (
                      <tr>
                        <td colSpan={5} className="p-0 border-b border-[#333]">
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-[#0c0c0c] overflow-hidden"
                          >
                            <div className="p-8 grid md:grid-cols-2 gap-8">
                              {/* Left column: Core Details */}
                              <div className="space-y-6">
                                <div>
                                  <h4 className="text-[10px] uppercase font-display tracking-[0.2em] text-[#ccff00] mb-4">Metadata Breakdown</h4>
                                  <div className="grid grid-cols-2 gap-4">
                                    <DetailItem label="Label" value={release.labelName || 'Self-Released'} />
                                    <DetailItem label="Producer" value={release.producer || 'N/A'} />
                                    <DetailItem label="Lyricist" value={release.lyricist || 'N/A'} />
                                    <DetailItem label="P-Line" value={release.pLine || 'N/A'} />
                                  </div>
                                </div>

                                {release.additionalContributors && release.additionalContributors.length > 0 && (
                                  <div>
                                    <h4 className="text-[10px] uppercase font-display tracking-[0.2em] text-[#ccff00] mb-3">Additional Contributors</h4>
                                    <div className="space-y-2">
                                      {release.additionalContributors.map((c: any, i: number) => (
                                        <div key={i} className="flex justify-between items-center text-xs border-b border-[#222] py-2">
                                          <span className="text-gray-400">{c.name}</span>
                                          <span className="text-white font-display tracking-widest uppercase text-[10px]">{c.role}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {release.status === 'Live' && (
                                  <div className="space-y-4">
                                    <div className="p-4 bg-[#ccff00]/5 border border-[#ccff00]/20 rounded group">
                                      <h4 className="text-[10px] uppercase font-display tracking-widest text-[#ccff00] mb-2 flex items-center gap-2">
                                        <LinkIcon size={12} /> Share Your Release
                                      </h4>
                                      <p className="text-gray-400 text-xs mb-3">Your release is live! Use the smart link to promote it.</p>
                                      <div className="flex gap-2">
                                        <Link 
                                          to={`/release/${release.id}`} 
                                          className="bg-white text-black px-4 py-2 text-[10px] font-display uppercase font-bold tracking-widest hover:bg-[#ccff00] transition-colors"
                                        >
                                          View Smart Link
                                        </Link>
                                        <button 
                                          onClick={() => {
                                            navigator.clipboard.writeText(`${window.location.origin}/release/${release.id}`);
                                            alert('Smart link copied to clipboard!');
                                          }}
                                          className="border border-white/20 text-white px-4 py-2 text-[10px] font-display uppercase font-bold tracking-widest hover:bg-white hover:text-black transition-all"
                                        >
                                          Copy URL
                                        </button>
                                      </div>
                                    </div>

                                    <StoreLinkEditor release={release} />
                                  </div>
                                )}
                              </div>

                              {/* Right column: Status & Issues */}
                              <div className="space-y-6">
                                <div>
                                  <h4 className="text-[10px] uppercase font-display tracking-[0.2em] text-gray-500 mb-4">Current Progress</h4>
                                  <StatusTimeline currentStatus={release.status} />
                                </div>

                                {release.status === 'Changes Required' && release.changesRequiredNotes && (
                                  <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-lg">
                                    <div className="flex items-center gap-2 text-red-500 mb-4">
                                      <AlertCircle size={18} />
                                      <h4 className="text-sm font-display uppercase tracking-widest font-bold">Action Required</h4>
                                    </div>
                                    <div className="space-y-3">
                                      <div>
                                        <span className="text-[10px] text-gray-500 uppercase tracking-widest block">Issue</span>
                                        <p className="text-white text-sm font-sans">{release.changesRequiredNotes.issueType}</p>
                                      </div>
                                      <div>
                                        <span className="text-[10px] text-gray-500 uppercase tracking-widest block">Problem</span>
                                        <p className="text-gray-300 text-xs font-sans leading-relaxed">{release.changesRequiredNotes.problemDesc}</p>
                                      </div>
                                      <div className="pt-3 border-t border-red-500/10">
                                        <span className="text-[10px] text-gray-500 uppercase tracking-widest block">How to Fix</span>
                                        <p className="text-white text-xs font-sans leading-relaxed whitespace-pre-wrap">{release.changesRequiredNotes.solutionDesc}</p>
                                      </div>
                                    </div>
                                    <Link 
                                      to={`/dashboard/upload/${release.id}`}
                                      className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white py-3 text-[10px] font-display uppercase tracking-widest font-bold transition-all shadow-lg flex items-center justify-center gap-2"
                                    >
                                      <Edit2 size={14} /> Edit & Resubmit
                                    </Link>
                                  </div>
                                )}

                                {['Reviewing', 'Changes Required', 'Pending'].includes(release.status) && (
                                  <div className="pt-4 border-t border-[#222]">
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); handleDelete(release.id); }}
                                      disabled={deletingId === release.id}
                                      className="text-red-500 hover:text-red-400 text-[10px] font-display uppercase tracking-widest font-bold flex items-center gap-2 transition-colors"
                                    >
                                      {deletingId === release.id ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                                      Delete Submission
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function DetailItem({ label, value }: { label: string, value: string }) {
  return (
    <div>
      <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">{label}</span>
      <span className="text-white text-sm font-sans truncate block">{value}</span>
    </div>
  );
}

function StoreLinkEditor({ release }: { release: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [links, setLinks] = useState(release.storeLinks || {
    spotify: '',
    appleMusic: '',
    youtubeMusic: '',
    deezer: '',
    amazonMusic: '',
    instagram: ''
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'submissions', release.id), {
        storeLinks: links
      });
      setIsEditing(false);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `submissions/${release.id}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 bg-black/40 border border-[#222] rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-[10px] uppercase font-display tracking-widest text-gray-500 font-black">Store Links Manager</h4>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="text-[#ccff00] text-[10px] font-display uppercase font-bold tracking-widest flex items-center gap-1.5"
        >
          {isEditing ? <><X size={12} /> Cancel</> : <><Edit2 size={12} /> Edit Links</>}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Object.entries({
          spotify: 'Spotify',
          appleMusic: 'Apple Music',
          youtubeMusic: 'YouTube Music',
          deezer: 'Deezer',
          amazonMusic: 'Amazon Music',
          instagram: 'Instagram Audio'
        }).map(([key, label]) => (
          <div key={key}>
            <label className="text-[9px] uppercase tracking-widest text-gray-600 mb-1.5 block">{label}</label>
            {isEditing ? (
              <input 
                type="text"
                value={links[key] || ''}
                onChange={e => setLinks({...links, [key]: e.target.value})}
                placeholder={`Paste ${label} URL`}
                className="w-full bg-[#111] border border-[#333] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ccff00]"
              />
            ) : (
              <div className="flex items-center justify-between bg-black/20 border border-[#222]/50 px-3 py-2 rounded">
                 <span className="text-[10px] text-gray-500 truncate max-w-[120px]">{links[key] || 'Not Set'}</span>
                 {links[key] && (
                   <a href={links[key]} target="_blank" rel="noreferrer" className="text-[#ccff00] opacity-50 hover:opacity-100"><ExternalLink size={12} /></a>
                 )}
              </div>
            )}
          </div>
        ))}
      </div>

      {isEditing && (
        <button 
          onClick={handleSave}
          disabled={saving}
          className="w-full mt-6 bg-[#ccff00] text-black py-3 text-[10px] font-display uppercase font-black tracking-widest hover:bg-white transition-all flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          Save Store Integration
        </button>
      )}
    </div>
  );
}

function StatusTimeline({ currentStatus }: { currentStatus: string }) {
  const steps = ['Reviewing', 'Processing', 'Sent to Stores', 'Live'];
  const currentIdx = steps.indexOf(currentStatus);
  const isError = currentStatus === 'Changes Required';

  return (
    <div className="relative pl-6 space-y-6">
      <div className="absolute left-2 top-0 bottom-0 w-[1px] bg-[#222]"></div>
      
      {isError ? (
        <div className="relative">
          <div className="absolute -left-[1.35rem] top-1 w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
          <div>
            <h5 className="text-red-500 text-xs font-display uppercase font-bold tracking-widest">Issue Flagged</h5>
            <p className="text-gray-500 text-[10px] font-sans">Our team found issues that need your attention.</p>
          </div>
        </div>
      ) : (
        steps.map((step, i) => {
          const isActive = i <= currentIdx;
          const isCurrent = i === currentIdx;
          
          return (
            <div key={step} className="relative">
              <div className={`absolute -left-[1.35rem] top-1 w-3 h-3 rounded-full border-2 transition-all duration-500 ${
                isCurrent ? 'bg-[#ccff00] border-[#ccff00] shadow-[0_0_10px_rgba(204,255,0,0.5)]' :
                isActive ? 'bg-[#ccff00] border-[#ccff00]' : 'bg-black border-[#222]'
              }`}></div>
              <div className={`${isActive ? 'text-white' : 'text-gray-600'} transition-colors`}>
                <h5 className={`text-xs font-display uppercase font-bold tracking-widest ${isCurrent ? 'text-[#ccff00]' : ''}`}>{step}</h5>
                {isCurrent && <p className="text-gray-500 text-[10px] font-sans">Current Stage</p>}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
