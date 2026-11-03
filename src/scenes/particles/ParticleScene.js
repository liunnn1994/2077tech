// Reconstructed application source. Third-party implementations are npm imports.
import { Vector3, Vector2 } from 'three';
import { RenderScene } from '../../engine/rendering/render-scene.js';
import { environment } from '../../engine/core/environment.ts';
import { events } from '../../engine/core/events.ts';
import { addParticleColorPass } from './addParticleColorPass.js';
import { runtime } from '../../engine/rendering/runtime.ts';
import { PostProcessingPass } from '../../engine/rendering/postprocessing-pass.js';
import { AmbientParticles } from './AmbientParticles.js';
import { ParticleRoomRing } from './ParticleRoomRing.js';
import { GroundSmoke } from './GroundSmoke.js';
import { CeilingSmoke } from './CeilingSmoke.js';
import { PortalForceFields } from './PortalForceFields.js';
import { PortalPlasma } from './PortalPlasma.js';
import { ParticleTunnel } from './ParticleTunnel.js';
import { TunnelSnow } from './TunnelSnow.js';
import { PortalSmokeTrails } from './PortalSmokeTrails.js';
import { PortalRings } from './PortalRings.js';
import { VolumeParticles } from './VolumeParticles.js';
import { ParticleFloor } from './ParticleFloor.js';
import { ParticleForceField } from './ParticleForceField.js';
import { ParticleLightRoom } from './ParticleLightRoom.js';
import { TextCylinders } from './TextCylinders.js';
import { gsap } from 'gsap';
import { math } from '../../engine/core/math.js';
const $x = new Vector3();
class ParticleScene extends RenderScene {
  constructor(e = {}) {
    super({
      orbit: environment.devScene && !environment.query.playAnimation,
    });
    this.controller = e.mainController;
    this.progress = 0;
    this.height = 5.5;
    this._isSceneVisible = false;
    this.initialScrollAutocenter = 0.2;
    this.finalScrollAutocenter = 0.76;
    this.timelinePosition = new Vector3();
    this.timelineTarget = new Vector3();
    this.timelineDisplacement = new Vector2();
    this.timelineDisplacementTar = new Vector2();
    this.timelineDisplacementRot = {
      value: 0,
    };
    this.timelineAdditional = {
      upRotation: 0,
      upOriginal: 0,
    };
    this.lastProgress = 0;
    this.direction = 1;
    this._needsReset = false;
    this._portalsVolume = 0;
    this._particlesVolume = 0;
    this.composerReady = new Promise((isComposerReady) => {
      this.isComposerReady = isComposerReady;
    });
    this.init();
  }
  get isSceneVisible() {
    return this._isSceneVisible;
  }
  set isSceneVisible(_isSceneVisible) {
    var s, n, r, a;
    const t = this._isSceneVisible !== _isSceneVisible;
    this._isSceneVisible = _isSceneVisible;
    if (t)
      if (_isSceneVisible) {
        this.lastProgress = this.progress;
        this.direction = 1;
      } else {
        if (!((n = (s = this.containerparticles) == null ? void 0 : s.UI) == null)) n.disable();
        if (!((a = (r = this.containerparticles) == null ? void 0 : r.soundControl) == null))
          a.interaction.disable();
        this._portalsVolume = 0;
        events.emit('webgl_set_audio_volume', 'portals', this._portalsVolume);
        this._particlesVolume = 0;
        events.emit('webgl_set_audio_volume', 'particles', this._particlesVolume);
      }
  }
  async init() {
    this.cameraOptions();
    this.renderOptions();
    await Promise.all([
      this.createRoomRing(),
      this.createRingForcefield(),
      this.createRings(),
      this.createContainerParticles(),
      this.createFloor(),
      this.createLightRoom(),
      this.createForceField(),
      this.createTextCylinder(),
      this.createSmokeTrail(),
      this.createSnowParticles(),
      this.createTunnel(),
      this.createPlasma(),
      this.createCeilingSmoke(),
      this.createGroundSmoke(),
      this.createAmbientParticles(),
    ]);
    await this.createTimeline();
    this.resize();
    events.on('resize', this.resize, this);
    if (environment.devScene) {
      this.camera.displacement.position.setScalar(0);
      this.camera.lerpPosition = 0;
      this.camera.shake.setScalar(0);
      if (environment.query.playAnimation) {
        this.beforeRenderCbs.push(this.update.bind(this));
        this.timeline.play(0);
      }
    } else this.beforeRenderCbs.push(this.update.bind(this));
    this.isReady();
  }
  cameraOptions() {
    this.camera.fov = 25;
    this.camera.updateProjectionMatrix();
    this.camera.basePosition.set(0, 5.5, 0);
    this.camera.baseTarget.set(0, 0, 0);
    this.camera.displacement.position.set(0.07, 0.025);
    this.camera.lerpPosition = 0.02;
    this.camera.lerpRotation = 0.02;
    this.camera.lerpTarget = 0.015;
    this.camera.shake.setScalar(0.02);
    this.camera.shakeSpeed.setScalar(0.25);
  }
  renderOptions() {
    Promise.resolve().then(() => {
      addParticleColorPass(this, this.composer);
      this.isComposerReady();
      const e = environment.devScene ? this.composer : runtime.composer;
      if (!e.__hasBloomPass) {
        e.__hasBloomPass = true;
        e.addPass(
          new PostProcessingPass().addBloom({
            debug: environment.devScene,
            levels: 6,
            luminanceThreshold: 0,
            intensity: 1,
            radius: 0.85,
          }),
        );
      }
    });
  }
  async createAmbientParticles() {
    this.ambientparticles = new AmbientParticles(this);
    await this.ambientparticles.ready;
  }
  async createRoomRing() {
    this.roomring = new ParticleRoomRing(this);
    await this.roomring.ready;
  }
  async createGroundSmoke() {
    this.groundsmoke = new GroundSmoke(this);
    await this.groundsmoke.ready;
  }
  async createCeilingSmoke() {
    this.ceilingsmoke = new CeilingSmoke(this);
    await this.ceilingsmoke.ready;
  }
  async createRingForcefield() {
    this.ringforcefield = new PortalForceFields(this);
    await this.ringforcefield.ready;
  }
  async createPlasma() {
    this.plasma = new PortalPlasma(this);
    await this.plasma.ready;
  }
  async createTunnel() {
    this.tunnel = new ParticleTunnel(this);
    await this.tunnel.ready;
  }
  async createSnowParticles() {
    this.snowparticles = new TunnelSnow(this);
    await this.snowparticles.ready;
  }
  async createSmokeTrail() {
    this.smoketrail = new PortalSmokeTrails(this);
    await this.smoketrail.ready;
  }
  async createRings() {
    this.rings = new PortalRings(this);
    await this.rings.ready;
  }
  async createContainerParticles() {
    this.containerparticles = new VolumeParticles(this);
    await this.containerparticles.ready;
  }
  async createFloor() {
    this.floor = new ParticleFloor(this);
    await this.floor.ready;
  }
  async createForceField() {
    this.forcefield = new ParticleForceField(this);
    await this.forcefield.ready;
  }
  async createLightRoom() {
    this.lightroom = new ParticleLightRoom(this);
    await this.lightroom.ready;
  }
  async createTextCylinder() {
    this.textcylinder = new TextCylinders(this);
    await this.textcylinder.ready;
  }
  async createTimeline() {
    this.timelinePosition.set(0, 1.5, -2);
    this.timelineTarget.set(0, -2.5, -1);
    await this.composerReady;
    const e = this.___composerPass.material.uniforms;
    let t = this.camera.fov;
    this.timeline = gsap.timeline({
      paused: true,
      onUpdate: () => {
        if (this.camera.fov !== t) {
          t = this.camera.fov;
          this.camera.updateProjectionMatrix();
        }
        this.rings.mesh0.visible = this.progress < 0.34;
        this.rings.mesh1.visible = this.progress < 0.43;
        this.rings.mesh2.visible = this.progress < 0.52;
        this.ringforcefield.mesh0.visible = this.progress > 0.1 && this.progress < 0.34;
        this.ringforcefield.mesh1.visible = this.progress > 0.25 && this.progress < 0.43;
        this.ringforcefield.mesh2.visible = this.progress > 0.36 && this.progress < 0.52;
        this.plasma.mesh0.visible = this.progress > 0.06 && this.progress < 0.34;
        this.plasma.mesh1.visible = this.progress > 0.25 && this.progress < 0.43;
        this.plasma.mesh2.visible = this.progress > 0.35 && this.progress < 0.52;
        this.smoketrail.mesh0.visible = this.progress > 0 && this.progress < 0.37;
        this.smoketrail.mesh1.visible = this.progress > 0 && this.progress < 0.47;
        this.smoketrail.mesh2.visible = this.progress > 0 && this.progress < 0.56;
        this.tunnel.mesh.visible = this.progress < 0.52;
        this.snowparticles.mesh.visible = this.progress < 0.52;
        this.roomring.mesh.visible = this.progress > 0.53;
        let n = 1 / 0;
        [0.28, 0.375, 0.465].forEach((r) => {
          const a = Math.abs(this.progress - r);
          n = Math.min(n, a);
        });
        this._portalsVolume = math.ease(math.fit(n, 0, 0.04, 1, 0), 'power2.out') * 0.9;
      },
    });
    this.timeline.to(
      this.timelinePosition,
      {
        z: 0,
        x: 0,
        duration: 2.5,
        ease: 'power2.out',
      },
      0,
    );
    this.timeline.to(
      this.timelineTarget,
      {
        z: 0,
        x: 0,
        duration: 2.5,
        ease: 'power2.out',
      },
      0,
    );
    this.timeline.to(
      this.timelinePosition,
      {
        y: -9.83,
        duration: 7,
        ease: 'entry_ease_3',
      },
      0.2,
    );
    this.timeline.to(
      this.timelineTarget,
      {
        y: -10,
        duration: 3,
        ease: 'power1.inOut',
      },
      0.2,
    );
    this.timeline.to(
      this.timelineTarget,
      {
        y: -9.81,
        duration: 2.5,
        ease: 'power1.inOut',
      },
      3.2,
    );
    this.timeline.to(
      this.timelineAdditional,
      {
        upRotation: Math.PI,
        duration: 5.25,
        ease: 'power3.inOut',
      },
      1,
    );
    this.timeline.to(
      this.timelineAdditional,
      {
        upOriginal: 1,
        duration: 3.7,
        ease: 'entry_ease',
      },
      3.5,
    );
    this.timeline.to(
      this.timelinePosition,
      {
        z: -1.5,
        duration: 3.7,
        ease: 'entry_ease',
      },
      3.5,
    );
    this.timeline.to(
      this.timelinePosition,
      {
        z: -3,
        duration: 2,
        ease: 'entry_ease_2',
      },
      7.2,
    );
    this.timeline.set(
      this.camera,
      {
        fov: 22,
      },
      0,
    );
    this.timeline.to(
      this.camera,
      {
        fov: 30,
        duration: 7.2,
        ease: 'power1.inOut',
      },
      0,
    );
    this.timeline.set(
      this.timelineDisplacement,
      {
        x: 0.01,
        y: 0.005,
      },
      0,
    );
    this.timeline.set(
      this.timelineDisplacementRot,
      {
        value: 0,
      },
      0,
    );
    this.timeline.to(
      this.timelineDisplacement,
      {
        x: 0,
        y: 0,
        duration: 1,
        ease: 'power2.inOut',
      },
      4,
    );
    this.timeline.to(
      this.timelineDisplacementTar,
      {
        x: -0.03,
        y: -0.01,
        duration: 2,
        ease: 'power2.inOut',
      },
      4,
    );
    this.timeline.to(
      this.timelineDisplacementRot,
      {
        value: 0.05,
        duration: 2,
        ease: 'power2.inOut',
      },
      4,
    );
    this.timeline.to(
      this.timelineTarget,
      {
        y: -10.35,
        duration: 2,
        ease: 'power2.in',
      },
      7.2,
    );
    this.timeline.set(
      this.containerparticles.mesh,
      {
        visible: false,
      },
      0,
    );
    this.timeline.set(
      this.containerparticles.mesh,
      {
        visible: true,
      },
      1.5,
    );
    this.timeline.fromTo(
      this.containerparticles.mesh.material.uniforms.uAlpha,
      {
        value: 0,
      },
      {
        value: 1,
        duration: 2.5,
        ease: 'power2.inOut',
      },
      1.5,
    );
    this.timeline.fromTo(
      this.containerparticles.mesh.material.uniforms.uInitialGlow,
      {
        value: 1,
      },
      {
        value: 0,
        duration: 1,
        ease: 'power1.inOut',
      },
      3.9,
    );
    this.timeline.fromTo(
      this.containerparticles.mesh.computationMaterial.uniforms.uShowNoise,
      {
        value: 1,
      },
      {
        value: 0,
        duration: 1.5,
        ease: 'power1.inOut',
      },
      3.5,
    );
    this.timeline.set(
      this.floor.mesh,
      {
        visible: false,
      },
      0,
    );
    this.timeline.set(
      this.floor.mesh,
      {
        visible: true,
      },
      3.4,
    );
    this.timeline.fromTo(
      this.floor.mesh.material.uniforms.uAlpha,
      {
        value: 0,
      },
      {
        value: 1,
        duration: 5,
        ease: 'power2.out',
      },
      3.4,
    );
    this.timeline.set(
      this.textcylinder.mesh,
      {
        visible: false,
      },
      0,
    );
    this.timeline.set(
      this.textcylinder.mesh,
      {
        visible: true,
      },
      4.5,
    );
    this.timeline.set(
      this.textcylinder.mesh2,
      {
        visible: false,
      },
      0,
    );
    this.timeline.set(
      this.textcylinder.mesh2,
      {
        visible: true,
      },
      4.5,
    );
    this.timeline.fromTo(
      this.textcylinder.mesh.material.uniforms.uAlpha,
      {
        value: 0,
      },
      {
        value: 1,
        duration: 2,
        ease: 'power2.inOut',
      },
      4.5,
    );
    this.timeline.fromTo(
      this.textcylinder.mesh2.material.uniforms.uAlpha,
      {
        value: 0,
      },
      {
        value: 1,
        duration: 2,
        ease: 'power2.inOut',
      },
      4.5,
    );
    this.timeline.set(
      this.forcefield.mesh,
      {
        visible: false,
      },
      0,
    );
    this.timeline.set(
      this.forcefield.mesh,
      {
        visible: true,
      },
      4,
    );
    this.timeline.fromTo(
      this.forcefield.mesh.material.uniforms.uAlpha,
      {
        value: 0,
      },
      {
        value: 1,
        duration: 2,
        ease: 'power2.inOut',
      },
      4,
    );
    this.timeline.set(
      this.groundsmoke.mesh,
      {
        visible: false,
      },
      0,
    );
    this.timeline.set(
      this.ceilingsmoke.mesh,
      {
        visible: false,
      },
      0,
    );
    this.timeline.set(
      this.groundsmoke.mesh,
      {
        visible: true,
      },
      3.4,
    );
    this.timeline.set(
      this.ceilingsmoke.mesh,
      {
        visible: true,
      },
      4.5,
    );
    this.timeline.fromTo(
      this.groundsmoke.mesh.material.uniforms.uAlpha,
      {
        value: 0,
      },
      {
        value: 1,
        duration: 3,
        ease: 'power2.out',
      },
      4.4,
    );
    this.timeline.set(
      this.ambientparticles.mesh,
      {
        visible: false,
      },
      0,
    );
    this.timeline.set(
      this.ambientparticles.mesh,
      {
        visible: true,
      },
      3.4,
    );
    this.timeline.fromTo(
      this.ambientparticles.mesh.material.uniforms.uAlpha,
      {
        value: 0,
      },
      {
        value: 1,
        duration: 3,
        ease: 'power2.out',
      },
      4.4,
    );
    const s = (n = null, r = null) => {
      const a = r !== null ? r : n === null || this.direction === -1 ? 1 : 0.5;
      e.uSquareAttr.value.set(Math.random() * 25.424, Math.random() * 64.453, a);
    };
    this.timeline.call(s, null, 2);
    this.timeline.fromTo(
      e.uRingProximity,
      {
        value: 0,
      },
      {
        value: 1,
        duration: 0.5,
        ease: 'power1.in',
      },
      2,
    );
    this.timeline.fromTo(
      e.uRingProximity,
      {
        value: 1,
      },
      {
        value: 0,
        duration: 0.4,
        ease: 'power1.out',
      },
      2.5,
    );
    this.timeline.call(s, null, 2.95);
    this.timeline.fromTo(
      e.uRingProximity,
      {
        value: 0,
      },
      {
        value: 1,
        duration: 0.5,
        ease: 'power1.in',
      },
      2.95,
    );
    this.timeline.fromTo(
      e.uRingProximity,
      {
        value: 1,
      },
      {
        value: 0,
        duration: 0.4,
        ease: 'power1.out',
      },
      3.45,
    );
    this.timeline.call(s, [true], 3.8);
    this.timeline.fromTo(
      e.uRingProximity,
      {
        value: 0,
      },
      {
        value: 1,
        duration: 0.5,
        ease: 'power1.in',
      },
      3.8,
    );
    this.timeline.fromTo(
      e.uRingProximity,
      {
        value: 1,
      },
      {
        value: 0,
        duration: 0.6,
        ease: 'power1.out',
      },
      4.3,
    );
    this.timeline.call(s, [false, 0.5], 4.9);
    this.timeline.progress(1);
    this.timeline.progress(0);
  }
  update() {
    this.direction = this.progress > this.lastProgress ? 1 : -1;
    this.lastProgress = this.progress;
    if (!environment.devScene) this.timeline.progress(this.progress);
    this.textcylinder.update();
    this.smoketrail.update();
    this.rings.update();
    this.tunnel.update();
    this.plasma.update();
    this.camera.basePosition.copy(this.timelinePosition);
    this.camera.baseTarget.copy(this.timelineTarget);
    this.camera.displacement.position.copy(this.timelineDisplacement);
    this.camera.displacement.target.copy(this.timelineDisplacementTar);
    this.camera.displacement.rotation = this.timelineDisplacementRot.value;
    this.camera.baseUp.set(0, 0, -1);
    this.camera.baseUp.applyAxisAngle($x.set(0, 1, 0), this.timelineAdditional.upRotation);
    this.camera.baseUp.lerp($x.set(0, 1, 0), this.timelineAdditional.upOriginal).normalize();
    this._needsReset = false;
    events.emit('webgl_set_audio_volume', 'portals', this._portalsVolume);
    events.emit('webgl_set_audio_volume', 'particles', this._particlesVolume);
  }
  autoCenter(e, _t) {
    if (this.progress > 0.15) {
      const s = (this.finalScrollAutocenter - this.progress) * (this.height + 1),
        n = math.clamp(Math.abs(s) * 4, 2, 20);
      e.centerScroll(e.scroll.y + s, n);
    }
  }
  resize() {
    this.camera.zoom = Math.min(1, environment.screen.aspectRatio * 1.5);
    this.camera.updateProjectionMatrix();
  }
  dispose() {}
}
export { $x, ParticleScene };
