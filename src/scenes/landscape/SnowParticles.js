// Reconstructed application source. Third-party implementations are npm imports.
import SnowParticlesvertexShader1 from '../../shaders/scenes/landscape/SnowParticles/SnowParticles-vertexShader-1.glsl?raw';
import SnowParticlesfragmentShader2 from '../../shaders/scenes/landscape/SnowParticles/SnowParticles-fragmentShader-2.glsl?raw';
import SnowParticlesvertexShader3 from '../../shaders/scenes/landscape/SnowParticles/SnowParticles-vertexShader-3.glsl?raw';
import SnowParticlesfragmentShader4 from '../../shaders/scenes/landscape/SnowParticles/SnowParticles-fragmentShader-4.glsl?raw';
import globalUniformsGLSL from '../../shaders/chunks/globalUniformsGLSL.glsl?raw';
import antialiasedStep from '../../shaders/chunks/antialiased-step.glsl?raw';
import normalEncoding from '../../shaders/chunks/normal-encoding.glsl?raw';
import falloffFunctions from '../../shaders/chunks/falloffFunctions.glsl?raw';
import treadmill from '../../shaders/chunks/treadmill.glsl?raw';
import { composeShader } from '../../engine/shaders/compose-shader.ts';
import {
  Vector3,
  PlaneGeometry,
  DataTexture,
  RGBAFormat,
  FloatType,
  ShaderMaterial,
  Color,
  Matrix4,
} from 'three';
import { math } from '../../engine/core/math.js';
import { createGpuParticles } from '../../engine/particles/gpu-particles.js';
import { runtime } from '../../engine/rendering/runtime.ts';
class SnowParticles {
  constructor(scene, t) {
    this.scene = scene;
    this.ready = new Promise((isReady) => {
      this.isReady = isReady;
    });
    this.options = {
      count: 1200,
      ...t,
    };
    this.mousePosition = new Vector3();
    this.init();
  }
  init() {
    const e = new PlaneGeometry(0.075, 0.15),
      t = this.options.count,
      s = math.getTextureSizeParticles(t),
      n = new Float32Array(s * s * 4);
    for (let o = 0; o < t; o++) {
      n[o * 4 + 0] = Math.random() * 50 - 25;
      n[o * 4 + 1] = Math.random() * 20 - 10;
      n[o * 4 + 2] = Math.random() * 50 - 25;
      n[o * 4 + 3] = Math.random();
    }
    const r = new DataTexture(n, s, s, RGBAFormat, FloatType);
    r.needsUpdate = true;
    const a = new DataTexture(new Float32Array(s * s * 4), s, s, RGBAFormat, FloatType);
    a.needsUpdate = true;
    this.mesh = new createGpuParticles(
      {
        count: t,
        geometry: e,
        material: new ShaderMaterial({
          uniformsGroups: [runtime.UBO],
          uniforms: {
            tTexture1: {
              value: null,
            },
            tTexture2: {
              value: a,
            },
            uCount: {
              value: t,
            },
            uColor1: {
              value: new Color('#cda05e'),
            },
            uColor2: {
              value: new Color('#ab8349'),
            },
            uMousePos: {
              value: this.mousePosition,
            },
            uOutlineColor: {
              value: new Color('#904619'),
            },
            uAlpha: {
              value: 0,
            },
          },
          vertexShader: composeShader(SnowParticlesvertexShader1, {
            globalUniformsGLSL: globalUniformsGLSL,
          }),
          fragmentShader: composeShader(SnowParticlesfragmentShader2, {
            globalUniformsGLSL: globalUniformsGLSL,
            antialiasedStep: antialiasedStep,
            normalEncoding: normalEncoding,
            falloffFunctions: falloffFunctions,
          }),
          depthWrite: false,
          transparent: true,
        }),
      },
      {
        textures: 2,
        initialTextures: [r, a],
        material: new ShaderMaterial({
          uniformsGroups: [runtime.UBO],
          uniforms: {
            tTexture1: {
              value: null,
            },
            tTexture2: {
              value: null,
            },
            tVel: {
              value: null,
            },
            uViewMatrix: {
              value: new Matrix4(),
            },
            uModelMatrix: {
              value: new Matrix4(),
            },
            uProjMatrix: {
              value: new Matrix4(),
            },
          },
          vertexShader: SnowParticlesvertexShader3,
          fragmentShader: composeShader(SnowParticlesfragmentShader4, {
            globalUniformsGLSL: globalUniformsGLSL,
            treadmill: treadmill,
          }),
        }),
      },
    );
    this.mesh.name = 'snowparticles';
    this.mesh.renderOrder = 5;
    this.mesh.updateMatrixWorld();
    this.mesh.matrixAutoUpdate = false;
    this.mesh.frustumCulled = false;
    this.scene.add(this.mesh);
    this.isReady();
  }
}
export { SnowParticles };
