import type { Camera, Color, Scene, ShadowMapType, WebGLInfo, WebGLRenderer } from 'three';
import type { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import type { Pass } from 'three/addons/postprocessing/Pass.js';
import type { RenderPass } from 'three/addons/postprocessing/RenderPass.js';

export interface RendererInitializationOptions {
  shadowMap?: boolean;
  shadowMapType?: ShadowMapType;
}

/** Accurate state of the recovered service before init and after disposal. */
export interface RendererServiceAdapter {
  webgl: WebGLRenderer | null;
  domElement: HTMLCanvasElement | null;
  info: WebGLInfo | null;
  clearColor: Color;
  clearAlpha: number;
  init(options: RendererInitializationOptions): void;
  dispose(): void;
}

/** Returned only after RenderRuntime has checked all initialization results. */
export interface InitializedRendererService extends RendererServiceAdapter {
  webgl: WebGLRenderer;
  domElement: HTMLCanvasElement;
  info: WebGLInfo;
}

export interface RuntimeInitializationOptions extends RendererInitializationOptions {
  canvasCnt: HTMLElement;
  relativePath?: string;
  interactionNode?: HTMLElement | null;
  fingers?: number;
  contextMenu?: boolean;
  DPR?: number;
  audioContext?: boolean;
  adaptiveDPR?: boolean;
}

export interface RuntimeDisposalOptions {
  audios?: boolean;
  geometries?: boolean;
  textures?: boolean;
  gltf?: boolean;
  threeCache?: boolean;
  renderer?: boolean;
  input?: boolean;
  audioContext?: boolean;
}

export interface DprRuntimeHost {
  setDPRMultiplier(multiplier?: number): void;
}

export interface AdaptivePixelRatioAdapter {
  readonly hasRun: boolean;
  readonly multiplier: number;
  start(): void;
  stop(): void;
}

export interface AdaptivePixelRatioConstructor {
  new (runtime: DprRuntimeHost): AdaptivePixelRatioAdapter;
}

export interface RuntimeScene extends Scene {
  camera: Camera;
  composer: EffectComposer | null;
  ready: Promise<void>;
  uploaded: Promise<void>;
  beforeRenderCbs: Array<() => void>;
  _upload(): Promise<void>;
  dispose(): void;
}

export type RuntimeRenderPass = RenderPass & { scene: RuntimeScene };

export interface RuntimeSceneConstructor {
  new (): RuntimeScene;
}

export interface SceneComposerConstructor {
  new (options: { renderToScreen: boolean }): EffectComposer;
}

export interface SmaaPostProcessingPass extends Pass {
  isGammaCorrectionPass: boolean;
  addSMAA(options: { quality: 'low' | 'medium' | 'high' | 'ultra' }): this;
}

export interface PostProcessingPassConstructor {
  new (): SmaaPostProcessingPass;
}

export interface PointerInputAdapter {
  init(options: { element: HTMLElement; fingers: number; contextMenu: boolean }): void;
  dispose(): void;
}

export interface WheelInputAdapter {
  init(options: { element: HTMLElement }): void;
  dispose(): void;
}

export interface KeyboardInputAdapter {
  init(): void;
  dispose(): void;
}

export interface AudioContextAdapter {
  context: AudioContext;
  contextReady: Promise<void>;
  contextStarted: boolean;
  preventSuspend: boolean;
  preventResume: boolean;
  init(): void;
  suspend(): Promise<void> | undefined;
  resume(): Promise<void> | undefined;
  dispose(): void;
}

export interface RuntimeEnvironmentAdapter {
  screen: { w: number; h: number };
  setRelativePath(path: string): void;
}
