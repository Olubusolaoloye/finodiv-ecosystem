import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSession } from '../../services/session';
import { api as backendApi } from '../../services/backend';
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

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--color-bg-deep)',
  border: '1px solid var(--color-border)',
  borderRadius: 14,
  padding: '14px 18px',
  outline: 'none',
  color: 'var(--color-text-primary)',
  fontSize: 14,
  fontFamily: 'inherit',
};

const labelStyle: React.CSSProperties = {
  fontSize: 9, fontWeight: 800, textTransform: 'uppercase',
  letterSpacing: '0.15em', color: 'var(--color-text-muted',
  display: 'block', marginBottom: 8,
};

const CourseUpload: React.FC = () => {
  const navigate = useNavigate();
  const thumbRef = useRef<HTMLInputElement>(null);

  const [step, setStep]     = useState(1);
  const [saving, setSaving] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [done, setDone]     = useState(false);

  const [title, setTitle]       = useState('');
  const [description, setDesc]  = useState('');
  const [category, setCategory] = useState('Smart Contracts');
  const [level, setLevel]       = useState('Beginner');
  const [price, setPrice]       = useState('');
  const [thumb, setThumb]       = useState<File | null>(null);
  const [thumbPreview, setThumbPreview] = useState('');
  const [modules, setModules]   = useState<ModuleInput[]>([newModule()]);
  const [assignTitle, setAssignTitle] = useState('');
  const [assignDesc, setAssignDesc]   = useState('');
  const [assignDue, setAssignDue]     = useState('');

  const handleThumb = (f: File | null) => {
    setThumb(f);
    setThumbPreview(f ? URL.createObjectURL(f) : '');
  };

  const handleVideoSelect = (modIdx: number, lesIdx: number, f: File | null) => {
    setModules(prev => {
      const next = [...prev];
      next[modIdx] = { ...next[modIdx], lessons: [...next[modIdx].lessons] };
      next[modIdx].lessons[lesIdx] = { ...next[modIdx].lessons[lesIdx], videoFile: f, videoPreview: f ? URL.createObjectURL(f) : '' };
      return next;
    });
  };

  const addModule    = () => setModules(p => [...p, newModule()]);
  const removeModule = (i: number) => setModules(p => p.filter((_, idx) => idx !== i));
  const addLesson    = (modIdx: number) => setModules(p => {
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

  const handlePublish = async () => {
    setErrMsg('');
    if (!title.trim())        { setErrMsg('Course title is required.'); return; }
    if (!description.trim())  { setErrMsg('Description is required.'); return; }
    if (modules.some(m => !m.title.trim())) { setErrMsg('All modules need a title.'); return; }

    setSaving(true);
    try {
      const session = getSession();
      if (!session) { setErrMsg('You must be logged in.'); setSaving(false); return; }

      const modulesJson = modules.map(mod => ({
        id: mod.id, title: mod.title,
        lessons: mod.lessons.map(les => ({
          id: les.id, title: les.title || 'Untitled Lesson', video_url: null as string | null, duration: les.duration,
        })),
      }));

      await backendApi.addCourse({
        title: title.trim(), description: description.trim(), category, level,
        price: Number(price) || 0, imageUrl: undefined,
        instructorId: session.userId,
        instructorName: session.email?.split('@')[0] || 'Educator',
        isPublished: true,
        duration: `${modules.reduce((a, m) => a + m.lessons.length, 0)} lessons`,
        modules: modulesJson,
      } as any);

      setDone(true);
    } catch (e: any) {
      setErrMsg(e.message || 'Something went wrong. Please try again.');
    }
    setSaving(false);
  };

  if (done) {
    return (
      <div style={{ minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, background: 'var(--color-bg-primary)' }}>
        <div style={{ width: '100%', maxWidth: 440, textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: 22, background: 'rgba(52,211,153,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', color: '#34d399' }}>
            <CheckCircle2 style={{ width: 36, height: 36 }} />
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 12, color: 'var(--color-text-primary)' }}>Course Published!</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: 36, fontSize: 14 }}>Your course is now live and students can enrol.</p>
          <div style={{ display: 'flex', gap: 14 }}>
            <Link to="/educator" style={{ flex: 1, padding: '14px', borderRadius: 14, background: 'var(--color-accent)', color: '#fff', fontWeight: 800, fontSize: 14, textDecoration: 'none', textAlign: 'center' }}>
              Back to Dashboard
            </Link>
            <button onClick={() => { setDone(false); setTitle(''); setDesc(''); setThumb(null); setThumbPreview(''); setModules([newModule()]); setStep(1); }}
              style={{ flex: 1, padding: '14px', borderRadius: 14, background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
              Add Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  const STEPS = ['Course Info', 'Content', 'Assignment', 'Publish'];

  return (
    <div style={{ padding: '40px', maxWidth: 1000, margin: '0 auto', paddingBottom: 128 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
        <Link to="/educator" style={{ padding: 10, borderRadius: 12, background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', textDecoration: 'none', display: 'flex' }}>
          <ArrowLeft style={{ width: 18, height: 18 }} />
        </Link>
        <div>
          <h1 style={{ fontSize: 'clamp(1.4rem,3vw,1.75rem)', fontWeight: 900, color: 'var(--color-text-primary)' }}>Upload New Course</h1>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>All video content is protected and non-downloadable.</p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 7, padding: '7px 14px', borderRadius: 99, background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', color: '#34d399', fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          <Shield style={{ width: 13, height: 13 }} /> DRM Protected
        </div>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40, overflowX: 'auto', paddingBottom: 4 }}>
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <button
              onClick={() => i + 1 < step && setStep(i + 1)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 10, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', whiteSpace: 'nowrap',
                background: step === i + 1 ? 'var(--color-accent)' : step > i + 1 ? 'rgba(52,211,153,0.08)' : 'var(--color-bg-card)',
                color: step === i + 1 ? '#fff' : step > i + 1 ? '#34d399' : 'var(--color-text-muted)',
                border: step === i + 1 ? 'none' : step > i + 1 ? '1px solid rgba(52,211,153,0.2)' : '1px solid var(--color-border)',
                cursor: step > i + 1 ? 'pointer' : 'default',
              }}
            >
              {step > i + 1 && <CheckCircle2 style={{ width: 12, height: 12 }} />}
              {i + 1}. {s}
            </button>
            {i < STEPS.length - 1 && <div style={{ width: 20, height: 1, background: 'var(--color-border)', flexShrink: 0 }} />}
          </React.Fragment>
        ))}
      </div>

      {errMsg && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 18px', borderRadius: 14, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', marginBottom: 28 }}>
          <AlertCircle style={{ width: 15, height: 15, color: '#f87171', flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 13, color: '#f87171', fontWeight: 600 }}>{errMsg}</p>
        </div>
      )}

      <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 28, padding: '40px' }}>

        {/* Step 1: Course Info */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: 'var(--color-text-primary)', marginBottom: 4 }}>Course Information</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Course Title *</label>
                <input value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Advanced Solidity: From Zero to DeFi"
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Description *</label>
                <textarea rows={4} value={description} onChange={e => setDesc(e.target.value)}
                  placeholder="What will students learn? Why is this course valuable?"
                  style={{ ...inputStyle, resize: 'none' }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                />
              </div>
              <div>
                <label style={labelStyle}>Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)}
                  style={{ ...inputStyle, appearance: 'none' }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                >
                  {['Smart Contracts','DeFi','Security','ZK / L2','AI + Web3','Frontend Web3','Blockchain Data','Gaming','Community','Technical Writing','DAO Governance','RWA / Tokenization','MEV / Quant','DevRel'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Level</label>
                <select value={level} onChange={e => setLevel(e.target.value)}
                  style={{ ...inputStyle, appearance: 'none' }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                >
                  {['Beginner','Intermediate','Advanced'].map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Price (USD)</label>
                <input type="number" min="0" value={price} onChange={e => setPrice(e.target.value)}
                  placeholder="0 for free"
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                />
              </div>
              <div>
                <label style={labelStyle}>Course Thumbnail</label>
                <button type="button" onClick={() => thumbRef.current?.click()}
                  style={{ width: '100%', height: 96, borderRadius: 14, border: '2px dashed var(--color-border)', cursor: 'pointer', background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, overflow: 'hidden', position: 'relative', transition: 'border-color 0.15s' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(139,92,246,0.4)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)')}
                >
                  {thumbPreview ? (
                    <img src={thumbPreview} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, color: 'var(--color-text-muted)' }}>
                      <ImageIcon style={{ width: 22, height: 22 }} />
                      <span style={{ fontSize: 11, fontWeight: 700 }}>Click to upload (JPG/PNG)</span>
                    </div>
                  )}
                </button>
                <input ref={thumbRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleThumb(e.target.files?.[0] || null)} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
              <button onClick={() => { if (!title.trim() || !description.trim()) { setErrMsg('Title and description are required.'); return; } setErrMsg(''); setStep(2); }}
                style={{ padding: '13px 28px', borderRadius: 14, background: 'var(--color-accent)', color: '#fff', fontWeight: 800, fontSize: 14, border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(139,92,246,0.2)' }}>
                Next: Add Content →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Modules & Lessons */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 900, color: 'var(--color-text-primary)' }}>Course Content</h2>
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 6 }}>Add modules and upload video lessons. Videos are encrypted and watermarked.</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                <ShieldAlert style={{ width: 12, height: 12 }} /> No-Download Mode
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {modules.map((mod, mIdx) => (
                <div key={mod.id} style={{ border: '1px solid var(--color-border)', borderRadius: 20, padding: 22, background: 'var(--color-bg-deep)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 10, background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)', fontWeight: 900, fontSize: 13, flexShrink: 0 }}>
                      {mIdx + 1}
                    </div>
                    <input value={mod.title} onChange={e => updateModule(mIdx, { title: e.target.value })}
                      placeholder={`Module ${mIdx + 1} title`}
                      style={{ flex: 1, background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '10px 14px', color: 'var(--color-text-primary)', fontSize: 13, fontWeight: 700, outline: 'none', fontFamily: 'inherit' }}
                      onFocus={e => (e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)')}
                      onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                    />
                    {modules.length > 1 && (
                      <button onClick={() => removeModule(mIdx)} style={{ padding: 8, borderRadius: 10, color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}
                      >
                        <Trash2 style={{ width: 15, height: 15 }} />
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingLeft: 44 }}>
                    {mod.lessons.map((les, lIdx) => (
                      <div key={les.id} style={{ display: 'flex', flexWrap: 'wrap', gap: 12, padding: 14, borderRadius: 14, background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
                        <div style={{ flex: 1, minWidth: 180, display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <input value={les.title} onChange={e => updateLesson(mIdx, lIdx, { title: e.target.value })}
                            placeholder={`Lesson ${lIdx + 1} title`}
                            style={{ width: '100%', background: 'var(--color-bg-deep)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '9px 13px', color: 'var(--color-text-primary)', fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
                            onFocus={e => (e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)')}
                            onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                          />
                          <input value={les.duration} onChange={e => updateLesson(mIdx, lIdx, { duration: e.target.value })}
                            placeholder="Duration (e.g. 12:30)"
                            style={{ width: '100%', background: 'var(--color-bg-deep)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '9px 13px', color: 'var(--color-text-primary)', fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
                            onFocus={e => (e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)')}
                            onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                          />
                        </div>
                        <div style={{ width: 160 }}>
                          <p style={{ ...labelStyle, marginBottom: 6 }}>Video (MP4/WebM)</p>
                          <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 66, borderRadius: 10, border: `2px dashed ${les.videoFile ? 'rgba(52,211,153,0.4)' : 'var(--color-border)'}`, cursor: 'pointer', background: les.videoFile ? 'rgba(52,211,153,0.05)' : 'transparent', transition: 'border-color 0.15s', overflow: 'hidden' }}>
                            <input type="file" accept="video/*" style={{ display: 'none' }} onChange={e => handleVideoSelect(mIdx, lIdx, e.target.files?.[0] || null)} />
                            {les.videoFile ? (
                              <span style={{ fontSize: 9, fontWeight: 700, color: '#34d399', padding: '0 8px', wordBreak: 'break-all', textAlign: 'center' }}>{les.videoFile.name}</span>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, color: 'var(--color-text-muted)' }}>
                                <Video style={{ width: 18, height: 18 }} />
                                <span style={{ fontSize: 9, fontWeight: 700 }}>Upload Video</span>
                              </div>
                            )}
                          </label>
                        </div>
                        {mod.lessons.length > 1 && (
                          <button onClick={() => removeLesson(mIdx, lIdx)} style={{ alignSelf: 'flex-start', padding: 7, borderRadius: 8, color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}
                          >
                            <X style={{ width: 14, height: 14 }} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button onClick={() => addLesson(mIdx)} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, fontWeight: 700, color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}>
                      <Plus style={{ width: 13, height: 13 }} /> Add Lesson
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={addModule} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: 'var(--color-text-muted)', background: 'none', border: '2px dashed var(--color-border)', borderRadius: 16, padding: '14px', width: '100%', cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-accent)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(139,92,246,0.3)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; }}
            >
              <Plus style={{ width: 15, height: 15 }} /> Add Module
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8 }}>
              <button onClick={() => setStep(1)} style={{ padding: '12px 22px', borderRadius: 14, fontWeight: 700, color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>← Back</button>
              <button onClick={() => { setErrMsg(''); setStep(3); }} style={{ padding: '13px 28px', borderRadius: 14, background: 'var(--color-accent)', color: '#fff', fontWeight: 800, fontSize: 14, border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(139,92,246,0.2)' }}>
                Next: Assignment →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Assignment */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: 'var(--color-text-primary)' }}>Create Assignment</h2>
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 6 }}>Optional — students submit work directly from the course page. You can grade from your dashboard.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={labelStyle}>Assignment Title</label>
                <input value={assignTitle} onChange={e => setAssignTitle(e.target.value)}
                  placeholder="e.g. Build and deploy your first ERC-20 token"
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                />
              </div>
              <div>
                <label style={labelStyle}>Instructions / Description</label>
                <textarea rows={5} value={assignDesc} onChange={e => setAssignDesc(e.target.value)}
                  placeholder="Describe what students need to submit — code, write-up, GitHub link, etc."
                  style={{ ...inputStyle, resize: 'none' }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                />
              </div>
              <div>
                <label style={labelStyle}>Due Date (optional)</label>
                <input type="datetime-local" value={assignDue} onChange={e => setAssignDue(e.target.value)}
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8 }}>
              <button onClick={() => setStep(2)} style={{ padding: '12px 22px', borderRadius: 14, fontWeight: 700, color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>← Back</button>
              <button onClick={() => { setErrMsg(''); setStep(4); }} style={{ padding: '13px 28px', borderRadius: 14, background: 'var(--color-accent)', color: '#fff', fontWeight: 800, fontSize: 14, border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(139,92,246,0.2)' }}>
                Next: Review →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Review & Publish */}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: 'var(--color-text-primary)' }}>Review & Publish</h2>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {[
                { label: 'Title',      value: title },
                { label: 'Category',   value: category },
                { label: 'Level',      value: level },
                { label: 'Price',      value: price ? `$${price}` : 'Free' },
                { label: 'Modules',    value: `${modules.length} module(s), ${modules.reduce((s, m) => s + m.lessons.length, 0)} lesson(s)` },
                { label: 'Assignment', value: assignTitle || 'None' },
              ].map((row, i, arr) => (
                <div key={row.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                  <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--color-text-muted)' }}>{row.label}</span>
                  <span style={{ fontWeight: 700, color: 'var(--color-text-primary)', fontSize: 13 }}>{row.value}</span>
                </div>
              ))}
            </div>

            <div style={{ padding: '16px 18px', borderRadius: 14, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <AlertCircle style={{ width: 14, height: 14, color: '#f59e0b', flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 12, color: '#f59e0b', fontWeight: 600, lineHeight: 1.6 }}>
                By publishing, you confirm this is your original content. All videos will be encrypted and watermarked — students cannot download or screen-record lessons.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8 }}>
              <button onClick={() => setStep(3)} style={{ padding: '12px 22px', borderRadius: 14, fontWeight: 700, color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>← Back</button>
              <button onClick={handlePublish} disabled={saving}
                style={{ padding: '13px 32px', borderRadius: 14, background: 'var(--color-accent)', color: '#fff', fontWeight: 800, fontSize: 14, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, opacity: saving ? 0.6 : 1, boxShadow: '0 8px 24px rgba(139,92,246,0.2)' }}>
                {saving ? <Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} /> : <Upload style={{ width: 18, height: 18 }} />}
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
