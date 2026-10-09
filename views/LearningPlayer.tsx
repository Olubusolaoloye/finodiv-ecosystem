import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/backend';
import { getSession } from '../services/session';
import { Course } from '../types';
import {
  Play, CheckCircle2, ChevronDown, Settings, HelpCircle, BookOpen,
  CheckCircle, ShieldAlert, Lock, EyeOff, Loader2,
} from 'lucide-react';

const MODULES = [
  {
    id: 'm1', title: 'Module 1: Blockchain Basics', lessons: [
      { id: 'l1', title: 'Lesson 1: Introduction' },
      { id: 'l2', title: 'Lesson 2: What is a Block?' },
      { id: 'l3', title: 'Lesson 3: Decentralization' },
    ],
  },
  {
    id: 'm2', title: 'Module 2: Smart Contracts', lessons: [
      { id: 'l4', title: 'Lesson 4: Solidity Syntax' },
      { id: 'l5', title: 'Lesson 5: Deployment' },
    ],
  },
];
const ALL_LESSONS = MODULES.flatMap(m => m.lessons);
const TOTAL_LESSONS = ALL_LESSONS.length;

const LearningPlayer: React.FC = () => {
  const { id: courseId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [userId, setUserId] = useState<string | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [activeLessonId, setActiveLessonId] = useState('l1');
  const [activeTab, setActiveTab] = useState('Description');
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(false);
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      if (!courseId) { navigate('/courses'); return; }
      const session = getSession();
      if (!session) { navigate(`/courses/${courseId}`); return; }
      setUserId(session.userId);
      const enrolled = await api.isEnrolled(session.userId, courseId);
      if (!enrolled) { navigate(`/courses/${courseId}`); return; }
      const [courses, enrollments] = await Promise.all([
        api.getCourses(),
        api.getEnrollments(session.userId),
      ]);
      const enrollmentData = enrollments.find((e: any) => e.courseId === courseId || e.course_id === courseId);
      const progressData = (enrollmentData as any)?.completedLessonIds ?? [];
      setCourse(courses.find(c => c.id === courseId) ?? null);
      if (progressData.length) {
        const done = new Set(progressData.map((r: any) => (typeof r === 'string' ? r : r.lesson_id) as string));
        setCompletedLessons(done);
        const first = ALL_LESSONS.find(l => !done.has(l.id));
        if (first) setActiveLessonId(first.id);
        else setActiveLessonId(ALL_LESSONS[ALL_LESSONS.length - 1].id);
      }
      setLoading(false);
    };
    init();
  }, [courseId]);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'p' || e.key === 's'))
        console.warn('Screen capture attempt detected');
    };
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') setIsPlaying(false);
    };
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  const handleMarkComplete = async () => {
    if (!userId || !courseId || completedLessons.has(activeLessonId) || markingComplete) return;
    setMarkingComplete(true);
    await api.markLessonComplete(userId, courseId, activeLessonId, TOTAL_LESSONS);
    setCompletedLessons(prev => new Set([...prev, activeLessonId]));
    setMarkingComplete(false);
    const idx = ALL_LESSONS.findIndex(l => l.id === activeLessonId);
    if (idx < ALL_LESSONS.length - 1) setActiveLessonId(ALL_LESSONS[idx + 1].id);
  };

  const activeLesson = ALL_LESSONS.find(l => l.id === activeLessonId);
  const isCurrentComplete = completedLessons.has(activeLessonId);
  const progressPct = Math.round((completedLessons.size / TOTAL_LESSONS) * 100);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Loader2 style={{ width: 32, height: 32, color: 'var(--color-accent)', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', userSelect: 'none' }}
      className="lg:flex-row"
    >
      {/* Sidebar */}
      <aside style={{
        width: '100%', background: 'var(--color-bg-primary)',
        borderRight: '1px solid var(--color-border)',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
      }} className="lg:w-80 lg:h-full order-2 lg:order-1">
        <div style={{ padding: '24px', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.25em', color: 'var(--color-text-muted)' }}>
              Course Progress
            </span>
            <span style={{ fontSize: 11, fontWeight: 900, color: 'var(--color-accent)' }}>{progressPct}%</span>
          </div>
          <div style={{ height: 6, width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden', marginBottom: 24 }}>
            <div style={{ height: '100%', background: 'var(--color-accent)', borderRadius: 99, width: `${progressPct}%`, transition: 'width 0.5s ease' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {MODULES.map((mod) => (
              <div key={mod.id}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 16, color: 'var(--color-text-primary)' }}>{mod.title}</span>
                  <ChevronDown style={{ width: 16, height: 16, color: 'var(--color-text-muted)', flexShrink: 0 }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {mod.lessons.map((lesson) => {
                    const isActive = activeLessonId === lesson.id;
                    const isDone = completedLessons.has(lesson.id);
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => setActiveLessonId(lesson.id)}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                          padding: '10px 12px', borderRadius: 12, textAlign: 'left',
                          background: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
                          border: `1px solid ${isActive ? 'rgba(139,92,246,0.3)' : 'transparent'}`,
                          cursor: 'pointer', transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; }}
                        onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                      >
                        {isDone ? (
                          <CheckCircle2 style={{ width: 16, height: 16, color: '#34d399', flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${isActive ? 'var(--color-accent)' : 'var(--color-border)'}`, flexShrink: 0 }} />
                        )}
                        <span style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-muted)', fontWeight: isActive ? 700 : 400 }}>
                          {lesson.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 'auto', padding: '20px 24px', borderTop: '1px solid var(--color-border)', background: 'rgba(255,255,255,0.01)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img
              src={`https://i.pravatar.cc/100?u=${courseId}_instructor`}
              alt="Instructor"
              style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'cover' }}
            />
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>{course?.instructor || 'Instructor'}</p>
              <p style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Course Instructor</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', order: 1 }} className="lg:order-2 custom-scrollbar">
        <div style={{ padding: '32px' }}>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 32 }}>
            <Link to="/courses" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-primary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}
            >Courses</Link>
            <span>/</span>
            <Link to={`/courses/${courseId}`} style={{ color: 'var(--color-text-muted)', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-primary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}
            >{course?.title || 'Course'}</Link>
            <span>/</span>
            <span style={{ color: 'var(--color-text-primary)' }}>{activeLesson?.title}</span>
          </nav>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }} className="xl:flex-row">
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
                <h1 style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2, color: 'var(--color-text-primary)' }}>
                  {activeLesson?.title}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 99, background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', color: '#34d399', fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                  <Lock style={{ width: 12, height: 12 }} /> SECURE STREAM
                </div>
              </div>

              {/* Video Player */}
              <div ref={videoRef} style={{ position: 'relative', aspectRatio: '16/9', background: 'var(--color-bg-deep)', borderRadius: 24, overflow: 'hidden', border: '1px solid var(--color-border)', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}
                className="group"
              >
                {/* Watermark */}
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 80, opacity: 0.08, transform: 'rotate(-25deg)', userSelect: 'none', color: 'var(--color-text-primary)', fontWeight: 900, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.4em' }}>
                    {[...Array(16)].map((_, i) => <span key={i}>FINODIV_SECURED</span>)}
                  </div>
                </div>
                <img
                  src={`https://picsum.photos/seed/${activeLessonId}/1200/675`}
                  alt="Video cover"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.7s, filter 0.7s', opacity: isPlaying ? 0.2 : 0.5, filter: isPlaying ? 'blur(4px)' : 'none' }}
                />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 40 }}>
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--color-accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', boxShadow: '0 8px 32px rgba(139,92,246,0.4)', transition: 'transform 0.15s' }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.transform = 'scale(1.1)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.transform = 'scale(1)')}
                  >
                    {isPlaying ? <EyeOff style={{ width: 28, height: 28 }} /> : <Play style={{ width: 28, height: 28, fill: 'currentColor', marginLeft: 4 }} />}
                  </button>
                </div>
                {/* Controls bar (on hover) */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', padding: '32px', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', opacity: 0, transition: 'opacity 0.2s', zIndex: 50 }}
                  className="group-hover:opacity-100"
                >
                  <div style={{ height: 6, width: '100%', background: 'rgba(255,255,255,0.2)', borderRadius: 99, marginBottom: 24, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: 'var(--color-accent)', width: '40%', borderRadius: 99 }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.6)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <span>04:15 / 11:38</span>
                      <span style={{ padding: '2px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)' }}>1080P HD</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <Settings style={{ width: 14, height: 14, cursor: 'pointer' }} />
                      <HelpCircle style={{ width: 14, height: 14, cursor: 'pointer' }} />
                    </div>
                  </div>
                </div>
                {!isPlaying && (
                  <div style={{ position: 'absolute', top: 24, left: 24, display: 'flex', alignItems: 'center', gap: 10, color: '#f87171', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', padding: '8px 16px', borderRadius: 16, backdropFilter: 'blur(8px)' }}>
                    <ShieldAlert style={{ width: 14, height: 14 }} />
                    <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Recording & Downloads Prohibited</span>
                  </div>
                )}
              </div>

              {/* Mark Complete */}
              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleMarkComplete}
                  disabled={isCurrentComplete || markingComplete}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px', borderRadius: 16, fontWeight: 700, fontSize: 13,
                    background: isCurrentComplete ? 'rgba(52,211,153,0.08)' : 'var(--color-accent)',
                    color: isCurrentComplete ? '#34d399' : '#fff',
                    border: isCurrentComplete ? '1px solid rgba(52,211,153,0.2)' : 'none',
                    cursor: isCurrentComplete ? 'default' : 'pointer',
                    boxShadow: isCurrentComplete ? 'none' : '0 8px 24px rgba(139,92,246,0.2)',
                  }}
                >
                  {markingComplete
                    ? <Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} />
                    : <CheckCircle style={{ width: 16, height: 16 }} />
                  }
                  {isCurrentComplete ? 'Lesson Complete' : 'Mark as Complete'}
                </button>
              </div>

              {/* Tabs */}
              <div style={{ marginTop: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 40, borderBottom: '1px solid var(--color-border)', marginBottom: 32 }}>
                  {['Description', 'Materials', 'Code Snippets'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      style={{
                        paddingBottom: 16, fontSize: 13, fontWeight: 700, position: 'relative',
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: activeTab === tab ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                        transition: 'color 0.15s',
                      }}
                    >
                      {tab}
                      {activeTab === tab && (
                        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 2, background: 'var(--color-accent)', borderRadius: 99 }} />
                      )}
                    </button>
                  ))}
                </div>
                <div style={{ color: 'var(--color-text-muted)', lineHeight: 1.7, maxWidth: 640 }}>
                  {activeTab === 'Description' && (
                    <p style={{ fontSize: 14 }}>
                      In this lesson, we explore the core concepts of Web3 and blockchain technology. You'll learn how
                      decentralized systems work, the role of cryptographic primitives, and how smart contracts enable
                      trustless computation on the blockchain.
                    </p>
                  )}
                  {activeTab === 'Materials' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)', opacity: 0.5, cursor: 'not-allowed' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <BookOpen style={{ width: 18, height: 18, color: 'var(--color-accent)' }} />
                          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>Lecture Slides.pdf</span>
                        </div>
                        <Lock style={{ width: 14, height: 14 }} />
                      </div>
                      <p style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--color-text-muted)', textAlign: 'center', opacity: 0.5 }}>
                        Downloads disabled during beta
                      </p>
                    </div>
                  )}
                  {activeTab === 'Code Snippets' && (
                    <div style={{ padding: 24, background: 'var(--color-bg-deep)', borderRadius: 20, border: '1px solid var(--color-border)', fontFamily: 'Space Mono, monospace', fontSize: 13, overflowX: 'auto', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: 14, right: 14, fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.12)', userSelect: 'none' }}>READ ONLY</div>
                      <pre style={{ color: 'var(--color-accent)', margin: 0 }}>{`struct Block {\n    uint256 index;\n    uint256 timestamp;\n    bytes32 previousHash;\n    bytes32 hash;\n    string data;\n    uint256 nonce;\n}`}</pre>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quiz panel */}
            <div className="xl:w-96 w-full">
              <div style={{ background: 'var(--color-bg-card)', borderRadius: 32, padding: 32, border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text-primary)' }}>Test Your Knowledge</h3>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)' }}>
                    <HelpCircle style={{ width: 18, height: 18 }} />
                  </div>
                </div>
                <p style={{ fontSize: 9, color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.15em', marginBottom: 24 }}>Question 1 of 3</p>
                <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 32, lineHeight: 1.5, color: 'var(--color-text-primary)' }}>
                  What is the primary purpose of the 'nonce' in a block header?
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 40 }}>
                  {[
                    "To store the timestamp of the block's creation.",
                    "To be adjusted by miners to find a valid block hash.",
                    "To link the current block to the previous one.",
                  ].map((ans, idx) => (
                    <button
                      key={idx}
                      onClick={() => !quizSubmitted && setSelectedAnswer(idx)}
                      style={{
                        width: '100%', padding: '16px 18px', borderRadius: 14, textAlign: 'left', fontSize: 13,
                        background: selectedAnswer === idx ? 'rgba(139,92,246,0.08)' : 'rgba(255,255,255,0.02)',
                        border: `2px solid ${selectedAnswer === idx ? 'var(--color-accent)' : 'var(--color-border)'}`,
                        cursor: quizSubmitted ? 'default' : 'pointer',
                        display: 'flex', alignItems: 'center', gap: 14, transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { if (!quizSubmitted && selectedAnswer !== idx) (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.2)'; }}
                      onMouseLeave={e => { if (selectedAnswer !== idx) (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; }}
                    >
                      <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${selectedAnswer === idx ? 'var(--color-accent)' : 'var(--color-border)'}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                        {selectedAnswer === idx && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-accent)' }} />}
                      </div>
                      <span style={{ color: selectedAnswer === idx ? 'var(--color-text-primary)' : 'var(--color-text-muted)', fontWeight: selectedAnswer === idx ? 600 : 400 }}>{ans}</span>
                    </button>
                  ))}
                </div>
                <button
                  disabled={selectedAnswer === null || quizSubmitted}
                  onClick={() => setQuizSubmitted(true)}
                  style={{
                    width: '100%', padding: '14px', borderRadius: 16, fontSize: 13, fontWeight: 800,
                    background: selectedAnswer === null || quizSubmitted ? 'rgba(255,255,255,0.05)' : '#fff',
                    color: selectedAnswer === null || quizSubmitted ? 'var(--color-text-muted)' : '#0b0e14',
                    border: 'none', cursor: selectedAnswer === null || quizSubmitted ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {quizSubmitted ? 'Answer Submitted' : 'Submit Answer'}
                </button>
                {quizSubmitted && (
                  <div style={{ marginTop: 24, padding: '14px 16px', borderRadius: 16, background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <CheckCircle style={{ width: 16, height: 16, color: '#34d399', flexShrink: 0 }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#34d399' }}>
                      {selectedAnswer === 1
                        ? 'Correct! Great job.'
                        : "Not quite — the nonce is adjusted by miners for proof-of-work."}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningPlayer;
