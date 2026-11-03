// Reconstructed application source. Third-party implementations are npm imports.
import { FullscreenMaterialPass } from '../../engine/postprocessing/FullscreenMaterialPass.js';
import { LandscapeColorMaterial } from './LandscapeColorMaterial.js';
async function addLandscapeColorPass(i, e) {
  const t = new FullscreenMaterialPass(new LandscapeColorMaterial());
  t.isLandscapeColorCorrectionPass = true;
  e.addPass(t);
  await t.material.uniforms.tLUT.value._loaded;
}
export { addLandscapeColorPass };
