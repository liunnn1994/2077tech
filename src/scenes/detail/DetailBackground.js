// Reconstructed application source. Third-party implementations are npm imports.
import DetailBackgroundvertexShader1 from '../../shaders/scenes/detail/DetailBackground/DetailBackground-vertexShader-1.glsl?raw';
import DetailBackgroundfragmentShader2 from '../../shaders/scenes/detail/DetailBackground/DetailBackground-fragmentShader-2.glsl?raw';
import globalUniformsGLSL from '../../shaders/chunks/globalUniformsGLSL.glsl?raw';
import rotateUv from '../../shaders/chunks/rotate-uv.glsl?raw';
import { composeShader } from '../../engine/shaders/compose-shader.ts';
import { Mesh, ShaderMaterial, Color, AdditiveBlending } from 'three';
import { geometryUtils } from '../../engine/geometry/shared.js';
import { runtime } from '../../engine/rendering/runtime.ts';
import { textures } from '../../engine/loaders/textures.js';
class DetailBackground {
  constructor(scene) {
    this.scene = scene;
    this.ready = new Promise((isReady) => {
      this.isReady = isReady;
    });
    this.init();
  }
  init() {
    this.mesh = new Mesh(
      geometryUtils.triangle,
      new ShaderMaterial({
        uniformsGroups: [runtime.UBO],
        uniforms: {
          uColor1: {
            value: new Color('#09121f'),
          },
          uColor2: {
            value: new Color('#6b7685'),
          },
          tNoise: {
            value: textures.load('wind_noise.ktx2', 'colordata-repeat'),
          },
          uRotation: {
            value: -0.66,
          },
        },
        vertexShader: composeShader(DetailBackgroundvertexShader1, {
          globalUniformsGLSL: globalUniformsGLSL,
        }),
        fragmentShader: composeShader(DetailBackgroundfragmentShader2, {
          globalUniformsGLSL: globalUniformsGLSL,
          rotateUv: rotateUv,
        }),
        depthWrite: false,
        depthTest: false,
        transparent: true,
        blending: AdditiveBlending,
      }),
    );
    this.mesh.name = 'bg';
    this.mesh.updateMatrixWorld(true);
    this.mesh.matrixAutoUpdate = false;
    this.mesh.frustumCulled = false;
    this.mesh.onBeforeRender = () => {};
    this.mesh.renderOrder = -5;
    this.scene.add(this.mesh);
    this.isReady();
  }
}
export { DetailBackground };
