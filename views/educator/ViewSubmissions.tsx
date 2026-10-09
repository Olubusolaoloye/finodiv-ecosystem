import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import { convex } from '../../services/convex';
import { getSession } from '../../services/session';
import { errorMessage } from '../../services/errors';
import {
  ArrowLeft, CheckCircle2, Clock, Loader2, Plus, X, ClipboardList,
  ExternalLink, Users, FileText, AlertCircle, MessageSquare,
} from 'lucide-react';

interface Submission {
  _id: Id<'submissions'>;
  _creationTime: number;
  userId: string;
  studentName: string;
  studentEmail: string;
  studentAvatar?: string;
  content: string;
  fileUrl?: string;
  grade?: number;
  feedback?: string;
  status: 'SUBMITTED' | 'GRADED' | 'RETURNED';
}

interface GradeTarget {
  submission: Submission;
  assignmentTitle: string;
  maxGrade: number;
}

const card: React.CSSProperties = {
  background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 18,
};
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: 10, fontSize: 14,
  background: 'var(--color-bg-deep)', border: '1px solid var(--color-border)',
  color: 'var(--color-text-primary)', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
};
const labelStyle: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em',
  color: 'var(--color-text-muted)', display: 'block', marginBottom: 6,
};

const StatusPill: React.FC<{ status?: Submission['status']; grade?: number; max?: number }> = ({ status, grade, max }) => {
  const style = !status
    ? { bg: 'rgba(148,163,184,0.12)', color: 'var(--color-text-muted)', label: 'Missing' }
    : status === 'GRADED'
      ? { bg: 'rgba(52,211,153,0.1)', color: '#34d399', label: `Graded${grade !== undefined ? ` · ${grade}/${max ?? 100}` : ''}` }
      : { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', label: 'To grade' };
  return (
    <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 99, fontWeight: 700, whiteSpace: 'nowrap', background: style.bg, color: style.color }}>
      {style.label}
    </span>
  );
};

