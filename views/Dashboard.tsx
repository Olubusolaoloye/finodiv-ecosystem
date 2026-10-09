import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserRole } from '../types';
import { api } from '../services/backend';
import { supabase } from '../services/supabase';
import {
  BookOpen, Flame, Trophy, ArrowRight, Loader2, Plus,
  Download, Award, Bell, GraduationCap,
} from 'lucide-react';

// ── Progress ring ──────────────────────────────────────────────────────────────

const ProgressRing: React.FC<{
  pct: number;
  size?: number;
  strokeWidth?: number;
  label: string;
  sub: string;
}> = ({ pct, size = 80, strokeWidth = 6, label, sub }) => {
  const [animated, setAnimated] = useState(0);
  const ref = useRef<SVGCircleElement>(null);
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (animated / 100) * circ;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimated(pct);
    }, 200);
    return () => clearTimeout(timer);
  }, [pct]);

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-label={`${label}: ${pct}% complete`}
        role="img"
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          style={{ stroke: 'var(--color-bg-deep)' }}
          strokeWidth={strokeWidth}
        />
        {/* Fill */}
        <circle
          ref={ref}
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          style={{
            stroke: 'var(--color-accent)',
            transition: 'stroke-dashoffset 1s cubic-bezier(0.34,1.56,0.64,1)',
          }}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text
          x={size / 2}
          y={size / 2 + 5}
          textAnchor="middle"
          fontSize="13"
          fontWeight="600"
          style={{ fill: 'var(--color-text-primary)' }}
          aria-hidden="true"
        >
          {pct}%
        </text>
      </svg>
      <div className="text-center">
        <p className="text-xs font-medium leading-snug line-clamp-2 max-w-[80px]" style={{ color: 'var(--color-text-primary)' }}>
          {label}
        </p>
        <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{sub}</p>
      </div>
    </div>
  );
};

// ── Certificate view ───────────────────────────────────────────────────────────

