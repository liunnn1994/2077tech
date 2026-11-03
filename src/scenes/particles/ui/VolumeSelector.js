// Reconstructed application source. Third-party implementations are npm imports.
import { Group } from 'three';
import { events } from '../../../engine/core/events.ts';
import { VolumeSelectorArrows } from './VolumeSelectorArrows.js';
import { VolumeSelectorLink } from './VolumeSelectorLink.js';
import { gsap } from 'gsap';
import { environment } from '../../../engine/core/environment.ts';
class VolumeSelector {
  constructor(parent) {
    this.parent = parent;
    this.ready = new Promise((isReady) => {
      this.isReady = isReady;
    });
    this.group = new Group();
    this.group.name = 'ui';
    this.parent.mesh.add(this.group);
    this.preventChangeLink = false;
    this.enabled = false;
    this.init();
  }
  async init() {
    await Promise.all([this.createArrows(), this.createBottomLink()]);
    events.on('webgl_ui_particles_clicked', this.onUIClicked, this);
    events.on('touch_click', this.onClick, this);
    events.on('touch_end', this.onTouchEnd, this);
    events.on('keydown', this.onKeyDown, this);
    this.isReady();
  }
  createArrows() {
    this.arrows = new VolumeSelectorArrows(this);
    return this.arrows.ready;
  }
  createBottomLink() {
    this.bottom = new VolumeSelectorLink(this);
    return this.bottom.ready;
  }
  onUIClicked(_e) {
    this.preventChangeLink = true;
    Promise.resolve()
      .then(() => Promise.resolve())
      .then(() => {
        this.preventChangeLink = false;
      });
  }
  onClick(e) {
    if (this.enabled) this.changeLink(e.position11.x < 0 ? -1 : 1);
  }
  onTouchEnd(e) {
    if (this.enabled && Math.abs(e.dragged.x) > 100 && Math.abs(e.swipeVelocity.x) > 1e3)
      this.changeLink(e.dragged.x < 0 ? -1 : 1);
  }
  onKeyDown(e) {
    if (this.enabled)
      if (e.key === 'ArrowRight') this.changeLink(1);
      else if (e.key === 'ArrowLeft') this.changeLink(-1);
  }
  changeLink(e = 1) {
    Promise.resolve().then(() => {
      var s, n;
      if (this.preventChangeLink) return;
      if (e === -1)
        this.parent.currentLink =
          this.parent.currentLink === 0 ? this.parent.vdbs.length - 1 : this.parent.currentLink - 1;
      else this.parent.currentLink = (this.parent.currentLink + 1) % this.parent.vdbs.length;
      gsap.fromTo(
        this.parent.mesh.computationMaterial.uniforms.uAdditionalNoise,
        {
          value: 1,
        },
        {
          value: 0,
          duration: 0.5,
          ease: 'power2.inOut',
          overwrite: true,
        },
      );
      this.parent.mesh.computationMaterial.uniforms.tVolume.value =
        this.parent.vdbs[this.parent.currentLink];
      this.parent.mesh.computationMaterial.uniforms.uVolumeScale.value =
        this.parent.vdbScales[this.parent.currentLink];
      this.parent.mesh.computationMaterial.uniforms.uRotation.value = Math.PI * 1.5;
      if (!((s = this.arrows) == null)) s.show(e === 1 ? 'right' : 'left', 0.75);
      if (!((n = this.bottom) == null)) n.show(1, false, false);
      events.emit('webgl_play_audio', 'ui-long');
      const t = this.parent.scene.floor.additionalTime + 4 * -e;
      gsap.to(this.parent.scene.floor, {
        additionalTime: t,
        duration: 3,
        ease: 'power4.out',
        overwrite: true,
      });
      this.parent.soundControl.splatTargetVelocity += 1;
    });
  }
  update() {
    if (this.parent) {
      if (!environment.devScene) {
        const e = this.parent.scene.progress;
        if (e > 0.64 && e < 0.9) this.enable();
        else this.disable();
      }
      [this.arrows, this.bottom].forEach((e) => (e == null ? void 0 : e.update()));
    }
  }
  enable() {
    var e, t;
    if (!this.enabled) {
      this.enabled = true;
      if (!((e = this.arrows) == null)) e.show();
      if (!((t = this.bottom) == null)) t.show();
      events.emit('webgl_play_audio', 'ui-long');
    }
  }
  disable() {
    var e, t;
    if (this.enabled) {
      this.enabled = false;
      this.preventChangeLink = false;
      if (!((e = this.arrows) == null)) e.hide();
      if (!((t = this.bottom) == null)) t.hide();
      if (this.parent.scene.progress < this.parent.scene.finalScrollAutocenter)
        events.emit('webgl_play_audio', 'ui-long');
    }
  }
}
export { VolumeSelector };
