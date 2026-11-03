// Reconstructed application source. Third-party implementations are npm imports.
import SceneCompositeMaterialvertexShader1 from '../../shaders/engine/composition/SceneCompositeMaterial/SceneCompositeMaterial-vertexShader-1.glsl?raw';
import SceneCompositeMaterialfragmentShader2 from '../../shaders/engine/composition/SceneCompositeMaterial/SceneCompositeMaterial-fragmentShader-2.glsl?raw';
import globalUniformsGLSL from '../../shaders/chunks/globalUniformsGLSL.glsl?raw';
import fitFunctions from '../../shaders/chunks/fit.glsl?raw';
import falloffFunctions from '../../shaders/chunks/falloffFunctions.glsl?raw';
import easingFunctions_Rc from '../../shaders/chunks/easing.glsl?raw';
import noiseTextureLookup from '../../shaders/chunks/noise-lookup.glsl?raw';
import chromaticAberration from '../../shaders/chunks/chromatic-aberration.glsl?raw';
import { composeShader } from '../shaders/compose-shader.ts';
import { ShaderMaterial, Vector2 } from 'three';
import { runtime } from '../rendering/runtime.ts';
import { textures } from '../loaders/textures.js';
import { events } from '../core/events.ts';
class SceneCompositeMaterial extends ShaderMaterial {
  constructor() {
    super({
      uniformsGroups: [runtime.UBO],
      uniforms: {
        tScene1: {
          value: null,
        },
        tScene2: {
          value: null,
        },
        tScroll: {
          value: textures.load('scroll-datatexture.ktx2', 'colordata-repeat'),
        },
        uProgress: {
          value: 0,
        },
        uProgressVel: {
          value: 0,
        },
        tDetail: {
          value: null,
        },
        uInCubes: {
          value: false,
        },
        tCubes: {
          value: null,
        },
        uDetailProgress: {
          value: 0,
        },
        uDetailProgress2: {
          value: 0,
        },
        tFrost: {
          value: textures.load('frost-datatexture.ktx2', 'colordata-repeat'),
        },
        tBlue: {
          value: textures.load('noises/blue-8-128-rgb.ktx2', 'colordata-repeat'),
        },
        uBlueOffset: {
          value: new Vector2(),
        },
      },
      vertexShader: SceneCompositeMaterialvertexShader1,
      fragmentShader: composeShader(SceneCompositeMaterialfragmentShader2, {
        globalUniformsGLSL: globalUniformsGLSL,
        fitFunctions: fitFunctions,
        falloffFunctions: falloffFunctions,
        easingFunctions_Rc: easingFunctions_Rc,
        noiseTextureLookup: noiseTextureLookup,
        chromaticAberration: chromaticAberration,
      }),
      depthTest: false,
      depthWrite: false,
    });
    events.on('webgl_render', () => {
      this.uniforms.uBlueOffset.value.set(Math.random() * 10, Math.random() * 12.5);
    });
  }
}
export { SceneCompositeMaterial };
