import { Mesh, type BufferGeometry } from 'three';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { gsap } from 'gsap';
import { AudioDirector } from './audio/AudioDirector.js';
import { runtime } from './rendering/runtime.ts';
import { events } from './core/events.js';
import { math } from './core/math.js';
import { geometryUtils } from './geometry/shared.js';
import { SceneCompositeMaterial } from './composition/SceneCompositeMaterial.js';
import { LoaderCompositeMaterial } from './composition/LoaderCompositeMaterial.js';
import { OverlayScene } from '../ui/webgl/OverlayScene.js';
import { scrollSceneTypes } from './composition/scene-types.js';
import { SceneComposer } from './rendering/scene-composer.js';
import { DetailScene } from '../scenes/detail/DetailScene.js';
import { frameClock } from './core/frame-clock.js';
import { siteConfig } from '../config/site-config.js';
import { asyncTasks } from './core/async.ts';
import type {
  AudioDirectorContract,
  AutoCenterState,
  ComposerConstructor,
  ControllerRenderRuntime,
  DetailSceneContract,
  ExperienceSection,
  KeyboardInput,
  LandscapeSceneContract,
  LoaderCompositeShader,
  OverlaySceneContract,
  PortfolioSceneContract,
  ParticleSceneContract,
  ProjectRouteParameters,
  SceneComposerContract,
  SceneCompositeShader,
  SceneConstructor,
  ScrollScene,
  ScrollState,
  TouchDragInput,
  WheelInput,
} from './contracts/experience';

// Recovered scene modules are JavaScript. These narrow construction boundaries
// describe their real API; the controller below remains strictly type checked.
const rendering = runtime as unknown as ControllerRenderRuntime;
const SceneMaterial = SceneCompositeMaterial as unknown as new () => SceneCompositeShader;
const LoaderMaterial = LoaderCompositeMaterial as unknown as new () => LoaderCompositeShader;
const Overlay = OverlayScene as unknown as SceneConstructor<OverlaySceneContract>;
const Detail = DetailScene as unknown as SceneConstructor<DetailSceneContract>;
const Composer = SceneComposer as unknown as ComposerConstructor;
const Audio = AudioDirector as unknown as new (
  controller: ExperienceController,
) => AudioDirectorContract;
const sceneConstructors = scrollSceneTypes as unknown as {
  landscape: SceneConstructor<LandscapeSceneContract>;
  cubes: SceneConstructor<PortfolioSceneContract>;
  entry: SceneConstructor<ParticleSceneContract>;
};

/** Owns the original virtual-scroll composition and project navigation. */
export class ExperienceController {
  readonly options: Readonly<Record<string, unknown>> | undefined;
  readonly ready: Promise<void>;
  isReady!: () => void;
  private rejectReady!: (reason: unknown) => void;
  private disposed = false;
  private readonly renderFrame = (): void => {
    this.render();
  };
  private readonly routeRequest = (
    scene: string,
    path: string,
    parameters: Readonly<Record<string, string | null>>,
  ): void => {
    if (scene !== 'home' && scene !== 'project') return;
    void this.navigateToSection(scene, path, { project: parameters.project ?? undefined });
  };
  isFirstNavigation = true;
  currentSection: ExperienceSection | null = null;
  readonly scroll: ScrollState = { total: 0, targetY1: 0, targetY2: 0, y: 0, velocity: 0 };
  readonly autoCenter: AutoCenterState = {
    needed: false,
    animating: false,
    lastTarget: 0,
    lastTime: 0,
  };
  scrollMultiplier = 75e-5;
  scrollBlocked = false;
  detailIndex = 0;
  isDetailOpen = false;
  scrollComposers: Array<SceneComposerContract<ScrollScene>> = [];
  detailScene!: DetailSceneContract;
  detailComposer!: SceneComposerContract<DetailSceneContract>;
  uiScene!: OverlaySceneContract;
  uiPass!: RenderPass;
  landscapeScene!: LandscapeSceneContract;
  portfolioScene!: PortfolioSceneContract;
  particleScene!: ParticleSceneContract;
  audioController!: AudioDirectorContract;
  material!: SceneCompositeShader;
  materialLoad!: LoaderCompositeShader;
  mainMesh!: Mesh<BufferGeometry, SceneCompositeShader | LoaderCompositeShader>;

