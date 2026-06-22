
import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import {
  Upload, Video, Image as ImageIcon, ArrowLeft, CheckCircle2,
  Loader2, AlertCircle, Shield, ShieldAlert, Plus, Trash2, X,
} from 'lucide-react';

interface LessonInput {
  id: string;
  title: string;
  videoFile: File | null;
  videoPreview: string;
  duration: string;
}

interface ModuleInput {
  id: string;
  title: string;
  lessons: LessonInput[];
}

const newLesson = (): LessonInput => ({
  id: crypto.randomUUID(),
  title: '',
  videoFile: null,
  videoPreview: '',
  duration: '',
});

const newModule = (): ModuleInput => ({
  id: crypto.randomUUID(),
  title: '',
  lessons: [newLesson()],
});

const CourseUpload: React.FC = () => {
  const navigate = useNavigate();
  const thumbRef = useRef<HTMLInputElement>(null);

  const [step, setStep]         = useState(1);
  const [saving, setSaving]     = useState(false);
  const [errMsg, setErrMsg]     = useState('');
  const [done, setDone]         = useState(false);

  /* Course meta */
  const [title, setTitle]       = useState('');
  const [description, setDesc]  = useState('');
  const [category, setCategory] = useState('Smart Contracts');
  const [level, setLevel]       = useState('Beginner');
  const [price, setPrice]       = useState('');
  const [thumb, setThumb]       = useState<File | null>(null);
  const [thumbPreview, setThumbPreview] = useState('');

  /* Modules + lessons */
  const [modules, setModules]   = useState<ModuleInput[]>([newModule()]);

  /* Assignment (optional) */
  const [assignTitle, setAssignTitle]   = useState('');
  const [assignDesc, setAssignDesc]     = useState('');
  const [assignDue, setAssignDue]       = useState('');

  /* ── thumbnail ── */
  const handleThumb = (f: File | null) => {
    setThumb(f);
    setThumbPreview(f ? URL.createObjectURL(f) : '');
  };

  /* ── lesson video select ── */
  const handleVideoSelect = (modIdx: number, lesIdx: number, f: File | null) => {
    setModules(prev => {
      const next = [...prev];
      next[modIdx] = { ...next[modIdx], lessons: [...next[modIdx].lessons] };
      next[modIdx].lessons[lesIdx] = {
        ...next[modIdx].lessons[lesIdx],
        videoFile: f,
        videoPreview: f ? URL.createObjectURL(f) : '',
      };
      return next;
    });
  };

  const addModule  = () => setModules(p => [...p, newModule()]);
  const removeModule = (i: number) => setModules(p => p.filter((_, idx) => idx !== i));
  const addLesson  = (modIdx: number) => setModules(p => {
    const next = [...p];
    next[modIdx] = { ...next[modIdx], lessons: [...next[modIdx].lessons, newLesson()] };
    return next;
  });
  const removeLesson = (modIdx: number, lesIdx: number) => setModules(p => {
    const next = [...p];
    next[modIdx] = { ...next[modIdx], lessons: next[modIdx].lessons.filter((_, i) => i !== lesIdx) };
    return next;
  });
  const updateModule = (idx: number, patch: Partial<ModuleInput>) =>
    setModules(p => p.map((m, i) => i === idx ? { ...m, ...patch } : m));
  const updateLesson = (modIdx: number, lesIdx: number, patch: Partial<LessonInput>) =>
    setModules(p => {
      const next = [...p];
      next[modIdx] = { ...next[modIdx], lessons: next[modIdx].lessons.map((l, i) => i === lesIdx ? { ...l, ...patch } : l) };
      return next;
    });

  /* ── publish ── */
  const handlePublish = async () => {
    setErrMsg('');
    if (!title.trim())           { setErrMsg('Course title is required.'); return; }
    if (!description.trim())     { setErrMsg('Description is required.'); return; }
    if (modules.some(m => !m.title.trim())) { setErrMsg('All modules need a title.'); return; }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setErrMsg('You must be logged in.'); setSaving(false); return; }

      /* Upload thumbnail */
      let thumbnailUrl: string | null = null;
      if (thumb) {
        const path = `thumbnails/${user.id}/${Date.now()}_${thumb.name}`;
        const { error: upErr } = await supabase.storage.from('course-assets').upload(path, thumb, { upsert: false });
        if (!upErr) {
          const { data: urlData } = supabase.storage.from('course-assets').getPublicUrl(path);
          thumbnailUrl = urlData.publicUrl;
        }
      }

      /* Upload videos + build modules JSON */
      const modulesJson = await Promise.all(
        modules.map(async (mod) => {
          const lessons = await Promise.all(
            mod.lessons.map(async (les) => {
              let videoUrl: string | null = null;
              if (les.videoFile) {
                const vPath = `videos/${user.id}/${Date.now()}_${les.videoFile.name}`;
                const { error: vErr } = await supabase.storage
                  .from('course-videos')
                  .upload(vPath, les.videoFile, { upsert: false });
                if (!vErr) {
                  const { data: vUrlData } = supabase.storage.from('course-videos').getPublicUrl(vPath);
                  videoUrl = vUrlData.publicUrl;
                }
              }
              return { id: les.id, title: les.title || 'Untitled Lesson', video_url: videoUrl, duration: les.duration };
            })
          );
          return { id: mod.id, title: mod.title, lessons };
        })
      );

      /* Insert course */
      const courseId = crypto.randomUUID();
      const { error: courseErr } = await supabase.from('courses').insert({
        id: courseId,
        title: title.trim(),
        description: description.trim(),
        category,
        level,
        price_usd: Number(price) || 0,
        price_usdt: Number(price) || 0,
        thumbnail_url: thumbnailUrl,
        modules: modulesJson,
        instructor: user.email?.split('@')[0] || 'Educator',
        instructor_id: user.id,
        is_published: true,
      });
      if (courseErr) throw courseErr;

      /* Insert assignment if filled */
      if (assignTitle.trim()) {
        await supabase.from('assignments').insert({
          course_id: courseId,
          title: assignTitle.trim(),
          description: assignDesc.trim(),
          due_date: assignDue || null,
          created_by: user.id,
        });
      }

      setDone(true);
    } catch (e: any) {
      setErrMsg(e.message || 'Something went wrong. Please try again.');
    }
    setSaving(false);
  };

  if (done) {
    return (
      <div className="min-h-full flex items-center justify-center p-8 bg-slate-50 dark:bg-[#0b0e14]">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-8 text-emerald-500">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black mb-4 text-slate-900 dark:text-white">Course Published!</h2>
          <p className="text-slate-500 dark:text-gray-400 mb-10">Your course is now live and students can enrol.</p>
          <div className="flex gap-4">
            <Link to="/educator" className="flex-1 py-4 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-500 transition-all text-center">
              Back to Dashboard
            </Link>
            <button onClick={() => { setDone(false); setTitle(''); setDesc(''); setThumb(null); setThumbPreview(''); setModules([newModule()]); setStep(1); }}
              className="flex-1 py-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 font-black hover:bg-slate-50 dark:hover:bg-white/10 transition-all text-slate-700 dark:text-white">
              Add Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  const steps = ['Course Info', 'Content', 'Assignment', 'Publish'];

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto pb-32 bg-slate-50 dark:bg-transparent">
      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <Link to="/educator" className="p-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 transition-all text-slate-500 dark:text-gray-400">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Upload New Course</h1>
          <p className="text-slate-500 dark:text-gray-500 text-sm mt-1">All video content is protected and non-downloadable.</p>
        </div>
        <div className="ml-auto flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-widest">
          <Shield className="w-3.5 h-3.5" /> DRM Protected
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-10 overflow-x-auto pb-2">
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <button
              onClick={() => i + 1 < step && setStep(i + 1)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                step === i + 1 ? 'bg-blue-600 text-white' :
                step > i + 1  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 cursor-pointer hover:bg-emerald-500/20' :
                'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-400 dark:text-gray-600 cursor-default'
              }`}
            >
              {step > i + 1 && <CheckCircle2 className="w-3.5 h-3.5" />}
              {i + 1}. {s}
            </button>
            {i < steps.length - 1 && <div className="w-6 h-px bg-slate-200 dark:bg-white/10 shrink-0" />}
          </React.Fragment>
        ))}
      </div>

      {errMsg && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 mb-8">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-600 dark:text-red-400 font-semibold">{errMsg}</p>
        </div>
      )}

      <div className="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 rounded-[40px] p-8 md:p-12 shadow-sm dark:shadow-none">

        {/* ── Step 1: Course Info ── */}
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Course Information</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500">Course Title *</label>
                <input value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Advanced Solidity: From Zero to DeFi"
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 px-5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600" />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500">Description *</label>
                <textarea rows={4} value={description} onChange={e => setDesc(e.target.value)}
                  placeholder="What will students learn? Why is this course valuable?"
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 px-5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 resize-none" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500">Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 px-5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white appearance-none">
                  {['Smart Contracts','DeFi','Security','ZK / L2','AI + Web3','Frontend Web3','Blockchain Data','Gaming','Community','Technical Writing','DAO Governance','RWA / Tokenization','MEV / Quant','DevRel'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500">Level</label>
                <select value={level} onChange={e => setLevel(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 px-5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white appearance-none">
                  {['Beginner','Intermediate','Advanced'].map(l => <option key={l}>{l}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500">Price (USD)</label>
                <input type="number" min="0" value={price} onChange={e => setPrice(e.target.value)}
                  placeholder="0 for free"
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 px-5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600" />
              </div>

              {/* Thumbnail */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500">Course Thumbnail</label>
                <button type="button" onClick={() => thumbRef.current?.click()}
                  className="w-full h-[106px] rounded-2xl border-2 border-dashed border-slate-300 dark:border-white/10 hover:border-blue-500/50 transition-all flex items-center justify-center gap-3 overflow-hidden relative">
                  {thumbPreview ? (
                    <img src={thumbPreview} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-400 dark:text-gray-600">
                      <ImageIcon className="w-6 h-6" />
                      <span className="text-xs font-bold">Click to upload (JPG/PNG)</span>
                    </div>
                  )}
                </button>
                <input ref={thumbRef} type="file" accept="image/*" className="hidden" onChange={e => handleThumb(e.target.files?.[0] || null)} />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button onClick={() => { if (!title.trim() || !description.trim()) { setErrMsg('Title and description are required.'); return; } setErrMsg(''); setStep(2); }}
                className="px-10 py-4 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20">
                Next: Add Content →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Modules & Lessons ── */}
        {step === 2 && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Course Content</h2>
                <p className="text-slate-500 dark:text-gray-500 text-sm mt-1">Add modules and upload video lessons. Videos are encrypted and watermarked.</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest">
                <ShieldAlert className="w-3.5 h-3.5" /> No-Download Mode
              </div>
            </div>

            <div className="space-y-6">
              {modules.map((mod, mIdx) => (
                <div key={mod.id} className="border border-slate-200 dark:border-white/10 rounded-[28px] p-6 bg-slate-50/50 dark:bg-white/[0.02]">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 font-black text-sm shrink-0">
                      {mIdx + 1}
                    </div>
                    <input value={mod.title} onChange={e => updateModule(mIdx, { title: e.target.value })}
                      placeholder={`Module ${mIdx + 1} title`}
                      className="flex-1 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white text-sm font-bold placeholder-slate-400 dark:placeholder-gray-600" />
                    {modules.length > 1 && (
                      <button onClick={() => removeModule(mIdx)} className="p-2.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-4 pl-12">
                    {mod.lessons.map((les, lIdx) => (
                      <div key={les.id} className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5">
                        <div className="flex-1 space-y-3">
                          <input value={les.title} onChange={e => updateLesson(mIdx, lIdx, { title: e.target.value })}
                            placeholder={`Lesson ${lIdx + 1} title`}
                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white text-sm placeholder-slate-400 dark:placeholder-gray-600" />
                          <input value={les.duration} onChange={e => updateLesson(mIdx, lIdx, { duration: e.target.value })}
                            placeholder="Duration (e.g. 12:30)"
                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white text-sm placeholder-slate-400 dark:placeholder-gray-600" />
                        </div>
                        <div className="sm:w-48 space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-600">Video (MP4/WebM)</label>
                          <label className={`flex flex-col items-center justify-center h-[70px] rounded-xl border-2 border-dashed cursor-pointer transition-all ${les.videoFile ? 'border-emerald-500/50 bg-emerald-50 dark:bg-emerald-500/5' : 'border-slate-300 dark:border-white/10 hover:border-blue-500/50'}`}>
                            <input type="file" accept="video/*" className="hidden" onChange={e => handleVideoSelect(mIdx, lIdx, e.target.files?.[0] || null)} />
                            {les.videoFile ? (
                              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 text-center px-2 truncate w-full text-center">{les.videoFile.name}</span>
                            ) : (
                              <div className="flex flex-col items-center gap-1 text-slate-400">
                                <Video className="w-5 h-5" />
                                <span className="text-[9px] font-bold">Upload Video</span>
                              </div>
                            )}
                          </label>
                        </div>
                        {mod.lessons.length > 1 && (
                          <button onClick={() => removeLesson(mIdx, lIdx)} className="self-start p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button onClick={() => addLesson(mIdx)} className="flex items-center gap-2 text-xs font-bold text-blue-500 hover:text-blue-600 transition-colors px-2">
                      <Plus className="w-3.5 h-3.5" /> Add Lesson
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={addModule} className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-blue-500/30 rounded-2xl py-4 px-6 w-full justify-center">
              <Plus className="w-4 h-4" /> Add Module
            </button>

            <div className="flex justify-between pt-4">
              <button onClick={() => setStep(1)} className="px-8 py-4 rounded-2xl font-bold text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-white transition-colors">← Back</button>
              <button onClick={() => { setErrMsg(''); setStep(3); }} className="px-10 py-4 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20">
                Next: Assignment →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Assignment ── */}
        {step === 3 && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Create Assignment</h2>
              <p className="text-slate-500 dark:text-gray-500 text-sm mt-1">Optional — students submit work directly from the course page. You can grade from your dashboard.</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500">Assignment Title</label>
                <input value={assignTitle} onChange={e => setAssignTitle(e.target.value)}
                  placeholder="e.g. Build and deploy your first ERC-20 token"
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 px-5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500">Instructions / Description</label>
                <textarea rows={5} value={assignDesc} onChange={e => setAssignDesc(e.target.value)}
                  placeholder="Describe what students need to submit — code, write-up, GitHub link, etc."
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 px-5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 resize-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500">Due Date (optional)</label>
                <input type="datetime-local" value={assignDue} onChange={e => setAssignDue(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 px-5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white" />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button onClick={() => setStep(2)} className="px-8 py-4 rounded-2xl font-bold text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-white transition-colors">← Back</button>
              <button onClick={() => { setErrMsg(''); setStep(4); }} className="px-10 py-4 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20">
                Next: Review →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4: Review & Publish ── */}
        {step === 4 && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Review & Publish</h2>

            <div className="space-y-4">
              {[
                { label: 'Title',       value: title },
                { label: 'Category',    value: category },
                { label: 'Level',       value: level },
                { label: 'Price',       value: price ? `$${price}` : 'Free' },
                { label: 'Modules',     value: `${modules.length} module(s), ${modules.reduce((s, m) => s + m.lessons.length, 0)} lesson(s)` },
                { label: 'Assignment',  value: assignTitle || 'None' },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-white/5 last:border-0">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-gray-600">{row.label}</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{row.value}</span>
                </div>
              ))}
            </div>

            <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-300 font-semibold leading-relaxed">
                By publishing, you confirm this is your original content. All videos will be encrypted and watermarked — students cannot download or screen-record lessons.
              </p>
            </div>

            <div className="flex justify-between pt-4">
              <button onClick={() => setStep(3)} className="px-8 py-4 rounded-2xl font-bold text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-white transition-colors">← Back</button>
              <button onClick={handlePublish} disabled={saving}
                className="px-12 py-4 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20 flex items-center gap-3 disabled:opacity-60">
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                {saving ? 'Publishing…' : 'Publish Course'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseUpload;
