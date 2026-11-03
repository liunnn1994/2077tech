// Reconstructed application source. Third-party implementations are npm imports.
import ParticleRoomRingvertexShader1 from '../../shaders/scenes/particles/ParticleRoomRing/ParticleRoomRing-vertexShader-1.glsl?raw';
import ParticleRoomRingfragmentShader2 from '../../shaders/scenes/particles/ParticleRoomRing/ParticleRoomRing-fragmentShader-2.glsl?raw';
import globalUniformsGLSL from '../../shaders/chunks/globalUniformsGLSL.glsl?raw';
import { composeShader } from '../../engine/shaders/compose-shader.ts';
import { PlaneGeometry, ShaderMaterial, AdditiveBlending, Mesh } from 'three';
import { runtime } from '../../engine/rendering/runtime.ts';
class ParticleRoomRing {
  constructor(scene) {
    this.scene = scene;
    this.ready = new Promise((isReady) => {
      this.isReady = isReady;
    });
    this.init();
  }
  init() {
    const e = new PlaneGeometry(1, 1);
    e.rotateX(Math.PI * 0.5);
    e.translate(0, 1.5, 0);
    const t = new ShaderMaterial({
      uniformsGroups: [runtime.UBO],
      uniforms: {},
      vertexShader: composeShader(ParticleRoomRingvertexShader1, {
        globalUniformsGLSL: globalUniformsGLSL,
      }),
      fragmentShader: composeShader(ParticleRoomRingfragmentShader2, {
        globalUniformsGLSL: globalUniformsGLSL,
      }),
      transparent: true,
      blending: AdditiveBlending,
    });
    this.mesh = new Mesh(e, t);
    this.mesh.position.y = -10.26;
    this.mesh.scale.setScalar(0.57);
    this.mesh.name = 'roomring';
    this.mesh.renderOrder = 3;
    this.mesh.updateMatrixWorld(true);
    this.mesh.receiveShadow = false;
    this.mesh.castShadow = false;
    this.scene.add(this.mesh);
    this.isReady();
  }
}
export { ParticleRoomRing };
