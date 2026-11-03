// Reconstructed application source. Third-party implementations are npm imports.
import createMsdfMaterialchunk1 from '../../shaders/engine/text/msdf-material/createMsdfMaterial-chunk-1.glsl?raw';
import createMsdfMaterialchunk2 from '../../shaders/engine/text/msdf-material/createMsdfMaterial-chunk-2.glsl?raw';
import falloffFunctions from '../../shaders/chunks/falloffFunctions.glsl?raw';
import msdfFunctions from '../../shaders/chunks/msdfFunctions.glsl?raw';
import { composeShader } from '../shaders/compose-shader.ts';
import { ShaderMaterial, Color, Vector2 } from 'three';
import { textures } from '../loaders/textures.js';
function createMsdfMaterial(i, e) {
  return new ShaderMaterial({
    ...e,
    depthWrite: typeof e.depthWrite < 'u' ? e.depthWrite : false,
    transparent: typeof e.transparent < 'u' ? e.transparent : true,
    defines: {
      OUTLINE: (e.defines && e.defines.OUTLINE) || false,
      ANIMATION_MASK: (e.defines && e.defines.ANIMATION_MASK) || false,
      ANIMATION_TRANSLATE: (e.defines && e.defines.ANIMATION_TRANSLATE) || false,
    },
    uniforms: {
      tMap: {
        value: textures.load(`../fonts/${i}-datatexture.ktx2`, 'data'),
      },
      uColor: {
        value: new Color('#ffffff'),
      },
      uAlpha: {
        value: 1,
      },
      uOutlineWidth: {
        value: 0.05,
      },
      uAnimationOrder: {
        value: 0,
      },
      uAnimationDirection: {
        value: new Vector2(0, e.defines && e.defines.ANIMATION_TRANSLATE ? -1 : 1),
      },
      uAnimationAmount: {
        value: 1,
      },
      uAnimationMargin: {
        value: e.animationMargin || 0.5,
      },
      uAnimationProgress: {
        value: 0,
      },
      ...e.uniforms,
    },
    vertexShader:
      e.vertexShader ||
      composeShader(createMsdfMaterialchunk1, {
        falloffFunctions: falloffFunctions,
      }),
    fragmentShader:
      e.fragmentShader ||
      composeShader(createMsdfMaterialchunk2, {
        msdfFunctions: msdfFunctions,
        falloffFunctions: falloffFunctions,
      }),
  });
}
export { createMsdfMaterial };
