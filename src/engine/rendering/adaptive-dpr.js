// Reconstructed application source. Third-party implementations are npm imports.
import {
  initializePrivateField,
  writePrivateField,
  readPrivateField,
  readPrivateMethod,
  privateUpdateAccessor,
} from '../core/private-fields.js';
import { frameClock } from '../core/frame-clock.ts';
import { events } from '../core/events.ts';
import { environment } from '../core/environment.ts';
var ac;
var Xm;
var oc;
var Km;
var Jm;
var jm;
var Zm;
var Su;
var Mu;
var $m;
var sr;
var oo;
var Nl;
var Ns;
var Bo;
var bu;
var eA;
class AdaptivePixelRatio {
  constructor(e) {
    initializePrivateField(this, bu);
    initializePrivateField(this, ac, null);
    initializePrivateField(this, Xm, 2);
    initializePrivateField(this, oc, 0);
    initializePrivateField(this, Km, 4);
    initializePrivateField(this, Jm, 5);
    initializePrivateField(this, jm, 30);
    initializePrivateField(this, Zm, 60);
    initializePrivateField(this, Su, 0.1);
    initializePrivateField(this, Mu, 0.6);
    initializePrivateField(this, $m, 4);
    initializePrivateField(this, sr, []);
    initializePrivateField(this, oo, 0);
    initializePrivateField(this, Nl, 0);
    initializePrivateField(this, Ns, 1);
    initializePrivateField(this, Bo, 0);
    writePrivateField(this, ac, e);
  }
  get hasRun() {
    return readPrivateField(this, Bo) !== 0;
  }
  get multiplier() {
    return readPrivateField(this, Ns);
  }
  start() {
    this.stop();
    writePrivateField(this, oc, frameClock.time + readPrivateField(this, Xm));
    writePrivateField(this, Bo, readPrivateField(this, oc));
    events.on('webgl_average_fps_update', readPrivateMethod(this, bu, eA), this);
  }
  stop() {
    readPrivateField(this, sr).length = 0;
    events.off('webgl_average_fps_update', readPrivateMethod(this, bu, eA), this);
  }
}
{
  ac = new WeakMap();
  Xm = new WeakMap();
  oc = new WeakMap();
  Km = new WeakMap();
  Jm = new WeakMap();
  jm = new WeakMap();
  Zm = new WeakMap();
  Su = new WeakMap();
  Mu = new WeakMap();
  $m = new WeakMap();
  sr = new WeakMap();
  oo = new WeakMap();
  Nl = new WeakMap();
  Ns = new WeakMap();
  Bo = new WeakMap();
  bu = new WeakSet();
  eA = function (i) {
    if (
      !(frameClock.time < readPrivateField(this, oc)) &&
      environment.visible &&
      (readPrivateField(this, sr).push(i),
      frameClock.time - readPrivateField(this, Bo) >= readPrivateField(this, Km) &&
        readPrivateField(this, sr).length >= readPrivateField(this, Jm))
    ) {
      const e =
        readPrivateField(this, sr).reduce((t, s) => t + s, 0) / readPrivateField(this, sr).length;
      if (
        e < readPrivateField(this, jm) &&
        readPrivateField(this, Ns) > readPrivateField(this, Mu)
      ) {
        writePrivateField(
          this,
          Ns,
          Math.max(
            readPrivateField(this, Mu),
            readPrivateField(this, Ns) - readPrivateField(this, Su),
          ),
        );
        readPrivateField(this, ac).setDPRMultiplier(readPrivateField(this, Ns));
        if (readPrivateField(this, oo) === 1) privateUpdateAccessor(this, Nl)._++;
        writePrivateField(this, oo, -1);
      } else if (e >= readPrivateField(this, Zm) && readPrivateField(this, Ns) < 1) {
        writePrivateField(
          this,
          Ns,
          Math.min(1, readPrivateField(this, Ns) + readPrivateField(this, Su)),
        );
        readPrivateField(this, ac).setDPRMultiplier(readPrivateField(this, Ns));
        if (readPrivateField(this, oo) === -1) privateUpdateAccessor(this, Nl)._++;
        writePrivateField(this, oo, 1);
      }
      readPrivateField(this, sr).length = 0;
      writePrivateField(this, Bo, frameClock.time);
      if (readPrivateField(this, Nl) >= readPrivateField(this, $m)) {
        console.warn('Adaptive DPR stopped.');
        this.stop();
      }
    }
  };
}
export { ac, Xm, oc, Km, Jm, jm, Zm, Su, Mu, $m, sr, oo, Nl, Ns, Bo, bu, eA, AdaptivePixelRatio };
