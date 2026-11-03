// Reconstructed application source. Third-party implementations are npm imports.
import GroundSmokevertexShader1 from '../../shaders/scenes/particles/GroundSmoke/GroundSmoke-vertexShader-1.glsl?raw';
import GroundSmokefragmentShader2 from '../../shaders/scenes/particles/GroundSmoke/GroundSmoke-fragmentShader-2.glsl?raw';
import globalUniformsGLSL from '../../shaders/chunks/globalUniformsGLSL.glsl?raw';
import falloffFunctions from '../../shaders/chunks/falloffFunctions.glsl?raw';
import { composeShader } from '../../engine/shaders/compose-shader.ts';
import { geometries } from '../../engine/loaders/geometries.js';
import { ShaderMaterial, AdditiveBlending, Mesh } from 'three';
import { runtime } from '../../engine/rendering/runtime.ts';
import { textures } from '../../engine/loaders/textures.js';
class GroundSmoke {
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
          uAlpha: {
            value: 0,
          },
        },
        vertexShader: composeShader(GroundSmokevertexShader1, {
          globalUniformsGLSL: globalUniformsGLSL,
        }),
        fragmentShader: composeShader(GroundSmokefragmentShader2, {
          globalUniformsGLSL: globalUniformsGLSL,
          falloffFunctions: falloffFunctions,
        }),
        transparent: true,
        blending: AdditiveBlending,
      });
    this.mesh = new Mesh(e, t);
    this.mesh.name = 'groundsmoke';
    this.mesh.receiveShadow = false;
    this.mesh.castShadow = false;
    this.mesh.position.y = -10.17;
    this.mesh.scale.set(5, 0.1, 5);
    this.mesh.updateMatrixWorld(true);
    this.mesh.renderOrder = 0;
    this.scene.add(this.mesh);
    this.isReady();
  }
}
export { GroundSmoke };