const CertificateCard: React.FC<{
  name: string;
  course: string;
  date: string;
}> = ({ name, course, date }) => {
  const ref = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    const el = ref.current;
    if (!el) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<html><head><title>Certificate</title>
      <style>
        body { margin:0; background:#040D18; font-family: Inter, sans-serif; }
        .cert { width:800px; padding:60px; color:#f8fafc; }
        .logo-grad { background: linear-gradient(135deg,#7C3AED,#3B82F6); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
      </style></head><body>
      <div class="cert">${el.innerHTML}</div></body></html>`);
    win.document.close();
    win.print();
  };

  return (
    <div
      ref={ref}
      className="relative rounded-[20px] overflow-hidden p-8 sm:p-12"
      style={{ backgroundColor: 'var(--color-bg-deep)', border: '1px solid rgba(47,109,242,0.3)' }}
    >
      {/* Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(47,109,242,0.08) 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="relative z-10">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <svg width="28" height="28" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
              <linearGradient id="cg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7C3AED" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="28" fill="url(#cg)" />
            <ellipse cx="54" cy="36" rx="22" ry="9" fill="white" transform="rotate(-35 54 36)" />
            <ellipse cx="47" cy="53" rx="17" ry="7" fill="white" transform="rotate(-35 47 53)" />
            <ellipse cx="40" cy="68" rx="11" ry="4.5" fill="white" transform="rotate(-35 40 68)" />
          </svg>
          <span className="text-sm tracking-widest font-medium" style={{ color: 'var(--color-text-muted)' }}>FINODIV</span>
        </div>

        <p className="text-xs uppercase tracking-[0.2em] mb-6" style={{ color: 'var(--color-text-muted)' }}>
          Certificate of completion
        </p>

        <p className="text-4xl sm:text-5xl font-light tracking-tight mb-3" style={{ color: 'var(--color-text-primary)', fontWeight: 300 }}>
          {name}
        </p>

        <p className="text-sm mb-8" style={{ color: 'var(--color-text-muted)' }}>
          has successfully completed
        </p>

        <p
          className="text-2xl sm:text-3xl font-semibold mb-8"
          style={{
            background: 'linear-gradient(135deg,#7C3AED,#3B82F6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {course}
        </p>

        <div
          className="flex items-center justify-between pt-8"
          style={{ borderTop: '1px solid rgba(47,109,242,0.2)' }}
        >
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Date issued</p>
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{date}</p>
          </div>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 rounded-[10px] text-sm font-medium transition-opacity hover:opacity-80"
            style={{ backgroundColor: 'rgba(47,109,242,0.15)', color: 'var(--color-accent-hover)', border: '1px solid rgba(47,109,242,0.3)' }}
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main dashboard ─────────────────────────────────────────────────────────────

interface Enrollment {
  courseId: string;
  progress: number;
  course: any;
}

const Dashboard: React.FC<{ role: UserRole }> = () => {
  const [profile, setProfile]       = useState<{ name: string; xp: number; level: number } | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading]       = useState(true);
  const [tab, setTab]               = useState<'overview' | 'courses' | 'certificates'>('overview');

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const [{ data: prof }, enrolData] = await Promise.all([
        supabase.from('profiles').select('name, xp, level').eq('id', user.id).maybeSingle(),
        api.getEnrollments(user.id),
      ]);

      if (prof) {
        setProfile({ name: prof.name || user.email?.split('@')[0] || 'Learner', xp: prof.xp || 0, level: prof.level || 1 });
      } else if (user.email) {
        setProfile({ name: user.email.split('@')[0], xp: 0, level: 1 });
      }
      setEnrollments(enrolData);
      setLoading(false);
    };
    load();
  }, []);

  const displayName  = profile?.name || 'Learner';
  const activeCount  = enrollments.length;
  const avgProgress  = activeCount > 0
    ? Math.round(enrollments.reduce((s, e) => s + e.progress, 0) / activeCount)
    : 0;
  void avgProgress;
  const completedCount = enrollments.filter(e => e.progress >= 100).length;

  const TABS = [
    { id: 'overview',      label: 'Overview'     },
    { id: 'courses',       label: 'My Courses'   },
    { id: 'certificates',  label: 'Certificates' },
  ] as const;

  return (
    <div className="min-h-screen pb-20">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div
        className="px-6 py-6 border-b flex items-center justify-between gap-4"
        style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
      >
        <div>
          <p className="text-xs mb-0.5" style={{ color: 'var(--color-text-muted)' }}>{today}</p>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            Good morning,{' '}
            <span
              style={{
                background: 'linear-gradient(135deg,#7C3AED,#3B82F6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {displayName}
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            style={{
              width: 38, height: 38, borderRadius: 10,
              backgroundColor: 'var(--color-bg-deep)',
              border: '1px solid var(--color-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
          </button>
        </div>
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────────────── */}
      <div
        className="sticky top-0 z-10 px-6"
        style={{ backgroundColor: 'var(--color-bg-primary)', borderBottom: '1px solid var(--color-border)' }}
      >
        <div className="max-w-[1100px] mx-auto flex items-center gap-6 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="py-3.5 text-sm font-medium whitespace-nowrap transition-colors duration-150 border-b-2 -mb-px"
              style={{
                color: tab === t.id ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                borderColor: tab === t.id ? 'var(--color-accent)' : 'transparent',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div className="max-w-[1100px] mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--color-accent)' }} />
          </div>
        ) : (
          <>
            {/* ── Overview tab ──────────────────────────────────────────────── */}
            {tab === 'overview' && (
              <div className="flex flex-col gap-8">
                {/* Stat row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { icon: GraduationCap, label: 'Total Courses',    value: 48,            accent: '#7C3AED', bg: 'rgba(124,58,237,0.1)' },
                    { icon: BookOpen,      label: 'Enrolled',          value: activeCount,   accent: '#2F6DF2', bg: 'rgba(47,109,242,0.1)' },
                    { icon: Trophy,        label: 'Completed',         value: completedCount, accent: '#16a34a', bg: 'rgba(22,163,74,0.1)' },
                    { icon: Flame,         label: 'Learning streak',   value: `${Math.min(activeCount * 3 + 1, 14)}d`, accent: '#EA580C', bg: 'rgba(234,88,12,0.1)' },
                  ].map(({ icon: Icon, label, value, accent, bg }) => (
                    <div
                      key={label}
                      className="flex items-center gap-4 p-5 rounded-[16px]"
                      style={{
                        backgroundColor: 'var(--color-bg-card)',
                        border: '1px solid var(--color-border)',
                        borderLeft: `4px solid ${accent}`,
                      }}
                    >
                      <div
                        className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0"
                        style={{ backgroundColor: bg }}
                      >
                        <Icon className="w-5 h-5" style={{ color: accent }} strokeWidth={1.75} />
                      </div>
                      <div>
                        <div className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{value}</div>
                        <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Progress rings */}
                {enrollments.length > 0 && (
                  <div
                    className="p-6 rounded-[16px]"
                    style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
                  >
                    <h2 className="text-sm font-semibold mb-6" style={{ color: 'var(--color-text-primary)' }}>
                      Active course progress
                    </h2>
                    <div className="flex flex-wrap gap-8">
                      {enrollments.slice(0, 4).map(e => (
                        <ProgressRing
                          key={e.courseId}
                          pct={e.progress}
                          label={e.course?.title || `Course ${e.courseId}`}
                          sub={e.course?.category || 'General'}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent activity */}
                <div>
                  <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                    Continue learning
                  </h2>
                  {enrollments.length === 0 ? (
                    <div
                      className="rounded-[16px] p-10 flex flex-col items-center text-center"
                      style={{ border: '1px dashed var(--color-border)' }}
                    >
                      <div
                        className="w-12 h-12 rounded-[14px] flex items-center justify-center mb-4"
                        style={{ backgroundColor: 'rgba(47,109,242,0.1)' }}
                      >
                        <BookOpen className="w-6 h-6" style={{ color: 'var(--color-accent)' }} />
                      </div>
                      <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                        No active courses
                      </p>
                      <p className="text-xs mb-5" style={{ color: 'var(--color-text-muted)' }}>
                        Enroll in a course to start tracking your progress.
                      </p>
                      <Link
                        to="/courses"
                        className="flex items-center gap-2 px-4 py-2 rounded-[10px] text-sm font-medium text-white"
                        style={{ backgroundColor: 'var(--color-accent)' }}
                      >
                        <Plus className="w-4 h-4" />
                        Browse courses
                      </Link>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {enrollments.slice(0, 3).map(e => (
                        <div
                          key={e.courseId}
                          className="flex items-center gap-4 p-4 rounded-[14px]"
                          style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
                        >
                          <div
                            className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0"
                            style={{ backgroundColor: 'var(--color-bg-deep)' }}
                          >
                            <BookOpen className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                              {e.course?.title || `Course ${e.courseId}`}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <div className="flex-1 h-1 rounded-full" style={{ backgroundColor: 'var(--color-bg-deep)' }}>
                                <div
                                  className="h-1 rounded-full"
                                  style={{
                                    width: `${e.progress}%`,
                                    backgroundColor: 'var(--color-accent)',
                                    transition: 'width 1s ease',
                                  }}
                                />
                              </div>
                              <span className="text-[10px] shrink-0" style={{ color: 'var(--color-text-muted)' }}>
                                {e.progress}%
                              </span>
                            </div>
                          </div>
                          <Link
                            to={`/learning/${e.courseId}`}
                            className="shrink-0 flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-75"
                            style={{ color: 'var(--color-accent-hover)' }}
                          >
                            Resume
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── My Courses tab ─────────────────────────────────────────────── */}
            {tab === 'courses' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    My courses
                    {activeCount > 0 && (
                      <span className="ml-2 text-sm font-normal" style={{ color: 'var(--color-text-muted)' }}>
                        ({activeCount})
                      </span>
                    )}
                  </h2>
                  <Link
                    to="/courses"
                    className="text-sm font-medium transition-opacity hover:opacity-75"
                    style={{ color: 'var(--color-accent-hover)' }}
                  >
                    Browse more
                  </Link>
                </div>

                {enrollments.length === 0 ? (
                  <div
                    className="rounded-[16px] p-12 flex flex-col items-center text-center"
                    style={{ border: '1px dashed var(--color-border)' }}
                  >
                    <BookOpen className="w-10 h-10 mb-4" style={{ color: 'var(--color-text-muted)' }} />
                    <p className="text-sm font-medium mb-4" style={{ color: 'var(--color-text-primary)' }}>
                      You haven't enrolled in any courses yet
                    </p>
                    <Link
                      to="/courses"
                      className="flex items-center gap-2 px-4 py-2 rounded-[10px] text-sm font-medium text-white"
                      style={{ backgroundColor: 'var(--color-accent)' }}
                    >
                      <Plus className="w-4 h-4" />
                      Browse courses
                    </Link>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {enrollments.map(e => (
                      <motion.div
                        key={e.courseId}
                        whileHover={{ y: -2 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col p-5 rounded-[16px] gap-4"
                        style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
                      >
                        <div>
                          <span
                            className="text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-md"
                            style={{ backgroundColor: 'rgba(47,109,242,0.12)', color: 'var(--color-accent-hover)' }}
                          >
                            {e.course?.category || 'Course'}
                          </span>
                          <h3 className="text-sm font-medium mt-2 leading-snug" style={{ color: 'var(--color-text-primary)' }}>
                            {e.course?.title || `Course ${e.courseId}`}
                          </h3>
                        </div>

                        {/* Progress bar */}
                        <div>
                          <div className="flex justify-between text-xs mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
                            <span>Progress</span>
                            <span style={{ color: e.progress >= 100 ? '#4ade80' : 'var(--color-text-primary)' }}>
                              {e.progress}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full rounded-full" style={{ backgroundColor: 'var(--color-bg-deep)' }}>
                            <div
                              className="h-1.5 rounded-full transition-all duration-1000"
                              style={{
                                width: `${e.progress}%`,
                                backgroundColor: e.progress >= 100 ? '#16a34a' : 'var(--color-accent)',
                              }}
                            />
                          </div>
                        </div>

                        {/* Last accessed */}
                        <div className="flex items-center justify-between">
                          <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                            Last accessed recently
                          </span>
                          <Link
                            to={`/learning/${e.courseId}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-medium text-white"
                            style={{ backgroundColor: 'var(--color-accent)' }}
                          >
                            {e.progress >= 100 ? 'Review' : 'Resume'}
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Certificates tab ───────────────────────────────────────────── */}
            {tab === 'certificates' && (
              <div>
                <h2 className="text-lg font-semibold mb-6" style={{ color: 'var(--color-text-primary)' }}>
                  Certificates
                </h2>

                {completedCount === 0 ? (
                  <div
                    className="rounded-[16px] p-12 flex flex-col items-center text-center"
                    style={{ border: '1px dashed var(--color-border)' }}
                  >
                    <Award className="w-10 h-10 mb-4" style={{ color: 'var(--color-text-muted)' }} />
                    <p className="text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                      No certificates yet
                    </p>
                    <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
                      Complete a course to earn your first certificate.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    {enrollments
                      .filter(e => e.progress >= 100)
                      .map(e => (
                        <CertificateCard
                          key={e.courseId}
                          name={displayName}
                          course={e.course?.title || `Course ${e.courseId}`}
                          date={new Date().toLocaleDateString('en-GB', {
                            day: 'numeric', month: 'long', year: 'numeric',
                          })}
                        />
                      ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
