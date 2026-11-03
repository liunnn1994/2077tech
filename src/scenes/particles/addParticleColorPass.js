// Reconstructed application source. Third-party implementations are npm imports.
import { FullscreenMaterialPass } from '../../engine/postprocessing/FullscreenMaterialPass.js';
import { ParticleColorMaterial } from './ParticleColorMaterial.js';
function addParticleColorPass(i, e) {
  const t = new FullscreenMaterialPass(new ParticleColorMaterial());
  t.isEntryColorCorrectionPass = true;
  e.addPass(t);
  i.___composerPass = t;
}
export { addParticleColorPass };
