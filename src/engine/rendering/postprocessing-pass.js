// Reconstructed application source. Third-party implementations are npm imports.
import { OrthographicCamera, HalfFloatType, Cache } from 'three';
import { geometryUtils } from '../geometry/shared.js';
import { Pass } from 'three/addons/postprocessing/Pass.js';
import {
  EffectComposer as PostprocessingComposer,
  EffectPass,
  FXAAEffect,
  SMAAEffect,
  SMAAPreset,
  KawaseBlurPass,
  KernelSize,
  GaussianBlurPass,
  BloomEffect,
  SelectiveBloomEffect,
  GodRaysEffect,
  DepthOfFieldEffect,
} from 'postprocessing';
import { rendererService } from './webgl-renderer.js';
const postprocessingCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
const sharedPostprocessingTarget = geometryUtils.createDummyRT();
class PostProcessingPass extends Pass {
  constructor() {
    super();
    this.isPostprocessingPass = true;
    this._effectComposer = new PostprocessingComposer(rendererService.webgl, {
      frameBufferType: HalfFloatType,
    });
    this._effectComposer.inputBuffer.dispose();
    this._effectComposer.outputBuffer.dispose();
    this._effectComposer.inputBuffer = sharedPostprocessingTarget;
    this._effectComposer.outputBuffer = sharedPostprocessingTarget;
    this._effectComposer.autoRenderToScreen = false;
  }
  setSize(e, t) {
    for (const s of this._effectComposer.passes) s.setSize(e, t);
  }
  render(e, t, s, n) {
    this._effectComposer.inputBuffer = s;
    this._effectComposer.outputBuffer = t;
    this._effectComposer.render(n);
  }
  addGammaCorrection() {
    const e = new EffectPass(postprocessingCamera);
    e.renderToScreen = true;
    e.fullscreenMaterial.encodeOutput = true;
    this._effectComposer.addPass(e);
    return this;
  }
  addFXAA() {
    const e = new EffectPass(postprocessingCamera, new FXAAEffect());
    e.renderToScreen = true;
    e.fullscreenMaterial.encodeOutput = true;
    this._effectComposer.addPass(e);
    return this;
  }
  addSMAA(e = {}) {
    var t;
    const s = new EffectPass(
      postprocessingCamera,
      new SMAAEffect({
        preset: SMAAPreset[((t = e.quality) == null ? void 0 : t.toUpperCase()) || 'HIGH'],
      }),
    );
    s.renderToScreen = true;
    s.fullscreenMaterial.encodeOutput = true;
    this._effectComposer.addPass(s);
    return this;
  }
  addKawaseBlur(e = {}) {
    const t = new KawaseBlurPass(e);
    t.blurMaterial.kernelSize = typeof e.kernelSize == 'number' ? e.kernelSize : KernelSize.MEDIUM;
    this._effectComposer.addPass(t);
    return this;
  }
  addGaussianBlur(e = {}) {
    const t = new GaussianBlurPass(e);
    this._effectComposer.addPass(t);
    return this;
  }
  addBloom(e = {}) {
    const t = new EffectPass(
      postprocessingCamera,
      new BloomEffect({
        ...e,
        mipmapBlur: true,
      }),
    );
    t.fullscreenMaterial.encodeOutput = false;
    this._effectComposer.addPass(t);
    return this;
  }
  addSelectiveBloom({ scene: e, objects: t, sceneDepthTexture: s, options: n = {} } = {}) {
    if (!e || !t || !s)
      throw new Error('Selective Bloom requires scene, objects and depth texture.');
    const r = new SelectiveBloomEffect(e, e.camera, {
      ...n,
      mipmapBlur: true,
    });
    r.selection.set(t.length ? t : [t]);
    const a = new EffectPass(postprocessingCamera, r);
    a.needsDepthTexture = false;
    a.setDepthTexture(s);
    a.fullscreenMaterial.encodeOutput = false;
    this._effectComposer.addPass(a);
    return this;
  }
  addGodRays({ camera: e, lightSource: t, sceneDepthTexture: s, options: n = {} } = {}) {
    if (!e || !t || !s)
      throw new Error('Godrays requires scene camera, light source and depth texture.');
    const r = new EffectPass(
      e,
      new GodRaysEffect(e, t, {
        kernelSize: KernelSize.SMALL,
        ...n,
      }),
    );
    r.needsDepthTexture = false;
    r.setDepthTexture(s);
    r.effects[0].blurPass.kernelSize = n.kernelSize || KernelSize.SMALL;
    r.fullscreenMaterial.encodeOutput = false;
    this._effectComposer.addPass(r);
    return this;
  }
  addDOF(e, t, s = {}) {
    if (!e || !t) throw new Error('DOF requires scene camera and depth texture.');
    const n = new EffectPass(
      e,
      new DepthOfFieldEffect(e, {
        resolutionScale: 0.5,
        worldFocusDistance: 4,
        worldFocusRange: 10,
        bokehScale: 5,
        ...s,
      }),
    );
    if (s.cameraTarget) n.effects[0].target = e.target;
    n.needsDepthTexture = false;
    n.setDepthTexture(t);
    n.fullscreenMaterial.encodeOutput = false;
    this._effectComposer.addPass(n);
    return this;
  }
  dispose() {
    const e = {
      depthTexture: null,
      dispose: () => {},
    };
    this._effectComposer.inputBuffer = e;
    this._effectComposer.outputBuffer = e;
    this._effectComposer.dispose();
  }
}
Cache.enabled = true;
export { postprocessingCamera, sharedPostprocessingTarget, PostProcessingPass };
