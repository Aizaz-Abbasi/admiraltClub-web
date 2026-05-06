import { useState } from 'react';
import { motion } from 'framer-motion';
import { LockIcon, Loader2Icon, CheckCircleIcon } from 'lucide-react';
import { resetPasswordApi } from '../api/auth';
import { getApiErrorMessage } from '../api/client';

interface ResetPasswordPageProps {
  token: string;
}

export function ResetPasswordPage({ token }: ResetPasswordPageProps) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setStatus('loading');
    setError(null);
    try {
      await resetPasswordApi(token, password);
      setStatus('success');
    } catch (err) {
      setError(getApiErrorMessage(err));
      setStatus('idle');
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-navy-800 rounded-3xl shadow-2xl border border-navy-700 overflow-hidden relative z-10"
      >
        <div className="bg-navy-900 p-8 text-center relative overflow-hidden border-b border-navy-700">
          <div className="absolute top-0 left-0 w-full h-1 bg-gold-500 shadow-[0_0_10px_rgba(201,168,76,0.8)]" />
          <img src="/logo.png" alt="The Admiralty Club" className="mx-auto mb-4 h-20 w-auto drop-shadow-[0_0_8px_rgba(201,168,76,0.3)]" />
          <h1 className="text-2xl font-serif font-bold text-white tracking-wide">The Admiralty Club</h1>
          <p className="text-slate-400 text-sm mt-2">Set a new password</p>
        </div>

        <div className="p-8">
          {status === 'success' ? (
            <div className="text-center space-y-4">
              <CheckCircleIcon className="w-12 h-12 text-emerald-400 mx-auto" />
              <p className="text-white font-semibold">Password reset successfully!</p>
              <p className="text-slate-400 text-sm">You can now sign in with your new password.</p>
              <a
                href="/"
                className="inline-flex items-center justify-center w-full py-3 px-4 rounded-xl bg-gold-500 text-navy-900 font-bold text-sm hover:bg-gold-400 transition-colors"
              >
                Back to Sign In
              </a>
            </div>
          ) : (
            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
              {!token && (
                <p className="rounded-lg border border-red-600/50 bg-red-950/40 p-3 text-sm text-red-300">
                  Invalid reset link. Please request a new one.
                </p>
              )}

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-300 block">New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockIcon className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(null); }}
                    placeholder="Min. 6 characters"
                    className="block w-full pl-10 pr-3 py-3 border border-navy-600 focus:border-gold-500 rounded-xl text-sm bg-navy-900 text-white placeholder-slate-500 outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-300 block">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockIcon className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => { setConfirm(e.target.value); setError(null); }}
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-3 py-3 border border-navy-600 focus:border-gold-500 rounded-xl text-sm bg-navy-900 text-white placeholder-slate-500 outline-none transition-colors"
                  />
                </div>
              </div>

              {error && (
                <p className="rounded-lg border border-red-600/50 bg-red-950/40 p-3 text-sm text-red-300">{error}</p>
              )}

              <button
                type="submit"
                disabled={status === 'loading' || !token}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gold-500 text-navy-900 font-bold text-sm hover:bg-gold-400 transition-colors disabled:opacity-50 shadow-[0_0_15px_rgba(201,168,76,0.2)]"
              >
                {status === 'loading'
                  ? <><Loader2Icon className="w-4 h-4 animate-spin" /> Resetting…</>
                  : 'Reset Password'}
              </button>

              <p className="text-center text-xs text-slate-500">
                Remember it?{' '}
                <a href="/" className="text-gold-500 hover:text-gold-400 font-medium transition-colors">
                  Sign in
                </a>
              </p>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
