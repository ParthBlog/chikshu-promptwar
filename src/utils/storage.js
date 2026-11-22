// utils/storage.js — Typed localStorage wrapper with error handling

const SCHEMA_VERSION = 1;

function getVersionedKey(key) {
  return `sp_v${SCHEMA_VERSION}_${key}`;
}

/**
 * Typed getItem with default fallback
 * @param {string} key
 * @param {*} defaultValue
 * @returns {*}
 */
export function getItem(key, defaultValue = null) {
  try {
    const raw = localStorage.getItem(getVersionedKey(key));
    if (raw === null) return defaultValue;
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (err) {
    console.warn(`[storage] Failed to read "${key}":`, err);
    return defaultValue;
  }
}

/**
 * Typed setItem with quota error handling
 * @param {string} key
 * @param {*} value
 * @returns {boolean} success
 */
export function setItem(key, value) {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(getVersionedKey(key), serialized);
    return true;
  } catch (err) {
    if (err.name === 'QuotaExceededError' || err.code === 22) {
      console.error('[storage] Storage quota exceeded. Please clear some data.');
      alert('Storage quota exceeded. Please export and clear old data.');
    } else {
      console.error(`[storage] Failed to write "${key}":`, err);
    }
    return false;
  }
}

/**
 * Remove a key from localStorage
 */
export function removeItem(key) {
  try {
    localStorage.removeItem(getVersionedKey(key));
  } catch (err) {
    console.warn(`[storage] Failed to remove "${key}":`, err);
  }
}

/**
 * Validate array shape — returns empty array if invalid
 */
export function getArray(key) {
  const val = getItem(key, []);
  return Array.isArray(val) ? val : [];
}

/**
 * Validate object shape — returns default if invalid
 */
export function getObject(key, defaultValue = {}) {
  const val = getItem(key, defaultValue);
  if (typeof val === 'object' && val !== null && !Array.isArray(val)) return val;
  return defaultValue;
}

// Storage keys
export const KEYS = {
  PIN_HASH: 'pin_hash',
  USER_NAME: 'user_name',
  EXPENSES: 'expenses',
  BUDGETS: 'budgets',
  SAVINGS_GOALS: 'savings_goals',
  BOOKMARKED_SCHOLARSHIPS: 'bookmarked_scholarships',
  BOOKMARKED_JOBS: 'bookmarked_jobs',
  SETTINGS: 'settings',
};
