// Reconstructed application source. Third-party implementations are npm imports.
import { FullscreenMaterialPass } from '../../engine/postprocessing/FullscreenMaterialPass.js';
import { PortfolioColorMaterial } from './PortfolioColorMaterial.js';
async function addPortfolioColorPass(i, e) {
  const t = new FullscreenMaterialPass(new PortfolioColorMaterial());
  e.addPass(t);
  await t.material.uniforms.tLUT.value._loaded;
}
export { addPortfolioColorPass };
