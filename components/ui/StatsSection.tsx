import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import AnimatedCounter from './AnimatedCounter';

const STATS = [
  { target: 12400, suffix: '+', label: 'Students enrolled'    },
  { target: 34,    suffix: '',  label: 'Courses published'     },
  { target: 91,    suffix: '%', label: 'Course completion rate' },
];

const TestimonialCard: React.FC<{
  quote: string; name: string; city: string; delay: number; inView: boolean;
}> = ({ quote, name, city, delay, inView }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={inView ? { opacity: 1, y: 0 } : {}}
    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay }}
    className="flex-none w-80 sm:w-auto rounded-[16px] p-6 flex flex-col gap-4"
    style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
  >
    {/* Stars */}
    <div className="flex gap-1" aria-label="5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 16 16" fill="#2F6DF2" aria-hidden="true">
          <path d="M8 1l1.9 4 4.4.6-3.2 3.1.8 4.4L8 11l-3.9 2.1.8-4.4L1.7 5.6l4.4-.6z" />
        </svg>
      ))}
    </div>
    <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>"{quote}"</p>
    <div>
      <div className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{name}</div>
      <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{city}</div>
    </div>
  </motion.div>
);

const TESTIMONIALS = [
  {
    quote: "I went from knowing nothing about forex to making consistent profits within 3 months. The Naija Starter Guide explained everything in pidgin-friendly English.",
    name: 'Chukwuemeka O.',
    city: 'Lagos, Nigeria',
  },
  {
    quote: "The DeFi course changed how I think about money. I've since moved ₦800k into yield-bearing protocols. This is the best ₦22k I ever spent.",
    name: 'Amina B.',
    city: 'Kano, Nigeria',
  },
  {
    quote: "I now earn $2,400/month from international clients. The freelancing module showed me exactly which platforms to use and how to get paid without losing money to exchange rates.",
    name: 'Tunde A.',
    city: 'Ibadan, Nigeria',
  },
];

const StatsSection: React.FC = () => {
  const statsRef       = useRef<HTMLDivElement>(null);
  const testimonialRef = useRef<HTMLDivElement>(null);
  const statsInView    = useInView(statsRef,       { once: true, margin: '-80px' });
  const testInView     = useInView(testimonialRef, { once: true, margin: '-80px' });

  return (
    <>
      {/* Stats */}
      <section
        ref={statsRef}
        className="py-20 px-6"
        style={{
          backgroundColor: 'var(--color-bg-deep)',
          borderTop: '1px solid var(--color-border)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 sm:gap-16">
          {STATS.map(({ target, suffix, label }) => (
            <AnimatedCounter key={label} target={target} suffix={suffix} label={label} duration={1800} />
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section ref={testimonialRef} className="py-24 px-6" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="eyebrow mb-3">Student results</p>
            <h2
              className="text-3xl sm:text-4xl font-semibold tracking-tight"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Real stories, real returns
            </h2>
          </div>

          <div className="hidden sm:grid sm:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <TestimonialCard key={t.name} {...t} delay={i * 0.1} inView={testInView} />
            ))}
          </div>

          <div
            className="sm:hidden flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 custom-scrollbar"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {TESTIMONIALS.map((t, i) => (
              <TestimonialCard key={t.name} {...t} delay={i * 0.1} inView={testInView} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default StatsSection;
