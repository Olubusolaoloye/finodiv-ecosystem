import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserRole } from '../types';
import { Search, Bell, Sun, Moon, Menu, Settings, LogOut, User, ChevronDown } from 'lucide-react';
import Logo from './Logo';

interface NavbarProps {
  role: UserRole;
  onLogout: () => void;
  walletAddress: string | null;
  onConnectWallet: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onToggleSidebar?: () => void;
  userId?: string | null;
  authEmail?: string | null;
  displayName?: string | null;
}

const Navbar: React.FC<NavbarProps> = ({
  role, onLogout, isDarkMode, onToggleTheme, onToggleSidebar,
  userId, authEmail, displayName,
}) => {
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isGuest = role === UserRole.GUEST;
  const name = displayName || authEmail?.split('@')[0] || null;
  const avatarSrc = userId && userId !== 'u_demo' ? `https://i.pravatar.cc/100?u=${userId}` : null;
  const initials = name ? name.charAt(0).toUpperCase() : '?';
  void location;

  const navLinkStyle: React.CSSProperties = {
    fontSize: 13, fontWeight: 500, color: 'var(--color-text-muted)',
    textDecoration: 'none', transition: 'color 0.15s', padding: '4px 0',
  };

  return (
    <nav
      style={{
        height: 60,
        backgroundColor: 'var(--color-bg-primary)',
        borderBottom: '1px solid var(--color-border)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {!isGuest && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden"
            style={{
              width: 34, height: 34, borderRadius: 8,
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--color-text-muted)',
            }}
            aria-label="Toggle sidebar"
          >
            <Menu style={{ width: 16, height: 16 }} />
          </button>
        )}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <Logo className="w-8 h-8" />
          <span
            className="hidden sm:block"
            style={{ fontSize: 15, fontWeight: 700, letterSpacing: '0.04em', color: 'var(--color-text-primary)' }}
          >
            FINODIV
          </span>
        </Link>
      </div>

      {/* Centre links — guest only */}
      {isGuest && (
        <div className="hidden lg:flex" style={{ gap: 28 }}>
          {[
            { label: 'Courses',    to: '/courses' },
            { label: 'For Employers', to: '/login' },
            { label: 'About Us',   to: '/' },
          ].map(({ label, to }) => (
            <Link
              key={label}
              to={to}
              style={navLinkStyle}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-primary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}
            >
              {label}
            </Link>
          ))}
        </div>
      )}

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{
            width: 34, height: 34, borderRadius: 8,
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--color-text-muted)',
            transition: 'border-color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
        >
          {isDarkMode
            ? <Sun style={{ width: 14, height: 14 }} />
            : <Moon style={{ width: 14, height: 14 }} />}
        </button>

        {isGuest ? (
          <Link
            to="/login"
            style={{
              padding: '8px 18px', borderRadius: 8,
              background: 'var(--color-accent)', color: '#fff',
              fontSize: 13, fontWeight: 600,
              textDecoration: 'none',
              transition: 'background 0.15s',
              boxShadow: '0 0 20px rgba(139,92,246,0.25)',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-accent-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-accent)')}
          >
            Login
          </Link>
        ) : (
          <>
            {/* Search */}
            <div className="hidden md:flex" style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 13, height: 13, color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                placeholder="Search..."
                style={{
                  padding: '7px 12px 7px 30px',
                  borderRadius: 8,
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                  fontSize: 12, outline: 'none', width: 180,
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
              />
            </div>

            {/* Notifications */}
            <button
              className="hidden sm:flex"
              style={{
                width: 34, height: 34, borderRadius: 8, position: 'relative',
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--color-text-muted)',
              }}
              aria-label="Notifications"
            >
              <Bell style={{ width: 14, height: 14 }} />
              <span style={{
                position: 'absolute', top: 7, right: 7,
                width: 7, height: 7, borderRadius: '50%',
                background: 'var(--color-accent)',
                border: '1.5px solid var(--color-bg-primary)',
              }} />
            </button>

            {/* Profile */}
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button
                onClick={() => setProfileOpen(p => !p)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '4px 8px', borderRadius: 10,
                  background: 'transparent', border: 'none',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-bg-card)')}
                onMouseLeave={e => { if (!profileOpen) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{
                  width: 30, height: 30, borderRadius: 8,
                  border: '1.5px solid var(--color-border)',
                  overflow: 'hidden',
                  background: 'var(--color-accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {avatarSrc
                    ? <img src={avatarSrc} alt={name ?? 'Profile'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>{initials}</span>}
                </div>
                {name && (
                  <span className="hidden md:block" style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {name}
                  </span>
                )}
                <ChevronDown className="hidden md:block" style={{ width: 13, height: 13, color: 'var(--color-text-muted)', transition: 'transform 0.15s', transform: profileOpen ? 'rotate(180deg)' : 'none' }} />
              </button>

              {/* Dropdown */}
              {profileOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 6px)',
                  width: 220,
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 14,
                  boxShadow: '0 16px 48px rgba(0,0,0,0.3)',
                  overflow: 'hidden',
                  zIndex: 100,
                }}>
                  {/* Header */}
                  <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: 10,
                        background: 'var(--color-accent)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, overflow: 'hidden',
                      }}>
                        {avatarSrc
                          ? <img src={avatarSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <span style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>{initials}</span>}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {name ?? 'User'}
                        </p>
                        {authEmail && (
                          <p style={{ fontSize: 11, color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {authEmail}
                          </p>
                        )}
                        <span style={{
                          display: 'inline-block', marginTop: 3,
                          padding: '1px 6px', borderRadius: 4,
                          background: 'rgba(139,92,246,0.12)', color: 'var(--color-accent)',
                          fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
                        }}>
                          {role}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  {[
                    { icon: User,     label: 'View Profile',     to: '/profile/current' },
                    { icon: Settings, label: 'Account Settings', to: '/settings' },
                  ].map(({ icon: Icon, label, to }) => (
                    <Link
                      key={label}
                      to={to}
                      onClick={() => setProfileOpen(false)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 16px', fontSize: 13, fontWeight: 500,
                        color: 'var(--color-text-muted)', textDecoration: 'none',
                        transition: 'background 0.15s, color 0.15s',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-deep)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-text-primary)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)'; }}
                    >
                      <Icon style={{ width: 14, height: 14 }} />
                      {label}
                    </Link>
                  ))}

                  <div style={{ borderTop: '1px solid var(--color-border)' }}>
                    <button
                      onClick={() => { setProfileOpen(false); onLogout(); }}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 16px', fontSize: 13, fontWeight: 500,
                        color: '#f87171', background: 'transparent', border: 'none',
                        cursor: 'pointer', transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <LogOut style={{ width: 14, height: 14 }} />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
