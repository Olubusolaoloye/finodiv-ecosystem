
import React from 'react';
import { NavLink } from 'react-router-dom';
import { UserRole } from '../types';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Briefcase, 
  Settings, 
  LogOut, 
  Award,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  FolderOpen,
  MessageSquare,
  Compass,
  Zap
} from 'lucide-react';

interface SidebarProps {
  role: UserRole;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ role, isOpen, setIsOpen, onLogout }) => {
  const learnerLinks = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Compass, label: 'Career Compass', path: '/career-compass' },
    { icon: BookOpen, label: 'Courses', path: '/courses' },
    { icon: FolderOpen, label: 'Projects', path: '/submit-project' },
    { icon: Award, label: 'Certificates', path: '/certificates' },
    { icon: MessageSquare, label: 'Community', path: '/community' },
  ];

  const employerLinks = [
    { icon: LayoutDashboard, label: 'Overview', path: '/dashboard' },
    { icon: Users, label: 'Talent Search', path: '/talent' },
    { icon: Briefcase, label: 'Job Posts', path: '/jobs' },
    { icon: MessageSquare, label: 'Messages', path: '/messages' },
    { icon: ShieldCheck, label: 'Company Profile', path: '/profile/current' },
  ];

  const adminLinks = [
    { icon: LayoutDashboard, label: 'Admin Hub', path: '/dashboard' },
    { icon: BookOpen, label: 'Manage Courses', path: '/admin/courses' },
    { icon: Users, label: 'Platform Users', path: '/admin/users' },
    { icon: Zap, label: 'System Control', path: '/admin/settings' },
  ];

  const links = role === UserRole.ADMIN ? adminLinks : role === UserRole.EMPLOYER ? employerLinks : learnerLinks;

  // On Mobile: Fixed, full height, z-index high, width 72 (or full screen minus some gap)
  // On Desktop: Sticky/Static, variable width
  return (
    <aside 
      className={`
        bg-white dark:bg-[#0b0e14] border-r border-slate-200 dark:border-white/5 flex flex-col transition-all duration-300
        fixed top-0 bottom-0 left-0 z-40 lg:static lg:h-[calc(100vh-80px)]
        ${isOpen ? 'w-72 translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20'}
      `}
    >
      <div className="h-16 md:h-20 lg:hidden flex items-center px-6 border-b border-slate-200 dark:border-white/5 mb-2">
         <span className="text-lg font-bold text-slate-900 dark:text-white">Menu</span>
      </div>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-3 top-24 w-6 h-6 bg-[#2F6DF2] rounded-full hidden lg:flex items-center justify-center shadow-lg transition-transform hover:scale-110 z-10 text-white"
      >
        {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      <div className="flex-1 py-6 flex flex-col gap-1 px-4 overflow-y-auto custom-scrollbar">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            onClick={() => window.innerWidth < 1024 && setIsOpen(false)}
            className={({ isActive }) => `
              flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group/link
              ${isActive ? 'bg-[#2F6DF2] text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'}
            `}
          >
            <link.icon className={`w-5 h-5 transition-transform ${isOpen ? '' : 'mx-auto'}`} />
            {isOpen && <span className="font-medium text-sm">{link.label}</span>}
          </NavLink>
        ))}
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-white/5 flex flex-col gap-4 bg-white dark:bg-[#0b0e14]">
        {isOpen && (
          <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 flex items-center gap-3 relative overflow-hidden border border-slate-200 dark:border-transparent">
             {role === UserRole.ADMIN && <div className="absolute top-0 right-0 w-2 h-full bg-blue-500/30 blur-sm"></div>}
            <img src="https://i.pravatar.cc/100?u=current" alt="Avatar" className="w-10 h-10 rounded-xl object-cover" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-slate-900 dark:text-white">Alex Morgan</p>
              <div className="flex items-center gap-2">
                 <p className="text-[10px] text-slate-500 dark:text-gray-500 truncate lowercase">alex.m@finodiv.com</p>
                 {role === UserRole.ADMIN && <ShieldCheck className="w-3 h-3 text-blue-400 shrink-0" />}
              </div>
            </div>
          </div>
        )}
        
        <NavLink 
          to="/settings" 
          onClick={() => window.innerWidth < 1024 && setIsOpen(false)}
          className="flex items-center gap-4 px-4 py-3 rounded-2xl text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-all"
        >
          <Settings className={`w-5 h-5 ${isOpen ? '' : 'mx-auto'}`} />
          {isOpen && <span className="text-sm font-medium">Settings</span>}
        </NavLink>

        <button 
          onClick={onLogout}
          className="flex items-center gap-4 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all w-full text-left"
        >
          <LogOut className={`w-5 h-5 ${isOpen ? '' : 'mx-auto'}`} />
          {isOpen && <span className="text-sm font-medium">Log Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
