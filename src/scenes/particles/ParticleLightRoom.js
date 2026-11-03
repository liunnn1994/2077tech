// Reconstructed application source. Third-party implementations are npm imports.
import ParticleLightRoomvertexShader1 from '../../shaders/scenes/particles/ParticleLightRoom/ParticleLightRoom-vertexShader-1.glsl?raw';
import ParticleLightRoomfragmentShader2 from '../../shaders/scenes/particles/ParticleLightRoom/ParticleLightRoom-fragmentShader-2.glsl?raw';
import globalUniformsGLSL from '../../shaders/chunks/globalUniformsGLSL.glsl?raw';
import falloffFunctions from '../../shaders/chunks/falloffFunctions.glsl?raw';
import sineNoise from '../../shaders/chunks/sine-noise.glsl?raw';
import { composeShader } from '../../engine/shaders/compose-shader.ts';
import { SphereGeometry, ShaderMaterial, Color, BackSide, Mesh } from 'three';
import { runtime } from '../../engine/rendering/runtime.ts';
import { textures } from '../../engine/loaders/textures.js';
class ParticleLightRoom {
  constructor(scene) {
    this.scene = scene;
    this.ready = new Promise((isReady) => {
      this.isReady = isReady;
    });
    this.init();
  }
  init() {
    const e = new SphereGeometry(100, 32, 32),
      t = new ShaderMaterial({
        uniformsGroups: [runtime.UBO],
        uniforms: {
          uAlpha: {
            value: 1,
          },
          uColor1: {
            value: new Color('#6a6f7d'),
          },
          uColor2: {
            value: new Color('#e1e6f1'),
          },
          tPerlin: {
            value: textures.load('perlin-datatexture.ktx2', 'colordata-repeat'),
          },
          tDotPattern: {
            value: textures.load('cubes/dot_pattern.ktx2', 'srgb-repeat'),
          },
        },
        vertexShader: composeShader(ParticleLightRoomvertexShader1, {
          globalUniformsGLSL: globalUniformsGLSL,
        }),
        fragmentShader: composeShader(ParticleLightRoomfragmentShader2, {
          globalUniformsGLSL: globalUniformsGLSL,
          falloffFunctions: falloffFunctions,
          sineNoise: sineNoise,
        }),
        side: BackSide,
      });
    this.mesh = new Mesh(e, t);
    this.mesh.name = 'lightroom';
    this.mesh.renderOrder = 2;
    this.mesh.position.y = -12.15;
    this.mesh.updateMatrixWorld(true);
    this.mesh.matrixAutoUpdate = false;
    this.mesh.receiveShadow = false;
    this.mesh.castShadow = false;
    this.scene.add(this.mesh);
    this.isReady();
  }
}
export { ParticleLightRoom };
