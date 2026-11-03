// Reconstructed application source. Third-party implementations are npm imports.
import {
  Vector3,
  WebGLRenderTarget,
  HalfFloatType,
  LinearMipmapLinearFilter,
  Group,
  PMREMGenerator,
  BackSide,
  FrontSide,
} from 'three';
import { RenderScene } from '../../engine/rendering/render-scene.js';
import { siteConfig } from '../../config/site-config.js';
import { environment } from '../../engine/core/environment.ts';
import { textures } from '../../engine/loaders/textures.js';
import { events } from '../../engine/core/events.ts';
import { addPortfolioColorPass } from './addPortfolioColorPass.js';
import { runtime } from '../../engine/rendering/runtime.ts';
import { PostProcessingPass } from '../../engine/rendering/postprocessing-pass.js';
import { PortfolioBackground } from './PortfolioBackground.js';
import { PortfolioBackgroundShapes } from './PortfolioBackgroundShapes.js';
import { PortfolioBlurredText } from './PortfolioBlurredText.js';
import { PortfolioCube } from './PortfolioCube.js';
import { math } from '../../engine/core/math.js';
import { gsap } from 'gsap';
const bp = new Vector3();
class PortfolioScene extends RenderScene {
  constructor(e = {}) {
    super({
      orbit: false,
    });
    this.options = {
      cubes: siteConfig.cubes,
      verticalOffset: -5.75,
    };
    if (environment.devScene) {
      this.options.cubes = this.options.cubes.slice(0, 1);
      this.options.verticalOffset = 0;
    }
    this.controller = e.mainController;
    this.progress = 0;
    this.height = this.options.cubes.length;
    this._isSceneVisible = false;
    this._bgTex = textures.load('cubes/bg.png', 'srgb');
    this._transmissionRT = new WebGLRenderTarget(2, 2, {
      generateMipmaps: true,
      type: HalfFloatType,
      minFilter: LinearMipmapLinearFilter,
      samples: 0,
    });
    this.cubes = [];
    this._UP = new Vector3();
    this._LEFT = new Vector3();
    this.cameraZoom = {
      value: 0,
    };
    this._shardVolume = 0;
    this.init();
  }
  get isSceneVisible() {
    return this._isSceneVisible;
  }
  set isSceneVisible(_isSceneVisible) {
    const t = this._isSceneVisible !== _isSceneVisible;
    this._isSceneVisible = _isSceneVisible;
    if (t)
      if (_isSceneVisible)
        this.cubes.forEach((s) => {
          s.options.rand = Math.random();
        });
      else {
        this._shardVolume = 0;
        events.emit('webgl_set_audio_volume', 'shard', this._shardVolume);
      }
  }
  async init() {
    this.cameraOptions();
    this.renderOptions();
    await Promise.all([
      this.createEnvironmentMap(),
      this.createBg(),
      this.createBlurryText(),
      this.createBackgroundShapes(),
    ]);
    this.textsGroup = new Group();
    this.textsGroup.name = 'texts';
    this.add(this.textsGroup);
    await Promise.all(this.options.cubes.map((e, t) => this.createCube(e, t)));
    this.resize();
    events.on('resize', this.resize, this);
    this.beforeRenderCbs.push(this.update.bind(this));
    this.isReady();
  }
  cameraOptions() {
    this.camera.basePosition.set(0, 0, 5);
    this.camera.baseTarget.set(0, 0, 0);
    this.camera.displacement.position.set(0.1, 0.05);
    this.camera.shake.setScalar(0.02);
    this.camera.shakeSpeed.setScalar(0.1);
    this.camera.initialPosition = this.camera.basePosition.clone();
    this.camera.initialTarget = this.camera.baseTarget.clone();
  }
  renderOptions() {
    Promise.resolve().then(() => {
      addPortfolioColorPass(this, this.composer);
      const e = environment.devScene ? this.composer : runtime.composer;
      if (!e.__hasBloomPass) {
        e.__hasBloomPass = true;
        e.addPass(
          new PostProcessingPass().addBloom({
            debug: environment.devScene,
            levels: 6,
            luminanceThreshold: 0.2,
            intensity: 1,
            radius: 0.85,
          }),
        );
      }
    });
  }
  async createBg() {
    this.bg = new PortfolioBackground(this);
    await this.bg.ready;
  }
  async createBackgroundShapes() {
    this.backgroundshapes = new PortfolioBackgroundShapes(this);
    await this.backgroundshapes.ready;
  }
  async createBlurryText() {
    this.blurrytext = new PortfolioBlurredText(this);
    await this.blurrytext.ready;
  }
  createCube(e = {}, t) {
    const s = this.options.verticalOffset * (this.options.cubes.length + 1),
      n = environment.devScene ? 0 : (1 + t) * this.options.verticalOffset,
      r = environment.devScene ? 0 : n / s,
      a = new PortfolioCube(this, {
        index: t,
        scrollPosition: n,
        centeredProgress: r,
        ...e,
      });
    this.cubes.push(a);
    return a.ready;
  }
  async createEnvironmentMap() {
    const e = textures.load('cubes_env.exr'),
      t = new PMREMGenerator(runtime.renderer.webgl);
    await e._loaded;
    this.envmap = t.fromEquirectangular(e).texture;
    t.dispose();
  }
  async playInAnimation() {}
  update() {
    const e = (this.options.cubes.length + 1) * this.options.verticalOffset * this.progress;
    this.camera.basePosition.y = this.camera.initialPosition.y + e;
    this.camera.baseTarget.y = this.camera.initialTarget.y + e;
    this.camera.basePosition.z = this.camera.initialPosition.z + this.cameraZoom.value;
    bp.subVectors(this.camera.position, this.camera.target).normalize();
    this._LEFT.crossVectors(this.camera.up, bp);
    this._UP.crossVectors(bp, this._LEFT);
    this.cubes.forEach((r, a) => r.update(this.progress, this.camera.basePosition.y, a));
    this.bg.update(this.progress);
    this.blurrytext.update(this.progress);
    this.backgroundshapes.update(this.progress);
    this.cubes.forEach((r) => {
      r.mesh.material.side = BackSide;
      r.mesh.material.needsUpdate = true;
      r.mesh.material.uniforms.tTransmissionSamplerMap.value = this._bgTex;
      r.mesh.material.uniforms.uTransmissionSamplerSize.value.set(4, 4);
      r.mesh3.visible = true;
      r.mesh2.visible = false;
      r.plexus.group.visible = false;
    });
    this.textsGroup.visible = false;
    this.blurrytext.mesh.visible = false;
    this.backgroundshapes.mesh.visible = false;
    const t = runtime.renderer.webgl.getRenderTarget();
    runtime.renderer.webgl.setRenderTarget(this._transmissionRT);
    runtime.renderer.webgl.clear(true, true, true);
    runtime.renderer.webgl.render(this, this.camera);
    runtime.renderer.webgl.setRenderTarget(t);
    this.cubes.forEach((r) => {
      r.mesh.material.side = FrontSide;
      r.mesh.material.needsUpdate = true;
      r.mesh.material.uniforms.tTransmissionSamplerMap.value = this._transmissionRT.texture;
      r.mesh.material.uniforms.uTransmissionSamplerSize.value.set(
        this._transmissionRT.width,
        this._transmissionRT.height,
      );
      r.mesh3.visible = false;
      r.mesh2.visible = true;
      r.plexus.group.visible = true;
    });
    this.textsGroup.visible = true;
    this.blurrytext.mesh.visible = true;
    this.backgroundshapes.mesh.visible = true;
    if (this.controller) {
      this.camera.fov = 45 - 5 * Math.abs(this.controller.scroll.velocity);
      this.camera.updateProjectionMatrix();
    }
    let s = 1 / 0,
      n = 0;
    if (
      (this.cubes.forEach((r, a) => {
        const o = r.options.centeredProgress - this.progress,
          l = Math.abs(o);
        if (l < s) {
          s = l;
          n = a;
        }
      }),
      this.cubes[n].mouseFrost)
    ) {
      const r = this.cubes[n].mouseFrost.soundVelocity > this._shardVolume ? 0.2 : 0.05;
      this._shardVolume = math.lerpFPS(
        this._shardVolume,
        this.cubes[n].mouseFrost.soundVelocity,
        r,
      );
    }
    events.emit('webgl_set_audio_volume', 'shard', this._shardVolume * 0.5);
  }
  autoCenter(e, _t) {
    let s = 1 / 0,
      n = 1 / 0;
    this.cubes.forEach((o, _l) => {
      const c = o.options.centeredProgress - this.progress,
        h = Math.abs(c);
      if (h < s) {
        s = h;
        n = c;
      }
    });
    const r = n * (this.height + 1),
      a = math.clamp(Math.abs(r) * 6, 1.6, 2.4);
    e.centerScroll(e.scroll.y + r, a);
  }
  detailAnimationIn(e = 0) {
    gsap.to(this.cameraZoom, {
      overwrite: true,
      value: -3.5,
      duration: 1.25 + e,
      ease: 'power3.in',
    });
    gsap.to(
      this.cubes.map((t) => t.additionalRotationAmount),
      {
        overwrite: true,
        value: 0,
        duration: 1 + e,
        ease: 'power1.in',
      },
    );
    gsap.to(this.camera, {
      touchAmount: 0,
      overwrite: true,
      duration: 1.25 + e,
    });
    this.cubes.forEach((t) => t.plexus.click());
  }
  detailAnimationOut() {
    gsap.to(this.cameraZoom, {
      overwrite: true,
      value: 0,
      duration: 1.45,
      ease: 'power3.out',
      onComplete: () => {
        this._shardVolume = 0;
        events.emit('webgl_set_audio_volume', 'shard', this._shardVolume);
      },
    });
    gsap.to(
      this.cubes.map((e) => e.additionalRotationAmount),
      {
        overwrite: true,
        value: 1,
        duration: 1.45,
        ease: 'power2.out',
      },
    );
    gsap.to(this.camera, {
      touchAmount: 1,
      overwrite: true,
      duration: 1.45,
    });
    this.cubes.forEach((e) => e.plexus.resetClick());
  }
  resize() {
    this.camera.zoom = Math.min(1, environment.screen.aspectRatio * 1.25);
    this.camera.updateProjectionMatrix();
    this._transmissionRT.setSize(
      runtime.uniforms.resolution.value.x,
      runtime.uniforms.resolution.value.y,
    );
  }
  dispose() {}
}
export { bp, PortfolioScene };
