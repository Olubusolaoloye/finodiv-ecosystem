import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Send } from 'lucide-react';

const NAV_COLUMNS = [
  {
    heading: 'Learn',
    color: '#38bdf8',
    links: [
      { label: 'All Courses',      href: '/courses' },
      { label: 'Web3 & Blockchain',href: '/courses' },
      { label: 'Freelancing',      href: '/courses' },
      { label: 'Digital Marketing',href: '/courses' },
      { label: 'Web Development',  href: '/courses' },
    ],
  },
  {
    heading: 'Company',
    color: '#a78bfa',
    links: [
      { label: 'About FINODIV', href: '#about'   },
      { label: 'Careers',       href: '#careers'  },
      { label: 'Blog',          href: '#blog'     },
      { label: 'Press Kit',     href: '#press'    },
      { label: 'Contact',       href: '#contact'  },
    ],
  },
  {
    heading: 'Legal',
    color: '#34d399',
    links: [
      { label: 'Privacy Policy',   href: '#privacy' },
      { label: 'Terms of Service', href: '#terms'   },
      { label: 'Refund Policy',    href: '#refund'  },
    ],
  },
];

const SOCIALS = [
  {
    label: 'Twitter / X',
    href: '#',
    color: '#38bdf8',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: 'Telegram',
    href: '#',
    color: '#a78bfa',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: '#',
    color: '#f472b6',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: '#',
    color: '#fbbf24',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
];

const FLogo: React.FC = () => (
  <svg width="36" height="36" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="fg-footer" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#7C3AED" />
        <stop offset="100%" stopColor="#3B82F6" />
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="28" fill="url(#fg-footer)" />
    <ellipse cx="54" cy="36" rx="22" ry="9" fill="white" transform="rotate(-35 54 36)" />
    <ellipse cx="47" cy="53" rx="17" ry="7" fill="white" transform="rotate(-35 47 53)" />
    <ellipse cx="40" cy="68" rx="11" ry="4.5" fill="white" transform="rotate(-35 40 68)" />
  </svg>
);

const LandingFooter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) { setSubmitted(true); }
  };

  return (
    <footer
      ref={ref}
      style={{
        background: 'linear-gradient(180deg, #0a0f1e 0%, #060b16 40%, #040810 100%)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background grid */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)',
        backgroundSize: '72px 72px',
        pointerEvents: 'none',
      }} />

      {/* Ambient glows */}
      <div aria-hidden="true" style={{ position: 'absolute', top: 0, left: '15%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div aria-hidden="true" style={{ position: 'absolute', bottom: 0, right: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,189,248,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* ── Newsletter strip ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: 'clamp(40px, 6vw, 64px) clamp(16px, 5vw, 48px)',
          position: 'relative',
        }}
      >
        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
          {/* Badge */}
          <span style={{
            display: 'inline-block', padding: '5px 16px', borderRadius: 999,
            background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)',
            fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase',
            color: '#a78bfa', marginBottom: 20,
          }}>
            Stay in the loop
          </span>

          <h3 style={{
            fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)',
            fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.15,
            color: '#fff', marginBottom: 12,
          }}>
            Get free{' '}
            <span style={{
              background: 'linear-gradient(135deg, #7C3AED, #a78bfa, #38bdf8)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              skill insights
            </span>{' '}
            weekly
          </h3>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', marginBottom: 32, lineHeight: 1.6 }}>
            New course drops, Web3 trends, freelance tips, and exclusive early access — straight to your inbox.
          </p>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '14px 28px', borderRadius: 14,
                background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)',
                color: '#34d399', fontWeight: 700, fontSize: 14,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20,6 9,17 4,12" /></svg>
              You're on the list!
            </motion.div>
          ) : (
            <form
              onSubmit={handleSubmit}
              style={{ display: 'flex', gap: 8, maxWidth: 460, margin: '0 auto', flexWrap: 'wrap' }}
            >
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                style={{
                  flex: 1, minWidth: 200, padding: '13px 18px',
                  borderRadius: 12, fontSize: 14, outline: 'none',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#fff',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(124,58,237,0.5)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
              />
              <button
                type="submit"
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '13px 22px', borderRadius: 12,
                  background: 'linear-gradient(135deg, #7C3AED, #3B82F6)',
                  color: '#fff', fontWeight: 700, fontSize: 14,
                  border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                  boxShadow: '0 4px 20px rgba(124,58,237,0.35)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(124,58,237,0.5)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(124,58,237,0.35)';
                }}
              >
                Subscribe <Send style={{ width: 14, height: 14 }} />
              </button>
            </form>
          )}
        </div>
      </motion.div>

      {/* ── Main footer body ─────────────────────────────────────────── */}
      <div style={{ padding: 'clamp(48px, 7vw, 72px) clamp(16px, 5vw, 48px) 0', position: 'relative' }}>
        <div className="footer-grid" style={{ maxWidth: 1200, margin: '0 auto' }}>

          {/* Brand column */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <FLogo />
              <span style={{
                fontSize: 18, fontWeight: 900, letterSpacing: '0.06em',
                background: 'linear-gradient(135deg, #fff, rgba(255,255,255,0.7))',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                FINODIV
              </span>
            </div>

            <p style={{ fontSize: 13, lineHeight: 1.7, color: 'rgba(255,255,255,0.35)', maxWidth: 240 }}>
              Africa's premier digital skill platform. Learn Web3, freelancing, and in-demand digital skills — priced for Africa.
            </p>

            {/* Social icons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
              {SOCIALS.map(({ label, href, icon, color }) => (
                <SocialIcon key={label} label={label} href={href} icon={icon} color={color} />
              ))}
            </div>

            {/* Trust badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 4,
              padding: '8px 14px', borderRadius: 10,
              background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#34d399', letterSpacing: '0.04em' }}>
                12,400+ learners enrolled
              </span>
            </div>
          </motion.div>

          {/* Nav columns */}
          {NAV_COLUMNS.map(({ heading, links, color }, ci) => (
            <motion.div
              key={heading}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15 + ci * 0.08 }}
            >
              <p style={{
                fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.16em',
                color, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ display: 'inline-block', width: 16, height: 1, background: color, opacity: 0.5 }} />
                {heading}
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      to={href}
                      style={{
                        fontSize: 13, color: 'rgba(255,255,255,0.35)',
                        textDecoration: 'none', transition: 'color 0.2s',
                        display: 'flex', alignItems: 'center', gap: 6,
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.color = '#fff';
                        const arrow = e.currentTarget.querySelector('svg') as SVGElement | null;
                        if (arrow) arrow.style.opacity = '1';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.35)';
                        const arrow = e.currentTarget.querySelector('svg') as SVGElement | null;
                        if (arrow) arrow.style.opacity = '0';
                      }}
                    >
                      {label}
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ opacity: 0, transition: 'opacity 0.2s', flexShrink: 0 }}>
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* ── Bottom bar ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={{
            maxWidth: 1200, margin: '0 auto',
            paddingTop: 28, paddingBottom: 28,
            marginTop: 48,
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 16, flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.04em' }}>
            © 2026 FINODIV. All rights reserved.
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.15)' }}>Built for Africa</span>
            <span style={{ fontSize: 14 }}>🇳🇬</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.08)', margin: '0 4px' }}>·</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.15)' }}>Priced for Africa</span>
          </div>
        </motion.div>
      </div>

      <style>{`
        .footer-grid {
          display: grid;
          grid-template-columns: minmax(220px, 1.4fr) repeat(3, minmax(100px, 1fr));
          gap: 48px;
        }
        @media (max-width: 900px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (max-width: 520px) {
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }
        }
      `}</style>
    </footer>
  );
};

/* ── Social icon with glow hover ────────────────────────────────── */
const SocialIcon: React.FC<{ label: string; href: string; icon: React.ReactNode; color: string }> = ({
  label, href, icon, color,
}) => {
  const [hov, setHov] = useState(false);
  return (
    <a
      href={href}
      aria-label={label}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 38, height: 38, borderRadius: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        textDecoration: 'none', transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
        background: hov ? `${color}18` : 'rgba(255,255,255,0.04)',
        border: `1px solid ${hov ? color + '40' : 'rgba(255,255,255,0.08)'}`,
        color: hov ? color : 'rgba(255,255,255,0.35)',
        boxShadow: hov ? `0 0 20px ${color}25` : 'none',
        transform: hov ? 'translateY(-2px)' : 'translateY(0)',
      }}
    >
      {icon}
    </a>
  );
};

export default LandingFooter;
