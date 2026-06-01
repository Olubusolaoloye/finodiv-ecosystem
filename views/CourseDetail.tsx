
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/backend';
import { supabase } from '../services/supabase';
import {
  Play, Clock, BarChart, Globe, CheckCircle, ArrowLeft,
  Calendar, Star, ShoppingBag, Heart, Loader2
} from 'lucide-react';

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const courseId = id || '1';

  const [course, setCourse] = useState<any>(null);
  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
    api.getCourses().then(courses => {
      const found = courses.find(c => c.id === courseId) || courses[0];
      setCourse(found);
    });
  }, [courseId]);

  useEffect(() => {
    if (!userId || !courseId) return;
    api.isEnrolled(userId, courseId).then(setEnrolled);
  }, [userId, courseId]);

  const handleEnroll = async () => {
    if (!userId) { window.location.hash = '#/login'; return; }
    setEnrolling(true);
    await api.enrollCourse(userId, courseId);
    setEnrolled(true);
    setEnrolling(false);
    window.location.hash = `#/learning/${courseId}`;
  };

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 pb-32">
      <nav className="flex items-center gap-2 md:gap-4 text-xs md:text-sm text-slate-500 dark:text-gray-500 mb-6 md:mb-10 overflow-x-auto whitespace-nowrap pb-2">
        <Link to="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">Home</Link>
        <span>/</span>
        <Link to="/courses" className="hover:text-slate-900 dark:hover:text-white transition-colors">Courses</Link>
        <span>/</span>
        <span className="text-slate-900 dark:text-white font-bold">{course.title}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Main Info */}
        <div className="flex-1 order-2 lg:order-1">
          <h1 className="text-3xl md:text-5xl font-black mb-4 md:mb-6 tracking-tight leading-tight text-slate-900 dark:text-white">{course.title}</h1>
          <p className="text-slate-500 dark:text-gray-400 text-base md:text-lg mb-8 md:mb-12 leading-relaxed">{course.description}</p>

          <div className="bg-white dark:bg-white/5 rounded-[32px] md:rounded-[40px] p-6 md:p-8 border border-slate-200 dark:border-white/5 mb-8 md:mb-12 flex items-center gap-4 md:gap-6 shadow-sm dark:shadow-none">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-[24px] md:rounded-[32px] overflow-hidden border-2 border-slate-100 dark:border-white/10 shrink-0">
              <img src={`https://i.pravatar.cc/150?u=${course.instructor}`} alt="" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-lg md:text-xl font-bold mb-1 text-slate-900 dark:text-white">{course.instructor}</p>
              <p className="text-xs md:text-sm text-slate-500 dark:text-gray-500 mb-1">Senior Blockchain Developer</p>
              <div className="flex items-center gap-1 text-yellow-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                <span className="text-[10px] text-slate-400 dark:text-gray-500 font-bold ml-1 uppercase">
                  {course.rating ? `${course.rating} Instructor Rating` : '4.9 Instructor Rating'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-8 md:space-y-12">
            <div>
              <h3 className="text-xl md:text-2xl font-black mb-6 md:mb-8 text-slate-900 dark:text-white">What you'll learn:</h3>
              <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
                {[
                  "Fundamentals of Ethereum and the EVM.",
                  "Writing, testing, and deploying smart contracts.",
                  "Building interactive front-ends using React and Ethers.js.",
                  "Understanding core DeFi concepts like ERC-20, ERC-721.",
                  "Best practices for smart contract security and optimization.",
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5">
                    <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl md:text-2xl font-black mb-6 md:mb-8 text-slate-900 dark:text-white">Requirements:</h3>
              <div className="p-6 md:p-8 rounded-[32px] md:rounded-[40px] bg-blue-50 dark:bg-blue-600/5 border border-blue-100 dark:border-blue-600/20">
                <ul className="space-y-4">
                  {[
                    "Basic understanding of JavaScript and web concepts.",
                    "Familiarity with command-line interfaces.",
                    "No prior blockchain experience is required!",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-4 text-sm text-blue-800 dark:text-blue-200/70">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400 shrink-0"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Course Card Sticky */}
        <div className="w-full lg:w-[400px] order-1 lg:order-2">
          <div className="lg:sticky lg:top-28 bg-white dark:bg-[#0b0e14] border border-slate-200 dark:border-white/10 rounded-[32px] md:rounded-[48px] overflow-hidden shadow-xl dark:shadow-2xl">
            <div className="aspect-[16/10] overflow-hidden relative">
              <img src={course.image} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <button className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group hover:scale-110 transition-all">
                  <Play className="w-6 h-6 text-white fill-current translate-x-1" />
                </button>
              </div>
            </div>

            <div className="p-6 md:p-10">
              <div className="flex items-end gap-3 mb-6 md:mb-8">
                <span className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">${course.price}</span>
                <span className="text-lg text-slate-400 dark:text-gray-500 font-medium mb-1 line-through">$1,299</span>
              </div>

              <div className="space-y-4 mb-8 md:mb-10">
                {enrolled ? (
                  <Link
                    to={`/learning/${courseId}`}
                    className="w-full py-4 md:py-5 rounded-3xl bg-emerald-600 hover:bg-emerald-500 transition-all text-center font-black text-lg shadow-xl shadow-emerald-500/20 block text-white"
                  >
                    ✓ Continue Learning
                  </Link>
                ) : (
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="w-full py-4 md:py-5 rounded-3xl bg-[#2F6DF2] hover:bg-blue-600 transition-all text-center font-black text-lg shadow-xl shadow-blue-500/20 block text-white flex items-center justify-center gap-3 disabled:opacity-70"
                  >
                    {enrolling ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enroll Now'}
                  </button>
                )}
                <div className="flex gap-4">
                  <button className="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-sm font-bold text-slate-700 dark:text-white">
                    <ShoppingBag className="w-4 h-4" /> Add to Cart
                  </button>
                  <button className="px-5 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 transition-all text-slate-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400">
                    <Heart className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-4 md:space-y-6">
                {[
                  { icon: Clock, label: course.duration + ' on-demand video' },
                  { icon: BarChart, label: course.level + ' Level' },
                  { icon: Globe, label: 'English' },
                  { icon: Calendar, label: 'Full lifetime access' },
                ].map((feat, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <feat.icon className="w-5 h-5 text-slate-400 dark:text-gray-500" />
                    <span className="text-sm font-bold text-slate-700 dark:text-gray-300">{feat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