  constructor(options?: Readonly<Record<string, unknown>>) {
    this.options = options;
    this.ready = new Promise<void>((resolve, reject) => {
      this.isReady = resolve;
      this.rejectReady = reject;
    });
    void this.init().catch(this.rejectReady);
  }

  async init(): Promise<void> {
    this.initGlobalPlane();
    await this.createScenes();
    if (this.disposed) return;
    this.audioController = new Audio(this);
    rendering.renderPass.scene.beforeRenderCbs.push(this.renderFrame);
    events.on('resize', this.resize, this);
    events.on('webgl_router_request_switch_scene', this.routeRequest, this);
    this.scrollComposers.forEach((composer) => composer.render());
    this.isReady();
  }

  round(value: number): number {
    return math.round(value, 2);
  }

  initGlobalPlane(): void {
    this.material = new SceneMaterial();
    this.materialLoad = new LoaderMaterial();
    this.mainMesh = new Mesh(geometryUtils.triangle, this.material);
    this.mainMesh.frustumCulled = false;
    this.mainMesh.name = 'Main triangle mesh';
    rendering.renderPass.scene.add(this.mainMesh);
    this.mainMesh.material = this.material;
    void rendering.renderPass.scene._upload();
    this.mainMesh.material = this.materialLoad;
    void rendering.renderPass.scene._upload();
  }

  async createScenes(): Promise<void> {
    this.uiScene = new Overlay({ mainController: this });
    // The overlay must preserve the framebuffer produced by scene composition.
    this.uiPass = new RenderPass(this.uiScene, this.uiScene.camera);
    this.uiPass.clear = false;
    rendering.composer.addPass(this.uiPass);
    this.landscapeScene = new sceneConstructors.landscape({ mainController: this });
    this.portfolioScene = new sceneConstructors.cubes({ mainController: this });
    this.particleScene = new sceneConstructors.entry({ mainController: this });
    this.scrollComposers = [this.landscapeScene, this.portfolioScene, this.particleScene].map(
      (scene) => new Composer({ scene }),
    );
    this.detailScene = new Detail({ mainController: this });
    this.detailComposer = new Composer({ scene: this.detailScene });
    await Promise.all([
      this.uiScene.uploaded,
      ...this.scrollComposers.map((composer) => composer.passes[0].scene.uploaded),
      this.detailComposer.passes[0].scene.uploaded,
    ]);
    this.uiScene.projects.setMouseSim(this.detailScene.mouseSim);
  }

