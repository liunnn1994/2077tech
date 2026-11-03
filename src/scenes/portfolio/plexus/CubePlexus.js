// Reconstructed application source. Third-party implementations are npm imports.
import { Group, Object3D } from 'three';
import { math } from '../../../engine/core/math.js';
import { CubePlexusPoints } from './CubePlexusPoints.js';
import { CubePlexusLines } from './CubePlexusLines.js';
import { frameClock } from '../../../engine/core/frame-clock.ts';
import { wrapSigned } from '../../../engine/math/wrap.js';
import { gsap } from 'gsap';
import { shuffleInPlace } from '../../../engine/math/shuffle.js';
class CubePlexus {
  constructor(parent) {
    this.parent = parent;
    this.scene = this.parent.scene;
    this.ready = new Promise((isReady) => {
      this.isReady = isReady;
    });
    this.group = new Group();
    this.group.name = 'plexus';
    this.group.position.y = this.parent.position.y;
    this.scene.add(this.group);
    this.totalPlexusPoints = 18;
    this.maxPlexusPoints = this.totalPlexusPoints;
    this.maxConnectionsPerPoint = 3;
    this.radius = this.parent.mesh.geometry.boundingSphere.radius * 0.9;
    this.treadmillDist = 3;
    this.plexusPoints = [];
    this.currentPoints = [];
    this.connections = [];
    this.connectTime = 0.35;
    this.init();
  }
  async init() {
    for (let e = 0; e < this.totalPlexusPoints; e++) {
      const t = new Object3D(),
        s = Math.random() * math.TWO_PI,
        n = math.fit(Math.random(), 0, 1, 0.8, 1) * this.radius;
      t.position.set(Math.cos(s) * n, Math.random() * this.treadmillDist, Math.sin(s) * n);
      t.originalAngle = s;
      t.originalRadius = n;
      t.originalPosition = t.position.clone();
      t._hasTreadmilled = false;
      t._pieceIndex = e;
      t.__rand = Math.random();
      t._displayVar = 0;
      t._shown = false;
      t._canConnect = false;
      t._connections = new Set();
      this.plexusPoints.push(t);
    }
    this.pointMesh = new CubePlexusPoints(this);
    this.linesMesh = new CubePlexusLines(this);
    await Promise.all([this.pointMesh.ready, this.linesMesh.ready]);
    this.isReady();
  }
  update(e, t, s) {
    const n = Math.abs(s) < 1.25,
      r = this.treadmillDist * 0.5,
      a = this.treadmillDist * 0.5 * 0.75;
    this.plexusPoints.forEach((o) => {
      const l = o.originalAngle + (o.__rand - 0.5) * 0.5 * frameClock.time,
        c = o.position.y;
      o.position.set(
        Math.cos(l) * o.originalRadius + 0.1 * Math.sin(frameClock.time * 0.5 + o.__rand * 2.324),
        wrapSigned(o.originalPosition.y + o.__rand * frameClock.time * 0.25, r),
        Math.sin(l) * o.originalRadius + 0.1 * Math.sin(frameClock.time * 0.5 + o.__rand * 9.564),
      );
      const h = Math.abs(c - o.position.y) > r;
      o._canConnect = n && Math.abs(o.position.y) < a && !h;
    });
    this.plexusPoints.forEach((o, _l) => {
      if (!o._canConnect && o._connections.size > 0)
        this.connections
          .filter((h) => (h.pt1 === o || h.pt2 === o) && !h.removing)
          .forEach((h) => {
            h.removing = true;
            gsap.to(h, {
              progress: 0,
              overwrite: true,
              ease: 'none',
              duration: this.connectTime,
              onComplete: () => {
                this.connections.splice(this.connections.indexOf(h), 1);
                h.pt1._connections.delete(h.pt2);
                h.pt2._connections.delete(h.pt1);
              },
            });
          });
    });
    this.currentPoints.forEach((o) => {
      if (this.connections.filter((l) => (l.pt1 === o || l.pt2 === o) && !l.removing).length > 0) {
        if (o._shown) return;
        o._shown = true;
        gsap.to(o, {
          _displayVar: 1,
          overwrite: true,
          ease: 'none',
          duration: this.connectTime,
        });
      } else {
        if (!o._shown) return;
        o._shown = false;
        gsap.to(o, {
          _displayVar: 0,
          ease: 'none',
          duration: this.connectTime,
          overwrite: true,
          onComplete: () => {
            if (
              this.connections.filter((l) => (l.pt1 === o || l.pt2 === o) && !l.removing).length ===
              0
            )
              this.currentPoints.splice(this.currentPoints.indexOf(o), 1);
          },
        });
      }
    });
    for (let o = 0; o < this.plexusPoints.length; o++) {
      const l = this.plexusPoints[o];
      if (!l._canConnect || l._connections.size === this.maxConnectionsPerPoint) continue;
      const c = [];
      for (let h = 0; h < this.plexusPoints.length; h++) {
        const d = this.plexusPoints[h];
        if (
          d === l ||
          !d._canConnect ||
          d._connections.size === this.maxConnectionsPerPoint ||
          l._connections.has(d)
        )
          continue;
        const u = l.position.distanceTo(d.position);
        if (u < this.treadmillDist)
          c.push({
            distance: u,
            pt: d,
          });
      }
      for (shuffleInPlace(c); c.length > 0 && l._connections.size < this.maxConnectionsPerPoint;) {
        const h = c.shift(),
          d = !this.currentPoints.includes(l),
          u = !this.currentPoints.includes(h.pt),
          f = (d ? 1 : 0) + (u ? 1 : 0);
        if (this.currentPoints.length + f > this.maxPlexusPoints) continue;
        if (d) this.currentPoints.push(l);
        if (u) this.currentPoints.push(h.pt);
        const p = {
          pt1: l,
          pt2: h.pt,
          progress: 0,
          removing: false,
        };
        gsap.to(p, {
          progress: 1,
          ease: 'none',
          duration: this.connectTime,
        });
        this.connections.push(p);
        l._connections.add(h.pt);
        h.pt._connections.add(l);
      }
      if (this.currentPoints.length === this.maxPlexusPoints) break;
    }
    this.pointMesh.update();
    this.linesMesh.update();
    this.group.rotation.copy(this.parent.rotation);
  }
  click() {
    this.linesMesh.click();
    this.pointMesh.click();
  }
  resetClick() {
    this.linesMesh.resetClick();
    this.pointMesh.resetClick();
  }
}
export { CubePlexus };
