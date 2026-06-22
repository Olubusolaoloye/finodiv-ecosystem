import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ShieldCheck, Globe, TrendingUp } from 'lucide-react';

const FEATURES = [
  {
    Icon: Globe,
    heading: 'Built for African realities',
    body: 'Courses priced in Naira, taught with local context — not recycled Western theory.',
  },
  {
    Icon: ShieldCheck,
    heading: 'Verified instructors',
    body: 'Every course is reviewed by our expert team before it ever reaches a student.',
  },
  {
    Icon: TrendingUp,
    heading: 'Actionable, not academic',
    body: 'You finish each module with something you can do today — a trade, a setup, a client.',
  },
];

const WhyFinodiv: React.FC = () => {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      ref={ref}
      className="py-24 px-6"
      style={{
        backgroundColor: 'var(--color-bg-deep)',
        borderTop: '1px solid var(--color-border)',
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="eyebrow mb-3">Why choose us</p>
          <h2
            className="text-3xl sm:text-4xl font-semibold tracking-tight"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Education that pays for itself
          </h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {FEATURES.map(({ Icon, heading, body }, i) => (
            <motion.div
              key={heading}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 }}
              className="rounded-[16px] p-7 flex flex-col gap-4"
              style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
            >
              <div
                className="w-10 h-10 rounded-[10px] flex items-center justify-center"
                style={{ backgroundColor: 'rgba(47,109,242,0.12)' }}
              >
                <Icon
                  className="w-5 h-5"
                  style={{ color: 'var(--color-accent)' }}
                  aria-hidden="true"
                  strokeWidth={1.75}
                />
              </div>
              <h3 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {heading}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                {body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyFinodiv;
