import { Texture } from 'three';
import { WorkerPool, type WorkerFailure } from './worker-pool.ts';
export interface BitmapRequest {
  url: string;
  flipY?: boolean;
}
export type BitmapResponse = { bitmap: ImageBitmap } | WorkerFailure;
export function createBitmapWorker(): Worker {
  return new Worker(new URL('../workers/bitmap.worker.ts', import.meta.url), { type: 'module' });
}
export class BitmapTextureLoader {
  #cache = new Map<string, Promise<Texture<ImageBitmap>>>();
  #path = '';
  #pool = new WorkerPool();
  constructor() {
    this.#pool.setWorkerCreator(createBitmapWorker);
  }
  loadAsync(filename: string, flipY = true): Promise<Texture<ImageBitmap>> {
    const key = filename + '-' + flipY;
    const cached = this.#cache.get(key);
    if (cached) return cached;
    const pending = this.#load(filename, flipY);
    this.#cache.set(key, pending);
    return pending;
  }
  async #load(filename: string, flipY: boolean): Promise<Texture<ImageBitmap>> {
    const { data } = await this.#pool.postMessage<BitmapResponse, BitmapRequest>({
      url: this.#path + filename,
      flipY,
    });
    if ('error' in data) throw new Error(data.message);
    return new Texture(data.bitmap);
  }
  setPath(path: string): void {
    this.#path = path;
  }
  setWorkerLimit(limit: number): this {
    this.#pool.setWorkerLimit(limit);
    return this;
  }
  dispose(): void {
    this.#pool.dispose();
    this.#cache.forEach((pending) => {
      void pending.then(
        (texture) => texture.dispose(),
        () => undefined,
      );
    });
    this.#cache.clear();
  }
}
