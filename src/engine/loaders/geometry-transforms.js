// Reconstructed application source. Third-party implementations are npm imports.
import {
  Object3D,
  Vector3,
  InstancedBufferGeometry,
  InstancedBufferAttribute,
  BufferGeometry,
  BufferAttribute,
  Vector4,
  DataTexture,
  RGBAFormat,
  FloatType,
  CurvePath,
  LineCurve3,
  MeshNormalMaterial,
  Bone,
  Skeleton,
  SkinnedMesh,
  AnimationClip,
  QuaternionKeyframeTrack,
  VectorKeyframeTrack,
  InterpolateLinear,
} from 'three';
import { math } from '../core/math.js';
import { gsap } from 'gsap';
import { dl, gR, qf, Mh, yx, vR } from './geometries-msdf-animation.js';
const yn = new Object3D();
const gx = ['scale', 'quaternion', 'position'];
const vx = new Vector3();
const xx = new Vector3();
function createInstancedGeometry(i, e) {
  const t = i.clone(),
    s = e.clone(),
    n = new InstancedBufferGeometry();
  n.instanceCount = Object.values(s.attributes)[0].count;
  if (t.index) n.setIndex(t.index);
  for (const a in t.attributes) n.setAttribute(a, t.attributes[a]);
  for (const a in s.attributes) {
    if (gx.includes(a)) continue;
    const o = s.attributes[a],
      l = new InstancedBufferAttribute(o.array, o.itemSize, o.normalized, 1);
    if (a === 'color') n._colors = l;
    else n.setAttribute(a, l);
  }
  const r = [];
  for (let a = 0; a < n.instanceCount; a++) {
    yn.scale.setScalar(1);
    yn.quaternion.identity();
    yn.position.setScalar(0);
    gx.forEach((o) => {
      const l = s.attributes[o];
      if (!(!l || o === 'color'))
        switch (o) {
          case 'scale':
            if (l.itemSize === 1) yn.scale.setScalar(l.array[a]);
            else yn.scale.fromArray(l.array, a * 3);
            break;
          case 'quaternion':
            yn.quaternion.fromArray(l.array, a * 4).normalize();
            break;
          case 'position':
            yn.position.fromArray(l.array, a * 3);
            break;
        }
    });
    yn.updateMatrix();
    r.push(...yn.matrix.toArray());
  }
  n._matrixArray = new Float32Array(r);
  if (i.__vertexAnimationUniforms) n.__vertexAnimationUniforms = i.__vertexAnimationUniforms;
  return n;
}
function createSpatialInstancePatches(i, e, t) {
  const s = Object.keys(e.attributes),
    n = e.attributes.position,
    r = n.count,
    a = Array.from(Array(r).keys()),
    o = [],
    l = [];
  let c = 0;
  const h = [];
  for (; a.length > 0;) {
    o.push(c);
    h.push(c);
    a.splice(a.indexOf(c), 1);
    vx.fromBufferAttribute(n, c);
    let d = null,
      u = 1 / 0,
      f = false;
    if (
      (a.forEach((p) => {
        xx.fromBufferAttribute(n, p);
        const A = xx.distanceToSquared(vx);
        if (A < u) {
          d = p;
          u = A;
        }
      }),
      d && ((c = d), Math.sqrt(u) < t.maxDistance && (f = true)),
      h.length > 0 && (h.length === t.maxPerPatch || !f || o.length === r))
    ) {
      const p = new BufferGeometry();
      s.forEach((A) => {
        const m = e.attributes[A],
          g = new Float32Array(m.itemSize * h.length);
        for (let x = 0; x < h.length; x++) {
          const v = h[x] * m.itemSize,
            y = [];
          for (let S = 0; S < m.itemSize; S++) y.push(m.array[v + S]);
          g.set(y, x * m.itemSize);
        }
        p.setAttribute(A, new BufferAttribute(g, m.itemSize));
      });
      l.push(createInstancedGeometry(i, p));
      h.length = 0;
    }
  }
  return l;
}
const Yf = 'batchId';
function splitGeometryByBatchId(i) {
  if (!i.attributes[Yf] || !i.getIndex()) {
    console.warn('Geometry does not have a batchId or an index attribute');
    return [i];
  }
  const e = i.getIndex(),
    t = new Set(),
    s = new Map(),
    n = new Map();
  for (let a = 0; a < e.count; a++) {
    const o = e.array[a],
      l = i.attributes[Yf].array[o];
    t.add(l);
    if (!n.has(l)) n.set(l, new Map());
    if (!s.has(l)) s.set(l, []);
    const c = n.get(l),
      h = s.get(l);
    if (c.has(o)) h.push(c.get(o));
    else {
      const d = c.size;
      c.set(o, d);
      h.push(d);
    }
  }
  const r = [];
  for (const a of t) {
    const o = new BufferGeometry(),
      l = n.get(a),
      c = s.get(a);
    for (const d in i.attributes) {
      if (d === Yf) continue;
      const u = i.getAttribute(d),
        { array: f, itemSize: p, normalized: A } = u,
        m = new u.constructor(new f.constructor(l.size * p), p, A);
      o.setAttribute(d, m);
      l.forEach((g, x) => {
        const v = g * p,
          y = x * p;
        for (let S = 0; S < p; S++) m.array[v + S] = u.array[y + S];
      });
    }
    const h = c.length > 65535 ? Uint32Array : Uint16Array;
    o.setIndex(new BufferAttribute(new h(c), 1));
    r.push(o);
  }
  return r;
}
function capitalize(i) {
  return i.charAt(0).toUpperCase() + i.slice(1);
}
function createVertexAnimationGeometry(i) {
  const e = i.userData,
    t = Object.keys(i.attributes),
    s = t.filter((o) => o.slice(-2) === '_1').map((o) => o.substring(0, o.length - 2)),
    n = t.filter((o) => o.slice(-2) === '_2').map((o) => o.substring(0, o.length - 2)),
    r = new BufferGeometry();
  if (i.index) r.setIndex(i.index.clone());
  s.forEach((o) => {
    r.setAttribute(o, i.attributes[`${o}_1`].clone());
  });
  const a = {};
  if (n.length > 0) {
    const o = i.attributes[`${n[0]}_1`].count,
      l = o * e.frames,
      c = math.getTextureSizeParticles(l),
      h = c * c;
    a.uAnimInfo = {
      value: new Vector4(e.fps, e.frames, o, c),
      ignore: true,
    };
    const d = new Float32Array(o);
    for (let u = 0; u < d.length; u++) d[u] = u;
    r.setAttribute('vposition', new BufferAttribute(d, 1));
    n.forEach((u) => {
      const f = new Float32Array(h * 4);
      for (let A = 0; A < e.frames; A++) {
        const m = i.attributes[`${u}_${A + 1}`].array;
        for (let g = 0; g < o; g++) {
          const x = A * o * 4 + g * 4,
            v = g * 3;
          f[x + 0] = m[v + 0];
          f[x + 1] = m[v + 1];
          f[x + 2] = m[v + 2];
          f[x + 3] = 1;
        }
      }
      const p = new DataTexture(f, c, c, RGBAFormat, FloatType);
      p.needsUpdate = true;
      a[`t${capitalize(u)}`] = {
        value: p,
      };
    });
  }
  r.__vertexAnimationUniforms = a;
  return r;
}
function createCurvesFromGeometry(i, e, t) {
  const s = [];
  Object.values(i.attributes).forEach((n) => {
    const r = n.count,
      a = n.array,
      o = [];
    for (let h = 0; h < r; h++) o.push(new Vector3(a[h * 3 + 0], a[h * 3 + 1], a[h * 3 + 2]));
    const l = new CurvePath();
    for (let h = 0; h < o.length - 1; h++) l.add(new LineCurve3(o[h], o[h + 1]));
    if (t) l.autoClose = true;
    const c = l.getPoints(Math.round(l.getLength() * 10 * e));
    s.push({
      curve: l,
      geometry: new BufferGeometry().setFromPoints(c),
    });
  });
  return s;
}
const dR = new MeshNormalMaterial();
function createSkinnedGeometry(i, e) {
  const t = [];
  for (let a = 0; a < e.attributes.position.count; a++) {
    const o = new Bone();
    o.name = `bone_${a}`;
    o.position.fromArray(e.attributes.position.array, a * 3);
    o.quaternion.fromArray(e.attributes.quaternion.array, a * 4).normalize();
    o.scale.fromArray(e.attributes.scale.array, a * 3);
    t.push(o);
  }
  const s = [];
  for (let a = 0; a < e.attributes.hierarchy.count; a++) {
    const o = e.attributes.hierarchy.array[a] - 1;
    if (o === -1) s.push(a);
    else t[o].add(t[a]);
  }
  const n = new Skeleton(t),
    r = new SkinnedMesh(i, dR);
  s.forEach((a) => r.add(n.bones[a]));
  r.bind(n);
  r.normalizeSkinWeights();
  return r;
}
class PointAnimation {
  constructor(e) {
    const t = e.userData;
    this._frames = t.frames;
    this._fps = t.fps;
    this._duration = this._frames / this._fps;
    this._attribs = e.attributes;
    this._camTargetDistance = 1;
    this._object = null;
    this._animationVar = 0;
    this._animation = gsap.to(this, {
      _animationVar: 1,
      duration: this._duration,
      ease: 'none',
      paused: true,
      callbackScope: this,
      onUpdate: this._onUpdate,
    });
  }
  _onUpdate() {
    if (!this._object) return;
    const e = this._frames - 1,
      t = math.clamp(e * this._animationVar, 0, e),
      s = Math.floor(t),
      n = Math.ceil(t),
      r = Math.abs(t - s);
    if (this._object.isCamera) dl.identity();
    gR.forEach((a) => {
      const o = this._attribs[a];
      if (!(!o || !this._object[a]) && !(this._object.isCamera && a === 'scale'))
        switch (a) {
          case 'scale':
            if (o.itemSize === 1)
              this._object.scale.setScalar(math.lerp(o.array[s], o.array[n], r));
            else this._object.scale.fromArray(o.array, s * 3).lerp(qf.fromArray(o.array, n * 3), r);
            break;
          case 'quaternion':
            Mh.fromArray(o.array, s * 4).normalize();
            yx.fromArray(o.array, n * 4).normalize();
            Mh.slerp(yx, r);
            if (this._object.isCamera) dl.copy(Mh);
            else this._object.quaternion.copy(Mh);
            break;
          case 'position':
            this._object[this._object.isCamera ? 'basePosition' : 'position']
              .fromArray(o.array, s * 3)
              .lerp(qf.fromArray(o.array, n * 3), r);
            break;
        }
    });
    if (this._object.isCamera && !dl.equals(vR)) {
      this._object.baseTarget
        .set(0, 0, -this._camTargetDistance)
        .applyQuaternion(dl)
        .add(this._object.basePosition);
      this._object.baseUp.set(0, 1, 0).applyQuaternion(dl);
    }
  }
  use(_object, t = true) {
    this._object = _object;
    if (this._object.isCamera && t)
      this._camTargetDistance = qf
        .copy(this._object.baseTarget)
        .sub(this._object.basePosition)
        .length();
    return this.progress(0);
  }
  play() {
    return this._animation.play();
  }
  pause() {
    return this._animation.pause();
  }
  progress(e = 0) {
    return this._animation.progress(e);
  }
  restart() {
    return this._animation.restart();
  }
  dispose() {
    this._animation.kill();
    this._object = null;
  }
}
function createSkinAnimation(i, e) {
  if (!Object.hasOwn(e.userData, 'frames') || !Object.hasOwn(e.userData, 'fps'))
    return new AnimationClip(i, 0, []);
  const t = e.userData,
    s = t.frames,
    n = e.attributes.position.count / s,
    r = s / t.fps,
    a = r / (s - 1),
    o = Array.from({ length: s }, (_h, d) => d * a),
    l = {};
  ['position', 'quaternion', 'scale'].forEach((h) => {
    const d = e.attributes[h].array,
      u = e.attributes[h].itemSize;
    for (let f = 0; f < n; f++) {
      const p = `bone_${f}.${h}`;
      l[p] = {
        size: u,
        arr: [],
      };
      for (let A = 0; A < s; A++) {
        const m = A * n * u;
        for (let g = 0; g < u; g++) l[p].arr.push(d[m + f * u + g]);
      }
    }
  });
  const c = [];
  Object.keys(l).forEach((h) => {
    const d = l[h].size === 4 ? QuaternionKeyframeTrack : VectorKeyframeTrack;
    c.push(new d(h, o, l[h].arr, InterpolateLinear));
  });
  return new AnimationClip(i, r, c);
}
export {
  yn,
  gx,
  vx,
  xx,
  createInstancedGeometry,
  createSpatialInstancePatches,
  Yf,
  splitGeometryByBatchId,
  capitalize,
  createVertexAnimationGeometry,
  createCurvesFromGeometry,
  dR,
  createSkinnedGeometry,
  PointAnimation,
  createSkinAnimation,
};
