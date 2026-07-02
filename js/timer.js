/**
 * timer.js
 * ========
 * Countdown timer for timed turns in the game.
 * Emits 'tick' and 'expire' callbacks.
 */

export class CountdownTimer {
  /**
   * @param {Object} opts
   * @param {number} opts.duration - Duration in seconds
   * @param {Function} opts.onTick - Called each second with (secondsRemaining)
   * @param {Function} opts.onExpire - Called when timer reaches 0
   */
  constructor({ duration = 20, onTick = () => {}, onExpire = () => {} } = {}) {
    this.duration = duration;
    this.onTick = onTick;
    this.onExpire = onExpire;
    this._remaining = duration;
    this._intervalId = null;
    this._running = false;
  }

  /** Start or restart the countdown. */
  start() {
    this.stop();
    this._remaining = this.duration;
    this._running = true;
    this.onTick(this._remaining);

    this._intervalId = setInterval(() => {
      this._remaining--;
      this.onTick(this._remaining);

      if (this._remaining <= 0) {
        this.stop();
        this.onExpire();
      }
    }, 1000);
  }

  /** Pause the countdown without resetting. */
  pause() {
    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
      this._running = false;
    }
  }

  /** Resume a paused countdown. */
  resume() {
    if (!this._running && this._remaining > 0) {
      this._running = true;
      this._intervalId = setInterval(() => {
        this._remaining--;
        this.onTick(this._remaining);
        if (this._remaining <= 0) {
          this.stop();
          this.onExpire();
        }
      }, 1000);
    }
  }

  /** Stop and reset the timer. */
  stop() {
    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
    this._running = false;
    this._remaining = this.duration;
  }

  /** Get seconds remaining. */
  get remaining() {
    return this._remaining;
  }

  /** Get whether timer is currently running. */
  get running() {
    return this._running;
  }
}
