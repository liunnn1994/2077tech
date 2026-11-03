// Reconstructed application source. Third-party implementations are npm imports.
import { Vector3, Plane } from 'three';
import { cx, hx, Pi, ux } from '../cameras.js';
import { pointerInput } from '../input/pointer-input.js';
import { environment } from '../core/environment.ts';
class PointerPlane {
  constructor({
    camera: _camera = null,
    normal: t = new Vector3(0, 0, -1),
    constant: s = cx,
  } = {}) {
    this._camera = _camera;
    this._plane = new Plane(t, s);
  }
  _unproject(e) {
    hx.setFromCamera(e, this._camera);
    hx.ray.intersectPlane(this._plane, Pi);
    return Pi;
  }
  getTouchPositionOnPlane(e = 0) {
    return this._unproject(pointerInput.get(e).position11);
  }
  getPointPositionOnPlane(e) {
    return this._unproject(e);
  }
  getPointPositionOnScreen(e) {
    Pi.copy(e);
    Pi.project(this._camera);
    Pi.set(((Pi.x + 1) / 2) * environment.screen.w, (-(Pi.y - 1) / 2) * environment.screen.h, Pi.z);
    return Pi;
  }
  setPlaneFromPoint(e) {
    Pi.copy(this._camera.position).sub(e).normalize();
    this._plane.setFromNormalAndCoplanarPoint(Pi, e);
    return this;
  }
  setPlaneFromCameraTarget() {
    return this.setPlaneFromPoint(this._camera.target);
  }
  setPlaneFromCameraTargetAndDistance(e) {
    Pi.copy(this._camera.position).sub(this._camera.target).normalize();
    ux.copy(Pi).negate().multiplyScalar(e).add(this._camera.position);
    this._plane.setFromNormalAndCoplanarPoint(Pi, ux);
    return this;
  }
  setPlaneFromDirectionAndPoint(e, t) {
    Pi.copy(e).normalize();
    this._plane.setFromNormalAndCoplanarPoint(Pi, t);
    return this;
  }
  setDefaultPlane() {
    this._plane.normal.set(0, 0, -1);
    this._plane.constant = cx;
    return this;
  }
  setCamera(_camera) {
    this._camera = _camera;
    return this;
  }
  unprojectFinger(e = 0) {
    return this.setPlaneFromCameraTarget().getTouchPositionOnPlane(e);
  }
  unprojectPoint(e) {
    return this.setPlaneFromCameraTarget().getPointPositionOnPlane(e);
  }
  unprojectDistance(e, t = 0) {
    return this.setPlaneFromCameraTargetAndDistance(e).getTouchPositionOnPlane(t);
  }
  project(e) {
    return this.getPointPositionOnScreen(e);
  }
}
export { PointerPlane };
