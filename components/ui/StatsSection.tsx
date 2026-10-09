import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView, animate } from 'framer-motion';

/* ── Animated counter using framer-motion animate() ─────────────── */
const Counter: React.FC<{ target: number; suffix: string; inView: boolean }> = ({ target, suffix, inView }) => {
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    const controls = animate(0, target, {
      duration: 1.8,
      ease: [0.22, 1, 0.36, 1],
      onUpdate(val) { setDisplay(Math.round(val)); },
    });
    return () => controls.stop();
  }, [inView, target]);

  return (
    <span>
      {target >= 1000 ? display.toLocaleString() : display}{suffix}
    </span>
  );
};

const STATS = [
  { target: 12400, suffix: '+', label: 'Students Enrolled',  sub: 'Across Africa',       color: '#38bdf8', glow: 'rgba(56,189,248,0.2)'  },
  { target: 34,    suffix: '',  label: 'Courses Published',   sub: 'And growing',         color: '#a78bfa', glow: 'rgba(167,139,250,0.2)' },
  { target: 91,    suffix: '%', label: 'Completion Rate',     sub: 'Industry-leading',    color: '#34d399', glow: 'rgba(52,211,153,0.2)'  },
  { target: 4,     suffix: 'x', label: 'Avg. Income Lift',   sub: 'Post-course',         color: '#fbbf24', glow: 'rgba(251,191,36,0.2)'  },
];

const TESTIMONIALS = [
  {
    quote: "I went from knowing nothing about forex to making consistent profits within 3 months. The Naija Starter Guide explained everything in pidgin-friendly English.",
    name: 'Chukwuemeka O.', city: 'Lagos, Nigeria', role: 'Forex Trader', initials: 'CO', accent: '#38bdf8',
  },
  {
    quote: "The DeFi course changed how I think about money. I've since moved ₦800k into yield-bearing protocols. This is the best ₦22k I ever spent.",
    name: 'Amina B.', city: 'Kano, Nigeria', role: 'DeFi Investor', initials: 'AB', accent: '#a78bfa',
  },
  {
    quote: "I now earn $2,400/month from international clients. The freelancing module showed me exactly which platforms to use and how to get paid.",
    name: 'Tunde A.', city: 'Ibadan, Nigeria', role: 'Freelancer', initials: 'TA', accent: '#34d399',
  },
  {
    quote: "Went from zero to deploying my first Solidity contract in 8 weeks. The project-based format made everything click instantly.",
    name: 'Fatima M.', city: 'Abuja, Nigeria', role: 'Smart Contract Dev', initials: 'FM', accent: '#fbbf24',
  },
  {
    quote: "FINODIV's on-chain certificate opened doors I didn't know existed. Got hired at a Lagos fintech within 2 weeks of completing the course.",
    name: 'Seun K.', city: 'Port Harcourt, Nigeria', role: 'Web3 Developer', initials: 'SK', accent: '#f472b6',
  },
  {
    quote: "The community alone is worth the fee. 12k builders who actually want to see each other win. I've made real money just from connections here.",
    name: 'Emeka D.', city: 'Enugu, Nigeria', role: 'Digital Creator', initials: 'ED', accent: '#818cf8',
  },
];

/* ── Testimonial card ───────────────────────────────────────────── */
const TestimonialCard: React.FC<typeof TESTIMONIALS[0]> = ({ quote, name, city, role, initials, accent }) => {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 320, flexShrink: 0,
        borderRadius: 22, padding: '28px 24px',
        display: 'flex', flexDirection: 'column', gap: 20,
        background: hov ? `linear-gradient(145deg, ${accent}10, rgba(255,255,255,0.02))` : 'rgba(255,255,255,0.03)',
        border: `1px solid ${hov ? accent + '40' : 'rgba(255,255,255,0.07)'}`,
        boxShadow: hov ? `0 0 40px ${accent}25, 0 8px 32px rgba(0,0,0,0.3)` : '0 4px 16px rgba(0,0,0,0.2)',
        backdropFilter: 'blur(12px)',
        transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Top accent line */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${accent}60, transparent)`, opacity: hov ? 1 : 0, transition: 'opacity 0.3s' }} />

      {/* Stars */}
      <div style={{ display: 'flex', gap: 3 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <svg key={i} width="12" height="12" viewBox="0 0 16 16">
            <path fill="#fbbf24" d="M8 1l1.9 4 4.4.6-3.2 3.1.8 4.4L8 11l-3.9 2.1.8-4.4L1.7 5.6l4.4-.6z" />
          </svg>
        ))}
      </div>

      {/* Big quote mark */}
      <div aria-hidden="true" style={{ position: 'absolute', top: 12, right: 18, fontSize: 80, lineHeight: 1, color: `${accent}08`, fontFamily: 'Georgia, serif', userSelect: 'none', fontWeight: 700 }}>"</div>

      <p style={{ fontSize: 13, lineHeight: 1.72, color: 'rgba(255,255,255,0.6)', position: 'relative', zIndex: 1 }}>
        "{quote}"
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: `${accent}25`, border: `1px solid ${accent}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: accent, flexShrink: 0 }}>
          {initials}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{name}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{role} · {city}</div>
        </div>
      </div>
    </div>
  );
};