const Avatar: React.FC<{ src?: string; userId: string; size?: number }> = ({ src, userId, size = 34 }) => (
  <img src={src || `https://i.pravatar.cc/100?u=${userId}`} alt="" style={{ width: size, height: size, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
);

const ViewSubmissions: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const session = getSession();
  const gradebook = useQuery(
    api.submissions.courseGradebook,
    courseId && session ? { courseId: courseId as Id<'courses'>, instructorId: session.userId } : 'skip',
  );

  const [view, setView] = useState<'assignment' | 'student'>('assignment');
  const [target, setTarget] = useState<GradeTarget | null>(null);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [grading, setGrading] = useState(false);
  const [gradeError, setGradeError] = useState('');

  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDue, setNewDue] = useState('');
  const [newMax, setNewMax] = useState('100');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const byStudent = useMemo(() => {
    if (!gradebook) return [];
    return gradebook.students.map(student => ({
      ...student,
      rows: gradebook.assignments.map(a => ({
        assignment: a,
        submission: a.submissions.find(s => s.userId === student.userId),
      })),
    }));
  }, [gradebook]);

  const openGrade = (t: GradeTarget) => {
    setTarget(t);
    setGrade(t.submission.grade !== undefined ? String(t.submission.grade) : '');
    setFeedback(t.submission.feedback ?? '');
    setGradeError('');
  };

  const handleGrade = async () => {
    if (!target || !session) return;
    const value = Number(grade);
    if (grade.trim() === '' || !Number.isFinite(value) || value < 0 || value > target.maxGrade) {
      setGradeError(`Enter a grade between 0 and ${target.maxGrade}.`);
      return;
    }
    setGrading(true);
    try {
      await convex.mutation(api.submissions.grade, {
        submissionId: target.submission._id,
        graderId: session.userId,
        grade: value,
        feedback,
      });
      setTarget(null);
    } catch (e) {
      setGradeError(errorMessage(e, 'Could not save grade.'));
    }
    setGrading(false);
  };

  const handleCreate = async () => {
    if (!session || !courseId) return;
    setCreateError('');
    if (!newTitle.trim()) { setCreateError('Title is required.'); return; }
    setCreating(true);
    try {
      await convex.mutation(api.submissions.createAssignment, {
        courseId: courseId as Id<'courses'>,
        title: newTitle,
        description: newDesc,
        dueDate: newDue ? new Date(newDue).getTime() : undefined,
        maxGrade: Number(newMax) || 100,
        createdBy: session.userId,
      });
      setShowNew(false); setNewTitle(''); setNewDesc(''); setNewDue(''); setNewMax('100');
    } catch (e) {
      setCreateError(errorMessage(e, 'Could not create assignment.'));
    }
    setCreating(false);
  };

  if (gradebook === undefined) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--color-accent)' }} />
    </div>
  );

  if (gradebook === null) return (
    <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>
      <p style={{ marginBottom: 16 }}>You don't have access to this course's submissions.</p>
      <Link to="/educator/submissions" style={{ color: 'var(--color-accent)', fontWeight: 600 }}>Back to my courses</Link>
    </div>
  );

  const totalPending = gradebook.assignments.reduce((n, a) => n + a.submissions.filter(s => s.status === 'SUBMITTED').length, 0);

  return (
    <div style={{ padding: '32px clamp(16px, 4vw, 32px) 120px', maxWidth: 1040, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <Link to="/educator/submissions" style={{ padding: 8, borderRadius: 10, color: 'var(--color-text-muted)', display: 'flex' }} className="hover:bg-black/5 dark:hover:bg-white/5">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text-primary)' }}>{gradebook.courseTitle}</h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
            {gradebook.assignments.length} assignment{gradebook.assignments.length === 1 ? '' : 's'} · {gradebook.students.length} student{gradebook.students.length === 1 ? '' : 's'} · {totalPending} to grade
          </p>
        </div>
        <button onClick={() => setShowNew(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 12, background: 'var(--color-accent)', color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
          <Plus style={{ width: 15, height: 15 }} /> New Assignment
        </button>
      </div>

      {/* View toggle */}
      <div style={{ display: 'inline-flex', gap: 4, padding: 4, borderRadius: 12, ...card, marginBottom: 20 }}>
        {([['assignment', 'By Assignment', FileText], ['student', 'By Student', Users]] as const).map(([key, label, Icon]) => (
          <button key={key} onClick={() => setView(key)} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
            background: view === key ? 'var(--color-accent)' : 'transparent', color: view === key ? '#fff' : 'var(--color-text-muted)',
          }}>
            <Icon style={{ width: 14, height: 14 }} /> {label}
          </button>
        ))}
      </div>

      {gradebook.assignments.length === 0 ? (
        <div style={{ ...card, padding: '64px 24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 6 }}>No assignments yet</p>
          <p style={{ fontSize: 13 }}>Create an assignment and enrolled students can submit from the course page.</p>
        </div>
      ) : view === 'assignment' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {gradebook.assignments.map(a => {
            const submittedIds = new Set(a.submissions.map(s => s.userId));
            const missing = gradebook.students.filter(s => !submittedIds.has(s.userId));
            return (
              <section key={a._id} style={{ ...card, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>{a.title}</h2>
                    {a.description && <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4, lineHeight: 1.5 }}>{a.description}</p>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {a.dueDate && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock style={{ width: 12, height: 12 }} /> Due {new Date(a.dueDate).toLocaleDateString()}</span>}
                    <span>{a.submissions.length}/{gradebook.students.length} submitted · max {a.maxGrade}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {a.submissions.map(sub => (
                    <button key={sub._id} onClick={() => openGrade({ submission: sub, assignmentTitle: a.title, maxGrade: a.maxGrade })}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 12, background: 'var(--color-bg-deep)', border: '1px solid var(--color-border)', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                      <Avatar src={sub.studentAvatar} userId={sub.userId} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>{sub.studentName}</p>
                        <p style={{ fontSize: 12, color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub.content}</p>
                      </div>
                      <StatusPill status={sub.status} grade={sub.grade} max={a.maxGrade} />
                    </button>
                  ))}
                  {missing.map(st => (
                    <div key={st.userId} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 12, border: '1px dashed var(--color-border)', opacity: 0.75 }}>
                      <Avatar src={st.avatarUrl} userId={st.userId} />
                      <p style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>{st.name}</p>
                      <StatusPill />
                    </div>
                  ))}
                  {a.submissions.length === 0 && missing.length === 0 && (
                    <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>No students enrolled yet.</p>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {byStudent.length === 0 && (
            <div style={{ ...card, padding: 40, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 14 }}>No students enrolled yet.</div>
          )}
          {byStudent.map(st => {
            const done = st.rows.filter(r => r.submission).length;
            return (
              <section key={st.userId} style={{ ...card, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                  <Avatar src={st.avatarUrl} userId={st.userId} size={40} />
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <Link to={`/profile/${st.userId}`} style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', textDecoration: 'none' }}>{st.name}</Link>
                    <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{st.email} · {done}/{st.rows.length} submitted</p>
                  </div>
                  {session && st.userId !== session.userId && (
                    <Link to={`/community?with=${encodeURIComponent(st.userId)}`} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 9, border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                      <MessageSquare style={{ width: 13, height: 13 }} /> Message
                    </Link>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {st.rows.map(({ assignment, submission }) => (
                    <button key={assignment._id} disabled={!submission}
                      onClick={() => submission && openGrade({ submission, assignmentTitle: assignment.title, maxGrade: assignment.maxGrade })}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 12, width: '100%', textAlign: 'left',
                        background: submission ? 'var(--color-bg-deep)' : 'transparent',
                        border: submission ? '1px solid var(--color-border)' : '1px dashed var(--color-border)',
                        cursor: submission ? 'pointer' : 'default' }}>
                      <FileText style={{ width: 15, height: 15, color: 'var(--color-text-muted)', flexShrink: 0 }} />
                      <p style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>{assignment.title}</p>
                      <StatusPill status={submission?.status} grade={submission?.grade} max={assignment.maxGrade} />
                    </button>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Grade modal */}
      {target && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'var(--color-overlay)' }}
          onClick={e => { if (e.target === e.currentTarget) setTarget(null); }}>
          <div style={{ ...card, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', padding: 24, borderRadius: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <Avatar src={target.submission.studentAvatar} userId={target.submission.userId} size={40} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>{target.submission.studentName}</p>
                <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{target.assignmentTitle} · submitted {new Date(target.submission._creationTime).toLocaleDateString()}</p>
              </div>
              <button onClick={() => setTarget(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><X className="w-5 h-5" /></button>
            </div>
            <div style={{ padding: 14, borderRadius: 12, background: 'var(--color-bg-deep)', border: '1px solid var(--color-border)', fontSize: 14, color: 'var(--color-text-primary)', whiteSpace: 'pre-wrap', lineHeight: 1.6, marginBottom: 16, maxHeight: 260, overflowY: 'auto' }}>
              {target.submission.content}
            </div>
            {target.submission.fileUrl && /^https?:\/\//i.test(target.submission.fileUrl) && (
              <a href={target.submission.fileUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-accent)', marginBottom: 16 }}>
                <ExternalLink style={{ width: 13, height: 13 }} /> Attachment
              </a>
            )}
            <div style={{ marginBottom: 12, maxWidth: 160 }}>
              <label style={labelStyle}>Grade (0–{target.maxGrade})</label>
              <input type="number" min={0} max={target.maxGrade} value={grade} onChange={e => setGrade(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Feedback</label>
              <textarea rows={3} value={feedback} onChange={e => setFeedback(e.target.value)} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
            {gradeError && <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#f87171', marginBottom: 12 }}><AlertCircle style={{ width: 14, height: 14 }} /> {gradeError}</p>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setTarget(null)} style={{ flex: 1, padding: 11, borderRadius: 10, background: 'var(--color-bg-deep)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleGrade} disabled={grading} style={{ flex: 1, padding: 11, borderRadius: 10, background: 'var(--color-accent)', color: '#fff', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {grading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Save Grade
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New assignment modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'var(--color-overlay)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowNew(false); }}>
          <div style={{ ...card, width: '100%', maxWidth: 520, padding: 24, borderRadius: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-text-primary)' }}>New Assignment</h2>
              <button onClick={() => setShowNew(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><X className="w-5 h-5" /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div><label style={labelStyle}>Title *</label><input value={newTitle} maxLength={160} onChange={e => setNewTitle(e.target.value)} style={inputStyle} placeholder="Build an ERC-20 token" /></div>
              <div><label style={labelStyle}>Instructions</label><textarea rows={4} value={newDesc} onChange={e => setNewDesc(e.target.value)} style={{ ...inputStyle, resize: 'vertical' }} placeholder="What should students submit?" /></div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}><label style={labelStyle}>Due date</label><input type="date" value={newDue} onChange={e => setNewDue(e.target.value)} style={inputStyle} /></div>
                <div style={{ width: 120 }}><label style={labelStyle}>Max grade</label><input type="number" min={1} max={1000} value={newMax} onChange={e => setNewMax(e.target.value)} style={inputStyle} /></div>
              </div>
            </div>
            {createError && <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#f87171', marginTop: 12 }}><AlertCircle style={{ width: 14, height: 14 }} /> {createError}</p>}
            <button onClick={handleCreate} disabled={creating} style={{ width: '100%', marginTop: 18, padding: 12, borderRadius: 10, background: 'var(--color-accent)', color: '#fff', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Create Assignment
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewSubmissions;
