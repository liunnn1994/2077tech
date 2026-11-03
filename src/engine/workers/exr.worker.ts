import { HalfFloatType } from 'three';
import type { DataTextureLoaderTexData } from 'three';
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js';

interface ExrRequest {
  url: string;
}

type ExrResponse = DataTextureLoaderTexData | { error: true; message: string };

interface ExrWorkerPort {
  onmessage: ((event: MessageEvent<ExrRequest>) => void) | null;
  postMessage(message: ExrResponse, transfer: Transferable[]): void;
}

const exrWorker = globalThis as unknown as ExrWorkerPort;
// The captured EXR worker also decodes to half floats. This keeps PMREM input
// values and storage precision while obtaining the decoder from the npm addon.
const loader = new EXRLoader().setDataType(HalfFloatType);

exrWorker.onmessage = (event) => {
  void decodeExr(event.data.url);
};

async function decodeExr(url: string): Promise<void> {
  try {
    const response = await fetch(url, { credentials: 'same-origin' });
    if (!response.ok) throw new Error(`EXR request failed: ${response.status} ${url}`);
    const decoded = loader.parse(await response.arrayBuffer());
    if (!decoded.data || decoded.width === undefined || decoded.height === undefined) {
      throw new Error(`EXR decoder returned no image data: ${url}`);
    }
    if (!(decoded.data.buffer instanceof ArrayBuffer)) {
      throw new Error('EXR decoder returned a non-transferable pixel buffer.');
    }
    // Same successful wire shape as the former worker: width, height, data,
    // format, type, colorSpace, and any metadata supplied by the addon.
    exrWorker.postMessage(decoded, [decoded.data.buffer]);
  } catch (error: unknown) {
    exrWorker.postMessage(
      { error: true, message: error instanceof Error ? error.message : String(error) },
      [],
    );
  }
}
