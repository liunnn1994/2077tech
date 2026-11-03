// Reconstructed application source. Third-party implementations are npm imports.
import { RenderScene } from '../../engine/rendering/render-scene.js';
import { Vector3 } from 'three';
import { events } from '../../engine/core/events.ts';
import { environment } from '../../engine/core/environment.ts';
import { addLandscapeColorPass } from './addLandscapeColorPass.js';
import { runtime } from '../../engine/rendering/runtime.ts';
import { PostProcessingPass } from '../../engine/rendering/postprocessing-pass.js';
import { SkyDome } from './SkyDome.js';
import { LandscapeSmoke } from './LandscapeSmoke.js';
import { SnowParticles } from './SnowParticles.js';
import { IntroParticles } from './IntroParticles.js';
import { StructureFoundation } from './StructureFoundation.js';
import { StructureCage } from './StructureCage.js';
import { StructureOutline } from './StructureOutline.js';
import { Mountains } from './Mountains.js';
import { Terrain } from './Terrain.js';
import { TerrainPatches } from './TerrainPatches.js';
import { BatchedIceStructure } from './BatchedIceStructure.js';
import { Manifesto } from './Manifesto.js';
import { gsap } from 'gsap';
import { math } from '../../engine/core/math.js';
class LandscapeScene extends RenderScene {
  constructor(e = {}) {
    super({
      orbit: false,
    });
    this.controller = e.mainController;
    this.progress = 0;
    this.height = 2.35;
    this._isSceneVisible = false;
    this.introPosition = new Vector3();
    this.introTarget = new Vector3();
    this.introWeight = {
      value: 0,
    };
    this.timelinePosition = new Vector3();
    this.timelineTarget = new Vector3();
    this._needsReset = false;
    this.initialScrollAutocenter = 0.495;
    this.finalScrollAutocenter = 0.495;
    this._windVolume = 0;
    this._structureVolume = 0;
    this.init();
  }
  get isSceneVisible() {
    return this._isSceneVisible;
  }
  set isSceneVisible(_isSceneVisible) {
    const t = this._isSceneVisible !== _isSceneVisible;
    this._isSceneVisible = _isSceneVisible;
    if (t)
      if (_isSceneVisible) this._needsReset = true;
      else {
        this._windVolume = 0;
        this._structureVolume = 0;
        events.emit('webgl_set_audio_volume', 'wind', this._windVolume);
        events.emit('webgl_set_audio_volume', 'structure', this._structureVolume);
      }
  }
  async init() {
    this.cameraOptions();
    this.renderOptions();
    this.createTimeline();
    await Promise.all([
      this.createMountains(),
      this.createSmoke(),
      this.createStructureFoundation(),
      this.createStructureCage(),
      this.createStructureOutline(),
      this.createIceStructure(),
      this.createTerrain(),
      this.createTerrainPatches(),
      this.createSky(),
      this.createManifesto(),
      this.createIntroParticles(),
      this.createSnowParticles(),
    ]);
    this.createIntroTimeline();
    this.resize();
    events.on('resize', this.resize, this);
    if (!environment.devScene) this.beforeRenderCbs.push(this.update.bind(this));
    this.isReady();
  }
  cameraOptions() {
    this.camera.fov = 30;
    this.camera.updateProjectionMatrix();
    this.camera.basePosition.set(-14, 4, 14);
    this.camera.baseTarget.set(0, 1, 0);
    this.camera.displacement.position.set(0.07, 0.025);
    this.camera.shake.setScalar(0.01);
    this.camera.shakeSpeed.setScalar(0.5);
  }
  renderOptions() {
    Promise.resolve().then(() => {
      addLandscapeColorPass(this, this.composer);
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
  async createSky() {
    this.sky = new SkyDome(this);
    await this.sky.ready;
  }
  async createSmoke() {
    this.smoke = new LandscapeSmoke(this);
    await this.smoke.ready;
  }
  async createSnowParticles() {
    this.snowparticles = new SnowParticles(this);
    await this.snowparticles.ready;
  }
  async createIntroParticles() {
    this.introparticles = new IntroParticles(this);
    await this.introparticles.ready;
  }
  async createStructureFoundation() {
    this.foundation = new StructureFoundation(this);
    await this.foundation.ready;
  }
  async createStructureCage() {
    this.structureCage = new StructureCage(this);
    await this.structureCage.ready;
  }
  async createStructureOutline() {
    this.structureOutline = new StructureOutline(this);
    await this.structureOutline.ready;
  }
  async createMountains() {
    this.mountains = new Mountains(this);
    await this.mountains.ready;
  }
  async createTerrain() {
    this.terrain = new Terrain(this);
    await this.terrain.ready;
  }
  async createTerrainPatches() {
    this.terrainpatches = new TerrainPatches(this);
    await this.terrainpatches.ready;
  }
  async createIceStructure() {
    this.structure = new BatchedIceStructure(this);
    await this.structure.ready;
  }
  async createManifesto() {
    this.manifesto = new Manifesto(this);
    await this.manifesto.ready;
  }
  createIntroTimeline() {
    this.introTL = gsap.timeline({
      paused: true,
      onStart: () => {
        var D;
        const I = 1 / (this.height + 1),
          P = (this.initialScrollAutocenter - I) * (this.height + 1);
        if (!((D = this.controller) == null)) D.centerScroll(P, 0);
        this.introPosition.set(-14, 21, 14);
        this.introTarget.set(0, 0.5, 0);
      },
    });
    let e = null;
    runtime.composer.passes.forEach((I) => {
      var P, D;
      if (!((D = (P = I._effectComposer) == null ? void 0 : P.passes) == null))
        D.forEach((L) => {
          L.effects.forEach((z) => {
            if (z.name === 'BloomEffect') e = z.uniforms.get('intensity');
          });
        });
    });
    let t = null;
    this.composer.passes.forEach((I) => {
      if (I.isLandscapeColorCorrectionPass) t = I.material.uniforms.uGradientAlpha;
    });
    const s = this.snowparticles.mesh.material.uniforms.uAlpha,
      n = this.structureOutline.mesh.material.uniforms.uIntroMaterialize,
      r = this.structureOutline.mesh.material.uniforms.uAlpha,
      a = this.structure.mesh.material.uniforms.uIntroMaterialize,
      o = this.structure.introDisplacementModulator,
      l = this.foundation.mesh.material.uniforms.uAlpha,
      c = this.terrain.mesh1.material.uniforms.uAlpha,
      h = this.terrainpatches.mesh1.material.uniforms.uAlpha,
      d = this.mountains.mesh1.material.uniforms.uAlpha,
      u = this.foundation.mesh.material.uniforms.uProgress,
      f = this.mountains.mesh1.material.uniforms.uProgress,
      p = this.terrain.mesh1.material.uniforms.uProgress,
      A = this.terrainpatches.mesh1.material.uniforms.uProgress,
      m = this.foundation.mesh.material.uniforms.uProgress2,
      g = this.mountains.mesh1.material.uniforms.uProgress2,
      x = this.terrain.mesh1.material.uniforms.uProgress2,
      v = this.terrainpatches.mesh1.material.uniforms.uProgress2,
      y = this.introparticles.mesh.material.uniforms.uProgress,
      S = this.introparticles.mesh.material.uniforms.uAlpha,
      w = this.structureCage.mesh.material.uniforms.uProgress,
      C = this.structureCage.mesh.material.uniforms.uAlpha,
      M = this.smoke.mesh1.material.uniforms.uAlpha,
      E = this.sky.mesh.material.uniforms.uProgress,
      _ = this.structure.mesh.material.uniforms.uProgress;
    this.introTL.fromTo(
      this.camera,
      {
        touchAmount: 0,
      },
      {
        touchAmount: 1,
        duration: 5,
      },
      2,
    );
    this.introTL.fromTo(
      n,
      {
        value: 0,
      },
      {
        value: 1,
        duration: 2.5,
        ease: 'power3.inOut',
      },
      0,
    );
    this.introTL.fromTo(
      r,
      {
        value: 1,
      },
      {
        value: 0,
        duration: 3,
        ease: 'inOut4',
      },
      2,
    );
    this.introTL.fromTo(
      w,
      {
        value: 0,
      },
      {
        value: 1,
        duration: 4,
        ease: 'sine.inOut',
      },
      0,
    );
    this.introTL.fromTo(
      C,
      {
        value: 0,
      },
      {
        value: 0.4,
        duration: 0.1,
        ease: 'power2.inOut',
      },
      0,
    );
    this.introTL.fromTo(
      C,
      {
        value: 0.4,
      },
      {
        value: 0,
        duration: 3,
        ease: 'power2.inOut',
      },
      2.1,
    );
    this.introTL.set(
      this.structureCage.mesh,
      {
        visible: true,
      },
      0,
    );
    this.introTL.set(
      this.structureCage.mesh,
      {
        visible: false,
      },
      2.1 + 3,
    );
    this.introTL.fromTo(
      a,
      {
        value: 0,
      },
      {
        value: 1,
        duration: 2.25,
        ease: 'structure_assembly',
      },
      1.1,
    );
    this.introTL.set(
      this.structure.mesh,
      {
        visible: false,
      },
      0,
    );
    this.introTL.set(
      this.structure.mesh,
      {
        visible: true,
      },
      1.1,
    );
    this.introTL.fromTo(
      o,
      {
        value: 0,
      },
      {
        value: 1,
        duration: 2,
        ease: 'linear',
      },
      2,
    );
    this.introTL.set(
      l,
      {
        value: 0,
      },
      0,
    );
    this.introTL.set(
      l,
      {
        value: 1,
      },
      2.1,
    );
    this.introTL.set(
      c,
      {
        value: 0,
      },
      0,
    );
    this.introTL.set(
      c,
      {
        value: 1,
      },
      2.1,
    );
    this.introTL.set(
      h,
      {
        value: 0,
      },
      0,
    );
    this.introTL.set(
      h,
      {
        value: 1,
      },
      2.1,
    );
    this.introTL.fromTo(
      d,
      {
        value: 0,
      },
      {
        value: 1,
        duration: 3,
      },
      0.7,
    );
    this.introTL.fromTo(
      u,
      {
        value: 0,
      },
      {
        value: 1,
        duration: 7.5,
        ease: 'inOut1',
      },
      0.7,
    );
    this.introTL.fromTo(
      p,
      {
        value: 0,
      },
      {
        value: 1,
        duration: 7.5,
        ease: 'inOut1',
      },
      0.7,
    );
    this.introTL.fromTo(
      A,
      {
        value: 0,
      },
      {
        value: 1,
        duration: 7.5,
        ease: 'inOut1',
      },
      0.7,
    );
    this.introTL.fromTo(
      f,
      {
        value: 0,
      },
      {
        value: 1,
        duration: 7.5,
        ease: 'inOut1',
      },
      0.7,
    );
    this.introTL.fromTo(
      m,
      {
        value: 0,
      },
      {
        value: 1,
        duration: 7.5,
        ease: 'inOut3',
      },
      0.7,
    );
    this.introTL.fromTo(
      x,
      {
        value: 0,
      },
      {
        value: 1,
        duration: 7.5,
        ease: 'inOut3',
      },
      0.7,
    );
    this.introTL.fromTo(
      v,
      {
        value: 0,
      },
      {
        value: 1,
        duration: 7.5,
        ease: 'inOut3',
      },
      0.7,
    );
    this.introTL.fromTo(
      g,
      {
        value: 0,
      },
      {
        value: 1,
        duration: 7.5,
        ease: 'inOut3',
      },
      0.7,
    );
    this.introTL.fromTo(
      y,
      {
        value: 0,
      },
      {
        value: 1,
        duration: 4,
        ease: 'sine.out',
      },
      0.5,
    );
    this.introTL.fromTo(
      S,
      {
        value: 1,
      },
      {
        value: 0,
        duration: 2,
        ease: 'linear',
      },
      1.75,
    );
    this.introTL.set(
      this.introparticles.mesh,
      {
        visible: true,
      },
      0,
    );
    this.introTL.set(
      this.introparticles.mesh,
      {
        visible: false,
      },
      1.75 + 2,
    );
    this.introTL.fromTo(
      M,
      {
        value: 0,
      },
      {
        value: 1,
        duration: 3,
        ease: 'power2.inOut',
      },
      2,
    );
    this.introTL.fromTo(
      s,
      {
        value: 0,
      },
      {
        value: 1,
        duration: 4,
        ease: 'power2.inOut',
      },
      2,
    );
    this.introTL.fromTo(
      E,
      {
        value: 0,
      },
      {
        value: 1,
        duration: 3,
        ease: 'power2.inOut',
      },
      1.5,
    );
    this.introTL.fromTo(
      _,
      {
        value: 0,
      },
      {
        value: 1,
        duration: 1,
        ease: 'power2.inOut',
      },
      1,
    );
    this.introTL.fromTo(
      e,
      {
        value: 1.5,
      },
      {
        value: 1,
        duration: 2,
        ease: 'sine.inOut',
      },
      2.5,
    );
    this.introTL.fromTo(
      t,
      {
        value: 0,
      },
      {
        value: 1,
        duration: 4,
        ease: 'sine.inOut',
      },
      1,
    );
    this.introTL.call(
      () => {
        events.emit('webgl_show_ui_intro');
      },
      null,
      4.5,
    );
    this.introTL.fromTo(
      this.introWeight,
      {
        value: 0,
      },
      {
        value: 1,
        duration: 5.5,
        ease: 'inOut1',
      },
      2,
    );
  }
  async playInAnimation() {
    this.introTL.play(0);
    await gsap.delayedCall(5, () => {});
  }
  createTimeline() {
    this.timelinePosition.set(-13.25, 2.5, 13.25);
    this.timelineTarget.set(0, 1, 0);
    const e = this.timelinePosition.toArray(),
      t = this.timelineTarget.toArray();
    this.timeline = gsap.timeline({
      paused: true,
    });
    this.timeline.fromTo(
      this.timelinePosition,
      {
        y: e[1] + 9,
      },
      {
        y: e[1],
        duration: 14,
        ease: 'power2.out',
      },
      0,
    );
    this.timeline.fromTo(
      this.timelineTarget,
      {
        y: t[1] + 14,
      },
      {
        y: t[1],
        duration: 14,
        ease: 'power2.out',
      },
      0,
    );
    this.timeline.fromTo(
      this.timelinePosition,
      {
        x: e[0],
        z: e[2],
      },
      {
        x: e[0] - 2,
        z: e[2] + 10,
        duration: 14,
        ease: 'power1.inOut',
      },
      7,
    );
    this.timeline.progress(1);
    this.timeline.progress(0);
  }
  update() {
    var e;
    this.timeline.progress(this.progress);
    this.camera.basePosition.lerpVectors(
      this.introPosition,
      this.timelinePosition,
      this.introWeight.value,
    );
    this.camera.baseTarget.lerpVectors(
      this.introTarget,
      this.timelineTarget,
      this.introWeight.value,
    );
    if (!((e = this.manifesto) == null)) e.update(this.progress, this._needsReset);
    this._windVolume =
      math.fit(this.progress, 0.05, 0.2, 0, 1) * math.fit(this.progress, 0.75, 0.95, 1, 0);
    events.emit('webgl_set_audio_volume', 'wind', this._windVolume * 0.4);
    events.emit('webgl_set_audio_volume', 'structure', this._structureVolume * 0.5);
    this._needsReset = false;
  }
  resize() {
    this.camera.zoom = Math.min(1, environment.screen.aspectRatio * 1.25);
    this.camera.updateProjectionMatrix();
  }
  dispose() {}
}
export { LandscapeScene };
