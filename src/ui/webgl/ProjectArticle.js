// Reconstructed application source. Third-party implementations are npm imports.
import { Group } from 'three';
import { siteConfig } from '../../config/site-config.js';
import { ProjectText } from './ProjectText.js';
import { ProjectLinks } from './ProjectLinks.js';
import { math } from '../../engine/core/math.js';
import { environment } from '../../engine/core/environment.ts';
class ProjectArticle {
  constructor({ parent, index } = {}) {
    this.parent = parent;
    this.scene = this.parent.scene;
    this.index = index;
    this.group = new Group();
    this.group.name = `project-${this.index}`;
    this.group.visible = false;
    this.parent.group.add(this.group);
    this.elements = [];
    this.width = 500;
    this.scrollMargin = 65;
    this.scrollMax = 0;
    this.scrollY = 0;
    this.scrollTargetY = 0;
    this.ready = new Promise((isReady) => {
      this.isReady = isReady;
    });
    this.init();
  }
  async init() {
    const e = siteConfig.cubes[this.index].interior,
      t = {
        font: 'IBMPlexMono-Medium',
        color: '#ffffff',
        width: 4,
        align: 'left',
        lineHeight: 1,
        size: 14,
        baseOffset: -0.65,
      };
    this.elements.push(
      new ProjectText({
        parent: this,
        text: e.title,
        options: {
          ...t,
          color: siteConfig.colorProjectTitle,
        },
      }),
      new ProjectText({
        parent: this,
        text: e.content,
        options: {
          ...t,
          color: siteConfig.colorProjectText,
        },
      }),
      new ProjectText({
        parent: this,
        text: e.socialTitle,
        options: {
          ...t,
          color: siteConfig.colorProjectTitle,
        },
      }),
      new ProjectLinks({
        parent: this,
        links: e.social,
        options: {
          ...t,
          color: siteConfig.colorProjectText,
        },
      }),
      new ProjectText({
        parent: this,
        text: e.linkTitle,
        options: {
          ...t,
          color: siteConfig.colorProjectTitle,
        },
      }),
      new ProjectLinks({
        parent: this,
        links: e.links,
        options: {
          ...t,
          color: siteConfig.colorProjectText,
        },
      }),
    );
    this.group.add(...this.elements.map((s) => s.mesh));
    await Promise.all(this.elements.map((s) => s.ready));
    this.resize();
    this.isReady();
  }
  show() {
    this.group.visible = true;
    this.scrollY = 0;
    this.scrollTargetY = 0;
    let e = 0;
    this.elements.forEach((t, _s) => {
      var a;
      const n = !!t.text,
        r = n ? (t.text.length > 100 ? 0.75 : 0.25) : 0.3;
      t.show(r, e);
      e += n && t.text.length > 100 ? 0.3 : 0.1;
      if (!((a = t.interaction) == null)) a.enable();
    });
  }
  hide() {
    Promise.all(
      this.elements.map((e, _t) => {
        var s;
        if (!((s = e.interaction) == null)) s.disable();
        return e.hide();
      }),
    ).then(() => {
      this.group.visible = false;
    });
  }
  update() {
    if (this.group.visible) {
      this.scrollTargetY = math.clamp(this.scrollTargetY, 0, this.scrollMax);
      this.scrollY = math.lerpFPS(this.scrollY, this.scrollTargetY, 0.1);
      this.group.position.y = this.scrollY;
      this.elements.forEach((e, _t) => {
        var s;
        if (!((s = e.update) == null)) s.call(e);
      });
    }
  }
  resize() {
    const e = this.scene.small ? 18 : 24,
      t = 500,
      s = 20;
    this.width = Math.min(environment.screen.width - s * 2, t);
    const n = 25,
      r = Math.max(s, (environment.screen.width - this.width) * 0.5);
    this.ready.then(() =>
      Promise.all(
        this.elements.map((a) =>
          a.resize({
            size: e,
            width: this.width,
          }),
        ),
      ).then(() => {
        const a =
          this.elements.reduce((c, h) => c + h.mesh.size.y, 0) + n * (this.elements.length - 1);
        let o = 0;
        if (
          ((this.scrollMax = Math.max(0, a - (environment.screen.height - this.scrollMargin * 4))),
          this.scrollMax > 0)
        ) {
          o = this.scrollMargin * 2;
          const c = this.scrollMax === 0 ? 0 : this.scrollY / this.scrollMax;
          this.scrollY = c * this.scrollMax;
          this.scrollTargetY = this.scrollY;
        } else {
          o = (environment.screen.height - a) * 0.5;
          this.scrollY = 0;
          this.scrollTargetY = 0;
        }
        let l = o;
        this.elements.forEach((c) => {
          c.mesh.position.set(r, -l, 0);
          l += c.mesh.size.y + n;
        });
      }),
    );
  }
  setMouseSim(e) {
    this.elements.forEach((t) => {
      if (t.els)
        t.els.forEach((s) => {
          s.mesh.material.uniforms.tSim.value = e.finalRT.texture;
          s.icon.material.uniforms.tSim.value = e.finalRT.texture;
        });
      else t.mesh.material.uniforms.tSim.value = e.finalRT.texture;
    });
  }
}
export { ProjectArticle };
