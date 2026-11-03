// Reconstructed application source. Third-party implementations are npm imports.
import {
  PlaneGeometry,
  BufferGeometry,
  BufferAttribute,
  Vector3,
  WebGLRenderTarget,
  HalfFloatType,
} from 'three';
import {
  Dw,
  Lw,
  Rw,
  Uw,
  Va,
  Wf,
  JD,
  jD,
  ZD,
  px,
  xu,
  mx,
  Wa,
} from '../rendering/webgl-renderer-geometry.js';
import { math } from '../core/math.js';
import { PointerPlane } from '../cameras/pointer-plane.js';
import { environment } from '../core/environment.ts';
const unitPlane = new PlaneGeometry();
const fullscreenTriangle = new BufferGeometry();
fullscreenTriangle.setAttribute(
  'position',
  new BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3),
);
fullscreenTriangle.setAttribute('uv', new BufferAttribute(new Float32Array([0, 0, 2, 0, 0, 2]), 2));
function closestPointOnMesh(
  i,
  e,
  t = {
    point: Dw,
    triangle: Lw,
    triangleIndex: 0,
    triangleNormal: Rw,
    triangleBarycoord: Uw,
    nearestPointIndex: 0,
  },
) {
  let s = 1 / 0;
  for (let r = 0; r < e.geometry.index.count; r += 3) {
    Va.setFromAttributeAndIndices(
      e.geometry.attributes.position,
      e.geometry.index.array[r],
      e.geometry.index.array[r + 1],
      e.geometry.index.array[r + 2],
    );
    Va.a.applyMatrix4(e.matrixWorld);
    Va.b.applyMatrix4(e.matrixWorld);
    Va.c.applyMatrix4(e.matrixWorld);
    Va.closestPointToPoint(i, Wf);
    const a = i.distanceToSquared(Wf);
    if (a < s) {
      s = a;
      t.triangleIndex = r;
      t.point.copy(Wf);
      t.triangle.copy(Va);
    }
  }
  t.triangle.getNormal(t.triangleNormal);
  t.triangle.getBarycoord(t.point, t.triangleBarycoord);
  let n = 0;
  if (
    t.triangleBarycoord.y > t.triangleBarycoord.x &&
    t.triangleBarycoord.y > t.triangleBarycoord.z
  )
    n = 1;
  if (
    t.triangleBarycoord.z > t.triangleBarycoord.x &&
    t.triangleBarycoord.z > t.triangleBarycoord.y
  )
    n = 2;
  t.nearestPointIndex = e.geometry.index.array[t.triangleIndex + n];
  return t;
}
function transferNearestAttribute(i, e = 'uv', t, s = 'uv1') {
  if (!i.geometry.attributes[e])
    throw new Error(`The source geometry doesn't have the ${e} attribute.`);
  const n = t.geometry.attributes.position,
    r = n.count,
    a = i.geometry.attributes[e].itemSize;
  if (!t.geometry.attributes[s])
    t.geometry.setAttribute(s, new BufferAttribute(new Float32Array(r * a), a));
  const o = t.geometry.attributes[s].array;
  i.updateMatrixWorld();
  t.updateMatrixWorld();
  let l = JD;
  if (a === 3) l = jD;
  else if (a === 4) l = ZD;
  const c = l.clone(),
    h = {
      point: Dw,
      triangle: Lw,
      triangleIndex: 0,
      triangleNormal: Rw,
      triangleBarycoord: Uw,
      nearestPointIndex: 0,
    };
  for (let d = 0; d < r; d++) {
    px.fromBufferAttribute(n, d).applyMatrix4(t.matrixWorld);
    closestPointOnMesh(px, i, h);
    const u = i.geometry.index.array[h.triangleIndex],
      f = i.geometry.index.array[h.triangleIndex + 1],
      p = i.geometry.index.array[h.triangleIndex + 2];
    if (a === 1) {
      const A = i.geometry.attributes[e].array[u],
        m = i.geometry.attributes[e].array[f],
        g = i.geometry.attributes[e].array[p];
      o[d] = A * h.triangleBarycoord.x + m * h.triangleBarycoord.y + g * h.triangleBarycoord.z;
    } else {
      l.setScalar(0);
      l.addScaledVector(c.fromBufferAttribute(i.geometry.attributes[e], u), h.triangleBarycoord.x);
      l.addScaledVector(c.fromBufferAttribute(i.geometry.attributes[e], f), h.triangleBarycoord.y);
      l.addScaledVector(c.fromBufferAttribute(i.geometry.attributes[e], p), h.triangleBarycoord.z);
      o.set(l.toArray(), d * a);
    }
  }
  t.geometry.attributes[s].needsUpdate = true;
}
class SpringPoint extends Vector3 {
  constructor(e, t, s) {
    super(e, t, s);
    this.acceleration = new Vector3();
    this.velocity = new Vector3();
    this.restPosition = new Vector3(e, t, s);
    this.restStrength = 0;
    this.locked = false;
  }
  update(e = 0.97) {
    if (this.locked) {
      this.acceleration.setScalar(0);
      this.velocity.setScalar(0);
      this.copy(this.restPosition);
      return;
    }
    const t = math.deltaRatio();
    this.velocity.add(xu.copy(this.acceleration).multiplyScalar(t));
    this.add(xu.copy(this.velocity).multiplyScalar(t));
    const s = math.frictionFPS(e);
    if ((this.velocity.multiplyScalar(s), this.acceleration.setScalar(0), this.restStrength > 0)) {
      const n = xu.copy(this.restPosition).sub(this).multiplyScalar(this.restStrength);
      this.acceleration.add(n);
    }
  }
  copy(e) {
    super.copy(e);
    this.acceleration.copy(e.acceleration);
    this.velocity.copy(e.velocity);
    this.restPosition.copy(e.restPosition);
    this.restStrength = e.restStrength;
    this.locked = e.locked;
  }
}
class Spring {
  constructor(a, b) {
    this.a = a;
    this.b = b;
    this.strength = 0.05;
    this.restLength = this.a.distanceTo(this.b);
    this.fixedLength = false;
  }
  update(e = 0.999) {
    const t = xu.copy(this.b).sub(this.a),
      s = t.length() - this.restLength;
    if (this.fixedLength) {
      t.normalize().multiplyScalar(this.restLength);
      if (!this.b.locked) {
        this.b.copy(this.a).add(t);
        this.a.acceleration.setScalar(0);
        this.a.velocity.setScalar(0);
        this.b.acceleration.setScalar(0);
        this.b.velocity.setScalar(0);
      }
    } else {
      const n = math.frictionFPS(e),
        r = t.normalize().multiplyScalar(s * this.strength * n);
      if (!this.a.locked) this.a.acceleration.add(r);
      if (!this.b.locked) this.b.acceleration.sub(r);
    }
  }
  copy(e) {
    this.a.copy(e.a);
    this.b.copy(e.b);
    this.strength = e.strength;
    this.restLength = e.restLength;
    this.fixedLength = e.fixedLength;
  }
}
const geometryUtils = {
  plane: unitPlane,
  triangle: fullscreenTriangle,
  planeInteraction: new PointerPlane(),
  createDummyRT() {
    const i = new WebGLRenderTarget(2, 2, {
      type: HalfFloatType,
    });
    i.setSize = () => {};
    i.dispose = () => {};
    return i;
  },
  attribTransfer: transferNearestAttribute,
  closestPointInfo: closestPointOnMesh,
  positionUI({
    camera: i,
    mesh: e,
    x: t = 0,
    y: s = 0,
    width: n = 1,
    height: r = 1,
    distance: a = null,
    billboardCamera: o = true,
  } = {}) {
    const l = a || mx.subVectors(i.position, i.target).length();
    i.getViewSize(l, Wa);
    const c = Wa.y / environment.screen.height;
    e.scale.set(n * c, r * c, 1);
    const h = t / environment.screen.width,
      d = s / environment.screen.height;
    e.position
      .copy(i.position)
      .add(mx.set(Wa.x * -0.5 + Wa.x * h, Wa.y * 0.5 - Wa.y * d, -l).applyQuaternion(i.quaternion));
    if (o) e.quaternion.copy(i.quaternion);
    e.updateMatrixWorld();
  },
  point: SpringPoint,
  spring: Spring,
};
export {
  unitPlane,
  fullscreenTriangle,
  closestPointOnMesh,
  transferNearestAttribute,
  SpringPoint,
  Spring,
  geometryUtils,
};
