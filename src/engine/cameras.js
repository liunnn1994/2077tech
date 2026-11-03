// Reconstructed application source. Third-party implementations are npm imports.
import { Vector3, Matrix4, Vector2, Raycaster } from 'three';
const Ks = new Vector3();
const Gr = new Vector3();
const Qf = new Vector3();
const Kn = new Vector3();
const GD = new Matrix4();
const Ch = Math.PI * 0.5;
const ax = new Vector2();
const ox = 0.1;
const lx = 1e3;
const HD = 6;
const cx = 0;
const hx = new Raycaster();
const Pi = new Vector3();
const ux = new Vector3();
const jt = {
  NONE: -1,
  ROTATE: 0,
  ZOOM: 1,
  PAN: 2,
  ZOOM_PAN: 3,
  ZOOM_ROTATE: 4,
};
const Ha = {
  NONE: -1,
  ROTATE: 0,
  PAN: 1,
  ZOOM_PAN: 2,
  ZOOM_ROTATE: 3,
};
const dx = 0.02;
const fx = 1e-6;
const Yi = new Vector2();
const Vf = new Vector2();
const rs = new Vector3();
export { Ks, Gr, Qf, Kn, GD, Ch, ax, ox, lx, HD, cx, hx, Pi, ux, jt, Ha, dx, fx, Yi, Vf, rs };
