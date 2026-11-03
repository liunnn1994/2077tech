import { DataTexture, LinearFilter, type DataTextureLoaderTexData } from 'three';
import { WorkerPool, type WorkerFailure } from './worker-pool.ts';
export interface ExrRequest {
  url: string;
}
export type ExrResponse = DataTextureLoaderTexData | WorkerFailure;
export function createExrWorker(): Worker {
  return new Worker(new URL('../workers/exr.worker.ts', import.meta.url), { type: 'module' });
}
export class ExrTextureLoader {
  readonly exrTextureCache = new Map<string, Promise<DataTexture>>();
  path = '';
  readonly workerPool = new WorkerPool();
  constructor() {
    this.workerPool.setWorkerCreator(createExrWorker);
  }
  loadAsync(filename: string): Promise<DataTexture> {
    const cached = this.exrTextureCache.get(filename);
    if (cached) return cached;
    const pending = this.#load(filename);
    this.exrTextureCache.set(filename, pending);
    return pending;
  }
  async #load(filename: string): Promise<DataTexture> {
    const { data } = await this.workerPool.postMessage<ExrResponse, ExrRequest>({
      url: this.path + filename,
    });
    if ('error' in data) throw new Error(data.message);
    if (!data.data || data.width === undefined || data.height === undefined)
      throw new Error('EXR worker returned no pixel data.');
    const texture = new DataTexture(data.data, data.width, data.height, data.format, data.type);
    if (data.colorSpace !== undefined) texture.colorSpace = data.colorSpace;
    texture.needsUpdate = true;
    texture.minFilter = LinearFilter;
    texture.magFilter = LinearFilter;
    texture.generateMipmaps = false;
    texture.flipY = false;
    return texture;
  }
  setPath(path: string): void {
    this.path = path;
  }
  setWorkerLimit(limit: number): this {
    this.workerPool.setWorkerLimit(limit);
    return this;
  }
  dispose(): void {
    this.workerPool.dispose();
    this.exrTextureCache.forEach((pending) => {
      void pending.then(
        (texture) => texture.dispose(),
        () => undefined,
      );
    });
    this.exrTextureCache.clear();
  }
}
