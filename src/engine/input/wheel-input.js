// Reconstructed application source. Third-party implementations are npm imports.
import {
  initializePrivateField,
  readPrivateMethod,
  writePrivateField,
  readPrivateField,
} from '../core/private-fields.js';
import { Vector2 } from 'three';
import { environment } from '../core/environment.ts';
import { events } from '../core/events.ts';
import { math } from '../core/math.js';
var ap;
var op;
var ao;
var Xr;
var dd;
var fd;
var wu;
var zm;
var aE;
var Eu;
var Qm;
const WheelInput = class {
  constructor() {
    initializePrivateField(this, zm);
    initializePrivateField(this, Eu);
    initializePrivateField(this, ao, new Vector2());
    initializePrivateField(this, Xr, null);
    initializePrivateField(this, dd, true);
    initializePrivateField(this, fd, false);
    initializePrivateField(this, wu, new Vector2());
    this.boundWheel = readPrivateMethod(this, zm, aE).bind(this);
    this.position = new Vector2();
    this.delta = new Vector2();
    this.velocity = new Vector2();
    this.isPinching = false;
  }
  init({ element: e = window } = {}) {
    writePrivateField(this, Xr, e);
    writePrivateField(this, dd, readPrivateField(this, Xr) instanceof HTMLCanvasElement);
    writePrivateField(this, fd, environment.browser.name === 'firefox');
    readPrivateField(this, Xr).addEventListener('wheel', this.boundWheel, {
      passive: false,
    });
    events.on('webgl_prerender', readPrivateMethod(this, Eu, Qm), this);
  }
  dispose() {
    readPrivateField(this, Xr).removeEventListener('wheel', this.boundWheel);
    events.off('webgl_prerender', readPrivateMethod(this, Eu, Qm), this);
    writePrivateField(this, Xr, null);
  }
};
{
  ap = new WeakMap();
  op = new WeakMap();
  ao = new WeakMap();
  Xr = new WeakMap();
  dd = new WeakMap();
  fd = new WeakMap();
  wu = new WeakMap();
  zm = new WeakSet();
  aE = function (i) {
    if (readPrivateField(this, dd)) {
      i.preventDefault();
      i.stopPropagation();
    }
    this.isPinching = i.ctrlKey;
    readPrivateField(this, ao).set(i.deltaX, i.deltaY);
    if (readPrivateField(this, fd) && i.deltaMode === 1)
      readPrivateField(this, ao).multiplyScalar(readPrivateField(WheelInput, ap));
    this.position.add(readPrivateField(this, ao));
    this.delta.copy(this.position).sub(readPrivateField(this, wu));
    readPrivateField(this, wu).copy(this.position);
    this.velocity.add(readPrivateField(this, ao).copy(this.delta).multiplyScalar(0.1));
    events.emit('wheel', this);
  };
  Eu = new WeakSet();
  Qm = function () {
    this.velocity.multiplyScalar(math.frictionFPS(readPrivateField(WheelInput, op)));
    this.velocity.clampScalar(-1, 1);
    if (this.velocity.length() < 0.001) this.velocity.setScalar(0);
  };
  initializePrivateField(WheelInput, ap, 33);
  initializePrivateField(WheelInput, op, 0.97);
}
let WheelInput_BU = WheelInput;
const wheelInput = new WheelInput_BU();
export { ap, op, ao, Xr, dd, fd, wu, zm, aE, Eu, Qm, WheelInput, WheelInput_BU, wheelInput };
