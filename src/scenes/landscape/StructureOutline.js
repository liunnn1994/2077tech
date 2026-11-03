// Reconstructed application source. Third-party implementations are npm imports.
import { geometries } from '../../engine/loaders/geometries.js';
import { OutlineLineMaterial } from './OutlineLineMaterial.js';
import { AdditiveBlending, LineSegments } from 'three';
import { math } from '../../engine/core/math.js';
class StructureOutline {
  constructor(scene) {
    this.scene = scene;
    this.ready = new Promise((isReady) => {
      this.isReady = isReady;
    });
    this.init();
  }
  async init() {
    const e = await geometries.load('landscape/structure-outline.drc'),
      t = new OutlineLineMaterial({
        color: '#a7b2d6',
        opacity: 0.3,
        transparent: true,
      });
    t.depthTest = false;
    t.depthWrite = false;
    t.blending = AdditiveBlending;
    t.transparent = true;
    this.mesh = new LineSegments(e, t);
    this.mesh.frustumCulled = false;
    this.mesh.visible = true;
    this.mesh.name = 'structure-outline';
    this.mesh.renderOrder = 999;
    this.scene.add(this.mesh);
    this.mesh.onBeforeRender = () => {
      const s = math.ease(math.fit(this.scene.progress, 0, 0.35, 1, 0), 'sine.in') * 2;
      this.mesh.material.uniforms.uScrollAlpha.value = s;
    };
    this.isReady();
  }
}
export { StructureOutline };
