// Reconstructed application source. Third-party implementations are npm imports.
import LandscapeSmokevertexShader1 from '../../shaders/scenes/landscape/LandscapeSmoke/LandscapeSmoke-vertexShader-1.glsl?raw';
import LandscapeSmokefragmentShader2 from '../../shaders/scenes/landscape/LandscapeSmoke/LandscapeSmoke-fragmentShader-2.glsl?raw';
import globalUniformsGLSL from '../../shaders/chunks/globalUniformsGLSL.glsl?raw';
import { composeShader } from '../../engine/shaders/compose-shader.ts';
import { PlaneGeometry, ShaderMaterial, Mesh } from 'three';
import { textures } from '../../engine/loaders/textures.js';
import { runtime } from '../../engine/rendering/runtime.ts';
class LandscapeSmoke {
  constructor(scene) {
    this.scene = scene;
    this.ready = new Promise((isReady) => {
      this.isReady = isReady;
    });
    this.init();
  }
  init() {
    const e = new PlaneGeometry(20, 5),
      t = textures.load('wind_noise.ktx2', 'srgb-repeat'),
      s = new ShaderMaterial({
        uniformsGroups: [runtime.UBO],
        uniforms: {
          tWind: {
            value: t,
          },
          uAlpha: {
            value: 1,
          },
        },
        vertexShader: composeShader(LandscapeSmokevertexShader1, {
          globalUniformsGLSL: globalUniformsGLSL,
        }),
        fragmentShader: composeShader(LandscapeSmokefragmentShader2, {
          globalUniformsGLSL: globalUniformsGLSL,
        }),
        transparent: true,
      });
    this.mesh1 = new Mesh(e, s);
    this.mesh1.name = 'smoke1';
    this.mesh1.position.set(-5, 1.25, -10);
    this.mesh1.renderOrder = 2;
    this.mesh2 = new Mesh(e, s);
    this.mesh2.name = 'smoke2';
    this.mesh2.position.set(13.45, 3, -4);
    this.mesh2.rotation.y = (-10 * 3.14) / 180;
    this.mesh2.renderOrder = 2;
    this.mesh1.updateMatrixWorld(true);
    this.mesh2.updateMatrixWorld(true);
    this.mesh1.matrixAutoUpdate = false;
    this.mesh2.matrixAutoUpdate = false;
    this.mesh1.receiveShadow = false;
    this.mesh1.castShadow = false;
    this.mesh2.receiveShadow = false;
    this.mesh2.castShadow = false;
    this.scene.add(this.mesh1);
    this.scene.add(this.mesh2);
    this.isReady();
  }
}
export { LandscapeSmoke };
