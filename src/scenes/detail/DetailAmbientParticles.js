// Reconstructed application source. Third-party implementations are npm imports.
import DetailAmbientParticlesvertexShader1 from '../../shaders/scenes/detail/DetailAmbientParticles/DetailAmbientParticles-vertexShader-1.glsl?raw';
import DetailAmbientParticlesfragmentShader2 from '../../shaders/scenes/detail/DetailAmbientParticles/DetailAmbientParticles-fragmentShader-2.glsl?raw';
import globalUniformsGLSL from '../../shaders/chunks/globalUniformsGLSL.glsl?raw';
import rotateUv from '../../shaders/chunks/rotate-uv.glsl?raw';
import { composeShader } from '../../engine/shaders/compose-shader.ts';
import {
  BufferGeometry,
  Float32BufferAttribute,
  Points,
  ShaderMaterial,
  AdditiveBlending,
} from 'three';
import { runtime } from '../../engine/rendering/runtime.ts';
class DetailAmbientParticles {
  constructor(scene) {
    this.scene = scene;
    this.ready = new Promise((isReady) => {
      this.isReady = isReady;
    });
    this.init();
  }
  init() {
    const e = new BufferGeometry(),
      t = [],
      s = [],
      n = 250;
    for (let r = 0; r < n; r++) {
      const a = Math.random() * 4 - 2,
        o = Math.random() * 4 - 2,
        l = (r / n - 0.5) * 2;
      t.push(a, o, l);
      s.push(Math.random());
      s.push(Math.random());
      s.push(Math.random());
    }
    e.setAttribute('position', new Float32BufferAttribute(t, 3));
    e.setAttribute('random', new Float32BufferAttribute(s, 3));
    this.mesh = new Points(
      e,
      new ShaderMaterial({
        uniformsGroups: [runtime.UBO],
        uniforms: {
          uRotation: {
            value: -0.66,
          },
        },
        vertexShader: composeShader(DetailAmbientParticlesvertexShader1, {
          globalUniformsGLSL: globalUniformsGLSL,
          rotateUv: rotateUv,
        }),
        fragmentShader: composeShader(DetailAmbientParticlesfragmentShader2, {
          globalUniformsGLSL: globalUniformsGLSL,
        }),
        transparent: true,
        blending: AdditiveBlending,
      }),
    );
    this.mesh.name = 'particles';
    this.mesh.renderOrder = 1;
    this.scene.add(this.mesh);
    this.isReady();
  }
}
export { DetailAmbientParticles };
