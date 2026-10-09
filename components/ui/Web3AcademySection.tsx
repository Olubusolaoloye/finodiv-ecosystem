import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { BookOpen, Layers, Zap, Star, Wifi, Shield, Download } from 'lucide-react';

const FEATURES = [
  { icon: BookOpen, label: '43 Lessons',          desc: '8 modules from blockchain basics to DeFi & NFTs',       color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
  { icon: Layers,   label: '100 Flashcards',      desc: 'Plain-language definitions with real-world examples',    color: '#60a5fa', bg: 'rgba(96,165,250,0.12)'  },
  { icon: Star,     label: '43 Blockchain Nets',  desc: 'Every major chain plus the apps built on them',          color: '#34d399', bg: 'rgba(52,211,153,0.12)'  },
  { icon: Zap,      label: 'Daily Challenge',     desc: 'Module quizzes, daily quiz, XP, streaks & 19 badges',    color: '#fbbf24', bg: 'rgba(251,191,36,0.12)'  },
  { icon: Wifi,     label: 'Works Offline',       desc: 'Full functionality once loaded — no connection needed',  color: '#f472b6', bg: 'rgba(244,114,182,0.12)' },
  { icon: Shield,   label: 'No Account Needed',   desc: 'Progress stays privately on your device, no sign-up',   color: '#2F6DF2', bg: 'rgba(47,109,242,0.12)'  },
];

const STATS = [
  { val: '43',  label: 'Lessons'    },
  { val: '100', label: 'Flashcards' },
  { val: '43',  label: 'Chains'     },
  { val: '19',  label: 'Badges'     },
];

const Web3AcademySection: React.FC = () => {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  // Swap images on hover
  const [hovered, setHovered] = useState(false);

  return (
    <section
      ref={ref}
      style={{
        background: 'linear-gradient(160deg, #0f0a2e 0%, #0b0e14 50%, #0a0e1a 100%)',
        padding: '100px 24px',
        borderTop: '1px solid var(--color-border)',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Ambient glows */}
      <div aria-hidden="true" style={{ position: 'absolute', top: '-10%', right: '-5%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div aria-hidden="true" style={{ position: 'absolute', bottom: 0, left: '-5%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(47,109,242,0.08) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 64, alignItems: 'center' }}>

          {/* ── LEFT: Copy ── */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              style={{ marginBottom: 20 }}
            >
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '6px 14px', borderRadius: 999,
                background: 'rgba(124,58,237,0.1)',
                border: '1px solid rgba(124,58,237,0.3)',
                fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.16em',
                color: '#a78bfa',
              }}>
                <Download style={{ width: 12, height: 12 }} /> Available on Google Play
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: 0.07 }}
              style={{
                fontSize: 'clamp(2rem, 4vw, 3.2rem)',
                fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1,
                color: '#fff', marginBottom: 16,
              }}
            >
              Web3 Academy —{' '}
              <span style={{ background: 'linear-gradient(135deg, #a78bfa, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Learn Anywhere
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.13 }}
              style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 36, maxWidth: 480 }}
            >
              Short, focused lessons take you from total beginner to confidently fluent in blockchain, DeFi, and NFTs — right from your phone. No account needed, works offline, progress stays on your device.
            </motion.p>

            {/* Stats strip */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.18 }}
              style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 40, paddingBottom: 36, borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              {STATS.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.45, delay: 0.2 + i * 0.06 }}
                >
                  <div style={{ fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 3, fontWeight: 600, letterSpacing: '0.05em' }}>{s.label}</div>
                </motion.div>
              ))}
            </motion.div>

            {/* Features */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 44 }}>
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.25 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: f.bg, border: `1px solid ${f.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                    <f.icon style={{ width: 16, height: 16, color: f.color }} strokeWidth={1.75} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', marginBottom: 2 }}>{f.label}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{f.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.55 }}
              style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}
            >
              <a
                href="https://play.google.com/store"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  padding: '14px 24px', borderRadius: 14,
                  background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
                  color: '#fff', fontWeight: 800, fontSize: 14,
                  textDecoration: 'none',
                  boxShadow: '0 8px 32px rgba(124,58,237,0.35)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-2px)'; el.style.boxShadow = '0 14px 40px rgba(124,58,237,0.45)'; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(0)'; el.style.boxShadow = '0 8px 32px rgba(124,58,237,0.35)'; }}
              >
                {/* Play Store icon */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-1.55l1.679.97a1 1 0 010 1.746l-1.679.97L15.1 12l2.598-2.843zM5.864 2.658L16.8 8.99l-2.302 2.302-8.635-8.635z"/>
                </svg>
                Get on Google Play
              </a>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ display: 'flex', gap: 1 }}>
                  {[1,2,3,4,5].map(i => <span key={i} style={{ color: '#fbbf24', fontSize: 14 }}>★</span>)}
                </div>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Free · No account needed</span>
              </div>
            </motion.div>

            {/* Privacy link — only here, nowhere else */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.7 }}
              style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 20 }}
            >
              By downloading you agree to our{' '}
              <Link
                to="/web3academy/privacy"
                style={{ color: 'rgba(167,139,250,0.6)', textDecoration: 'none', fontWeight: 600 }}
                onMouseEnter={e => (e.currentTarget.style.color = '#a78bfa')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(167,139,250,0.6)')}
              >
                Privacy Policy
              </Link>
            </motion.p>
          </div>

          {/* ── RIGHT: Real mockup images ── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="hidden md:flex"
            style={{ position: 'relative', alignItems: 'center', justifyContent: 'center', minHeight: 480, cursor: 'pointer' }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            {/* Glow under images */}
            <div aria-hidden="true" style={{ position: 'absolute', bottom: -30, left: '50%', transform: 'translateX(-50%)', width: '70%', height: 40, background: 'rgba(124,58,237,0.4)', filter: 'blur(30px)', borderRadius: '50%' }} />

            {/* Secondary mockup — behind, offset left (swaps on hover) */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                left: -40,
                bottom: 0,
                zIndex: 1,
                filter: 'drop-shadow(0 24px 48px rgba(0,0,0,0.5))',
                opacity: 0.5,
                transition: 'opacity 0.35s ease',
              }}
            >
              <img
                src={hovered ? '/w3a-dark.png' : '/w3a-light.png'}
                alt="Web3 Academy alternate"
                style={{ width: 380, maxWidth: '100%', borderRadius: 20, display: 'block' }}
              />
            </motion.div>

            {/* Primary mockup — front (swaps on hover) */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              style={{
                position: 'relative',
                zIndex: 2,
                marginLeft: 60,
                filter: 'drop-shadow(0 32px 64px rgba(124,58,237,0.4))',
                transition: 'filter 0.35s ease',
              }}
            >
              <img
                src={hovered ? '/w3a-light.png' : '/w3a-dark.png'}
                alt={hovered ? 'Web3 Academy light mode' : 'Web3 Academy dark mode'}
                style={{ width: 440, maxWidth: '100%', borderRadius: 20, display: 'block', transition: 'opacity 0.35s ease' }}
              />
            </motion.div>

            {/* Floating badges */}
            {([
              { label: '🔥 5 day streak',    top: 30,  right: 10 },
              { label: '⚡ +10 XP',          top: 120, left: -10 },
              { label: '🏆 Badge Unlocked',  bottom: 100, right: 0 },
            ] as Array<{ label: string; top?: number; right?: number; left?: number; bottom?: number }>).map((b, i) => (
              <motion.div
                key={b.label}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.45, delay: 0.7 + i * 0.15 }}
                style={{
                  position: 'absolute',
                  top: b.top, right: b.right, left: b.left, bottom: b.bottom,
                  zIndex: 10,
                  background: 'rgba(15,10,46,0.88)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(167,139,250,0.3)',
                  borderRadius: 999,
                  padding: '8px 16px',
                  fontSize: 12, fontWeight: 800, color: '#fff',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                }}
              >
                {b.label}
              </motion.div>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Web3AcademySection;
