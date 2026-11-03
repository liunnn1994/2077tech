// Reconstructed application source. Third-party implementations are npm imports.
import { geometries } from '../../engine/loaders/geometries.js';
import { Mesh } from 'three';
import { PortalRingMaterial } from './PortalRingMaterial.js';
import { textures } from '../../engine/loaders/textures.js';
class PortalRings {
  constructor(scene) {
    this.scene = scene;
    this.ready = new Promise((isReady) => {
      this.isReady = isReady;
    });
    this.meshes = [];
    this.init();
  }
  async init() {
    const e = [
        {
          name: 'shattered_ring2',
          geometry: await geometries.load('shattered_ring2.drc'),
        },
        {
          name: 'shattered_ring',
          geometry: await geometries.load('shattered_ring.drc'),
        },
      ],
      t = 3,
      s = 2.5;
    let n = 1.65;
    for (let r = 0; r < t; r++) {
      const a = e[r % e.length],
        o = a.geometry,
        l = `mesh${r}`;
      this[l] = new Mesh(o, new PortalRingMaterial());
      this[l].material.uniforms.tMap.value = textures.load(`${a.name}_color.ktx2`, 'srgb-repeat');
      this[l].material.uniforms.tGlow.value = textures.load(`${a.name}_ao.ktx2`, 'srgb-repeat');
      this[l].name = `ring${r}`;
      this[l].receiveShadow = false;
      this[l].castShadow = false;
      this[l].position.y = -n;
      this[l].rotation.x = -3.14159 * 0.5;
      this[l].updateMatrixWorld(true);
      this[l].renderOrder = t;
      n += s;
      this.scene.add(this[l]);
      this.meshes.push(this[l]);
    }
    this.isReady();
  }
  update() {
    const e = this.scene.timelineAdditional.upRotation * 0.4;
    this.meshes.forEach((t) => {
      t.rotation.z = e;
    });
  }
}
export { PortalRings };
