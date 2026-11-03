// Reconstructed application source. Third-party implementations are npm imports.
import ParticleColorMaterialvertexShader1 from '../../shaders/scenes/particles/ParticleColorMaterial/ParticleColorMaterial-vertexShader-1.glsl?raw';
import ParticleColorMaterialfragmentShader2 from '../../shaders/scenes/particles/ParticleColorMaterial/ParticleColorMaterial-fragmentShader-2.glsl?raw';
import globalUniformsGLSL from '../../shaders/chunks/globalUniformsGLSL.glsl?raw';
import sineNoise from '../../shaders/chunks/sine-noise.glsl?raw';
import noiseTextureLookup from '../../shaders/chunks/noise-lookup.glsl?raw';
import hsvConversion from '../../shaders/chunks/hsv.glsl?raw';
import easingFunctions_Rc from '../../shaders/chunks/easing.glsl?raw';
import { composeShader } from '../../engine/shaders/compose-shader.ts';
import { ShaderMaterial, Vector2, Vector3 } from 'three';
import { runtime } from '../../engine/rendering/runtime.ts';
import { textures } from '../../engine/loaders/textures.js';
import { events } from '../../engine/core/events.ts';
class ParticleColorMaterial extends ShaderMaterial {
  constructor() {
    super({
      uniformsGroups: [runtime.UBO],
      uniforms: {
        tDiffuse: {
          value: null,
        },
        tBlue: {
          value: textures.load('noises/blue-8-128-rgb.ktx2', 'data-repeat'),
        },
        tScroll: {
          value: textures.load('scroll-datatexture.ktx2', 'data-repeat'),
        },
        uBlueOffset: {
          value: new Vector2(),
        },
        uGradientAlpha: {
          value: 0,
        },
        uRingProximity: {
          value: 0,
        },
        uSquareAttr: {
          value: new Vector3(),
        },
      },
      vertexShader: composeShader(ParticleColorMaterialvertexShader1, {
        globalUniformsGLSL: globalUniformsGLSL,
      }),
      fragmentShader: composeShader(ParticleColorMaterialfragmentShader2, {
        globalUniformsGLSL: globalUniformsGLSL,
        sineNoise: sineNoise,
        noiseTextureLookup: noiseTextureLookup,
        hsvConversion: hsvConversion,
        easingFunctions_Rc: easingFunctions_Rc,
      }),
    });
    events.on('webgl_render', () => {
      this.uniforms.uBlueOffset.value.set(Math.random() * 46.23, Math.random() * 12.5);
    });
  }
}
export { ParticleColorMaterial };
