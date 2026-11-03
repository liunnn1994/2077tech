// Reconstructed application source. Third-party implementations are npm imports.
import DetailPointerFeedbackvertexShader1 from '../../shaders/scenes/detail/DetailPointerFeedback/DetailPointerFeedback-vertexShader-1.glsl?raw';
import DetailPointerFeedbackfragmentShader2 from '../../shaders/scenes/detail/DetailPointerFeedback/DetailPointerFeedback-fragmentShader-2.glsl?raw';
import DetailPointerFeedbackvertexShader3 from '../../shaders/scenes/detail/DetailPointerFeedback/DetailPointerFeedback-vertexShader-3.glsl?raw';
import DetailPointerFeedbackfragmentShader4 from '../../shaders/scenes/detail/DetailPointerFeedback/DetailPointerFeedback-fragmentShader-4.glsl?raw';
import DetailPointerFeedbackvertexShader5 from '../../shaders/scenes/detail/DetailPointerFeedback/DetailPointerFeedback-vertexShader-5.glsl?raw';
import DetailPointerFeedbackfragmentShader6 from '../../shaders/scenes/detail/DetailPointerFeedback/DetailPointerFeedback-fragmentShader-6.glsl?raw';
import globalUniformsGLSL from '../../shaders/chunks/globalUniformsGLSL.glsl?raw';
import fitFunctions from '../../shaders/chunks/fit.glsl?raw';
import { composeShader } from '../../engine/shaders/compose-shader.ts';
import {
  WebGLRenderTarget,
  HalfFloatType,
  Vector2,
  ShaderMaterial,
  PlaneGeometry,
  Mesh,
} from 'three';
import { runtime } from '../../engine/rendering/runtime.ts';
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import { textures } from '../../engine/loaders/textures.js';
import { events } from '../../engine/core/events.ts';
import { frameClock } from '../../engine/core/frame-clock.ts';
import { math } from '../../engine/core/math.js';
class DetailPointerFeedback {
  constructor(parent) {
    this.parent = parent;
    const t = new WebGLRenderTarget(2, 2, {
      type: HalfFloatType,
      depthBuffer: false,
    });
    this.rts = [t, t.clone()];
    this.finalRT = t;
    this.renderer = runtime.renderer.webgl;
    this.splatPosition = new Vector2();
    this.splatLastPosition = new Vector2();
    this.splatLastMoveTime = 0;
    this.splatLastRenderTime = 0;
    this.splatTargetVelocity = 0;
    this.splatVelocity = 0;
    this.fsQuad = new FullScreenQuad(
      new ShaderMaterial({
        uniformsGroups: [runtime.UBO],
        uniforms: {
          tBuffer: {
            value: null,
          },
          tAdvect: {
            value: textures.load('cubes/advect.png', 'colordata-repeat'),
          },
          uSplatCoords: {
            value: new Vector2(),
          },
          uSplatPrevCoords: {
            value: new Vector2(),
          },
          uSplatRadius: {
            value: 0,
          },
        },
        vertexShader: composeShader(DetailPointerFeedbackvertexShader1, {
          globalUniformsGLSL: globalUniformsGLSL,
        }),
        fragmentShader: composeShader(DetailPointerFeedbackfragmentShader2, {
          globalUniformsGLSL: globalUniformsGLSL,
          fitFunctions: fitFunctions,
        }),
        depthTest: false,
      }),
    );
    this.fsQuad._originalMaterial = this.fsQuad.material;
    this.resetMaterial = new ShaderMaterial({
      vertexShader: DetailPointerFeedbackvertexShader3,
      fragmentShader: DetailPointerFeedbackfragmentShader4,
      depthTest: false,
    });
    this.reset();
    this.update();
    events.on('touch_move', this.onTouchMove, this);
    this.resize();
    events.on('resize', this.resize, this);
    this.debug = false;
    if (this.debug) this._debug();
  }
  onTouchMove(e) {
    this.splatPosition.set(e.position01.x, e.position01.y);
  }
  reset() {
    const e = this.renderer.getRenderTarget();
    this.fsQuad.material = this.resetMaterial;
    this.renderer.setRenderTarget(this.rts[0]);
    this.fsQuad.render(this.renderer);
    this.renderer.setRenderTarget(this.rts[1]);
    this.fsQuad.render(this.renderer);
    this.fsQuad.material = this.fsQuad._originalMaterial;
    this.renderer.setRenderTarget(e);
    this.splatLastPosition.copy(this.splatPosition);
    this.splatTargetVelocity = 0;
    this.splatVelocity = 0;
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
      e = 0;
    }
    this.splatTargetVelocity += e * 6;
    this.splatTargetVelocity *= 0.88;
    this.splatTargetVelocity = math.clamp(this.splatTargetVelocity, 0, 1);
    this.splatVelocity = math.lerp(
      this.splatVelocity,
      math.ease(this.splatTargetVelocity, 'power4.out'),
      0.1,
    );
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
  _debug() {
    const e = new PlaneGeometry(2, 2),
      t = new ShaderMaterial({
        uniforms: {
          tBuffer: {
            value: null,
          },
        },
        vertexShader: DetailPointerFeedbackvertexShader5,
        fragmentShader: DetailPointerFeedbackfragmentShader6,
        depthTest: false,
        transparent: true,
      });
    this.debugMesh = new Mesh(e, t);
    this.debugMesh.renderOrder = 1e3;
    this.debugMesh.frustumCulled = false;
    this.parent.add(this.debugMesh);
  }
  resize() {
    const t = Math.floor(runtime.uniforms.resolution.value.x / 5),
      s = Math.floor(runtime.uniforms.resolution.value.y / 5);
    this.rts.forEach((n) => {
      n.setSize(t, s);
    });
  }
}
export { DetailPointerFeedback };