  render(): void {
    if (this.disposed) return;
    if (this.scroll.targetY2 !== this.autoCenter.lastTarget) {
      this.autoCenter.needed = true;
      this.autoCenter.lastTarget = this.scroll.targetY2;
      this.autoCenter.lastTime = frameClock.time;
    }
    const previousPosition = this.scroll.y;
    this.scroll.targetY1 = math.lerpFPSLimited(
      this.scroll.targetY1,
      this.scroll.targetY2,
      0.075,
      100 * this.scrollMultiplier,
    );
    this.scroll.y = math.lerpFPS(this.scroll.y, this.scroll.targetY1, 0.15);
    const maxTargetDistance = 750 * this.scrollMultiplier;
    this.scroll.targetY2 = math.clamp(
      this.scroll.targetY2,
      this.scroll.y - maxTargetDistance,
      this.scroll.y + maxTargetDistance,
    );
    if (Math.abs(this.scroll.y - this.scroll.targetY2) < 0.1 * this.scrollMultiplier) {
      this.scroll.y = this.scroll.targetY2;
      this.scroll.targetY1 = this.scroll.targetY2;
    }
    this.scroll.velocity += Math.abs(this.scroll.y - previousPosition);
    this.scroll.velocity *= math.frictionFPS(0.98);
    this.scroll.velocity = math.clamp(this.scroll.velocity, 0, 1);
    if (Math.abs(this.scroll.velocity) < 0.001) this.scroll.velocity = 0;
    this.scroll.total = 0;
    for (const composer of this.scrollComposers) {
      const scene = composer.passes[0].scene;
      scene.__top = this.scroll.total;
      scene.__bottom = scene.__top + scene.height;
      this.scroll.total += scene.height;
    }
    const remainder = this.scroll.y % this.scroll.total;
    const screenTop = this.scroll.y >= 0 ? remainder : this.scroll.total - Math.abs(remainder);
    const unwrappedScreenBottom = screenTop + 1;
    const screenBottom = unwrappedScreenBottom % this.scroll.total;
    let currentIndex: number | null = null;
    let nextIndex: number | null = null;
    let transitionProgress = 0;
    for (const [index, composer] of this.scrollComposers.entries()) {
      const scene = composer.passes[0].scene;
      const roundedTop = this.round(screenTop);
      const roundedBottom = this.round(screenBottom);
      const containsTop = roundedTop >= scene.__top && roundedTop < scene.__bottom;
      const containsBottom = roundedBottom > scene.__top && roundedBottom <= scene.__bottom;
      if (containsTop || containsBottom) {
        const position = containsTop ? unwrappedScreenBottom : screenBottom;
        scene.progress = (position - scene.__top) / (scene.__bottom - scene.__top + 1);
        if (containsTop) currentIndex = index;
        else {
          nextIndex = index;
          transitionProgress = screenBottom - scene.__top;
        }
        scene.isSceneVisible = true;
      } else scene.isSceneVisible = false;
    }
    const detailVisible = this.material.uniforms.uDetailProgress.value > 0;
    if (this.material.uniforms.uDetailProgress.value !== 1) {
      if (currentIndex !== null) {
        const composer = this.composerAt(currentIndex);
        composer.render();
        this.material.uniforms.tScene1.value = composer.readBuffer.texture;
        this.materialLoad.uniforms.tScene.value = composer.readBuffer.texture;
      }
      if (nextIndex !== null) {
        const composer = this.composerAt(nextIndex);
        composer.render();
        this.material.uniforms.tScene2.value = composer.readBuffer.texture;
      }
    }
    this.material.uniforms.uProgress.value = transitionProgress;
    this.material.uniforms.uProgressVel.value = this.scroll.velocity;
    if (
      this.autoCenter.needed &&
      !this.autoCenter.animating &&
      frameClock.time - this.autoCenter.lastTime > 1.4
    ) {
      this.autoCenter.needed = false;
      const targetRemainder = this.scroll.targetY2 % this.scroll.total;
      const targetTop =
        this.scroll.targetY2 >= 0 ? targetRemainder : this.scroll.total - Math.abs(targetRemainder);
      const targetBottom = (targetTop + 1) % this.scroll.total;
      if (transitionProgress % 1 !== 0) {
        let shortestDistance = Infinity;
        let offset = 0;
        for (const index of [currentIndex, nextIndex]) {
          if (index === null) continue;
          const scene = this.composerAt(index).passes[0].scene;
          const top = targetTop > targetBottom ? targetTop - this.scroll.total : targetTop;
          for (const sceneEdge of [scene.__top, scene.__bottom]) {
            for (const screenEdge of [top, top + 1]) {
              const distance = sceneEdge - screenEdge;
              if (Math.abs(distance) < shortestDistance) {
                shortestDistance = Math.abs(distance);
                offset = distance;
              }
            }
          }
        }
        // Preserve the original early return when already on a scene boundary.
        if (offset === 0) return;
        let target = this.scroll.targetY2 + offset;
        let duration = 2;
        const index = offset < 0 ? currentIndex : nextIndex;
        if (index !== null) {
          const scene = this.composerAt(index).passes[0].scene;
          if (
            typeof scene.initialScrollAutocenter === 'number' &&
            typeof scene.finalScrollAutocenter === 'number'
          ) {
            const viewportFraction = 1 / (scene.height + 1);
            const correction =
              ((index === currentIndex
                ? 1 - scene.finalScrollAutocenter
                : scene.initialScrollAutocenter) -
                viewportFraction) *
              (scene.height + 1);
            target += correction * Math.sign(offset);
            duration += correction * 2;
          }
        }
        this.centerScroll(target, duration);
      } else if (currentIndex !== null) {
        this.composerAt(currentIndex).passes[0].scene.autoCenter?.(this, targetTop);
      }
    }
    this.material.uniforms.tCubes.value = this.composerAt(1).readBuffer.texture;
    this.material.uniforms.uInCubes.value = currentIndex === 1;
    if (detailVisible) {
      this.detailComposer.render();
      this.material.uniforms.tDetail.value = this.detailComposer.readBuffer.texture;
      this.materialLoad.uniforms.tScene.value = this.detailComposer.readBuffer.texture;
    }
  }

