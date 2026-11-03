import { FileLoader, BufferGeometry, BufferAttribute } from 'three';
import { WorkerPool, type WorkerFailure } from './worker-pool.ts';
import type {
  MsdfBounds,
  MsdfGlyph,
  PreparedMsdfFont,
  MsdfLayoutOptions,
  MsdfGeometryBuffers,
} from '../workers/msdf.worker.ts';
export interface MsdfGeometryOptions extends MsdfLayoutOptions {
  font: string;
}
export interface MsdfRequest {
  font: PreparedMsdfFont;
  options: MsdfLayoutOptions;
}
export type MsdfResponse = { buffers: MsdfGeometryBuffers } | WorkerFailure;
export class MsdfGeometry extends BufferGeometry {
  _maxLineHeight = 0;
  _maxUVDisp = 0;
}
export function createMsdfWorker(): Worker {
  return new Worker(new URL('../workers/msdf.worker.ts', import.meta.url), { type: 'module' });
}
function record(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value))
    throw new Error('Invalid MSDF ' + label);
  return value as Record<string, unknown>;
}
function number(value: unknown, label: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value))
    throw new Error('Invalid MSDF ' + label);
  return value;
}
function bounds(value: unknown): MsdfBounds | undefined {
  if (value === undefined) return undefined;
  const box = record(value, 'glyph bounds');
  return {
    left: number(box.left, 'left'),
    right: number(box.right, 'right'),
    bottom: number(box.bottom, 'bottom'),
    top: number(box.top, 'top'),
  };
}
/** Atlas JSON is untrusted input; only layout fields cross the worker boundary. */
export function prepareMsdfFont(value: unknown): PreparedMsdfFont {
  const raw = record(value, 'font');
  const atlas = record(raw.atlas, 'atlas');
  const metrics = record(raw.metrics, 'metrics');
  if (!Array.isArray(raw.glyphs)) throw new Error('MSDF font has no glyph array.');
  const glyphs: Record<string, MsdfGlyph> = {};
  for (const value of raw.glyphs) {
    const glyph = record(value, 'glyph');
    const unicode = number(glyph.unicode, 'unicode');
    const character = String.fromCharCode(unicode);
    glyphs[character] = {
      unicode,
      advance: number(glyph.advance, 'advance'),
      isWhitespace: /\s/.test(character),
      planeBounds: bounds(glyph.planeBounds),
      atlasBounds: bounds(glyph.atlasBounds),
    };
  }
  const placeholderChar = Object.keys(glyphs).sort()[0];
  if (placeholderChar === undefined) throw new Error('MSDF font has no glyphs.');
  const kerning: PreparedMsdfFont['kerning'] = [];
  if (raw.kerning !== undefined && !Array.isArray(raw.kerning))
    throw new Error('Invalid MSDF kerning array.');
  if (Array.isArray(raw.kerning))
    for (const value of raw.kerning) {
      const pair = record(value, 'kerning');
      kerning.push({
        unicode1: number(pair.unicode1, 'unicode1'),
        unicode2: number(pair.unicode2, 'unicode2'),
        advance: number(pair.advance, 'kerning advance'),
      });
    }
  return {
    atlas: {
      width: number(atlas.width, 'atlas width'),
      height: number(atlas.height, 'atlas height'),
    },
    metrics: { lineHeight: number(metrics.lineHeight, 'line height') },
    glyphs,
    kerning,
    placeholderChar,
  };
}
export class MsdfGeometryLoader {
  readonly jsonLoader = new FileLoader().setResponseType('text');
  readonly jsonCache = new Map<string, Promise<PreparedMsdfFont>>();
  readonly workerPool = new WorkerPool();
  #generation = 0;
  constructor() {
    this.workerPool.setWorkerCreator(createMsdfWorker);
  }
  async #loadFont(font: string): Promise<PreparedMsdfFont> {
    const response = await this.jsonLoader.loadAsync(font + '.json');
    if (typeof response !== 'string') throw new Error('MSDF atlas response must be JSON text.');
    const value: unknown = JSON.parse(response);
    return prepareMsdfFont(value);
  }
  async loadAsync(options: MsdfGeometryOptions): Promise<MsdfGeometry> {
    if (!options.font) throw new Error('You must specify a MSDF font.');
    const generation = this.#generation;
    let pending = this.jsonCache.get(options.font);
    if (!pending) {
      pending = this.#loadFont(options.font);
      this.jsonCache.set(options.font, pending);
    }
    const font = await pending;
    if (generation !== this.#generation)
      throw new DOMException('MSDF loader disposed.', 'AbortError');
    const { data } = await this.workerPool.postMessage<MsdfResponse, MsdfRequest>({
      font,
      options,
    });
    if ('error' in data) throw new Error(data.message);
    const buffers = data.buffers;
    const geometry = new MsdfGeometry();
    geometry.setIndex(new BufferAttribute(buffers.index, 1));
    geometry.setAttribute('position', new BufferAttribute(buffers.position, 3));
    geometry.setAttribute('uv', new BufferAttribute(buffers.uv, 2));
    geometry.setAttribute('uvMask', new BufferAttribute(buffers.uvMask, 4));
    geometry.setAttribute('textWeights', new BufferAttribute(buffers.textWeights, 2));
    geometry.setAttribute('lineWeights', new BufferAttribute(buffers.lineWeights, 3));
    geometry.setAttribute('centr', new BufferAttribute(buffers.centr, 3));
    geometry._maxLineHeight = buffers.maxLineHeight;
    geometry._maxUVDisp = buffers.maxUVDisp;
    geometry.computeBoundingBox();
    return geometry;
  }
  setPath(path: string): void {
    this.jsonLoader.setPath(path);
  }
  setWorkerLimit(limit: number): this {
    this.workerPool.setWorkerLimit(limit);
    return this;
  }
  dispose(): void {
    this.#generation++;
    this.workerPool.dispose();
    this.jsonCache.clear();
  }
}
