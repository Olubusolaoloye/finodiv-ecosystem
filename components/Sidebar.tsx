
import React from 'react';
import { NavLink } from 'react-router-dom';
import { UserRole } from '../types';
import Logo from './Logo';
import {
  LayoutDashboard, BookOpen, Users, Briefcase, Settings, LogOut,
  Award, ShieldCheck, MessageSquare, Compass, Zap, Upload,
  ClipboardList, GraduationCap, ChevronLeft, ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  role: UserRole;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onLogout: () => void;
  displayName?: string | null;
  authEmail?: string | null;
  userId?: string | null;
  isDarkMode?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  role, isOpen, setIsOpen, onLogout, displayName, authEmail, userId, isDarkMode,
}) => {
  const learnerLinks = [
    { icon: LayoutDashboard, label: 'Dashboard',      path: '/dashboard' },
    { icon: Compass,          label: 'Career Compass', path: '/career-compass' },
    { icon: BookOpen,         label: 'Courses',        path: '/courses' },
    { icon: Award,            label: 'Certificates',   path: '/certificates' },
    { icon: MessageSquare,    label: 'Community',      path: '/community' },
  ];

  const employerLinks = [
    { icon: LayoutDashboard, label: 'Overview',        path: '/dashboard' },
    { icon: Users,           label: 'Talent Search',   path: '/talent' },
    { icon: Briefcase,       label: 'Job Posts',       path: '/jobs' },
    { icon: MessageSquare,   label: 'Messages',        path: '/messages' },
    { icon: ShieldCheck,     label: 'Company Profile', path: '/profile/current' },
  ];

  const educatorLinks = [
    { icon: GraduationCap, label: 'Teaching Hub',   path: '/educator' },
    { icon: Upload,        label: 'Upload Course',  path: '/educator/upload' },
    { icon: ClipboardList, label: 'Submissions',    path: '/educator/submissions' },
    { icon: BookOpen,      label: 'Browse Courses', path: '/courses' },
    { icon: MessageSquare, label: 'Community',      path: '/community' },
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

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        style={{
          background: isDarkMode
            ? 'linear-gradient(160deg, #2D1B69 0%, #1E3A8A 100%)'
            : 'linear-gradient(160deg, #4C1D95 0%, #1D4ED8 100%)',
          width: isOpen ? 260 : 72,
          minHeight: '100vh',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
          position: 'relative',
          zIndex: 40,
        }}
        className="overflow-hidden"
      >
        {/* ── Logo area ─────────────────────────────────────────────── */}
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

        {/* ── Collapse toggle ───────────────────────────────────────── */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            position: 'absolute',
            right: -12,
            top: 84,
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
            cursor: 'pointer',
            border: 'none',
            zIndex: 10,
            color: '#4C1D95',
          }}
          className="hidden lg:flex transition-transform hover:scale-110"
        >
          {isOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>

        {/* ── Section label ─────────────────────────────────────────── */}
        {isOpen && (
          <div style={{ padding: '20px 20px 8px' }}>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Navigation
            </span>
          </div>
        )}

        {/* ── Nav links ─────────────────────────────────────────────── */}
        <nav
          className="flex-1 overflow-y-auto custom-scrollbar"
          style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => window.innerWidth < 1024 && setIsOpen(false)}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '11px 12px',
                borderRadius: 12,
                textDecoration: 'none',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
                fontWeight: isActive ? 600 : 500,
                fontSize: 14,
                justifyContent: isOpen ? 'flex-start' : 'center',
                backgroundColor: isActive ? 'rgba(255,255,255,0.95)' : 'transparent',
                color: isActive ? '#4C1D95' : 'rgba(255,255,255,0.75)',
                boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
              })}
              className={({ isActive }) => isActive ? '' : 'hover:bg-white/10 hover:!text-white'}
            >
              <link.icon className="w-5 h-5 shrink-0" />
              {isOpen && <span>{link.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* ── Decorative circles ────────────────────────────────────── */}
        <div style={{ position: 'relative', height: 80, overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ position: 'absolute', right: -20, bottom: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
          <div style={{ position: 'absolute', right: 20, bottom: -30, width: 70, height: 70, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
          <div style={{ position: 'absolute', right: -10, bottom: 20, width: 50, height: 50, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        </div>

        {/* ── Bottom section ────────────────────────────────────────── */}
        <div style={{ padding: '0 10px 12px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: 2 }}>

          {/* Settings */}
          <NavLink
            to="/settings"
            onClick={() => window.innerWidth < 1024 && setIsOpen(false)}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 12px', borderRadius: 12, textDecoration: 'none',
              fontSize: 14, fontWeight: 500,
              justifyContent: isOpen ? 'flex-start' : 'center',
              backgroundColor: isActive ? 'rgba(255,255,255,0.95)' : 'transparent',
              color: isActive ? '#4C1D95' : 'rgba(255,255,255,0.65)',
              marginTop: 8,
            })}
            className={({ isActive }) => isActive ? '' : 'hover:bg-white/10 hover:!text-white'}
          >
            <Settings className="w-5 h-5 shrink-0" />
            {isOpen && <span>Settings</span>}
          </NavLink>

          {/* Logout */}
          <button
            onClick={onLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 12px', borderRadius: 12, border: 'none',
              fontSize: 14, fontWeight: 500, cursor: 'pointer',
              justifyContent: isOpen ? 'flex-start' : 'center',
              backgroundColor: 'transparent',
              color: 'rgba(255,120,120,0.85)',
              width: '100%',
              transition: 'all 0.15s',
            }}
            className="hover:bg-red-500/15 hover:!text-red-300"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {isOpen && <span>Log Out</span>}
          </button>

          {/* User card */}
          <div
            style={{
              marginTop: 8,
              padding: '10px 12px',
              borderRadius: 12,
              background: 'rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              justifyContent: isOpen ? 'flex-start' : 'center',
            }}
          >
            {userId ? (
              <img
                src={`https://i.pravatar.cc/100?u=${userId}`}
                alt="avatar"
                style={{ width: 34, height: 34, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
              />
            ) : (
              <div style={{
                width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0,
              }}>
                {initials}
              </div>
            )}
            {isOpen && (
              <div style={{ minWidth: 0 }}>
                <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {displayName || authEmail?.split('@')[0] || 'User'}
                </p>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {authEmail || ''}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
