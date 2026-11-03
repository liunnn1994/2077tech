// Reconstructed application source. Third-party implementations are npm imports.
import {
  Vector3,
  BufferGeometry,
  Float32BufferAttribute,
  LineBasicMaterial,
  AdditiveBlending,
  LineSegments,
} from 'three';
import { StructurePlexusPoints } from './StructurePlexusPoints.js';
import { StructurePlexusNumbers } from './StructurePlexusNumbers.js';
import { gsap } from 'gsap';
import { math } from '../../../engine/core/math.js';
const Ih = new Vector3();
const Ya = new Vector3();
class StructurePlexus {
  constructor({ scene, parent } = {}) {
    this.scene = scene;
    this.parent = parent;
    this.ready = new Promise((isReady) => {
      this.isReady = isReady;
    });
    this.closest = [];
    this.lastMousePosition = new Vector3();
    this.maxPlexusPoints = 5;
    this.maxPlexusConnections = 2;
    this.animateLineInTime = 0.1;
    this.animateLineOutTime = 0.06;
    this.isPlexusTransitioning = false;
    this.init();
  }
  init() {
    const e = new BufferGeometry();
    e.setAttribute(
      'position',
      new Float32BufferAttribute(
        new Float32Array(this.maxPlexusPoints * this.maxPlexusConnections * 2 * 3),
        3,
      ),
    );
    const t = new LineBasicMaterial({
      color: '#ffffff',
      opacity: 0.25,
      transparent: true,
    });
    t.depthTest = false;
    t.depthWrite = false;
    t.blending = AdditiveBlending;
    this.lineMesh = new LineSegments(e, t);
    this.lineMesh.frustumCulled = false;
    this.lineMesh.visible = false;
    this.lineMesh.name = 'plexus lines';
    this.lineMesh.renderOrder = 999;
    this.scene.add(this.lineMesh);
    this.points = new StructurePlexusPoints({
      scene: this.scene,
      parent: this,
    });
    this.numbers = new StructurePlexusNumbers({
      scene: this.scene,
      parent: this,
    });
    this.isReady();
  }
  _removeConnections(e) {
    if (
      (e.__plexusConnections.forEach((t) => {
        t.__plexusConnections = t.__plexusConnections.filter((s) => s !== e);
      }),
      (e.__plexusConnections = []),
      this.closest.forEach((t) => {
        t.__plexusConnections = t.__plexusConnections.filter((s) => this.closest.includes(s));
      }),
      !(this.closest.length < 2))
    )
      for (let t = 0; t < this.closest.length; t++) {
        const s = this.closest[t];
        if (s.__plexusConnections.length === 0) {
          let n = this.closest.slice();
          n = n.filter((r) => r !== s);
          n.forEach((r) => {
            r.__plexusDistPoint = r.position.distanceTo(s.position);
          });
          n.sort((r, a) => r.__plexusDistPoint - a.__plexusDistPoint);
          s.__plexusConnections.push(n[0]);
          n[0].__plexusConnections.push(s);
          gsap.to(s.__plexusAnimation, {
            value: 1,
            ease: 'none',
            duration: this.animateLineInTime,
            overwrite: true,
          });
        }
      }
  }
  _makeConnections(e) {
    this._removeConnections(e);
    let t = this.closest.slice();
    t = t.filter((n) => n !== e);
    t.forEach((n) => {
      n.__plexusDistPoint = n.position.distanceTo(e.position);
    });
    t.sort((n, r) => n.__plexusDistPoint - r.__plexusDistPoint);
    let s = 0;
    for (; s < t.length && e.__plexusConnections.length < this.maxPlexusConnections;) {
      const n = t[s];
      if (
        n.__plexusConnections.length < this.maxPlexusConnections &&
        !n.__plexusConnections.includes(e) &&
        !e.__plexusConnections.includes(n)
      ) {
        e.__plexusConnections.push(n);
        n.__plexusConnections.push(e);
      }
      s++;
    }
    if (e.__plexusConnections.length === 0 && t.length > 0) {
      e.__plexusConnections.push(t[0]);
      t[0].__plexusConnections.push(e);
    }
  }
  update() {
    var h, d;
    Ih.copy(this.parent.scene.camera.position).sub(this.parent.mousePosition).normalize();
    Ya.copy(this.parent.mousePosition).addScaledVector(Ih, 1);
    const s = this.lastMousePosition.distanceTo(Ya) > 0.05;
    if (s) this.lastMousePosition.copy(Ya);
    let n = this.parent._objects.map(
      (u) => (
        (u.__plexusDistance = u.position.distanceToSquared(Ya)),
        (u.__plexusDistReal = false),
        u.__plexusConnections || (u.__plexusConnections = []),
        u.__plexusAnimation === void 0 &&
          (u.__plexusAnimation = {
            value: 0,
          }),
        u
      ),
    );
    n.sort((u, f) => u.__plexusDistance - f.__plexusDistance);
    n = n.filter((u) => u.displacement > 0.1);
    n = n.slice(0, this.maxPlexusPoints);
    const r = (u) => {
      if (!u.__plexusDistReal) {
        u.__plexusDistReal = true;
        u.__plexusDistance = Math.sqrt(u.__plexusDistance);
      }
    };
    if (
      (n.forEach(r),
      this.closest.forEach(r),
      (n = n.filter((u) => u.__plexusDistance < 2)),
      this.closest.sort((u, f) => u.__plexusDistance - f.__plexusDistance),
      !this.isPlexusTransitioning && s)
    )
      for (let u = this.closest.length - 1; u > -1; u--) {
        const f = this.closest[u];
        if (!n.includes(f)) {
          this.isPlexusTransitioning = true;
          gsap.to(f.__plexusAnimation, {
            value: 0,
            ease: 'none',
            duration: this.animateLineOutTime,
            overwrite: true,
            onComplete: () => {
              this.closest.splice(u, 1);
              this._removeConnections(f);
              this.isPlexusTransitioning = false;
            },
          });
          break;
        }
      }
    if (!this.isPlexusTransitioning && this.closest.length < this.maxPlexusPoints)
      for (let u = 0; u < n.length; u++) {
        const f = n[u];
        if (!this.closest.includes(f)) {
          this.isPlexusTransitioning = true;
          this.closest.push(f);
          this._makeConnections(f);
          gsap.to(f.__plexusAnimation, {
            value: 1,
            ease: 'none',
            duration: this.animateLineInTime,
            overwrite: true,
            onComplete: () => {
              this.isPlexusTransitioning = false;
            },
          });
          break;
        }
      }
    this.closest.forEach((u, _f) => {
      u.__UIPos = Ih.copy(u.position)
        .addScaledVector(Ya.copy(u.centroid).normalize(), 0.2)
        .toArray();
    });
    const a = [],
      o = [];
    for (let u = 0; u < this.closest.length; u++) {
      const f = this.closest[u];
      for (let p = 0; p < f.__plexusConnections.length; p++) {
        const A = f.__plexusConnections[p];
        if (
          ((h = o[f._pieceIndex]) != null && h.includes(A._pieceIndex)) ||
          ((d = o[A._pieceIndex]) != null && d.includes(f._pieceIndex))
        )
          continue;
        if (!o[f._pieceIndex]) o[f._pieceIndex] = [];
        if (!o[A._pieceIndex]) o[A._pieceIndex] = [];
        o[f._pieceIndex].push(A._pieceIndex);
        o[A._pieceIndex].push(f._pieceIndex);
        const m = f.__plexusAnimation.value >= A.__plexusAnimation.value ? f : A,
          g = m === f ? A : f,
          x = m.__UIPos,
          v = Ih.fromArray(x).lerp(Ya.fromArray(g.__UIPos), g.__plexusAnimation.value).toArray();
        a.push(...x, ...v);
      }
    }
    const l = this.maxPlexusPoints * this.maxPlexusConnections * 2 * 3;
    for (; a.length < l;) a.push(0, 0, 0, 0, 0, 0);
    this.lineMesh.geometry.attributes.position.set(a);
    this.lineMesh.geometry.attributes.position.needsUpdate = true;
    this.lineMesh.visible = a.length > 0;
    this.points.update();
    this.numbers.update();
    const c = (n.length > 0 ? 1 : 0) * this.scene._windVolume;
    this.scene._structureVolume = math.lerpFPS(this.scene._structureVolume, c, 0.1);
  }
}
export { Ih, Ya, StructurePlexus };