/* ── Marquee testimonials ────────────────────────────────────────── */
const TestimonialMarquee: React.FC = () => {
  const doubled = [...TESTIMONIALS, ...TESTIMONIALS];
  return (
    <div className="marquee-container" style={{ overflow: 'hidden', paddingBottom: 4 }}>
      <div className="marquee-track" style={{ gap: 20 }}>
        {doubled.map((t, i) => <TestimonialCard key={i} {...t} />)}
      </div>
    </div>
  );
};

/* ── Main component ─────────────────────────────────────────────── */
const StatsSection: React.FC = () => {
  const statsRef = useRef<HTMLDivElement>(null);
  const testRef  = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true, margin: '-80px' });
  const testInView  = useInView(testRef,  { once: true, margin: '-80px' });

  return (
    <>
      {/* ── Stats bar ─────────────────────────────────────────────── */}
      <section
        ref={statsRef}
        style={{
          background: 'linear-gradient(180deg, #060b16 0%, #0a0f1e 100%)',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          padding: 'clamp(56px, 8vw, 80px) clamp(16px, 5vw, 48px)',
          position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Grid lines background */}
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 40 }}>
            {STATS.map(({ target, suffix, label, sub, color, glow }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                animate={statsInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 }}
                style={{ textAlign: 'center', position: 'relative' }}
              >
                {/* Glow blob behind number */}
                <div aria-hidden="true" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -60%)', width: 120, height: 120, borderRadius: '50%', background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`, pointerEvents: 'none', opacity: statsInView ? 1 : 0, transition: 'opacity 0.8s 0.4s' }} />

                <div style={{
                  fontSize: 'clamp(2.4rem, 6vw, 3.6rem)',
                  fontWeight: 900, lineHeight: 1,
                  background: `linear-gradient(135deg, #fff 40%, ${color})`,
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  marginBottom: 10, position: 'relative',
                }}>
                  <Counter target={target} suffix={suffix} inView={statsInView} />
                </div>

                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.05em' }}>{sub}</div>

                {/* Bottom accent line */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={statsInView ? { scaleX: 1 } : {}}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.4 + i * 0.1 }}
                  style={{ height: 2, borderRadius: 999, background: `linear-gradient(90deg, transparent, ${color}, transparent)`, marginTop: 16, transformOrigin: 'center' }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────── */}
      <section
        ref={testRef}
        style={{
          background: 'linear-gradient(180deg, #0a0f1e 0%, #060b16 100%)',
          padding: 'clamp(64px, 8vw, 96px) 0',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Ambient glows */}
        <div aria-hidden="true" style={{ position: 'absolute', top: '20%', left: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,189,248,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div aria-hidden="true" style={{ position: 'absolute', bottom: '10%', right: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={testInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ textAlign: 'center', marginBottom: 56, padding: '0 clamp(16px, 5vw, 48px)' }}
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={testInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.1 }}
            style={{
              display: 'inline-block', padding: '5px 16px', borderRadius: 999,
              background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)',
              fontSize: 10, fontWeight: 800, letterSpacing: '0.18em',
              textTransform: 'uppercase', color: '#34d399', marginBottom: 20,
            }}
          >
            Student Results
          </motion.span>

          <h2 style={{
            fontSize: 'clamp(1.9rem, 5vw, 3rem)',
            fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1,
            color: '#fff', marginBottom: 16,
          }}>
            Real stories,{' '}
            <span style={{
              background: 'linear-gradient(135deg, #34d399, #38bdf8)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              real returns
            </span>
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em' }}>
            Hover to scroll →
          </p>
        </motion.div>

        {/* Marquee */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={testInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          style={{ paddingLeft: 'clamp(16px, 5vw, 48px)' }}
        >
          <TestimonialMarquee />
        </motion.div>
      </section>
    </>
  );
};

export default StatsSection;
