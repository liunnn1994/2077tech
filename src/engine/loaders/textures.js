import { isDocumentLeaving } from './loading-lifecycle.ts';
// Reconstructed application source. Third-party implementations are npm imports.
import { events } from '../core/events.ts';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import { BitmapTextureLoader } from './bitmap.ts';
import { ExrTextureLoader } from './exr.ts';
import { SvgTextureLoader } from './svg.js';
import {
  TextureLoader,
  Data3DTexture,
  CompressedCubeTexture,
  CompressedTexture,
  DataTexture,
  Texture,
  SRGBColorSpace,
  MirroredRepeatWrapping,
  RepeatWrapping,
  LinearFilter,
  NearestFilter,
  EquirectangularRefractionMapping,
  EquirectangularReflectionMapping,
} from 'three';
import { AutoplayVideoTexture } from './video.js';
import { environment } from '../core/environment.ts';
import { createCurveDataTexture } from './curves.js';
const ktx2TextureLoader = new KTX2Loader().setWorkerLimit(1);
const bitmapTextureLoader = new BitmapTextureLoader().setWorkerLimit(1);
const exrTextureLoader = new ExrTextureLoader().setWorkerLimit(1);
const svgTextureLoader = new SvgTextureLoader();
const imageTextureLoader = new TextureLoader();
const TextureLoaderKind = {
  KTX2: 1,
  BITMAP: 2,
  IMAGE: 3,
  EXR: 4,
  SVG: 5,
  VIDEO: 6,
};
const GR = ['png', 'jpg', 'jpeg'];
const tp = 'uv/uvchecker-srgb.png';
const Sx = 'uv/uvchecker-srgb.ktx2';
const textures = {
  _texturesCache: new Map(),
  load(i = tp, e = 'default') {
    const t = `${i}_<>_${e}`;
    if (this._texturesCache.has(t)) return this._texturesCache.get(t);
    const s = i.split('.').pop(),
      n = e.toLowerCase();
    let r = null,
      a = null;
    if (s.startsWith('ktx2')) {
      r = TextureLoaderKind.KTX2;
      if (n.includes('3d') || n.includes('lut')) a = new Data3DTexture();
      else if (n.includes('cubemap')) a = new CompressedCubeTexture();
      else a = new CompressedTexture();
    } else if (s.startsWith('exr')) {
      r = TextureLoaderKind.EXR;
      a = new DataTexture();
    } else if (s.startsWith('mp4') || s.startsWith('webm')) {
      r = TextureLoaderKind.VIDEO;
      a = new AutoplayVideoTexture(
        `${environment.absolutePath}/assets/${i}`,
        n.includes('autoplay'),
      );
    } else {
      if (s.startsWith('svg')) r = TextureLoaderKind.SVG;
      else if (environment.capabilities.imageBitmap && GR.some((c) => s.startsWith(c)))
        r = TextureLoaderKind.BITMAP;
      else r = TextureLoaderKind.IMAGE;
      a = new Texture();
    }
    this._texturesCache.set(t, a);
    a._url = i;
    a._loadMode = e;
    let o = null;
    a._loaded = new Promise((c) => {
      o = c;
    });
    const l = n.includes('srgb') || i === tp ? SRGBColorSpace : a.colorSpace;
    a.colorSpace = l;
    setTimeout(async () => {
      let c = null;
      try {
        if (r === TextureLoaderKind.KTX2)
          c = await ktx2TextureLoader.loadAsync(`${environment.absolutePath}/assets/images/${i}`);
        else if (r === TextureLoaderKind.EXR) c = await exrTextureLoader.loadAsync(i);
        else if (r === TextureLoaderKind.SVG) c = await svgTextureLoader.loadAsync(i);
        else if (r === TextureLoaderKind.VIDEO) c = await a._videoLoadAsync;
        else if (r === TextureLoaderKind.BITMAP)
          c = await bitmapTextureLoader.loadAsync(i, !n.includes('noflip'));
        else c = await imageTextureLoader.loadAsync(i);
      } catch (h) {
        if (isDocumentLeaving()) return;
        const error = new Error('Texture "' + i + '" failed to load', { cause: h });
        console.error(error);
        events.emit('asset_error', error);
        if (r !== TextureLoaderKind.EXR && r !== TextureLoaderKind.VIDEO && !a.isData3DTexture) {
          a.colorSpace = SRGBColorSpace;
          if (r === TextureLoaderKind.KTX2)
            c = await ktx2TextureLoader.loadAsync(
              `${environment.absolutePath}/assets/images/${Sx}`,
            );
          else if (r === TextureLoaderKind.BITMAP) c = await bitmapTextureLoader.loadAsync(tp);
          else {
            r = TextureLoaderKind.IMAGE;
            c = await imageTextureLoader.loadAsync(Sx);
          }
        }
      }
      if (a !== c) a.copy(c);
      if (n.includes('repeat'))
        if (n.includes('mirror')) {
          a.wrapS = MirroredRepeatWrapping;
          a.wrapT = MirroredRepeatWrapping;
        } else {
          a.wrapS = RepeatWrapping;
          a.wrapT = RepeatWrapping;
        }
      if (n.includes('data')) {
        a.magFilter = LinearFilter;
        a.minFilter = LinearFilter;
      } else if (n.includes('nearest')) {
        a.magFilter = NearestFilter;
        a.minFilter = NearestFilter;
      }
      if (n.includes('nearest') || n.includes('data') || n.includes('nomipmaps'))
        a.generateMipmaps = false;
      if (n.includes('pmrem'))
        if (n.includes('refraction')) a.mapping = EquirectangularRefractionMapping;
        else a.mapping = EquirectangularReflectionMapping;
      if (n.includes('lut'))
        if (n.includes('luttetrahedral')) {
          a.magFilter = NearestFilter;
          a.minFilter = NearestFilter;
        } else {
          a.magFilter = LinearFilter;
          a.minFilter = LinearFilter;
        }
      a.colorSpace = l;
      a.needsUpdate = true;
      o();
    }, 0);
    return a;
  },
  loadCurves(i, e = false, t = 1) {
    const s = `curves_${i}_<>_${e}_<>_${t}`;
    if (this._texturesCache.has(s)) return this._texturesCache.get(s);
    const n = createCurveDataTexture(i, e, t);
    this._texturesCache.set(s, n);
    return n;
  },
  async loadProgressive(url, target, property = 'value') {
    await target[property]._loaded;
    const texture = this.load(url, target[property]._loadMode);
    await texture._loaded;
    target[property] = texture;
    return texture;
  },
};
function configureTexturePaths() {
  ktx2TextureLoader.setTranscoderPath(`${environment.absolutePath}/assets/libs/basis/`);
  // KTX2 requests below already use absolute local URLs. Modern FileLoader
  // applies setPath unconditionally, which would duplicate the origin/path.
  ktx2TextureLoader.setPath('');
  bitmapTextureLoader.setPath(`${environment.absolutePath}/assets/images/`);
  exrTextureLoader.setPath(`${environment.absolutePath}/assets/images/`);
  svgTextureLoader.setPath(`${environment.absolutePath}/assets/images/`);
  imageTextureLoader.setPath(`${environment.absolutePath}/assets/images/`);
}
function disposeTextures() {
  const i = ktx2TextureLoader.workerSourceURL;
  ktx2TextureLoader.workerSourceURL = '';
  ktx2TextureLoader.dispose();
  ktx2TextureLoader.workerSourceURL = i;
  bitmapTextureLoader.dispose();
  exrTextureLoader.dispose();
  svgTextureLoader.dispose();
  textures._texturesCache.forEach((e) => {
    var t;
    return (t = e.dispose) == null ? void 0 : t.call(e);
  });
  textures._texturesCache.clear();
}
export {
  ktx2TextureLoader,
  bitmapTextureLoader,
  exrTextureLoader,
  svgTextureLoader,
  imageTextureLoader,
  TextureLoaderKind,
  GR,
  tp,
  Sx,
  textures,
  configureTexturePaths,
  disposeTextures,
};
