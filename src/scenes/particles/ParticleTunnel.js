// Reconstructed application source. Third-party implementations are npm imports.
import ParticleTunnelvertexShader1 from '../../shaders/scenes/particles/ParticleTunnel/ParticleTunnel-vertexShader-1.glsl?raw';
import ParticleTunnelfragmentShader2 from '../../shaders/scenes/particles/ParticleTunnel/ParticleTunnel-fragmentShader-2.glsl?raw';
import globalUniformsGLSL from '../../shaders/chunks/globalUniformsGLSL.glsl?raw';
import falloffFunctions from '../../shaders/chunks/falloffFunctions.glsl?raw';
import { composeShader } from '../../engine/shaders/compose-shader.ts';
import { CylinderGeometry, ShaderMaterial, AdditiveBlending, Mesh } from 'three';
import { runtime } from '../../engine/rendering/runtime.ts';
import { textures } from '../../engine/loaders/textures.js';
class ParticleTunnel {
  constructor(scene) {
    this.scene = scene;
    this.ready = new Promise((isReady) => {
      this.isReady = isReady;
    });
    this.init();
  }
  init() {
    const t = new CylinderGeometry(1.3, 1.3, 9, 64, 32, true);
    t.translate(0, -9 * 0.5, 0);
    t.scale(-1, 1, 1);
    const s = new ShaderMaterial({
      uniformsGroups: [runtime.UBO],
      uniforms: {
        tWind: {
          value: textures.load('wind_noise.ktx2', 'linear-repeat'),
        },
      },
      vertexShader: composeShader(ParticleTunnelvertexShader1, {
        globalUniformsGLSL: globalUniformsGLSL,
      }),
      fragmentShader: composeShader(ParticleTunnelfragmentShader2, {
        globalUniformsGLSL: globalUniformsGLSL,
        falloffFunctions: falloffFunctions,
      }),
      transparent: true,
      blending: AdditiveBlending,
    });
    this.mesh = new Mesh(t, s);
    this.mesh.name = 'tunnel';
    this.mesh.renderOrder = 1;
    this.mesh.position.y = 1;
    this.mesh.updateMatrixWorld(true);
    this.mesh.visible = false;
    this.mesh.receiveShadow = false;
    this.mesh.castShadow = false;
    this.scene.add(this.mesh);
    this.isReady();
  }
  update() {
    const e = this.scene.timelineAdditional.upRotation * 0.65;
    this.mesh.rotation.y = e;
    this.mesh.rotation.y = e;
  }
}
export { ParticleTunnel };
