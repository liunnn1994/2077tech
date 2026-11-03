import type {
  BufferGeometry,
  Camera,
  Mesh,
  Scene,
  ShaderMaterial,
  Texture,
  Vector2,
  Vector3,
  WebGLRenderTarget,
} from 'three';
import type { Pass } from 'three/addons/postprocessing/Pass.js';
import type { ExperienceController } from '../ExperienceController';

export type ExperienceSection = 'home' | 'project';
export interface ProjectRouteParameters {
  project?: string;
}
export interface ScrollState {
  total: number;
  targetY1: number;
  targetY2: number;
  y: number;
  velocity: number;
}
export interface AutoCenterState {
  needed: boolean;
  animating: boolean;
  lastTarget: number;
  lastTime: number;
}
export interface WheelInput {
  delta: { y: number };
}
export interface KeyboardInput {
  key: string;
}
export interface TouchDragInput {
  delta11: { y: number };
}

export interface UploadableScene extends Scene {
  camera: Camera;
  uploaded: Promise<void>;
  beforeRenderCbs: Array<() => void>;
  _upload(): Promise<void>;
  dispose(): void;
}
export interface ScrollScene extends UploadableScene {
  height: number;
  progress: number;
  isSceneVisible: boolean;
  __top: number;
  __bottom: number;
  initialScrollAutocenter?: number;
  finalScrollAutocenter?: number;
  autoCenter?(controller: ExperienceController, position: number): void;
}
export interface LandscapeSceneContract extends ScrollScene {
  structure: { mousePosition: Vector3 };
  introTL: gsap.core.Timeline;
  playInAnimation(): PromiseLike<unknown> | void;
}
export interface PortfolioSceneContract extends ScrollScene {
  cubes: ReadonlyArray<{
    options: { centeredProgress: number };
    mesh: Mesh;
    mouseFrost: { splatPosition: Vector2; splatVelocity: number; splatHovered: boolean };
  }>;
  detailAnimationIn(delay?: number): void;
  detailAnimationOut(): void;
}
export interface ParticleSceneContract extends ScrollScene {
  containerparticles: {
    fluidSim: { points: { position: Vector2 }[] };
    currentLink: number;
    vdbs: Texture[];
    UI: {
      enabled: boolean;
      arrows: { planeLeft: Mesh; planeRight: Mesh };
      bottom: { box: Mesh };
    };
  };
}
export interface PointerFeedback {
  finalRT: WebGLRenderTarget;
}
export interface DetailSceneContract extends UploadableScene {
  mouseSim: PointerFeedback;
  playInAnimation(index: number, delay: number): void;
  playOutAnimation(): void;
}
export interface ProjectArticleState {
  scrollY: number;
  scrollTargetY: number;
  scrollMax: number;
  elements: ReadonlyArray<{ els?: ReadonlyArray<{ interactionMesh: Mesh }> }>;
}
export interface OverlaySceneContract extends UploadableScene {
  projects: {
    projects: ReadonlyArray<ProjectArticleState>;
    setMouseSim(feedback: PointerFeedback): void;
  };
  close: { mesh: Mesh };
  sound: { interactionGeo: Mesh };
  logo: { mesh: Mesh<BufferGeometry, ShaderMaterial> };
}
export interface SceneRenderPass<S extends UploadableScene> extends Pass {
  scene: S;
}
export interface SceneComposerContract<S extends UploadableScene> {
  passes: [SceneRenderPass<S>, ...Pass[]];
  readBuffer: WebGLRenderTarget;
  render(delta?: number): void;
  dispose(): void;
}
export interface SceneConstructor<S extends UploadableScene> {
  new (options: { mainController: ExperienceController }): S;
}
export interface ComposerConstructor {
  new <S extends UploadableScene>(options: { scene: S }): SceneComposerContract<S>;
}
export interface ControllerRenderRuntime {
  renderPass: { scene: UploadableScene };
  composer: { addPass(pass: Pass): void; removePass(pass: Pass): void };
}
export interface UniformValue<T> {
  value: T;
}
export type SceneCompositeShader = ShaderMaterial & {
  uniforms: {
    tScene1: UniformValue<Texture | null>;
    tScene2: UniformValue<Texture | null>;
    tDetail: UniformValue<Texture | null>;
    tCubes: UniformValue<Texture | null>;
    uDetailProgress: UniformValue<number>;
    uDetailProgress2: UniformValue<number>;
    uProgress: UniformValue<number>;
    uProgressVel: UniformValue<number>;
    uInCubes: UniformValue<boolean>;
  };
};
export type LoaderCompositeShader = ShaderMaterial & {
  uniforms: { tScene: UniformValue<Texture | null>; uIntro: UniformValue<number> };
};
export interface AudioDirectorContract {
  _controller: { muted: boolean; dispose(): void };
  setAudioVolume(name: string, volume?: number): void;
  playAudio(name: string): void;
}
