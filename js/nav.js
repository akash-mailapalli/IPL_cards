/**
 * nav.js
 * ======
 * Page navigation — replaces the single-page showScreen() system.
 * Each "screen" is now a separate .html file.
 */

export const PAGES = {
  home:         'index.html',
  setup:        'setup.html',
  game:         'game.html',
  multiplayer:  'multiplayer.html',
  lobby:        'lobby.html',
  leaderboard:  'leaderboard.html',
  settings:     'settings.html',
  rules:        'rules.html',
  win:          'win.html',
};

/**
 * Navigate to a page, optionally passing state via sessionStorage.
 * @param {string} page - Key from PAGES
 * @param {Object} [state] - Data to pass to the next page
 */
export function goTo(page, state = null) {
  if (state) sessionStorage.setItem('ipl_nav_state', JSON.stringify(state));
  window.location.href = PAGES[page] || PAGES.home;
}

/**
 * Read the state that was passed from the previous page.
 * Clears it after reading so it's consumed once.
 * @returns {Object|null}
 */
export function getNavState() {
  const raw = sessionStorage.getItem('ipl_nav_state');
  if (!raw) return null;
  sessionStorage.removeItem('ipl_nav_state');
  try { return JSON.parse(raw); } catch { return null; }
}

/** Navigate back to home. */
export function goHome() { window.location.href = PAGES.home; }
