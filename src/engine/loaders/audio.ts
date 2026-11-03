import { FileLoader } from 'three';
import { runtime } from '../rendering/runtime.ts';
import { environment } from '../core/environment.ts';
import { isDocumentLeaving } from './loading-lifecycle';
const audioFiles = new FileLoader().setResponseType('arraybuffer');
const buffers = new Map<string, Promise<AudioBuffer | false>>();

/** Browser-native Vorbis decode replaces the captured decoder worker. */
export const audioBufferLoader = {
  load(filename: string): Promise<AudioBuffer | false> {
    const existing = buffers.get(filename);
    if (existing) return existing;
    const pending = (async (): Promise<AudioBuffer | false> => {
      try {
        const bytes = await audioFiles.loadAsync(filename);
        if (!(bytes instanceof ArrayBuffer)) throw new Error('Expected audio bytes.');
        return await runtime.audio.context.decodeAudioData(bytes);
      } catch (error: unknown) {
        if (isDocumentLeaving()) return false;
        console.warn(`Audio decode failed: ${filename}`, error);
        return false;
      }
    })();
    buffers.set(filename, pending);
    return pending;
  },
};
export function configureAudioPath(): void {
  audioFiles.setPath(`${environment.absolutePath}/assets/audio/`);
}
export function disposeAudioBuffers(): void {
  buffers.clear();
}
