// Reconstructed application source. Third-party implementations are npm imports.
import { Group, Vector2 } from 'three';
import { ProjectLink } from './ProjectLink.js';
import { MeshInteraction_Er } from '../../engine/input/mesh-interaction.js';
import { events } from '../../engine/core/events.ts';
class ProjectLinks {
  constructor({ parent = null, links = {}, options = {} } = {}) {
    this.parent = parent;
    this.links = links;
    this.options = options;
    this.ready = new Promise((isReady) => {
      this.isReady = isReady;
    });
    this.els = [];
    this.mesh = new Group();
    this.mesh.name = 'links';
    this.mesh.size = new Vector2();
    this.init();
  }
  async init() {
    this.els = this.links.map((e, t) => new ProjectLink(e, this, t));
    await Promise.all(this.els.map((e) => e.ready));
    this.mesh.add(...this.els.map((e) => e.mesh));
    this.resize();
    this.interaction = new MeshInteraction_Er({
      meshes: this.els.map((e) => e.interactionMesh),
      camera: this.parent.scene.camera,
      hoverCursor: true,
      onHover: (e) => {
        if (e.action === 'hover_in') {
          const t = e.interactions[0].object._index;
          this.els[t].show(0.5, 0);
          events.emit('webgl_play_audio', 'ui-short');
        }
      },
      onClick: (e) => {
        const t = e.interactions[0].object._index;
        window.open(this.els[t].data.link, '_blank').focus();
      },
    });
    this.isReady();
  }
  hide() {
    return Promise.all(this.els.map((e) => e.hide()));
  }
  show(e = 1, t = 0) {
    return Promise.all(this.els.map((s, n) => s.show(0.5, t + n * 0.1)));
  }
  resize(e = {}) {
    return this.ready.then(() =>
      Promise.all(this.els.map((t) => t.resize(e))).then(() => {
        let t = 0,
          s = 0;
        this.mesh.size.set(0, 0);
        this.els.forEach((n, _r) => {
          const a = this.parent.scene.small ? 12 : 18,
            o = n.mesh.size.x + a,
            l = n.mesh.size.y;
          if (t + o > this.parent.width) {
            t = 0;
            s -= l + 10;
          }
          n.mesh.position.set(t, s, 0);
          n.icon.scale.set(a, a, 1);
          n.icon.position.set(n.mesh.size.x - a + 5, 0, 0);
          this.mesh.size.x = Math.max(this.mesh.size.x, t + o);
          this.mesh.size.y = Math.max(this.mesh.size.y, Math.abs(s) + l);
          t += o + 15;
        });
      }),
    );
  }
  update() {
    this.els.forEach((e, _t) => {
      e.interactionMesh.scale.set(e.mesh.size.x + e.icon.scale.x * 0.5, e.mesh.size.y * 1.25, 1);
      e.interactionMesh.position
        .copy(e.mesh.position)
        .add(this.mesh.position)
        .add(this.parent.group.position);
      e.interactionMesh.updateMatrixWorld();
    });
  }
}
export { ProjectLinks };
