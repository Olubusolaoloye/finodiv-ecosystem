import React from 'react';
import { motion } from 'framer-motion';
import AmbientGrid from './AmbientGrid';

const fadeUp = (delay: number) => ({
  initial:   { opacity: 0, y: 24 },
  animate:   { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay },
});

interface HeroSectionProps {
  onStartLearning?: () => void;
  onExploreCourses?: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onStartLearning, onExploreCourses }) => {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: 'var(--color-bg-deep)' }}
    >
      <AmbientGrid cellSize={48} speed={28} />

      {/* Radial glow */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(47,109,242,0.10) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-32 text-center">

        <motion.div {...fadeUp(0)}>
          <span className="eyebrow inline-flex items-center gap-2 mb-8">
            <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-accent)' }} />
            Africa's #1 Financial Education Platform
          </span>
        </motion.div>

        <motion.h1
          {...fadeUp(0.08)}
          className="text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight leading-[1.08] mb-6"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Learn to build{' '}
          <span
            className="font-semibold"
            style={{
              background: 'linear-gradient(135deg, #7C3AED, #3B82F6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            real wealth
          </span>
          <br />
          in any economy.
        </motion.h1>

        <motion.p
          {...fadeUp(0.16)}
          className="text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto mb-12"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Master forex, crypto, DeFi, and digital income skills — taught in plain language,
          built for Nigerians and Africans ready to take control of their financial future.
        </motion.p>

        <motion.div
          {...fadeUp(0.24)}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={onStartLearning}
            className="w-full sm:w-auto px-8 py-4 rounded-[10px] font-semibold text-white text-base transition-all duration-200"
            style={{ backgroundColor: 'var(--color-accent)' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-accent-hover)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--color-accent)')}
          >
            Start Learning Free
          </button>
          <button
            onClick={onExploreCourses}
            className="w-full sm:w-auto px-8 py-4 rounded-[10px] font-semibold text-base transition-all duration-200"
            style={{
              color: 'var(--color-text-primary)',
              border: '1.5px solid var(--color-accent)',
              backgroundColor: 'transparent',
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(47,109,242,0.10)'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            Explore Courses
          </button>
        </motion.div>

        <motion.div
          {...fadeUp(0.32)}
          className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12"
        >
          {[
            { value: '12,400+', label: 'Students enrolled' },
            { value: '34',      label: 'Courses published' },
            { value: '91%',     label: 'Completion rate' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>{value}</div>
              <div className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, var(--color-bg-primary))' }}
      />
    </section>
  );
};

export default HeroSection;
