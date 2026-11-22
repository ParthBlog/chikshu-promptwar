import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getItem, setItem, KEYS } from '../utils/storage';
import { hashPIN, recordFailedAttempt, resetRateLimit, isLockedOut } from '../utils/security';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasPin, setHasPin] = useState(false);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const pinHash = getItem(KEYS.PIN_HASH);
    const name = getItem(KEYS.USER_NAME, '');
    setHasPin(!!pinHash);
    setUserName(name);
    setLoading(false);
  }, []);

  const setupPin = useCallback(async (pin, name) => {
    const hash = await hashPIN(pin);
    setItem(KEYS.PIN_HASH, hash);
    setItem(KEYS.USER_NAME, name);
    setHasPin(true);
    setUserName(name);
    setIsAuthenticated(true);
    resetRateLimit();
  }, []);

  const login = useCallback(async (pin) => {
    if (isLockedOut()) return { success: false, locked: true };
    const hash = await hashPIN(pin);
    const stored = getItem(KEYS.PIN_HASH);
    if (hash === stored) {
      setIsAuthenticated(true);
      resetRateLimit();
      return { success: true };
    } else {
      const { attempts, lockedUntil } = recordFailedAttempt();
      return { success: false, locked: !!lockedUntil, attempts };
    }
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, hasPin, userName, loading, setupPin, login, logout, setUserName }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
