// Reconstructed application source. Third-party implementations are npm imports.
import { DataTexture, RGBAFormat, FloatType } from 'three';
import { geometries } from './geometries.js';
import { math } from '../core/math.js';
function createCurveDataTexture(i, e, t) {
  const s = new DataTexture(new Float32Array(16), 2, 2, RGBAFormat, FloatType);
  s._curves = [];
  s._url = i;
  s._closed = e;
  s._pointDensity = t;
  let n = null;
  s._loaded = new Promise((r) => {
    n = r;
  });
  setTimeout(async () => {
    const r = await geometries.curves(i, e, t);
    s._curves = r;
    const a = math.ceilPowerOfTwo(Math.max(2, r.length));
    let o = 2,
      l = 0;
    r.forEach((h) => {
      o = Math.max(o, h.geometry.attributes.position.count);
      l = Math.max(l, h.curve.getLength());
    });
    o = math.clamp(math.ceilPowerOfTwo(o), 2, 2048);
    const c = new Float32Array(a * o * 4);
    r.forEach((h, d) => {
      const u = h.curve.getSpacedPoints(o),
        f = o * d * 4,
        p = 1 / (u.length - 1);
      u.forEach((A, m) => {
        const g = m * 4;
        c[f + g + 0] = A.x;
        c[f + g + 1] = A.y;
        c[f + g + 2] = A.z;
        c[f + g + 3] = p * m;
      });
    });
    s.image = {
      data: c,
      width: o,
      height: a,
    };
    s.needsUpdate = true;
    n();
  }, 0);
  return s;
}
export { createCurveDataTexture };
