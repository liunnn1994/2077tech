// Reconstructed application source. Third-party implementations are npm imports.
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { rendererService } from './webgl-renderer.js';
import { DepthTexture } from 'three';
import { events } from '../core/events.ts';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { globalUniforms } from './global-uniforms.js';
class SceneComposer extends EffectComposer {
  constructor({
    renderer: e = rendererService.webgl,
    renderTarget: t = void 0,
    autoResize: s = true,
    renderToScreen = false,
    depthTexture: r = false,
    scene: a = null,
  } = {}) {
    super(e, t);
    this.renderToScreen = renderToScreen;
    if (r) {
      this.writeBuffer.depthTexture = new DepthTexture();
      this.readBuffer.depthTexture = new DepthTexture();
    }
    if (s) {
      this._autoResize();
      events.on('resize', this._autoResize, this);
    }
    if (a != null && a.camera) {
      this.addPass(new RenderPass(a, a.camera));
      a.composer = this;
    }
  }
  _autoResize() {
    this.setSize(globalUniforms.resolution.value.x, globalUniforms.resolution.value.y);
  }
  addPass(e) {
    var t;
    super.addPass(e);
    if ((t = e.scene) != null && t.camera) e.scene.composer = this;
    this.passes.sort((s, n) => {
      const r = [s, n].map((a) => (a.isGammaCorrectionPass ? 1 : 0));
      return r[0] - r[1];
    });
  }
  dispose() {
    events.off('resize', this._autoResize, this);
    this.passes.forEach((e) => {
      var t, s, n;
      if (!((s = (t = e.scene) == null ? void 0 : t.dispose) == null)) s.call(t);
      if (!((n = e.dispose) == null)) n.call(e);
    });
    this.passes = [];
    super.dispose();
  }
}
export { SceneComposer };
