
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserRole } from '../types';
import { Search, Bell, User, Wallet, LogOut, Sun, Moon, Menu } from 'lucide-react';
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
}) => {
  const avatarSrc = userId
    ? `https://i.pravatar.cc/100?u=${userId}`
    : authEmail
    ? `https://i.pravatar.cc/100?u=${authEmail}`
    : 'https://i.pravatar.cc/100?u=guest';
  const location = useLocation();

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <nav className="h-16 md:h-20 bg-white/80 dark:bg-[#0b0e14]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5 px-4 md:px-12 flex items-center justify-between sticky top-0 z-50 transition-colors duration-300">
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

      <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-500 dark:text-gray-400">
        <Link to="/courses" className="hover:text-blue-500 dark:hover:text-white transition-colors">Courses</Link>
        {role === UserRole.GUEST ? (
          <>
            <Link to="/join" className="hover:text-blue-500 dark:hover:text-white transition-colors">For Employers</Link>
            <Link to="/" className="hover:text-blue-500 dark:hover:text-white transition-colors">About Us</Link>
          </>
        ) : (
          <>
            <Link to="/talent" className="hover:text-blue-500 dark:hover:text-white transition-colors">Talent</Link>
            <Link to="/jobs"   className="hover:text-blue-500 dark:hover:text-white transition-colors">Jobs</Link>
          </>
        )}
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        {/* Theme Toggle */}
        <button 
          onClick={onToggleTheme}
          className="p-2 md:p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-all text-slate-500 dark:text-gray-400 border border-slate-200 dark:border-white/10"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {role === UserRole.GUEST ? (
          <>
            <Link to="/login" className="px-4 py-2 rounded-xl text-xs md:text-sm font-semibold text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors">Login</Link>
            <Link to="/join" className="px-4 md:px-5 py-2 rounded-xl bg-[#2F6DF2] hover:bg-blue-600 text-white text-xs md:text-sm font-semibold transition-all shadow-lg shadow-blue-500/20">Sign Up</Link>
          </>
        ) : (
          <div className="flex items-center gap-3 md:gap-4">
             <div className="relative group hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 w-48 lg:w-64 dark:text-white transition-colors"
              />
            </div>
            <button className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors relative border border-slate-200 dark:border-white/10 hidden sm:block">
              <Bell className="w-4 h-4 text-slate-500 dark:text-gray-400" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-white dark:border-[#0b0e14]"></span>
            </button>
            
            <button 
              onClick={onConnectWallet}
              className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl transition-all text-xs md:text-sm font-semibold shadow-lg ${
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
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] ml-1"></div>
              )}
            </button>

            <Link to="/settings" className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-slate-200 dark:border-white/10 overflow-hidden cursor-pointer hover:border-blue-500/50 transition-all" title={authEmail ?? 'Settings'}>
              <img src={avatarSrc} alt="Profile" className="w-full h-full object-cover" />
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
