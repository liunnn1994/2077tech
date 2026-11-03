// Reconstructed application source. Third-party implementations are npm imports.
import PortfolioBackgroundvertexShader1 from '../../shaders/scenes/portfolio/PortfolioBackground/PortfolioBackground-vertexShader-1.glsl?raw';
import PortfolioBackgroundfragmentShader2 from '../../shaders/scenes/portfolio/PortfolioBackground/PortfolioBackground-fragmentShader-2.glsl?raw';
import globalUniformsGLSL from '../../shaders/chunks/globalUniformsGLSL.glsl?raw';
import noiseTextureLookup from '../../shaders/chunks/noise-lookup.glsl?raw';
import { composeShader } from '../../engine/shaders/compose-shader.ts';
import { ShaderMaterial, Color, Vector2, Mesh } from 'three';
import { runtime } from '../../engine/rendering/runtime.ts';
import { textures } from '../../engine/loaders/textures.js';
import { geometryUtils } from '../../engine/geometry/shared.js';
class PortfolioBackground {
  constructor(scene) {
    this.scene = scene;
    this.ready = new Promise((isReady) => {
      this.isReady = isReady;
    });
    this.init();
  }
  init() {
    const e = new ShaderMaterial({
      uniformsGroups: [runtime.UBO],
      uniforms: {
        uProgress: {
          value: 0,
        },
        uColor1: {
          value: new Color('#c9d0df'),
        },
        uColor2: {
          value: new Color('#545b6b'),
        },
        tPerlin: {
          value: textures.load('perlin-datatexture.ktx2', 'colordata-repeat'),
        },
        tDotPattern: {
          value: textures.load('cubes/dot_pattern.ktx2', 'srgb-repeat'),
        },
        tBlue: {
          value: textures.load('noises/blue-8-128-rgb.ktx2', 'colordata-repeat'),
        },
        uBlueOffset: {
          value: new Vector2(),
        },
      },
      vertexShader: composeShader(PortfolioBackgroundvertexShader1, {
        globalUniformsGLSL: globalUniformsGLSL,
      }),
      fragmentShader: composeShader(PortfolioBackgroundfragmentShader2, {
        globalUniformsGLSL: globalUniformsGLSL,
        noiseTextureLookup: noiseTextureLookup,
      }),
      depthTest: false,
      depthWrite: false,
    });
    this.mesh = new Mesh(geometryUtils.triangle, e);
    this.mesh.name = 'bg';
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = -99;
    this.mesh.updateMatrixWorld(true);
    this.mesh.matrixAutoUpdate = false;
    this.scene.add(this.mesh);
    this.isReady();
  }
  update(e) {
    this.mesh.material.uniforms.uBlueOffset.value.set(Math.random(), Math.random());
    this.mesh.material.uniforms.uProgress.value = e;
  }
}
export { PortfolioBackground };
