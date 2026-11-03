// Reconstructed application source. Third-party implementations are npm imports.
import DetailLightShaftvertexShader1 from '../../shaders/scenes/detail/DetailLightShaft/DetailLightShaft-vertexShader-1.glsl?raw';
import DetailLightShaftfragmentShader2 from '../../shaders/scenes/detail/DetailLightShaft/DetailLightShaft-fragmentShader-2.glsl?raw';
import globalUniformsGLSL from '../../shaders/chunks/globalUniformsGLSL.glsl?raw';
import rotateUv from '../../shaders/chunks/rotate-uv.glsl?raw';
import { composeShader } from '../../engine/shaders/compose-shader.ts';
import { PlaneGeometry, Mesh, ShaderMaterial, Color, AdditiveBlending } from 'three';
import { runtime } from '../../engine/rendering/runtime.ts';
import { textures } from '../../engine/loaders/textures.js';
class DetailLightShaft {
  constructor(scene, t) {
    this.options = {
      ...t,
    };
    this.scene = scene;
    this.ready = new Promise((isReady) => {
      this.isReady = isReady;
    });
    this.index = this.options.index;
    this.init();
  }
  init() {
    const e = new PlaneGeometry(1, 1);
    this.mesh = new Mesh(
      e,
      new ShaderMaterial({
        uniformsGroups: [runtime.UBO],
        uniforms: {
          tMap: {
            value: textures.load('perlin-datatexture.png', 'srgb-repeat'),
          },
          uColor: {
            value: new Color('#d1e3ff'),
          },
        },
        vertexShader: composeShader(DetailLightShaftvertexShader1, {
          globalUniformsGLSL: globalUniformsGLSL,
        }),
        fragmentShader: composeShader(DetailLightShaftfragmentShader2, {
          globalUniformsGLSL: globalUniformsGLSL,
          rotateUv: rotateUv,
        }),
        transparent: true,
        blending: AdditiveBlending,
      }),
    );
    this.mesh.name = 'lightshaft';
    this.mesh.frustumCulled = false;
    this.mesh.position.set(1.67, 0.79, 0);
    this.mesh.scale.set(1.5, 3, 1);
    this.mesh.rotation.z = (-40 * 3.14) / 180;
    this.mesh.onBeforeRender = () => {};
    this.scene.add(this.mesh);
    this.isReady();
  }
}
export { DetailLightShaft };
