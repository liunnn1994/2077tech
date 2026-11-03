export type Project = 'pudgy-penguins' | 'overpass';
export interface Snapshot {
  ready: boolean;
  frame: number;
  time: number;
  active: boolean;
  renderFrame: number;
  section: string | null;
  detailOpen: boolean;
  detailIndex: number;
  muted: boolean;
  scroll: number;
  targetScroll: number;
  projectScroll: number;
  projectScrollTarget: number;
  projectScrollMax: number;
  particleIndex: number;
  particleSelectorEnabled: boolean;
  particlePointer: { x: number; y: number };
  icePointer: { x: number; y: number };
  logoSeed: number;
  lastSwipe: { x: number; y: number; velocityX: number } | null;
  frost: { x: number; y: number; velocity: number }[];
  dpr: number;
  width: number;
  height: number;
  scenes: { name: string; visible: boolean; height: number }[];
  drawCalls: number;
  triangles: number;
}
export interface StudyRuntime {
  snapshot(): Snapshot;
  canvas(): HTMLCanvasElement;
  targets(): Record<string, { x: number; y: number } | null>;
  jump(index: number): void;
  pause(value: boolean): void;
  mute(): void;
  project(slug: Project | ''): void;
  geometryAssets(
    paths: readonly string[],
  ): Promise<{ path: string; vertices: number; indices: number }[]>;
  dispose(): void;
}
declare global {
  interface Window {
    __DEMO_STUDY__?: StudyRuntime;
  }
}

export async function mountExperience(target: HTMLElement): Promise<StudyRuntime> {
  const { createExperience } = await import('../engine/bootstrap');
  const study = await createExperience(target);
  window.__DEMO_STUDY__ = study;
  return study;
}

// Original social links are retained as data. Offline clicks display their
// destination locally instead of initiating a request to another website.
export function containOutboundLinks(onLink: (url: string) => void): () => void {
  const original = window.open;
  window.open = ((url?: string | URL) => {
    const destination = String(url ?? '');
    onLink(destination);
    return { focus() {} } as unknown as Window;
  }) as typeof window.open;
  return () => {
    window.open = original;
  };
}
