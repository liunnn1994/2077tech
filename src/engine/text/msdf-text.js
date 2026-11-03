// Reconstructed application source. Third-party implementations are npm imports.
import { Mesh, Vector2 } from 'three';
import { createMsdfMaterial } from './msdf-material.js';
import { geometries } from '../loaders/geometries.js';
class MsdfText extends Mesh {
  constructor(_options = {}, t = {}) {
    if (!_options.font) throw new Error('You must specify a MSDF font.');
    super();
    this._options = _options;
    this.name = 'Text (MSDF)';
    this.size = new Vector2();
    this.ready = new Promise((isReady) => {
      this.isReady = isReady;
    });
    this.update().then(() => {
      this.material = createMsdfMaterial(_options.font, t);
      this.isReady();
    });
  }
  _updateSize() {
    var e, t, s, n;
    if (!this.geometry.boundingBox) this.geometry.computeBoundingBox();
    this.size.x =
      Math.abs(this.geometry.boundingBox.min.x) + Math.abs(this.geometry.boundingBox.max.x);
    this.size.y =
      Math.abs(this.geometry.boundingBox.min.y) + Math.abs(this.geometry.boundingBox.max.y);
    if ((t = (e = this.material) == null ? void 0 : e.defines) != null && t.ANIMATION_TRANSLATE)
      this.material.uniforms.uAnimationAmount.value = this.geometry._maxLineHeight;
    else if ((n = (s = this.material) == null ? void 0 : s.defines) != null && n.ANIMATION_MASK)
      this.material.uniforms.uAnimationAmount.value = this.geometry._maxUVDisp;
  }
  async update(e = {}) {
    try {
      const t = this.geometry;
      this.geometry = await geometries.msdf({
        ...this._options,
        ...e,
      });
      this._updateSize();
      t.dispose();
    } catch (t) {
      console.log('Error updating meshText geometry:', t);
    }
  }
}
export { MsdfText };
