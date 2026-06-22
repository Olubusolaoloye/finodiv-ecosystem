
import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Lock, Loader2, CheckCircle2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import Logo from '../components/Logo';
import { Link } from 'react-router-dom';

const ResetPassword: React.FC = () => {
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [loading, setLoading]     = useState(false);
  const [errMsg, setErrMsg]       = useState('');
  const [done, setDone]           = useState(false);
  const [showPass, setShowPass]   = useState(false);
  const [showConf, setShowConf]   = useState(false);

  const handleReset = async () => {
    setErrMsg('');
    if (password.length < 8)     { setErrMsg('Password must be at least 8 characters.'); return; }
    if (password !== confirm)    { setErrMsg('Passwords do not match.'); return; }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) { setErrMsg(error.message); }
    else { setDone(true); }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0b0e14] flex items-center justify-center p-8 transition-colors duration-300">
        <div className="w-full max-w-md bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[48px] p-12 text-center shadow-2xl">
          <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-8 text-emerald-500">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black mb-4 text-slate-900 dark:text-white">Password Updated!</h2>
          <p className="text-slate-500 dark:text-gray-400 text-sm mb-10 leading-relaxed">
            Your new password has been saved. You can now sign in with your email and new password.
          </p>
          <Link
            to="/dashboard"
            className="block w-full py-4 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-500 transition-all text-center"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0e14] flex items-center justify-center p-8 transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[48px] p-12 shadow-2xl">
        <div className="flex flex-col items-center mb-10">
          <Link to="/" className="mb-6">
            <Logo className="w-12 h-12" />
          </Link>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Set New Password</h2>
          <p className="text-slate-500 dark:text-gray-500 text-sm mt-1">Choose a strong password for your account</p>
        </div>

        <div className="space-y-5">
          {errMsg && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400 font-semibold">{errMsg}</p>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500 px-1">
              New Password <span className="normal-case font-normal">(min. 8 characters)</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setErrMsg(''); }}
                placeholder="New password"
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-11 pr-12 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-gray-300 transition-colors"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500 px-1">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showConf ? 'text' : 'password'}
                value={confirm}
                onChange={e => { setConfirm(e.target.value); setErrMsg(''); }}
                onKeyDown={e => e.key === 'Enter' && handleReset()}
                placeholder="Repeat password"
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-11 pr-12 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600"
              />
              <button
                type="button"
                onClick={() => setShowConf(p => !p)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-gray-300 transition-colors"
              >
                {showConf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            onClick={handleReset}
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 transition-all disabled:opacity-60 mt-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
            {loading ? 'Saving…' : 'Save New Password'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
