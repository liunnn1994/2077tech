// Reconstructed application source. Third-party implementations are npm imports.
import PortalPlasmavertexShader1 from '../../shaders/scenes/particles/PortalPlasma/PortalPlasma-vertexShader-1.glsl?raw';
import PortalPlasmafragmentShader2 from '../../shaders/scenes/particles/PortalPlasma/PortalPlasma-fragmentShader-2.glsl?raw';
import globalUniformsGLSL from '../../shaders/chunks/globalUniformsGLSL.glsl?raw';
import falloffFunctions from '../../shaders/chunks/falloffFunctions.glsl?raw';
import { composeShader } from '../../engine/shaders/compose-shader.ts';
import { geometries } from '../../engine/loaders/geometries.js';
import { ShaderMaterial, AdditiveBlending, DoubleSide, Mesh } from 'three';
import { runtime } from '../../engine/rendering/runtime.ts';
import { textures } from '../../engine/loaders/textures.js';
class PortalPlasma {
  constructor(scene) {
    this.scene = scene;
    this.ready = new Promise((isReady) => {
      this.isReady = isReady;
    });
    this.meshes = [];
    this.init();
  }
  async init() {
    const e = await geometries.load('shattered_ring_smoke.drc'),
      t = new ShaderMaterial({
        uniformsGroups: [runtime.UBO],
        uniforms: {
          tWind: {
            value: textures.load('wind_noise.ktx2', 'linear-repeat'),
          },
        },
        vertexShader: composeShader(PortalPlasmavertexShader1, {
          globalUniformsGLSL: globalUniformsGLSL,
        }),
        fragmentShader: composeShader(PortalPlasmafragmentShader2, {
          globalUniformsGLSL: globalUniformsGLSL,
          falloffFunctions: falloffFunctions,
        }),
        transparent: true,
        blending: AdditiveBlending,
        side: DoubleSide,
      }),
      s = 3,
      n = 2.5;
    let r = 1.6;
    for (let a = 0; a < s; a++) {
      const o = `mesh${a}`;
      this[o] = new Mesh(e, t);
      this[o].name = `plasma${a}`;
      this[o].receiveShadow = false;
      this[o].castShadow = false;
      this[o].position.y = -r;
      this[o].initialRotation = a * 3.14 * 2 * 0.25;
      this[o].updateMatrixWorld(true);
      this[o].renderOrder = s - a;
      r += n;
      this.scene.add(this[o]);
      this.meshes.push(this[o]);
    }
    this.isReady();
  }
  update() {
    const e = this.scene.timelineAdditional.upRotation * 0.5;
    this.meshes.forEach((t) => {
      t.rotation.y = t.initialRotation + e;
    });
  }
}
export { PortalPlasma };
