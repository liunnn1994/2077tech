// Reconstructed application source. Third-party implementations are npm imports.
import StructurePlexusPointsvertexShader1 from '../../../shaders/scenes/landscape/plexus/StructurePlexusPoints/StructurePlexusPoints-vertexShader-1.glsl?raw';
import StructurePlexusPointsfragmentShader2 from '../../../shaders/scenes/landscape/plexus/StructurePlexusPoints/StructurePlexusPoints-fragmentShader-2.glsl?raw';
import globalUniformsGLSL from '../../../shaders/chunks/globalUniformsGLSL.glsl?raw';
import easingFunctions_Rc from '../../../shaders/chunks/easing.glsl?raw';
import antialiasedStep from '../../../shaders/chunks/antialiased-step.glsl?raw';
import rotateUv from '../../../shaders/chunks/rotate-uv.glsl?raw';
import { composeShader } from '../../../engine/shaders/compose-shader.ts';
import {
  BufferGeometry,
  Float32BufferAttribute,
  ShaderMaterial,
  Color,
  AdditiveBlending,
  Points,
} from 'three';
import { runtime } from '../../../engine/rendering/runtime.ts';
class StructurePlexusPoints {
  constructor({ scene, parent } = {}) {
    this.scene = scene;
    this.parent = parent;
    this.ready = new Promise((isReady) => {
      this.isReady = isReady;
    });
    this.init();
  }
  init() {
    const e = new BufferGeometry();
    e.setAttribute(
      'position',
      new Float32BufferAttribute(new Float32Array(this.parent.maxPlexusPoints * 3), 3),
    );
    e.setAttribute(
      'progress',
      new Float32BufferAttribute(new Float32Array(this.parent.maxPlexusPoints), 1),
    );
    const t = new ShaderMaterial({
      uniformsGroups: [runtime.UBO],
      uniforms: {
        uColor: {
          value: new Color('#ffffff'),
        },
        uSize: {
          value: 200,
        },
      },
      vertexShader: composeShader(StructurePlexusPointsvertexShader1, {
        globalUniformsGLSL: globalUniformsGLSL,
        easingFunctions_Rc: easingFunctions_Rc,
      }),
      fragmentShader: composeShader(StructurePlexusPointsfragmentShader2, {
        globalUniformsGLSL: globalUniformsGLSL,
        antialiasedStep: antialiasedStep,
        rotateUv: rotateUv,
      }),
      depthWrite: false,
      depthTest: false,
      transparent: true,
      blending: AdditiveBlending,
    });
    this.mesh = new Points(e, t);
    this.mesh.frustumCulled = false;
    this.mesh.name = 'plexus points';
    this.mesh.renderOrder = this.parent.lineMesh.renderOrder + 1;
    this.scene.add(this.mesh);
    this.isReady();
  }
  update() {
    const e = this.mesh.geometry.attributes.position.count,
      t = this.parent.closest;
    for (let s = 0; s < e; s++)
      if (t[s]) {
        this.mesh.geometry.attributes.position.array[s * 3 + 0] = t[s].__UIPos[0];
        this.mesh.geometry.attributes.position.array[s * 3 + 1] = t[s].__UIPos[1];
        this.mesh.geometry.attributes.position.array[s * 3 + 2] = t[s].__UIPos[2];
        this.mesh.geometry.attributes.progress.array[s] = t[s].__plexusAnimation.value;
      } else {
        this.mesh.geometry.attributes.position.array[s * 3 + 0] = 0;
        this.mesh.geometry.attributes.position.array[s * 3 + 1] = 0;
        this.mesh.geometry.attributes.position.array[s * 3 + 2] = 0;
        this.mesh.geometry.attributes.progress.array[s] = 0;
      }
    this.mesh.geometry.attributes.position.needsUpdate = true;
    this.mesh.geometry.attributes.progress.needsUpdate = true;
  }
}
export { StructurePlexusPoints };
