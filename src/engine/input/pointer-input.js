// Reconstructed application source. Third-party implementations are npm imports.
import {
  initializePrivateField,
  readPrivateMethod,
  readPrivateField,
  writePrivateField,
} from '../core/private-fields.js';
import { PointerState_zD } from './pointer-state.js';
var ls;
var ci;
var sa;
var Tm;
var rx;
var vu;
var zf;
var Im;
var Sw;
var Bm;
var Mw;
var Pm;
var bw;
var Dm;
var Tw;
var Rm;
var Iw;
class PointerInput {
  constructor() {
    initializePrivateField(this, Tm);
    initializePrivateField(this, vu);
    initializePrivateField(this, Im);
    initializePrivateField(this, Bm);
    initializePrivateField(this, Pm);
    initializePrivateField(this, Dm);
    initializePrivateField(this, Rm);
    initializePrivateField(this, ls, []);
    initializePrivateField(this, ci, null);
    initializePrivateField(this, sa, true);
    this.allowTouchStart = false;
    this.boundTouchesStart = readPrivateMethod(this, Im, Sw).bind(this);
    this.boundTouchesMove = readPrivateMethod(this, Bm, Mw).bind(this);
    this.boundTouchesEnd = readPrivateMethod(this, Pm, bw).bind(this);
    this.boundPreventTouchesStart = readPrivateMethod(this, Dm, Tw).bind(this);
    this.boundPreventDefault = readPrivateMethod(this, Rm, Iw).bind(this);
  }
  get(e) {
    return readPrivateField(this, ls)[e];
  }
  getActive() {
    return readPrivateField(this, ls).filter((e) => e.touching);
  }
  init({ element: e = window, fingers: t = 2, contextMenu: s = false } = {}) {
    writePrivateField(this, ci, e);
    writePrivateField(this, sa, readPrivateField(this, ci) instanceof HTMLCanvasElement);
    for (let n = 0; n < t; n++)
      readPrivateField(this, ls).push(new PointerState_zD(n, readPrivateField(this, ls)));
    e.style.touchAction = 'none';
    if (readPrivateField(this, sa)) e.style.userSelect = 'none';
    readPrivateField(this, ci).addEventListener('pointerdown', this.boundTouchesStart);
    readPrivateField(this, ci).addEventListener('pointermove', this.boundTouchesMove);
    readPrivateField(this, ci).addEventListener('pointerup', this.boundTouchesEnd);
    readPrivateField(this, ci).addEventListener('pointerout', this.boundTouchesEnd);
    readPrivateField(this, ci).addEventListener('pointercancel', this.boundTouchesEnd);
    if (!s) readPrivateField(this, ci).addEventListener('contextmenu', this.boundPreventDefault);
    e.addEventListener('touchstart', this.boundPreventTouchesStart, {
      passive: false,
    });
    document.addEventListener('dblclick', this.boundPreventDefault);
  }
  dispose() {
    readPrivateField(this, ci).removeEventListener('pointerdown', this.boundTouchesStart);
    readPrivateField(this, ci).removeEventListener('pointermove', this.boundTouchesMove);
    readPrivateField(this, ci).removeEventListener('pointerup', this.boundTouchesEnd);
    readPrivateField(this, ci).removeEventListener('pointerout', this.boundTouchesEnd);
    readPrivateField(this, ci).removeEventListener('pointercancel', this.boundTouchesEnd);
    readPrivateField(this, ci).removeEventListener('contextmenu', this.boundPreventDefault);
    readPrivateField(this, ci).removeEventListener('touchstart', this.boundPreventTouchStart);
    document.removeEventListener('dblclick', this.boundPreventDefault);
    readPrivateField(this, ls).forEach((e) => {
      if (readPrivateField(this, ls).indexOf(e) > -1)
        readPrivateField(this, ls).splice(readPrivateField(this, ls).indexOf(e), 1);
      e.dispose();
    });
    writePrivateField(this, ci, null);
    writePrivateField(this, sa, true);
  }
}
{
  ls = new WeakMap();
  ci = new WeakMap();
  sa = new WeakMap();
  Tm = new WeakSet();
  rx = function () {
    return readPrivateField(this, ls).find((i) => i.touchID === false);
  };
  vu = new WeakSet();
  zf = function (i) {
    return readPrivateField(this, ls).find((e) => e.touchID === i.pointerId);
  };
  Im = new WeakSet();
  Sw = function (i) {
    const e = readPrivateMethod(this, Tm, rx).call(this);
    if (e) {
      if (readPrivateField(this, sa) && this.getActive().length === 0)
        readPrivateField(this, ci).setPointerCapture(i.pointerId);
      e.touchID = i.pointerId;
      e.onTouchStart(i);
    }
  };
  Bm = new WeakSet();
  Mw = function (i) {
    const e = readPrivateMethod(this, vu, zf).call(this, i);
    if (e) e.onTouchMove(i);
    else if (i.pointerType === 'mouse' && this.getActive().length === 0)
      readPrivateField(this, ls)[0].onTouchMove(i);
  };
  Pm = new WeakSet();
  bw = function (i) {
    const e = readPrivateMethod(this, vu, zf).call(this, i);
    if (e) {
      e.onTouchEnd(i);
      e.touchID = false;
      if (readPrivateField(this, sa) && this.getActive().length === 0)
        readPrivateField(this, ci).releasePointerCapture(i.pointerId);
    }
  };
  Dm = new WeakSet();
  Tw = function (i) {
    if (!this.allowTouchStart) i.preventDefault();
  };
  Rm = new WeakSet();
  Iw = function (i) {
    i.preventDefault();
  };
}
const pointerInput = new PointerInput();
export {
  ls,
  ci,
  sa,
  Tm,
  rx,
  vu,
  zf,
  Im,
  Sw,
  Bm,
  Mw,
  Pm,
  bw,
  Dm,
  Tw,
  Rm,
  Iw,
  PointerInput,
  pointerInput,
};
