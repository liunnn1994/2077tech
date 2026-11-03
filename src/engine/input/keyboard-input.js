// Reconstructed application source. Third-party implementations are npm imports.
import { initializePrivateField, readPrivateMethod } from '../core/private-fields.js';
import { events } from '../core/events.ts';
var Gm;
var oE;
var Hm;
var lE;
class KeyboardInput {
  constructor() {
    initializePrivateField(this, Gm);
    initializePrivateField(this, Hm);
    this.boundKeyDown = readPrivateMethod(this, Gm, oE).bind(this);
    this.boundKeyUp = readPrivateMethod(this, Hm, lE).bind(this);
  }
  init() {
    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);
  }
  dispose() {
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('keyup', this.boundKeyUp);
  }
}
{
  Gm = new WeakSet();
  oE = function (i) {
    events.emit('keydown', i);
  };
  Hm = new WeakSet();
  lE = function (i) {
    events.emit('keyup', i);
  };
}
const keyboardInput = new KeyboardInput();
export { Gm, oE, Hm, lE, KeyboardInput, keyboardInput };
