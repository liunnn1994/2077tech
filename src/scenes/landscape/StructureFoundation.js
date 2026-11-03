// Reconstructed application source. Third-party implementations are npm imports.
import StructureFoundationvertexShader1 from '../../shaders/scenes/landscape/StructureFoundation/StructureFoundation-vertexShader-1.glsl?raw';
import StructureFoundationfragmentShader2 from '../../shaders/scenes/landscape/StructureFoundation/StructureFoundation-fragmentShader-2.glsl?raw';
import globalUniformsGLSL from '../../shaders/chunks/globalUniformsGLSL.glsl?raw';
import falloffFunctions from '../../shaders/chunks/falloffFunctions.glsl?raw';
import { composeShader } from '../../engine/shaders/compose-shader.ts';
import { Vector3, ShaderMaterial, Mesh } from 'three';
import { geometries } from '../../engine/loaders/geometries.js';
import { runtime } from '../../engine/rendering/runtime.ts';
import { textures } from '../../engine/loaders/textures.js';
import { environment } from '../../engine/core/environment.ts';
import { geometryUtils } from '../../engine/geometry/shared.js';
import { math } from '../../engine/core/math.js';
const x3 = new Vector3();
class StructureFoundation {
  constructor(scene) {
    this.scene = scene;
    this.ready = new Promise((isReady) => {
      this.isReady = isReady;
    });
    this.mousePosition = new Vector3();
    this.init();
  }
  async init() {
    const e = await geometries.load('ground.drc'),
      t = new ShaderMaterial({
        uniformsGroups: [runtime.UBO],
        uniforms: {
          tMap: {
            value: textures.load('landscape/ground_color.ktx2', 'srgb'),
          },
          tGroundGlow: {
            value: textures.load('landscape/ground_glow.ktx2', 'srgb'),
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
          uMousePos: {
            value: this.mousePosition,
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
        vertexShader: composeShader(StructureFoundationvertexShader1, {
          globalUniformsGLSL: globalUniformsGLSL,
        }),
        fragmentShader: composeShader(StructureFoundationfragmentShader2, {
          globalUniformsGLSL: globalUniformsGLSL,
          falloffFunctions: falloffFunctions,
        }),
        transparent: true,
      });
    this.mesh = new Mesh(e, t);
    this.mesh.name = 'foundation';
    this.mesh.renderOrder = 2;
    this.mesh.updateMatrixWorld(true);
    this.mesh.matrixAutoUpdate = false;
    this.mesh.receiveShadow = false;
    this.mesh.castShadow = false;
    this.scene.add(this.mesh);
    this.scene.beforeRenderCbs.push(() => {
      geometryUtils.planeInteraction.setCamera(this.scene.camera);
      const s = geometryUtils.planeInteraction.unprojectDistance(19.25);
      x3.copy(s);
      this.mousePosition.lerp(s, math.lerpCoefFPS(0.03));
    });
    this.isReady();
  }
}
export { x3, StructureFoundation };
