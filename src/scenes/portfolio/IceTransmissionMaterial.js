import fragmentUniforms from '../../shaders/scenes/portfolio/IceTransmissionMaterial/IceTransmissionMaterial-chunk-1.glsl?raw';
import refractionFunctions from '../../shaders/scenes/portfolio/IceTransmissionMaterial/IceTransmissionMaterial-chunk-2.glsl?raw';
import chromaticRefraction from '../../shaders/scenes/portfolio/IceTransmissionMaterial/IceTransmissionMaterial-chunk-3.glsl?raw';
import vertexVaryings from '../../shaders/scenes/portfolio/IceTransmissionMaterial/IceTransmissionMaterial-chunk-4.glsl?raw';
import frostUniforms from '../../shaders/scenes/portfolio/IceTransmissionMaterial/IceTransmissionMaterial-chunk-5.glsl?raw';
import frostRoughness from '../../shaders/scenes/portfolio/IceTransmissionMaterial/IceTransmissionMaterial-chunk-6.glsl?raw';
import frostNormal from '../../shaders/scenes/portfolio/IceTransmissionMaterial/IceTransmissionMaterial-chunk-7.glsl?raw';
import frostEmission from '../../shaders/scenes/portfolio/IceTransmissionMaterial/IceTransmissionMaterial-chunk-8.glsl?raw';
import noiseTextureLookup from '../../shaders/chunks/noise-lookup.glsl?raw';
import fitFunctions from '../../shaders/chunks/fit.glsl?raw';
import curveFunctions from '../../shaders/chunks/curveFunctions.glsl?raw';
import { composeShader } from '../../engine/shaders/compose-shader.ts';
import { MeshPhysicalMaterial, Vector2, Color } from 'three';
import { textures } from '../../engine/loaders/textures.js';

/** Fail at the source edit if a future Three upgrade moves a patched chunk. */
function replaceShaderSection(source, marker, replacement) {
  if (source.split(marker).length !== 2) {
    throw new Error(`IceTransmissionMaterial: Three shader section changed: ${marker}`);
  }
  return source.replace(marker, replacement);
}

/**
 * Lit ice shell with the captured RGB refraction and UV-space frost feedback.
 *
 * The scene renders the inside/back faces into its own transmission texture.
 * `transmission` stays zero on the standard material to avoid a second Three
 * transmission pass; the application shader samples that explicit render target.
 */
class IceTransmissionMaterial extends MeshPhysicalMaterial {
  constructor(sampleCount = 5) {
    super();
    if (!Number.isInteger(sampleCount) || sampleCount < 1) {
      throw new RangeError('Ice refraction sampleCount must be a positive integer.');
    }
    this.name = 'Ice transmission and frost';
    // Defines are included in Three's program cache key, unlike a closure value.
    this.defines.AWESOME_SAMPLES = sampleCount;
    this.uniforms = {
      tTriangles: {
        value: textures.load('landscape/triangles_tiling.ktx2', 'srgb-repeat'),
      },
      tBlue: {
        value: textures.load('noises/blue-8-128-rgb.ktx2', 'colordata-repeat'),
      },
      uBlueOffset: {
        value: new Vector2(),
      },
      tMouseFrost: {
        value: null,
      },
      uColorFrost: {
        value: new Color('#83a1c5'),
      },
      uChromaticAberration: {
        value: 0.1,
      },
      uTransmission: {
        value: 1,
      },
      uThickness: {
        value: 2,
      },
      uAttenuationDistance: {
        value: 0,
      },
      uAttenuationColor: {
        value: new Color('#ffffff'),
      },
      uTransmissionSamplerSize: {
        value: new Vector2(),
      },
      tTransmissionSamplerMap: {
        value: null,
      },
      uResolution: {
        value: new Vector2(1, 1),
      },
    };
    this.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, this.uniforms);
      shader.fragmentShader = composeShader(fragmentUniforms, {
        noiseTextureLookup,
        baseShader1: shader.fragmentShader,
      });
      shader.fragmentShader = replaceShaderSection(
        shader.fragmentShader,
        '#include <transmission_pars_fragment>',
        refractionFunctions,
      );
      shader.fragmentShader = replaceShaderSection(
        shader.fragmentShader,
        '#include <transmission_fragment>',
        chromaticRefraction,
      );
      shader.vertexShader = replaceShaderSection(
        shader.vertexShader,
        '#include <uv_pars_vertex>',
        vertexVaryings,
      );
      shader.vertexShader = replaceShaderSection(
        shader.vertexShader,
        '#include <uv_vertex>',
        'vUv1 = uv1;\n#include <uv_vertex>',
      );
      // Do not rely on USE_ENVMAP or Three's USE_TRANSMISSION to declare
      // worldPosition: our own refraction also works without those features.
      shader.vertexShader = replaceShaderSection(
        shader.vertexShader,
        '#include <worldpos_vertex>',
        `#include <worldpos_vertex>
        vec4 iceWorldPosition = vec4( transformed, 1.0 );
        #ifdef USE_BATCHING
            iceWorldPosition = batchingMatrix * iceWorldPosition;
        #endif
        #ifdef USE_INSTANCING
            iceWorldPosition = instanceMatrix * iceWorldPosition;
        #endif
        vIceWorldPosition = ( modelMatrix * iceWorldPosition ).xyz;`,
      );
      shader.fragmentShader = replaceShaderSection(
        shader.fragmentShader,
        '#include <uv_pars_fragment>',
        composeShader(frostUniforms, {
          fitFunctions,
          curveFunctions,
        }),
      );
      shader.fragmentShader = replaceShaderSection(
        shader.fragmentShader,
        '#include <clipping_planes_fragment>',
        `vec2 mousefrostdata = texture2D( tMouseFrost, vUv1 ).rg;
        float mousefrost = mousefrostdata.r;
        float mousefrostrim = mousefrostdata.g;
        #include <clipping_planes_fragment>`,
      );
      shader.fragmentShader = replaceShaderSection(
        shader.fragmentShader,
        '#include <roughnessmap_fragment>',
        frostRoughness,
      );
      shader.fragmentShader = replaceShaderSection(
        shader.fragmentShader,
        '#include <normal_fragment_maps>',
        frostNormal,
      );
      shader.fragmentShader = replaceShaderSection(
        shader.fragmentShader,
        'vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;',
        frostEmission,
      );
    };
  }
}
export { IceTransmissionMaterial };
