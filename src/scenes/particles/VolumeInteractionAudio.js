// Reconstructed application source. Third-party implementations are npm imports.
import { IcosahedronGeometry, Mesh, MeshNormalMaterial, Vector3 } from 'three';
import { MeshInteraction_Er } from '../../engine/input/mesh-interaction.js';
import { frameClock } from '../../engine/core/frame-clock.ts';
import { math } from '../../engine/core/math.js';
class VolumeInteractionAudio {
  constructor(parent) {
    this.parent = parent;
    this.init();
  }
  init() {
    const e = new IcosahedronGeometry(0.27, 0);
    this.mesh = new Mesh(e, new MeshNormalMaterial());
    this.mesh.position.set(0, -9.785, 0);
    this.mesh.updateMatrixWorld();
    this.interaction = new MeshInteraction_Er({
      camera: this.parent.scene.camera,
      meshes: [this.mesh],
      onMove: this.onMouseMove,
      onHover: this.onMouseHover,
      ctx: this,
    });
    this.splatPosition = new Vector3();
    this.splatLastPosition = new Vector3();
    this.splatLastMoveTime = 0;
    this.splatLastRenderTime = 0;
    this.splatTargetVelocity = 0;
    this.splatVelocity = 0;
    this.splatHovered = false;
  }
  onMouseMove(e) {
    const t = e.interactions[0];
    if (t) this.splatPosition.copy(t.point);
  }
  onMouseHover(_e) {
    this.splatHovered = true;
  }
  update(e = 0) {
    if (
      (e > 0 ? this.interaction.enable() : this.interaction.disable(),
      frameClock.time - this.splatLastRenderTime < 0.015)
    )
      return;
    this.splatLastRenderTime = frameClock.time;
    let t = this.splatPosition.distanceTo(this.splatLastPosition);
    const s = frameClock.time - this.splatLastMoveTime;
    if (t > 0) this.splatLastMoveTime = frameClock.time;
    if (s > 0.15 || this.splatHovered || t > 0.3) {
      this.splatLastPosition.copy(this.splatPosition);
      t = 0;
    }
    this.splatHovered = false;
    this.splatTargetVelocity += t * 4;
    this.splatTargetVelocity *= 0.97;
    this.splatTargetVelocity = math.clamp(this.splatTargetVelocity, 0, e);
    this.splatVelocity = math.lerp(this.splatVelocity, this.splatTargetVelocity, 0.05);
    this.splatVelocity = math.clamp(this.splatVelocity, 0, e);
    this.splatLastPosition.copy(this.splatPosition);
    this.parent.scene._particlesVolume = 0.04 * e + this.splatVelocity * 0.21;
  }
}
export { VolumeInteractionAudio };
