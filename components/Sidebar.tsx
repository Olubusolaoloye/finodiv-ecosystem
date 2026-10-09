
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { UserRole } from '../types';
import Logo from './Logo';
import {
  LayoutDashboard, BookOpen, Users, Briefcase, Settings, LogOut,
  Award, ShieldCheck, MessageSquare, Compass, Zap, Upload,
  ClipboardList, GraduationCap, ChevronLeft, ChevronRight, Sun, Moon,
} from 'lucide-react';

interface SidebarProps {
  role: UserRole;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onLogout: () => void;
  displayName?: string | null;
  authEmail?: string | null;
  userId?: string | null;
  avatarUrl?: string | null;
  isDarkMode?: boolean;
  onToggleTheme: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  role, isOpen, setIsOpen, onLogout, displayName, authEmail, userId, avatarUrl, isDarkMode, onToggleTheme,
}) => {
  const unread = useQuery(api.messages.unreadTotal, userId ? { userId } : 'skip') ?? 0;
  const avatarSrc = avatarUrl || (userId ? `https://i.pravatar.cc/100?u=${userId}` : null);

  const learnerLinks = [
    { icon: LayoutDashboard, label: 'Dashboard',      path: '/dashboard' },
    { icon: BookOpen,         label: 'Courses',        path: '/courses' },
    { icon: Briefcase,        label: 'Jobs',           path: '/jobs' },
    { icon: MessageSquare,    label: 'Chats',          path: '/community' },
    { icon: Compass,          label: 'Career Compass', path: '/career-compass' },
    { icon: Award,            label: 'Certificates',   path: '/certificates' },
  ];

  const employerLinks = [
    { icon: LayoutDashboard, label: 'Overview',        path: '/dashboard' },
    { icon: Users,           label: 'Talent Search',   path: '/talent' },
    { icon: Briefcase,       label: 'Job Posts',       path: '/jobs' },
    { icon: MessageSquare,   label: 'Chats',           path: '/community' },
    { icon: ShieldCheck,     label: 'Company Profile', path: '/profile/current' },
  ];

  const educatorLinks = [
    { icon: GraduationCap, label: 'Teaching Hub',   path: '/educator' },
    { icon: Upload,        label: 'Upload Course',  path: '/educator/upload' },
    { icon: ClipboardList, label: 'Submissions',    path: '/educator/submissions' },
    { icon: BookOpen,      label: 'Browse Courses', path: '/courses' },
    { icon: MessageSquare, label: 'Chats',           path: '/community' },
  ];

  const adminLinks = [
    { icon: LayoutDashboard, label: 'Admin Hub',      path: '/dashboard' },
    { icon: BookOpen,        label: 'Manage Courses', path: '/admin/courses' },
    { icon: Users,           label: 'Platform Users', path: '/admin/users' },
    { icon: Zap,             label: 'System Control', path: '/admin/settings' },
  ];

  const links =
    role === UserRole.ADMIN    ? adminLinks    :
    role === UserRole.EMPLOYER ? employerLinks :
    role === UserRole.EDUCATOR ? educatorLinks :
    learnerLinks;

  const initials = (displayName || authEmail || 'U').charAt(0).toUpperCase();

  const gradientBg = isDarkMode
    ? 'linear-gradient(160deg, #2D1B69 0%, #1E3A8A 100%)'
    : 'linear-gradient(160deg, #4C1D95 0%, #1D4ED8 100%)';

  return (
    <>
      {/* ── Desktop sidebar (hidden on mobile) ─────────────────────── */}
      <aside
        className="hidden md:flex flex-col overflow-hidden"
        style={{
          background: gradientBg,
          width: isOpen ? 260 : 72,
          minHeight: '100vh',
          flexShrink: 0,
          transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
          position: 'relative',
          zIndex: 40,
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center shrink-0"
          style={{
            height: 72,
            padding: isOpen ? '0 20px' : '0',
            justifyContent: isOpen ? 'flex-start' : 'center',
            gap: 10,
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <Logo className="w-9 h-9 shrink-0" />
          {isOpen && (
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 17, letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>
              FINODIV
            </span>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            position: 'absolute', right: -12, top: 84,
            width: 24, height: 24, borderRadius: '50%',
            background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
            cursor: 'pointer', border: 'none', zIndex: 10, color: '#4C1D95',
            transition: 'transform 0.15s',
          }}
          className="hover:scale-110"
        >
          {isOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>

        {/* Section label */}
        {isOpen && (
          <div style={{ padding: '20px 20px 8px' }}>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Navigation
            </span>
          </div>
        )}

        {/* Nav links */}
        <nav
          className="flex-1 overflow-y-auto custom-scrollbar"
          style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '11px 12px', borderRadius: 12, textDecoration: 'none',
                transition: 'all 0.15s', whiteSpace: 'nowrap',
                fontWeight: isActive ? 600 : 500, fontSize: 14,
                justifyContent: isOpen ? 'flex-start' : 'center',
                backgroundColor: isActive ? 'rgba(255,255,255,0.95)' : 'transparent',
                color: isActive ? '#4C1D95' : 'rgba(255,255,255,0.75)',
                boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
              })}
              className={({ isActive }) => isActive ? '' : 'hover:bg-white/10 hover:!text-white'}
            >
              <span style={{ position: 'relative', display: 'flex' }}>
                <link.icon className="w-5 h-5 shrink-0" />
                {link.path === '/community' && unread > 0 && !isOpen && <UnreadDot />}
              </span>
              {isOpen && <span style={{ flex: 1 }}>{link.label}</span>}
              {isOpen && link.path === '/community' && unread > 0 && <UnreadBadge count={unread} />}
            </NavLink>
          ))}
        </nav>

        {/* Decorative circles */}
        <div style={{ position: 'relative', height: 80, overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ position: 'absolute', right: -20, bottom: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
          <div style={{ position: 'absolute', right: 20, bottom: -30, width: 70, height: 70, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        </div>

        {/* Bottom: settings + logout + user */}
        <div style={{ padding: '0 10px 12px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <button
            onClick={onToggleTheme}
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 12px', borderRadius: 12, border: 'none',
              fontSize: 14, fontWeight: 500, cursor: 'pointer',
              justifyContent: isOpen ? 'flex-start' : 'center',
              backgroundColor: 'transparent', color: 'rgba(255,255,255,0.65)',
              width: '100%', marginTop: 8, transition: 'all 0.15s',
            }}
            className="hover:bg-white/10 hover:!text-white"
          >
            {isDarkMode ? <Sun className="w-5 h-5 shrink-0" /> : <Moon className="w-5 h-5 shrink-0" />}
            {isOpen && <span>{isDarkMode ? 'Light mode' : 'Dark mode'}</span>}
          </button>

          <NavLink
            to="/settings"
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 12px', borderRadius: 12, textDecoration: 'none',
              fontSize: 14, fontWeight: 500,
              justifyContent: isOpen ? 'flex-start' : 'center',
              backgroundColor: isActive ? 'rgba(255,255,255,0.95)' : 'transparent',
              color: isActive ? '#4C1D95' : 'rgba(255,255,255,0.65)',
            })}
            className={({ isActive }) => isActive ? '' : 'hover:bg-white/10 hover:!text-white'}
          >
            <Settings className="w-5 h-5 shrink-0" />
            {isOpen && <span>Settings</span>}
          </NavLink>

          <button
            onClick={onLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 12px', borderRadius: 12, border: 'none',
              fontSize: 14, fontWeight: 500, cursor: 'pointer',
              justifyContent: isOpen ? 'flex-start' : 'center',
              backgroundColor: 'transparent', color: 'rgba(255,120,120,0.85)',
              width: '100%', transition: 'all 0.15s',
            }}
            className="hover:bg-red-500/15 hover:!text-red-300"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {isOpen && <span>Log Out</span>}
          </button>

          <NavLink
            to="/settings"
            style={({ isActive }) => ({
              marginTop: 8, padding: '10px 12px', borderRadius: 12,
              background: isActive ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', gap: 10,
              justifyContent: isOpen ? 'flex-start' : 'center',
              textDecoration: 'none', cursor: 'pointer',
              transition: 'background 0.15s',
              border: '1px solid rgba(255,255,255,0.06)',
            })}
            className="hover:!bg-white/15"
          >
            {({ isActive }) => (
              <>
                {avatarSrc ? (
                  <img src={avatarSrc} alt="avatar" style={{ width: 34, height: 34, borderRadius: 10, objectFit: 'cover', flexShrink: 0, border: isActive ? '2px solid #7C3AED' : '2px solid rgba(255,255,255,0.15)' }} />
                ) : (
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                    {initials}
                  </div>
                )}
                {isOpen && (
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ color: isActive ? '#4C1D95' : '#fff', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {displayName || authEmail?.split('@')[0] || 'User'}
                    </p>
                    <p style={{ color: isActive ? '#7C3AED' : 'rgba(255,255,255,0.45)', fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {isActive ? 'Settings' : authEmail || ''}
                    </p>
                  </div>
                )}
              </>
            )}
          </NavLink>
        </div>
      </aside>

      {/* ── Mobile bottom nav (visible only on mobile) ──────────────── */}
      <nav
        className="mobile-bottom-nav fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: gradientBg,
          borderTop: '1px solid rgba(255,255,255,0.12)',
          alignItems: 'stretch',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.35)',
        }}
      >
        {links.slice(0, 4).map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            style={({ isActive }) => ({
              flex: 1,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 4, padding: '10px 4px',
              textDecoration: 'none',
              color: isActive ? '#fff' : 'rgba(255,255,255,0.45)',
              position: 'relative',
              transition: 'color 0.15s',
            })}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span style={{
                    position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                    width: 32, height: 2, borderRadius: 999,
                    background: 'rgba(255,255,255,0.9)',
                  }} />
                )}
                <span style={{ position: 'relative', display: 'flex' }}>
                  <link.icon style={{ width: 20, height: 20 }} strokeWidth={isActive ? 2 : 1.5} />
                  {link.path === '/community' && unread > 0 && <UnreadDot />}
                </span>
                <span style={{ fontSize: 9, fontWeight: isActive ? 700 : 500, letterSpacing: '0.04em' }}>
                  {link.label.split(' ')[0]}
                </span>
              </>
            )}
          </NavLink>
        ))}

        {/* Profile avatar → Settings */}
        <NavLink
          to="/settings"
          style={({ isActive }) => ({
            flex: 1,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 4, padding: '8px 4px',
            textDecoration: 'none',
            color: isActive ? '#fff' : 'rgba(255,255,255,0.65)',
            position: 'relative', transition: 'color 0.15s',
          })}
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 32, height: 2, borderRadius: 999, background: 'rgba(255,255,255,0.9)' }} />
              )}
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt="profile"
                  style={{ width: 26, height: 26, borderRadius: 8, objectFit: 'cover', border: isActive ? '2px solid #fff' : '2px solid rgba(255,255,255,0.3)' }}
                />
              ) : (
                <div style={{ width: 26, height: 26, borderRadius: 8, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 11 }}>
                  {initials}
                </div>
              )}
              <span style={{ fontSize: 9, fontWeight: isActive ? 700 : 500, letterSpacing: '0.04em' }}>Profile</span>
            </>
          )}
        </NavLink>
      </nav>
    </>
  );
};

const UnreadDot: React.FC = () => (
  <span style={{ position: 'absolute', top: -3, right: -4, width: 9, height: 9, borderRadius: '50%', background: '#f43f5e', border: '2px solid rgba(76,29,149,0.9)' }} />
);

const UnreadBadge: React.FC<{ count: number }> = ({ count }) => (
  <span style={{ minWidth: 20, height: 20, padding: '0 6px', borderRadius: 999, background: '#f43f5e', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    {count > 99 ? '99+' : count}
  </span>
);

export default Sidebar;
