import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isLockedOut, getLockoutRemaining } from '../utils/security';
import { BookOpen, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { hasPin, login, setupPin, isAuthenticated } = useAuth();
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-2xl mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold">StudyPocket</h1>
          <p className="text-gray-500 mt-1 text-sm">Your Student Financial Companion</p>
        </div>

        <div className="border border-black rounded-2xl p-8">
          <h2 className="text-xl font-bold mb-6 text-center">
            {hasPin ? 'Enter Your PIN' : 'Create Your Account'}
          </h2>

          {error && (
            <div className="mb-4 p-3 border border-black bg-gray-100 rounded-lg text-sm text-black">
              {error}
            </div>
          )}

          {locked && (
            <div className="mb-4 p-3 border border-black bg-black text-white rounded-lg text-sm text-center">
              🔒 Locked — try again in {lockRemaining}s
            </div>
          )}

          <form onSubmit={hasPin ? handleLogin : handleSetup} className="space-y-4">
            {!hasPin && (
              <div>
                <label className="block text-sm font-medium mb-1">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  maxLength={50}
                  className="w-full border border-black rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">
                {hasPin ? '4-Digit PIN' : 'Create 4-Digit PIN'}
              </label>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  value={pin}
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setPin(val);
                    setError('');
                  }}
                  placeholder="••••"
                  inputMode="numeric"
                  maxLength={4}
                  className="w-full border border-black rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black pr-10 pin-input"
                  disabled={locked}
                />
                <button
                  type="button"
                  onClick={() => setShowPin(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {!hasPin && (
              <div>
                <label className="block text-sm font-medium mb-1">Confirm PIN</label>
                <input
                  type={showPin ? 'text' : 'password'}
                  value={confirmPin}
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setConfirmPin(val);
                    setError('');
                  }}
                  placeholder="••••"
                  inputMode="numeric"
                  maxLength={4}
                  className="w-full border border-black rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black pin-input"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading || locked}
              className="w-full bg-black text-white py-2.5 rounded-lg font-semibold text-sm disabled:opacity-50 hover:bg-gray-900 transition-colors mt-2"
            >
              {loading ? 'Please wait...' : hasPin ? 'Unlock' : 'Get Started'}
            </button>
          </form>

          {!hasPin && (
            <p className="text-xs text-gray-500 text-center mt-4">
              Your PIN is stored securely using SHA-256. No data leaves your device.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
