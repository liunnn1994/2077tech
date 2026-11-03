// Reconstructed application source. Third-party implementations are npm imports.
import AmbientParticlesvertexShader1 from '../../shaders/scenes/particles/AmbientParticles/AmbientParticles-vertexShader-1.glsl?raw';
import AmbientParticlesfragmentShader2 from '../../shaders/scenes/particles/AmbientParticles/AmbientParticles-fragmentShader-2.glsl?raw';
import globalUniformsGLSL from '../../shaders/chunks/globalUniformsGLSL.glsl?raw';
import { composeShader } from '../../engine/shaders/compose-shader.ts';
import {
  BufferGeometry,
  Float32BufferAttribute,
  ShaderMaterial,
  AdditiveBlending,
  Points,
} from 'three';
import { runtime } from '../../engine/rendering/runtime.ts';
class AmbientParticles {
  constructor(scene) {
    this.options = {
      count: 60,
      shape: 'box',
      scale: [2.5, 0.5, 2.5],
      center: [0, 0, 0],
    };
    this.scene = scene;
    this.ready = new Promise((isReady) => {
      this.isReady = isReady;
    });
    this.init();
  }
  init() {
    const { count: e, scale: t, center: s } = this.options;
    let n = 0;
    const r = [],
      a = [];
    for (n = 0; n < e; n++) {
      const c = Math.random() * t[0] - t[0] * 0.5 + s[0],
        h = Math.random() * t[1] - t[1] * 0.5 + s[1],
        d = Math.random() * t[2] - t[2] * 0.5 + s[2];
      r.push(c, h, d);
      a.push(Math.random(), Math.random(), Math.random());
    }
    const o = new BufferGeometry();
    o.setAttribute('position', new Float32BufferAttribute(r, 3));
    o.setAttribute('random', new Float32BufferAttribute(a, 3));
    const l = new ShaderMaterial({
      uniformsGroups: [runtime.UBO],
      uniforms: {
        uAlpha: {
          value: 1,
        },
      },
      vertexShader: composeShader(AmbientParticlesvertexShader1, {
        globalUniformsGLSL: globalUniformsGLSL,
      }),
      fragmentShader: composeShader(AmbientParticlesfragmentShader2, {
        globalUniformsGLSL: globalUniformsGLSL,
      }),
      transparent: true,
      blending: AdditiveBlending,
    });
    this.mesh = new Points(o, l);
    this.mesh.name = 'ambientparticles';
    this.mesh.renderOrder = 15;
    this.mesh.position.y = -9.61;
    this.mesh.updateMatrixWorld(true);
    this.mesh.receiveShadow = false;
    this.mesh.castShadow = false;
    this.mesh.frustumCulled = false;
    this.scene.add(this.mesh);
    this.isReady();
  }
}
export { AmbientParticles };
