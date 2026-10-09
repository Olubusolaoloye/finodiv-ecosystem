import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CAREER_QUESTIONS, CAREER_PATHS } from '../constants';
import { CareerPath } from '../types';
import {
  Compass, ArrowRight, ArrowLeft, CheckCircle2,
  TrendingUp, Clock, RefreshCw, Zap, DollarSign, ExternalLink,
} from 'lucide-react';

const CareerCompass: React.FC = () => {
  const [step, setStep]       = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [results, setResults] = useState<CareerPath[] | null>(null);

  const totalSteps = CAREER_QUESTIONS.length;

  const handleStart = () => { setStep(1); setAnswers([]); setResults(null); };

  const handleOptionSelect = (optionIdx: number) => {
    const newAnswers = [...answers, optionIdx];
    setAnswers(newAnswers);
    if (step < totalSteps) { setStep(step + 1); }
    else { calculateResults(newAnswers); }
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

  const DEMAND_STYLE: Record<string, React.CSSProperties> = {
    'Very High': { color: '#34d399' },
    'High':      { color: '#60a5fa' },
    'Growing':   { color: '#a78bfa' },
  };

  // ── INTRO ──────────────────────────────────────────────────────────────────────
  if (step === 0) {
    const TAGS = ['ZK / L2', 'RWA Tokenization', 'MEV / Searcher', 'AI + Web3', 'DePIN', 'Security Auditing', 'DevRel', 'DeFi Research', 'Crypto Compliance'];
    return (
      <div style={{
        minHeight: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '48px 24px', textAlign: 'center',
        background: 'var(--color-bg-primary)', position: 'relative', overflow: 'hidden',
      }}>
        {/* Background orb */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: 700, height: 700,
          background: 'radial-gradient(circle, rgba(47,109,242,0.08) 0%, transparent 65%)',
          borderRadius: '50%', pointerEvents: 'none',
        }} aria-hidden="true" />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 760 }}>
          {/* Icon */}
          <div style={{
            width: 80, height: 80, borderRadius: 28,
            background: 'rgba(47,109,242,0.1)',
            border: '1px solid rgba(47,109,242,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 32, boxShadow: '0 8px 32px rgba(47,109,242,0.12)',
          }}>
            <Compass style={{ width: 38, height: 38, color: 'var(--color-accent)' }} strokeWidth={1.5} />
          </div>

          <h1 style={{
            fontSize: 'clamp(2.4rem, 6vw, 4.5rem)',
            fontWeight: 900, letterSpacing: '-0.035em', lineHeight: 1.05,
            color: 'var(--color-text-primary)', marginBottom: 20,
          }}>
            Discover Your<br />
            <span style={{
              background: 'linear-gradient(135deg, #2F6DF2, #7C3AED)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              Web3 Career Path
            </span>
          </h1>

          <p style={{ fontSize: 17, color: 'var(--color-text-muted)', marginBottom: 16, lineHeight: 1.65, maxWidth: 600 }}>
            The demand for digital and Web3 skills has never been higher.
            Answer {totalSteps} strategic questions and let the FINODIV Compass match you to
            your perfect 2026 career — with real freelance rates and top platforms.
          </p>

          {/* Tag chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 44 }}>
            {TAGS.map(tag => (
              <span key={tag} style={{
                padding: '6px 14px', borderRadius: 999,
                background: 'rgba(47,109,242,0.08)',
                border: '1px solid rgba(47,109,242,0.2)',
                fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
                letterSpacing: '0.1em', color: 'var(--color-accent)',
              }}>
                {tag}
              </span>
            ))}
          </div>

          <button
            onClick={handleStart}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '16px 40px', borderRadius: 16,
              background: 'var(--color-accent)', color: '#fff',
              fontWeight: 900, fontSize: 17, border: 'none', cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(47,109,242,0.3)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'var(--color-accent-hover)'; el.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'var(--color-accent)'; el.style.transform = 'translateY(0)'; }}
          >
            Start Career Assessment
            <ArrowRight style={{ width: 20, height: 20 }} />
          </button>

          <p style={{ marginTop: 20, fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em' }}>
            {totalSteps} questions · ~3 minutes · 17 career paths
          </p>
        </div>
      </div>
    );
  }

  // ── QUESTION FLOW ──────────────────────────────────────────────────────────────
  if (step > 0 && step <= totalSteps) {
    const q        = CAREER_QUESTIONS[step - 1];
    const progress = (step / totalSteps) * 100;

    return (
      <div style={{
        minHeight: '100%', background: 'var(--color-bg-primary)',
        padding: 'clamp(24px, 5vw, 48px) 24px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        <div style={{ width: '100%', maxWidth: 720 }}>
          {/* Top bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
            <button
              onClick={goBack}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-text-primary)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)'; }}
            >
              <ArrowLeft style={{ width: 16, height: 16 }} /> Back
            </button>
            <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--color-accent)' }}>
              Step {step} of {totalSteps}
            </span>
          </div>

          {/* Progress bar */}
          <div style={{ height: 4, width: '100%', background: 'var(--color-border)', borderRadius: 99, marginBottom: 48, overflow: 'hidden' }}>
            <div style={{
              height: '100%', background: 'var(--color-accent)',
              borderRadius: 99, width: `${progress}%`,
              transition: 'width 0.4s ease',
              boxShadow: '0 0 12px rgba(47,109,242,0.5)',
            }} />
          </div>

          {/* Question card */}
          <div style={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 32, padding: 'clamp(28px, 5vw, 52px)',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Top glow */}
            <div style={{
              position: 'absolute', top: 0, right: 0,
              width: 300, height: 300,
              background: 'radial-gradient(circle, rgba(47,109,242,0.06) 0%, transparent 70%)',
              transform: 'translate(30%, -30%)', pointerEvents: 'none',
            }} aria-hidden="true" />

            <h2 style={{
              fontSize: 'clamp(1.2rem, 3vw, 1.65rem)',
              fontWeight: 900, lineHeight: 1.3, letterSpacing: '-0.02em',
              color: 'var(--color-text-primary)', marginBottom: 32,
              position: 'relative', zIndex: 1,
            }}>
              {q.question}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, position: 'relative', zIndex: 1 }}>
              {q.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(idx)}
                  style={{
                    width: '100%', padding: '16px 20px',
                    borderRadius: 16,
                    background: 'var(--color-bg-deep)',
                    border: '1px solid var(--color-border)',
                    textAlign: 'left', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = 'rgba(47,109,242,0.5)';
                    el.style.background = 'rgba(47,109,242,0.07)';
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = 'var(--color-border)';
                    el.style.background = 'var(--color-bg-deep)';
                  }}
                >
                  <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.45 }}>
                    {opt.label}
                  </span>
                  <div style={{
                    width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                    background: 'rgba(47,109,242,0.1)',
                    border: '1px solid rgba(47,109,242,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <ArrowRight style={{ width: 14, height: 14, color: 'var(--color-accent)' }} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── RESULTS ───────────────────────────────────────────────────────────────────
  if (results) {
    const primary = results[0];
    const alts    = results.slice(1);

    return (
      <div style={{ minHeight: '100%', background: 'var(--color-bg-primary)', padding: 'clamp(24px, 4vw, 48px) 24px', paddingBottom: 120 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '7px 18px', borderRadius: 999, marginBottom: 20,
              background: 'rgba(52,211,153,0.08)',
              border: '1px solid rgba(52,211,153,0.25)',
              color: '#34d399', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em',
            }}>
              <CheckCircle2 style={{ width: 14, height: 14 }} /> Assessment Complete
            </div>
            <h2 style={{
              fontSize: 'clamp(1.8rem, 4vw, 3rem)',
              fontWeight: 900, letterSpacing: '-0.03em',
              color: 'var(--color-text-primary)', marginBottom: 10,
            }}>
              Your Career DNA Result
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 15 }}>
              Based on your answers, here are the paths you're built for in 2026.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 28, alignItems: 'start' }}>

            {/* ── Primary ── */}
            <div style={{ gridColumn: 'span 2' }} className="lg-col-span-2">
              <div style={{
                background: 'linear-gradient(135deg, #1e3a9a 0%, #2d1872 100%)',
                borderRadius: 40, padding: 'clamp(28px, 5vw, 52px)',
                position: 'relative', overflow: 'hidden',
                boxShadow: '0 24px 80px rgba(47,109,242,0.2)',
              }}>
                <div style={{ position: 'absolute', top: 0, right: 0, width: 400, height: 400, background: 'radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 65%)', transform: 'translate(30%, -30%)', pointerEvents: 'none' }} aria-hidden="true" />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  {/* Badges */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
                    <span style={{ padding: '5px 14px', borderRadius: 999, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#fff' }}>
                      Recommended for you
                    </span>
                    <span style={{ padding: '5px 14px', borderRadius: 999, background: 'rgba(52,211,153,0.2)', border: '1px solid rgba(52,211,153,0.35)', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#34d399' }}>
                      Top Choice
                    </span>
                  </div>

                  <h3 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.75rem)', fontWeight: 900, marginBottom: 16, lineHeight: 1.1, color: '#fff' }}>
                    {primary.title}
                  </h3>
                  <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.72)', marginBottom: 36, lineHeight: 1.65 }}>
                    {primary.description}
                  </p>

                  {/* Traits + Skills */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24, marginBottom: 36 }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>Core Traits</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {primary.traits.map(t => (
                          <span key={t} style={{ padding: '5px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)', fontSize: 12, fontWeight: 700, color: '#fff' }}>{t}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>Key Skills</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {primary.skills.map(s => (
                          <span key={s} style={{ padding: '5px 12px', borderRadius: 8, background: 'rgba(96,165,250,0.18)', border: '1px solid rgba(96,165,250,0.3)', fontSize: 12, fontWeight: 700, color: '#93c5fd' }}>{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 28, padding: '24px 0', borderTop: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: 28 }}>
                    {[
                      { icon: TrendingUp, label: 'Market Demand',   val: primary.demand,        style: DEMAND_STYLE[primary.demand] || { color: '#fff' } },
                      { icon: Clock,      label: 'Learning Path',   val: primary.duration,      style: { color: '#fff' } },
                      ...(primary.freelanceRate ? [{ icon: DollarSign, label: 'Freelance Rate', val: primary.freelanceRate, style: { color: '#34d399' } }] : []),
                    ].map(({ icon: Icon, label, val, style }) => (
                      <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon style={{ width: 18, height: 18, color: '#fff' }} />
                        </div>
                        <div>
                          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em' }}>{label}</div>
                          <div style={{ fontWeight: 900, fontSize: 15, ...style }}>{val}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Platforms */}
                  {primary.platforms && (
                    <div style={{ marginBottom: 32 }}>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 12 }}>
                        Top Platforms to Find Work
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {primary.platforms.map(p => (
                          <span key={p} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', fontSize: 12, fontWeight: 700, color: '#fff' }}>
                            <ExternalLink style={{ width: 11, height: 11 }} /> {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <Link
                    to="/courses"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                      width: '100%', padding: '16px', borderRadius: 16,
                      background: '#fff', color: '#1e0b5e',
                      fontWeight: 900, fontSize: 16, textDecoration: 'none',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
                  >
                    <Zap style={{ width: 18, height: 18 }} /> Start This Career Path
                  </Link>
                </div>
              </div>
            </div>

            {/* ── Alternatives ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--color-text-muted)', paddingLeft: 4 }}>
                Strong Alternatives
              </div>

              {alts.map(alt => (
                <div
                  key={alt.id}
                  style={{
                    background: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 24, padding: '24px',
                    transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(47,109,242,0.4)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ padding: '3px 10px', borderRadius: 6, background: 'rgba(47,109,242,0.1)', border: '1px solid rgba(47,109,242,0.2)', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-accent)' }}>
                      Strong Fit
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)' }}>{alt.overlap}% match</span>
                  </div>
                  <h4 style={{ fontSize: 17, fontWeight: 900, marginBottom: 8, color: 'var(--color-text-primary)' }}>{alt.title}</h4>
                  <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 10, lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {alt.description}
                  </p>
                  {alt.freelanceRate && (
                    <p style={{ fontSize: 12, fontWeight: 800, color: '#34d399', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <DollarSign style={{ width: 13, height: 13 }} /> {alt.freelanceRate}
                    </p>
                  )}
                  <Link
                    to="/courses"
                    style={{
                      display: 'block', textAlign: 'center', width: '100%',
                      padding: '10px', borderRadius: 12,
                      background: 'var(--color-bg-deep)',
                      border: '1px solid var(--color-border)',
                      fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)',
                      textDecoration: 'none', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'var(--color-accent)'; el.style.color = '#fff'; el.style.borderColor = 'transparent'; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'var(--color-bg-deep)'; el.style.color = 'var(--color-text-muted)'; el.style.borderColor = 'var(--color-border)'; }}
                  >
                    Explore Path
                  </Link>
                </div>
              ))}

              <button
                onClick={handleStart}
                style={{
                  width: '100%', padding: '16px', borderRadius: 16,
                  border: '2px dashed var(--color-border)',
                  background: 'transparent', cursor: 'pointer',
                  color: 'var(--color-text-muted)', fontSize: 13, fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(47,109,242,0.5)'; el.style.color = 'var(--color-text-primary)'; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--color-border)'; el.style.color = 'var(--color-text-muted)'; }}
              >
                <RefreshCw style={{ width: 15, height: 15 }} /> Retake Assessment
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
