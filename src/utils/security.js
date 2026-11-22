// utils/security.js — Input sanitization, validation, and rate limiting

import DOMPurify from 'dompurify';

// ─── 1. Input Sanitization ────────────────────────────────────────────────────
export function sanitizeText(input) {
  if (typeof input !== 'string') return '';
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim();
}

// ─── 2. Amount Validation ────────────────────────────────────────────────────
export function validateAmount(value) {
  const num = parseFloat(value);
  if (isNaN(num)) return { valid: false, error: 'Amount must be a number.' };
  if (num <= 0) return { valid: false, error: 'Amount must be positive.' };
  if (num > 10_000_000) return { valid: false, error: 'Amount exceeds maximum limit of ₹1,00,00,000.' };
  return { valid: true, value: parseFloat(num.toFixed(2)) };
}

// ─── 3. Text Validation ──────────────────────────────────────────────────────
export function validateText(text, { maxLength = 200, fieldName = 'Field' } = {}) {
  if (!text || text.trim().length === 0) return { valid: false, error: `${fieldName} is required.` };
  const sanitized = sanitizeText(text);
  if (sanitized.length > maxLength) return { valid: false, error: `${fieldName} must be under ${maxLength} characters.` };
  // Block obvious script injections
  if (/<script|javascript:|on\w+=/i.test(text)) return { valid: false, error: 'Invalid characters detected.' };
  return { valid: true, value: sanitized };
}

// ─── 4. Rate Limiting for Auth ───────────────────────────────────────────────
const RATE_LIMIT_KEY = 'sp_auth_rate';
const MAX_ATTEMPTS = 3;
const LOCKOUT_MS = 30_000; // 30 seconds

export function getRateLimitState() {
  try {
    const raw = localStorage.getItem(RATE_LIMIT_KEY);
    if (!raw) return { attempts: 0, lockedUntil: null };
    return JSON.parse(raw);
  } catch {
    return { attempts: 0, lockedUntil: null };
  }
}

export function recordFailedAttempt() {
  const state = getRateLimitState();
  const attempts = state.attempts + 1;
  const lockedUntil = attempts >= MAX_ATTEMPTS ? Date.now() + LOCKOUT_MS : null;
  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({ attempts, lockedUntil }));
  return { attempts, lockedUntil };
}

export function resetRateLimit() {
  localStorage.removeItem(RATE_LIMIT_KEY);
}

export function isLockedOut() {
  const { lockedUntil } = getRateLimitState();
  if (!lockedUntil) return false;
  if (Date.now() < lockedUntil) return true;
  // Lockout expired — reset
  resetRateLimit();
  return false;
}

export function getLockoutRemaining() {
  const { lockedUntil } = getRateLimitState();
  if (!lockedUntil) return 0;
  return Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));
}

// ─── 5. PIN Hashing ──────────────────────────────────────────────────────────
export async function hashPIN(pin) {
  const encoder = new TextEncoder();
  const data = encoder.encode('studypocket_salt_' + pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ─── 6. Date Validation ──────────────────────────────────────────────────────
export function validateDate(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return { valid: false, error: 'Invalid date.' };
  return { valid: true, value: dateStr };
}
