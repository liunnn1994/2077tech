// Reconstructed application source. Third-party implementations are npm imports.
import ParticleForceFieldvertexShader1 from '../../shaders/scenes/particles/ParticleForceField/ParticleForceField-vertexShader-1.glsl?raw';
import ParticleForceFieldfragmentShader2 from '../../shaders/scenes/particles/ParticleForceField/ParticleForceField-fragmentShader-2.glsl?raw';
import globalUniformsGLSL from '../../shaders/chunks/globalUniformsGLSL.glsl?raw';
import matrixFunctions from '../../shaders/chunks/matrix.glsl?raw';
import falloffFunctions from '../../shaders/chunks/falloffFunctions.glsl?raw';
import sineNoise from '../../shaders/chunks/sine-noise.glsl?raw';
import { composeShader } from '../../engine/shaders/compose-shader.ts';
import { CylinderGeometry, ShaderMaterial, DoubleSide, AdditiveBlending, Mesh } from 'three';
import { runtime } from '../../engine/rendering/runtime.ts';
import { textures } from '../../engine/loaders/textures.js';
class ParticleForceField {
  constructor(scene) {
    this.scene = scene;
    this.ready = new Promise((isReady) => {
      this.isReady = isReady;
    });
    this.init();
  }
  init() {
    const t = new CylinderGeometry(1, 1, 3, 64, 6, true);
    t.translate(0, 3 * 0.5, 0);
    const s = new ShaderMaterial({
      uniformsGroups: [runtime.UBO],
      uniforms: {
        uAlpha: {
          value: 0,
        },
        uHeight: {
          value: 3,
        },
        tTriangles: {
          value: textures.load('landscape/triangles_tiling.ktx2', 'srgb-repeat'),
        },
      },
      vertexShader: composeShader(ParticleForceFieldvertexShader1, {
        globalUniformsGLSL: globalUniformsGLSL,
        matrixFunctions: matrixFunctions,
      }),
      fragmentShader: composeShader(ParticleForceFieldfragmentShader2, {
        globalUniformsGLSL: globalUniformsGLSL,
        falloffFunctions: falloffFunctions,
        sineNoise: sineNoise,
      }),
      side: DoubleSide,
      transparent: true,
      blending: AdditiveBlending,
    });
    this.mesh = new Mesh(t, s);
    this.mesh.position.y = -10.13;
    this.mesh.scale.setScalar(0.28);
    this.mesh.name = 'forcefield';
    this.mesh.renderOrder = 15;
    this.mesh.updateMatrixWorld(true);
    this.mesh.matrixAutoUpdate = false;
    this.mesh.receiveShadow = false;
    this.mesh.castShadow = false;
    this.scene.add(this.mesh);
    this.isReady();
  }
}
export { ParticleForceField };
