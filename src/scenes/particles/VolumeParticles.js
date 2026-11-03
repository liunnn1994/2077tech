// Reconstructed application source. Third-party implementations are npm imports.
import VolumeParticlesvertexShader1 from '../../shaders/scenes/particles/VolumeParticles/VolumeParticles-vertexShader-1.glsl?raw';
import VolumeParticlesfragmentShader2 from '../../shaders/scenes/particles/VolumeParticles/VolumeParticles-fragmentShader-2.glsl?raw';
import VolumeParticlesvertexShader3 from '../../shaders/scenes/particles/VolumeParticles/VolumeParticles-vertexShader-3.glsl?raw';
import VolumeParticlesfragmentShader4 from '../../shaders/scenes/particles/VolumeParticles/VolumeParticles-fragmentShader-4.glsl?raw';
import globalUniformsGLSL from '../../shaders/chunks/globalUniformsGLSL.glsl?raw';
import antialiasedStep from '../../shaders/chunks/antialiased-step.glsl?raw';
import fitFunctions from '../../shaders/chunks/fit.glsl?raw';
import rotationMatrices from '../../shaders/chunks/rotation.glsl?raw';
import linearStep from '../../shaders/chunks/linear-step.glsl?raw';
import frameRateInterpolation from '../../shaders/chunks/frame-rate.glsl?raw';
import pcgHash from '../../shaders/chunks/pcg-hash.glsl?raw';
import { composeShader } from '../../engine/shaders/compose-shader.ts';
import { FluidSimulation } from '../../engine/fluid/fluid-simulation.js';
import { siteConfig } from '../../config/site-config.js';
import { VolumeInteractionAudio } from './VolumeInteractionAudio.js';
import { textures } from '../../engine/loaders/textures.js';
import { math } from '../../engine/core/math.js';
import {
  DataTexture,
  RGBAFormat,
  FloatType,
  Vector3,
  ShaderMaterial,
  Color,
  CustomBlending,
  AddEquation,
  SrcColorFactor,
  SrcAlphaFactor,
  Matrix4,
} from 'three';
import { createGpuParticles } from '../../engine/particles/gpu-particles.js';
import { runtime } from '../../engine/rendering/runtime.ts';
import { VolumeSelector } from './ui/VolumeSelector.js';
import { environment } from '../../engine/core/environment.ts';
import { frameClock } from '../../engine/core/frame-clock.ts';
import { events } from '../../engine/core/events.ts';
import { pointerInput } from '../../engine/input/pointer-input.js';
class VolumeParticles {
  constructor(scene) {
    this.scene = scene;
    this.ready = new Promise((isReady) => {
      this.isReady = isReady;
    });
    this.cubeSize = 0.65;
    this.particles = 150 * 1e3;
    this.fluidSim = new FluidSimulation({
      borders: false,
      simRes: 128,
      dyeRes: 128,
      curlStrength: 0,
      splatRadius: 0.22,
      splatForce: 35,
      pressureIterations: 2,
      densityDissipation: 0.88,
      velocityDissipation: 0.98,
      pressureDissipation: 0.86,
      splatRadiusVelocity: false,
      renderEvent: false,
    });
    this.fluidSim.disable();
    this.currentLink = 0;
    this.vdbs = [];
    this.vdbScales = siteConfig.links.map((t) => t.scale);
    this.soundControl = new VolumeInteractionAudio(this);
    this.init();
  }
  async init() {
    const e = await textures.load(`volumes/${siteConfig.links[0].vdb}.ktx2`, '3d-data');
    this.vdbs.push(e);
    for (let l = 1; l < siteConfig.links.length; l++)
      this.vdbs.push(textures.load(`volumes/${siteConfig.links[l].vdb}.ktx2`, '3d-data'));
    const t = math.getTextureSizeParticles(this.particles),
      s = new Float32Array(t * t * 4);
    for (let l = 0; l < this.particles; l++) {
      s[l * 4 + 0] = math.fit(Math.random(), 0, 1, -this.cubeSize * 0.5, this.cubeSize * 0.5);
      s[l * 4 + 1] = math.fit(Math.random(), 0, 1, -this.cubeSize * 0.5, this.cubeSize * 0.5);
      s[l * 4 + 2] = math.fit(Math.random(), 0, 1, -this.cubeSize * 0.5, this.cubeSize * 0.5);
      s[l * 4 + 3] = Math.random();
    }
    const n = new DataTexture(s, t, t, RGBAFormat, FloatType);
    n.needsUpdate = true;
    const r = new DataTexture(new Float32Array(t * t * 4), t, t, RGBAFormat, FloatType);
    r.needsUpdate = true;
    const a = new DataTexture(s.slice(), t, t, RGBAFormat, FloatType);
    a.needsUpdate = true;
    const o = new Vector3(-0.75, 1, -0.1);
    this.mesh = new createGpuParticles(
      {
        count: this.particles,
        geometry: 'points',
        material: new ShaderMaterial({
          uniformsGroups: [runtime.UBO],
          uniforms: {
            tTexture1: {
              value: null,
            },
            tTexture2: {
              value: null,
            },
            uColorInitial: {
              value: new Color('#b5d5ff'),
            },
            uColorLight: {
              value: new Color('#bdc6d4'),
            },
            uColorDark: {
              value: new Color('#222b42'),
            },
            uColorFast: {
              value: new Color('#d7ebfa'),
            },
            uSize: {
              value: 10,
            },
            uLightPos: {
              value: o,
            },
            uVisible: {
              value: 0,
            },
            uAlpha: {
              value: 1,
            },
            uInitialGlow: {
              value: 0,
            },
          },
          vertexShader: composeShader(VolumeParticlesvertexShader1, {
            globalUniformsGLSL: globalUniformsGLSL,
          }),
          fragmentShader: composeShader(VolumeParticlesfragmentShader2, {
            globalUniformsGLSL: globalUniformsGLSL,
            antialiasedStep: antialiasedStep,
            fitFunctions: fitFunctions,
            rotationMatrices: rotationMatrices,
            linearStep: linearStep,
          }),
          depthTest: true,
          depthWrite: true,
          transparent: true,
          blending: CustomBlending,
          blendEquation: AddEquation,
          blendDst: SrcColorFactor,
          blendSrc: SrcAlphaFactor,
        }),
      },
      {
        textures: 2,
        initialTextures: [n, r],
        material: new ShaderMaterial({
          uniformsGroups: [runtime.UBO],
          uniforms: {
            tTexture1: {
              value: null,
            },
            tTexture2: {
              value: null,
            },
            tOrig: {
              value: a,
            },
            tVel: this.fluidSim.velUniform,
            uViewMatrix: {
              value: new Matrix4(),
            },
            uModelMatrix: {
              value: new Matrix4(),
            },
            uProjMatrix: {
              value: new Matrix4(),
            },
            uRotation: {
              value: 0,
            },
            uCubeSize: {
              value: this.cubeSize,
            },
            tVolume: {
              value: this.vdbs[this.currentLink],
            },
            uVolumeScale: {
              value: this.vdbScales[0],
            },
            uLightPos: {
              value: o,
            },
            uInteractForce: {
              value: 1,
            },
            uAdditionalNoise: {
              value: 0,
            },
            uShowNoise: {
              value: 0,
            },
          },
          vertexShader: VolumeParticlesvertexShader3,
          fragmentShader: composeShader(VolumeParticlesfragmentShader4, {
            globalUniformsGLSL: globalUniformsGLSL,
            frameRateInterpolation: frameRateInterpolation,
            pcgHash: pcgHash,
            rotationMatrices: rotationMatrices,
          }),
        }),
      },
    );
    this.mesh.name = 'volume particles';
    this.mesh.position.set(0, -9.785, 0);
    this.mesh.updateMatrixWorld();
    this.scene.add(this.mesh);
    this.initializeShape();
    this.UI = new VolumeSelector(this);
    await this.UI.ready;
    if (environment.devScene) this.UI.enable();
    this.scene.beforeRenderCbs.push(this.update.bind(this));
    this.isReady();
  }
  initializeShape() {
    let e = 0;
    const t = () => {
      e += frameClock.delta;
      this.mesh.compute(void 0, this.scene, this.scene.camera);
      if (e > 1e3) {
        events.off('webgl_prerender', t);
        this.mesh.material.uniforms.uVisible.value = 1;
      }
    };
    events.on('webgl_prerender', t);
  }
  update() {
    var e, t;
    if (
      (this.fluidSim.points[0].position.copy(pointerInput.get(0).position01),
      this.fluidSim._update(frameClock.time, frameClock.delta),
      (this.mesh.computationMaterial.uniforms.uRotation.value -= frameClock.delta * 75e-5),
      !environment.devScene)
    ) {
      const s = math.smoothstep(0.45, 0.65, this.scene.progress),
        n = 1 - math.smoothstep(0.8, 0.93, this.scene.progress);
      this.mesh.computationMaterial.uniforms.uInteractForce.value = s * n;
      if (!((e = this.soundControl) == null)) e.update(s * n);
    }
    if (!((t = this.UI) == null)) t.update();
  }
}
export { VolumeParticles };
