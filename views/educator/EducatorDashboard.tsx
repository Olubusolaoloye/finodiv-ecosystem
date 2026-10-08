
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import {
  BookOpen, Users, Star, TrendingUp, Plus, ClipboardList,
  ArrowRight, Loader2, Upload, Eye,
} from 'lucide-react';

interface Stats {
  totalCourses: number;
  totalStudents: number;
  pendingSubmissions: number;
  avgRating: number;
}

interface CourseRow {
  id: string;
  title: string;
  enrolled_count: number;
  rating: number;
  is_published: boolean;
  category: string;
}

const EducatorDashboard: React.FC = () => {
  const [userId, setUserId]     = useState<string | null>(null);
  const [stats, setStats]       = useState<Stats>({ totalCourses: 0, totalStudents: 0, pendingSubmissions: 0, avgRating: 0 });
  const [courses, setCourses]   = useState<CourseRow[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      setUserId(user.id);

      const [{ data: courseData }, { data: subData }] = await Promise.all([
        supabase.from('courses').select('id,title,enrolled_count,rating,is_published,category').eq('instructor_id', user.id).order('created_at', { ascending: false }),
        supabase.from('submissions').select('id, course_id, courses!inner(instructor_id)').eq('courses.instructor_id', user.id).eq('status', 'SUBMITTED'),
      ]);

      const rows: CourseRow[] = courseData ?? [];
      setCourses(rows);

      const totalStudents = rows.reduce((s, c) => s + (c.enrolled_count || 0), 0);
      const avgRating = rows.length ? rows.reduce((s, c) => s + (c.rating || 0), 0) / rows.length : 0;

      setStats({
        totalCourses: rows.length,
        totalStudents,
        pendingSubmissions: subData?.length ?? 0,
        avgRating: Math.round(avgRating * 10) / 10,
      });
      setLoading(false);
    });
  }, []);

  const tiles = [
    { label: 'My Courses',           value: stats.totalCourses,          icon: BookOpen,      color: 'blue' },
    { label: 'Total Students',       value: stats.totalStudents,         icon: Users,         color: 'emerald' },
    { label: 'Pending Submissions',  value: stats.pendingSubmissions,    icon: ClipboardList, color: 'amber' },
    { label: 'Avg. Course Rating',   value: stats.avgRating || '—',      icon: Star,          color: 'purple' },
  ];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-500 mb-2 block">Educator Portal</span>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Your <span className="text-blue-500">Teaching Hub</span>
          </h1>
          <p className="text-slate-500 dark:text-gray-500 mt-2">Manage courses, track students, and grade submissions.</p>
        </div>
        <Link
          to="/educator/upload"
          className="flex items-center gap-3 px-8 py-4 rounded-[20px] bg-blue-600 hover:bg-blue-500 transition-all font-black text-white shadow-xl shadow-blue-500/20 whitespace-nowrap"
        >
          <Upload className="w-5 h-5" /> Upload New Course
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
        {tiles.map(tile => (
          <div key={tile.label} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-[28px] p-6 flex items-center gap-4 shadow-sm dark:shadow-none">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              tile.color === 'blue'    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
              tile.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
              tile.color === 'amber'   ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
              'bg-purple-500/10 text-purple-600 dark:text-purple-400'
            }`}>
              <tile.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{loading ? '…' : tile.value}</p>
              <p className="text-xs text-slate-500 dark:text-gray-500 font-bold">{tile.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Courses table */}
      <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-[32px] overflow-hidden shadow-sm dark:shadow-none">
        <div className="flex items-center justify-between p-8 border-b border-slate-100 dark:border-white/5">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">My Courses</h2>
          <Link to="/educator/upload" className="flex items-center gap-2 text-xs font-black text-blue-500 hover:text-blue-600 uppercase tracking-widest">
            <Plus className="w-4 h-4" /> Add Course
          </Link>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : courses.length === 0 ? (
          <div className="py-20 flex flex-col items-center text-center px-8">
            <div className="w-16 h-16 rounded-3xl bg-blue-500/10 flex items-center justify-center mb-4 text-blue-500">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black mb-2 text-slate-900 dark:text-white">No courses yet</h3>
            <p className="text-slate-500 dark:text-gray-500 text-sm mb-6">Upload your first course and start teaching.</p>
            <Link to="/educator/upload" className="px-6 py-3 rounded-2xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-500 transition-all">
              Upload Course
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {courses.map(course => (
              <div key={course.id} className="flex items-center gap-6 p-6 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 dark:text-white truncate">{course.title}</p>
                  <p className="text-xs text-slate-500 dark:text-gray-500">{course.category}</p>
                </div>
                <div className="hidden md:flex items-center gap-6 text-sm text-slate-500 dark:text-gray-500">
                  <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {course.enrolled_count || 0}</span>
                  <span className="flex items-center gap-1.5"><Star className="w-4 h-4" /> {course.rating || '—'}</span>
                  <span className="flex items-center gap-1.5"><TrendingUp className="w-4 h-4" />
                    <span className={course.is_published ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-amber-600 dark:text-amber-400 font-bold'}>
                      {course.is_published ? 'Live' : 'Draft'}
                    </span>
                  </span>
                </div>
                <Link to={`/educator/submissions/${course.id}`} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-blue-600 hover:text-white text-xs font-bold text-slate-600 dark:text-gray-400 transition-all group whitespace-nowrap">
                  <Eye className="w-3.5 h-3.5" /> Submissions
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EducatorDashboard;
