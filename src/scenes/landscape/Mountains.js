// Reconstructed application source. Third-party implementations are npm imports.
import MountainsvertexShader1 from '../../shaders/scenes/landscape/Mountains/Mountains-vertexShader-1.glsl?raw';
import MountainsfragmentShader2 from '../../shaders/scenes/landscape/Mountains/Mountains-fragmentShader-2.glsl?raw';
import globalUniformsGLSL from '../../shaders/chunks/globalUniformsGLSL.glsl?raw';
import falloffFunctions from '../../shaders/chunks/falloffFunctions.glsl?raw';
import { composeShader } from '../../engine/shaders/compose-shader.ts';
import { geometries } from '../../engine/loaders/geometries.js';
import { ShaderMaterial, Color, Mesh } from 'three';
import { runtime } from '../../engine/rendering/runtime.ts';
import { textures } from '../../engine/loaders/textures.js';
class Mountains {
  constructor(scene) {
    this.scene = scene;
    this.ready = new Promise((isReady) => {
      this.isReady = isReady;
    });
    this.init();
  }
  async init() {
    const e = await geometries.load('mountain.drc'),
      t = new ShaderMaterial({
        uniformsGroups: [runtime.UBO],
        uniforms: {
          uColor1: {
            value: new Color('#d1d6e3'),
          },
          uColor2: {
            value: new Color('#afb6c7'),
          },
          tMap: {
            value: textures.load('landscape/mountain_color.ktx2', 'srgb'),
          },
          tTriangles: {
            value: textures.load('landscape/triangles_tiling.ktx2', 'srgb-repeat'),
          },
          tNoise: {
            value: textures.load('mosaic.ktx2', 'srgb-repeat-nearest'),
          },
          uProgress: {
            value: 1,
          },
          uProgress2: {
            value: 1,
          },
          uTriangleAlpha: {
            value: 1,
          },
          uAlpha: {
            value: 1,
          },
        },
        vertexShader: composeShader(MountainsvertexShader1, {
          globalUniformsGLSL: globalUniformsGLSL,
        }),
        fragmentShader: composeShader(MountainsfragmentShader2, {
          globalUniformsGLSL: globalUniformsGLSL,
          falloffFunctions: falloffFunctions,
        }),
        transparent: true,
      });
    this.mesh1 = new Mesh(e, t);
    this.mesh1.position.set(59.53, -1, -11.84);
    this.mesh1.scale.x = 4;
    this.mesh1.scale.y = 3.14;
    this.mesh1.scale.z = 4;
    this.mesh1.rotation.x = (4.1 * 3.14) / 180;
    this.mesh1.rotation.y = (-42.8 * 3.14) / 180;
    this.mesh1.rotation.z = (5 * 3.14) / 180;
    this.mesh1.name = 'mountain1';
    this.mesh1.renderOrder = 1;
    this.mesh2 = new Mesh(e, t);
    this.mesh2.position.set(1, -2.21, -23);
    this.mesh2.rotation.x = (3.5 * 3.14) / 180;
    this.mesh2.rotation.y = (30 * 3.14) / 180;
    this.mesh2.rotation.z = 0;
    this.mesh2.scale.setScalar(2);
    this.mesh2.name = 'mountain2';
    this.mesh2.renderOrder = 1;
    this.mesh3 = new Mesh(e, t);
    this.mesh3.position.x = 75;
    this.mesh3.position.y = 0;
    this.mesh3.position.z = -90;
    this.mesh3.scale.x = 8;
    this.mesh3.scale.y = 8;
    this.mesh3.scale.z = 8;
    this.mesh3.rotation.x = (3.2 * 3.14) / 180;
    this.mesh3.rotation.y = (-16.7 * 3.14) / 180;
    this.mesh3.rotation.z = (-2.6 * 3.14) / 180;
    this.mesh3.name = 'mountain3';
    this.mesh3.renderOrder = 1;
    this.mesh4 = new Mesh(e, t);
    this.mesh4.position.x = 250;
    this.mesh4.position.y = 11.33;
    this.mesh4.position.z = -133;
    this.mesh4.scale.x = 10;
    this.mesh4.scale.y = 10;
    this.mesh4.scale.z = 10;
    this.mesh4.rotation.x = (13.2 * 3.14) / 180;
    this.mesh4.rotation.y = (20 * 3.14) / 180;
    this.mesh4.rotation.z = (5 * 3.14) / 180;
    this.mesh4.name = 'mountain4';
    this.mesh4.renderOrder = 1;
    this.mesh5 = new Mesh(e, t);
    this.mesh5.position.set(-25.22, -1.59, -53.05);
    this.mesh5.rotation.x = (3.5 * 3.14) / 180;
    this.mesh5.rotation.y = (25 * 3.14) / 180;
    this.mesh5.rotation.z = 0;
    this.mesh5.scale.setScalar(2.5);
    this.mesh5.name = 'mountain5';
    this.mesh5.renderOrder = 1;
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
export { Mountains };
