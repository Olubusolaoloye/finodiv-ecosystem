import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSession } from '../../services/session';
import { api as backendApi } from '../../services/backend';
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
  const [stats, setStats] = useState<Stats>({ totalCourses: 0, totalStudents: 0, pendingSubmissions: 0, avgRating: 0 });
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSession();
    if (!session) { setLoading(false); return; }

    (async () => {
      const allCourses = await backendApi.getCourses();
      const myCourses = allCourses.filter((c: any) => c.instructorId === session.userId || c.instructor_id === session.userId);

      const rows: CourseRow[] = myCourses.map((c: any) => ({
        id: c.id,
        title: c.title,
        enrolled_count: c.enrolledCount ?? c.enrolled_count ?? 0,
        rating: c.rating ?? null,
        is_published: c.isPublished ?? c.is_published ?? false,
        category: c.category,
      }));
      setCourses(rows);

      const totalStudents = rows.reduce((s, c) => s + (c.enrolled_count || 0), 0);
      const avgRating = rows.length ? rows.reduce((s, c) => s + (c.rating || 0), 0) / rows.length : 0;

      setStats({
        totalCourses: rows.length,
        totalStudents,
        pendingSubmissions: 0,
        avgRating: Math.round(avgRating * 10) / 10,
      });
      setLoading(false);
    })();
  }, []);

  const TILES = [
    { label: 'My Courses',           value: stats.totalCourses,       icon: BookOpen,      color: 'var(--color-accent)', bg: 'rgba(139,92,246,0.1)' },
    { label: 'Total Students',       value: stats.totalStudents,      icon: Users,         color: '#34d399', bg: 'rgba(52,211,153,0.1)' },
    { label: 'Pending Submissions',  value: stats.pendingSubmissions, icon: ClipboardList, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    { label: 'Avg. Course Rating',   value: stats.avgRating || '—',   icon: Star,          color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
  ];

  return (
    <div style={{ padding: '40px', maxWidth: 1200, margin: '0 auto', paddingBottom: 128 }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, marginBottom: 48 }}>
        <div>
          <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.25em', color: 'var(--color-accent)', display: 'block', marginBottom: 8 }}>
            Educator Portal
          </span>
          <h1 style={{ fontSize: 'clamp(1.6rem,3vw,2.25rem)', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--color-text-primary)', marginBottom: 8 }}>
            Your <span style={{ color: 'var(--color-accent)' }}>Teaching Hub</span>
          </h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>Manage courses, track students, and grade submissions.</p>
        </div>
        <Link
          to="/educator/upload"
          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 24px', borderRadius: 16, background: 'var(--color-accent)', color: '#fff', fontWeight: 800, fontSize: 14, textDecoration: 'none', boxShadow: '0 8px 24px rgba(139,92,246,0.25)', whiteSpace: 'nowrap' }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--color-accent-hover)')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'var(--color-accent)')}
        >
          <Upload style={{ width: 18, height: 18 }} /> Upload New Course
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 48 }}>
        {TILES.map(tile => (
          <div key={tile.label} style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 22, padding: '22px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: tile.bg, color: tile.color }}>
              <tile.icon style={{ width: 20, height: 20 }} />
            </div>
            <div>
              <p style={{ fontSize: 22, fontWeight: 900, color: 'var(--color-text-primary)' }}>{loading ? '…' : tile.value}</p>
              <p style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600 }}>{tile.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Courses table */}
      <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 24, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 28px', borderBottom: '1px solid var(--color-border)' }}>
          <h2 style={{ fontSize: 17, fontWeight: 900, color: 'var(--color-text-primary)' }}>My Courses</h2>
          <Link to="/educator/upload" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800, color: 'var(--color-accent)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            <Plus style={{ width: 14, height: 14 }} /> Add Course
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: '80px 0', display: 'flex', justifyContent: 'center' }}>
            <Loader2 style={{ width: 28, height: 28, color: 'var(--color-accent)', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : courses.length === 0 ? (
          <div style={{ padding: '80px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ width: 60, height: 60, borderRadius: 20, background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, color: 'var(--color-accent)' }}>
              <BookOpen style={{ width: 28, height: 28 }} />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8, color: 'var(--color-text-primary)' }}>No courses yet</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginBottom: 24 }}>Upload your first course and start teaching.</p>
            <Link to="/educator/upload" style={{ padding: '10px 22px', borderRadius: 12, background: 'var(--color-accent)', color: '#fff', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
              Upload Course
            </Link>
          </div>
        ) : (
          <div>
            {courses.map((course, idx) => (
              <div
                key={course.id}
                style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '18px 28px', borderBottom: idx < courses.length - 1 ? '1px solid var(--color-border)' : 'none', transition: 'background 0.15s' }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
              >
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)', flexShrink: 0 }}>
                  <BookOpen style={{ width: 18, height: 18 }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 14 }}>{course.title}</p>
                  <p style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{course.category}</p>
                </div>
                <div style={{ display: 'none', alignItems: 'center', gap: 24, fontSize: 13, color: 'var(--color-text-muted)' }} className="md:flex">
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Users style={{ width: 14, height: 14 }} /> {course.enrolled_count || 0}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Star style={{ width: 14, height: 14 }} /> {course.rating || '—'}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <TrendingUp style={{ width: 14, height: 14 }} />
                    <span style={{ fontWeight: 700, color: course.is_published ? '#34d399' : '#f59e0b' }}>
                      {course.is_published ? 'Live' : 'Draft'}
                    </span>
                  </span>
                </div>
                <Link
                  to={`/educator/submissions/${course.id}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10, background: 'var(--color-bg-deep)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', fontSize: 11, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap', transition: 'all 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-accent)'; (e.currentTarget as HTMLElement).style.color = '#fff'; (e.currentTarget as HTMLElement).style.borderColor = 'transparent'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-deep)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; }}
                >
                  <Eye style={{ width: 13, height: 13 }} /> Submissions
                  <ArrowRight style={{ width: 11, height: 11 }} />
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
