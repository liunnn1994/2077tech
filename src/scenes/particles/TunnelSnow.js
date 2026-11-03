// Reconstructed application source. Third-party implementations are npm imports.
import TunnelSnowvertexShader1 from '../../shaders/scenes/particles/TunnelSnow/TunnelSnow-vertexShader-1.glsl?raw';
import TunnelSnowfragmentShader2 from '../../shaders/scenes/particles/TunnelSnow/TunnelSnow-fragmentShader-2.glsl?raw';
import globalUniformsGLSL from '../../shaders/chunks/globalUniformsGLSL.glsl?raw';
import treadmill from '../../shaders/chunks/treadmill.glsl?raw';
import falloffFunctions from '../../shaders/chunks/falloffFunctions.glsl?raw';
import { composeShader } from '../../engine/shaders/compose-shader.ts';
import {
  BufferGeometry,
  Float32BufferAttribute,
  ShaderMaterial,
  AdditiveBlending,
  Points,
} from 'three';
import { runtime } from '../../engine/rendering/runtime.ts';
class TunnelSnow {
  constructor(scene) {
    this.options = {
      count: 200,
      shape: 'box',
      scale: [3, 8, 3],
      center: [0, 0, 0],
      generateRandomBuffer: true,
    };
    this.scene = scene;
    this.ready = new Promise((isReady) => {
      this.isReady = isReady;
    });
    this.init();
  }
  init() {
    const { count: e, scale: t, center: s, generateRandomBuffer: n } = this.options;
    let r = 0;
    const a = [],
      o = [];
    for (r = 0; r < e; r++) {
      const h = Math.random() * t[0] - t[0] * 0.5 + s[0],
        d = Math.random() * t[1] - t[1] * 0.5 + s[1],
        u = Math.random() * t[2] - t[2] * 0.5 + s[2];
      a.push(h, d, u);
      if (n) o.push(Math.random(), Math.random(), Math.random());
    }
    const l = new BufferGeometry();
    l.setAttribute('position', new Float32BufferAttribute(a, 3));
    if (n) l.setAttribute('random', new Float32BufferAttribute(o, 3));
    const c = new ShaderMaterial({
      uniformsGroups: [runtime.UBO],
      uniforms: {
        uAlpha: {
          value: 1,
        },
      },
      vertexShader: composeShader(TunnelSnowvertexShader1, {
        globalUniformsGLSL: globalUniformsGLSL,
        treadmill: treadmill,
      }),
      fragmentShader: composeShader(TunnelSnowfragmentShader2, {
        globalUniformsGLSL: globalUniformsGLSL,
        falloffFunctions: falloffFunctions,
      }),
      transparent: true,
      blending: AdditiveBlending,
      depthTest: false,
      depthWrite: false,
    });
    this.mesh = new Points(l, c);
    this.mesh.name = 'particles';
    this.mesh.renderOrder = 1;
    this.mesh.position.y -= 3.5;
    this.mesh.updateMatrixWorld(true);
    this.mesh.matrixAutoUpdate = false;
    this.mesh.receiveShadow = false;
    this.mesh.castShadow = false;
    this.mesh.frustumCulled = false;
    this.scene.add(this.mesh);
    this.isReady();
  }
}
export { TunnelSnow };
