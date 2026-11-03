// Reconstructed application source. Third-party implementations are npm imports.
import StructurePlexusNumbersvertexShader1 from '../../../shaders/scenes/landscape/plexus/StructurePlexusNumbers/StructurePlexusNumbers-vertexShader-1.glsl?raw';
import StructurePlexusNumbersfragmentShader2 from '../../../shaders/scenes/landscape/plexus/StructurePlexusNumbers/StructurePlexusNumbers-fragmentShader-2.glsl?raw';
import globalUniformsGLSL from '../../../shaders/chunks/globalUniformsGLSL.glsl?raw';
import matrixFunctions from '../../../shaders/chunks/matrix.glsl?raw';
import easingFunctions_Rc from '../../../shaders/chunks/easing.glsl?raw';
import msdfFunctions from '../../../shaders/chunks/msdfFunctions.glsl?raw';
import { composeShader } from '../../../engine/shaders/compose-shader.ts';
import {
  Object3D,
  PlaneGeometry,
  BufferAttribute,
  InstancedBufferGeometry,
  InstancedBufferAttribute,
  ShaderMaterial,
  Color,
  AdditiveBlending,
  InstancedMesh,
} from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { runtime } from '../../../engine/rendering/runtime.ts';
import { textures } from '../../../engine/loaders/textures.js';
import { environment } from '../../../engine/core/environment.ts';
const Th = new Object3D();
class StructurePlexusNumbers {
  constructor({ scene, parent } = {}) {
    this.scene = scene;
    this.parent = parent;
    this.ready = new Promise((isReady) => {
      this.isReady = isReady;
    });
    this.init();
  }
  init() {
    const t = new PlaneGeometry();
    t.scale(0.77777, 1, 1);
    t.translate(-0.5 - -0.1, 0, 0);
    t.setAttribute('side', new BufferAttribute(new Int32Array([-1, -1, -1, -1]), 1));
    const s = new PlaneGeometry();
    s.scale(0.77777, 1, 1);
    s.translate(0.5 + -0.1, 0, 0);
    s.setAttribute('side', new BufferAttribute(new Int32Array([1, 1, 1, 1]), 1));
    const n = mergeGeometries([t, s]),
      r = new InstancedBufferGeometry();
    r.instanceCount = this.parent.maxPlexusPoints;
    for (const o in n.attributes) r.setAttribute(o, n.attributes[o]);
    r.setIndex(n.index);
    r.setAttribute(
      'progress',
      new InstancedBufferAttribute(new Float32Array(this.parent.maxPlexusPoints), 1),
    );
    r.setAttribute(
      'nums',
      new InstancedBufferAttribute(new Int32Array(this.parent.maxPlexusPoints * 2), 2),
    );
    const a = new ShaderMaterial({
      uniformsGroups: [runtime.UBO],
      uniforms: {
        tNums: {
          value: textures.load('numbers-datatexture.ktx2', 'data'),
        },
        uColor: {
          value: new Color('#ffffff'),
        },
        uSize: {
          value: 1,
        },
      },
      vertexShader: composeShader(StructurePlexusNumbersvertexShader1, {
        globalUniformsGLSL: globalUniformsGLSL,
        matrixFunctions: matrixFunctions,
        easingFunctions_Rc: easingFunctions_Rc,
      }),
      fragmentShader: composeShader(StructurePlexusNumbersfragmentShader2, {
        globalUniformsGLSL: globalUniformsGLSL,
        msdfFunctions: msdfFunctions,
      }),
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: AdditiveBlending,
    });
    this.mesh = new InstancedMesh(r, a, this.parent.maxPlexusPoints);
    this.mesh.name = 'plexus numbers';
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = this.parent.lineMesh.renderOrder + 2;
    this.scene.add(this.mesh);
    this.isReady();
  }
  update() {
    const e = this.parent.closest;
    this.mesh.count = e.length;
    for (let t = 0; t < e.length; t++) {
      if (e[t]) {
        Th.position.fromArray(e[t].__UIPos);
        this.mesh.geometry.attributes.progress.array[t] = e[t].__plexusAnimation.value;
        const s = e[t].centroid.distanceTo(e[t].position);
        let n = `${Math.floor(s * 50)}`.slice(-2);
        if (n.length < 2) n = `0${n}`;
        this.mesh.geometry.attributes.nums.array[t * 2] = n[0];
        this.mesh.geometry.attributes.nums.array[t * 2 + 1] = n[1];
      } else {
        Th.position.set(0, 0, 0);
        this.mesh.geometry.attributes.progress.array[t] = 0;
        this.mesh.geometry.attributes.nums.array[t * 2] = 0;
        this.mesh.geometry.attributes.nums.array[t * 2 + 1] = 0;
      }
      Th.updateMatrix();
      this.mesh.setMatrixAt(t, Th.matrix);
    }
    this.mesh.material.uniforms.uSize.value = Math.min(0.1, 0.08 / (environment.screen.h / 1300));
    this.mesh.geometry.attributes.progress.needsUpdate = true;
    this.mesh.geometry.attributes.nums.needsUpdate = true;
    this.mesh.instanceMatrix.needsUpdate = true;
  }
}
export { Th, StructurePlexusNumbers };
