// Reconstructed application source. Third-party implementations are npm imports.
import TerrainPatchesvertexShader1 from '../../shaders/scenes/landscape/TerrainPatches/TerrainPatches-vertexShader-1.glsl?raw';
import TerrainPatchesfragmentShader2 from '../../shaders/scenes/landscape/TerrainPatches/TerrainPatches-fragmentShader-2.glsl?raw';
import globalUniformsGLSL from '../../shaders/chunks/globalUniformsGLSL.glsl?raw';
import falloffFunctions from '../../shaders/chunks/falloffFunctions.glsl?raw';
import { composeShader } from '../../engine/shaders/compose-shader.ts';
import { geometries } from '../../engine/loaders/geometries.js';
import { ShaderMaterial, Mesh } from 'three';
import { runtime } from '../../engine/rendering/runtime.ts';
import { textures } from '../../engine/loaders/textures.js';
class TerrainPatches {
  constructor(scene) {
    this.scene = scene;
    this.ready = new Promise((isReady) => {
      this.isReady = isReady;
    });
    this.init();
  }
  async init() {
    const e = await geometries.load('landscape/patch.drc'),
      t = new ShaderMaterial({
        uniformsGroups: [runtime.UBO],
        uniforms: {
          tMap: {
            value: textures.load('landscape/ground_clear_color.ktx2', 'srgb'),
          },
          tWind: {
            value: textures.load('wind_noise.ktx2', 'srgb-repeat'),
          },
          tTriangles: {
            value: textures.load('landscape/triangles_tiling.ktx2', 'srgb-repeat'),
          },
          tNoise: {
            value: textures.load('mosaic.ktx2', 'srgb-repeat-nearest'),
          },
          uProgress: {
            value: 0,
          },
          uProgress2: {
            value: 0,
          },
          uTriangleAlpha: {
            value: 1,
          },
          uAlpha: {
            value: 1,
          },
        },
        vertexShader: composeShader(TerrainPatchesvertexShader1, {
          globalUniformsGLSL: globalUniformsGLSL,
        }),
        fragmentShader: composeShader(TerrainPatchesfragmentShader2, {
          globalUniformsGLSL: globalUniformsGLSL,
          falloffFunctions: falloffFunctions,
        }),
        transparent: true,
      });
    this.mesh1 = new Mesh(e, t);
    this.mesh1.position.set(-9.34, -1.77, 6.96);
    this.mesh1.scale.set(7, 7, 7);
    this.mesh1.rotation.x = 0;
    this.mesh1.rotation.y = 0;
    this.mesh1.rotation.z = 0;
    this.mesh1.name = 'terrainpatch1';
    this.mesh1.renderOrder = 0;
    this.mesh2 = new Mesh(e, t);
    this.mesh2.position.set(-8.82, -1.35, 11.69);
    this.mesh2.scale.set(8, 8, 8);
    this.mesh2.rotation.x = (-5.5 * 3.14) / 180;
    this.mesh2.rotation.y = (-25.6 * 3.14) / 180;
    this.mesh2.rotation.z = 0;
    this.mesh2.name = 'terrainpatch2';
    this.mesh2.renderOrder = 0;
    this.mesh1.updateMatrixWorld(true);
    this.mesh2.updateMatrixWorld(true);
    this.mesh1.matrixAutoUpdate = false;
    this.mesh2.matrixAutoUpdate = false;
    this.mesh1.receiveShadow = false;
    this.mesh1.castShadow = false;
    this.scene.add(this.mesh1);
    this.scene.add(this.mesh2);
    this.isReady();
  }
}
export { TerrainPatches };