  private composerAt(index: number): SceneComposerContract<ScrollScene> {
    const composer = this.scrollComposers[index];
    if (!composer) throw new RangeError(`Missing scroll scene at index ${index}`);
    return composer;
  }

  centerScroll(position: number, duration: number): void {
    const target = this.round(position);
    this.autoCenter.animating = true;
    gsap.to(this.scroll, {
      y: target,
      duration,
      ease: 'inOut3',
      overwrite: true,
      onUpdate: () => {
        this.scroll.targetY1 = this.scroll.y;
        this.scroll.targetY2 = this.scroll.y;
        this.autoCenter.lastTarget = this.scroll.y;
      },
      onComplete: () => {
        this.autoCenter.animating = false;
      },
    });
  }

  resize(): void {
    this.stopAutoCenter();
    this.scroll.targetY2 = this.scroll.y;
    this.scroll.targetY1 = this.scroll.y;
    this.autoCenter.lastTarget = Infinity;
  }

  centerDetailScene(animate = 1): number {
    const scene = this.portfolioScene;
    if (!scene.isSceneVisible || animate === 0) {
      this.scroll.y = this.landscapeScene.height;
      this.resize();
      scene.progress = 1 / (scene.height + 1);
    }
    const cube = scene.cubes[this.detailIndex];
    if (!cube) throw new RangeError(`Missing portfolio cube at index ${this.detailIndex}`);
    const offset = (cube.options.centeredProgress - scene.progress) * (scene.height + 1);
    const distance = Math.abs(offset);
    const duration =
      animate > 0 ? math.ease(math.fit(distance, 0, 0.2, 0.05, 1), 'expo.out') * 1.5 : 0;
    this.centerScroll(this.scroll.y + offset, duration);
    return duration;
  }

  start(): void {
    events.emit('webgl_render_active', true);
    events.emit('webgl_router_start');
  }

  async navigateToSection(
    section: ExperienceSection = 'home',
    _path = '/',
    parameters: ProjectRouteParameters = {},
  ): Promise<void> {
    if (this.disposed || this.currentSection === section) return;
    events.emit('webgl_router_block_navigation', true);
    if (section === 'home') {
      if (this.isFirstNavigation) {
        this.isFirstNavigation = false;
        this.mainMesh.material = this.materialLoad;
        await Promise.all([
          gsap.fromTo(
            this.materialLoad.uniforms.uIntro,
            { value: 0 },
            { value: 1, duration: 1, ease: 'inOut3' },
          ),
          this.landscapeScene.playInAnimation(),
        ]);
        if (this.disposed) return;
        this.mainMesh.material = this.material;
        this.enableScroll();
      } else {
        this.centerDetailScene(0);
        this.detailIndex = 0;
        gsap.to(this.material.uniforms.uDetailProgress, {
          overwrite: true,
          value: 0,
          ease: 'power2.out',
          duration: 1.25,
        });
        gsap.to(this.material.uniforms.uDetailProgress2, {
          overwrite: true,
          value: 0,
          ease: 'power2.out',
          duration: 0.6,
        });
        this.portfolioScene.detailAnimationOut();
        this.detailScene.playOutAnimation();
        events.emit('webgl_play_audio', 'leave-project');
        await gsap.delayedCall(1, () => {
          if (this.disposed) return;
          this.isDetailOpen = false;
          this.enableScroll();
        });
      }
    } else {
      const project = siteConfig.cubes.find((candidate) => candidate.hash === parameters.project);
      if (
        !project ||
        this.isDetailOpen ||
        (!this.isFirstNavigation && !this.portfolioScene.isSceneVisible)
      ) {
        events.emit('webgl_router_block_navigation', false);
        await Promise.resolve();
        events.emit('webgl_switch_scene', '');
        return;
      }
      this.isDetailOpen = true;
      this.detailIndex = siteConfig.cubes.indexOf(project);
      this.disableScroll();
      if (this.isFirstNavigation) {
        this.isFirstNavigation = false;
        this.landscapeScene.introTL.progress(1);
        this.centerDetailScene(0);
        gsap.set(this.material.uniforms.uDetailProgress, { overwrite: true, value: 1 });
        gsap.set(this.material.uniforms.uDetailProgress2, { overwrite: true, value: 1 });
        this.portfolioScene.detailAnimationIn(0);
        this.mainMesh.material = this.materialLoad;
        this.detailScene.playInAnimation(this.detailIndex, 0);
        await gsap.fromTo(
          this.materialLoad.uniforms.uIntro,
          { value: 0 },
          { value: 1, duration: 1, ease: 'power2.inOut' },
        );
        if (this.disposed) return;
        this.material.uniforms.uProgress.value = 0;
        this.material.uniforms.uInCubes.value = true;
        this.mainMesh.material = this.material;
      } else {
        const delay = this.centerDetailScene() * 0.5;
        gsap.to(this.material.uniforms.uDetailProgress, {
          overwrite: true,
          value: 1,
          ease: 'power3.in',
          delay,
          duration: 1.25,
        });
        gsap.to(this.material.uniforms.uDetailProgress2, {
          overwrite: true,
          value: 1,
          ease: 'sine.out',
          delay: delay + 0.75,
          duration: 1.25,
        });
        this.portfolioScene.detailAnimationIn(delay);
        this.detailScene.playInAnimation(this.detailIndex, delay);
        events.emit('webgl_play_audio', 'click-project');
        gsap.delayedCall(delay, () => {
          if (!this.disposed) events.emit('webgl_play_audio', 'enter-project');
        });
        await asyncTasks.wait(delay + 0.75 + 1.25);
      }
    }
    if (this.disposed) return;
    this.currentSection = section;
    events.emit('webgl_router_block_navigation', false);
  }

