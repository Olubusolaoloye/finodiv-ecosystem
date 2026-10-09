import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserRole } from '../types';
import { convex } from '../services/convex';
import { api } from '../convex/_generated/api';
import {
  Mail, Lock, Eye, EyeOff, Loader2,
  AlertCircle, User, ArrowRight,
} from 'lucide-react';

interface LoginProps {
  onWalletLogin: (address: string, role: UserRole) => void;
  onLoginSuccess?: (userId: string, email: string) => Promise<void>;
}

type Tab = 'signin' | 'signup';

// ── Shared field styles via CSS vars ─────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%',
  backgroundColor: 'var(--color-bg-deep)',
  border: '1px solid var(--color-border)',
  borderRadius: '10px',
  padding: '12px 16px 12px 42px',
  fontSize: '14px',
  color: 'var(--color-text-primary)',
  outline: 'none',
  transition: 'border-color 0.15s',
};
const labelStyle: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  color: 'var(--color-text-muted)',
  display: 'block',
  marginBottom: '6px',
};

// ── Sub-components ────────────────────────────────────────────────────────────

const PasswordInput: React.FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  onEnter?: () => void;
}> = ({ value, onChange, placeholder = 'Password', onEnter }) => {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative">
      <Lock
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
        style={{ color: 'var(--color-text-muted)' }}
        aria-hidden="true"
      />
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onEnter?.()}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...inputStyle,
          paddingRight: '42px',
          borderColor: focused ? 'rgba(139,92,246,0.6)' : 'var(--color-border)',
        }}
      />
      <button
        type="button"
        onClick={() => setShow(p => !p)}
        className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
        style={{ color: 'var(--color-text-muted)' }}
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
};

const EmailInput: React.FC<{
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  autoFocus?: boolean;
}> = ({ value, onChange, onEnter, autoFocus }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative">
      <Mail
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
        style={{ color: 'var(--color-text-muted)' }}
        aria-hidden="true"
      />
      <input
        type="email"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onEnter?.()}
        placeholder="your@email.com"
        autoFocus={autoFocus}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...inputStyle,
          borderColor: focused ? 'rgba(139,92,246,0.6)' : 'var(--color-border)',
        }}
      />
    </div>
  );
};

const ErrBox: React.FC<{ msg: string }> = ({ msg }) => (
  <div
    className="flex items-start gap-3 p-4 rounded-[10px]"
    style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}
  >
    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#f87171' }} />
    <p className="text-sm font-medium" style={{ color: '#f87171' }}>{msg}</p>
  </div>
);

const PrimaryBtn: React.FC<{
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}> = ({ onClick, disabled, loading, children }) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    className="w-full flex items-center justify-center gap-2 py-3 rounded-[10px] text-sm font-semibold text-white transition-colors duration-150 disabled:opacity-60"
    style={{ backgroundColor: 'var(--color-accent)' }}
    onMouseEnter={e => !disabled && !loading && (e.currentTarget.style.backgroundColor = 'var(--color-accent-hover)')}
    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--color-accent)')}
  >
    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
    {children}
  </button>
);

// ── FINODIV logo SVG ──────────────────────────────────────────────────────────

const Logo: React.FC<{ size?: number }> = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="lg-login" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#7C3AED" />
        <stop offset="100%" stopColor="#3B82F6" />
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="28" fill="url(#lg-login)" />
    <ellipse cx="54" cy="36" rx="22" ry="9" fill="white" transform="rotate(-35 54 36)" />
    <ellipse cx="47" cy="53" rx="17" ry="7" fill="white" transform="rotate(-35 47 53)" />
    <ellipse cx="40" cy="68" rx="11" ry="4.5" fill="white" transform="rotate(-35 40 68)" />
  </svg>
);

// ── Left branding panel ───────────────────────────────────────────────────────

