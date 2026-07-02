/**
 * bot.js
 * ======
 * Bot (AI opponent) logic for single-player mode.
 *
 * STAT COMPARISON RULES (cricket-correct):
 *   HIGHER wins: matches, runs, highestScore, average, strikeRate,
 *                hundreds, fifties, fours, sixes, wickets
 *   LOWER  wins: economy, bowlingAverage  (fewer runs/balls = better)
 *
 * The bot picks the stat where it has the biggest relative advantage.
 */

// ─── Stat definitions ─────────────────────────────────────────────────────────
export const STAT_KEYS = [
  { key: 'matches',        label: 'Matches',          higherWins: true  },
  { key: 'runs',           label: 'Runs',             higherWins: true  },
  { key: 'highestScore',   label: 'Highest Score',    higherWins: true  },
  { key: 'average',        label: 'Batting Average',  higherWins: true  },
  { key: 'strikeRate',     label: 'Strike Rate',      higherWins: true  },
  { key: 'hundreds',       label: 'Centuries (100s)', higherWins: true  },
  { key: 'fifties',        label: 'Half-Centuries',   higherWins: true  },
  { key: 'fours',          label: 'Fours (4s)',       higherWins: true  },
  { key: 'sixes',          label: 'Sixes (6s)',       higherWins: true  },
  { key: 'wickets',        label: 'Wickets',          higherWins: true  },
  { key: 'economy',        label: 'Economy Rate',     higherWins: false }, // lower = better
  { key: 'bowlingAverage', label: 'Bowling Average',  higherWins: false }, // lower = better
];

export const BOT_DIFFICULTY = { EASY: 'easy', MEDIUM: 'medium', HARD: 'hard' };

/**
 * Choose a stat for the bot's turn.
 * For "lower wins" stats, the bot picks the stat where it has the lowest
 * non-zero value. For "higher wins" it picks the highest.
 * @param {Object} botCard
 * @param {string} difficulty
 * @returns {string} stat key
 */
export function botChooseStat(botCard, difficulty = BOT_DIFFICULTY.HARD) {
  switch (difficulty) {
    case BOT_DIFFICULTY.EASY:   return _randomStat();
    case BOT_DIFFICULTY.MEDIUM: return Math.random() < 0.5 ? _bestStat(botCard) : _randomStat();
    case BOT_DIFFICULTY.HARD:
    default:                    return _bestStat(botCard);
  }
}

/**
 * Find the stat where the bot has the strongest absolute advantage.
 * Normalises "lower wins" stats by inverting them before comparison.
 */
function _bestStat(card) {
  let bestKey = STAT_KEYS[0].key;
  let bestScore = -Infinity;

  for (const { key, higherWins } of STAT_KEYS) {
    const raw = Number(card[key]) || 0;
    if (raw === 0 && !higherWins) continue; // skip 0 economy (not a bowler)
    const score = higherWins ? raw : (raw > 0 ? 1000 / raw : 0);
    if (score > bestScore) { bestScore = score; bestKey = key; }
  }
  return bestKey;
}

function _randomStat() {
  return STAT_KEYS[Math.floor(Math.random() * STAT_KEYS.length)].key;
}

export function botThinkDelay(minMs = 800, maxMs = 2000) {
  const ms = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function getStatLabel(key) {
  return STAT_KEYS.find(s => s.key === key)?.label ?? key;
}

/** Returns true if higher value wins for this stat. */
export function isHigherBetter(key) {
  return STAT_KEYS.find(s => s.key === key)?.higherWins ?? true;
}
