// Reconstructed application source. Third-party implementations are npm imports.
import { PerspectiveCamera, OrthographicCamera, Vector2, Vector3, Spherical } from 'three';
import { environment } from '../core/environment.ts';
import { ox, lx, HD, Ch, Ks, Gr, Qf, ax, Kn, GD } from '../cameras.js';
import { pointerInput } from '../input/pointer-input.js';
import { math, noise } from '../core/math.js';
import { frameClock } from '../core/frame-clock.ts';
const CameraProjection = {
  PERSPECTIVE: 1,
  ORTHOGRAPHIC: 2,
};
const CameraSizing = {
  SCREEN: 1,
  CUSTOM: 2,
};
function createBaseCameraClass(i) {
  const e = CameraProjection[i.toUpperCase()],
    t = e === CameraProjection.PERSPECTIVE ? PerspectiveCamera : OrthographicCamera;
  return class extends t {
    constructor() {
      if (e === CameraProjection.PERSPECTIVE)
        super(45, environment.screen.w / environment.screen.h, ox, lx);
      else
        super(
          environment.screen.w * -0.5,
          environment.screen.w * 0.5,
          environment.screen.h * 0.5,
          environment.screen.h * -0.5,
          ox,
          lx,
        );
      this.isBaseCamera = true;
      this._sizing = CameraSizing.SCREEN;
      this._size = new Vector2(environment.screen.w, environment.screen.h);
      this._firstUpdate = true;
      this._prevSize = this._size.clone();
      this._prevPosition = new Vector3();
      this._prevTarget = new Vector3();
      this._prevUp = new Vector3();
      this._additionalSphericalPosition = new Spherical();
      this._additionalSphericalTarget = new Spherical();
      this._additionalRotationUp = 0;
      this.target = new Vector3();
      this.basePosition = new Vector3(0, 0, HD);
      this.baseTarget = new Vector3();
      this.baseUp = new Vector3(0, 1, 0);
      this.displacement = {
        position: new Vector2(),
        target: new Vector2(),
        rotation: 0,
      };
      this.lerpPosition = 0.035;
      this.lerpTarget = 0.035;
      this.lerpRotation = 0.035;
      this.shake = new Vector3();
      this.shakeSpeed = new Vector3(1, 1, 1);
      this.touchAmount = 1;
      this.resetOnTouch = true;
    }
    _update() {
      if (this._firstUpdate) this._firstUpdate = false;
      const s =
          this.resetOnTouch &&
          pointerInput.get(0).currentInput === 'touch' &&
          !pointerInput.get(0).touching,
        n = s ? 0.5 : 1,
        r = math.fit(s ? 0 : pointerInput.get(0).position11.x, -1, 1, -Ch, Ch) * this.touchAmount,
        a = math.fit(s ? 0 : pointerInput.get(0).position11.y, 1, -1, -Ch, Ch) * this.touchAmount;
      if (
        (Ks.subVectors(this.basePosition, this.baseTarget),
        Ks.lengthSq() === 0 && (Ks.z = 1),
        Ks.normalize(),
        Gr.crossVectors(this.baseUp, Ks),
        Gr.lengthSq() === 0 &&
          (Math.abs(this.baseUp.z) === 1 ? (Ks.x += 1e-4) : (Ks.z += 1e-4),
          Ks.normalize(),
          Gr.crossVectors(this.baseUp, Ks)),
        Gr.normalize(),
        Qf.crossVectors(Ks, Gr),
        this.displacement.position.equals(ax)
          ? (this.position.copy(this.basePosition), this._additionalSphericalPosition.set(1, 0, 0))
          : ((this._additionalSphericalPosition.theta = math.lerpFPS(
              this._additionalSphericalPosition.theta,
              r * this.displacement.position.x,
              this.lerpPosition * n,
            )),
            (this._additionalSphericalPosition.phi = math.lerpFPS(
              this._additionalSphericalPosition.phi,
              a * this.displacement.position.y,
              this.lerpPosition * n,
            )),
            Kn.subVectors(this.basePosition, this.baseTarget),
            Kn.applyAxisAngle(Gr, this._additionalSphericalPosition.phi).applyAxisAngle(
              Qf,
              this._additionalSphericalPosition.theta,
            ),
            this.position.copy(this.baseTarget).add(Kn)),
        this.displacement.target.equals(ax) && this.shake.x === 0 && this.shake.y === 0)
      ) {
        this.target.copy(this.baseTarget);
        this._additionalSphericalTarget.set(1, 0, 0);
      } else {
        this._additionalSphericalTarget.theta = math.lerpFPS(
          this._additionalSphericalTarget.theta,
          r * this.displacement.target.x,
          this.lerpTarget * n,
        );
        this._additionalSphericalTarget.phi = math.lerpFPS(
          this._additionalSphericalTarget.phi,
          a * this.displacement.target.y,
          this.lerpTarget * n,
        );
        const o =
            this.shake.x === 0
              ? 0
              : noise.sineNoise1(12.23, 3.44, -3.234 + frameClock.time * this.shakeSpeed.x) *
                this.shake.x *
                this.touchAmount,
          l =
            this.shake.y === 0
              ? 0
              : noise.sineNoise1(-2.45, 4.789, 7.343 + frameClock.time * this.shakeSpeed.y) *
                this.shake.y *
                this.touchAmount;
        Kn.subVectors(this.baseTarget, this.basePosition);
        Kn.applyAxisAngle(Gr, this._additionalSphericalTarget.phi + l).applyAxisAngle(
          Qf,
          this._additionalSphericalTarget.theta + o,
        );
        this.target.copy(this.basePosition).add(Kn);
      }
      if (this.displacement.rotation === 0 && this.shake.z === 0) {
        this.up.copy(this.baseUp);
        this._additionalRotationUp = 0;
      } else {
        this._additionalRotationUp = math.lerpFPS(
          this._additionalRotationUp,
          pointerInput.get(0).velocity.x * this.displacement.rotation * this.touchAmount,
          this.lerpRotation * n,
        );
        const o =
          this.shake.z === 0
            ? 0
            : noise.sineNoise1(23.434, -1.565, 8.454 + frameClock.time * this.shakeSpeed.z) *
              this.shake.z *
              this.touchAmount;
        Kn.subVectors(this.position, this.target).normalize();
        this.up.copy(this.baseUp).applyAxisAngle(Kn, this._additionalRotationUp + o);
      }
      if (
        !this.position.equals(this._prevPosition) ||
        !this.target.equals(this._prevTarget) ||
        !this.up.equals(this._prevUp)
      ) {
        this._prevPosition.copy(this.position);
        this._prevTarget.copy(this.target);
        this._prevUp.copy(this.up);
        this.quaternion.setFromRotationMatrix(GD.lookAt(this.position, this.target, this.up));
      }
    }
    _resize() {
      if (
        (this._sizing === CameraSizing.SCREEN &&
          this._size.set(environment.screen.w, environment.screen.h),
        !this._prevSize.equals(this._size))
      ) {
        if ((this._prevSize.copy(this._size), this.isPerspectiveCamera))
          this.aspect = this._size.x / this._size.y;
        else {
          const s = this._size.x * 0.5,
            n = this._size.y * 0.5;
          this.left = -s;
          this.right = s;
          this.top = n;
          this.bottom = -n;
        }
        this.updateProjectionMatrix();
      }
    }
    setCustomSize(s, n) {
      this._sizing = CameraSizing.CUSTOM;
      this._size.set(s, n);
    }
  };
}
function createCamera(i = 'perspective') {
  const e = createBaseCameraClass(i);
  return new e();
}
export { CameraProjection, CameraSizing, createBaseCameraClass, createCamera };
