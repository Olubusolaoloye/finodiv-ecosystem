import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight, TrendingUp, Shield, Award, Users, Compass,
  BookOpen, Play, GraduationCap,
} from 'lucide-react';

interface HeroSectionProps {
  onStartLearning?: () => void;
  onExploreCourses?: () => void;
}

const OrbIcon: React.FC<{
  icon: React.ReactNode; label: string; angle: number; radius: number;
  delay: number; color: string; bg: string;
}> = ({ icon, label, angle, radius, delay, color, bg }) => {
  const rad = (angle * Math.PI) / 180;
  const x   = Math.cos(rad) * radius;
  const y   = Math.sin(rad) * radius;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
      style={{
        position: 'absolute',
        left: `calc(50% + ${x}px)`,
        top:  `calc(50% + ${y}px)`,
        transform: 'translate(-50%, -50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        zIndex: 2,
      }}
    >
      <motion.div
        animate={{ y: [0, -7, 0] }}
        transition={{ duration: 3.5 + delay * 0.4, repeat: Infinity, ease: 'easeInOut', delay: delay * 0.3 }}
        style={{
          width: 52, height: 52, borderRadius: '50%',
          background: bg,
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.28)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color, boxShadow: `0 8px 28px ${color}44`,
        }}
      >
        {icon}
      </motion.div>
      <span style={{
        fontSize: 9, fontWeight: 800,
        color: 'rgba(255,255,255,0.55)',
        textTransform: 'uppercase', letterSpacing: '0.1em',
        whiteSpace: 'nowrap',
      }}>
        {label}
      </span>
    </motion.div>
  );
};

