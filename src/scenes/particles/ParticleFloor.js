// Reconstructed application source. Third-party implementations are npm imports.
import ParticleFloorvertexShader1 from '../../shaders/scenes/particles/ParticleFloor/ParticleFloor-vertexShader-1.glsl?raw';
import ParticleFloorfragmentShader2 from '../../shaders/scenes/particles/ParticleFloor/ParticleFloor-fragmentShader-2.glsl?raw';
import globalUniformsGLSL from '../../shaders/chunks/globalUniformsGLSL.glsl?raw';
import rotationMatrices from '../../shaders/chunks/rotation.glsl?raw';
import falloffFunctions from '../../shaders/chunks/falloffFunctions.glsl?raw';
import sineNoise from '../../shaders/chunks/sine-noise.glsl?raw';
import { composeShader } from '../../engine/shaders/compose-shader.ts';
import { geometries } from '../../engine/loaders/geometries.js';
import { ShaderMaterial, Color, Mesh } from 'three';
import { runtime } from '../../engine/rendering/runtime.ts';
import { textures } from '../../engine/loaders/textures.js';
import { environment } from '../../engine/core/environment.ts';
import { frameClock } from '../../engine/core/frame-clock.ts';
class ParticleFloor {
  constructor(scene) {
    this.scene = scene;
    this.ready = new Promise((isReady) => {
      this.isReady = isReady;
    });
    this.additionalTime = 0;
    this.init();
  }
  async init() {
    const e = await geometries.load('floor.drc'),
      t = new ShaderMaterial({
        uniformsGroups: [runtime.UBO],
        uniforms: {
          tMap: {
            value: textures.load('floor_color.ktx2', 'srgb'),
          },
          tPerlin: {
            value: textures.load('perlin-datatexture.ktx2', 'colordata-repeat'),
          },
          tWind: {
            value: textures.load('wind_noise.ktx2', 'linear-repeat'),
          },
          uAlpha: {
            value: environment.devScene ? 1 : 0,
          },
          uColor1: {
            value: new Color('#6a6f7d'),
          },
          uColor2: {
            value: new Color('#e1e6f1'),
          },
          uRotationTime: {
            value: 0,
          },
        },
        vertexShader: composeShader(ParticleFloorvertexShader1, {
          globalUniformsGLSL: globalUniformsGLSL,
          rotationMatrices: rotationMatrices,
        }),
        fragmentShader: composeShader(ParticleFloorfragmentShader2, {
          globalUniformsGLSL: globalUniformsGLSL,
          falloffFunctions: falloffFunctions,
          sineNoise: sineNoise,
        }),
        transparent: true,
      });
    this.mesh = new Mesh(e, t);
    this.mesh.name = 'floor';
    this.mesh.position.y = -10.19;
    this.mesh.scale.setScalar(0.73);
    this.mesh.rotation.y = Math.PI;
    this.mesh.renderOrder = 3;
    this.mesh.updateMatrixWorld(true);
    this.mesh.receiveShadow = false;
    this.mesh.castShadow = false;
    this.scene.beforeRenderCbs.push(() => {
      this.mesh.material.uniforms.uRotationTime.value = frameClock.time * 0.5 + this.additionalTime;
    });
    this.scene.add(this.mesh);
    this.isReady();
  }
}
export { ParticleFloor };
