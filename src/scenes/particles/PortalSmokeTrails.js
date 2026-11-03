// Reconstructed application source. Third-party implementations are npm imports.
import PortalSmokeTrailsvertexShader1 from '../../shaders/scenes/particles/PortalSmokeTrails/PortalSmokeTrails-vertexShader-1.glsl?raw';
import PortalSmokeTrailsfragmentShader2 from '../../shaders/scenes/particles/PortalSmokeTrails/PortalSmokeTrails-fragmentShader-2.glsl?raw';
import globalUniformsGLSL from '../../shaders/chunks/globalUniformsGLSL.glsl?raw';
import falloffFunctions from '../../shaders/chunks/falloffFunctions.glsl?raw';
import { composeShader } from '../../engine/shaders/compose-shader.ts';
import { geometries } from '../../engine/loaders/geometries.js';
import { ShaderMaterial, DoubleSide, Mesh } from 'three';
import { runtime } from '../../engine/rendering/runtime.ts';
import { textures } from '../../engine/loaders/textures.js';
class PortalSmokeTrails {
  constructor(scene) {
    this.scene = scene;
    this.ready = new Promise((isReady) => {
      this.isReady = isReady;
    });
    this.meshes = [];
    this.init();
  }
  async init() {
    const e = await geometries.load('smoke_trail.drc'),
      t = new ShaderMaterial({
        uniformsGroups: [runtime.UBO],
        uniforms: {
          tWind: {
            value: textures.load('wind_noise.ktx2', 'linear-repeat'),
          },
        },
        vertexShader: composeShader(PortalSmokeTrailsvertexShader1, {
          globalUniformsGLSL: globalUniformsGLSL,
        }),
        fragmentShader: composeShader(PortalSmokeTrailsfragmentShader2, {
          globalUniformsGLSL: globalUniformsGLSL,
          falloffFunctions: falloffFunctions,
        }),
        transparent: true,
        side: DoubleSide,
        depthTest: false,
        depthWrite: false,
      }),
      s = 3,
      n = 2.5;
    let r = 1.6;
    for (let a = 0; a < s; a++) {
      const o = `mesh${a}`;
      this[o] = new Mesh(e, t);
      this[o].name = `smoketrail${a}`;
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
export { PortalSmokeTrails };
