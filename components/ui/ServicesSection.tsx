import React, { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Globe, Layers, FileCode2, Coins, Zap, PenTool, ArrowRight,
} from 'lucide-react';

const SERVICES = [
  { icon: Globe,     title: 'Landing Pages',           desc: 'High-converting pages with modern design and lightning-fast performance.', color: '#38bdf8', glow: 'rgba(56,189,248,0.18)'  },
  { icon: Layers,    title: 'Full-Stack Web Apps',      desc: 'Scalable SaaS platforms and data-rich applications from design to deployment.', color: '#818cf8', glow: 'rgba(129,140,248,0.18)' },
  { icon: FileCode2, title: 'Smart Contract Dev',       desc: 'Production-grade Solidity for DeFi, ERC-20/721/1155 and custom on-chain logic.', color: '#34d399', glow: 'rgba(52,211,153,0.18)'  },
  { icon: Coins,     title: 'Tokenomics',               desc: 'Token economic design — supply models, incentive structures, and distribution strategy.', color: '#fbbf24', glow: 'rgba(251,191,36,0.18)'  },
  { icon: Zap,       title: 'DeFi Protocol Integration',desc: 'Uniswap, Aave, Compound — production-ready hooks for every major protocol.', color: '#a78bfa', glow: 'rgba(167,139,250,0.18)'  },
  { icon: PenTool,   title: 'NFT Marketplace Build',    desc: 'Custom minting platforms with secondary sales, royalties and on-chain provenance.', color: '#f472b6', glow: 'rgba(244,114,182,0.18)' },
];

/* ── Ultra-modern service card ──────────────────────────────────── */
const ServiceCard: React.FC<{
  icon: React.ElementType; title: string; desc: string; color: string; glow: string;
}> = ({ icon: Icon, title, desc, color, glow }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 260,
        flexShrink: 0,
        borderRadius: 22,
        padding: '28px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
        background: hovered
          ? `linear-gradient(145deg, ${glow}, rgba(255,255,255,0.01))`
          : 'rgba(255,255,255,0.03)',
        border: `1px solid ${hovered ? color + '50' : 'rgba(255,255,255,0.07)'}`,
        boxShadow: hovered ? `0 0 32px ${glow}, 0 8px 32px rgba(0,0,0,0.3)` : '0 4px 16px rgba(0,0,0,0.2)',
        transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Top gradient line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: `linear-gradient(90deg, transparent, ${color}80, transparent)`,
        opacity: hovered ? 1 : 0,
        transition: 'opacity 0.3s',
      }} />

      {/* Corner glow */}
      <div style={{
        position: 'absolute', top: -30, right: -30, width: 80, height: 80,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color}30, transparent 70%)`,
        opacity: hovered ? 1 : 0,
        transition: 'opacity 0.35s',
      }} />

      {/* Icon */}
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: `${color}18`,
        border: `1px solid ${color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        transform: hovered ? 'scale(1.08) rotate(-3deg)' : 'scale(1) rotate(0deg)',
        transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        boxShadow: hovered ? `0 0 20px ${color}40` : 'none',
      }}>
        <Icon style={{ width: 22, height: 22, color }} strokeWidth={1.75} />
      </div>

      <div>
        <h3 style={{
          fontSize: 14, fontWeight: 700, color: '#fff',
          marginBottom: 8, lineHeight: 1.3,
          transform: hovered ? 'translateY(-1px)' : 'translateY(0)',
          transition: 'transform 0.25s',
        }}>
          {title}
        </h3>
        <p style={{ fontSize: 12, lineHeight: 1.6, color: 'rgba(255,255,255,0.45)' }}>
          {desc}
        </p>
      </div>

      {/* Arrow */}
      <div style={{
        position: 'absolute', bottom: 20, right: 20,
        opacity: hovered ? 1 : 0,
        transform: hovered ? 'translate(0,0)' : 'translate(4px,4px)',
        transition: 'all 0.25s',
      }}>
        <ArrowRight style={{ width: 14, height: 14, color }} />
      </div>
    </div>
  );
};

