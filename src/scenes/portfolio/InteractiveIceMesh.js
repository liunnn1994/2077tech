// Reconstructed application source. Third-party implementations are npm imports.
import { Mesh } from 'three';
import { acceleratedRaycast } from 'three-mesh-bvh';
class InteractiveIceMesh extends Mesh {}
InteractiveIceMesh.prototype.raycast = acceleratedRaycast;
export { InteractiveIceMesh };
