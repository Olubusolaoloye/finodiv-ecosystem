
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserRole } from '../types';
import { Search, Bell, Wallet, Sun, Moon, Menu, Settings, LogOut, User, ChevronDown } from 'lucide-react';
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
  role,
  onLogout,
  walletAddress,
  onConnectWallet,
  isDarkMode,
  onToggleTheme,
  onToggleSidebar,
  userId,
  authEmail,
  displayName,
}) => {
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const truncateAddress = (address: string) =>
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  // Derive real display info — never show placeholders
  const hasRealSession = !!userId && userId !== 'u_demo';
  const name = displayName || authEmail?.split('@')[0] || null;
  const avatarSrc = hasRealSession
    ? `https://i.pravatar.cc/100?u=${userId}`
    : null;

  // Initial letter fallback avatar
  const initials = name ? name.charAt(0).toUpperCase() : '?';

  return (
    <nav className="h-16 md:h-20 bg-white/80 dark:bg-[#0b0e14]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5 px-4 md:px-12 flex items-center justify-between sticky top-0 z-50 transition-colors duration-300">

      {/* Left: Logo */}
      <div className="flex items-center gap-4">
        {role !== UserRole.GUEST && (
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 lg:hidden text-slate-900 dark:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <Link to="/" className="flex items-center gap-2 md:gap-3 group">
          <Logo className="w-8 h-8 md:w-10 md:h-10 group-hover:scale-110 transition-transform duration-300" />
          <span className="text-lg md:text-xl font-bold tracking-tight text-slate-900 dark:text-white hidden sm:block">FINODIV</span>
        </Link>
      </div>

      {/* Centre: Nav links */}
      <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-500 dark:text-gray-400">
        <Link to="/courses" className="hover:text-blue-500 dark:hover:text-white transition-colors">Courses</Link>
        {role === UserRole.GUEST ? (
          <>
            <Link to="/join"  className="hover:text-blue-500 dark:hover:text-white transition-colors">For Employers</Link>
            <Link to="/"     className="hover:text-blue-500 dark:hover:text-white transition-colors">About Us</Link>
          </>
        ) : (
          <>
            <Link to="/talent"    className="hover:text-blue-500 dark:hover:text-white transition-colors">Talent</Link>
            <Link to="/jobs"      className="hover:text-blue-500 dark:hover:text-white transition-colors">Jobs</Link>
            <Link to="/community" className="hover:text-blue-500 dark:hover:text-white transition-colors">Community</Link>
          </>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 md:p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-all text-slate-500 dark:text-gray-400 border border-slate-200 dark:border-white/10"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {role === UserRole.GUEST ? (
          <>
            <Link to="/login" className="px-4 py-2 rounded-xl text-xs md:text-sm font-semibold text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors">
              Login
            </Link>
            <Link to="/join" className="px-4 md:px-5 py-2 rounded-xl bg-[#2F6DF2] hover:bg-blue-600 text-white text-xs md:text-sm font-semibold transition-all shadow-lg shadow-blue-500/20">
              Sign Up
            </Link>
          </>
        ) : (
          <div className="flex items-center gap-3 md:gap-4">
            {/* Search */}
            <div className="relative group hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 w-48 lg:w-56 dark:text-white transition-colors text-slate-900"
              />
            </div>

            {/* Notifications */}
            <button className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors relative border border-slate-200 dark:border-white/10 hidden sm:block">
              <Bell className="w-4 h-4 text-slate-500 dark:text-gray-400" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-white dark:border-[#0b0e14]" />
            </button>

            {/* Wallet */}
            <button
              onClick={onConnectWallet}
              className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl transition-all text-xs md:text-sm font-semibold shadow-sm ${
                walletAddress
                  ? 'bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-200 hover:bg-slate-200 dark:hover:bg-white/10'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/20'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span className="hidden sm:inline">
                {walletAddress ? truncateAddress(walletAddress) : 'Connect Wallet'}
              </span>
              {walletAddress && (
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] ml-1" />
              )}
            </button>

            {/* Profile dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileOpen(prev => !prev)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all group"
              >
                {/* Avatar */}
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-full border-2 border-slate-200 dark:border-white/10 group-hover:border-blue-500/50 transition-all overflow-hidden bg-blue-600 flex items-center justify-center shrink-0">
                  {avatarSrc ? (
                    <img src={avatarSrc} alt={name ?? 'Profile'} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white text-xs font-black">{initials}</span>
                  )}
                </div>
                {/* Name (desktop only) */}
                {name && (
                  <span className="hidden md:block text-sm font-semibold text-slate-800 dark:text-gray-200 max-w-[100px] truncate">
                    {name}
                  </span>
                )}
                <ChevronDown className={`w-4 h-4 text-slate-400 dark:text-gray-500 hidden md:block transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown */}
              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-[#0f1218] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden z-50">
                  {/* Profile info header */}
                  <div className="px-5 py-4 border-b border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl border-2 border-slate-200 dark:border-white/10 overflow-hidden bg-blue-600 flex items-center justify-center shrink-0">
                        {avatarSrc ? (
                          <img src={avatarSrc} alt={name ?? ''} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white font-black text-lg">{initials}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        {name ? (
                          <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{name}</p>
                        ) : (
                          <p className="font-bold text-sm text-slate-400 dark:text-gray-500 italic">No name set</p>
                        )}
                        {authEmail ? (
                          <p className="text-xs text-slate-500 dark:text-gray-500 truncate">{authEmail}</p>
                        ) : walletAddress ? (
                          <p className="text-xs text-slate-500 dark:text-gray-500 font-mono truncate">
                            {truncateAddress(walletAddress)}
                          </p>
                        ) : null}
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-[9px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                          {role}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="py-2">
                    <Link
                      to="/profile/current"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-5 py-3 text-sm font-semibold text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-blue-600 dark:hover:text-white transition-all"
                    >
                      <User className="w-4 h-4" /> View Profile
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-5 py-3 text-sm font-semibold text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-blue-600 dark:hover:text-white transition-all"
                    >
                      <Settings className="w-4 h-4" /> Account Settings
                    </Link>
                  </div>

                  <div className="py-2 border-t border-slate-100 dark:border-white/5">
                    <button
                      onClick={() => { setProfileOpen(false); onLogout(); }}
                      className="w-full flex items-center gap-3 px-5 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
