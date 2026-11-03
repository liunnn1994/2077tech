// Reconstructed application source. Third-party implementations are npm imports.
import OutlineLineMaterialchunk1 from '../../shaders/scenes/landscape/OutlineLineMaterial/OutlineLineMaterial-chunk-1.glsl?raw';
import OutlineLineMaterialchunk2 from '../../shaders/scenes/landscape/OutlineLineMaterial/OutlineLineMaterial-chunk-2.glsl?raw';
import OutlineLineMaterialchunk3 from '../../shaders/scenes/landscape/OutlineLineMaterial/OutlineLineMaterial-chunk-3.glsl?raw';
import globalUniformsGLSL from '../../shaders/chunks/globalUniformsGLSL.glsl?raw';
import falloffFunctions from '../../shaders/chunks/falloffFunctions.glsl?raw';
import { composeShader } from '../../engine/shaders/compose-shader.ts';
import { LineBasicMaterial } from 'three';
import { runtime } from '../../engine/rendering/runtime.ts';
class OutlineLineMaterial extends LineBasicMaterial {
  constructor() {
    super();
    this.uniforms = {
      uniformsGroups: [runtime.UBO],
      uProgress: {
        value: 1,
      },
      uAlpha: {
        value: 1,
      },
      uScrollAlpha: {
        value: 0,
      },
      uIntroMaterialize: {
        value: 0,
      },
    };
    this.onBeforeCompile = (e) => {
      e.uniforms = {
        ...e.uniforms,
        ...this.uniforms,
      };
      e.vertexShader = composeShader(OutlineLineMaterialchunk1, {
        baseShader0: e.vertexShader,
      });
      e.vertexShader = e.vertexShader.replace(
        '#include <skinning_vertex>',
        `
                vColor = color;
                vCentr = centr;
                vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
            `,
      );
      e.fragmentShader = composeShader(OutlineLineMaterialchunk2, {
        globalUniformsGLSL: globalUniformsGLSL,
        falloffFunctions: falloffFunctions,
        baseShader2: e.fragmentShader,
      });
      e.fragmentShader = e.fragmentShader.replace(
        '#include <dithering_fragment>',
        OutlineLineMaterialchunk3,
      );
    };
  }
}
export { OutlineLineMaterial };
