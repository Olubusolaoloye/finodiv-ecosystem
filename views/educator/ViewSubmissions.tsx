
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
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
      const [{ data: courseData }, { data: subData }] = await Promise.all([
        supabase.from('courses').select('title').eq('id', courseId).maybeSingle(),
        supabase
          .from('submissions')
          .select(`
            id, user_id, content, file_url, submitted_at, grade, feedback, status,
            profiles!user_id (name, email),
            assignments!assignment_id (title)
          `)
          .eq('course_id', courseId)
          .order('submitted_at', { ascending: false }),
      ]);

      setCourseTitle(courseData?.title ?? 'Course');
      setSubs(
        (subData ?? []).map((r: any) => ({
          id: r.id,
          user_id: r.user_id,
          content: r.content,
          file_url: r.file_url,
          submitted_at: r.submitted_at,
          grade: r.grade,
          feedback: r.feedback,
          status: r.status,
          studentName: r.profiles?.name ?? 'Unknown',
          studentEmail: r.profiles?.email ?? '',
          assignmentTitle: r.assignments?.title ?? 'Assignment',
        }))
      );
      setLoading(false);
    };
    load();
  }, [courseId]);

  const handleGrade = async () => {
    if (!selected) return;
    setGrading(true);
    const { error } = await supabase
      .from('submissions')
      .update({
        grade: Number(grade) || null,
        feedback: feedback || null,
        graded_at: new Date().toISOString(),
        status: 'GRADED',
      })
      .eq('id', selected.id);

    if (!error) {
      setSubs(prev => prev.map(s => s.id === selected.id
        ? { ...s, grade: Number(grade) || null, feedback, status: 'GRADED' }
        : s
      ));
      setSelected(null);
      setGrade('');
      setFeedback('');
    }
    setGrading(false);
  };

  const statusBadge = (status: string) => {
    if (status === 'GRADED') return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto pb-32">
      <div className="flex items-center gap-4 mb-10">
        <Link to="/educator" className="p-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 transition-all text-slate-500 dark:text-gray-400">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 block mb-1">Educator Portal</span>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            Submissions — <span className="text-blue-500">{courseTitle}</span>
          </h1>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : subs.length === 0 ? (
        <div className="py-24 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-[32px] bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-6 text-slate-300 dark:text-gray-700">
            <ClipboardList className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-black mb-3 text-slate-900 dark:text-white">No submissions yet</h3>
          <p className="text-slate-500 dark:text-gray-500 max-w-sm">Students haven't submitted work for this course yet.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* List */}
          <div className="lg:col-span-2 space-y-4">
            {subs.map(sub => (
              <button
                key={sub.id}
                onClick={() => { setSelected(sub); setGrade(sub.grade?.toString() ?? ''); setFeedback(sub.feedback ?? ''); }}
                className={`w-full text-left p-6 rounded-[28px] border transition-all ${selected?.id === sub.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/5' : 'border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 hover:border-blue-500/40 hover:bg-slate-50 dark:hover:bg-white/[0.07]'}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 font-black text-sm shrink-0">
                      {sub.studentName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">{sub.studentName}</p>
                      <p className="text-[10px] text-slate-500 dark:text-gray-500">{sub.studentEmail}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusBadge(sub.status)}`}>
                    {sub.status}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-500 dark:text-gray-500 mb-2">{sub.assignmentTitle}</p>
                <p className="text-sm text-slate-700 dark:text-gray-300 line-clamp-2 leading-relaxed">{sub.content}</p>
                {sub.grade !== null && (
                  <div className="flex items-center gap-1.5 mt-3 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                    <Star className="w-3.5 h-3.5" /> Grade: {sub.grade}/100
                  </div>
                )}
                <div className="flex items-center gap-1.5 mt-2 text-slate-400 dark:text-gray-600 text-[10px] font-bold">
                  <Clock className="w-3 h-3" />
                  {new Date(sub.submitted_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </button>
            ))}
          </div>

          {/* Grade panel */}
          <div className="lg:sticky lg:top-28">
            {selected ? (
              <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[32px] p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-black text-slate-900 dark:text-white">{selected.studentName}</p>
                    <p className="text-xs text-slate-500 dark:text-gray-500">{selected.studentEmail}</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 mb-6 max-h-48 overflow-y-auto">
                  <p className="text-sm text-slate-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{selected.content}</p>
                  {selected.file_url && (
                    <a href={selected.file_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 mt-3 text-blue-500 text-xs font-bold hover:underline">
                      <ExternalLink className="w-3.5 h-3.5" /> View Attachment
                    </a>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500">Grade (out of 100)</label>
                    <input type="number" min="0" max="100" value={grade} onChange={e => setGrade(e.target.value)}
                      placeholder="e.g. 85"
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500">Feedback</label>
                    <textarea rows={4} value={feedback} onChange={e => setFeedback(e.target.value)}
                      placeholder="Leave constructive feedback for the student…"
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white text-sm resize-none" />
                  </div>
                  <button onClick={handleGrade} disabled={grading}
                    className="w-full py-4 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-60">
                    {grading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                    {grading ? 'Saving…' : 'Save Grade'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-[32px] p-10 flex flex-col items-center text-center">
                <MessageSquare className="w-10 h-10 text-slate-300 dark:text-gray-700 mb-4" />
                <p className="text-sm font-bold text-slate-400 dark:text-gray-600">Select a submission to grade it</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewSubmissions;
