/** Native bitmap decoding with the original { bitmap } / { error } protocol.
 * The browser owns the decoder; no copied Three.js implementation is needed.
 */
interface BitmapRequest {
  url: string;
  flipY?: boolean;
}

type BitmapResponse = { bitmap: ImageBitmap } | { error: true; message: string };

interface BitmapWorkerPort {
  onmessage: ((event: MessageEvent<BitmapRequest>) => void) | null;
  postMessage(message: BitmapResponse, transfer: Transferable[]): void;
}

const bitmapWorker = globalThis as unknown as BitmapWorkerPort;

bitmapWorker.onmessage = (event) => {
  void decodeBitmap(event.data);
};

async function decodeBitmap({ url, flipY = false }: BitmapRequest): Promise<void> {
  try {
    const response = await fetch(url, { credentials: 'same-origin' });
    if (!response.ok) throw new Error(`Bitmap request failed: ${response.status} ${url}`);
    const bitmap = await createImageBitmap(await response.blob(), {
      premultiplyAlpha: 'none',
      imageOrientation: flipY ? 'flipY' : 'none',
      colorSpaceConversion: 'none',
    });
    bitmapWorker.postMessage({ bitmap }, [bitmap]);
  } catch (error: unknown) {
    bitmapWorker.postMessage(
      { error: true, message: error instanceof Error ? error.message : String(error) },
      [],
    );
  }
}

export {};
