// Reconstructed application source. Third-party implementations are npm imports.
import PortalForceFieldsvertexShader1 from '../../shaders/scenes/particles/PortalForceFields/PortalForceFields-vertexShader-1.glsl?raw';
import PortalForceFieldsfragmentShader2 from '../../shaders/scenes/particles/PortalForceFields/PortalForceFields-fragmentShader-2.glsl?raw';
import globalUniformsGLSL from '../../shaders/chunks/globalUniformsGLSL.glsl?raw';
import matrixFunctions from '../../shaders/chunks/matrix.glsl?raw';
import falloffFunctions from '../../shaders/chunks/falloffFunctions.glsl?raw';
import sineNoise from '../../shaders/chunks/sine-noise.glsl?raw';
import antialiasedStep from '../../shaders/chunks/antialiased-step.glsl?raw';
import { composeShader } from '../../engine/shaders/compose-shader.ts';
import { PlaneGeometry, ShaderMaterial, Color, AdditiveBlending, Mesh } from 'three';
import { runtime } from '../../engine/rendering/runtime.ts';
import { textures } from '../../engine/loaders/textures.js';
class PortalForceFields {
  constructor(scene) {
    this.scene = scene;
    this.ready = new Promise((isReady) => {
      this.isReady = isReady;
    });
    this.init();
  }
  init() {
    const e = new PlaneGeometry(1, 1),
      t = new ShaderMaterial({
        uniformsGroups: [runtime.UBO],
        uniforms: {
          tTriangles: {
            value: textures.load('landscape/triangles_tiling.ktx2', 'srgb-repeat'),
          },
          tNoise: {
            value: textures.load('clouds_noise.ktx2', 'srgb-repeat'),
          },
          uAlpha: {
            value: 1,
          },
          uColor1: {
            value: new Color('#6a6f7d'),
          },
          uColor2: {
            value: new Color('#e1e6f1'),
          },
        },
        vertexShader: composeShader(PortalForceFieldsvertexShader1, {
          globalUniformsGLSL: globalUniformsGLSL,
          matrixFunctions: matrixFunctions,
          falloffFunctions: falloffFunctions,
        }),
        fragmentShader: composeShader(PortalForceFieldsfragmentShader2, {
          globalUniformsGLSL: globalUniformsGLSL,
          falloffFunctions: falloffFunctions,
          sineNoise: sineNoise,
          antialiasedStep: antialiasedStep,
        }),
        transparent: true,
        blending: AdditiveBlending,
        depthTest: false,
        depthWrite: false,
      }),
      s = 3,
      n = 2.5;
    let r = 1.5;
    for (let a = 0; a < s; a++) {
      const o = `mesh${a}`;
      this[o] = new Mesh(e, t);
      this[o].name = `ringforcefield${a}`;
      this[o].receiveShadow = false;
      this[o].castShadow = false;
      this[o].rotation.x = -3.14159 * 0.5;
      this[o].position.y = -r;
      this[o].scale.setScalar(0.65);
      this[o].updateMatrixWorld(true);
      this[o].matrixAutoUpdate = false;
      this[o].renderOrder = s - a;
      r += n;
      this.scene.add(this[o]);
    }
    this.isReady();
  }
}
export { PortalForceFields };
