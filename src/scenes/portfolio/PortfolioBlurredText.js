// Reconstructed application source. Third-party implementations are npm imports.
import PortfolioBlurredTextvertexShader1 from '../../shaders/scenes/portfolio/PortfolioBlurredText/PortfolioBlurredText-vertexShader-1.glsl?raw';
import PortfolioBlurredTextfragmentShader2 from '../../shaders/scenes/portfolio/PortfolioBlurredText/PortfolioBlurredText-fragmentShader-2.glsl?raw';
import globalUniformsGLSL from '../../shaders/chunks/globalUniformsGLSL.glsl?raw';
import noiseTextureLookup from '../../shaders/chunks/noise-lookup.glsl?raw';
import { composeShader } from '../../engine/shaders/compose-shader.ts';
import { geometries } from '../../engine/loaders/geometries.js';
import { ShaderMaterial, Color, Mesh } from 'three';
import { runtime } from '../../engine/rendering/runtime.ts';
import { textures } from '../../engine/loaders/textures.js';
class PortfolioBlurredText {
  constructor(scene) {
    this.scene = scene;
    this.ready = new Promise((isReady) => {
      this.isReady = isReady;
    });
    this.init();
  }
  async init() {
    const e = await geometries.load('blurrytext.drc'),
      t = new ShaderMaterial({
        uniformsGroups: [runtime.UBO],
        uniforms: {
          uProgress: {
            value: 0,
          },
          uColor1: {
            value: new Color('#c9d0df'),
          },
          tMap: {
            value: textures.load('cubes/blurrytext_atlas.ktx2', 'srgb-repeat'),
          },
          tPerlin: {
            value: textures.load('perlin-datatexture.png', 'srgb-repeat'),
          },
        },
        vertexShader: composeShader(PortfolioBlurredTextvertexShader1, {
          globalUniformsGLSL: globalUniformsGLSL,
        }),
        fragmentShader: composeShader(PortfolioBlurredTextfragmentShader2, {
          globalUniformsGLSL: globalUniformsGLSL,
          noiseTextureLookup: noiseTextureLookup,
        }),
        depthTest: false,
        transparent: true,
      });
    this.mesh = new Mesh(e, t);
    this.mesh.name = 'blurrytext';
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 5;
    this.mesh.updateMatrixWorld(true);
    this.mesh.matrixAutoUpdate = false;
    this.scene.add(this.mesh);
    this.isReady();
  }
  update(e) {
    this.mesh.material.uniforms.uProgress.value = e;
  }
}
export { PortfolioBlurredText };
