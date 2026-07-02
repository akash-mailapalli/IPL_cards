/**
 * audio.js
 * ========
 * Sound and music management.
 * Uses Web Audio API for lightweight synthesized sounds as placeholders.
 * Replace with actual audio files by updating the SOUND_FILES map.
 *
 * TODO (Audio Files):
 *   Place .mp3 / .ogg files in assets/sounds/ and update SOUND_FILES paths.
 */

import { storageGet } from './utils.js';

// Map sound names to file paths (update when real audio assets are ready)
const SOUND_FILES = {
  cardFlip:  'assets/sounds/card-flip.mp3',
  win:       'assets/sounds/win.mp3',
  lose:      'assets/sounds/lose.mp3',
  draw:      'assets/sounds/draw.mp3',
  click:     'assets/sounds/click.mp3',
  countdown: 'assets/sounds/countdown.mp3',
  bgMusic:   'assets/sounds/bg-music.mp3'
};

let audioContext = null;
let bgMusicSource = null;
let bgMusicGain = null;
const audioBuffers = {};

/** Lazily create AudioContext on first user interaction */
function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

/** Load and cache an audio buffer from URL */
async function loadBuffer(url) {
  if (audioBuffers[url]) return audioBuffers[url];
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Not found');
    const arrayBuffer = await res.arrayBuffer();
    const ctx = getAudioContext();
    audioBuffers[url] = await ctx.decodeAudioData(arrayBuffer);
    return audioBuffers[url];
  } catch {
    return null; // Silently fail if file missing
  }
}

/**
 * Play a sound effect by name.
 * @param {string} name - Key from SOUND_FILES
 */
export async function playSound(name) {
  if (!isSoundEnabled()) return;
  const url = SOUND_FILES[name];
  if (!url) return;

  // Synthesize a beep fallback if file not found
  const buffer = await loadBuffer(url);
  if (!buffer) {
    synthesizeBeep(name);
    return;
  }

  const ctx = getAudioContext();
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start(0);
}

/**
 * Start looping background music.
 */
export async function playBgMusic() {
  if (!isMusicEnabled()) return;
  stopBgMusic();

  const url = SOUND_FILES.bgMusic;
  const buffer = await loadBuffer(url);
  if (!buffer) return;

  const ctx = getAudioContext();
  bgMusicGain = ctx.createGain();
  bgMusicGain.gain.value = 0.3;
  bgMusicGain.connect(ctx.destination);

  bgMusicSource = ctx.createBufferSource();
  bgMusicSource.buffer = buffer;
  bgMusicSource.loop = true;
  bgMusicSource.connect(bgMusicGain);
  bgMusicSource.start(0);
}

/** Stop background music. */
export function stopBgMusic() {
  if (bgMusicSource) {
    try { bgMusicSource.stop(); } catch { /* already stopped */ }
    bgMusicSource = null;
  }
}

/** Toggle music on/off. */
export function toggleMusic() {
  const settings = storageGet('ipl_settings') || {};
  settings.music = !settings.music;
  localStorage.setItem('ipl_settings', JSON.stringify(settings));
  if (settings.music) playBgMusic();
  else stopBgMusic();
  return settings.music;
}

/** Toggle sound effects on/off. */
export function toggleSound() {
  const settings = storageGet('ipl_settings') || {};
  settings.sound = !settings.sound;
  localStorage.setItem('ipl_settings', JSON.stringify(settings));
  return settings.sound;
}

/** Check if sound effects are enabled. */
export function isSoundEnabled() {
  const s = storageGet('ipl_settings');
  return s ? s.sound !== false : true;
}

/** Check if music is enabled. */
export function isMusicEnabled() {
  const s = storageGet('ipl_settings');
  return s ? s.music !== false : true;
}

/**
 * Synthesize a simple beep using Web Audio when no file is available.
 * @param {string} name - Sound name for pitch variation
 */
function synthesizeBeep(name) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const pitchMap = {
      cardFlip: 880, win: 523, lose: 200,
      draw: 440, click: 660, countdown: 330
    };
    osc.frequency.value = pitchMap[name] || 440;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch { /* silently ignore */ }
}
