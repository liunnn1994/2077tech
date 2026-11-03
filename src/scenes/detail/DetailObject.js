// Reconstructed application source. Third-party implementations are npm imports.
import DetailObjectvertexShader1 from '../../shaders/scenes/detail/DetailObject/DetailObject-vertexShader-1.glsl?raw';
import DetailObjectfragmentShader2 from '../../shaders/scenes/detail/DetailObject/DetailObject-fragmentShader-2.glsl?raw';
import globalUniformsGLSL from '../../shaders/chunks/globalUniformsGLSL.glsl?raw';
import rotateUv from '../../shaders/chunks/rotate-uv.glsl?raw';
import { composeShader } from '../../engine/shaders/compose-shader.ts';
import { geometries } from '../../engine/loaders/geometries.js';
import { Mesh, ShaderMaterial } from 'three';
import { runtime } from '../../engine/rendering/runtime.ts';
import { textures } from '../../engine/loaders/textures.js';
import { environment } from '../../engine/core/environment.ts';
import { frameClock } from '../../engine/core/frame-clock.ts';
class DetailObject {
  constructor(scene, t) {
    this.options = {
      index: 0,
      obj: 'pudgy',
      scale: 1,
      rand: Math.random(),
      ...t,
    };
    this.scene = scene;
    this.ready = new Promise((isReady) => {
      this.isReady = isReady;
    });
    this.index = this.options.index;
    this.additionalRotationAmount = {
      value: 0,
    };
    this.init();
  }
  async init() {
    const e = await geometries.load(`${this.options.obj}.drc`);
    this.mesh = new Mesh(
      e,
      new ShaderMaterial({
        uniformsGroups: [runtime.UBO],
        uniforms: {
          tMap: {
            value: textures.load(`${this.options.obj}_dark_color.ktx2`),
          },
          tNoise: {
            value: textures.load('perlin-datatexture.ktx2', 'srgb-repeat'),
          },
          tCaustics: {
            value: textures.load('caustics.ktx2', 'srgb-repeat'),
          },
        },
        vertexShader: composeShader(DetailObjectvertexShader1, {
          globalUniformsGLSL: globalUniformsGLSL,
        }),
        fragmentShader: composeShader(DetailObjectfragmentShader2, {
          globalUniformsGLSL: globalUniformsGLSL,
          rotateUv: rotateUv,
        }),
      }),
    );
    this.mesh.name = 'object';
    this.mesh.frustumCulled = false;
    this.mesh.scale.setScalar(this.options.scale);
    if (environment.devScene) this.mesh.visible = this.index === 0;
    this.mesh.onBeforeRender = () => {
      const s = 0.035 * this.additionalRotationAmount.value,
        n =
          Math.sin(frameClock.time * 0.3 + this.options.rand * 12.423) *
          s *
          Math.sign(this.options.rand - 0.5),
        r =
          Math.sin(frameClock.time * 0.3 + this.options.rand * 42.987) *
          s *
          Math.sign(this.options.rand - 0.5),
        a =
          Math.sin(frameClock.time * 0.3 + this.options.rand * 2.53) *
          s *
          Math.sign(this.options.rand - 0.5);
      this.mesh.rotation.set(n, r, a);
    };
    this.scene.add(this.mesh);
    this.isReady();
  }
}
export { DetailObject };
