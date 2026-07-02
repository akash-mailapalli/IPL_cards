/**
 * firebase.js
 * ===========
 * Firebase Realtime Database — fully implemented.
 * Uses Firebase CDN ESM (compatible with type="module" scripts).
 *
 * Database structure:
 *   rooms/{roomId}/
 *     host          : string (playerId)
 *     hostName      : string
 *     guest         : string | null
 *     guestName     : string | null
 *     status        : 'waiting' | 'ready' | 'playing' | 'finished'
 *     turn          : 'host' | 'guest'
 *     hostDeck      : Object[]
 *     guestDeck     : Object[]
 *     pot           : Object[]
 *     round         : number
 *     chosenStat    : string | null
 *     hostReady     : boolean
 *     guestReady    : boolean
 *     winner        : 'host' | 'guest' | null
 *     createdAt     : number
 */

import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  getDatabase, ref, set, get, update, onValue, off, remove, serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';

// ─── Config ───────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            "AIzaSyCJmB4gK_tb6UGDFaKmH_isVYhfzWhmyB0",
  authDomain:        "ipl-game-b6c6a.firebaseapp.com",
  databaseURL:       "https://ipl-game-b6c6a-default-rtdb.firebaseio.com",
  projectId:         "ipl-game-b6c6a",
  storageBucket:     "ipl-game-b6c6a.firebasestorage.app",
  messagingSenderId: "568874657087",
  appId:             "1:568874657087:web:e84a6fc2a7750726441f8a"
};

// Initialise once (safe for multi-page — each page loads independently)
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db  = getDatabase(app);

// Active listener refs for cleanup
const _listeners = {};

// ─── Room CRUD ────────────────────────────────────────────────────────────────

/**
 * Create a new room in Firebase.
 * @param {string} roomId
 * @param {string} playerId
 * @param {string} playerName
 * @param {Object[]} hostDeck
 * @param {Object[]} guestDeck
 */
export async function createRoom(roomId, playerId, playerName, hostDeck, guestDeck, cardCount = 73) {
  await set(ref(db, `rooms/${roomId}`), {
    host:       playerId,
    hostName:   playerName,
    guest:      null,
    guestName:  null,
    status:     'waiting',
    turn:       'host',        // 'host' | 'guest' — whose turn to pick a stat
    hostDeck,
    guestDeck,
    pot:        [],
    round:      1,
    chosenStat: null,          // set when the active player picks; cleared after resolution
    statChooser: null,         // 'host'|'guest' — who picked the stat this round
    hostReady:  false,
    guestReady: false,
    winner:     null,
    cardCount,
    createdAt:  Date.now()
  });
}

/**
 * Attempt to join a room as guest.
 * Returns false if room doesn't exist, is full, or already started.
 */
export async function joinRoom(roomId, playerId, playerName) {
  const snap = await get(ref(db, `rooms/${roomId}`));
  if (!snap.exists()) return false;
  const room = snap.val();
  if (room.guest || room.status !== 'waiting') return false;
  await update(ref(db, `rooms/${roomId}`), {
    guest:      playerId,
    guestName:  playerName,
    status:     'ready'
  });
  return true;
}

/** Mark one player as ready. */
export async function setPlayerReady(roomId, role) {
  const field = role === 'host' ? 'hostReady' : 'guestReady';
  await update(ref(db, `rooms/${roomId}`), { [field]: true });
}

/** Start the game — called by host after both are ready. */
export async function startGame(roomId) {
  await update(ref(db, `rooms/${roomId}`), { status: 'playing' });
}

/** Update whose turn it is and the chosen stat. */
export async function updateTurn(roomId, turn, chosenStat) {
  await update(ref(db, `rooms/${roomId}`), { turn, chosenStat });
}

/** Push updated decks + pot after each card transfer. */
export async function updateDeck(roomId, hostDeck, guestDeck, pot, round, nextTurn) {
  await update(ref(db, `rooms/${roomId}`), {
    hostDeck,
    guestDeck,
    pot,
    round,
    turn:        nextTurn,  // 'host' | 'guest'
    chosenStat:  null,
    statChooser: null
  });
}

/** Record which player chose a stat this round. */
export async function submitStat(roomId, statKey, chooserRole) {
  await update(ref(db, `rooms/${roomId}`), {
    chosenStat:  statKey,
    statChooser: chooserRole
  });
}

/** Record the winner and mark room finished. */
export async function setWinner(roomId, winner) {
  await update(ref(db, `rooms/${roomId}`), {
    status: 'finished',
    winner
  });
}

/** Delete the room entirely (host leaving). */
export async function deleteRoom(roomId) {
  stopListening(roomId);
  await remove(ref(db, `rooms/${roomId}`));
}

/** Remove guest from room (guest leaving). */
export async function removeGuest(roomId) {
  stopListening(roomId);
  await update(ref(db, `rooms/${roomId}`), {
    guest:      null,
    guestName:  null,
    guestReady: false,
    status:     'waiting'
  });
}

// ─── Real-time listener ───────────────────────────────────────────────────────

/**
 * Subscribe to room changes. Callback fires immediately with current state,
 * then on every change.
 * @param {string} roomId
 * @param {Function} callback - (roomData) => void
 */
export function listenForChanges(roomId, callback) {
  const r = ref(db, `rooms/${roomId}`);
  const handler = (snap) => {
    if (snap.exists()) callback(snap.val());
  };
  onValue(r, handler);
  _listeners[roomId] = { ref: r, handler };
}

/** Remove a room listener. */
export function stopListening(roomId) {
  if (_listeners[roomId]) {
    off(_listeners[roomId].ref, 'value', _listeners[roomId].handler);
    delete _listeners[roomId];
  }
}

/** Fetch a room snapshot once (no subscription). */
export async function getRoom(roomId) {
  const snap = await get(ref(db, `rooms/${roomId}`));
  return snap.exists() ? snap.val() : null;
}
