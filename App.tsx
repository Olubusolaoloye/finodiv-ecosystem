
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserRole, SystemSettings } from './types';
import { convex } from './services/convex';
import { api as convexApi } from './convex/_generated/api';

// Views
import LandingPage from './views/LandingPage';
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
import ResetPassword from './views/ResetPassword';
import Web3AcademyPrivacy from './views/Web3AcademyPrivacy';
import EducatorDashboard from './views/educator/EducatorDashboard';
import CourseUpload from './views/educator/CourseUpload';
import ViewSubmissions from './views/educator/ViewSubmissions';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Logo from './components/Logo';
import { Construction } from 'lucide-react';

const SESSION_KEY  = 'finodiv_session';
const MOBILE_QUERY = '(max-width: 767px)';
const DARK_QUERY   = '(prefers-color-scheme: dark)';
const WALLET_KEY   = 'finodiv_session_wallet';

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>(UserRole.GUEST);
  const [userId, setUserId] = useState<string | null>(null);
  const [authEmail, setAuthEmail] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(
    () => localStorage.getItem(WALLET_KEY)
  );
  const [authReady, setAuthReady] = useState(false);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') !== 'light');
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches);
  const [systemDark, setSystemDark] = useState(() => window.matchMedia(DARK_QUERY).matches);

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    maintenanceMode: false,
    allowSignups: true,
    allowLogins: true,
    siteName: 'FINODIV',
    supportEmail: 'devolufinodiv@gmail.com',
  });

  // ── Theme sync ──────────────────────────────────────────────────────────────
  // Signed-in users on mobile follow the OS theme; desktop uses the saved toggle.
  const followSystemTheme = isMobile && role !== UserRole.GUEST;
  const effectiveDark = followSystemTheme ? systemDark : isDarkMode;

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', effectiveDark);
  }, [effectiveDark]);

  useEffect(() => {
    const mobileMq = window.matchMedia(MOBILE_QUERY);
    const darkMq = window.matchMedia(DARK_QUERY);
    const onMobile = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    const onDark = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mobileMq.addEventListener('change', onMobile);
    darkMq.addEventListener('change', onDark);
    return () => {
      mobileMq.removeEventListener('change', onMobile);
      darkMq.removeEventListener('change', onDark);
    };
  }, []);

  // ── Window resize → sidebar ─────────────────────────────────────────────────
  useEffect(() => {
    const handle = () => setIsSidebarOpen(window.innerWidth >= 768);
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, []);

  // ── Load profile from Convex ────────────────────────────────────────────────
  const loadProfile = async (uid: string, email: string | null) => {
    setUserId(uid);
    setAuthEmail(email);
    try {
      let profile = await convex.query(convexApi.profiles.getByUserId, { userId: uid });
      if (!profile) {
        await convex.mutation(convexApi.profiles.upsert, {
          userId: uid,
          name: email?.split('@')[0] || 'User',
          email: email ?? '',
        });
        profile = await convex.query(convexApi.profiles.getByUserId, { userId: uid });
      }
      setRole((profile?.role as UserRole) || UserRole.LEARNER);
      setDisplayName(profile?.name || email?.split('@')[0] || null);
      setAvatarUrl(profile?.avatarUrl || null);
      if (profile?.walletAddress) {
        setWalletAddress(profile.walletAddress);
        localStorage.setItem(WALLET_KEY, profile.walletAddress);
      }
    } catch (e) {
      console.error('loadProfile:', e);
      setRole(UserRole.LEARNER);
      setDisplayName(email?.split('@')[0] || null);
    }
  };

  // ── Session restore on startup ──────────────────────────────────────────────
  useEffect(() => {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    if (sessionStr) {
      try {
        const { userId: uid, email } = JSON.parse(sessionStr) as { userId: string; email: string };
        if (uid) {
          loadProfile(uid, email ?? null).finally(() => setAuthReady(true));
          return;
        }
      } catch {
        // corrupted — fall through
      }
    }
    setAuthReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  const refreshProfile = async () => {
    if (!userId) return;
    const profile = await convex.query(convexApi.profiles.getByUserId, { userId });
    if (!profile) return;
    setDisplayName(profile.name);
    setAvatarUrl(profile.avatarUrl || null);
  };

  // ── Login success callback (called by Login.tsx after signIn/signUp) ────────
  const handleLoginSuccess = async (uid: string, email: string) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: uid, email }));
    await loadProfile(uid, email);
    window.location.hash = '#/dashboard';
  };

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(WALLET_KEY);
    setRole(UserRole.GUEST);
    setUserId(null);
    setAuthEmail(null);
    setWalletAddress(null);
    setDisplayName(null);
    setAvatarUrl(null);
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
    // If logged in, persist wallet to Convex profile
    if (userId) {
      try {
        const profile = await convex.query(convexApi.profiles.getByUserId, { userId });
        await convex.mutation(convexApi.profiles.upsert, {
          userId,
          name: profile?.name || displayName || '',
          email: profile?.email || authEmail || '',
          walletAddress: address,
        });
      } catch (e) {
        console.error('handleConnectWallet:', e);
      }
    }
  };

  const effectiveUserId = userId || 'u_demo';

  // Show nothing until session has been resolved (avoids flash of GUEST state)
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

  const isGuest = role === UserRole.GUEST;

  return (
    <HashRouter>
      {isGuest ? (
        /* ── Guest layout: Navbar + full-page content ─────────────── */
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}>
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
            displayName={displayName}
          />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login onWalletLogin={handleWalletLogin} onLoginSuccess={handleLoginSuccess} />} />
              <Route path="/join" element={<Navigate to="/login" />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/web3academy/privacy" element={<Web3AcademyPrivacy />} />
              <Route path="/courses" element={<CourseList />} />
              <Route path="/courses/:id" element={<CourseDetail />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      ) : (
        /* ── Auth layout: Sidebar + content ───────────────────────── */
        <div className="flex" style={{ height: '100vh', overflow: 'hidden', color: 'var(--color-text-primary)', minWidth: 0 }}>
          <Sidebar
            role={role}
            isOpen={isSidebarOpen}
            setIsOpen={setIsSidebarOpen}
            onLogout={logout}
            displayName={displayName}
            authEmail={authEmail}
            userId={userId}
            avatarUrl={avatarUrl}
            isDarkMode={effectiveDark}
            onToggleTheme={toggleTheme}
          />

          <div className="flex-1 flex flex-col overflow-hidden" style={{ minWidth: 0, width: 0 }}>
            {/* Mobile top bar */}
            <header
              className="md:hidden flex items-center gap-3 shrink-0 px-4"
              style={{
                height: 56,
                backgroundColor: 'var(--color-bg-card)',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              <Logo className="w-7 h-7" />
              <span style={{ fontWeight: 700, fontSize: 15 }}>FINODIV</span>
              {userId && (
                <img
                  src={avatarUrl || `https://i.pravatar.cc/100?u=${userId}`}
                  alt="avatar"
                  style={{ marginLeft: 'auto', width: 32, height: 32, borderRadius: 8, objectFit: 'cover' }}
                />
              )}
            </header>

            <main
              className="flex-1 overflow-y-auto custom-scrollbar auth-main-content"
              style={{ backgroundColor: 'var(--color-app-bg)' }}
            >
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="/login" element={<Login onWalletLogin={handleWalletLogin} onLoginSuccess={handleLoginSuccess} />} />
              <Route path="/join" element={<Navigate to="/login" />} />

              <Route
                path="/dashboard"
                element={
                  !userId                    ? <Navigate to="/login"    /> :
                  role === UserRole.ADMIN    ? <AdminDashboard />         :
                  role === UserRole.EDUCATOR ? <Navigate to="/educator" /> :
                  <Dashboard role={role} />
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

              <Route path="/career-compass" element={!userId ? <Navigate to="/login" /> : <CareerCompass />} />
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
                element={!userId ? <Navigate to="/login" /> : <Community role={role} />}
              />
              <Route
                path="/settings"
                element={
                  !userId ? (
                    <Navigate to="/login" />
                  ) : (
                    <Settings
                      userId={effectiveUserId}
                      role={role}
                      authEmail={authEmail}
                      walletAddress={walletAddress}
                      onBindWallet={handleConnectWallet}
                      onProfileUpdated={refreshProfile}
                    />
                  )
                }
              />

              <Route path="/jobs" element={!userId ? <Navigate to="/login" /> : <Jobs role={role} />} />
              <Route path="/messages" element={<Navigate to="/community" />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Educator portal */}
              <Route path="/educator" element={!userId ? <Navigate to="/login" /> : (role === UserRole.EDUCATOR || role === UserRole.ADMIN ? <EducatorDashboard /> : <Navigate to="/dashboard" />)} />
              <Route path="/educator/upload" element={!userId ? <Navigate to="/login" /> : (role === UserRole.EDUCATOR || role === UserRole.ADMIN ? <CourseUpload /> : <Navigate to="/dashboard" />)} />
              <Route path="/educator/submissions" element={!userId ? <Navigate to="/login" /> : (role === UserRole.EDUCATOR || role === UserRole.ADMIN ? <EducatorDashboard submissionsView /> : <Navigate to="/dashboard" />)} />
              <Route path="/educator/submissions/:courseId" element={!userId ? <Navigate to="/login" /> : (role === UserRole.EDUCATOR || role === UserRole.ADMIN ? <ViewSubmissions /> : <Navigate to="/dashboard" />)} />

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </div>
      )}
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
