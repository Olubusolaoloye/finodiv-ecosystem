
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CAREER_QUESTIONS, CAREER_PATHS } from '../constants';
import { CareerPath } from '../types';
import {
  Compass, ArrowRight, ArrowLeft, CheckCircle2,
  TrendingUp, Clock, RefreshCw, Zap, DollarSign, ExternalLink,
} from 'lucide-react';

const DEMAND_COLOR: Record<string, string> = {
  'Very High': 'text-emerald-600 dark:text-emerald-400',
  'High':      'text-blue-600 dark:text-blue-400',
  'Growing':   'text-purple-600 dark:text-purple-400',
};

const CareerCompass: React.FC = () => {
  const [step, setStep]       = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [results, setResults] = useState<CareerPath[] | null>(null);

  const totalSteps = CAREER_QUESTIONS.length;

  const handleStart = () => { setStep(1); setAnswers([]); setResults(null); };

  const handleOptionSelect = (optionIdx: number) => {
    const newAnswers = [...answers, optionIdx];
    setAnswers(newAnswers);
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      calculateResults(newAnswers);
    }
  };

  const calculateResults = (finalAnswers: number[]) => {
    const scores: Record<string, number> = {};
    Object.keys(CAREER_PATHS).forEach(id => (scores[id] = 0));
    finalAnswers.forEach((ansIdx, qIdx) => {
      const impacts = CAREER_QUESTIONS[qIdx].options[ansIdx]?.impact ?? {};
      Object.entries(impacts).forEach(([id, val]) => { scores[id] = (scores[id] || 0) + val; });
    });
    const top = Object.keys(scores)
      .sort((a, b) => scores[b] - scores[a])
      .slice(0, 3)
      .map(id => CAREER_PATHS[id]);
    setResults(top);
    setStep(totalSteps + 1);
  };

  const goBack = () => {
    if (step > 1) { setStep(step - 1); setAnswers(answers.slice(0, -1)); }
    else setStep(0);
  };

  // ── Hero ─────────────────────────────────────────────────────────────────────
  if (step === 0) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-[#0b0e14] transition-colors">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl aspect-square bg-blue-600/10 blur-[150px] pointer-events-none rounded-full" />
        <div className="relative z-10 flex flex-col items-center max-w-3xl">
          <div className="w-20 h-20 rounded-3xl bg-blue-600/10 dark:bg-blue-600/10 flex items-center justify-center mb-8 border border-blue-500/20 shadow-2xl shadow-blue-500/10">
            <Compass className="w-10 h-10 text-blue-500 dark:text-blue-400 animate-pulse" />
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-tight text-slate-900 dark:text-white">
            Discover Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">
              Web3 Career Path
            </span>
          </h1>
          <p className="text-slate-600 dark:text-gray-400 text-lg md:text-xl mb-4 leading-relaxed max-w-2xl">
            The Web3 freelance market is worth <span className="font-bold text-slate-900 dark:text-white">$12B+</span> and growing.
            Answer {totalSteps} strategic questions and let the FINODIV Compass match you to
            your perfect career — with real freelance rates and platforms.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-12 text-xs font-black uppercase tracking-widest">
            {['ZK / L2', 'AI + Web3', 'Security Auditing', 'On-Chain Gaming', 'DeFi Research'].map(tag => (
              <span key={tag} className="px-3 py-1.5 rounded-full bg-blue-500/10 dark:bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
                {tag}
              </span>
            ))}
          </div>
          <button
            onClick={handleStart}
            className="px-10 py-5 rounded-3xl bg-[#2F6DF2] hover:bg-blue-600 transition-all font-black text-xl text-white shadow-2xl shadow-blue-500/20 flex items-center gap-3 group"
          >
            Start Career Assessment
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="mt-6 text-xs text-slate-400 dark:text-gray-600 font-bold uppercase tracking-widest">
            {totalSteps} questions · ~3 minutes · 12 career paths
          </p>
        </div>
      </div>
    );
  }

  // ── Question Flow ─────────────────────────────────────────────────────────────
  if (step > 0 && step <= totalSteps) {
    const currentQ = CAREER_QUESTIONS[step - 1];
    const progress = (step / totalSteps) * 100;

    return (
      <div className="min-h-full bg-slate-50 dark:bg-[#0b0e14] p-8 lg:p-12 flex flex-col items-center transition-colors">
        <div className="w-full max-w-3xl">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={goBack}
              className="flex items-center gap-2 text-slate-500 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-bold uppercase tracking-widest"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 dark:text-blue-400">
              Step {step} of {totalSteps}
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 w-full bg-slate-200 dark:bg-white/5 rounded-full mb-16 overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Question card */}
          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-[48px] p-10 lg:p-16 backdrop-blur-xl relative overflow-hidden shadow-sm dark:shadow-none">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />

            <h2 className="text-2xl md:text-3xl font-black mb-10 leading-tight tracking-tight text-slate-900 dark:text-white">
              {currentQ.question}
            </h2>

            <div className="space-y-4">
              {currentQ.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(idx)}
                  className="w-full p-5 rounded-3xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 hover:border-blue-500/50 hover:bg-blue-50 dark:hover:bg-white/[0.05] transition-all text-left group flex items-center justify-between"
                >
                  <span className="text-base font-semibold text-slate-700 dark:text-gray-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors pr-4">
                    {opt.label}
                  </span>
                  <div className="w-9 h-9 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shrink-0">
                    <ArrowRight className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Results ───────────────────────────────────────────────────────────────────
  if (results) {
    const primary      = results[0];
    const alternatives = results.slice(1);

    return (
      <div className="min-h-full bg-slate-50 dark:bg-[#0b0e14] p-8 lg:p-12 pb-32 transition-colors">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-500 dark:text-blue-400 text-sm font-black uppercase tracking-widest mb-6">
              <CheckCircle2 className="w-4 h-4" /> Assessment Complete
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-3">
              Your Career DNA Result
            </h2>
            <p className="text-slate-500 dark:text-gray-500">
              Based on your answers, here are the paths you're built for.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-10 items-start">

            {/* Primary Recommendation */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[56px] p-10 lg:p-14 relative overflow-hidden shadow-2xl shadow-blue-500/20">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex flex-wrap items-center gap-3 mb-8">
                    <span className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-white border border-white/30">
                      Recommended for you
                    </span>
                    <span className="px-4 py-1.5 rounded-full bg-emerald-500/20 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-emerald-300 border border-emerald-500/30">
                      Top Choice
                    </span>
                  </div>

                  <h3 className="text-3xl md:text-5xl font-black mb-5 leading-tight text-white">{primary.title}</h3>
                  <p className="text-blue-100 text-base md:text-lg mb-10 leading-relaxed">{primary.description}</p>

                  {/* Skills + Traits */}
                  <div className="grid md:grid-cols-2 gap-8 mb-10">
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-200/60">Core Traits</h4>
                      <div className="flex flex-wrap gap-2">
                        {primary.traits.map(t => (
                          <span key={t} className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-xs font-bold text-white">{t}</span>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-200/60">Key Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {primary.skills.map(s => (
                          <span key={s} className="px-3 py-1.5 rounded-xl bg-blue-400/20 border border-blue-400/30 text-xs font-bold text-blue-100">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="flex flex-wrap gap-8 py-8 border-y border-white/10 mb-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-[10px] text-blue-200/60 font-black uppercase tracking-widest">Market Demand</p>
                        <p className="font-black text-white">{primary.demand}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-[10px] text-blue-200/60 font-black uppercase tracking-widest">Learning Path</p>
                        <p className="font-black text-white">{primary.duration}</p>
                      </div>
                    </div>
                    {primary.freelanceRate && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-[10px] text-blue-200/60 font-black uppercase tracking-widest">Freelance Rate</p>
                          <p className="font-black text-white">{primary.freelanceRate}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Platforms */}
                  {primary.platforms && (
                    <div className="mb-10">
                      <p className="text-[10px] text-blue-200/60 font-black uppercase tracking-widest mb-3">Top Platforms to Find Work</p>
                      <div className="flex flex-wrap gap-2">
                        {primary.platforms.map(p => (
                          <span key={p} className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-xs font-bold text-white flex items-center gap-1.5">
                            <ExternalLink className="w-3 h-3" /> {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <Link
                    to="/courses"
                    className="w-full py-5 rounded-3xl bg-white text-blue-600 hover:bg-blue-50 transition-all font-black text-lg flex items-center justify-center gap-3 shadow-2xl"
                  >
                    <Zap className="w-5 h-5 fill-current" /> Start This Career Path
                  </Link>
                </div>
              </div>
            </div>

            {/* Alternatives + Retake */}
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 dark:text-gray-500 pl-2">
                Strong Alternatives
              </h3>

              {alternatives.map((alt) => (
                <div
                  key={alt.id}
                  className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-[40px] p-8 hover:border-blue-500/40 transition-all group shadow-sm dark:shadow-none"
                >
                  <div className="flex items-center justify-between mb-5">
                    <div className="px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[9px] font-black uppercase tracking-widest text-blue-500 dark:text-blue-400">
                      Strong Fit
                    </div>
                    <span className="text-xs font-bold text-slate-400 dark:text-gray-500">{alt.overlap}% match</span>
                  </div>
                  <h4 className="text-xl font-black mb-2 text-slate-900 dark:text-white">{alt.title}</h4>
                  <p className="text-sm text-slate-500 dark:text-gray-500 mb-3 line-clamp-2 leading-relaxed">{alt.description}</p>
                  {alt.freelanceRate && (
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-6 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5" /> {alt.freelanceRate}
                    </p>
                  )}
                  <Link
                    to="/courses"
                    className="w-full py-3 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 group-hover:bg-blue-600 group-hover:text-white group-hover:border-transparent transition-all font-bold text-xs text-slate-600 dark:text-gray-400 block text-center"
                  >
                    Explore Path
                  </Link>
                </div>
              ))}

              <button
                onClick={handleStart}
                className="w-full py-5 rounded-3xl border-2 border-dashed border-slate-300 dark:border-white/10 hover:border-blue-500/40 hover:bg-blue-50 dark:hover:bg-white/5 transition-all text-slate-500 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center gap-3 text-sm font-bold uppercase tracking-widest"
              >
                <RefreshCw className="w-4 h-4" /> Retake Assessment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default CareerCompass;
