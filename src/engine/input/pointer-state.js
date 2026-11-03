// Reconstructed application source. Third-party implementations are npm imports.
import {
  initializePrivateField,
  readPrivateField,
  readPrivateMethod,
  writePrivateField,
} from '../core/private-fields.js';
import { Vector2 } from 'three';
import { environment } from '../core/environment.ts';
import { events } from '../core/events.ts';
import { frameClock } from '../core/frame-clock.ts';
import { math } from '../core/math.js';
var wm;
var Em;
var kf;
var du;
var tc;
var ic;
var sc;
var nc;
var fu;
var Pl;
var pu;
var cd;
var Cm;
var Dl;
var mu;
var Sm;
var Cw;
var Rl;
var Au;
var gu;
var Mm;
const PointerState = class bm {
  constructor(finger = 0) {
    initializePrivateField(this, Pl);
    initializePrivateField(this, cd);
    initializePrivateField(this, Dl);
    initializePrivateField(this, Sm);
    initializePrivateField(this, Rl);
    initializePrivateField(this, gu);
    initializePrivateField(this, du, new Vector2());
    initializePrivateField(this, tc, new Vector2());
    initializePrivateField(this, ic, new Vector2());
    initializePrivateField(this, sc, new Vector2());
    initializePrivateField(this, nc, new Vector2());
    initializePrivateField(this, fu, 0);
    this.finger = finger;
    this.touchID = false;
    this.eventID = this.finger === 0 ? 'touch' : `touch${this.finger + 1}`;
    this.currentInput = this.finger === 0 ? 'mouse' : 'touch';
    this.button = 0;
    this.touching = false;
    this.position = new Vector2(environment.screen.w * 0.5, environment.screen.h * 0.5);
    this.position01 = new Vector2(0.5, 0.5);
    this.position11 = new Vector2();
    this.delta = new Vector2();
    this.delta11 = new Vector2();
    this.dragged = new Vector2();
    this.dragged11 = new Vector2();
    this.velocity = new Vector2();
    this.swipeVelocity = new Vector2();
    readPrivateField(this, tc).copy(this.position);
    readPrivateField(this, ic).copy(this.position01);
    readPrivateField(this, sc).copy(this.position);
    readPrivateField(this, nc).copy(this.position01);
    events.on('webgl_prerender', readPrivateMethod(this, gu, Mm), this);
  }
  onTouchStart(e) {
    this.touching = true;
    writePrivateField(this, fu, frameClock.time);
    readPrivateMethod(this, Pl, pu).call(this, e);
    readPrivateMethod(this, cd, Cm).call(this);
    readPrivateMethod(this, Dl, mu).call(this);
    readPrivateMethod(this, Sm, Cw).call(this);
    readPrivateMethod(this, Rl, Au).call(this);
    events.emit(`${this.eventID}_start`, this);
  }
  onTouchMove(e) {
    readPrivateMethod(this, Pl, pu).call(this, e);
    readPrivateMethod(this, Dl, mu).call(this);
    events.emit(`${this.eventID}_move`, this);
    if (this.touching) {
      readPrivateMethod(this, Rl, Au).call(this);
      events.emit(`${this.eventID}_drag`, this);
    }
  }
  onTouchEnd(e) {
    readPrivateMethod(this, Pl, pu).call(this, e);
    readPrivateMethod(this, Dl, mu).call(this);
    readPrivateMethod(this, Rl, Au).call(this);
    const t = this.touching;
    if (((this.touching = false), !t)) return;
    const s = Math.max(0.001, frameClock.time - readPrivateField(this, fu));
    this.swipeVelocity.copy(this.dragged).divideScalar(s);
    events.emit(`${this.eventID}_end`, this);
    if (
      this.dragged.length() < readPrivateField(bm, wm) &&
      s < readPrivateField(bm, Em) &&
      e.type !== 'pointerout'
    )
      events.emit(`${this.eventID}_click`, this);
  }
  dispose() {
    events.off('webgl_prerender', readPrivateMethod(this, gu, Mm), this);
  }
};
{
  wm = new WeakMap();
  Em = new WeakMap();
  kf = new WeakMap();
  du = new WeakMap();
  tc = new WeakMap();
  ic = new WeakMap();
  sc = new WeakMap();
  nc = new WeakMap();
  fu = new WeakMap();
  Pl = new WeakSet();
  pu = function (i) {
    const e = i,
      t = e.clientX,
      s = e.clientY;
    this.position.set(t, s);
    this.position01.set(t / environment.screen.w, 1 - s / environment.screen.h);
    this.position11.copy(this.position01).multiplyScalar(2).subScalar(1);
    this.currentInput = i.pointerType === 'mouse' ? 'mouse' : 'touch';
    this.button = i.button;
  };
  cd = new WeakSet();
  Cm = function () {
    readPrivateField(this, sc).copy(this.position);
    readPrivateField(this, nc).copy(this.position01);
  };
  Dl = new WeakSet();
  mu = function () {
    this.delta.copy(this.position).sub(readPrivateField(this, sc));
    this.delta11.copy(this.position01).sub(readPrivateField(this, nc));
    readPrivateMethod(this, cd, Cm).call(this);
    readPrivateField(this, du).copy(this.delta11).multiplyScalar(2);
    this.velocity.add(readPrivateField(this, du));
  };
  Sm = new WeakSet();
  Cw = function () {
    readPrivateField(this, tc).copy(this.position);
    readPrivateField(this, ic).copy(this.position01);
  };
  Rl = new WeakSet();
  Au = function () {
    this.dragged.copy(this.position).sub(readPrivateField(this, tc));
    this.dragged11.copy(this.position01).sub(readPrivateField(this, ic));
  };
  gu = new WeakSet();
  Mm = function () {
    this.velocity.multiplyScalar(math.frictionFPS(readPrivateField(PointerState, kf)));
    this.velocity.clampScalar(-1, 1);
    if (this.velocity.length() < 0.001) this.velocity.setScalar(0);
  };
  initializePrivateField(PointerState, wm, 15);
  initializePrivateField(PointerState, Em, 0.5);
  initializePrivateField(PointerState, kf, 0.95);
}
let PointerState_zD = PointerState;
export {
  wm,
  Em,
  kf,
  du,
  tc,
  ic,
  sc,
  nc,
  fu,
  Pl,
  pu,
  cd,
  Cm,
  Dl,
  mu,
  Sm,
  Cw,
  Rl,
  Au,
  gu,
  Mm,
  PointerState,
  PointerState_zD,
};
