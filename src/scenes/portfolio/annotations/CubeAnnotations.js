// Reconstructed application source. Third-party implementations are npm imports.
import { CubeTitle } from './CubeTitle.js';
import { CubeDate } from './CubeDate.js';
import { CubeTemperature } from './CubeTemperature.js';
import { frameClock } from '../../../engine/core/frame-clock.ts';
import { events } from '../../../engine/core/events.ts';
class CubeAnnotations {
  constructor(parent) {
    this.parent = parent;
    this.lastBeepPlayed = 0;
    this.ready = new Promise((isReady) => {
      this.isReady = isReady;
    });
    this.init();
  }
  async init() {
    await Promise.all([this.titleLine(), this.typeDate(), this.temp()]);
    this.isReady();
  }
  titleLine() {
    this.title = new CubeTitle(this.parent);
    return this.title.ready;
  }
  typeDate() {
    this.typedate = new CubeDate(this.parent);
    return this.typedate.ready;
  }
  temp() {
    this.temp = new CubeTemperature(this.parent);
    return this.temp.ready;
  }
  playBeep() {
    if (!(frameClock.time - this.lastBeepPlayed < 0.4))
      switch (((this.lastBeepPlayed = frameClock.time), Math.floor(Math.random() * 3))) {
        case 0:
          events.emit('webgl_play_audio', 'beeps');
          break;
        case 1:
          events.emit('webgl_play_audio', 'beeps2');
          break;
        case 2:
          events.emit('webgl_play_audio', 'beeps3');
          break;
      }
  }
  update(e, t, s) {
    [this.title, this.typedate, this.temp].forEach((n) => n.update(t, s));
  }
}
export { CubeAnnotations };
