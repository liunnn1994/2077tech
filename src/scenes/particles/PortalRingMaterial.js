// Reconstructed application source. Third-party implementations are npm imports.
import PortalRingMaterialvertexShader1 from '../../shaders/scenes/particles/PortalRingMaterial/PortalRingMaterial-vertexShader-1.glsl?raw';
import PortalRingMaterialfragmentShader2 from '../../shaders/scenes/particles/PortalRingMaterial/PortalRingMaterial-fragmentShader-2.glsl?raw';
import globalUniformsGLSL from '../../shaders/chunks/globalUniformsGLSL.glsl?raw';
import matrixFunctions from '../../shaders/chunks/matrix.glsl?raw';
import falloffFunctions from '../../shaders/chunks/falloffFunctions.glsl?raw';
import rotationMatrices from '../../shaders/chunks/rotation.glsl?raw';
import sineNoise from '../../shaders/chunks/sine-noise.glsl?raw';
import { composeShader } from '../../engine/shaders/compose-shader.ts';
import { ShaderMaterial, Color } from 'three';
import { runtime } from '../../engine/rendering/runtime.ts';
class PortalRingMaterial extends ShaderMaterial {
  constructor() {
    super({
      uniformsGroups: [runtime.UBO],
      uniforms: {
        tMap: {
          value: null,
        },
        tGlow: {
          value: null,
        },
        uAlpha: {
          value: 1,
        },
        uColor1: {
          value: new Color('#6a6f7d'),
        },
        uColor2: {
          value: new Color('#e1e6f1'),
        },
      },
      vertexShader: composeShader(PortalRingMaterialvertexShader1, {
        globalUniformsGLSL: globalUniformsGLSL,
        matrixFunctions: matrixFunctions,
        falloffFunctions: falloffFunctions,
        rotationMatrices: rotationMatrices,
      }),
      fragmentShader: composeShader(PortalRingMaterialfragmentShader2, {
        globalUniformsGLSL: globalUniformsGLSL,
        falloffFunctions: falloffFunctions,
        sineNoise: sineNoise,
      }),
    });
  }
}
export { PortalRingMaterial };
