// Reconstructed application source. Third-party implementations are npm imports.
import FrostFeedbackvertexShader1 from '../../../shaders/scenes/portfolio/frost/FrostFeedback/FrostFeedback-vertexShader-1.glsl?raw';
import FrostFeedbackfragmentShader2 from '../../../shaders/scenes/portfolio/frost/FrostFeedback/FrostFeedback-fragmentShader-2.glsl?raw';
import {
  WebGLRenderTarget,
  HalfFloatType,
  Vector2,
  PlaneGeometry,
  ShaderMaterial,
  Mesh,
} from 'three';
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import { FrostFeedbackMaterial } from './FrostFeedbackMaterial.js';
import { runtime } from '../../../engine/rendering/runtime.ts';
import { MeshInteraction_Er } from '../../../engine/input/mesh-interaction.js';
import { environment } from '../../../engine/core/environment.ts';
import { events } from '../../../engine/core/events.ts';
import { frameClock } from '../../../engine/core/frame-clock.ts';
import { math } from '../../../engine/core/math.js';
class FrostFeedback {
  constructor(parent, t = {}) {
    this.parent = parent;
    this.options = {
      width: 512,
      height: 512,
      ...t,
    };
    const s = new WebGLRenderTarget(this.options.width, this.options.height, {
      type: HalfFloatType,
      depthBuffer: false,
    });
    if (
      ((this.rts = [s, s.clone()]),
      (this.finalRT = s),
      (this.fsQuad = new FullScreenQuad(new FrostFeedbackMaterial())),
      (this.renderer = runtime.renderer.webgl),
      (this.interaction = new MeshInteraction_Er({
        camera: this.parent.scene.camera,
        meshes: [this.parent.mesh],
        onMove: this.onMouseMove,
        onHover: this.onMouseHover,
        onClick: this.onMouseClick,
        hoverCursor: true,
        ctx: this,
      })),
      !!this.parent.options.interior.enabled ||
        ((this.interaction.enable = () => {}), (this.interaction.disable = () => {})),
      (this.interaction._raycaster.firstHitOnly = true),
      (this.splatPosition = new Vector2()),
      (this.splatLastPosition = new Vector2()),
      (this.splatLastMoveTime = 0),
      (this.splatLastRenderTime = 0),
      (this.splatTargetVelocity = 0),
      (this.splatVelocity = 0),
      (this.splatHovered = false),
      (this.soundVelocity = 0),
      this.update(),
      (this.debug = false),
      this.debug && !parent.__debugAdded)
    ) {
      parent.__debugAdded = true;
      const r = new PlaneGeometry(2, 2),
        a = new ShaderMaterial({
          uniforms: {
            tBuffer: {
              value: null,
            },
          },
          vertexShader: FrostFeedbackvertexShader1,
          fragmentShader: FrostFeedbackfragmentShader2,
          depthTest: false,
          transparent: true,
        });
      this.debugMesh = new Mesh(r, a);
      this.debugMesh.renderOrder = 1e3;
      this.debugMesh.frustumCulled = false;
      this.parent.scene.add(this.debugMesh);
    }
  }
  onMouseMove(e) {
    const t = e.interactions[0];
    if (!t) return;
    const s = t.uv1;
    this.splatPosition.copy(s);
  }
  onMouseHover(_e) {
    this.splatHovered = true;
  }
  onMouseClick(_e) {
    if (!environment.devScene) {
      this.interaction.disable();
      events.emit('webgl_switch_scene', `portfolio/${this.parent.options.hash}`);
    }
  }
  update() {
    if (frameClock.time - this.splatLastRenderTime < 0.015) return;
    this.splatLastRenderTime = frameClock.time;
    let e = this.splatPosition.distanceTo(this.splatLastPosition);
    const t = frameClock.time - this.splatLastMoveTime;
    if (e > 0) this.splatLastMoveTime = frameClock.time;
    if (t > 0.15 || this.splatHovered || e > 0.3) {
      this.splatLastPosition.copy(this.splatPosition);
      this.splatTargetVelocity = 0;
      this.soundVelocity = 0;
      e = 0;
    }
    this.splatHovered = false;
    this.splatTargetVelocity += e * 6;
    this.splatTargetVelocity *= 0.88;
    this.splatTargetVelocity = math.clamp(this.splatTargetVelocity, 0, 1);
    this.splatVelocity = math.lerp(
      this.splatVelocity,
      math.ease(this.splatTargetVelocity, 'power4.out'),
      0.1,
    );
    this.soundVelocity += e * 4;
    this.soundVelocity *= 0.98;
    this.soundVelocity = math.clamp(this.soundVelocity, 0, 1);
    this.fsQuad.material.uniforms.uSplatCoords.value.copy(this.splatPosition);
    this.fsQuad.material.uniforms.uSplatPrevCoords.value.copy(this.splatLastPosition);
    this.fsQuad.material.uniforms.uSplatRadius.value = this.splatVelocity;
    this.splatLastPosition.copy(this.splatPosition);
    const s = this.renderer.getRenderTarget();
    this.fsQuad.material.uniforms.tBuffer.value = this.finalRT.texture;
    this.finalRT = this.finalRT === this.rts[0] ? this.rts[1] : this.rts[0];
    this.renderer.setRenderTarget(this.finalRT);
    this.fsQuad.render(this.renderer);
    this.renderer.setRenderTarget(s);
    if (this.debug) this.debugMesh.material.uniforms.tBuffer.value = this.finalRT.texture;
  }
}
export { FrostFeedback };
