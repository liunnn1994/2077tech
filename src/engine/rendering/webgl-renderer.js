// Reconstructed application source. Third-party implementations are npm imports.
import {} from '../core/private-fields.js';
import {
  Color,
  WebGLRenderer,
  WebGLRenderTarget,
  NearestFilter,
  FloatType,
  Scene,
  ShaderMaterial,
  Mesh,
  OrthographicCamera,
} from 'three';
import { fullscreenTriangle } from '../geometry/shared.js';
class WebGLRendererService {
  constructor() {
    this.webgl = null;
    this.domElement = null;
    this.info = null;
    this.clearColor = new Color('#000000');
    this.clearAlpha = 1;
  }
  init({ shadowMap: e, shadowMapType: t } = {}) {
    this.webgl = new WebGLRenderer({
      alpha: false,
      antialias: false,
      stencil: false,
      depth: false,
    });
    this.webgl.setClearColor(this.clearColor, this.clearAlpha);
    if (e === true) {
      this.webgl.shadowMap.enabled = true;
      if (t) this.webgl.shadowMap.type = t;
    }
    this.domElement = this.webgl.domElement;
    this.domElement.style.display = 'block';
    this.domElement.style.position = 'absolute';
    this.domElement.style.top = '0';
    this.domElement.style.left = '0';
    this.info = this.webgl.info;
    this.webgl.debug.checkShaderErrors = true;
    this.webgl.capabilities.floatLinearFiltering = this.webgl.extensions.has(
      'OES_texture_float_linear',
    );
    this.webgl.capabilities.floatRenderTarget = this.checkFloatRenderTarget();
  }
  checkFloatRenderTarget() {
    const e = new WebGLRenderTarget(1, 1, {
        minFilter: NearestFilter,
        magFilter: NearestFilter,
        type: FloatType,
      }),
      t = new Scene(),
      s = new ShaderMaterial({
        vertexShader: ' void main() { gl_Position = vec4(position, 1.0); } ',
        fragmentShader:
          ' void main() { gl_FragColor.rgb = vec3(0.0, 1.0 / 10.0, 1.0 / 20.0); gl_FragColor.a = 1.0; } ',
      });
    t.add(new Mesh(fullscreenTriangle, s));
    const n = this.webgl.getRenderTarget();
    this.webgl.setRenderTarget(e);
    this.webgl.render(t, new OrthographicCamera(-1, 1, 1, -1, 0, 1));
    const r = new Float32Array(4);
    this.webgl.readRenderTargetPixels(e, 0, 0, 1, 1, r);
    this.webgl.setRenderTarget(n);
    e.dispose();
    s.dispose();
    return !(r[0] !== 0 || r[1] < 0.1 || r[2] < 0.05 || r[3] < 1);
  }
  dispose() {
    this.webgl.dispose();
    this.webgl = null;
    this.domElement = null;
    this.info = null;
  }
}
const rendererService = new WebGLRendererService();
export { WebGLRendererService, rendererService };
