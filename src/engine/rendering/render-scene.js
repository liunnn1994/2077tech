// Reconstructed application source. Third-party implementations are npm imports.
import { geometryUtils } from '../geometry/shared.js';
import { Scene } from 'three';
import { createOrbitCamera } from '../cameras/orbit-camera.js';
import { createCamera } from '../cameras/base-camera.js';
import { rendererService } from './webgl-renderer.js';
import { asyncTasks } from '../core/async.ts';
const sceneUploadTarget = geometryUtils.createDummyRT();
class RenderScene extends Scene {
  constructor({ orbit: e = false, follow: _t = false, cameraType: s = 'perspective' } = {}) {
    super();
    const n = e ? createOrbitCamera : createCamera;
    this.camera = n(s);
    // Modern Three also checks this flag inside updateMatrixWorld itself.
    // Keep world matrices enabled when this scene updates its camera manually.
    this.camera.matrixWorldAutoUpdate = true;
    this.composer = null;
    this.matrixWorldAutoUpdate = true;
    this.matrixAutoUpdate = false;
    this.beforeRenderCbs = [];
    this._textures = new Set();
    this.customUploadRT = null;
    this.uploaded = new Promise((_isUploaded) => {
      this._isUploaded = _isUploaded;
    });
    this.ready = new Promise((isReady) => {
      this.isReady = isReady;
    }).then(() => {
      this._upload();
    });
  }
  async _upload() {
    this.traverse((t) => {
      var s, n, r, a;
      if ((s = t.material) != null && s.isMaterial) {
        if (t.frustumCulled)
          if (t.boundingSphere === null) t.computeBoundingSphere();
          else if (((n = t.geometry) == null ? void 0 : n.boundingSphere) === null)
            t.geometry.computeBoundingSphere();
        if (t.material.uniforms)
          Object.entries(t.material.uniforms).forEach(([_o, l]) => {
            var c;
            if ((c = l.value) != null && c.isTexture && l.value._loaded)
              this._textures.add(l.value);
          });
        Object.entries(t.material).forEach(([_o, l]) => {
          if (l != null && l.isTexture && l._loaded) this._textures.add(l);
        });
        t.__uploadVars = {
          cull: t.frustumCulled,
          visible: t.visible,
          materialVisible: t.material.visible,
          customDepthMaterialVisible: (r = t.customDepthMaterial) == null ? void 0 : r.visible,
          customDistanceMaterialVisible:
            (a = t.customDistanceMaterial) == null ? void 0 : a.visible,
        };
        t.frustumCulled = false;
        t.visible = true;
        t.material.visible = true;
        if (t.customDepthMaterial) t.customDepthMaterial.visible = true;
        if (t.customDistanceMaterial) t.customDistanceMaterial.visible = true;
      } else if (t.isLOD) {
        t.__uploadVars = {
          autoUpdate: t.autoUpdate,
        };
        t.autoUpdate = false;
      }
    });
    const e = [];
    rendererService.webgl.setRenderTarget(this.customUploadRT || sceneUploadTarget);
    e.push(rendererService.webgl.compileAsync(this, this.camera));
    if (this._textures.size > 0)
      e.push(
        ...Array.from(this._textures).map((t) =>
          t._loaded.then(() => rendererService.webgl.initTexture(t)),
        ),
      );
    await Promise.all(e);
    rendererService.webgl.setRenderTarget(this.customUploadRT || sceneUploadTarget);
    rendererService.webgl.render(this, this.camera);
    this.traverse((t) => {
      var s;
      if (t.__uploadVars) {
        if ((s = t.material) != null && s.isMaterial) {
          t.frustumCulled = t.__uploadVars.cull;
          t.visible = t.__uploadVars.visible;
          t.material.visible = t.__uploadVars.materialVisible;
          if (t.customDepthMaterial)
            t.customDepthMaterial.visible = t.__uploadVars.depthMaterialVisible;
          if (t.customDistanceMaterial)
            t.customDistanceMaterial.visible = t.__uploadVars.distanceMaterialVisible;
        } else if (t.isLOD) t.autoUpdate = t.__uploadVars.autoUpdate;
        delete t.__uploadVars;
      }
    });
    this._isUploaded();
  }
  updateMatrixWorld(e) {
    super.updateMatrixWorld(e);
    if (!asyncTasks.hasRunThisFrame(this)) {
      this.camera._resize();
      this.camera._update();
      this.camera.updateMatrixWorld();
      this.beforeRenderCbs.forEach((t) => t());
    }
  }
  dispose() {
    var e, t, s, n;
    if (!((t = (e = this.camera).dispose) == null)) t.call(e);
    this.beforeRenderCbs = [];
    if (!((n = (s = this.customUploadRT) == null ? void 0 : s.dispose) == null)) n.call(s);
    this._textures.forEach((r) => {
      var a;
      return (a = r.dispose) == null ? void 0 : a.call(r);
    });
    this._textures.clear();
    this.traverse((r) => {
      var a, o, l, c, h, d;
      if (!((o = (a = r.geometry) == null ? void 0 : a.dispose) == null)) o.call(a);
      if ((l = r.material) != null && l.isMaterial) {
        if (r.material.uniforms)
          Object.entries(r.material.uniforms).forEach(([_u, f]) => {
            var p, A, m;
            if ((p = f.value) != null && p.isTexture)
              if (!((m = (A = f.value).dispose) == null)) m.call(A);
          });
        else
          Object.entries(r.material).forEach(([_u, f]) => {
            var p;
            if (f != null && f.isTexture) if (!((p = f.dispose) == null)) p.call(f);
          });
        if (!((h = (c = r.material).dispose) == null)) h.call(c);
      }
      if (r !== this) if (!((d = r.dispose) == null)) d.call(r);
    });
    this.clear();
  }
}
export { sceneUploadTarget, RenderScene };
