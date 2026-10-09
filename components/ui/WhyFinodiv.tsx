import React, { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Globe, ShieldCheck, TrendingUp, Zap, Users, Award } from 'lucide-react';

const FEATURES = [
  {
    num: '01', Icon: Globe,
    heading: 'Built for African realities',
    body: 'Courses priced in Naira, taught with local context — not recycled Western theory. We understand the unique challenges of building wealth in Nigeria and across Africa.',
    color: '#38bdf8', glow: 'rgba(56,189,248,0.2)',
  },
  {
    num: '02', Icon: ShieldCheck,
    heading: 'Verified expert instructors',
    body: 'Every course is reviewed by our expert team before it reaches a student. No fluff — just actionable knowledge from practitioners with real track records.',
    color: '#a78bfa', glow: 'rgba(167,139,250,0.2)',
  },
  {
    num: '03', Icon: TrendingUp,
    heading: 'Actionable, not academic',
    body: 'You finish each module with something you can do today — a trade setup, a client pitch, a DeFi strategy. Education that immediately translates to income.',
    color: '#34d399', glow: 'rgba(52,211,153,0.2)',
  },
  {
    num: '04', Icon: Zap,
    heading: 'Micro-learning format',
    body: 'Short, dense lessons designed for busy Nigerians. Learn on the go — on your commute, lunch break, or after work. No marathon lecture sessions.',
    color: '#fbbf24', glow: 'rgba(251,191,36,0.2)',
  },
  {
    num: '05', Icon: Users,
    heading: 'Thriving community',
    body: 'Join 12,400+ students in our active community channels. Share wins, ask questions, find accountability partners, and grow your network.',
    color: '#f472b6', glow: 'rgba(244,114,182,0.2)',
  },
  {
    num: '06', Icon: Award,
    heading: 'On-chain certificates',
    body: 'Earn verifiable, blockchain-backed certificates that employers can trust. Your achievements are permanent and cannot be faked.',
    color: '#818cf8', glow: 'rgba(129,140,248,0.2)',
  },
];

