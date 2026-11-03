// Reconstructed application source. Third-party implementations are npm imports.
import TerrainvertexShader1 from '../../shaders/scenes/landscape/Terrain/Terrain-vertexShader-1.glsl?raw';
import TerrainfragmentShader2 from '../../shaders/scenes/landscape/Terrain/Terrain-fragmentShader-2.glsl?raw';
import globalUniformsGLSL from '../../shaders/chunks/globalUniformsGLSL.glsl?raw';
import falloffFunctions from '../../shaders/chunks/falloffFunctions.glsl?raw';
import { composeShader } from '../../engine/shaders/compose-shader.ts';
import { geometries } from '../../engine/loaders/geometries.js';
import { ShaderMaterial, Mesh } from 'three';
import { runtime } from '../../engine/rendering/runtime.ts';
import { textures } from '../../engine/loaders/textures.js';
import { environment } from '../../engine/core/environment.ts';
class Terrain {
  constructor(scene) {
    this.scene = scene;
    this.ready = new Promise((isReady) => {
      this.isReady = isReady;
    });
    this.init();
  }
  async init() {
    const e = await geometries.load('ground.drc'),
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
            value: environment.devScene ? 1 : 0,
          },
          uProgress2: {
            value: environment.devScene ? 1 : 0,
          },
          uTriangleAlpha: {
            value: 1,
          },
          uAlpha: {
            value: 1,
          },
        },
        vertexShader: composeShader(TerrainvertexShader1, {
          globalUniformsGLSL: globalUniformsGLSL,
        }),
        fragmentShader: composeShader(TerrainfragmentShader2, {
          globalUniformsGLSL: globalUniformsGLSL,
          falloffFunctions: falloffFunctions,
        }),
        transparent: true,
      });
    this.mesh1 = new Mesh(e, t);
    this.mesh1.position.set(-3.76, -0.58, 12.5);
    this.mesh1.scale.set(0.6, 0.6, 0.6);
    this.mesh1.rotation.x = (-5.1 * 3.14) / 180;
    this.mesh1.rotation.y = 0;
    this.mesh1.rotation.z = 0;
    this.mesh1.name = 'terrain1';
    this.mesh1.renderOrder = 1;
    this.mesh2 = new Mesh(e, t);
    this.mesh2.position.set(-17.63, -0.01, 2);
    this.mesh2.rotation.x = (2.7 * 3.14) / 180;
    this.mesh2.rotation.y = (0.8 * 3.14) / 180;
    this.mesh2.rotation.z = 0;
    this.mesh2.scale.set(1, 1, 1);
    this.mesh2.name = 'terrain2';
    this.mesh2.renderOrder = 3;
    this.mesh3 = new Mesh(e, t);
    this.mesh3.position.set(3.12, -0.75, -1.02);
    this.mesh3.scale.set(1.5, 0.66, 1.5);
    this.mesh3.rotation.x = 0;
    this.mesh3.rotation.y = 0;
    this.mesh3.rotation.z = 0;
    this.mesh3.name = 'terrain3';
    this.mesh3.renderOrder = 1;
    this.mesh4 = new Mesh(e, t);
    this.mesh4.position.set(6, 0.16, 15.78);
    this.mesh4.scale.setScalar(1, 1, 1);
    this.mesh4.rotation.x = (1.1 * 3.14) / 180;
    this.mesh4.rotation.y = 0;
    this.mesh4.rotation.z = (7 * 3.14) / 180;
    this.mesh4.name = 'terrain4';
    this.mesh4.renderOrder = 2;
    this.mesh5 = new Mesh(e, t);
    this.mesh5.position.set(16.06, 0.34, 4);
    this.mesh5.scale.x = 1;
    this.mesh5.scale.y = 1;
    this.mesh5.scale.z = 1;
    this.mesh5.rotation.x = 0;
    this.mesh5.rotation.y = 0;
    this.mesh5.rotation.z = 0;
    this.mesh5.name = 'terrain5';
    this.mesh5.renderOrder = 2;
    this.mesh1.updateMatrixWorld(true);
    this.mesh2.updateMatrixWorld(true);
    this.mesh3.updateMatrixWorld(true);
    this.mesh4.updateMatrixWorld(true);
    this.mesh5.updateMatrixWorld(true);
    this.mesh1.matrixAutoUpdate = false;
    this.mesh2.matrixAutoUpdate = false;
    this.mesh3.matrixAutoUpdate = false;
    this.mesh4.matrixAutoUpdate = false;
    this.mesh5.matrixAutoUpdate = false;
    this.mesh1.receiveShadow = false;
    this.mesh2.receiveShadow = false;
    this.mesh3.receiveShadow = false;
    this.mesh4.receiveShadow = false;
    this.mesh5.receiveShadow = false;
    this.mesh1.castShadow = false;
    this.mesh2.castShadow = false;
    this.mesh3.castShadow = false;
    this.mesh4.castShadow = false;
    this.mesh5.castShadow = false;
    this.scene.add(this.mesh1);
    this.scene.add(this.mesh2);
    this.scene.add(this.mesh3);
    this.scene.add(this.mesh4);
    this.scene.add(this.mesh5);
    this.isReady();
  }
}
export { Terrain };
