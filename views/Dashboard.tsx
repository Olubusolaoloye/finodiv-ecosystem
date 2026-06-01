
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserRole } from '../types';
import { api } from '../services/backend';
import { supabase } from '../services/supabase';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import {
  Trophy, TrendingUp, BookOpen, Star, ArrowUpRight, ExternalLink,
  ShieldCheck, Loader2, Plus,
} from 'lucide-react';

interface Enrollment {
  courseId: string;
  progress: number;
  course: any;
}

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salaryRange: string;
  tags: string[];
}

const JOB_ICONS = [ShieldCheck, Star, TrendingUp];
const JOB_COLORS = [
  'text-purple-600 dark:text-purple-400',
  'text-indigo-600 dark:text-indigo-400',
  'text-blue-600 dark:text-blue-400',
];

const Dashboard: React.FC<{ role: UserRole }> = ({ role }) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ name: string; xp: number; level: number } | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [xpChartData, setXpChartData] = useState<Array<{ label: string; xp: number }>>([]);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoadingEnrollments(false); return; }

      const [{ data: prof }, enrolData, jobData, { data: lessonData }] = await Promise.all([
        supabase.from('profiles').select('name, xp, level').eq('id', user.id).maybeSingle(),
        api.getEnrollments(user.id),
        api.getJobs(),
        supabase
          .from('lesson_progress')
          .select('completed_at')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: true }),
      ]);

      if (prof) {
        setProfile({
          name: prof.name || user.email?.split('@')[0] || 'Learner',
          xp: prof.xp || 0,
          level: prof.level || 1,
        });
      }

      setEnrollments(enrolData);
      setJobs((jobData as Job[]).slice(0, 3));

      // Build real XP chart from lesson_progress timestamps
      if (lessonData && lessonData.length > 0) {
        const byDate = new Map<string, number>();
        lessonData.forEach((row: any, i: number) => {
          const label = new Date(row.completed_at).toLocaleDateString('en', { month: 'short', day: 'numeric' });
          byDate.set(label, (i + 1) * 100);
        });
        const chartPoints = Array.from(byDate.entries())
          .slice(-8)
          .map(([label, xp]) => ({ label, xp }));
        setXpChartData(chartPoints);
      } else {
        // Flat line placeholder until lessons are completed
        setXpChartData([0, 0, 0, 0, 0].map((xp, i) => ({ label: '', xp })));
      }

      setLoadingEnrollments(false);
    };
    load();
  }, []);

  const displayName = profile?.name || 'Learner';
  const xp = profile?.xp || 0;
  const level = profile?.level || 1;
  const xpForNextLevel = level * 500;
  const xpProgress = Math.min(100, Math.round((xp / xpForNextLevel) * 100));

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-slate-900 dark:text-white">
            Welcome back,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-500">
              {displayName}!
            </span>
          </h1>
          <p className="text-slate-500 dark:text-gray-500">Here's your progress summary for today.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-white transition-all font-semibold text-sm shadow-sm dark:shadow-none">
          <ExternalLink className="w-4 h-4" />
          Share Profile
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Col */}
        <div className="lg:col-span-2 space-y-8">
          {/* XP Card */}
          <div className="bg-white dark:bg-white/5 rounded-[32px] p-8 border border-slate-200 dark:border-white/5 relative overflow-hidden shadow-sm dark:shadow-none">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full" />
            <div className="relative z-10 flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold mb-1 text-slate-900 dark:text-white">Level {level}: Web3 Explorer</h3>
                <p className="text-sm text-slate-500 dark:text-gray-500">{xp} / {xpForNextLevel} XP</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="h-3 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 rounded-full transition-all duration-1000"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
            <p className="text-xs text-right text-slate-500 dark:text-gray-500">{xpForNextLevel - xp} XP to next level</p>
          </div>

          {/* Enrolled Courses */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Continue Your Journey</h2>
              <Link to="/courses" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                Browse courses
              </Link>
            </div>

            {loadingEnrollments ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            ) : enrollments.length === 0 ? (
              <div className="bg-white dark:bg-white/5 rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10 p-12 flex flex-col items-center text-center">
                <BookOpen className="w-12 h-12 text-slate-300 dark:text-gray-600 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No courses yet</h3>
                <p className="text-sm text-slate-500 dark:text-gray-500 mb-6">Enroll in a course to start your Web3 journey.</p>
                <Link
                  to="/courses"
                  className="px-6 py-3 rounded-2xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Browse Courses
                </Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-6">
                {enrollments.slice(0, 4).map((enrol) => (
                  <div
                    key={enrol.courseId}
                    className="bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/5 overflow-hidden group hover:border-blue-500/30 transition-all shadow-sm dark:shadow-none"
                  >
                    <div className="aspect-video relative overflow-hidden">
                      <img
                        src={enrol.course?.image || `https://picsum.photos/seed/${enrol.courseId}/400/250`}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-6">
                      <h4 className="font-bold mb-1 text-slate-900 dark:text-white">
                        {enrol.course?.title || `Course ${enrol.courseId}`}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-gray-500 mb-4">
                        {enrol.course?.category || 'Web3'}
                      </p>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden mb-2">
                        <div
                          className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-500"
                          style={{ width: `${enrol.progress}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-gray-500 mb-4">{enrol.progress}% complete</p>
                      <Link
                        to={`/learning/${enrol.courseId}`}
                        className="w-full py-3 rounded-2xl bg-[#2F6DF2] text-white text-sm font-bold hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/10 block text-center"
                      >
                        Continue Learning
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col */}
        <div className="space-y-8">
          {/* XP Chart */}
          <div className="bg-white dark:bg-white/5 rounded-[32px] p-8 border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none">
            <h3 className="text-sm font-medium text-slate-500 dark:text-gray-500 mb-1">XP Progress</h3>
            <div className="flex items-end gap-3 mb-6">
              <span className="text-4xl font-black text-slate-900 dark:text-white">{xp.toLocaleString()}</span>
              <span className="text-green-600 dark:text-green-400 text-sm flex items-center mb-1 font-bold">
                <ArrowUpRight className="w-4 h-4" /> XP
              </span>
            </div>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={xpChartData}>
                  <defs>
                    <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#2F6DF2" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2F6DF2" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1d23', border: 'none', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(v: any) => [`${v} XP`, 'Earned']}
                    labelFormatter={(l: string) => l || ''}
                  />
                  <Area
                    type="monotone"
                    dataKey="xp"
                    stroke="#2F6DF2"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorXp)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-center text-slate-400 dark:text-gray-600 mt-3 font-bold uppercase tracking-widest">
              {xp > 0 ? 'XP earned from lesson completions' : 'Complete lessons to earn XP'}
            </p>
          </div>

          {/* Job Board Preview */}
          <div className="bg-white dark:bg-white/5 rounded-[32px] p-8 border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none">
            <h3 className="text-lg font-bold mb-6 text-slate-900 dark:text-white">Your Next Big Thing</h3>
            <div className="space-y-4">
              {jobs.length === 0 ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                </div>
              ) : (
                jobs.map((job, i) => {
                  const Icon = JOB_ICONS[i % JOB_ICONS.length];
                  const color = JOB_COLORS[i % JOB_COLORS.length];
                  return (
                    <div
                      key={job.id}
                      onClick={() => navigate('/jobs')}
                      className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-transparent transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl bg-white dark:bg-white/5 shadow-sm dark:shadow-none flex items-center justify-center ${color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold truncate max-w-[130px] text-slate-900 dark:text-white">{job.title}</h4>
                          <p className="text-[10px] text-slate-500 dark:text-gray-500">
                            {job.company} · {job.location}
                          </p>
                        </div>
                      </div>
                      <button
                        className="px-4 py-1.5 rounded-lg bg-yellow-400 text-black text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-all"
                        onClick={e => { e.stopPropagation(); navigate('/jobs'); }}
                      >
                        Apply
                      </button>
                    </div>
                  );
                })
              )}
            </div>
            <button
              onClick={() => navigate('/jobs')}
              className="w-full mt-6 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              View all {jobs.length > 0 ? 'opportunities' : '→'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
