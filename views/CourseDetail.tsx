import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/backend';
import { supabase } from '../services/supabase';
import {
  Play, Lock, ChevronDown, CheckCircle2, Clock, BarChart2,
  Globe, Star, Users, Loader2, X, ClipboardList,
  SendHorizonal, ArrowLeft,
} from 'lucide-react';
import { Course } from '../types';

// ── Curriculum data (generated from course) ───────────────────────────────────

interface Lesson {
  id: string;
  title: string;
  duration: string;
  free: boolean;
  completed?: boolean;
}
interface Section {
  id: string;
  title: string;
  lessons: Lesson[];
}

function generateCurriculum(course: Course): Section[] {
  const base = course.title.split(':')[0];
  return [
    {
      id: 's1', title: 'Getting Started',
      lessons: [
        { id: 'l1', title: `Introduction to ${base}`,  duration: '8 min',  free: true },
        { id: 'l2', title: 'Setting up your workspace',   duration: '12 min', free: true },
        { id: 'l3', title: 'Your first hands-on project', duration: '18 min', free: false },
      ],
    },
    {
      id: 's2', title: 'Core Concepts',
      lessons: [
        { id: 'l4', title: 'Understanding the fundamentals',  duration: '22 min', free: false },
        { id: 'l5', title: 'Key strategies and frameworks',   duration: '28 min', free: false },
        { id: 'l6', title: 'Common mistakes and how to avoid', duration: '15 min', free: false },
      ],
    },
    {
      id: 's3', title: 'Practical Application',
      lessons: [
        { id: 'l7', title: 'Real-world case studies',     duration: '35 min', free: false },
        { id: 'l8', title: 'Building a live portfolio',   duration: '40 min', free: false },
        { id: 'l9', title: 'Getting your first results',  duration: '20 min', free: false },
      ],
    },
  ];
}

const INCLUDES = [
  'Full lifetime access',
  'Mobile-friendly content',
  'Certificate of completion',
  'Private community access',
  'Live Q&A sessions',
];

// ── Curriculum accordion section ───────────────────────────────────────────────

