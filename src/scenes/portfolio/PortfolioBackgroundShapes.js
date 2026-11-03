// Reconstructed application source. Third-party implementations are npm imports.
import PortfolioBackgroundShapesvertexShader1 from '../../shaders/scenes/portfolio/PortfolioBackgroundShapes/PortfolioBackgroundShapes-vertexShader-1.glsl?raw';
import PortfolioBackgroundShapesfragmentShader2 from '../../shaders/scenes/portfolio/PortfolioBackgroundShapes/PortfolioBackgroundShapes-fragmentShader-2.glsl?raw';
import globalUniformsGLSL from '../../shaders/chunks/globalUniformsGLSL.glsl?raw';
import falloffFunctions from '../../shaders/chunks/falloffFunctions.glsl?raw';
import { composeShader } from '../../engine/shaders/compose-shader.ts';
import { geometries } from '../../engine/loaders/geometries.js';
import { ShaderMaterial, AdditiveBlending, Mesh } from 'three';
import { runtime } from '../../engine/rendering/runtime.ts';
import { textures } from '../../engine/loaders/textures.js';
class PortfolioBackgroundShapes {
  constructor(scene) {
    this.scene = scene;
    this.ready = new Promise((isReady) => {
      this.isReady = isReady;
    });
    this.init();
  }
  async init() {
    const e = await geometries.load('cubes/background_shapes.drc'),
      t = new ShaderMaterial({
        uniformsGroups: [runtime.UBO],
        uniforms: {
          tMap: {
            value: textures.load('shapes_blurred.ktx2', 'srgb'),
          },
          uProgress: {
            value: 0.5,
          },
          uAlpha: {
            value: 1,
          },
        },
        vertexShader: composeShader(PortfolioBackgroundShapesvertexShader1, {
          globalUniformsGLSL: globalUniformsGLSL,
        }),
        fragmentShader: composeShader(PortfolioBackgroundShapesfragmentShader2, {
          globalUniformsGLSL: globalUniformsGLSL,
          falloffFunctions: falloffFunctions,
        }),
        transparent: true,
        blending: AdditiveBlending,
      });
    this.mesh = new Mesh(e, t);
    this.mesh.name = 'background_shapes';
    this.mesh.renderOrder = 9;
    this.mesh.frustumCulled = false;
    this.mesh.matrixAutoUpdate = false;
    this.mesh.receiveShadow = false;
    this.scene.add(this.mesh);
    this.isReady();
  }
  update(e) {
    this.mesh.material.uniforms.uProgress.value = e;
  }
}
export { PortfolioBackgroundShapes };