/* ── Marquee row ────────────────────────────────────────────────── */
const MarqueeRow: React.FC<{ items: typeof SERVICES }> = ({ items }) => {
  const doubled = [...items, ...items];
  return (
    <div className="marquee-container" style={{ overflow: 'hidden', paddingBottom: 4 }}>
      <div className="marquee-track" style={{ gap: 16 }}>
        {doubled.map((s, i) => <ServiceCard key={i} {...s} />)}
      </div>
    </div>
  );
};

/* ── Main component ─────────────────────────────────────────────── */
const ServicesSection: React.FC = () => {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section
      ref={ref}
      style={{
        background: 'linear-gradient(180deg, #060b16 0%, #07101e 50%, #060b16 100%)',
        padding: 'clamp(64px, 8vw, 96px) 0',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Background ambient glows */}
      <div aria-hidden="true" style={{ position: 'absolute', top: '10%', left: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,189,248,0.05) 0%, transparent 60%)', pointerEvents: 'none' }} />
      <div aria-hidden="true" style={{ position: 'absolute', bottom: '10%', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.05) 0%, transparent 60%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(16px, 5vw, 48px)', position: 'relative' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ textAlign: 'center', marginBottom: 72 }}
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              display: 'inline-block',
              padding: '5px 16px', borderRadius: 999,
              background: 'rgba(47,109,242,0.12)',
              border: '1px solid rgba(47,109,242,0.25)',
              fontSize: 10, fontWeight: 800, letterSpacing: '0.18em',
              textTransform: 'uppercase', color: '#60a5fa', marginBottom: 20,
            }}
          >
            Our Services
          </motion.span>

          <h2 style={{
            fontSize: 'clamp(2rem, 5vw, 3.4rem)',
            fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.05,
            color: '#fff', marginBottom: 20,
          }}>
            We Build.{' '}
            <span style={{
              background: 'linear-gradient(135deg, #38bdf8, #818cf8, #a78bfa)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              You Grow.
            </span>
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.45)', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
            From polished web experiences to production-ready Web3 protocols — our team ships at every layer of the stack.
          </p>
        </motion.div>
      </div>

      {/* ── Services marquee ── */}
      <div style={{ marginBottom: 72 }}>
        <div style={{ paddingLeft: 'clamp(16px, 5vw, 48px)' }}>
          <MarqueeRow items={SERVICES} />
        </div>
      </div>

      {/* CTA banner */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(16px, 5vw, 48px)' }}>
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
          style={{
            background: 'linear-gradient(135deg, rgba(56,189,248,0.08) 0%, rgba(167,139,250,0.08) 100%)',
            border: '1px solid rgba(56,189,248,0.18)',
            borderRadius: 28,
            padding: 'clamp(28px, 4vw, 48px) clamp(24px, 4vw, 48px)',
            display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 24,
            backdropFilter: 'blur(12px)',
            position: 'relative', overflow: 'hidden',
          }}
        >
          {/* Ambient glow inside */}
          <div aria-hidden="true" style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div>
            <h3 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', fontWeight: 900, color: '#fff', marginBottom: 6 }}>
              Ready to ship your next project?
            </h3>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)' }}>
              Get a free consultation — from MVP to production in weeks, not months.
            </p>
          </div>
          <a
            href="mailto:devolufinodiv@gmail.com"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '14px 28px', borderRadius: 14,
              background: 'linear-gradient(135deg, #2F6DF2, #7C3AED)',
              color: '#fff', fontWeight: 700, fontSize: 14,
              textDecoration: 'none',
              boxShadow: '0 8px 32px rgba(47,109,242,0.35)',
              transition: 'all 0.25s', whiteSpace: 'nowrap',
              position: 'relative', zIndex: 1,
            }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-2px)'; el.style.boxShadow = '0 14px 40px rgba(47,109,242,0.5)'; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(0)'; el.style.boxShadow = '0 8px 32px rgba(47,109,242,0.35)'; }}
          >
            Get a Free Quote <ArrowRight style={{ width: 15, height: 15 }} />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesSection;
