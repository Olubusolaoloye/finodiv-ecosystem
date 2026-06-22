
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserRole } from '../types';
import { supabase } from '../services/supabase';
import {
  Mail, Lock, Eye, EyeOff, Wallet, Zap, Loader2,
  Key, AlertCircle, CheckCircle2, User, ArrowRight,
} from 'lucide-react';
import Logo from '../components/Logo';

interface LoginProps {
  onWalletLogin: (address: string, role: UserRole) => void;
}

type Tab = 'signin' | 'signup';

const PasswordInput: React.FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  onEnter?: () => void;
}> = ({ value, onChange, placeholder = 'Password', onEnter }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onEnter?.()}
        placeholder={placeholder}
        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-6 pr-12 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600"
      />
      <button
        type="button"
        onClick={() => setShow(p => !p)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-gray-300 transition-colors"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
};

const ErrBox: React.FC<{ msg: string }> = ({ msg }) => (
  <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
    <p className="text-sm text-red-600 dark:text-red-400 font-semibold">{msg}</p>
  </div>
);

const Login: React.FC<LoginProps> = ({ onWalletLogin }) => {
  const [tab, setTab]           = useState<Tab>('signin');
  const [loading, setLoading]   = useState(false);
  const [errMsg, setErrMsg]     = useState('');
  const [signedUp, setSignedUp] = useState(false); // email-confirm-required state

  /* Sign-in fields */
  const [siEmail, setSiEmail]   = useState('');
  const [siPass,  setSiPass]    = useState('');

  /* Sign-up fields */
  const [suName,    setSuName]    = useState('');
  const [suEmail,   setSuEmail]   = useState('');
  const [suPass,    setSuPass]    = useState('');
  const [suConfirm, setSuConfirm] = useState('');
  const [suRole,    setSuRole]    = useState<'LEARNER' | 'EMPLOYER'>('LEARNER');

  /* Wallet */
  const [pendingAddr,    setPendingAddr]    = useState<string | null>(null);
  const [showSignPrompt, setShowSignPrompt] = useState(false);
  const [walletLoading,  setWalletLoading]  = useState(false);

  const clearErr = () => setErrMsg('');

  /* ── Sign In ────────────────────────────────────────────────────────────── */
  const handleSignIn = async () => {
    clearErr();
    if (!siEmail.trim()) { setErrMsg('Please enter your email.'); return; }
    if (!siPass)         { setErrMsg('Please enter your password.'); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: siEmail.trim().toLowerCase(),
      password: siPass,
    });
    setLoading(false);
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        setErrMsg('Incorrect email or password. Please try again.');
      } else if (error.message.includes('Email not confirmed')) {
        setErrMsg('Please confirm your email before signing in. Check your inbox.');
      } else {
        setErrMsg(error.message);
      }
    }
    // On success: App.tsx SIGNED_IN event fires and handles routing
  };

  /* ── Sign Up ────────────────────────────────────────────────────────────── */
  const handleSignUp = async () => {
    clearErr();
    if (!suName.trim())   { setErrMsg('Please enter your full name.'); return; }
    if (!suEmail.trim())  { setErrMsg('Please enter your email.'); return; }
    if (suPass.length < 8){ setErrMsg('Password must be at least 8 characters.'); return; }
    if (suPass !== suConfirm) { setErrMsg('Passwords do not match.'); return; }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: suEmail.trim().toLowerCase(),
      password: suPass,
      options: {
        data: { name: suName.trim(), role: suRole },
      },
    });
    setLoading(false);

    if (error) {
      if (error.message.includes('User already registered')) {
        setErrMsg('An account with this email already exists. Sign in instead.');
      } else {
        setErrMsg(error.message);
      }
      return;
    }

    if (data.session) {
      // Email confirmation is disabled → user is immediately signed in
      // If EMPLOYER role, update profile (the trigger defaults to LEARNER)
      if (suRole === 'EMPLOYER' && data.user) {
        await supabase.from('profiles').update({ role: 'EMPLOYER' }).eq('id', data.user.id);
      }
      // App.tsx SIGNED_IN event handles routing
    } else {
      // Email confirmation is required — show the confirmation screen
      setSignedUp(true);
    }
  };

  /* ── Forgot Password ───────────────────────────────────────────────────── */
  const [forgotMode, setForgotMode]       = useState(false);
  const [forgotEmail, setForgotEmail]     = useState('');
  const [forgotSent, setForgotSent]       = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleForgotPassword = async () => {
    clearErr();
    if (!forgotEmail.trim()) { setErrMsg('Please enter your email address.'); return; }
    setForgotLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(
      forgotEmail.trim().toLowerCase(),
      { redirectTo: window.location.origin },
    );
    setForgotLoading(false);
    if (error) { setErrMsg(error.message); } else { setForgotSent(true); }
  };

  /* ── Wallet ─────────────────────────────────────────────────────────────── */
  const handleWalletAuth = async () => {
    setWalletLoading(true);
    try {
      let accounts: string[] = [];
      if (typeof (window as any).ethereum !== 'undefined') {
        accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
      } else {
        accounts = ['0x71C24961234567890ABCDEF12345678901234567'];
      }
      setPendingAddr(accounts[0]);
      setShowSignPrompt(true);
    } catch { /* user rejected */ }
    setWalletLoading(false);
  };

  const confirmWalletSignature = async () => {
    if (!pendingAddr) return;
    setWalletLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    onWalletLogin(pendingAddr, UserRole.LEARNER);
    setWalletLoading(false);
    setShowSignPrompt(false);
  };

  /* ── Email confirm sent screen ──────────────────────────────────────────── */
  if (signedUp) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0b0e14] flex items-center justify-center p-8 transition-colors duration-300">
        <div className="w-full max-w-md bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[48px] p-12 text-center shadow-2xl">
          <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-8 text-emerald-500">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black mb-4 text-slate-900 dark:text-white">Check Your Email</h2>
          <p className="text-slate-500 dark:text-gray-400 text-sm mb-2 leading-relaxed">
            A confirmation link was sent to
          </p>
          <p className="font-bold text-blue-500 mb-8">{suEmail}</p>
          <p className="text-slate-400 dark:text-gray-600 text-xs leading-relaxed mb-10">
            Click the link in your email to activate your account, then come back and sign in.
          </p>
          <button
            onClick={() => { setSignedUp(false); setTab('signin'); setSiEmail(suEmail); }}
            className="w-full py-4 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-500 transition-all"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  /* ── Forgot password screen ─────────────────────────────────────────────── */
  if (forgotMode) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0b0e14] flex items-center justify-center p-8 transition-colors duration-300">
        <div className="w-full max-w-md bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[48px] p-12 shadow-2xl">
          {forgotSent ? (
            <div className="text-center">
              <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-8 text-emerald-500">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-black mb-4 text-slate-900 dark:text-white">Reset Email Sent</h2>
              <p className="text-slate-500 dark:text-gray-400 text-sm mb-2 leading-relaxed">
                We sent a password reset link to
              </p>
              <p className="font-bold text-blue-500 mb-8">{forgotEmail}</p>
              <p className="text-slate-400 dark:text-gray-600 text-xs leading-relaxed mb-10">
                Click the link in your email to set a new password. Check your spam folder if you don't see it.
              </p>
              <button
                onClick={() => { setForgotMode(false); setForgotSent(false); setSiEmail(forgotEmail); }}
                className="w-full py-4 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-500 transition-all"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center mb-2">
                <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Reset Password</h2>
                <p className="text-slate-500 dark:text-gray-500 text-sm mt-1">We'll send you a reset link</p>
              </div>

              {errMsg && <ErrBox msg={errMsg} />}

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500 px-1">
                  Your Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={e => { setForgotEmail(e.target.value); clearErr(); }}
                    onKeyDown={e => e.key === 'Enter' && handleForgotPassword()}
                    placeholder="your@email.com"
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-11 pr-5 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600"
                    autoFocus
                  />
                </div>
              </div>

              <button
                onClick={handleForgotPassword}
                disabled={forgotLoading}
                className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 transition-all disabled:opacity-60"
              >
                {forgotLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}
                Send Reset Link
              </button>

              <button
                onClick={() => { setForgotMode(false); clearErr(); }}
                className="w-full py-3 text-slate-400 font-bold hover:text-slate-600 dark:hover:text-white transition-colors text-sm"
              >
                ← Back to Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ── Wallet signature prompt ─────────────────────────────────────────────── */
  if (showSignPrompt) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0b0e14] flex items-center justify-center p-8 transition-colors duration-300">
        <div className="w-full max-w-md bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[48px] p-12 text-center shadow-2xl">
          <div className="w-20 h-20 rounded-3xl bg-blue-500/10 flex items-center justify-center mx-auto mb-8 text-blue-500">
            <Key className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black mb-4 dark:text-white">Sign Message</h2>
          <p className="text-slate-500 dark:text-gray-400 text-sm mb-10 leading-relaxed">
            Verify ownership of{' '}
            <span className="font-mono text-blue-500">
              {pendingAddr?.slice(0, 6)}...{pendingAddr?.slice(-4)}
            </span>
          </p>
          <div className="space-y-4">
            <button
              onClick={confirmWalletSignature}
              disabled={walletLoading}
              className="w-full py-4 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-500 transition-all flex items-center justify-center gap-3 disabled:opacity-60"
            >
              {walletLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign & Enter'}
            </button>
            <button
              onClick={() => setShowSignPrompt(false)}
              className="w-full py-4 text-slate-400 font-bold hover:text-slate-600 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-[#0b0e14] flex flex-col lg:flex-row relative overflow-x-hidden transition-colors duration-300">

      {/* Left: Branding */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-16 relative z-10 border-r border-slate-200 dark:border-white/5">
        <Link to="/" className="flex items-center gap-4 group w-fit">
          <Logo className="w-12 h-12 group-hover:scale-110 transition-transform" />
          <span className="text-2xl font-black tracking-widest text-slate-900 dark:text-white">FINODIV</span>
        </Link>
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest mb-8">
            <Zap className="w-4 h-4 fill-current" /> Next-Gen Web3 Talent
          </div>
          <h1 className="text-6xl font-black mb-8 leading-tight tracking-tight text-slate-900 dark:text-white">
            The Future of<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-500">
              Decentralized Work
            </span>
          </h1>
          <p className="text-slate-500 dark:text-gray-400 text-xl leading-relaxed">
            Learn Web3 skills, verify proficiency on-chain, and get discovered by top projects.
          </p>
        </div>
        <p className="text-sm text-slate-400 dark:text-gray-600 font-bold uppercase tracking-widest">
          &copy; 2025 FINODIV ECOSYSTEM. ALL RIGHTS RESERVED.
        </p>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-16 relative z-20">
        <div className="w-full max-w-md bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[48px] p-10 lg:p-12 shadow-2xl backdrop-blur-3xl">

          {/* Tabs */}
          <div className="flex p-1.5 bg-slate-100 dark:bg-white/5 rounded-2xl mb-10">
            {(['signin', 'signup'] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); clearErr(); }}
                className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${
                  tab === t
                    ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-gray-500 hover:text-slate-700 dark:hover:text-gray-300'
                }`}
              >
                {t === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* ── SIGN IN ─────────────────────────────────────────────────────── */}
          {tab === 'signin' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Welcome back</h2>
                <p className="text-slate-500 dark:text-gray-500 text-sm mt-1">Sign in to your professional hub</p>
              </div>

              {errMsg && <ErrBox msg={errMsg} />}

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500 px-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={siEmail}
                    onChange={e => { setSiEmail(e.target.value); clearErr(); }}
                    onKeyDown={e => e.key === 'Enter' && handleSignIn()}
                    placeholder="your@email.com"
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-11 pr-5 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500">
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-[10px] font-black text-blue-500 hover:text-blue-600 uppercase tracking-widest transition-colors"
                    onClick={() => { setForgotEmail(siEmail); setForgotMode(true); clearErr(); }}
                  >
                    Forgot?
                  </button>
                </div>
                <PasswordInput value={siPass} onChange={v => { setSiPass(v); clearErr(); }} onEnter={handleSignIn} />
              </div>

              <button
                onClick={handleSignIn}
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 transition-all disabled:opacity-60 mt-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
                Sign In
              </button>

              <div className="flex items-center gap-4 py-2">
                <div className="flex-1 h-px bg-slate-200 dark:bg-white/5" />
                <span className="text-[10px] font-black text-slate-400 dark:text-gray-700 uppercase tracking-[0.3em]">OR</span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-white/5" />
              </div>

              <button
                onClick={handleWalletAuth}
                disabled={walletLoading}
                className="w-full py-4 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 font-black flex items-center justify-center gap-3 text-slate-700 dark:text-gray-200 transition-all disabled:opacity-60"
              >
                {walletLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wallet className="w-5 h-5 text-blue-500" />}
                Connect Wallet
              </button>

              <p className="text-center text-sm text-slate-500 dark:text-gray-500 pt-4">
                Don't have an account?{' '}
                <button onClick={() => { setTab('signup'); clearErr(); }} className="text-blue-500 font-black hover:text-blue-600 transition-colors">
                  Create one <ArrowRight className="w-3 h-3 inline" />
                </button>
              </p>
            </div>
          )}

          {/* ── SIGN UP ─────────────────────────────────────────────────────── */}
          {tab === 'signup' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Join FINODIV</h2>
                <p className="text-slate-500 dark:text-gray-500 text-sm mt-1">Create your professional Web3 profile</p>
              </div>

              {errMsg && <ErrBox msg={errMsg} />}

              {/* Role selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500 px-1">
                  I am a…
                </label>
                <div className="flex gap-3">
                  {(['LEARNER', 'EMPLOYER'] as const).map(r => (
                    <button
                      key={r}
                      onClick={() => setSuRole(r)}
                      className={`flex-1 py-3 rounded-2xl border-2 text-sm font-black transition-all ${
                        suRole === r
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400'
                          : 'border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-500 hover:border-blue-300 dark:hover:border-blue-500/30'
                      }`}
                    >
                      {r === 'LEARNER' ? '🎓 Learner' : '💼 Employer'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Full name */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500 px-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={suName}
                    onChange={e => { setSuName(e.target.value); clearErr(); }}
                    placeholder="Your full name"
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-11 pr-5 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500 px-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={suEmail}
                    onChange={e => { setSuEmail(e.target.value); clearErr(); }}
                    placeholder="your@email.com"
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-11 pr-5 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500 px-1">
                  Password <span className="normal-case font-normal">(min. 8 characters)</span>
                </label>
                <PasswordInput value={suPass} onChange={v => { setSuPass(v); clearErr(); }} placeholder="Create a password" />
              </div>

              {/* Confirm password */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500 px-1">Confirm Password</label>
                <PasswordInput value={suConfirm} onChange={v => { setSuConfirm(v); clearErr(); }} placeholder="Repeat password" onEnter={handleSignUp} />
              </div>

              <button
                onClick={handleSignUp}
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 transition-all disabled:opacity-60 mt-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                {loading ? 'Creating Account…' : 'Create My Account'}
              </button>

              <p className="text-center text-sm text-slate-500 dark:text-gray-500 pt-2">
                Already a member?{' '}
                <button onClick={() => { setTab('signin'); clearErr(); }} className="text-blue-500 font-black hover:text-blue-600 transition-colors">
                  Sign in
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
