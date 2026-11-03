// Reconstructed application source. Third-party implementations are npm imports.
import CageLineMaterialchunk1 from '../../shaders/scenes/landscape/CageLineMaterial/CageLineMaterial-chunk-1.glsl?raw';
import CageLineMaterialchunk2 from '../../shaders/scenes/landscape/CageLineMaterial/CageLineMaterial-chunk-2.glsl?raw';
import CageLineMaterialchunk3 from '../../shaders/scenes/landscape/CageLineMaterial/CageLineMaterial-chunk-3.glsl?raw';
import globalUniformsGLSL from '../../shaders/chunks/globalUniformsGLSL.glsl?raw';
import falloffFunctions from '../../shaders/chunks/falloffFunctions.glsl?raw';
import { composeShader } from '../../engine/shaders/compose-shader.ts';
import { LineBasicMaterial } from 'three';
import { runtime } from '../../engine/rendering/runtime.ts';
let CageLineMaterial = class extends LineBasicMaterial {
  constructor() {
    super();
    this.uniforms = {
      uniformsGroups: [runtime.UBO],
      uProgress: {
        value: 1,
      },
      uAlpha: {
        value: 0.185,
      },
    };
    this.onBeforeCompile = (e) => {
      e.uniforms = {
        ...e.uniforms,
        ...this.uniforms,
      };
      e.vertexShader = composeShader(CageLineMaterialchunk1, {
        baseShader0: e.vertexShader,
      });
      e.vertexShader = e.vertexShader.replace(
        '#include <skinning_vertex>',
        `
                vColor = color;
                vCentr = centr;
                vWorldPos = (modelMatrix * vec4(centr, 1.0)).xyz;
            `,
      );
      e.fragmentShader = composeShader(CageLineMaterialchunk2, {
        globalUniformsGLSL: globalUniformsGLSL,
        falloffFunctions: falloffFunctions,
        baseShader2: e.fragmentShader,
      });
      e.fragmentShader = e.fragmentShader.replace(
        '#include <dithering_fragment>',
        CageLineMaterialchunk3,
      );
    };
  }
};
export { CageLineMaterial };
