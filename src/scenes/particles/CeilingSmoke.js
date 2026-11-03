// Reconstructed application source. Third-party implementations are npm imports.
import CeilingSmokevertexShader1 from '../../shaders/scenes/particles/CeilingSmoke/CeilingSmoke-vertexShader-1.glsl?raw';
import CeilingSmokefragmentShader2 from '../../shaders/scenes/particles/CeilingSmoke/CeilingSmoke-fragmentShader-2.glsl?raw';
import globalUniformsGLSL from '../../shaders/chunks/globalUniformsGLSL.glsl?raw';
import falloffFunctions from '../../shaders/chunks/falloffFunctions.glsl?raw';
import { composeShader } from '../../engine/shaders/compose-shader.ts';
import { geometries } from '../../engine/loaders/geometries.js';
import { ShaderMaterial, AdditiveBlending, Mesh } from 'three';
import { runtime } from '../../engine/rendering/runtime.ts';
import { textures } from '../../engine/loaders/textures.js';
class CeilingSmoke {
  constructor(scene) {
    this.scene = scene;
    this.ready = new Promise((isReady) => {
      this.isReady = isReady;
    });
    this.meshes = [];
    this.init();
  }
  async init() {
    const e = await geometries.load('ceilingsmoke.drc'),
      t = new ShaderMaterial({
        uniformsGroups: [runtime.UBO],
        uniforms: {
          tWind: {
            value: textures.load('wind_noise.ktx2', 'linear-repeat'),
          },
        },
        vertexShader: composeShader(CeilingSmokevertexShader1, {
          globalUniformsGLSL: globalUniformsGLSL,
        }),
        fragmentShader: composeShader(CeilingSmokefragmentShader2, {
          globalUniformsGLSL: globalUniformsGLSL,
          falloffFunctions: falloffFunctions,
        }),
        transparent: true,
        blending: AdditiveBlending,
      });
    this.mesh = new Mesh(e, t);
    this.mesh.name = 'ceilingsmoke';
    this.mesh.receiveShadow = false;
    this.mesh.castShadow = false;
    this.mesh.position.y = -9.4;
    this.mesh.scale.set(2, 0.1, 2);
    this.mesh.updateMatrixWorld(true);
    this.mesh.matrixAutoUpdate = false;
    this.mesh.renderOrder = 2;
    this.scene.add(this.mesh);
    this.isReady();
  }
}
export { CeilingSmoke };
