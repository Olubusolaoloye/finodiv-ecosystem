
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserRole, SystemSettings } from './types';
import { supabase } from './services/supabase';

// Views
import Home from './views/Home';
import Dashboard from './views/Dashboard';
import AdminDashboard from './views/AdminDashboard';
import CourseList from './views/CourseList';
import CourseDetail from './views/CourseDetail';
import LearningPlayer from './views/LearningPlayer';
import TalentSearch from './views/TalentSearch';
import Profile from './views/Profile';
import Checkout from './views/Checkout';
import Login from './views/Login';
import JoinAs from './views/JoinAs';
import CompanyVerification from './views/CompanyVerification';
import ProjectSubmission from './views/ProjectSubmission';
import Certificates from './views/Certificates';
import Community from './views/Community';
import CareerCompass from './views/CareerCompass';
import Settings from './views/Settings';
import ManageCourses from './views/admin/ManageCourses';
import ManageUsers from './views/admin/ManageUsers';
import SystemControl from './views/admin/SystemControl';
import Jobs from './views/Jobs';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { Construction } from 'lucide-react';

// Wallet address is not part of the Supabase session — store in localStorage
const WALLET_KEY = 'finodiv_session_wallet';

const ComingSoon: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
    <div className="w-20 h-20 bg-blue-500/10 dark:bg-blue-500/10 rounded-3xl flex items-center justify-center mb-8 border border-blue-500/20">
      <Construction className="w-10 h-10 text-blue-400" />
    </div>
    <h1 className="text-4xl font-black mb-4 text-slate-900 dark:text-white">{title}</h1>
    <p className="text-slate-500 dark:text-gray-500 text-lg max-w-md">
      This section is under development and will be available soon.
    </p>
  </div>
);

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>(UserRole.GUEST);
  const [userId, setUserId] = useState<string | null>(null);
  const [authEmail, setAuthEmail] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(
    () => localStorage.getItem(WALLET_KEY)
  );
  const [authReady, setAuthReady] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') !== 'light');

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    maintenanceMode: false,
    allowSignups: true,
    allowLogins: true,
    siteName: 'FINODIV',
    supportEmail: 'devolufinodiv@gmail.com',
  });

  // ── Theme sync ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) { root.classList.add('dark'); localStorage.setItem('theme', 'dark'); }
    else { root.classList.remove('dark'); localStorage.setItem('theme', 'light'); }
  }, [isDarkMode]);

  // ── Window resize → sidebar ─────────────────────────────────────────────────
  useEffect(() => {
    const handle = () => setIsSidebarOpen(window.innerWidth >= 1024);
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, []);

  // ── Supabase auth listener ──────────────────────────────────────────────────
  useEffect(() => {
    const loadProfile = async (uid: string, email: string | null) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, wallet_address')
        .eq('id', uid)
        .maybeSingle();

      setUserId(uid);
      setAuthEmail(email);
      setRole((profile?.role as UserRole) || UserRole.LEARNER);
      if (profile?.wallet_address) {
        setWalletAddress(profile.wallet_address);
        localStorage.setItem(WALLET_KEY, profile.wallet_address);
      }
    };

    // INITIAL_SESSION fires once on startup with the cached/URL session (or null).
    // SIGNED_IN fires when a magic link is clicked.
    // Using onAuthStateChange exclusively avoids the race between getSession() and the listener.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'INITIAL_SESSION') {
        // Fires once on startup — resolves the loading screen regardless of session state
        if (session?.user) {
          try {
            await loadProfile(session.user.id, session.user.email ?? null);
          } catch (e) {
            console.error('loadProfile (INITIAL_SESSION):', e);
            setUserId(session.user.id);
            setAuthEmail(session.user.email ?? null);
            setRole(UserRole.LEARNER);
          }
        }
        setAuthReady(true);
      } else if (event === 'SIGNED_IN' && session?.user) {
        try {
          await loadProfile(session.user.id, session.user.email ?? null);
        } catch (e) {
          console.error('loadProfile (SIGNED_IN):', e);
          setUserId(session.user.id);
          setAuthEmail(session.user.email ?? null);
          setRole(UserRole.LEARNER);
        }
        // Redirect to dashboard after magic-link login
        const hash = window.location.hash;
        if (!hash || hash === '#/' || hash === '#/login' || hash === '#/join') {
          window.location.hash = '#/dashboard';
        }
      } else if (event === 'SIGNED_OUT') {
        setRole(UserRole.GUEST);
        setUserId(null);
        setAuthEmail(null);
        setAuthReady(true);
      }
    });

    // Safety fallback: if INITIAL_SESSION never fires (network/SDK issue), unblock UI after 5 s
    const fallback = setTimeout(() => setAuthReady(true), 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(fallback);
    };
  }, []);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = async () => {
    await supabase.auth.signOut();
    setRole(UserRole.GUEST);
    setUserId(null);
    setAuthEmail(null);
    setWalletAddress(null);
    localStorage.removeItem(WALLET_KEY);
    window.location.hash = '#/';
  };

  // ── Wallet connection (MetaMask or mock) ─────────────────────────────────────
  const handleConnectWallet = async () => {
    let address: string;
    if (typeof (window as any).ethereum !== 'undefined') {
      try {
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        address = accounts[0];
      } catch { return; }
    } else {
      address = '0x71C24961234567890ABCDEF12345678901234567';
    }
    setWalletAddress(address);
    localStorage.setItem(WALLET_KEY, address);
    // If logged in, persist wallet to profile
    if (userId) {
      await supabase.from('profiles').update({ wallet_address: address }).eq('id', userId);
    }
  };

  const effectiveUserId = userId || 'u_demo';

  // Show nothing until Supabase has resolved the session (avoids flash of GUEST state)
  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0b0e14]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (systemSettings.maintenanceMode && role !== UserRole.ADMIN) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0b0e14] flex flex-col items-center justify-center p-8 text-center text-slate-900 dark:text-white transition-colors duration-300">
        <div className="w-32 h-32 bg-blue-600/10 rounded-[40px] flex items-center justify-center mb-8 border border-blue-500/20">
          <Construction className="w-16 h-16 text-blue-400" />
        </div>
        <h1 className="text-5xl font-black mb-6">Down for Maintenance</h1>
        <p className="text-slate-500 dark:text-gray-400 text-xl max-w-xl leading-relaxed mb-12">
          We're currently upgrading the FINODIV ecosystem. We'll be back online shortly.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 transition-all font-bold"
        >
          Check Again
        </button>
      </div>
    );
  }

  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-50 dark:bg-brand-dark text-slate-900 dark:text-white flex flex-col transition-colors duration-300">
        <Navbar
          role={role}
          onLogout={logout}
          walletAddress={walletAddress}
          onConnectWallet={handleConnectWallet}
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
          onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
          userId={effectiveUserId}
          authEmail={authEmail}
        />

        <div className="flex flex-1 overflow-hidden relative">
          {role !== UserRole.GUEST && (
            <>
              {isSidebarOpen && (
                <div
                  className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
                  onClick={() => setIsSidebarOpen(false)}
                />
              )}
              <Sidebar
                role={role}
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
                onLogout={logout}
              />
            </>
          )}

          <main className="flex-1 overflow-y-auto custom-scrollbar relative transition-all duration-300 w-full">
            <Routes>
              <Route path="/" element={<Home onJoin={() => { window.location.hash = '#/login'; }} />} />
              <Route path="/login" element={<Login onWalletLogin={handleWalletLogin} />} />
              <Route path="/join" element={<JoinAs onSelect={() => { window.location.hash = '#/login'; }} />} />

              <Route
                path="/dashboard"
                element={
                  role === UserRole.GUEST ? (
                    <Navigate to="/login" />
                  ) : role === UserRole.ADMIN ? (
                    <AdminDashboard />
                  ) : (
                    <Dashboard role={role} />
                  )
                }
              />

              <Route path="/admin/courses" element={role === UserRole.ADMIN ? <ManageCourses /> : <Navigate to="/" />} />
              <Route path="/admin/users" element={role === UserRole.ADMIN ? <ManageUsers /> : <Navigate to="/" />} />
              <Route
                path="/admin/settings"
                element={
                  role === UserRole.ADMIN ? (
                    <SystemControl settings={systemSettings} onUpdate={setSystemSettings} />
                  ) : (
                    <Navigate to="/" />
                  )
                }
              />

              <Route path="/career-compass" element={role === UserRole.GUEST ? <Navigate to="/login" /> : <CareerCompass />} />
              <Route path="/courses" element={<CourseList />} />
              <Route path="/courses/:id" element={<CourseDetail />} />
              <Route path="/learning/:id" element={<LearningPlayer />} />
              <Route path="/talent" element={<TalentSearch />} />
              <Route path="/profile/:id" element={<Profile currentSessionRole={role} />} />
              <Route
                path="/checkout"
                element={
                  <Checkout
                    userId={effectiveUserId}
                    userEmail={authEmail || 'user@example.com'}
                    walletAddress={walletAddress}
                  />
                }
              />
              <Route path="/verification" element={<CompanyVerification />} />
              <Route path="/submit-project" element={<ProjectSubmission />} />
              <Route
                path="/certificates"
                element={<Certificates userId={effectiveUserId} walletAddress={walletAddress} />}
              />
              <Route
                path="/community"
                element={role === UserRole.GUEST ? <Navigate to="/login" /> : <Community role={role} />}
              />
              <Route
                path="/settings"
                element={
                  role === UserRole.GUEST ? (
                    <Navigate to="/login" />
                  ) : (
                    <Settings
                      userId={effectiveUserId}
                      role={role}
                      authEmail={authEmail}
                      walletAddress={walletAddress}
                      onBindWallet={handleConnectWallet}
                    />
                  )
                }
              />

              <Route path="/jobs" element={role === UserRole.GUEST ? <Navigate to="/login" /> : <Jobs />} />
              <Route path="/messages" element={role === UserRole.GUEST ? <Navigate to="/login" /> : <ComingSoon title="Messages" />} />

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </div>
    </HashRouter>
  );

  // Wallet login: sets wallet address; Supabase session still manages role
  async function handleWalletLogin(address: string, _targetRole: UserRole) {
    setWalletAddress(address);
    localStorage.setItem(WALLET_KEY, address);
    window.location.hash = '#/dashboard';
  }
};

export default App;
