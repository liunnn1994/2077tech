import { Cache } from 'three';
import type { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { rendererService as recoveredRenderer } from './webgl-renderer.js';
import { audioContextService as recoveredAudio } from '../audio/audio-context.js';
import { globalUniforms, globalUniformGroup } from './global-uniforms.js';
import { environment as recoveredEnvironment } from '../core/environment.ts';
import { AdaptivePixelRatio as RecoveredAdaptivePixelRatio } from './adaptive-dpr.js';
import { pointerInput as recoveredPointer } from '../input/pointer-input.js';
import { wheelInput as recoveredWheel } from '../input/wheel-input.js';
import { keyboardInput as recoveredKeyboard } from '../input/keyboard-input.js';
import { events } from '../core/events.ts';
import { frameClock } from '../core/frame-clock.ts';
import { disposeAudioBuffers, configureAudioPath } from '../loaders/audio.js';
import { disposeGeometries, configureGeometryPaths } from '../loaders/geometries.js';
import { disposeTextures, configureTexturePaths, ktx2TextureLoader } from '../loaders/textures.js';
import { disposeGltfLoaders, configureGltfPaths } from '../loaders/gltf.js';
import { SceneComposer as RecoveredSceneComposer } from './scene-composer.js';
import { RenderScene as RecoveredRenderScene } from './render-scene.js';
import { PostProcessingPass as RecoveredPostProcessingPass } from './postprocessing-pass.js';
import type {
  AdaptivePixelRatioAdapter,
  AdaptivePixelRatioConstructor,
  AudioContextAdapter,
  InitializedRendererService,
  KeyboardInputAdapter,
  PointerInputAdapter,
  PostProcessingPassConstructor,
  RendererServiceAdapter,
  RuntimeDisposalOptions,
  RuntimeEnvironmentAdapter,
  RuntimeInitializationOptions,
  RuntimeRenderPass,
  RuntimeScene,
  RuntimeSceneConstructor,
  SceneComposerConstructor,
  WheelInputAdapter,
} from '../contracts/runtime';

// These narrow boundaries describe recovered JavaScript services while their
// implementations are migrated independently. No arbitrary property access or
// catch-all index signature crosses the TypeScript runtime boundary.
const rendererService = recoveredRenderer as unknown as RendererServiceAdapter;
const environment = recoveredEnvironment as unknown as RuntimeEnvironmentAdapter;
const pointerInput = recoveredPointer as unknown as PointerInputAdapter;
const wheelInput = recoveredWheel as unknown as WheelInputAdapter;
const keyboardInput = recoveredKeyboard as unknown as KeyboardInputAdapter;
const AdaptivePixelRatio = RecoveredAdaptivePixelRatio as unknown as AdaptivePixelRatioConstructor;
const SceneComposer = RecoveredSceneComposer as unknown as SceneComposerConstructor;
const RenderScene = RecoveredRenderScene as unknown as RuntimeSceneConstructor;
const PostProcessingPass = RecoveredPostProcessingPass as unknown as PostProcessingPassConstructor;

/** Renderer, global uniforms, input and final SMAA composition lifecycle. */
export class RenderRuntime {
  #canvasContainer: HTMLElement | null = null;
  #canvasNode: HTMLDivElement | null = null;
  #interactionNode: HTMLElement | null = null;
  #composer: EffectComposer | null = null;
  #renderPass: RuntimeRenderPass | null = null;

  fingers = 1;
  active = false;
  initialDPR = 1;
  currentDPR = 1;
  adaptiveDPR: AdaptivePixelRatioAdapter | null = null;
  readonly audio = recoveredAudio as unknown as AudioContextAdapter;
  readonly uniforms = globalUniforms;
  readonly UBO = globalUniformGroup;

  get canvasCnt(): HTMLElement | null {
    return this.#canvasContainer;
  }
  get canvasNode(): HTMLDivElement | null {
    return this.#canvasNode;
  }

  get renderer(): InitializedRendererService {
    if (!rendererService.webgl || !rendererService.domElement || !rendererService.info) {
      throw new Error('RenderRuntime renderer is unavailable; await runtime.init() first.');
    }
    return rendererService as InitializedRendererService;
  }

  get interactionNode(): HTMLElement {
    if (!this.#interactionNode) throw new Error('RenderRuntime input has not been initialized.');
    return this.#interactionNode;
  }

  get composer(): EffectComposer {
    if (!this.#composer) throw new Error('RenderRuntime composer has not been initialized.');
    return this.#composer;
  }

  get renderPass(): RuntimeRenderPass {
    if (!this.#renderPass) throw new Error('RenderRuntime render pass has not been initialized.');
    return this.#renderPass;
  }

  async init({
    canvasCnt,
    shadowMap,
    relativePath = '',
    shadowMapType,
    interactionNode = null,
    fingers = 1,
    contextMenu = false,
    DPR = 1,
    audioContext = false,
    adaptiveDPR = true,
  }: RuntimeInitializationOptions): Promise<void> {
    this.#configureAssetPaths(relativePath);
    this.#canvasContainer = canvasCnt;
    rendererService.init({ shadowMap, shadowMapType });
    const renderer = this.renderer;
    renderer.info.autoReset = false;

    const canvasNode = document.createElement('div');
    canvasNode.attachShadow({ mode: 'closed' }).append(renderer.domElement);
    this.#canvasNode = canvasNode;
    canvasCnt.prepend(canvasNode);
    ktx2TextureLoader.detectSupport(renderer.webgl);

    // Keep the observed order: initialize sizing/listeners at DPR 1, then emit
    // the second resize after applying the configured adaptive DPR baseline.
    this.#resize(environment.screen.w, environment.screen.h);
    events.on('resize', this.#resize, this);
    events.on('webgl_prerender', this.#updateUniforms, this);
    events.on('webgl_render', this.#render, this);
    events.on('webgl_render_active', this.#setActive, this);
    this.initialDPR = DPR;
    this.adaptiveDPR = adaptiveDPR ? new AdaptivePixelRatio(this) : null;
    this.setDPRMultiplier();

    this.fingers = fingers;
    this.#interactionNode = interactionNode || renderer.domElement;
    pointerInput.init({ element: this.#interactionNode, fingers, contextMenu });
    wheelInput.init({ element: this.#interactionNode });
    keyboardInput.init();
    if (audioContext) this.audio.init();
    this.#createComposer();
  }

  setDPRMultiplier(multiplier = 1): void {
    this.currentDPR = this.initialDPR * multiplier;
    events.emit('resize', environment.screen.w, environment.screen.h);
  }

  setDevScene(scene: RuntimeScene): void {
    this.setRenderScene(scene);
    this.#setActive(true);
  }

  setRenderScene(scene: RuntimeScene): void {
    this.renderPass.scene = scene;
    this.renderPass.camera = scene.camera;
    scene.composer = this.composer;
  }

  dispose({
    audios = true,
    geometries = true,
    textures = true,
    gltf = true,
    threeCache = true,
    renderer = false,
    input = false,
    audioContext = false,
  }: RuntimeDisposalOptions = {}): void {
    if (audios) disposeAudioBuffers();
    if (geometries) disposeGeometries();
    if (textures) disposeTextures();
    if (gltf) disposeGltfLoaders();
    if (threeCache) Cache.clear();
    if (renderer) {
      this.active = false;
      this.adaptiveDPR?.stop();
      events.off('resize', this.#resize, this);
      events.off('webgl_prerender', this.#updateUniforms, this);
      events.off('webgl_render', this.#render, this);
      events.off('webgl_render_active', this.#setActive, this);
      this.#composer?.dispose();
      this.#composer = null;
      this.#renderPass = null;
      this.#canvasNode?.remove();
      this.#canvasContainer = null;
      this.#canvasNode = null;
      rendererService.dispose();
    }
    if (input) {
      pointerInput.dispose();
      wheelInput.dispose();
      keyboardInput.dispose();
      this.#interactionNode = null;
    }
    if (audioContext) this.audio.dispose();
  }

  #configureAssetPaths(relativePath: string): void {
    environment.setRelativePath(relativePath);
    configureAudioPath();
    configureGeometryPaths();
    configureTexturePaths();
    configureGltfPaths();
  }

  #resize(width: number, height: number): void {
    const renderer = this.renderer;
    this.uniforms.resolution.value.set(width, height).multiplyScalar(this.currentDPR).floor();
    this.uniforms.aspect.value =
      this.uniforms.resolution.value.x / this.uniforms.resolution.value.y;
    this.uniforms.resolutionUI.value.set(width, height);
    renderer.webgl.setSize(
      this.uniforms.resolution.value.x,
      this.uniforms.resolution.value.y,
      false,
    );
    renderer.domElement.style.width = `${width}px`;
    renderer.domElement.style.height = `${height}px`;
  }

  #updateUniforms(timeSeconds: number): void {
    this.uniforms.time.value = timeSeconds;
    this.uniforms.dtRatio.value = frameClock.ratio;
  }

  #render(_timeSeconds: number, deltaMilliseconds: number): void {
    if (!this.active) return;
    this.renderer.info.reset();
    this.#composer?.render(deltaMilliseconds);
  }

  #setActive(active: boolean): void {
    if (active && this.adaptiveDPR && !this.adaptiveDPR.hasRun) this.adaptiveDPR.start();
    this.active = active;
  }

  #createComposer(): void {
    const composer = new SceneComposer({ renderToScreen: true });
    this.#composer = composer;
    const scene = new RenderScene();
    const renderer = this.renderer;
    const renderPass = new RenderPass(
      scene,
      scene.camera,
      undefined,
      renderer.clearColor,
      renderer.clearAlpha,
    ) as RuntimeRenderPass;
    this.#renderPass = renderPass;
    composer.addPass(renderPass);
    const smaa = new PostProcessingPass().addSMAA({ quality: 'high' });
    smaa.isGammaCorrectionPass = true;
    composer.addPass(smaa);
  }
}

export const runtime = new RenderRuntime();
