// Reconstructed application source. Third-party implementations are npm imports.
import { geometries } from '../../engine/loaders/geometries.js';
import { CageLineMaterial } from './CageLineMaterial.js';
import { AdditiveBlending, LineSegments } from 'three';
import { environment } from '../../engine/core/environment.ts';
class StructureCage {
  constructor(scene) {
    this.scene = scene;
    this.ready = new Promise((isReady) => {
      this.isReady = isReady;
    });
    this.init();
  }
  async init() {
    const e = await geometries.load('landscape/structure-cage.drc'),
      t = new CageLineMaterial({
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
    this.mesh.visible = !environment.devScene;
    this.mesh.name = 'structure-cage';
    this.mesh.renderOrder = 999;
    this.scene.add(this.mesh);
    this.isReady();
  }
}
export { StructureCage };
