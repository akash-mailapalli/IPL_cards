/**
 * deck.js
 * =======
 * Deck management: shuffling, dealing, and card comparison.
 *
 * KEY RULE — stat comparison direction:
 *   Most stats: higher value wins (runs, SR, wickets, etc.)
 *   Economy & Bowling Average: LOWER value wins (better economy = fewer runs/over)
 *   Zero values for bowling stats mean the player hasn't bowled — treated as
 *   non-comparable; if BOTH cards have 0 for that stat it's a draw.
 */

import { shuffleArray, deepClone } from './utils.js';
import { isHigherBetter } from './bot.js';

export function shuffleDeck(deck) { return shuffleArray(deck); }

export function dealCards(deck) {
  const mid = Math.ceil(deck.length / 2);
  return { player: deck.slice(0, mid), opponent: deck.slice(mid) };
}

export function drawCard(hand) {
  return (hand && hand.length > 0) ? hand[0] : null;
}

/**
 * Compare a chosen stat between two cards.
 *
 * Special cases for economy / bowlingAverage:
 *   - If both are 0 → draw (neither player bowls)
 *   - If one is 0   → that card LOSES (0 means no bowling data → disadvantage)
 *   - Otherwise     → lower value wins
 *
 * @returns {'player'|'opponent'|'draw'}
 */
export function compareStat(card1, card2, statKey) {
  const v1 = Number(card1[statKey]) || 0;
  const v2 = Number(card2[statKey]) || 0;
  const higherWins = isHigherBetter(statKey);

  if (!higherWins) {
    // Lower wins (economy / bowling average)
    if (v1 === 0 && v2 === 0) return 'draw';
    if (v1 === 0) return 'opponent'; // no bowling data → loses
    if (v2 === 0) return 'player';
    return v1 < v2 ? 'player' : v2 < v1 ? 'opponent' : 'draw';
  }

  // Higher wins (all batting/match stats)
  if (v1 > v2) return 'player';
  if (v2 > v1) return 'opponent';
  return 'draw';
}

export function transferCards(winnerHand, loserHand, pot = []) {
  const winnerCard = winnerHand.shift();
  const loserCard  = loserHand.shift();
  winnerHand.push(...pot, winnerCard, loserCard);
  return [];
}

export function addToPot(hand1, hand2, pot) {
  return [...pot, hand1.shift(), hand2.shift()];
}

export function checkWinner(playerHand, opponentHand) {
  if (opponentHand.length === 0) return 'player';
  if (playerHand.length === 0)   return 'opponent';
  return null;
}

export function buildDeck(allPlayers) {
  return shuffleDeck(deepClone(allPlayers));
}
