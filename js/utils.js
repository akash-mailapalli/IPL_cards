/**
 * utils.js
 * ========
 * Shared utility functions used across the application.
 * Keep all pure/helper functions here to avoid duplication.
 */

/**
 * Generate a random alphanumeric Room ID for multiplayer sessions.
 * @param {number} length - Length of the generated ID (default 6)
 * @returns {string} Uppercase room code like "A3K9MX"
 */
export function generateRoomId(length = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Omit ambiguous chars
  let id = '';
  for (let i = 0; i < length; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

/**
 * Deep clone an object or array using JSON serialization.
 * @param {*} obj - Value to clone
 * @returns {*} Deep clone of obj
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Fisher-Yates shuffle — mutates the passed array in place.
 * @param {Array} arr - Array to shuffle
 * @returns {Array} The same array, shuffled
 */
export function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Format a number with commas for display (e.g. 1234567 → "1,234,567").
 * @param {number} n
 * @returns {string}
 */
export function formatNumber(n) {
  return Number(n).toLocaleString('en-IN');
}

/**
 * Clamp a number between min and max.
 * @param {number} val
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

/**
 * Copy text to clipboard. Falls back gracefully if API unavailable.
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} True if successful
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    const success = document.execCommand('copy');
    document.body.removeChild(el);
    return success;
  }
}

/**
 * Debounce: return a function that delays invoking fn until after wait ms.
 * @param {Function} fn
 * @param {number} wait
 * @returns {Function}
 */
export function debounce(fn, wait) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}

/**
 * Sleep: pause execution for a given number of milliseconds.
 * @param {number} ms
 * @returns {Promise<void>}
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Parse a float to fixed decimal places, returning a number.
 * @param {number} val
 * @param {number} decimals
 * @returns {number}
 */
export function toFixed(val, decimals = 2) {
  return parseFloat(Number(val).toFixed(decimals));
}

/**
 * Get an item from localStorage, parsed as JSON. Returns null on failure.
 * @param {string} key
 * @returns {*}
 */
export function storageGet(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Set an item in localStorage, serialised as JSON. Returns false on failure.
 * @param {string} key
 * @param {*} value
 * @returns {boolean}
 */
export function storageSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/**
 * Remove an item from localStorage.
 * @param {string} key
 */
export function storageRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch { /* silently ignore */ }
}

/**
 * Create a DOM element with optional class names and inner text.
 * @param {string} tag - HTML tag name
 * @param {string[]} classes - CSS classes to add
 * @param {string} [text] - textContent
 * @returns {HTMLElement}
 */
export function createElement(tag, classes = [], text = '') {
  const el = document.createElement(tag);
  if (classes.length) el.classList.add(...classes);
  if (text) el.textContent = text;
  return el;
}

/**
 * Determine the "best" stat key for a card.
 * For higher-wins stats: picks the highest raw value.
 * For lower-wins stats (economy, bowlingAverage): picks lowest non-zero value.
 * Imported lazily by game.js for auto-select on timer expire.
 * @param {Object} card
 * @returns {string}
 */
export function getBestStat(card) {
  // Inline definition to avoid circular import with bot.js
  const STATS = [
    { key: 'matches',        higherWins: true  },
    { key: 'runs',           higherWins: true  },
    { key: 'highestScore',   higherWins: true  },
    { key: 'average',        higherWins: true  },
    { key: 'strikeRate',     higherWins: true  },
    { key: 'hundreds',       higherWins: true  },
    { key: 'fifties',        higherWins: true  },
    { key: 'fours',          higherWins: true  },
    { key: 'sixes',          higherWins: true  },
    { key: 'wickets',        higherWins: true  },
    { key: 'economy',        higherWins: false },
    { key: 'bowlingAverage', higherWins: false },
  ];
  let bestKey = STATS[0].key;
  let bestScore = -Infinity;
  for (const { key, higherWins } of STATS) {
    const raw = Number(card[key]) || 0;
    if (raw === 0 && !higherWins) continue;
    const score = higherWins ? raw : (raw > 0 ? 1000 / raw : 0);
    if (score > bestScore) { bestScore = score; bestKey = key; }
  }
  return bestKey;
}
