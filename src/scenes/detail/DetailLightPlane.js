// Reconstructed application source. Third-party implementations are npm imports.
import DetailLightPlanevertexShader1 from '../../shaders/scenes/detail/DetailLightPlane/DetailLightPlane-vertexShader-1.glsl?raw';
import DetailLightPlanefragmentShader2 from '../../shaders/scenes/detail/DetailLightPlane/DetailLightPlane-fragmentShader-2.glsl?raw';
import globalUniformsGLSL from '../../shaders/chunks/globalUniformsGLSL.glsl?raw';
import rotateUv from '../../shaders/chunks/rotate-uv.glsl?raw';
import { composeShader } from '../../engine/shaders/compose-shader.ts';
import { PlaneGeometry, Mesh, ShaderMaterial, Color, AdditiveBlending } from 'three';
import { runtime } from '../../engine/rendering/runtime.ts';
import { textures } from '../../engine/loaders/textures.js';
import { frameClock } from '../../engine/core/frame-clock.ts';
class DetailLightPlane {
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
          tBokeh: {
            value: textures.load('bokeh.ktx2', 'srgb-repeat'),
          },
          uColor: {
            value: new Color('#d1e3ff'),
          },
        },
        vertexShader: composeShader(DetailLightPlanevertexShader1, {
          globalUniformsGLSL: globalUniformsGLSL,
        }),
        fragmentShader: composeShader(DetailLightPlanefragmentShader2, {
          globalUniformsGLSL: globalUniformsGLSL,
          rotateUv: rotateUv,
        }),
        transparent: true,
        blending: AdditiveBlending,
      }),
    );
    this.mesh.name = 'lightplane';
    this.mesh.frustumCulled = false;
    this.mesh.position.set(-2.05, -0.87, 1);
    this.mesh.scale.set(4, 4, 4);
    this.mesh.onBeforeRender = () => {
      this.mesh.position.x = -2.2 + Math.sin(frameClock.time * 0.3) * 0.2;
      this.mesh.position.y = -0.87 + Math.cos(frameClock.time * 0.24) * 0.2;
    };
    this.scene.add(this.mesh);
    this.isReady();
  }
}
export { DetailLightPlane };
