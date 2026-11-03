// Reconstructed application source. Third-party implementations are npm imports.
import { RenderScene } from '../../engine/rendering/render-scene.js';
import { events } from '../../engine/core/events.ts';
import { environment } from '../../engine/core/environment.ts';
import { BrandLogo } from './BrandLogo.js';
import { ScrollHint } from './ScrollHint.js';
import { SoundToggle } from './SoundToggle.js';
import { CloseProject } from './CloseProject.js';
import { ProjectArticles } from './ProjectArticles.js';
import { siteConfig } from '../../config/site-config.js';
class OverlayScene extends RenderScene {
  constructor(e = {}) {
    super({
      cameraType: 'orthographic',
    });
    this.controller = e.mainController;
    this.small = false;
    this.mobile = false;
    this.meshMarginLeft = 0;
    this.meshMarginTop = 0;
    this.scrollVisible = true;
    this.init();
  }
  async init() {
    this.cameraOptions();
    await Promise.all([
      this.createLogo(),
      this.createScroll(),
      this.createSound(),
      this.createClose(),
      this.createProjects(),
    ]);
    this.resize();
    events.on('resize', this.resize, this);
    this.beforeRenderCbs.push(this.update.bind(this));
    if (environment.devScene) {
      events.emit('webgl_project_show', 0);
    }
    this.isReady();
  }
  cameraOptions() {
    this.camera.lerpPosition = 0;
    this.camera.lerpTarget = 0;
    this.camera.lerpRotation = 0;
  }
  async createLogo() {
    this.logo = new BrandLogo(this);
    await this.logo.ready;
  }
  async createScroll() {
    this.scroll = new ScrollHint(this);
    await this.scroll.ready;
  }
  async createSound() {
    this.sound = new SoundToggle(this);
    await this.sound.ready;
  }
  async createClose() {
    this.close = new CloseProject(this);
    await this.close.ready;
  }
  async createProjects() {
    this.projects = new ProjectArticles(this);
    await this.projects.ready;
  }
  update() {
    var e;
    if (this.scrollVisible && this.controller) {
      const t = this.controller.scrollComposers[0].passes[0].scene,
        s = Math.abs(this.controller.scroll.y - this.controller.round(t.initialScrollAutocenter));
      if (this.controller.scroll.y !== 0 && s > t.height * 0.25) {
        this.scrollVisible = false;
        this.scroll.hide();
      }
    }
    if (!((e = this.projects) == null)) e.update();
  }
  resize() {
    this.camera.basePosition.set(
      environment.screen.w * 0.5,
      -environment.screen.h * 0.5,
      this.camera.basePosition.z,
    );
    this.camera.baseTarget.set(this.camera.basePosition.x, this.camera.basePosition.y, 0);
    this.camera.updateProjectionMatrix();
    this.small =
      environment.screen.width < siteConfig.breakpointW ||
      environment.screen.height < siteConfig.breakpointH;
    this.mobile =
      environment.screen.width < siteConfig.breakPointMobile ||
      environment.screen.height < siteConfig.breakPointMobile;
    this.meshMarginLeft = this.mobile
      ? siteConfig.gridSizeMobile
      : this.small
        ? siteConfig.gridSizeLow
        : siteConfig.gridSize;
    this.meshMarginTop = this.mobile
      ? siteConfig.topMarginMobile
      : this.small
        ? siteConfig.topMarginLow
        : siteConfig.topMargin;
    [this.logo, this.scroll, this.sound, this.close, this.projects].forEach((e) => {
      e.resize();
    });
  }
}
export { OverlayScene };
