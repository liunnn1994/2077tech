// Reconstructed application source. Third-party implementations are npm imports.
import FrostFeedbackMaterialvertexShader1 from '../../../shaders/scenes/portfolio/frost/FrostFeedbackMaterial/FrostFeedbackMaterial-vertexShader-1.glsl?raw';
import FrostFeedbackMaterialfragmentShader2 from '../../../shaders/scenes/portfolio/frost/FrostFeedbackMaterial/FrostFeedbackMaterial-fragmentShader-2.glsl?raw';
import globalUniformsGLSL from '../../../shaders/chunks/globalUniformsGLSL.glsl?raw';
import fitFunctions from '../../../shaders/chunks/fit.glsl?raw';
import { composeShader } from '../../../engine/shaders/compose-shader.ts';
import { ShaderMaterial, Vector2 } from 'three';
import { runtime } from '../../../engine/rendering/runtime.ts';
import { textures } from '../../../engine/loaders/textures.js';
class FrostFeedbackMaterial extends ShaderMaterial {
  constructor() {
    super({
      uniformsGroups: [runtime.UBO],
      uniforms: {
        tBuffer: {
          value: null,
        },
        tAdvect: {
          value: textures.load('cubes/advect.png', 'colordata-repeat'),
        },
        uSplatCoords: {
          value: new Vector2(),
        },
        uSplatPrevCoords: {
          value: new Vector2(),
        },
        uSplatRadius: {
          value: 0,
        },
      },
      vertexShader: composeShader(FrostFeedbackMaterialvertexShader1, {
        globalUniformsGLSL: globalUniformsGLSL,
      }),
      fragmentShader: composeShader(FrostFeedbackMaterialfragmentShader2, {
        globalUniformsGLSL: globalUniformsGLSL,
        fitFunctions: fitFunctions,
      }),
      depthTest: false,
    });
  }
}
export { FrostFeedbackMaterial };
