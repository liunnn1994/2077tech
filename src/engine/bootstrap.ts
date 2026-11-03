import { PCFSoftShadowMap, Vector3, type BufferGeometry, type Camera, type Mesh } from 'three';
import { dracoGeometryLoader } from './loaders/geometries.js';
import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { tick } from 'svelte';
import { ExperienceController } from './ExperienceController.ts';
import { runtime } from './rendering/runtime.ts';
import { environment } from './core/environment.ts';
import { frameClock } from './core/frame-clock.js';
import { events } from './core/events.js';
import type { PointerPayload } from './core/event-types';
import type { Project, Snapshot, StudyRuntime } from '../experience/runtime';

/** The original easing curves are data. GSAP itself now comes from npm. */
function registerSceneEases(): void {
  const curves = {
    inOut5: 'M0,0 C0.171,0 0.77,-0.013 0.842,0.272 0.972,0.794 0.972,0.85 1,1',
    entry_ease: 'M0,0 C0.358,0 0.336,0.209 0.442,0.519 0.59,0.952 0.768,0.918 1,1',
    entry_ease_2: 'M0,0 C0.388,0.082 0.924,0.862 1,1',
    entry_ease_3: 'M0,0 C0.272,0 0.472,0.454 0.496,0.496 0.66,0.79 0.685,1 1,1',
    structure_assembly: 'M0,0 C0.662,0.073 0.047,1 1,1',
  };
  for (const [name, curve] of Object.entries(curves))
    CustomEase.create(name, curve, { precision: 2 });
}

function installHistoryRouter(): () => void {
  let blocked = false;
  const readRoute = (): void => {
    const match = /^\/portfolio\/(pudgy-penguins|overpass)\/?$/.exec(location.pathname);
    events.emit(
      'webgl_router_request_switch_scene',
      match ? 'project' : 'home',
      location.pathname,
      match ? { project: match[1] ?? null } : {},
    );
  };
  const navigate = (value = ''): void => {
    if (blocked) return;
    history.pushState(null, '', value || '/');
    readRoute();
  };
  const block = (value: boolean): void => {
    blocked = value;
  };
  events.on('webgl_switch_scene', navigate);
  events.on('webgl_router_block_navigation', block);
  events.once('webgl_router_start', readRoute);
  window.addEventListener('popstate', readRoute);
  return () => {
    events.off('webgl_switch_scene', navigate);
    events.off('webgl_router_block_navigation', block);
    window.removeEventListener('popstate', readRoute);
  };
}