/* ── Feature card ───────────────────────────────────────────────── */
const FeatureCard: React.FC<{
  feature: typeof FEATURES[0];
  delay: number;
  inView: boolean;
  fromLeft: boolean;
}> = ({ feature: { num, Icon, heading, body, color, glow }, delay, inView, fromLeft }) => {
  const [hov, setHov] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: fromLeft ? -60 : 60, y: 20 }}
      animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderRadius: 24, padding: '32px 28px',
        display: 'flex', flexDirection: 'column', gap: 20,
        position: 'relative', overflow: 'hidden',
        background: hov
          ? `linear-gradient(145deg, ${glow}, rgba(255,255,255,0.01))`
          : 'rgba(255,255,255,0.03)',
        border: `1px solid ${hov ? color + '45' : 'rgba(255,255,255,0.07)'}`,
        boxShadow: hov ? `0 0 40px ${glow}, 0 12px 40px rgba(0,0,0,0.3)` : '0 4px 20px rgba(0,0,0,0.2)',
        backdropFilter: 'blur(12px)',
        transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
        cursor: 'default',
      }}
    >
      {/* Top gradient line */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${color}70, transparent)`, opacity: hov ? 1 : 0, transition: 'opacity 0.3s' }} />

      {/* Number watermark */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: 16, right: 20,
        fontSize: 68, fontWeight: 900, lineHeight: 1,
        color: `${color}08`, userSelect: 'none',
        fontVariantNumeric: 'tabular-nums',
        transition: 'color 0.3s',
        ...(hov ? { color: `${color}14` } : {}),
      }}>
        {num}
      </div>

      {/* Corner ambient glow */}
      <div aria-hidden="true" style={{ position: 'absolute', top: -40, left: -40, width: 100, height: 100, borderRadius: '50%', background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`, opacity: hov ? 1 : 0, transition: 'opacity 0.4s', pointerEvents: 'none' }} />

      {/* Icon */}
      <div style={{
        width: 52, height: 52, borderRadius: 16,
        background: `${color}18`, border: `1px solid ${color}35`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        transform: hov ? 'scale(1.1) rotate(-5deg)' : 'scale(1) rotate(0deg)',
        boxShadow: hov ? `0 0 24px ${color}40` : 'none',
        transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        <Icon style={{ width: 24, height: 24, color }} strokeWidth={1.75} />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <h3 style={{
          fontSize: 16, fontWeight: 800, color: '#fff',
          marginBottom: 10, lineHeight: 1.3,
          transform: hov ? 'translateX(4px)' : 'translateX(0)',
          transition: 'transform 0.3s',
        }}>
          {heading}
        </h3>
        <p style={{ fontSize: 13, lineHeight: 1.7, color: 'rgba(255,255,255,0.45)' }}>
          {body}
        </p>
      </div>

      {/* Bottom colored accent */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${color}00, ${color}60, ${color}00)`,
        opacity: hov ? 1 : 0, transition: 'opacity 0.3s',
      }} />
    </motion.div>
  );
};

/* ── Marquee row (duplicate cards for seamless loop) ──────────────── */
const MarqueeFeatures: React.FC = () => {
  const doubled = [...FEATURES, ...FEATURES];
  return (
    <div className="marquee-container" style={{ overflow: 'hidden' }}>
      <div className="marquee-track" style={{ gap: 20, alignItems: 'stretch' }}>
        {doubled.map((f, i) => (
          <div key={i} style={{ width: 300, flexShrink: 0 }}>
            <div style={{
              height: '100%', borderRadius: 22, padding: '24px 22px',
              display: 'flex', flexDirection: 'column', gap: 16,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              backdropFilter: 'blur(12px)',
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Mini top line */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${f.color}50, transparent)` }} />
              <div style={{ width: 40, height: 40, borderRadius: 12, background: `${f.color}18`, border: `1px solid ${f.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <f.Icon style={{ width: 18, height: 18, color: f.color }} strokeWidth={1.75} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', marginBottom: 8 }}>{f.heading}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>{f.body}</div>
              </div>
              <div aria-hidden="true" style={{ position: 'absolute', top: 12, right: 14, fontSize: 48, fontWeight: 900, color: `${f.color}08`, lineHeight: 1 }}>{f.num}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Main component ─────────────────────────────────────────────── */
const WhyFinodiv: React.FC = () => {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      style={{
        background: 'linear-gradient(180deg, #060b16 0%, #0a0f1e 100%)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: 'clamp(64px, 8vw, 96px) 0',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Background grid */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize: '80px 80px', pointerEvents: 'none' }} />

      {/* Ambient glows */}
      <div aria-hidden="true" style={{ position: 'absolute', top: 0, right: '10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(129,140,248,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div aria-hidden="true" style={{ position: 'absolute', bottom: 0, left: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(52,211,153,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div ref={ref} style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(16px, 5vw, 48px)', position: 'relative' }}>

        {/* Cinematic header */}
        <div style={{ textAlign: 'center', marginBottom: 80 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: -10 }}
            animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ marginBottom: 24 }}
          >
            <span style={{
              display: 'inline-block', padding: '6px 18px', borderRadius: 999,
              background: 'rgba(129,140,248,0.12)', border: '1px solid rgba(129,140,248,0.3)',
              fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase',
              color: '#818cf8',
            }}>
              Why Choose Us
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.2rem)',
              fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1,
              color: '#fff', marginBottom: 20,
            }}
          >
            Education that{' '}
            <span style={{
              background: 'linear-gradient(135deg, #818cf8, #a78bfa, #38bdf8)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              pays for itself
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.18 }}
            style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}
          >
            Six reasons FINODIV students consistently outperform self-taught traders and earners.
          </motion.p>
        </div>

        {/* Feature cards — alternating cinematic reveal */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 20,
        }}>
          {FEATURES.map((f, i) => (
            <FeatureCard
              key={f.heading}
              feature={f}
              delay={i * 0.1}
              inView={inView}
              fromLeft={i % 2 === 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyFinodiv;
