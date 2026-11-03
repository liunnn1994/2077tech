// Reconstructed application source. Third-party implementations are npm imports.
import { RenderScene } from '../../engine/rendering/render-scene.js';
import { DetailPointerFeedback } from './DetailPointerFeedback.js';
import { DetailBackground } from './DetailBackground.js';
import { DetailLightShaft } from './DetailLightShaft.js';
import { DetailLightPlane } from './DetailLightPlane.js';
import { DetailAmbientParticles } from './DetailAmbientParticles.js';
import { DetailPointerParticles } from './DetailPointerParticles.js';
import { siteConfig } from '../../config/site-config.js';
import { DetailObject } from './DetailObject.js';
import { gsap } from 'gsap';
import { events } from '../../engine/core/events.ts';
class DetailScene extends RenderScene {
  constructor(e = {}) {
    super({
      orbit: false,
    });
    this.objects = [];
    this.controller = e.mainController;
    this.displayUIvar = {
      value: 0,
    };
    this.init();
  }
  async init() {
    this.cameraOptions();
    this.renderOptions();
    this.mouseSim = new DetailPointerFeedback(this);
    await Promise.all([
      this.createBg(),
      this.createParticles(),
      this.createLittleParticles(),
      this.createObjects(),
      this.createLightShaft(),
      this.createLightPlane(),
    ]);
    this.beforeRenderCbs.push(this.update.bind(this));
    this.isReady();
  }
  cameraOptions() {
    this.camera.basePosition.set(0, 0, 2.5);
    this.camera.baseTarget.set(0, 0, 0);
    this.camera.displacement.position.set(0, 0);
    this.camera.lerpPosition = 0.02;
    this.camera.shake.setScalar(0.05);
    this.camera.shakeSpeed.setScalar(0.05);
  }
  renderOptions() {}
  async createBg() {
    this.bg = new DetailBackground(this);
    await this.bg.ready;
  }
  async createLightShaft() {
    this.lightshaft = new DetailLightShaft(this);
    await this.lightshaft.ready;
  }
  async createLightPlane() {
    this.lightplane = new DetailLightPlane(this);
    await this.lightplane.ready;
  }
  async createParticles() {
    this.particles = new DetailAmbientParticles(this);
    await this.particles.ready;
  }
  async createLittleParticles() {
    this.littleParticles = new DetailPointerParticles(this);
    await this.littleParticles.ready;
  }
  async createObjects() {
    siteConfig.cubes.forEach((e, t) => {
      const s = e.interior.obj,
        n = e.interior.objScale;
      this.objects.push(
        new DetailObject(this, {
          obj: s,
          index: t,
          scale: n,
        }),
      );
    });
    await Promise.all(this.objects.map((e) => e.ready));
  }
  playInAnimation(e, t = 0) {
    this.objects.forEach((s) => {
      s.mesh.visible = s.index === e;
    });
    gsap.to(
      this.objects.map((s) => s.additionalRotationAmount),
      {
        overwrite: true,
        value: 1,
        duration: 1,
        delay: t + 1.5,
        ease: 'power1.out',
      },
    );
    gsap.fromTo(
      this.displayUIvar,
      {
        value: 0,
      },
      {
        value: 1,
        duration: 0.7,
        delay: t + 0.5,
        onComplete: () => {
          this.mouseSim.reset();
          events.emit('webgl_project_show', e);
          events.emit('webgl_play_audio', 'project-text');
        },
      },
    );
    gsap.fromTo(
      this.camera.basePosition,
      {
        z: 4,
      },
      {
        overwrite: true,
        z: 2.5,
        duration: 2,
        delay: t + 0.5,
        ease: 'inOut1',
      },
    );
  }
  playOutAnimation() {
    gsap.to(this.camera.basePosition, {
      overwrite: true,
      z: 4,
      duration: 0.6,
      delay: 0,
      ease: 'none',
    });
    gsap.to(
      this.objects.map((e) => e.additionalRotationAmount),
      {
        overwrite: true,
        value: 0,
        duration: 0.6,
        ease: 'power1.in',
      },
    );
    gsap.killTweensOf(this.displayUIvar);
    events.emit('webgl_project_hide');
  }
  update() {
    this.mouseSim.update();
    if (this.littleParticles)
      this.littleParticles.mesh.material.uniforms.tSim.value = this.mouseSim.finalRT.texture;
  }
  dispose() {}
}
export { DetailScene };
