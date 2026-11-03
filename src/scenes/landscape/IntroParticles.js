// Reconstructed application source. Third-party implementations are npm imports.
import IntroParticlesvertexShader1 from '../../shaders/scenes/landscape/IntroParticles/IntroParticles-vertexShader-1.glsl?raw';
import IntroParticlesfragmentShader2 from '../../shaders/scenes/landscape/IntroParticles/IntroParticles-fragmentShader-2.glsl?raw';
import globalUniformsGLSL from '../../shaders/chunks/globalUniformsGLSL.glsl?raw';
import falloffFunctions from '../../shaders/chunks/falloffFunctions.glsl?raw';
import { composeShader } from '../../engine/shaders/compose-shader.ts';
import { geometries } from '../../engine/loaders/geometries.js';
import { ShaderMaterial, AdditiveBlending, Points } from 'three';
import { runtime } from '../../engine/rendering/runtime.ts';
import { textures } from '../../engine/loaders/textures.js';
class IntroParticles {
  constructor(scene) {
    this.scene = scene;
    this.ready = new Promise((isReady) => {
      this.isReady = isReady;
    });
    this.init();
  }
  async init() {
    const e = await geometries.load('intro_particles.drc'),
      t = new ShaderMaterial({
        uniformsGroups: [runtime.UBO],
        uniforms: {
          tNumbers: {
            value: textures.load('landscape/numbers.ktx2', 'srgb-repeat'),
          },
          uProgress: {
            value: 0,
          },
          uAlpha: {
            value: 1,
          },
        },
        vertexShader: composeShader(IntroParticlesvertexShader1, {
          globalUniformsGLSL: globalUniformsGLSL,
        }),
        fragmentShader: composeShader(IntroParticlesfragmentShader2, {
          globalUniformsGLSL: globalUniformsGLSL,
          falloffFunctions: falloffFunctions,
        }),
        transparent: true,
        blending: AdditiveBlending,
        depthTest: false,
        depthWrite: false,
      });
    this.mesh = new Points(e, t);
    this.mesh.name = 'intro_particles';
    this.mesh.renderOrder = 1e3;
    this.mesh.matrixAutoUpdate = false;
    this.mesh.receiveShadow = false;
    this.scene.add(this.mesh);
    this.isReady();
  }
}
export { IntroParticles };