const HeroSection: React.FC<HeroSectionProps> = ({ onStartLearning, onExploreCourses }) => {
  const ORBIT_ICONS = [
    { icon: <TrendingUp size={20} />, label: 'Forex',      angle: -90, radius: 185, delay: 0.65, color: '#34d399', bg: 'rgba(52,211,153,0.22)'  },
    { icon: <Shield size={20} />,     label: 'DeFi',       angle: -30, radius: 185, delay: 0.75, color: '#60a5fa', bg: 'rgba(96,165,250,0.22)'  },
    { icon: <Award size={20} />,      label: 'Certs',      angle: 30,  radius: 185, delay: 0.85, color: '#fbbf24', bg: 'rgba(251,191,36,0.22)'  },
    { icon: <Users size={20} />,      label: 'Community',  angle: 90,  radius: 185, delay: 0.95, color: '#f472b6', bg: 'rgba(244,114,182,0.22)' },
    { icon: <Compass size={20} />,    label: 'Career',     angle: 150, radius: 185, delay: 1.05, color: '#a78bfa', bg: 'rgba(167,139,250,0.22)' },
    { icon: <BookOpen size={20} />,   label: 'Courses',    angle: 210, radius: 185, delay: 1.15, color: '#34d399', bg: 'rgba(52,211,153,0.22)'  },
  ];

  return (
    <section style={{
      background: 'linear-gradient(140deg, #1a0b3d 0%, #2d1872 35%, #1e3a9a 68%, #0d3a88 100%)',
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Dot-grid texture */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
        backgroundSize: '38px 38px',
      }} />

      {/* Ambient orbs */}
      <motion.div aria-hidden="true"
        animate={{ opacity: [0.3, 0.55, 0.3], scale: [1, 1.18, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', top: '15%', right: '10%', width: 520, height: 520, background: 'radial-gradient(circle, rgba(167,139,250,0.28) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }}
      />
      <motion.div aria-hidden="true"
        animate={{ opacity: [0.2, 0.38, 0.2], scale: [1, 1.2, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', top: '5%', left: '5%', width: 420, height: 420, background: 'radial-gradient(circle, rgba(96,165,250,0.22) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }}
      />

      {/* Content grid */}
      <div className="relative z-10" style={{
        maxWidth: 1280, margin: '0 auto',
        padding: 'clamp(110px, 13vw, 150px) clamp(24px, 4vw, 64px) clamp(150px, 18vw, 210px)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 56,
        alignItems: 'center',
      }}>

        {/* ── LEFT: Text ── */}
        <div>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ marginBottom: 32 }}
          >
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '7px 16px', borderRadius: 999,
              border: '1px solid rgba(255,255,255,0.25)',
              background: 'rgba(255,255,255,0.07)',
            }}>
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ width: 7, height: 7, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 9px #34d399', display: 'block', flexShrink: 0 }}
              />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)' }}>
                Africa's #1 Digital Skills Platform
              </span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 44 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            style={{
              fontSize: 'clamp(2.8rem, 5.8vw, 5.2rem)',
              fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.0,
              color: '#fff', marginBottom: 24,
            }}
          >
            Learn Skills.<br />
            <span style={{ color: '#c4b5fd' }}>Build Your Future.</span>
          </motion.h1>

          {/* Feature bullets */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            style={{ marginBottom: 40 }}
          >
            {[
              'Project-based Web3 & digital skills training',
              'Earn on-chain certificates employers trust',
              'Community of 12,400+ African builders & creators',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 13 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#c4b5fd', flexShrink: 0, boxShadow: '0 0 9px rgba(196,181,253,0.65)' }} />
                <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.72)', lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 52 }}
          >
            <button
              onClick={onStartLearning}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '14px 30px', borderRadius: 14,
                background: '#fff', color: '#1e0b5e',
                fontWeight: 800, fontSize: 15, border: 'none', cursor: 'pointer',
                boxShadow: '0 8px 30px rgba(0,0,0,0.28)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-2px)'; el.style.boxShadow = '0 14px 38px rgba(0,0,0,0.38)'; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(0)'; el.style.boxShadow = '0 8px 30px rgba(0,0,0,0.28)'; }}
            >
              Start Learning Free <ArrowRight style={{ width: 16, height: 16 }} />
            </button>
            <button
              onClick={onExploreCourses}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '14px 30px', borderRadius: 14,
                background: 'rgba(255,255,255,0.10)', color: '#fff',
                border: '1.5px solid rgba(255,255,255,0.28)',
                fontWeight: 600, fontSize: 15, cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.18)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.10)'; }}
            >
              <Play style={{ width: 14, height: 14 }} /> Explore Courses
            </button>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.6 }}
            style={{ display: 'flex', gap: 36, flexWrap: 'wrap' }}
          >
            {[
              { value: '12,400+', label: 'Students' },
              { value: '34',      label: 'Courses'  },
              { value: '91%',     label: 'Completion' },
            ].map(({ value, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 + i * 0.07, duration: 0.5 }}
              >
                <div style={{ fontSize: 'clamp(1.3rem, 2.5vw, 1.75rem)', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.48)', marginTop: 3, fontWeight: 600, letterSpacing: '0.05em' }}>{label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* ── RIGHT: Glowing Orb ── */}
        <div
          className="hidden md:flex"
          style={{ position: 'relative', alignItems: 'center', justifyContent: 'center', minHeight: 450 }}
        >
          {/* Central orb */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
            style={{ position: 'relative', zIndex: 1 }}
          >
            {/* Outer rotating ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
              style={{ position: 'absolute', inset: -24, borderRadius: '50%', border: '1px dashed rgba(196,181,253,0.35)' }}
            />
            {/* Middle counter-rotating ring */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 34, repeat: Infinity, ease: 'linear' }}
              style={{ position: 'absolute', inset: -48, borderRadius: '50%', border: '1px dashed rgba(96,165,250,0.22)' }}
            />
            {/* Main orb */}
            <motion.div
              animate={{ boxShadow: [
                '0 0 80px rgba(124,58,237,0.5), 0 0 160px rgba(79,70,229,0.28), inset 0 0 60px rgba(196,181,253,0.12)',
                '0 0 100px rgba(124,58,237,0.7), 0 0 200px rgba(79,70,229,0.4), inset 0 0 70px rgba(196,181,253,0.18)',
                '0 0 80px rgba(124,58,237,0.5), 0 0 160px rgba(79,70,229,0.28), inset 0 0 60px rgba(196,181,253,0.12)',
              ] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                width: 200, height: 200, borderRadius: '50%',
                background: 'radial-gradient(circle at 35% 35%, rgba(196,181,253,0.55) 0%, rgba(79,70,229,0.3) 50%, rgba(30,27,75,0.85) 100%)',
                border: '2px solid rgba(196,181,253,0.45)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <GraduationCap style={{ width: 68, height: 68, color: '#c4b5fd' }} strokeWidth={1.2} />
            </motion.div>
          </motion.div>

          {/* Orbit icons */}
          {ORBIT_ICONS.map((item, i) => <OrbIcon key={i} {...item} />)}
        </div>
      </div>

      {/* Wave separator */}
      <div aria-hidden="true" style={{ position: 'absolute', bottom: -1, left: 0, right: 0, lineHeight: 0 }}>
        <svg viewBox="0 0 1440 110" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: 110 }}>
          <path d="M0,50 C240,110 480,5 720,55 C960,105 1200,15 1440,55 L1440,110 L0,110 Z" fill="var(--color-bg-primary)" />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
