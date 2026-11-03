// Reconstructed application source. Third-party implementations are npm imports.
import PortfolioColorMaterialvertexShader1 from '../../shaders/scenes/portfolio/PortfolioColorMaterial/PortfolioColorMaterial-vertexShader-1.glsl?raw';
import PortfolioColorMaterialfragmentShader2 from '../../shaders/scenes/portfolio/PortfolioColorMaterial/PortfolioColorMaterial-fragmentShader-2.glsl?raw';
import globalUniformsGLSL from '../../shaders/chunks/globalUniformsGLSL.glsl?raw';
import lutSampling from '../../shaders/chunks/lut.glsl?raw';
import { composeShader } from '../../engine/shaders/compose-shader.ts';
import { ShaderMaterial } from 'three';
import { runtime } from '../../engine/rendering/runtime.ts';
import { textures } from '../../engine/loaders/textures.js';
let PortfolioColorMaterial = class extends ShaderMaterial {
  constructor() {
    super({
      uniformsGroups: [runtime.UBO],
      uniforms: {
        tDiffuse: {
          value: null,
        },
        tLUT: {
          value: textures.load('cubes/cube_scene.ktx2', 'luttetrahedral'),
        },
        uLUTSize: {
          value: 1,
        },
        uLUTIntensity: {
          value: 1,
        },
      },
      vertexShader: composeShader(PortfolioColorMaterialvertexShader1, {
        globalUniformsGLSL: globalUniformsGLSL,
      }),
      fragmentShader: composeShader(PortfolioColorMaterialfragmentShader2, {
        globalUniformsGLSL: globalUniformsGLSL,
        lutSampling: lutSampling,
      }),
    });
    setTimeout(async () => {
      const e = this.uniforms.tLUT.value;
      await e._loaded;
      this.uniforms.uLUTSize.value = e.image.width;
    }, 0);
  }
};
export { PortfolioColorMaterial };
