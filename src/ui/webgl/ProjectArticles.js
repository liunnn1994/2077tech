// Reconstructed application source. Third-party implementations are npm imports.
import { Group } from 'three';
import { siteConfig } from '../../config/site-config.js';
import { ProjectArticle } from './ProjectArticle.js';
import { events } from '../../engine/core/events.ts';
class ProjectArticles {
  constructor(scene) {
    this.scene = scene;
    this.ready = new Promise((isReady) => {
      this.isReady = isReady;
    });
    this.group = new Group();
    this.group.name = 'projects';
    this.scene.add(this.group);
    this.options = {
      width: 0.6,
      align: 'left',
      lineHeight: 0.8,
      size: 0.09,
    };
    this.projects = [];
    this.projectID = -1;
    this.mouseSim = null;
    this.scrollMultiplier = 1;
    this.init();
  }
  async init() {
    await Promise.all(
      siteConfig.cubes.map((e, t) => {
        const s = new ProjectArticle({
          parent: this,
          index: t,
        });
        this.projects.push(s);
        return s.ready;
      }),
    );
    events.on('webgl_project_show', this.show, this);
    events.on('webgl_project_hide', this.hide, this);
    events.on('wheel', this.onScroll, this);
    events.on('keydown', this.onKeyDown, this);
    events.on('touch_drag', this.onTouchDrag, this);
    this.isReady();
  }
  show(projectID) {
    if (this.projectID === -1) {
      this.projectID = projectID;
      this.projects[projectID].show();
    }
  }
  hide() {
    if (this.projectID !== -1) {
      this.projects[this.projectID].hide();
      this.projectID = -1;
    }
  }
  update() {
    if (this.projectID !== -1) {
      this.projects[this.projectID].update();
      if (this.mouseSim)
        this.projects.forEach((e) => {
          e.setMouseSim(this.mouseSim);
        });
    }
  }
  onScroll(e) {
    if (this.projectID !== -1)
      this.projects[this.projectID].scrollTargetY += e.delta.y * this.scrollMultiplier;
  }
  onKeyDown(e) {
    if (this.projectID !== -1) {
      if (e.key === 'ArrowDown')
        this.projects[this.projectID].scrollTargetY += 150 * this.scrollMultiplier;
      if (e.key === 'ArrowUp')
        this.projects[this.projectID].scrollTargetY -= 150 * this.scrollMultiplier;
    }
  }
  onTouchDrag(e) {
    if (this.projectID !== -1) this.projects[this.projectID].scrollTargetY -= e.delta.y;
  }
  setMouseSim(mouseSim) {
    this.mouseSim = mouseSim;
  }
  resize() {
    this.projects.forEach((e, t) => {
      e.resize(t);
    });
  }
}
export { ProjectArticles };
