// Reconstructed application source. Third-party implementations are npm imports.
import DetailPointerParticlesvertexShader1 from '../../shaders/scenes/detail/DetailPointerParticles/DetailPointerParticles-vertexShader-1.glsl?raw';
import DetailPointerParticlesfragmentShader2 from '../../shaders/scenes/detail/DetailPointerParticles/DetailPointerParticles-fragmentShader-2.glsl?raw';
import globalUniformsGLSL from '../../shaders/chunks/globalUniformsGLSL.glsl?raw';
import rotateUv from '../../shaders/chunks/rotate-uv.glsl?raw';
import fitFunctions from '../../shaders/chunks/fit.glsl?raw';
import treadmill from '../../shaders/chunks/treadmill.glsl?raw';
import { composeShader } from '../../engine/shaders/compose-shader.ts';
import {
  BufferGeometry,
  Float32BufferAttribute,
  Points,
  ShaderMaterial,
  Color,
  AdditiveBlending,
} from 'three';
import { runtime } from '../../engine/rendering/runtime.ts';
class DetailPointerParticles {
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
      n = 2,
      r = 1e4;
    for (let a = 0; a < r; a++) {
      const o = Math.random() * n * 2 - n,
        l = Math.random() * n * 2 - n,
        c = (Math.random() * n * 2 - n) * 0.5;
      t.push(o, l, c);
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
          uColor: {
            value: new Color('#2d3133'),
          },
          tSim: {
            value: this.scene.mouseSim.finalRT.texture,
          },
        },
        vertexShader: composeShader(DetailPointerParticlesvertexShader1, {
          globalUniformsGLSL: globalUniformsGLSL,
          rotateUv: rotateUv,
          fitFunctions: fitFunctions,
          treadmill: treadmill,
        }),
        fragmentShader: composeShader(DetailPointerParticlesfragmentShader2, {
          globalUniformsGLSL: globalUniformsGLSL,
        }),
        depthTest: true,
        depthWrite: false,
        transparent: false,
        blending: AdditiveBlending,
      }),
    );
    this.mesh.name = 'little particles';
    this.mesh.renderOrder = 999;
    this.frustumCulled = false;
    this.scene.add(this.mesh);
    this.isReady();
  }
}
export { DetailPointerParticles };
