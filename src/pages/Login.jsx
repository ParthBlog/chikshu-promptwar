import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import { isLockedOut, getLockoutRemaining } from '../utils/security';
import { BookOpen, Eye, EyeOff, ShieldCheck, Sparkles, ArrowRight, Lock } from 'lucide-react';
import { StudentFinanceIllustration } from '../components/Graphics';
import { seedDemoData } from '../utils/demoData';

export default function Login() {
  const { hasPin, login, setupPin, isAuthenticated } = useAuth();
  const { dispatch } = useFinance();
  const navigate = useNavigate();

  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [name, setName] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [locked, setLocked] = useState(false);
  const [lockRemaining, setLockRemaining] = useState(0);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  // Lockout timer
  useEffect(() => {
    const interval = setInterval(() => {
      if (isLockedOut()) {
        setLocked(true);
        setLockRemaining(getLockoutRemaining());
      } else {
        setLocked(false);
        setLockRemaining(0);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    if (locked) return;
    if (pin.length !== 4) { setError('PIN must be 4 digits.'); return; }
    setLoading(true);
    const result = await login(pin);
    setLoading(false);
    if (result.success) {
      navigate('/dashboard', { replace: true });
    } else if (result.locked) {
      setLocked(true);
      setError('Too many attempts. Locked for 30 seconds.');
    } else {
      setError(`Incorrect PIN. ${3 - (result.attempts || 0)} attempt(s) remaining.`);
    }
    setPin('');
  }

  async function handleSetup(e) {
    e.preventDefault();
    if (!name.trim()) { setError('Please enter your name.'); return; }
    if (pin.length !== 4) { setError('PIN must be exactly 4 digits.'); return; }
    if (pin !== confirmPin) { setError('PINs do not match.'); return; }
    setLoading(true);
    await setupPin(pin, name.trim());
    setLoading(false);
    navigate('/dashboard', { replace: true });
  }

  // 1-Click Judge / Evaluator Demo Access
  async function handleJudgeDemo() {
    setLoading(true);
    const demo = seedDemoData();
    dispatch({
      type: 'LOAD_DATA',
      payload: {
        expenses: demo.expenses,
        budgets: demo.budgets,
        savingsGoals: demo.savingsGoals,
      }
    });
    // Log in with pre-seeded demo account (PIN 1234)
    await setupPin('1234', 'Aryan Sharma');
    setLoading(false);
    navigate('/dashboard', { replace: true });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4 sm:p-6">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200/40">
        
        {/* Left Visual Column */}
        <div className="bg-gradient-to-br from-indigo-700 via-indigo-800 to-purple-900 p-8 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-semibold uppercase tracking-wider mb-4 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              Hack2Skill Submission
            </div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-md">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight">StudyPocket AI</h1>
                <p className="text-indigo-200 text-xs">Student Financial Management & Life Engine</p>
              </div>
            </div>
          </div>

          {/* Center Graphic */}
          <div className="my-6 flex justify-center items-center relative z-10">
            <StudentFinanceIllustration className="w-full max-w-xs drop-shadow-2xl" />
          </div>

          {/* Bottom Security Pill */}
          <div className="relative z-10 pt-4 border-t border-indigo-600/60">
            <div className="flex items-center gap-2 text-xs text-indigo-200">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>WebCrypto SHA-256 • 100% Client Privacy • Anti-XSS Sanitized</span>
            </div>
          </div>
        </div>

        {/* Right Auth Column */}
        <div className="p-8 sm:p-10 flex flex-col justify-center bg-white">
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {hasPin ? 'Unlock Your Wallet' : 'Create Student Account'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {hasPin ? 'Enter your 4-digit security PIN to access your finances' : 'Set up your quick 4-digit PIN for instant secure access'}
            </p>
          </div>

          {/* 1-Click Judge Button */}
          <div className="mb-6">
            <button
              type="button"
              onClick={handleJudgeDemo}
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-2 text-left">
                <span className="p-1.5 rounded-lg bg-white/20">⚡</span>
                <div>
                  <div className="font-extrabold text-sm">1-Click Judge & Demo Access</div>
                  <div className="text-[11px] text-indigo-100 font-normal">Preloads realistic student expenses, budgets & charts</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-semibold">Or enter custom PIN</span></div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-semibold">
              {error}
            </div>
          )}

          {locked && (
            <div className="mb-4 p-3 bg-slate-900 text-white rounded-xl text-xs text-center font-bold">
              🔒 Rate limit locked — try again in {lockRemaining}s
            </div>
          )}

          <form onSubmit={hasPin ? handleLogin : handleSetup} className="space-y-4">
            {!hasPin && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aryan Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  autoFocus
                />
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">4-Digit Security PIN</label>
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium"
                >
                  {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {showPin ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="• • • •"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-center text-xl font-bold tracking-widest focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                disabled={locked || loading}
              />
            </div>

            {!hasPin && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm 4-Digit PIN</label>
                <input
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  maxLength={4}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="• • • •"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-center text-xl font-bold tracking-widest focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  disabled={locked || loading}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={locked || loading || pin.length !== 4}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              {loading ? 'Verifying...' : hasPin ? 'Unlock StudyPocket' : 'Create My Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
