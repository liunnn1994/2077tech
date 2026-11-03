// Reconstructed application source. Third-party implementations are npm imports.
import SkyDomevertexShader1 from '../../shaders/scenes/landscape/SkyDome/SkyDome-vertexShader-1.glsl?raw';
import SkyDomefragmentShader2 from '../../shaders/scenes/landscape/SkyDome/SkyDome-fragmentShader-2.glsl?raw';
import globalUniformsGLSL from '../../shaders/chunks/globalUniformsGLSL.glsl?raw';
import { composeShader } from '../../engine/shaders/compose-shader.ts';
import { SphereGeometry, ShaderMaterial, Color, BackSide, Mesh } from 'three';
import { runtime } from '../../engine/rendering/runtime.ts';
class SkyDome {
  constructor(scene) {
    this.scene = scene;
    this.ready = new Promise((isReady) => {
      this.isReady = isReady;
    });
    this.init();
  }
  init() {
    const e = new SphereGeometry(800, 12, 12),
      t = new ShaderMaterial({
        uniformsGroups: [runtime.UBO],
        uniforms: {
          uColor1: {
            value: new Color('#d1d6e3'),
          },
          uColor2: {
            value: new Color('#afb6c7'),
          },
          uIntroColor: {
            value: new Color('#b3bac9'),
          },
          uProgress: {
            value: 0,
          },
        },
        vertexShader: composeShader(SkyDomevertexShader1, {
          globalUniformsGLSL: globalUniformsGLSL,
        }),
        fragmentShader: composeShader(SkyDomefragmentShader2, {
          globalUniformsGLSL: globalUniformsGLSL,
        }),
        side: BackSide,
      });
    this.mesh = new Mesh(e, t);
    this.mesh.name = 'sky';
    this.mesh.scale.x = -1;
    this.mesh.rotation.x = (16 * 3.14) / 180;
    this.mesh.rotation.z = (-16 * 3.14) / 180;
    this.mesh.updateMatrixWorld(true);
    this.mesh.matrixAutoUpdate = false;
    this.mesh.receiveShadow = false;
    this.mesh.castShadow = false;
    this.scene.add(this.mesh);
    this.isReady();
  }
}
export { SkyDome };
