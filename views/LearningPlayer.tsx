
import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/backend';
import { supabase } from '../services/supabase';
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

  // Enrollment gate + progress loader
  useEffect(() => {
    const init = async () => {
      if (!courseId) { navigate('/courses'); return; }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate(`/courses/${courseId}`); return; }

      setUserId(user.id);

      const enrolled = await api.isEnrolled(user.id, courseId);
      if (!enrolled) { navigate(`/courses/${courseId}`); return; }

      const [courses, { data: progressData }] = await Promise.all([
        api.getCourses(),
        supabase.from('lesson_progress').select('lesson_id').eq('user_id', user.id).eq('course_id', courseId),
      ]);

      setCourse(courses.find(c => c.id === courseId) ?? null);

      if (progressData?.length) {
        const done = new Set(progressData.map((r: any) => r.lesson_id as string));
        setCompletedLessons(done);
        // Start on first incomplete lesson
        const first = ALL_LESSONS.find(l => !done.has(l.id));
        if (first) setActiveLessonId(first.id);
        else setActiveLessonId(ALL_LESSONS[ALL_LESSONS.length - 1].id);
      }

      setLoading(false);
    };
    init();
  }, [courseId]);

  // Anti-piracy
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
    // Auto-advance to next lesson
    const idx = ALL_LESSONS.findIndex(l => l.id === activeLessonId);
    if (idx < ALL_LESSONS.length - 1) setActiveLessonId(ALL_LESSONS[idx + 1].id);
  };

  const activeLesson = ALL_LESSONS.find(l => l.id === activeLessonId);
  const isCurrentComplete = completedLessons.has(activeLessonId);
  const progressPct = Math.round((completedLessons.size / TOTAL_LESSONS) * 100);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden select-none">
      {/* Sidebar */}
      <aside className="w-full lg:w-80 h-auto lg:h-full bg-[#0b0e14] border-r border-white/5 flex flex-col order-2 lg:order-1">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">Course Progress</h2>
            <span className="text-xs font-black text-blue-400">{progressPct}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-6">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="space-y-6">
            {MODULES.map((mod) => (
              <div key={mod.id}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold truncate pr-4">{mod.title}</span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </div>
                <div className="space-y-3">
                  {mod.lessons.map((lesson) => (
                    <button
                      key={lesson.id}
                      onClick={() => setActiveLessonId(lesson.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left
                        ${activeLessonId === lesson.id ? 'bg-white/5 ring-1 ring-blue-500/30' : 'hover:bg-white/5'}
                      `}
                    >
                      {completedLessons.has(lesson.id) ? (
                        <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                      ) : (
                        <div className={`w-4 h-4 rounded-full border-2 shrink-0 ${activeLessonId === lesson.id ? 'border-blue-500' : 'border-gray-700'}`} />
                      )}
                      <span className={`text-xs truncate ${activeLessonId === lesson.id ? 'text-white font-bold' : 'text-gray-500'}`}>
                        {lesson.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto p-6 border-t border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <img
              src={`https://i.pravatar.cc/100?u=${courseId}_instructor`}
              alt="Instructor"
              className="w-10 h-10 rounded-xl object-cover"
            />
            <div>
              <p className="text-sm font-bold">{course?.instructor || 'Instructor'}</p>
              <p className="text-[10px] text-gray-500">Course Instructor</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col order-1 lg:order-2 overflow-y-auto custom-scrollbar">
        <div className="p-8">
          <nav className="flex items-center gap-4 text-sm text-gray-500 mb-8">
            <Link to="/courses" className="hover:text-white transition-colors">Courses</Link>
            <span>/</span>
            <Link to={`/courses/${courseId}`} className="hover:text-white transition-colors">
              {course?.title || 'Course'}
            </Link>
            <span>/</span>
            <span className="text-white">{activeLesson?.title}</span>
          </nav>

          <div className="flex flex-col xl:flex-row gap-8">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-4xl font-extrabold tracking-tight leading-tight">{activeLesson?.title}</h1>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                  <Lock className="w-3.5 h-3.5" /> SECURE STREAM
                </div>
              </div>

              {/* Video Player */}
              <div ref={videoRef} className="aspect-video bg-[#050608] rounded-[32px] overflow-hidden border border-white/10 shadow-2xl relative group">
                <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center">
                  <div className="grid grid-cols-4 gap-20 opacity-10 rotate-[-25deg] select-none text-white font-black text-xs uppercase tracking-[0.4em]">
                    {[...Array(16)].map((_, i) => <span key={i}>FINODIV_SECURED</span>)}
                  </div>
                </div>
                <img
                  src={`https://picsum.photos/seed/${activeLessonId}/1200/675`}
                  alt="Video cover"
                  className={`w-full h-full object-cover transition-opacity duration-700 ${isPlaying ? 'opacity-20 blur-sm' : 'opacity-50'}`}
                />
                <div className="absolute inset-0 flex items-center justify-center z-40">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-20 h-20 rounded-full bg-[#2F6DF2] text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
                  >
                    {isPlaying ? <EyeOff className="w-8 h-8" /> : <Play className="w-8 h-8 fill-current translate-x-1" />}
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-50">
                  <div className="h-1.5 w-full bg-white/20 rounded-full mb-6 overflow-hidden">
                    <div className="h-full bg-blue-500 w-[40%] rounded-full" />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-black tracking-widest uppercase text-white/60">
                    <div className="flex items-center gap-4">
                      <span>04:15 / 11:38</span>
                      <span className="px-2 py-0.5 rounded-md border border-white/20">1080P HD</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Settings className="w-4 h-4 hover:text-white cursor-pointer" />
                      <HelpCircle className="w-4 h-4 hover:text-white cursor-pointer" />
                    </div>
                  </div>
                </div>
                {!isPlaying && (
                  <div className="absolute top-8 left-8 flex items-center gap-3 text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-2xl backdrop-blur-md">
                    <ShieldAlert className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Recording & Downloads Prohibited</span>
                  </div>
                )}
              </div>

              {/* Mark Complete */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleMarkComplete}
                  disabled={isCurrentComplete || markingComplete}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${
                    isCurrentComplete
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20 cursor-default'
                      : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20'
                  }`}
                >
                  {markingComplete
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <CheckCircle className="w-4 h-4" />
                  }
                  {isCurrentComplete ? 'Lesson Complete' : 'Mark as Complete'}
                </button>
              </div>

              {/* Tabs */}
              <div className="mt-8">
                <div className="flex items-center gap-10 border-b border-white/10 mb-8">
                  {['Description', 'Materials', 'Code Snippets'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-4 text-sm font-bold transition-all relative ${activeTab === tab ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                      {tab}
                      {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#2F6DF2] rounded-full" />}
                    </button>
                  ))}
                </div>
                <div className="text-gray-400 leading-relaxed max-w-2xl">
                  {activeTab === 'Description' && (
                    <p>
                      In this lesson, we explore the core concepts of Web3 and blockchain technology. You'll learn how
                      decentralized systems work, the role of cryptographic primitives, and how smart contracts enable
                      trustless computation on the blockchain.
                    </p>
                  )}
                  {activeTab === 'Materials' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between w-full p-4 rounded-2xl bg-white/5 border border-white/5 opacity-50 cursor-not-allowed">
                        <div className="flex items-center gap-3">
                          <BookOpen className="w-5 h-5 text-blue-400" />
                          <span className="text-sm font-bold text-white">Lecture Slides.pdf</span>
                        </div>
                        <Lock className="w-4 h-4" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 text-center">
                        Downloads disabled during beta
                      </p>
                    </div>
                  )}
                  {activeTab === 'Code Snippets' && (
                    <div className="p-6 bg-[#050608] rounded-3xl border border-white/10 font-mono text-sm overflow-x-auto relative">
                      <div className="absolute top-4 right-4 text-[10px] font-black uppercase tracking-widest text-gray-700 select-none">READ ONLY</div>
                      <pre className="text-blue-400">{`struct Block {\n    uint256 index;\n    uint256 timestamp;\n    bytes32 previousHash;\n    bytes32 hash;\n    string data;\n    uint256 nonce;\n}`}</pre>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quiz */}
            <div className="w-full xl:w-96">
              <div className="bg-white/5 rounded-[40px] p-8 border border-white/5">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-extrabold">Test Your Knowledge</h3>
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-6">Question 1 of 3</p>
                <h4 className="text-lg font-bold mb-8 leading-snug">
                  What is the primary purpose of the 'nonce' in a block header?
                </h4>
                <div className="space-y-4 mb-10">
                  {[
                    "To store the timestamp of the block's creation.",
                    "To be adjusted by miners to find a valid block hash.",
                    "To link the current block to the previous one.",
                  ].map((ans, idx) => (
                    <button
                      key={idx}
                      onClick={() => !quizSubmitted && setSelectedAnswer(idx)}
                      className={`w-full p-5 rounded-2xl text-left text-sm transition-all border-2 flex items-center gap-4 group
                        ${selectedAnswer === idx ? 'bg-blue-500/10 border-blue-500' : 'bg-white/[0.02] border-white/5 hover:border-white/20'}
                      `}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${selectedAnswer === idx ? 'border-blue-500' : 'border-gray-700 group-hover:border-gray-500'}`}>
                        {selectedAnswer === idx && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
                      </div>
                      <span className={selectedAnswer === idx ? 'text-white font-bold' : 'text-gray-400'}>{ans}</span>
                    </button>
                  ))}
                </div>
                <button
                  disabled={selectedAnswer === null || quizSubmitted}
                  onClick={() => setQuizSubmitted(true)}
                  className={`w-full py-4 rounded-2xl text-sm font-extrabold transition-all ${
                    selectedAnswer === null || quizSubmitted
                      ? 'bg-white/5 text-gray-600 cursor-not-allowed'
                      : 'bg-white text-black hover:bg-gray-200'
                  }`}
                >
                  {quizSubmitted ? 'Answer Submitted' : 'Submit Answer'}
                </button>
                {quizSubmitted && (
                  <div className="mt-6 p-4 rounded-2xl bg-green-500/10 border border-green-500/30 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-xs font-bold text-green-400">
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