export async function createExperience(target: HTMLElement): Promise<StudyRuntime> {
  if (!document.createElement('canvas').getContext('webgl2'))
    throw new Error('This experience requires WebGL2.');
  await tick();
  registerSceneEases();
  const stopRouter = installHistoryRouter();
  const dpr =
    devicePixelRatio <= 2 ? Math.min(devicePixelRatio, 1.15) : Math.min(devicePixelRatio, 1.5);
  await runtime.init({
    canvasCnt: target,
    relativePath: '',
    fingers: 2,
    audioContext: true,
    contextMenu: false,
    DPR: dpr || 1,
    adaptiveDPR: true,
    shadowMap: true,
    shadowMapType: PCFSoftShadowMap,
  });
  let rejectAsset!: (reason: Error) => void;
  const assetFailure = new Promise<never>((_resolve, reject) => {
    rejectAsset = reject;
  });
  events.on('asset_error', rejectAsset);
  const controller = new ExperienceController({});
  try {
    await Promise.race([controller.ready, assetFailure]);
  } catch (error) {
    events.emit('webgl_render_active', false);
    stopRouter();
    throw error;
  } finally {
    events.off('asset_error', rejectAsset);
  }
  controller.start();
  let lastSwipe: Snapshot['lastSwipe'] = null;
  const observeSwipe = (pointer: PointerPayload): void => {
    if (pointer.currentInput === 'touch')
      lastSwipe = {
        x: pointer.dragged.x,
        y: pointer.dragged.y,
        velocityX: pointer.swipeVelocity.x,
      };
  };
  events.on('touch_end', observeSwipe);

  function screen(
    mesh: Mesh | undefined,
    camera: Camera = controller.uiScene.camera,
  ): { x: number; y: number } | null {
    if (!mesh) return null;
    const position = new Vector3();
    mesh.geometry.computeBoundingBox();
    mesh.geometry.boundingBox!.getCenter(position);
    mesh.localToWorld(position);
    position.project(camera);
    return {
      x: ((position.x + 1) * environment.screen.width) / 2,
      y: ((1 - position.y) * environment.screen.height) / 2,
    };
  }
  const study: StudyRuntime = {
    snapshot(): Snapshot {
      const gl = runtime.renderer.webgl;
      const project = controller.uiScene.projects.projects[controller.detailIndex];
      return {
        ready: true,
        frame: frameClock.frame,
        time: frameClock.time,
        active: runtime.active,
        renderFrame: gl.info.render.frame,
        section: controller.currentSection,
        detailOpen: controller.isDetailOpen,
        detailIndex: controller.detailIndex,
        muted: controller.audioController._controller.muted,
        scroll: controller.scroll.y,
        targetScroll: controller.scroll.targetY2,
        projectScroll: project?.scrollY ?? 0,
        projectScrollTarget: project?.scrollTargetY ?? 0,
        projectScrollMax: project?.scrollMax ?? 0,
        particleIndex: controller.particleScene.containerparticles.currentLink,
        particleSelectorEnabled: controller.particleScene.containerparticles.UI.enabled,
        particlePointer: {
          x: controller.particleScene.containerparticles.fluidSim.points[0]!.position.x,
          y: controller.particleScene.containerparticles.fluidSim.points[0]!.position.y,
        },
        icePointer: {
          x: controller.landscapeScene.structure.mousePosition.x,
          y: controller.landscapeScene.structure.mousePosition.y,
        },
        logoSeed: controller.uiScene.logo.mesh.material.uniforms.uRand!.value as number,
        lastSwipe,
        frost: controller.portfolioScene.cubes.map((cube) => ({
          x: cube.mouseFrost.splatPosition.x,
          y: cube.mouseFrost.splatPosition.y,
          velocity: cube.mouseFrost.splatVelocity,
        })),
        dpr: runtime.currentDPR,
        width: runtime.renderer.domElement.width,
        height: runtime.renderer.domElement.height,
        scenes: controller.scrollComposers.map((composer) => ({
          name: composer.passes[0].scene.constructor.name,
          visible: composer.passes[0].scene.isSceneVisible,
          height: composer.passes[0].scene.height,
        })),
        drawCalls: gl.info.render.calls,
        triangles: gl.info.render.triangles,
      };
    },
    canvas: () => runtime.renderer.domElement,
    targets() {
      const project = controller.uiScene.projects.projects[controller.detailIndex];
      const particles = controller.particleScene.containerparticles;
      return {
        close: screen(controller.uiScene.close.mesh),
        sound: screen(controller.uiScene.sound.interactionGeo),
        website: screen(project?.elements[5]?.els?.[0]?.interactionMesh),
        logo: screen(controller.uiScene.logo.mesh),
        ...Object.fromEntries(
          (project?.elements[3]?.els ?? []).map((link, index) => [
            `social${index}`,
            screen(link.interactionMesh),
          ]),
        ),
        ...Object.fromEntries(
          controller.portfolioScene.cubes.map((cube, index) => [
            `cube${index}`,
            screen(cube.mesh, controller.portfolioScene.camera),
          ]),
        ),
        particleLeft: screen(particles.UI.arrows.planeLeft, controller.particleScene.camera),
        particleRight: screen(particles.UI.arrows.planeRight, controller.particleScene.camera),
        particleLink: screen(particles.UI.bottom.box, controller.particleScene.camera),
      };
    },
    async geometryAssets(paths: readonly string[]) {
      return Promise.all(
        paths.map(async (path) => {
          const geometry = (await dracoGeometryLoader.loadAsync(path)) as BufferGeometry;
          return {
            path,
            vertices: geometry.getAttribute('position').count,
            indices: geometry.index?.count ?? 0,
          };
        }),
      );
    },
    jump(index: number): void {
      if (controller.isDetailOpen) return;
      const scenes = controller.scrollComposers.map((composer) => composer.passes[0].scene);
      const scene = scenes[index];
      if (!scene) return;
      controller.stopAutoCenter();
      const progress =
        index === 2 ? 0.76 : (scene.initialScrollAutocenter ?? 1 / (scene.height + 1));
      const offset = scenes.slice(0, index).reduce((sum, item) => sum + item.height, 0);
      const position = offset + progress * (scene.height + 1) - 1;
      controller.scroll.y = controller.scroll.targetY1 = controller.scroll.targetY2 = position;
    },
    pause(value: boolean): void {
      gsap.globalTimeline.paused(value);
      events.emit('webgl_render_active', !value);
    },
    mute: () => {
      events.emit('webgl_audio_mute_toggle');
    },
    project: (slug: Project | '') => {
      events.emit('webgl_switch_scene', slug ? `/portfolio/${slug}` : '');
    },
    dispose(): void {
      events.off('touch_end', observeSwipe);
      stopRouter();
      controller.disableScroll();
      events.emit('webgl_render_active', false);
      runtime.dispose({ renderer: true, input: true, audioContext: true });
    },
  };
  return study;
}
