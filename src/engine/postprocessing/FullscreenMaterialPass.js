// Reconstructed application source. Third-party implementations are npm imports.
import { Pass, FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import { ShaderMaterial, UniformsUtils } from 'three';
class FullscreenMaterialPass extends Pass {
  constructor(material, t) {
    super();
    this.textureID = t !== void 0 ? t : 'tDiffuse';
    if (material instanceof ShaderMaterial) {
      this.uniforms = material.uniforms;
      this.material = material;
    } else if (material) {
      this.uniforms = UniformsUtils.clone(material.uniforms);
      this.material = new ShaderMaterial({
        name: material.name !== void 0 ? material.name : 'unspecified',
        defines: Object.assign({}, material.defines),
        uniforms: this.uniforms,
        vertexShader: material.vertexShader,
        fragmentShader: material.fragmentShader,
      });
    }
    this.fsQuad = new FullScreenQuad(this.material);
  }
  render(e, t, s) {
    if (this.uniforms[this.textureID]) this.uniforms[this.textureID].value = s.texture;
    this.fsQuad.material = this.material;
    if (this.renderToScreen) {
      e.setRenderTarget(null);
      this.fsQuad.render(e);
    } else {
      e.setRenderTarget(t);
      if (this.clear) e.clear(e.autoClearColor, e.autoClearDepth, e.autoClearStencil);
      this.fsQuad.render(e);
    }
  }
  dispose() {
    this.material.dispose();
    this.fsQuad.dispose();
  }
}
export { FullscreenMaterialPass };
