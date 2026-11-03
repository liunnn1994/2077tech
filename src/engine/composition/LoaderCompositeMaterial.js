// Reconstructed application source. Third-party implementations are npm imports.
import LoaderCompositeMaterialvertexShader1 from '../../shaders/engine/composition/LoaderCompositeMaterial/LoaderCompositeMaterial-vertexShader-1.glsl?raw';
import LoaderCompositeMaterialfragmentShader2 from '../../shaders/engine/composition/LoaderCompositeMaterial/LoaderCompositeMaterial-fragmentShader-2.glsl?raw';
import globalUniformsGLSL from '../../shaders/chunks/globalUniformsGLSL.glsl?raw';
import { composeShader } from '../shaders/compose-shader.ts';
import { ShaderMaterial, Color } from 'three';
import { runtime } from '../rendering/runtime.ts';
class LoaderCompositeMaterial extends ShaderMaterial {
  constructor() {
    super({
      uniformsGroups: [runtime.UBO],
      uniforms: {
        tScene: {
          value: null,
        },
        uColor: {
          value: new Color('#8b909d'),
        },
        uIntro: {
          value: 0,
        },
      },
      vertexShader: LoaderCompositeMaterialvertexShader1,
      fragmentShader: composeShader(LoaderCompositeMaterialfragmentShader2, {
        globalUniformsGLSL: globalUniformsGLSL,
      }),
      depthTest: false,
      depthWrite: false,
    });
  }
}
export { LoaderCompositeMaterial };