  enableScroll(): void {
    events.on('wheel', this.onScroll, this);
    events.on('keydown', this.onKeyDown, this);
    events.on('touch_drag', this.onTouchDrag, this);
  }
  disableScroll(): void {
    events.off('wheel', this.onScroll, this);
    events.off('keydown', this.onKeyDown, this);
    events.off('touch_drag', this.onTouchDrag, this);
  }
  onScroll(input: WheelInput): void {
    if (this.scrollBlocked) return;
    this.stopAutoCenter();
    this.scroll.targetY2 += input.delta.y * this.scrollMultiplier;
  }
  onKeyDown(input: KeyboardInput): void {
    if (this.scrollBlocked) return;
    this.stopAutoCenter();
    if (input.key === 'ArrowDown') this.scroll.targetY2 += 150 * this.scrollMultiplier;
    if (input.key === 'ArrowUp') this.scroll.targetY2 -= 150 * this.scrollMultiplier;
  }
  onTouchDrag(input: TouchDragInput): void {
    if (this.scrollBlocked) return;
    this.stopAutoCenter();
    this.scroll.targetY2 += input.delta11.y * 1.25;
  }
  stopAutoCenter(): void {
    if (!this.autoCenter.animating) return;
    gsap.killTweensOf(this.scroll);
    this.autoCenter.animating = false;
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.rejectReady(new Error('Experience disposed before initialization completed'));
    this.disableScroll();
    this.stopAutoCenter();
    events.off('resize', this.resize, this);
    events.off('webgl_router_request_switch_scene', this.routeRequest, this);
    const callbacks = rendering.renderPass?.scene.beforeRenderCbs;
    const index = callbacks?.indexOf(this.renderFrame) ?? -1;
    if (callbacks && index >= 0) callbacks.splice(index, 1);
    if (this.uiPass) rendering.composer?.removePass(this.uiPass);
    if (this.material && this.materialLoad) {
      gsap.killTweensOf([
        this.material.uniforms.uDetailProgress,
        this.material.uniforms.uDetailProgress2,
        this.materialLoad.uniforms.uIntro,
      ]);
    }
    this.landscapeScene?.introTL?.kill();
    this.scrollComposers.forEach((composer) => composer.dispose());
    this.detailComposer?.dispose();
    this.uiScene?.dispose();
    this.mainMesh?.removeFromParent();
    this.material?.dispose();
    this.materialLoad?.dispose();
    if (this.audioController) {
      events.off(
        'webgl_set_audio_volume',
        this.audioController.setAudioVolume,
        this.audioController,
      );
      events.off('webgl_play_audio', this.audioController.playAudio, this.audioController);
      this.audioController._controller.dispose();
    }
  }
}