const CurriculumSection: React.FC<{
  section: Section;
  defaultOpen?: boolean;
  onPreview: (lesson: Lesson) => void;
}> = ({ section, defaultOpen, onPreview }) => {
  const [open, setOpen] = useState(!!defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className="rounded-[12px] overflow-hidden"
      style={{ border: '1px solid var(--color-border)' }}
    >
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors duration-150"
        style={{ backgroundColor: open ? 'var(--color-bg-card)' : 'var(--color-bg-deep)' }}
        aria-expanded={open}
      >
        <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{section.title}</span>
        <ChevronDown
          className="w-4 h-4 shrink-0 transition-transform duration-200"
          style={{
            color: 'var(--color-text-muted)',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>

      {/* Lessons — CSS max-height animation */}
      <div
        style={{
          maxHeight: open ? `${section.lessons.length * 64}px` : '0',
          overflow: 'hidden',
          transition: 'max-height 0.3s ease',
        }}
      >
        {section.lessons.map((lesson) => (
          <div
            key={lesson.id}
            className="flex items-center justify-between px-5 py-3.5 gap-4"
            style={{
              backgroundColor: 'var(--color-bg-deep)',
              borderTop: '1px solid var(--color-border)',
            }}
          >
            <div className="flex items-center gap-3 min-w-0">
              {lesson.completed ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: 'var(--color-accent)' }} />
              ) : lesson.free ? (
                <button
                  onClick={() => onPreview(lesson)}
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors duration-150"
                  style={{ backgroundColor: 'rgba(47,109,242,0.15)' }}
                  aria-label={`Preview ${lesson.title}`}
                >
                  <Play className="w-3 h-3" style={{ color: 'var(--color-accent)' }} />
                </button>
              ) : (
                <div className="w-7 h-7 flex items-center justify-center shrink-0">
                  <Lock className="w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} />
                </div>
              )}
              <span
                className="text-sm truncate"
                style={{ color: lesson.free ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}
              >
                {lesson.title}
              </span>
              {lesson.free && (
                <span
                  className="shrink-0 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: 'rgba(47,109,242,0.15)', color: 'var(--color-accent-hover)' }}
                >
                  Free
                </span>
              )}
            </div>
            <span className="text-xs shrink-0" style={{ color: 'var(--color-text-muted)' }}>
              {lesson.duration}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Preview modal ──────────────────────────────────────────────────────────────

const PreviewModal: React.FC<{ lesson: Lesson | null; onClose: () => void }> = ({ lesson, onClose }) => (
  <AnimatePresence>
    {lesson && (
      <>
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50"
          style={{ backgroundColor: 'var(--color-overlay)' }}
          onClick={onClose}
          aria-hidden="true"
        />
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed inset-0 z-[51] flex items-center justify-center p-6"
          role="dialog"
          aria-modal="true"
          aria-label={`Preview: ${lesson.title}`}
        >
          <div
            className="w-full max-w-2xl rounded-[20px] overflow-hidden"
            style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
          >
            {/* Modal header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid var(--color-border)' }}
            >
              <div>
                <p className="text-xs uppercase tracking-widest mb-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  Free preview
                </p>
                <h3 className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{lesson.title}</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full transition-opacity hover:opacity-70"
                style={{ color: 'var(--color-text-muted)' }}
                aria-label="Close preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Video placeholder — intentionally deep dark, represents media */}
            <div
              className="aspect-video flex flex-col items-center justify-center gap-4"
              style={{ backgroundColor: 'var(--color-bg-deep)' }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(47,109,242,0.2)', border: '1px solid rgba(47,109,242,0.4)' }}
              >
                <Play className="w-6 h-6 translate-x-0.5" style={{ color: 'var(--color-accent)' }} />
              </div>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Video preview · {lesson.duration}
              </p>
            </div>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

// ── Enroll sidebar card ────────────────────────────────────────────────────────

const EnrollCard: React.FC<{
  course: Course;
  enrolled: boolean;
  enrolling: boolean;
  onEnroll: () => void;
  courseId: string;
}> = ({ course, enrolled, enrolling, onEnroll, courseId }) => {
  const priceNGN = Math.round((course.price || 15) * 1600);
  const priceUSD = course.price || 15;

  return (
    <div
      className="rounded-[20px] overflow-hidden"
      style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
    >
      {/* Thumbnail — media placeholder, intentionally dark */}
      <div
        className="aspect-video flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-bg-deep)' }}
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'rgba(47,109,242,0.15)' }}
        >
          <Play className="w-5 h-5 translate-x-0.5" style={{ color: 'var(--color-accent)' }} />
        </div>
      </div>

      <div className="p-5">
        {/* Price */}
        <div className="mb-5">
          <div className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            ₦{priceNGN.toLocaleString()}
          </div>
          <div className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            ~${priceUSD.toLocaleString()}
          </div>
        </div>

        {/* CTA */}
        {enrolled ? (
          <Link
            to={`/learning/${courseId}`}
            className="w-full py-3 rounded-[12px] text-sm font-semibold text-white flex items-center justify-center gap-2 transition-colors duration-150"
            style={{ backgroundColor: '#16a34a' }}
          >
            <CheckCircle2 className="w-4 h-4" />
            Continue Learning
          </Link>
        ) : (
          <button
            onClick={onEnroll}
            disabled={enrolling}
            className="w-full py-3 rounded-[12px] text-sm font-semibold text-white flex items-center justify-center gap-2 transition-colors duration-150 disabled:opacity-70"
            style={{ backgroundColor: 'var(--color-accent)' }}
            onMouseEnter={e => !enrolling && ((e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-accent-hover)')}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-accent)'}
          >
            {enrolling ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enroll now'}
          </button>
        )}

        {/* Includes */}
        <div className="mt-5 pt-5" style={{ borderTop: '1px solid var(--color-border)' }}>
          <p className="text-[11px] uppercase tracking-widest mb-3 font-semibold" style={{ color: 'var(--color-text-muted)' }}>
            What's included
          </p>
          <ul className="flex flex-col gap-2">
            {INCLUDES.map(item => (
              <li key={item} className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--color-accent)' }} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

// ── Main component ─────────────────────────────────────────────────────────────

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const courseId = id || '1';

  const [course,    setCourse]    = useState<Course | null>(null);
  const [enrolled,  setEnrolled]  = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [userId,    setUserId]    = useState<string | null>(null);
  const [preview,   setPreview]   = useState<Lesson | null>(null);

  // Assignment
  const [assignment,      setAssignment]      = useState<any>(null);
  const [submission,      setSubmission]      = useState<any>(null);
  const [submissionText,  setSubmissionText]  = useState('');
  const [submitting,      setSubmitting]      = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
    api.getCourses().then(courses => {
      const found = courses.find(c => c.id === courseId) || courses[0];
      setCourse(found ?? null);
    });
  }, [courseId]);

  useEffect(() => {
    if (!userId || !courseId) return;
    api.isEnrolled(userId, courseId).then(setEnrolled);
    api.getAssignment(courseId).then((a: any) => {
      setAssignment(a);
      if (a) api.getMySubmission(a.id, userId).then(setSubmission);
    });
  }, [userId, courseId]);

  const handleEnroll = async () => {
    if (!userId) { window.location.hash = '#/login'; return; }
    setEnrolling(true);
    await api.enrollCourse(userId, courseId);
    setEnrolled(true);
    setEnrolling(false);
    window.location.hash = `#/learning/${courseId}`;
  };

  const handleSubmitAssignment = async () => {
    if (!userId || !assignment || !submissionText.trim()) return;
    setSubmitting(true);
    await api.submitAssignment(assignment.id, courseId, userId, submissionText);
    const fresh = await api.getMySubmission(assignment.id, userId);
    setSubmission(fresh);
    setSubmitting(false);
  };

  if (!course) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-bg-primary)' }}
      >
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--color-accent)' }} />
      </div>
    );
  }

  const curriculum = generateCurriculum(course);
  const totalLessons = curriculum.reduce((s, sec) => s + sec.lessons.length, 0);
  const priceNGN = Math.round((course.price || 15) * 1600);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-primary)' }}>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <div
        className="px-6 py-10 border-b"
        style={{ backgroundColor: 'var(--color-bg-deep)', borderColor: 'var(--color-border)' }}
      >
        <div className="max-w-[1200px] mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs mb-8" style={{ color: 'var(--color-text-muted)' }}>
            <Link
              to="/courses"
              className="flex items-center gap-1 hover:opacity-80 transition-opacity"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              All courses
            </Link>
            <span>/</span>
            <span style={{ color: 'var(--color-text-primary)' }}>{course.category}</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-start gap-10">
            {/* Left: title + meta */}
            <div className="flex-1">
              {/* Level badge */}
              <span
                className="inline-block text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-md mb-4"
                style={{ backgroundColor: 'rgba(47,109,242,0.15)', color: 'var(--color-accent-hover)' }}
              >
                {course.level}
              </span>

              <h1
                className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight leading-tight mb-4"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {course.title}
              </h1>

              <p className="text-base mb-6 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                {course.description}
              </p>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-5 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                <div className="flex items-center gap-1.5">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5" style={{ color: 'var(--color-accent)', fill: 'var(--color-accent)' }} />
                    ))}
                  </div>
                  <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    {course.rating ?? 4.8}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  <span>{(course.price * 45).toLocaleString()} students</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>{course.duration || '8h total'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BarChart2 className="w-4 h-4" />
                  <span>{course.level}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Globe className="w-4 h-4" />
                  <span>English</span>
                </div>
              </div>

              <p className="text-xs mt-4" style={{ color: 'var(--color-text-muted)' }}>
                Instructor: <span style={{ color: 'var(--color-text-primary)' }}>FINODIV</span>
                {' · '}Last updated August 2025
              </p>
            </div>

            {/* Desktop sidebar — rendered inside hero on lg */}
            <div className="hidden lg:block w-80 shrink-0">
              <EnrollCard
                course={course}
                enrolled={enrolled}
                enrolling={enrolling}
                onEnroll={handleEnroll}
                courseId={courseId}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────────── */}
      <div className="max-w-[1200px] mx-auto px-6 py-10">
        <div className="flex gap-12">
          {/* Main content */}
          <div className="flex-1 min-w-0">

            {/* What you'll learn */}
            <section className="mb-10">
              <h2 className="text-lg font-semibold mb-5" style={{ color: 'var(--color-text-primary)' }}>
                What you'll learn
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  `Core principles of ${course.title.split(':')[0]}`,
                  'Practical strategies you can use immediately',
                  'Avoid the #1 mistakes beginners make',
                  'Build real income or portfolio results',
                  'Work with live data and real-world tools',
                  'Grow from complete beginner to confident practitioner',
                ].map(item => (
                  <div
                    key={item}
                    className="flex items-start gap-3 p-4 rounded-[10px]"
                    style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--color-accent)' }} />
                    <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{item}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Curriculum */}
            <section className="mb-10">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  Course curriculum
                </h2>
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {curriculum.length} sections · {totalLessons} lessons
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {curriculum.map((sec, i) => (
                  <CurriculumSection
                    key={sec.id}
                    section={sec}
                    defaultOpen={i === 0}
                    onPreview={setPreview}
                  />
                ))}
              </div>
            </section>

            {/* Requirements */}
            <section className="mb-10">
              <h2 className="text-lg font-semibold mb-5" style={{ color: 'var(--color-text-primary)' }}>
                Requirements
              </h2>
              <ul className="flex flex-col gap-2">
                {[
                  'A smartphone or computer with internet access',
                  'No prior experience required — we start from scratch',
                  'A willingness to take consistent action',
                ].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--color-accent)' }} />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            {/* Assignment — enrolled users only */}
            {enrolled && assignment && (
              <section
                className="p-5 rounded-[16px] mb-10"
                style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-9 h-9 rounded-[10px] flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(47,109,242,0.12)' }}
                  >
                    <ClipboardList className="w-4.5 h-4.5" style={{ color: 'var(--color-accent)' }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{assignment.title}</h3>
                    {assignment.dueDate && (
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        Due {new Date(assignment.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                  {assignment.description}
                </p>

                {submission ? (
                  <div
                    className="p-4 rounded-[10px]"
                    style={{ backgroundColor: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.2)' }}
                  >
                    <div className="flex items-center gap-2 text-sm font-medium mb-1" style={{ color: '#4ade80' }}>
                      <CheckCircle2 className="w-4 h-4" /> Submitted
                    </div>
                    {submission.grade !== null ? (
                      <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                        Grade: <span style={{ color: 'var(--color-text-primary)' }}>{submission.grade}/100</span>
                        {submission.feedback && <span> · {submission.feedback}</span>}
                      </p>
                    ) : (
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Awaiting instructor review.</p>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <textarea
                      rows={4}
                      value={submissionText}
                      onChange={e => setSubmissionText(e.target.value)}
                      placeholder="Write your response here — paste a link, explain your approach, or answer the questions."
                      className="w-full p-4 rounded-[10px] text-sm outline-none resize-none"
                      style={{
                        backgroundColor: 'var(--color-bg-deep)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-primary)',
                      }}
                      onFocus={e => (e.currentTarget.style.borderColor = 'rgba(47,109,242,0.6)')}
                      onBlur={e  => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                    />
                    <button
                      onClick={handleSubmitAssignment}
                      disabled={submitting || !submissionText.trim()}
                      className="self-start flex items-center gap-2 px-5 py-2.5 rounded-[10px] text-sm font-medium text-white transition-colors duration-150 disabled:opacity-50"
                      style={{ backgroundColor: 'var(--color-accent)' }}
                    >
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <SendHorizonal className="w-4 h-4" />}
                      Submit assignment
                    </button>
                  </div>
                )}
              </section>
            )}
          </div>

          {/* Desktop sticky sidebar — hidden on mobile, shown > lg */}
          <div className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-6">
              <EnrollCard
                course={course}
                enrolled={enrolled}
                enrolling={enrolling}
                onEnroll={handleEnroll}
                courseId={courseId}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile bottom bar ─────────────────────────────────────────────────── */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-4 py-3 flex items-center justify-between gap-4"
        style={{ backgroundColor: 'var(--color-bg-deep)', borderTop: '1px solid var(--color-border)' }}
      >
        <div>
          <div className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            ₦{priceNGN.toLocaleString()}
          </div>
          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>~${course.price}</div>
        </div>
        {enrolled ? (
          <Link
            to={`/learning/${courseId}`}
            className="flex items-center gap-2 px-5 py-2.5 rounded-[12px] text-sm font-semibold text-white"
            style={{ backgroundColor: '#16a34a' }}
          >
            <CheckCircle2 className="w-4 h-4" />
            Continue
          </Link>
        ) : (
          <button
            onClick={handleEnroll}
            disabled={enrolling}
            className="flex items-center gap-2 px-5 py-2.5 rounded-[12px] text-sm font-semibold text-white transition-colors duration-150 disabled:opacity-70"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            {enrolling ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enroll now'}
          </button>
        )}
      </div>

      {/* Preview modal */}
      <PreviewModal lesson={preview} onClose={() => setPreview(null)} />
    </div>
  );
};

export default CourseDetail;
