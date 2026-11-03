// Reconstructed application source. Third-party implementations are npm imports.
import LandscapeColorMaterialvertexShader1 from '../../shaders/scenes/landscape/LandscapeColorMaterial/LandscapeColorMaterial-vertexShader-1.glsl?raw';
import LandscapeColorMaterialfragmentShader2 from '../../shaders/scenes/landscape/LandscapeColorMaterial/LandscapeColorMaterial-fragmentShader-2.glsl?raw';
import globalUniformsGLSL from '../../shaders/chunks/globalUniformsGLSL.glsl?raw';
import lutSampling from '../../shaders/chunks/lut.glsl?raw';
import { composeShader } from '../../engine/shaders/compose-shader.ts';
import { ShaderMaterial } from 'three';
import { runtime } from '../../engine/rendering/runtime.ts';
import { textures } from '../../engine/loaders/textures.js';
let LandscapeColorMaterial = class extends ShaderMaterial {
  constructor() {
    super({
      uniformsGroups: [runtime.UBO],
      uniforms: {
        tDiffuse: {
          value: null,
        },
        tLUT: {
          value: textures.load('landscape/scene_color.ktx2', 'luttetrahedral'),
        },
        uLUTSize: {
          value: 1,
        },
        uLUTIntensity: {
          value: 1,
        },
        uGradientAlpha: {
          value: 0,
        },
      },
      vertexShader: composeShader(LandscapeColorMaterialvertexShader1, {
        globalUniformsGLSL: globalUniformsGLSL,
      }),
      fragmentShader: composeShader(LandscapeColorMaterialfragmentShader2, {
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
export { LandscapeColorMaterial };
