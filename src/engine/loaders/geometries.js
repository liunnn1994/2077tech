import { isDocumentLeaving } from './loading-lifecycle.ts';
// Reconstructed application source. Third-party implementations are npm imports.
import { BufferGeometryLoader } from 'three';
import { events } from '../core/events.ts';
import { MetadataDracoLoader } from './draco.js';
import { MsdfGeometryLoader } from './msdf.ts';
import { _R } from './geometries-msdf-animation.js';
import {
  createInstancedGeometry,
  createSpatialInstancePatches,
  splitGeometryByBatchId,
  createVertexAnimationGeometry,
  createCurvesFromGeometry,
  PointAnimation,
  createSkinnedGeometry,
  createSkinAnimation,
} from './geometry-transforms.js';
import { environment } from '../core/environment.ts';
const bufferGeometryLoader = new BufferGeometryLoader();
const dracoGeometryLoader = new MetadataDracoLoader().setWorkerLimit(1);
const msdfGeometryLoader = new MsdfGeometryLoader().setWorkerLimit(1);
const geometries = {
  _geometryCache: new Map(),
  _initLoad(i, e) {
    if (!this._geometryCache.has(i)) this._geometryCache.set(i, new Promise(e));
    return this._geometryCache.get(i);
  },
  load(i, e = 'default') {
    return this._initLoad(`${i}_<>_${e}`, async (t) => {
      const s = i.split('.').pop();
      let n = null;
      try {
        if (s.startsWith('drc') || s.startsWith('bin')) n = await dracoGeometryLoader.loadAsync(i);
        else n = await bufferGeometryLoader.loadAsync(i);
        n._loadMode = e;
        t(n);
      } catch (r) {
        if (isDocumentLeaving()) return;
        // A placeholder can keep dependent constructors safe, but must never
        // let the host report a successful startup with missing artwork.
        const error = new Error('Geometry "' + i + '" failed to load', { cause: r });
        console.error(error);
        events.emit('asset_error', error);
        t(_R);
      }
    });
  },
  instanced(i, e, t = 'load') {
    return this._initLoad(`instanced_<>_${i}-${e}`, async (s) => {
      const [n, r] = await Promise.all([this[t](i), this.load(e)]);
      s(createInstancedGeometry(n, r));
    });
  },
  instancedPatches(i, e, { maxPerPatch: t = 25, maxDistance: s = 50 } = {}, n = 'load') {
    return this._initLoad(`instancedPatches_<>_${i}-${e}-${t}-${s}`, async (r) => {
      const [a, o] = await Promise.all([this[n](i), this.load(e)]);
      r(
        createSpatialInstancePatches(a, o, {
          maxPerPatch: t,
          maxDistance: s,
          name: e,
        }),
      );
    });
  },
  batched(i) {
    return this._initLoad(`batched_<>_${i}`, async (e) => {
      const t = await this.load(i);
      e(splitGeometryByBatchId(t));
    });
  },
  vertexAnimation(i) {
    return this._initLoad(`vertexanimation_<>_${i}`, async (e) => {
      const t = await this.load(i);
      e(createVertexAnimationGeometry(t));
    });
  },
  curves(i, e = false, t = 1) {
    return this._initLoad(`curves_<>_${i}_${e}_${t}`, async (s) => {
      const n = await this.load(i);
      s(createCurvesFromGeometry(n, t, e));
    });
  },
  pointAnimation(i) {
    return this._initLoad(`pointAnimation_<>_${i}}`, async (e) => {
      const t = await this.load(i);
      e(new PointAnimation(t));
    });
  },
  skin(i, e) {
    return this._initLoad(`skin_<>_${i}-${e}`, async (t) => {
      const [s, n] = await Promise.all([this.load(i), this.load(e)]);
      t(createSkinnedGeometry(s, n));
    });
  },
  skinAnimation(i) {
    return this._initLoad(`skinanimation_<>_${i}`, async (e) => {
      const t = await this.load(i);
      e(createSkinAnimation(i, t));
    });
  },
  msdf(i) {
    return msdfGeometryLoader.loadAsync(i);
  },
};
function configureGeometryPaths() {
  bufferGeometryLoader.setPath(`${environment.absolutePath}/assets/geometries/`);
  dracoGeometryLoader.setDecoderPath(`${environment.absolutePath}/assets/libs/draco/`);
  dracoGeometryLoader.setPath(`${environment.absolutePath}/assets/geometries/`);
  msdfGeometryLoader.setPath(`${environment.absolutePath}/assets/fonts/`);
}
function disposeGeometries() {
  dracoGeometryLoader.dispose();
  msdfGeometryLoader.dispose();
  geometries._geometryCache.forEach((i) => {
    i.then((e) => {
      var t, s, n, r, a;
      if (Array.isArray(e))
        e.forEach((o) => {
          var l, c, h;
          if (o.curve) {
            if (!((c = (l = o.geometry).dispose) == null)) c.call(l);
          } else if (!((h = o.dispose) == null)) h.call(o);
        });
      else if (e.isSkinnedMesh) {
        if (!((s = (t = e.geometry).dispose) == null)) s.call(t);
        if (!((r = (n = e.skeleton) == null ? void 0 : n.dispose) == null)) r.call(n);
      } else if (!((a = e.dispose) == null)) a.call(e);
    });
  });
  geometries._geometryCache.clear();
}
export {
  bufferGeometryLoader,
  dracoGeometryLoader,
  msdfGeometryLoader,
  geometries,
  configureGeometryPaths,
  disposeGeometries,
};
