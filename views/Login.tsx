
import React, { useState } from 'react';
import { UserRole } from '../types';
import { supabase } from '../services/supabase';
import { Mail, Wallet, Zap, Lock, Loader2, Key, CheckCircle } from 'lucide-react';
import Logo from '../components/Logo';

interface LoginProps {
  onWalletLogin: (address: string, role: UserRole) => void;
}

const Login: React.FC<LoginProps> = ({ onWalletLogin }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [showSignPrompt, setShowSignPrompt] = useState(false);
  const [pendingAddress, setPendingAddress] = useState<string | null>(null);

  const sendOtp = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    if (error) { alert(error.message); return false; }
    return true;
  };

  const handleEmailLogin = async () => {
    if (!loginEmail.trim()) { alert('Please enter your email address.'); return; }
    setLoading('email');
    const ok = await sendOtp(loginEmail.trim());
    setLoading(null);
    if (ok) { setOtpEmail(loginEmail.trim()); setOtpSent(true); }
  };

  const handleAdminLogin = async () => {
    setLoading('admin');
    const ok = await sendOtp('devolufinodiv@gmail.com');
    setLoading(null);
    if (ok) { setOtpEmail('devolufinodiv@gmail.com'); setOtpSent(true); }
  };

  const handleWalletAuth = async () => {
    setLoading('wallet');
    try {
      let accounts: string[] = [];
      if (typeof (window as any).ethereum !== 'undefined') {
        accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
      } else {
        accounts = ['0x71C24961234567890ABCDEF12345678901234567'];
      }
      setPendingAddress(accounts[0]);
      setShowSignPrompt(true);
    } catch { /* user rejected */ }
    setLoading(null);
  };

  const confirmWalletSignature = async () => {
    if (!pendingAddress) return;
    setLoading('signing');
    // Simulate signing delay
    await new Promise(r => setTimeout(r, 1200));
    onWalletLogin(pendingAddress, UserRole.LEARNER);
    setLoading(null);
    setShowSignPrompt(false);
  };

  // ── OTP sent confirmation screen ────────────────────────────────────────────
  if (otpSent) {
    return (
      <div className="min-h-screen w-full bg-slate-50 dark:bg-[#0b0e14] flex items-center justify-center p-8 transition-colors duration-300">
        <div className="w-full max-w-md bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[48px] p-12 text-center shadow-2xl backdrop-blur-3xl">
          <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-8 text-emerald-500">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black mb-4 tracking-tight text-slate-900 dark:text-white">Check Your Email</h2>
          <p className="text-slate-500 dark:text-gray-400 text-sm mb-2 leading-relaxed">
            A magic link was sent to
          </p>
          <p className="font-bold text-blue-500 mb-8">{otpEmail}</p>
          <p className="text-slate-400 dark:text-gray-600 text-xs leading-relaxed mb-10">
            Click the link in the email to sign in. You can close this tab after clicking it.
          </p>
          <button
            onClick={() => { setOtpSent(false); setLoginEmail(''); }}
            className="w-full py-4 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 font-bold hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-[#0b0e14] flex flex-col lg:flex-row relative overflow-x-hidden transition-colors duration-300">

      {/* Left Side: Branding */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-16 relative z-10 border-r border-slate-200 dark:border-white/5">
        <div className="flex items-center gap-4 group cursor-pointer">
          <Logo className="w-12 h-12 group-hover:scale-110 transition-transform" />
          <span className="text-2xl font-black tracking-widest text-slate-900 dark:text-white">FINODIV</span>
        </div>
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest mb-8">
            <Zap className="w-4 h-4 fill-current" /> Next-Gen Web3 Talent
          </div>
          <h1 className="text-6xl font-black mb-8 leading-tight tracking-tight text-slate-900 dark:text-white">
            The Future of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-500">Decentralized Work</span>
          </h1>
          <p className="text-slate-500 dark:text-gray-400 text-xl leading-relaxed mb-12">
            Sign in with a magic link — no password required. Bind your wallet for a seamless multi-chain experience.
          </p>
        </div>
        <div className="text-sm text-slate-400 dark:text-gray-600 font-bold uppercase tracking-widest">
          &copy; 2024 FINODIV ECOSYSTEM. ALL RIGHTS RESERVED.
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-16 relative z-20">
        <div className="w-full max-w-md bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[48px] p-10 lg:p-12 backdrop-blur-3xl shadow-2xl relative transition-colors">

          {showSignPrompt ? (
            <div className="text-center animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 rounded-3xl bg-blue-500/10 flex items-center justify-center mx-auto mb-8 text-blue-500">
                <Key className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-black mb-4 tracking-tight dark:text-white">Sign Message</h2>
              <p className="text-slate-500 dark:text-gray-400 text-sm mb-10 leading-relaxed">
                Verify ownership of{' '}
                <span className="font-mono text-blue-500">
                  {pendingAddress?.slice(0, 6)}...{pendingAddress?.slice(-4)}
                </span>
              </p>
              <div className="space-y-4">
                <button
                  onClick={confirmWalletSignature}
                  disabled={loading === 'signing'}
                  className="w-full py-4 rounded-2xl bg-blue-600 text-white font-black shadow-xl shadow-blue-500/20 hover:bg-blue-500 transition-all flex items-center justify-center gap-3"
                >
                  {loading === 'signing' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign Verification'}
                </button>
                <button
                  onClick={() => setShowSignPrompt(false)}
                  className="w-full py-4 text-slate-400 font-bold hover:text-slate-600 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-10">
                <h2 className="text-3xl font-black mb-2 tracking-tight dark:text-white">Access Portal</h2>
                <p className="text-slate-500 dark:text-gray-500 text-sm">Sign in to your professional hub</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500 px-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleEmailLogin()}
                    placeholder="your@email.com"
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600"
                  />
                </div>

                <button
                  onClick={handleEmailLogin}
                  disabled={!!loading}
                  className="w-full py-4 px-6 rounded-2xl bg-[#2F6DF2] hover:bg-blue-600 transition-all font-black flex items-center justify-center gap-4 text-white shadow-xl shadow-blue-500/20 disabled:opacity-50"
                >
                  {loading === 'email' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}
                  Send Magic Link
                </button>

                <div className="flex items-center gap-4 py-4">
                  <div className="flex-1 h-px bg-slate-200 dark:bg-white/5"></div>
                  <span className="text-[10px] font-black text-slate-400 dark:text-gray-700 uppercase tracking-[0.3em]">OR USE WEB3</span>
                  <div className="flex-1 h-px bg-slate-200 dark:bg-white/5"></div>
                </div>

                <button
                  onClick={handleWalletAuth}
                  disabled={!!loading}
                  className="w-full py-4 px-6 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 transition-all font-black flex items-center justify-center gap-4 text-slate-700 dark:text-gray-200 disabled:opacity-50"
                >
                  {loading === 'wallet' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wallet className="w-5 h-5 text-blue-500" />}
                  Connect Wallet
                </button>

                <div className="pt-8">
                  <button
                    onClick={handleAdminLogin}
                    disabled={!!loading}
                    className="w-full py-4 px-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/5 text-slate-400 dark:text-gray-600 hover:border-blue-500/30 hover:text-blue-500 transition-all font-bold flex items-center justify-center gap-3 text-xs uppercase tracking-widest disabled:opacity-50"
                  >
                    {loading === 'admin' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                    Administrator Portal
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
