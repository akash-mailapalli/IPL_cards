/**
 * shared.js
 * =========
 * Shared utilities loaded on every page:
 *   - Settings application (dark mode, animations)
 *   - Toast notifications
 *   - Loading overlay
 */

import { storageGet, storageSet, storageRemove } from './utils.js';

// ─── Apply settings on every page load ───────────────────────────────────────
export function applySettings() {
  const s = storageGet('ipl_settings') || {};
  document.documentElement.classList.toggle('light-mode',    s.darkMode    === false);
  document.documentElement.classList.toggle('no-animations', s.animations  === false);
}

// ─── Toast ────────────────────────────────────────────────────────────────────
export function showToast(message, type = 'info', duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || ''}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close" aria-label="Dismiss">×</button>`;
  toast.querySelector('.toast-close').addEventListener('click', () => _dismiss(toast));
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('toast-visible'));
  if (duration > 0) setTimeout(() => _dismiss(toast), duration);
}

function _dismiss(toast) {
  toast.classList.remove('toast-visible');
  toast.classList.add('toast-exit');
  toast.addEventListener('transitionend', () => toast.remove(), { once: true });
}

// ─── Loading overlay ──────────────────────────────────────────────────────────
export function setLoading(visible, msg = 'Loading…') {
  const el = document.getElementById('loading-screen');
  if (!el) return;
  el.classList.toggle('hidden', !visible);
  const m = el.querySelector('.loading-message');
  if (m) m.textContent = msg;
}
