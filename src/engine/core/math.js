// Reconstructed application source. Third-party implementations are npm imports.
import { frameClock, easingFunctions } from './frame-clock.ts';
import { Vector3 } from 'three';
const math = {
  TWO_PI: Math.PI * 2,
  HALF_PI: Math.PI * 0.5,
  DEG2RAD: Math.PI / 180,
  RAD2DEG: 180 / Math.PI,
  degrees(i) {
    return i * this.RAD2DEG;
  },
  radians(i) {
    return i * this.DEG2RAD;
  },
  clamp(i, e = 0, t = 1) {
    return Math.max(e, Math.min(t, i));
  },
  lerp(i, e, t) {
    return (1 - t) * i + t * e;
  },
  mix(i, e, t) {
    return this.lerp(i, e, t);
  },
  deltaRatio() {
    return frameClock.ratio;
  },
  lerpCoefFPS(i) {
    return this.damp(i, frameClock.ratio);
  },
  lerpFPS(i, e, t) {
    return this.lerp(i, e, this.lerpCoefFPS(t));
  },
  lerpFPSLimited(i, e, t, s = 1 / 0) {
    const n = this.lerpFPS(i, e, t),
      r = s * frameClock.ratio,
      a = this.clamp(n - i, -r, r);
    return i + a;
  },
  damp(i, e) {
    return 1 - Math.exp(Math.log(1 - i) * e);
  },
  frictionFPS(i) {
    return this.friction(i, frameClock.ratio);
  },
  friction(i, e) {
    return Math.exp(Math.log(i) * e);
  },
  efit(i, e, t, s, n) {
    return s + ((i - e) * (n - s)) / (t - e);
  },
  fit(i, e, t, s, n) {
    return this.efit(this.clamp(i, Math.min(e, t), Math.max(e, t)), e, t, s, n);
  },
  fit01(i, e, t) {
    return this.fit(i, 0, 1, e, t);
  },
  fit10(i, e, t) {
    return this.fit(i, 1, 0, e, t);
  },
  fit11(i, e, t) {
    return this.fit(i, -1, 1, e, t);
  },
  step(i, e) {
    return e < i ? 0 : 1;
  },
  linearstep(i, e, t) {
    return this.clamp((t - i) / (e - i), 0, 1);
  },
  smoothstep(i, e, t) {
    const s = this.linearstep(i, e, t);
    return s * s * (3 - 2 * s);
  },
  smootherstep(i, e, t) {
    const s = this.linearstep(i, e, t);
    return s * s * s * (s * (s * 6 - 15) + 10);
  },
  parabola(i, e) {
    return Math.pow(4 * i * (1 - i), e);
  },
  pcurve(i, e, t) {
    return (
      (Math.pow(e + t, e + t) / (Math.pow(e, e) * Math.pow(t, t))) *
      Math.pow(i, e) *
      Math.pow(1 - i, t)
    );
  },
  falloff(i, e, t, s, n) {
    const r = s * Math.sign(t - e),
      a = this.mix(e - r, t, n);
    return this.linearstep(a + r, a, i);
  },
  falloffsmooth(i, e, t, s, n) {
    const r = s * Math.sign(t - e),
      a = this.mix(e - r, t, n);
    return this.smoothstep(a + r, a, i);
  },
  ease(i, e = 'linear') {
    return (easingFunctions[e] || easingFunctions.none)(i);
  },
  round(i, e = 0) {
    const t = Math.pow(10, e);
    return Math.round(i * t) / t;
  },
  isPowerOfTwo(i) {
    return (i & (i - 1)) === 0 && i !== 0;
  },
  ceilPowerOfTwo(i) {
    return Math.pow(2, Math.ceil(Math.log(i) / Math.LN2));
  },
  floorPowerOfTwo(i) {
    return Math.pow(2, Math.floor(Math.log(i) / Math.LN2));
  },
  makeAnglePositive(i) {
    const e = i % this.TWO_PI;
    return e < 0 ? this.TWO_PI + e : e;
  },
  getShortestRotationAngle(i, e) {
    const t = this.makeAnglePositive(i);
    let s = this.makeAnglePositive(e);
    if (Math.abs(s - t) > Math.PI)
      if (s > t) s -= this.TWO_PI;
      else s += this.TWO_PI;
    return i + s - t;
  },
  latLonTo3D(i, e, t) {
    const s = this.HALF_PI - this.radians(i),
      n = this.radians(e);
    return {
      x: t * Math.sin(s) * Math.sin(n),
      y: t * Math.cos(s),
      z: t * Math.sin(s) * Math.cos(n),
    };
  },
  getTextureSizeParticles(i = 4, e = 1) {
    return Math.max(Math.ceil(Math.sqrt(i * e) / 4) * 4, 4);
  },
  uidAlphabet: 'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict',
  uid(i = 21) {
    let e = '',
      t = i;
    for (; t--;) e += this.uidAlphabet[(Math.random() * 64) | 0];
    return e;
  },
};
const Qr = new Vector3();
const Ga = new Vector3();
function sineNoise3D(i, e, t) {
  Qr.set(i, e, t);
  let s = 0;
  s += Math.sin(Qr.dot(Ga.set(1.5, 3.4598, 1.234)));
  s += Math.sin(Qr.dot(Ga.set(3.12, -3.234, 4.221)));
  s += Math.sin(Qr.dot(Ga.set(0.355, 2.3, -1.375)));
  s += Math.sin(Qr.dot(Ga.set(-0.156, -3.34, -0.4566)));
  s += Math.sin(Qr.dot(Ga.set(-4.1235, -0.485, -1.45)));
  s += Math.sin(Qr.dot(Ga.set(2.54, -0.879, -2.123)));
  return s / 6;
}
const noise = {
  sineNoise1: sineNoise3D,
};
export { math, Qr, Ga, sineNoise3D, noise };
