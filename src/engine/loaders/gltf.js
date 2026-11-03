// Reconstructed application source. Third-party implementations are npm imports.
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { environment } from '../core/environment.ts';
const gltfDracoLoader = new DRACOLoader().setWorkerLimit(1);
const gltfKtx2Loader = new KTX2Loader().setWorkerLimit(1);
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(gltfDracoLoader);
gltfLoader.setKTX2Loader(gltfKtx2Loader);
function configureGltfPaths() {
  gltfDracoLoader.setDecoderPath(`${environment.absolutePath}/assets/libs/draco/`);
  gltfKtx2Loader.setTranscoderPath(`${environment.absolutePath}/assets/libs/basis/`);
  gltfLoader.setPath(`${environment.absolutePath}/assets/gltf/`);
}
function disposeGltfLoaders() {
  gltfDracoLoader.dispose();
  gltfKtx2Loader.dispose();
}
export { gltfDracoLoader, gltfKtx2Loader, gltfLoader, configureGltfPaths, disposeGltfLoaders };
