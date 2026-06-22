import React from 'react';

const NAV_LINKS = [
  { label: 'Courses',   href: '#courses'  },
  { label: 'Community', href: '#community' },
  { label: 'About',     href: '#about'    },
  { label: 'Contact',   href: '#contact'  },
  { label: 'Privacy',   href: '#privacy'  },
  { label: 'Terms',     href: '#terms'    },
];

const SOCIALS = [
  {
    label: 'Twitter / X',
    href: '#',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: 'Telegram',
    href: '#',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: '#',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
];

const Logo: React.FC = () => (
  <svg width="32" height="32" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="fg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%"   stopColor="#7C3AED" />
        <stop offset="100%" stopColor="#3B82F6" />
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="28" fill="url(#fg)" />
    <ellipse cx="54" cy="36" rx="22" ry="9" fill="white" transform="rotate(-35 54 36)" />
    <ellipse cx="47" cy="53" rx="17" ry="7" fill="white" transform="rotate(-35 47 53)" />
    <ellipse cx="40" cy="68" rx="11" ry="4.5" fill="white" transform="rotate(-35 40 68)" />
  </svg>
);

const LandingFooter: React.FC = () => (
  <footer
    className="px-6 py-16"
    style={{
      backgroundColor: 'var(--color-bg-deep)',
      borderTop: '1px solid var(--color-border)',
    }}
  >
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-10 mb-12">

        {/* Brand */}
        <div className="flex flex-col gap-4 max-w-xs">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="text-lg font-semibold tracking-widest" style={{ color: 'var(--color-text-primary)' }}>
              FINODIV
            </span>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            Africa's premium financial education platform. Learn, earn, and build lasting wealth.
          </p>
          <div className="flex items-center gap-4 mt-1">
            {SOCIALS.map(({ label, href, icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-accent rounded"
                style={{ color: 'var(--color-text-muted)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-primary)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}
              >
                {icon}
              </a>
            ))}
          </div>
        </div>

        {/* Nav links */}
        <nav aria-label="Footer navigation">
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-x-12 gap-y-3">
            {NAV_LINKS.map(({ label, href }) => (
              <li key={label}>
                <a
                  href={href}
                  className="text-sm transition-colors duration-150"
                  style={{ color: 'var(--color-text-muted)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-primary)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div
        className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs"
        style={{ borderTop: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
      >
        <span>© 2026 FINODIV. All rights reserved.</span>
        <span>Built for Africa. Priced for Africa.</span>
      </div>
    </div>
  </footer>
);

export default LandingFooter;
