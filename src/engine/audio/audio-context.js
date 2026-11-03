// Reconstructed application source. Third-party implementations are npm imports.
import {
  initializePrivateField,
  readPrivateMethod,
  writePrivateField,
  readPrivateField,
} from '../core/private-fields.js';
import { AudioContext } from 'three';
import { events } from '../core/events.ts';
import { pointerInput } from '../input/pointer-input.js';
import { environment } from '../core/environment.ts';
var vo;
var rc;
var $n;
var Vm;
var cE;
var pd;
var Wm;
var Ym;
var hE;
var Cu;
var qm;
class AudioContextService {
  constructor() {
    initializePrivateField(this, Vm);
    initializePrivateField(this, pd);
    initializePrivateField(this, Ym);
    initializePrivateField(this, Cu);
    initializePrivateField(this, vo, null);
    initializePrivateField(this, rc, null);
    initializePrivateField(this, $n, readPrivateMethod(this, Ym, hE).bind(this));
    this.context = AudioContext.getContext();
    this.contextReady = null;
    this.contextStarted = false;
    this.preventSuspend = false;
    this.preventResume = false;
    this.contextReady = new Promise((e, t) => {
      writePrivateField(this, vo, {
        resolve: e,
        reject: t,
      });
    });
  }
  init() {
    this.context = AudioContext.getContext();
    readPrivateMethod(this, Vm, cE).call(this);
    events.on('visibility_change', readPrivateMethod(this, Cu, qm), this);
  }
  suspend() {
    if (this.context.state === 'running' && !this.preventSuspend) return this.context.suspend();
  }
  resume() {
    if (this.contextStarted && this.context.state === 'suspended' && !this.preventResume)
      return this.context.resume();
  }
  dispose() {
    readPrivateMethod(this, pd, Wm).call(this);
    clearTimeout(readPrivateField(this, rc));
    events.off('visibility_change', readPrivateMethod(this, Cu, qm), this);
    readPrivateField(this, vo).reject();
    this.contextReady = new Promise((e, t) => {
      writePrivateField(this, vo, {
        resolve: e,
        reject: t,
      });
    });
    this.context.close();
    this.contextStarted = false;
    AudioContext.setContext(void 0);
    this.preventSuspend = false;
    this.preventResume = false;
  }
}
{
  vo = new WeakMap();
  rc = new WeakMap();
  $n = new WeakMap();
  Vm = new WeakSet();
  cE = function () {
    pointerInput.allowTouchStart = true;
    document.body.addEventListener('click', readPrivateField(this, $n));
    events.on('touch_end', readPrivateField(this, $n));
    events.on('keydown', readPrivateField(this, $n));
  };
  pd = new WeakSet();
  Wm = function () {
    pointerInput.allowTouchStart = false;
    document.body.removeEventListener('click', readPrivateField(this, $n));
    events.off('touch_end', readPrivateField(this, $n));
    events.off('keydown', readPrivateField(this, $n));
  };
  Ym = new WeakSet();
  hE = async function () {
    try {
      if ((await this.context.resume(), this.contextStarted)) return;
      this.contextStarted = true;
      readPrivateMethod(this, pd, Wm).call(this);
      readPrivateField(this, vo).resolve();
    } catch (i) {
      console.log('audio context error:', i);
    }
  };
  Cu = new WeakSet();
  qm = function (i) {
    if (this.contextStarted && environment.os.name === 'ios')
      if (i)
        writePrivateField(
          this,
          rc,
          setTimeout(() => this.resume(), 500),
        );
      else {
        clearTimeout(readPrivateField(this, rc));
        this.suspend();
      }
  };
}
const audioContextService = new AudioContextService();
export { vo, rc, $n, Vm, cE, pd, Wm, Ym, hE, Cu, qm, AudioContextService, audioContextService };