const BrandPanel: React.FC = () => (
  <div
    className="hidden lg:flex flex-1 flex-col justify-between p-14 relative overflow-hidden"
    style={{ backgroundColor: 'var(--color-bg-deep)', borderRight: '1px solid var(--color-border)' }}
  >
    {/* Subtle ambient glow */}
    <div
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
      style={{ background: 'radial-gradient(ellipse at 30% 20%, rgba(139,92,246,0.08) 0%, transparent 60%)' }}
      aria-hidden="true"
    />

    {/* Middle: main copy */}
    <div className="relative z-10 max-w-sm">
      <p className="eyebrow mb-5">Africa's #1 Financial Education Platform</p>

      <h1 className="text-4xl font-semibold leading-tight tracking-tight mb-6" style={{ color: 'var(--color-text-primary)' }}>
        Learn to build{' '}
        <span style={{
          background: 'linear-gradient(135deg, #7C3AED, #3B82F6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          real wealth
        </span>
        {' '}in any economy.
      </h1>

      <p className="text-sm leading-relaxed mb-10" style={{ color: 'var(--color-text-muted)' }}>
        Master forex, crypto, DeFi, and digital income skills — taught in plain language, priced in Naira.
      </p>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { value: '12,400+', label: 'Students' },
          { value: '34',      label: 'Courses'  },
          { value: '91%',     label: 'Completion' },
        ].map(({ value, label }) => (
          <div
            key={label}
            className="flex flex-col gap-1 p-4 rounded-[14px]"
            style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
          >
            <span className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>{value}</span>
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Bottom: copyright */}
    <p className="text-xs relative z-10" style={{ color: 'var(--color-text-muted)' }}>
      © 2026 FINODIV. All rights reserved.
    </p>
  </div>
);

// ── Main Login component ──────────────────────────────────────────────────────

const Login: React.FC<LoginProps> = ({ onWalletLogin: _, onLoginSuccess }) => {
  const [tab, setTab]         = useState<Tab>('signin');
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg]   = useState('');

  /* Sign-in fields */
  const [siEmail, setSiEmail] = useState('');
  const [siPass,  setSiPass]  = useState('');

  /* Sign-up fields */
  const [suName,    setSuName]    = useState('');
  const [suEmail,   setSuEmail]   = useState('');
  const [suPass,    setSuPass]    = useState('');
  const [suConfirm, setSuConfirm] = useState('');
  const [suRole,    setSuRole]    = useState<'LEARNER' | 'EMPLOYER' | 'EDUCATOR'>('LEARNER');

  /* Forgot password */
  const [forgotMode,  setForgotMode]  = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const clearErr = () => setErrMsg('');

  /* ── Sign In ────────────────────────────────────────────────────────────── */
  const handleSignIn = async () => {
    clearErr();
    if (!siEmail.trim()) { setErrMsg('Please enter your email.'); return; }
    if (!siPass)         { setErrMsg('Please enter your password.'); return; }
    setLoading(true);
    try {
      const result = await convex.action(api.authActions.signIn, {
        email: siEmail.trim().toLowerCase(),
        password: siPass,
      });
      if (result.error || !result.userId) {
        setErrMsg(result.error ?? 'Sign in failed. Please try again.');
      } else {
        await onLoginSuccess?.(result.userId, result.email ?? siEmail.trim().toLowerCase());
      }
    } catch (e: any) {
      setErrMsg(e?.message ?? 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Sign Up ────────────────────────────────────────────────────────────── */
  const handleSignUp = async () => {
    clearErr();
    if (!suName.trim())       { setErrMsg('Please enter your full name.'); return; }
    if (!suEmail.trim())      { setErrMsg('Please enter your email.'); return; }
    if (suPass.length < 8)    { setErrMsg('Password must be at least 8 characters.'); return; }
    if (suPass !== suConfirm) { setErrMsg('Passwords do not match.'); return; }

    setLoading(true);
    try {
      const result = await convex.action(api.authActions.signUp, {
        email: suEmail.trim().toLowerCase(),
        password: suPass,
        name: suName.trim(),
        role: suRole,
      });
      if (result.error || !result.userId) {
        setErrMsg(result.error ?? 'Sign up failed. Please try again.');
      } else {
        await onLoginSuccess?.(result.userId, suEmail.trim().toLowerCase());
      }
    } catch (e: any) {
      setErrMsg(e?.message ?? 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Forgot Password ───────────────────────────────────────────────────── */
  const handleForgotPassword = () => {
    clearErr();
    setErrMsg('Password reset via email is not currently available. Please contact support at devolufinodiv@gmail.com to reset your password.');
  };

  // ── Card wrapper shared by full-page flows ─────────────────────────────────
  const card = (children: React.ReactNode) => (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div
        className="w-full max-w-md rounded-[20px] p-8"
        style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
      >
        {children}
      </div>
    </div>
  );

  /* ── Forgot password screen ───────────────────────────────────────────── */
  if (forgotMode) return card(
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>Reset password</h2>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Contact support to reset your password</p>
      </div>
      {errMsg && <ErrBox msg={errMsg} />}
      <div>
        <label style={labelStyle}>Your email</label>
        <EmailInput
          value={forgotEmail}
          onChange={v => { setForgotEmail(v); clearErr(); }}
          onEnter={handleForgotPassword}
          autoFocus
        />
      </div>
      <PrimaryBtn onClick={handleForgotPassword}>
        <Mail className="w-4 h-4" />
        Get Reset Instructions
      </PrimaryBtn>
      <button
        onClick={() => { setForgotMode(false); clearErr(); }}
        className="text-sm text-center transition-opacity hover:opacity-70"
        style={{ color: 'var(--color-text-muted)' }}
      >
        ← Back to Sign In
      </button>
    </div>
  );

  /* ══════════════════════════════════════════════════════════════════════════
     Main layout: branding left + form right
  ══════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <BrandPanel />

      {/* Right: form panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12">

        {/* Mobile logo — visible on small screens only */}
        <Link to="/" className="flex items-center gap-3 mb-8 lg:hidden">
          <Logo size={32} />
          <span className="text-base font-semibold tracking-widest" style={{ color: 'var(--color-text-primary)' }}>FINODIV</span>
        </Link>

        <div
          className="w-full max-w-sm rounded-[20px] p-7"
          style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
        >
          {/* Tab switcher */}
          <div
            className="flex p-1 rounded-[10px] mb-7"
            style={{ backgroundColor: 'var(--color-bg-deep)' }}
          >
            {(['signin', 'signup'] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); clearErr(); }}
                className="flex-1 py-2 rounded-[8px] text-xs font-semibold transition-all duration-150"
                style={{
                  backgroundColor: tab === t ? 'var(--color-bg-card)' : 'transparent',
                  color: tab === t ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                  boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.15)' : 'none',
                }}
              >
                {t === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* ── SIGN IN ─────────────────────────────────────────────────── */}
          {tab === 'signin' && (
            <div className="flex flex-col gap-5">
              <div className="mb-1">
                <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Welcome back</h2>
                <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Sign in to your account</p>
              </div>

              {errMsg && <ErrBox msg={errMsg} />}

              <div>
                <label style={labelStyle}>Email address</label>
                <EmailInput
                  value={siEmail}
                  onChange={v => { setSiEmail(v); clearErr(); }}
                  onEnter={handleSignIn}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label style={{ ...labelStyle, marginBottom: 0 }}>Password</label>
                  <button
                    type="button"
                    className="text-[10px] font-semibold uppercase tracking-wide transition-opacity hover:opacity-70"
                    style={{ color: 'var(--color-accent-hover)' }}
                    onClick={() => { setForgotEmail(siEmail); setForgotMode(true); clearErr(); }}
                  >
                    Forgot?
                  </button>
                </div>
                <PasswordInput
                  value={siPass}
                  onChange={v => { setSiPass(v); clearErr(); }}
                  onEnter={handleSignIn}
                />
              </div>

              <PrimaryBtn onClick={handleSignIn} loading={loading}>
                {!loading && <Lock className="w-4 h-4" />}
                Sign In
              </PrimaryBtn>

              <p className="text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
                No account?{' '}
                <button
                  onClick={() => { setTab('signup'); clearErr(); }}
                  className="font-semibold transition-opacity hover:opacity-75"
                  style={{ color: 'var(--color-accent-hover)' }}
                >
                  Create one <ArrowRight className="w-3 h-3 inline" />
                </button>
              </p>
            </div>
          )}

          {/* ── SIGN UP ─────────────────────────────────────────────────── */}
          {tab === 'signup' && (
            <div className="flex flex-col gap-4">
              <div className="mb-1">
                <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Join FINODIV</h2>
                <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Start your financial education journey</p>
              </div>

              {errMsg && <ErrBox msg={errMsg} />}

              {/* Role selector */}
              <div>
                <label style={labelStyle}>I am a…</label>
                <div className="flex gap-2">
                  {([
                    { role: 'LEARNER',  label: 'Learner'  },
                    { role: 'EDUCATOR', label: 'Educator' },
                    { role: 'EMPLOYER', label: 'Employer' },
                  ] as const).map(({ role: r, label }) => (
                    <button
                      key={r}
                      onClick={() => setSuRole(r)}
                      className="flex-1 py-2 rounded-[8px] text-xs font-medium transition-all duration-150"
                      style={{
                        backgroundColor: suRole === r ? 'rgba(139,92,246,0.12)' : 'var(--color-bg-deep)',
                        border: `1px solid ${suRole === r ? 'rgba(139,92,246,0.4)' : 'var(--color-border)'}`,
                        color: suRole === r ? 'var(--color-accent-hover)' : 'var(--color-text-muted)',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Full name */}
              <div>
                <label style={labelStyle}>Full name</label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                    style={{ color: 'var(--color-text-muted)' }}
                    aria-hidden="true"
                  />
                  <NameInput value={suName} onChange={v => { setSuName(v); clearErr(); }} />
                </div>
              </div>

              {/* Email */}
              <div>
                <label style={labelStyle}>Email address</label>
                <EmailInput value={suEmail} onChange={v => { setSuEmail(v); clearErr(); }} />
              </div>

              {/* Password */}
              <div>
                <label style={labelStyle}>
                  Password <span style={{ textTransform: 'none', fontWeight: 400 }}>(min. 8 chars)</span>
                </label>
                <PasswordInput
                  value={suPass}
                  onChange={v => { setSuPass(v); clearErr(); }}
                  placeholder="Create a password"
                />
              </div>

              {/* Confirm */}
              <div>
                <label style={labelStyle}>Confirm password</label>
                <PasswordInput
                  value={suConfirm}
                  onChange={v => { setSuConfirm(v); clearErr(); }}
                  placeholder="Repeat password"
                  onEnter={handleSignUp}
                />
              </div>

              <PrimaryBtn onClick={handleSignUp} loading={loading}>
                {loading ? 'Creating account…' : 'Create My Account'}
              </PrimaryBtn>

              <p className="text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Already a member?{' '}
                <button
                  onClick={() => { setTab('signin'); clearErr(); }}
                  className="font-semibold transition-opacity hover:opacity-75"
                  style={{ color: 'var(--color-accent-hover)' }}
                >
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

// Separate inline component to avoid hook-in-callback issues
const NameInput: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder="Your full name"
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...inputStyle,
        borderColor: focused ? 'rgba(139,92,246,0.6)' : 'var(--color-border)',
      }}
    />
  );
};

export default Login;
