
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api as backendApi } from '../../services/backend';
import { convex } from '../../services/convex';
import { api as convexApi } from '../../convex/_generated/api';
import {
  ArrowLeft, CheckCircle2, Clock, User, Loader2,
  Star, MessageSquare, ExternalLink, ClipboardList,
} from 'lucide-react';

interface Sub {
  id: string;
  user_id: string;
  content: string;
  file_url: string | null;
  submitted_at: string;
  grade: number | null;
  feedback: string | null;
  status: string;
  studentName: string;
  studentEmail: string;
  assignmentTitle: string;
}

const ViewSubmissions: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [subs, setSubs]         = useState<Sub[]>([]);
  const [loading, setLoading]   = useState(true);
  const [courseTitle, setCourseTitle] = useState('');
  const [selected, setSelected] = useState<Sub | null>(null);
  const [grade, setGrade]       = useState('');
  const [feedback, setFeedback] = useState('');
  const [grading, setGrading]   = useState(false);

  useEffect(() => {
    if (!courseId) return;
    const load = async () => {
      try {
        const [courses, subData] = await Promise.all([
          backendApi.getCourses(),
          backendApi.getAssignment(courseId),
        ]);
        const course = courses.find((c: any) => c.id === courseId);
        setCourseTitle(course?.title ?? 'Course');
        setSubs(
          (Array.isArray(subData) ? subData : []).map((r: any) => ({
            id: r._id ?? r.id,
            user_id: r.userId ?? r.user_id,
            content: r.content,
            file_url: r.fileUrl ?? r.file_url ?? null,
            submitted_at: r._creationTime ? new Date(r._creationTime).toISOString() : '',
            grade: r.grade ?? null,
            feedback: r.feedback ?? null,
            status: r.status,
            studentName: r.studentName ?? 'Student',
            studentEmail: r.studentEmail ?? '',
            assignmentTitle: r.title ?? 'Assignment',
          }))
        );
      } catch (e) {
        console.error('ViewSubmissions load:', e);
      }
      setLoading(false);
    };
    load();
  }, [courseId]);

  const handleGrade = async () => {
    if (!selected) return;
    setGrading(true);
    try {
      await convex.mutation(convexApi.submissions.grade, {
        id: selected.id as any,
        grade: Number(grade) || 0,
        feedback: feedback || '',
      });
      setSubs(prev => prev.map(s => s.id === selected.id
        ? { ...s, grade: Number(grade) || null, feedback, status: 'GRADED' }
        : s
      ));
      setSelected(null);
      setGrade('');
      setFeedback('');
    } catch (e) {
      console.error('grade error:', e);
    }
    setGrading(false);
  };

  const statusBadgeStyle = (status: string): React.CSSProperties =>
    status === 'GRADED'
      ? { background: 'rgba(52,211,153,0.08)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }
      : { background: 'rgba(245,158,11,0.08)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--color-accent)' }} />
    </div>
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/educator/submissions" className="p-2 rounded-lg hover:bg-white/5 transition-colors" style={{ color: 'var(--color-text-muted)' }}>
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>Submissions</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{courseTitle}</p>
        </div>
      </div>

      {subs.length === 0 ? (
        <div className="text-center py-16" style={{ color: 'var(--color-text-muted)' }}>
          <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No submissions yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {subs.map(sub => (
            <div
              key={sub.id}
              className="rounded-[14px] p-4 cursor-pointer transition-colors"
              style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
              onClick={() => { setSelected(sub); setGrade(String(sub.grade ?? '')); setFeedback(sub.feedback ?? ''); }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <User className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{sub.studentName}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{sub.studentEmail}</p>
                  </div>
                </div>
                <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 99, fontWeight: 700, ...statusBadgeStyle(sub.status) }}>{sub.status}</span>
              </div>
              <p className="text-sm mt-3 line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>{sub.content}</p>
              <div className="flex items-center gap-4 mt-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString() : '—'}</span>
                {sub.grade !== null && <span className="flex items-center gap-1"><Star className="w-3 h-3" />{sub.grade}/100</span>}
                {sub.file_url && <a href={sub.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline" onClick={e => e.stopPropagation()}><ExternalLink className="w-3 h-3" />Attachment</a>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grade modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(4,13,24,0.85)' }}>
          <div className="w-full max-w-lg rounded-[20px] p-6" style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Grade Submission</h2>
            <p className="text-sm mb-1 font-medium" style={{ color: 'var(--color-text-primary)' }}>{selected.studentName}</p>
            <p className="text-sm mb-4 line-clamp-4" style={{ color: 'var(--color-text-muted)' }}>{selected.content}</p>

            <div className="flex gap-3 mb-3">
              <div className="flex-1">
                <label className="text-xs uppercase tracking-wide mb-1 block" style={{ color: 'var(--color-text-muted)' }}>Grade (0–100)</label>
                <input
                  type="number" min={0} max={100} value={grade}
                  onChange={e => setGrade(e.target.value)}
                  className="w-full rounded-[10px] px-3 py-2 text-sm"
                  style={{ backgroundColor: 'var(--color-bg-deep)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="text-xs uppercase tracking-wide mb-1 block" style={{ color: 'var(--color-text-muted)' }}>Feedback</label>
              <textarea
                rows={3} value={feedback} onChange={e => setFeedback(e.target.value)}
                className="w-full rounded-[10px] px-3 py-2 text-sm resize-none"
                style={{ backgroundColor: 'var(--color-bg-deep)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setSelected(null)} className="flex-1 py-2 rounded-[10px] text-sm" style={{ backgroundColor: 'var(--color-bg-deep)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>Cancel</button>
              <button onClick={handleGrade} disabled={grading} className="flex-1 py-2 rounded-[10px] text-sm font-semibold text-white flex items-center justify-center gap-2" style={{ backgroundColor: 'var(--color-accent)' }}>
                {grading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Save Grade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewSubmissions;
