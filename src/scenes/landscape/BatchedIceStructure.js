// Reconstructed application source. Third-party implementations are npm imports.
import BatchedIceStructurevertexShader1 from '../../shaders/scenes/landscape/BatchedIceStructure/BatchedIceStructure-vertexShader-1.glsl?raw';
import BatchedIceStructurefragmentShader2 from '../../shaders/scenes/landscape/BatchedIceStructure/BatchedIceStructure-fragmentShader-2.glsl?raw';
import globalUniformsGLSL from '../../shaders/chunks/globalUniformsGLSL.glsl?raw';
import falloffFunctions from '../../shaders/chunks/falloffFunctions.glsl?raw';
import { composeShader } from '../../engine/shaders/compose-shader.ts';
import {
  Vector3,
  Quaternion,
  DataTexture,
  RGBAFormat,
  FloatType,
  ShaderMaterial,
  Object3D,
  BatchedMesh,
} from 'three';
import { environment } from '../../engine/core/environment.ts';
import { geometries } from '../../engine/loaders/geometries.js';
import { textures } from '../../engine/loaders/textures.js';
import { runtime } from '../../engine/rendering/runtime.ts';
import { StructurePlexus } from './plexus/StructurePlexus.js';
import { geometryUtils } from '../../engine/geometry/shared.js';
import { pointerInput } from '../../engine/input/pointer-input.js';
import { math } from '../../engine/core/math.js';
import { frameClock } from '../../engine/core/frame-clock.ts';
const Ls = new Vector3();
const cp = new Quaternion();
const Bh = new Vector3();
class BatchedIceStructure {
  constructor(scene) {
    this.scene = scene;
    this.ready = new Promise((isReady) => {
      this.isReady = isReady;
    });
    this.mousePosition = new Vector3();
    this.mouseVelocity = 0;
    this.introDisplacementModulator = {
      value: environment.devScene ? 1 : 0,
    };
    this.init();
  }
  async init() {
    // The geometry cache is shared with subsequent scene mounts. Center private
    // copies so editing/reloading the scene cannot remove cached metadata twice.
    const e = (await geometries.batched('ice-structure.drc')).map((piece) => piece.clone()),
      t = textures.load('landscape/structure_color.ktx2', 'srgb'),
      s = textures.load('landscape/structure_exploded_color.ktx2', 'srgb');
    let n = Math.sqrt(e.length);
    n = Math.ceil(n / 4) * 4;
    n = Math.max(n, 4);
    const r = new Float32Array(n * n * 4);
    this.optionsTexture = new DataTexture(r, n, n, RGBAFormat, FloatType);
    const a = new ShaderMaterial({
      uniformsGroups: [runtime.UBO],
      uniforms: {
        tMap: {
          value: t,
        },
        tMapExploded: {
          value: s,
        },
        tTriangles: {
          value: textures.load('landscape/triangles_tiling.ktx2', 'srgb-repeat'),
        },
        tNoise: {
          value: textures.load('perlin-datatexture.ktx2', 'srgb-repeat'),
        },
        tOptions: {
          value: this.optionsTexture,
        },
        uProgress: {
          value: 0,
        },
        uIntroGlow: {
          value: 1,
        },
        uIntroMaterialize: {
          value: environment.devScene ? 1 : 0,
        },
      },
      vertexShader: composeShader(BatchedIceStructurevertexShader1, {
        globalUniformsGLSL: globalUniformsGLSL,
      }),
      fragmentShader: composeShader(BatchedIceStructurefragmentShader2, {
        globalUniformsGLSL: globalUniformsGLSL,
        falloffFunctions: falloffFunctions,
      }),
    });
    this._objects = [];
    e.forEach((h, d) => {
      Bh.fromArray(h.attributes.centr.array, 0);
      const u = new Object3D();
      u.targetDisplacement1 = 0;
      u.targetDisplacement2 = 0;
      u.targetBounce1 = 0;
      u.targetBounce2 = 0;
      u.displacement = 0;
      u.scrollDisplacement1 = 0;
      u.scrollDisplacement2 = 0;
      u.bounce = 0;
      u.centroid = Bh.clone();
      u.rand = Ls.fromArray(h.attributes.rand.array, 0).clone();
      u.position.copy(Bh);
      u._pieceIndex = d;
      this._objects.push(u);
      h.deleteAttribute('centr');
      h.deleteAttribute('rand');
      h.deleteAttribute('batchId');
      const f = h.attributes.position.count;
      for (let p = 0; p < f; p++) {
        Ls.fromArray(h.attributes.position.array, p * 3);
        Ls.sub(Bh).toArray(h.attributes.position.array, p * 3);
      }
      h.computeBoundingBox();
      h.computeBoundingSphere();
    });
    const o = e.length,
      l = e.reduce((h, d) => h + d.attributes.position.count, 0),
      c = e.reduce((h, d) => h + d.index.count, 0);
    this.mesh = new BatchedMesh(o, l, c, a);
    e.forEach((h, d) => {
      // Current Three separates reusable geometry from drawable instances.
      // Neither ID is the source piece index; always keep the returned handles.
      const block = this._objects[d];
      block.geometryId = this.mesh.addGeometry(h);
      block.instanceId = this.mesh.addInstance(block.geometryId);
      block.updateMatrix();
      this.mesh.setMatrixAt(block.instanceId, block.matrix);
    });
    this.scene.beforeRenderCbs.push(this.update.bind(this));
    this.mesh.name = 'structure';
    this.mesh.sortObjects = false;
    this.mesh.matrixAutoUpdate = false;
    this.mesh.receiveShadow = false;
    this.mesh.castShadow = false;
    this.mesh.frustumCulled = false;
    this.plexus = new StructurePlexus({
      scene: this.scene,
      parent: this,
    });
    await this.plexus.ready;
    this.scene.add(this.mesh);
    this.isReady();
  }
  update() {
    geometryUtils.planeInteraction.setCamera(this.scene.camera);
    geometryUtils.planeInteraction.setPlaneFromCameraTargetAndDistance(19.25);
    Ls.copy(pointerInput.get(0).position11);
    const e = geometryUtils.planeInteraction.getPointPositionOnPlane(Ls);
    Ls.copy(e);
    this.mousePosition.lerp(e, math.lerpCoefFPS(0.05));
    this.mouseVelocity += Ls.sub(this.mousePosition).length() * 0.01;
    this.mouseVelocity *= math.frictionFPS(0.98);
    this.mouseVelocity = math.clamp(this.mouseVelocity, 0, 1);
    let t = math.fit(this.scene.progress, 0, this.scene.initialScrollAutocenter, 0, 1),
      s = math.ease(math.fit(this.scene.progress, 0, 0.4, 1, 0), 'sine.in'),
      n = this.scene._needsReset ? 1 : 0.075;
    if (environment.devScene) {
      t = 1;
      s = 0;
      n = 1;
    }
    this._objects.forEach((a) => {
      let l = 0.4;
      l *= Math.sin(-frameClock.time * 2 + a.centroid.x) * 0.5 + 0.5;
      l *= Math.cos(-frameClock.time) * 0.5 + 0.5;
      l *= math.mix(0.5, 2, a.rand.z);
      l *= 0.5;
      l *= this.introDisplacementModulator.value;
      const c = Math.sin(frameClock.time + a.rand.x * 12.342) * a.rand.y,
        h = math.fit(
          math.smoothstep(1, 3, Ls.copy(a.centroid).sub(this.mousePosition).length()),
          0,
          1,
          0.5 + 0.3 * c,
          0,
        );
      l = Math.max(l, h * t);
      a.targetBounce1 = l;
      a.targetBounce2 = math.lerpFPS(a.targetBounce2, a.targetBounce1, 0.05);
      a.bounce = math.lerpFPS(a.bounce, a.targetBounce2, 0.05);
      const d = math.smoothstep(0.45, 0.7, a.centroid.y);
      l *= d;
      l = Math.max(0, l);
      a.targetDisplacement1 = l;
      a.targetDisplacement2 = math.lerpFPS(a.targetDisplacement2, a.targetDisplacement1, 0.06);
      a.displacement = math.lerpFPS(a.displacement, a.targetDisplacement2, 0.06);
      // The vertex shader resolves gl_DrawID through Three's indirect instance
      // texture, so the custom options texture must use that same instance ID.
      this.optionsTexture.image.data[a.instanceId * 4 + 0] = a.displacement;
      this.optionsTexture.image.data[a.instanceId * 4 + 1] = a.bounce;
      a.position.copy(a.centroid).addScaledVector(a.centroid, a.displacement);
      const u = math.smoothstep(0.3, 1, a.centroid.y),
        f = math.fit(a.rand.x, 0.4, 1, 0, 1) * 2,
        p = s * u * f;
      a.scrollDisplacement1 = math.lerp(a.scrollDisplacement1, p, n);
      a.scrollDisplacement2 = math.lerpFPS(a.scrollDisplacement2, a.scrollDisplacement1, n);
      a.position.addScaledVector(a.centroid, a.scrollDisplacement2);
      const A = a.scrollDisplacement2 * a.rand.x * -1.5,
        m = a.scrollDisplacement2 * a.rand.y * -1.5,
        g = a.scrollDisplacement2 * a.rand.z * -1.5;
      a.quaternion.identity();
      a.quaternion.multiply(
        cp.setFromAxisAngle(
          Ls.set(0, 1, 0),
          Math.cos(a.displacement * 2 + a.rand.z * 30) * a.displacement * 0.5 + A,
        ),
      );
      a.quaternion.multiply(
        cp.setFromAxisAngle(
          Ls.set(0, 0, 1),
          Math.cos(a.displacement * 2 + a.rand.x * 30) * a.displacement * 0.5 + m,
        ),
      );
      a.quaternion.multiply(
        cp.setFromAxisAngle(
          Ls.set(1, 0, 0),
          Math.cos(a.displacement * 2 + a.rand.y * 30) * a.displacement * 0.5 + g,
        ),
      );
      a.updateMatrix();
      this.mesh.setMatrixAt(a.instanceId, a.matrix);
    });
    this.optionsTexture.needsUpdate = true;
    if (this.introDisplacementModulator.value === 1) this.plexus?.update();
  }
}
export { Ls, cp, Bh, BatchedIceStructure };
