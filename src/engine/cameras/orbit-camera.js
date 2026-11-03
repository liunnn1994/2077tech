import { PointerPlane } from './pointer-plane.js';
const WD = new PointerPlane();
// Reconstructed application source. Third-party implementations are npm imports.
import { Ha, jt, Yi, rs, fx, dx, Vf } from '../cameras.js';
import { Vector3, Spherical, Vector2 } from 'three';
import { math } from '../core/math.js';
import { environment } from '../core/environment.ts';
import { pointerInput } from '../input/pointer-input.js';
import { events } from '../core/events.ts';
import { createBaseCameraClass } from './base-camera.js';
function withOrbitControls(i) {
  return class extends i {
    constructor() {
      super();
      this.isOrbitCamera = true;
      this.displacement.position.setScalar(0);
      this.displacement.target.setScalar(0);
      this.displacement.rotation = 0;
      this.lerpPosition = 1;
      this.lerpTarget = 1;
      this.lerpRotation = 1;
      this.buttons = {
        ROTATE: 0,
        ZOOM: 1,
        PAN: 2,
      };
      this.touches = {
        ONE: Ha.ROTATE,
        TWO: Ha.ZOOM_PAN,
      };
      this.lerpRotate = 0.075;
      this.lerpZoom = 0.1;
      this.lerpPan = 0.1;
      this.enableRotate = true;
      this.rotateSpeed = 1;
      this.enableZoom = true;
      this.enableMouseZoom = false;
      this.zoomToCursor = false;
      this.zoomSpeed = 1;
      this.zoomSpeedWheel = 0.25;
      this.enablePan = true;
      this.panSpeed = 1;
      this.autoRotate = false;
      this.autoRotateSpeed = 1;
      this.touchResetPan = false;
      this.minDistance = 0;
      this.maxDistance = 1 / 0;
      this.minZoom = 0;
      this.maxZoom = 1 / 0;
      this.minPolarAngle = 0;
      this.maxPolarAngle = Math.PI;
      this.minAzimuthAngle = -1 / 0;
      this.maxAzimuthAngle = 1 / 0;
      this.minPanPosition = new Vector3().setScalar(-1 / 0);
      this.maxPanPosition = new Vector3().setScalar(1 / 0);
      this._spherical = new Spherical();
      this._sphericalDelta = new Spherical();
      this._sphericalTarget = new Spherical();
      this._panDelta = new Vector3();
      this._panTarget = new Vector3();
      this._multiTouchDistance = 0;
      this._multiTouchPosition = new Vector2();
      this._zoomCursorPosition = new Vector2();
      this._zoomDelta = 1;
      this._zoomTarget = 1;
      this._zoomPrev = 1;
      this._state = jt.NONE;
      this._enabled = false;
      this.enable();
    }
    _update() {
      if (
        (this._firstUpdate && this.snap(),
        this.autoRotate &&
          (this._sphericalDelta.theta -=
            ((2 * Math.PI) / 60 / 60) * this.autoRotateSpeed * math.deltaRatio()),
        this.zoomToCursor)
      ) {
        const e = this.isOrthographicCamera ? this._zoomDelta - 1 : 1 - this._sphericalDelta.radius;
        if (e !== 0) {
          Yi.set(
            this._zoomCursorPosition.x / environment.screen.w,
            1 - this._zoomCursorPosition.y / environment.screen.h,
          )
            .multiplyScalar(2)
            .subScalar(1);
          this._panDelta.add(
            rs.subVectors(WD.setCamera(this).unprojectPoint(Yi), this._panTarget).multiplyScalar(e),
          );
        }
      }
      this._sphericalTarget.theta += this._sphericalDelta.theta;
      this._sphericalTarget.phi += this._sphericalDelta.phi;
      this._sphericalTarget.radius *= this._sphericalDelta.radius;
      this._panTarget.add(this._panDelta);
      this._sphericalDelta.set(1, 0, 0);
      this._panDelta.setScalar(0);
      this._sphericalTarget.theta = math.clamp(
        this._sphericalTarget.theta,
        this.minAzimuthAngle,
        this.maxAzimuthAngle,
      );
      this._sphericalTarget.phi = math.clamp(
        this._sphericalTarget.phi,
        this.minPolarAngle,
        this.maxPolarAngle,
      );
      this._sphericalTarget.phi = math.clamp(this._sphericalTarget.phi, fx, Math.PI - fx);
      this._sphericalTarget.radius = math.clamp(
        this._sphericalTarget.radius,
        this.minDistance,
        this.maxDistance,
      );
      this._panTarget.clamp(this.minPanPosition, this.maxPanPosition);
      this._spherical.theta = math.lerpFPS(
        this._spherical.theta,
        this._sphericalTarget.theta,
        this.lerpRotate,
      );
      this._spherical.phi = math.lerpFPS(
        this._spherical.phi,
        this._sphericalTarget.phi,
        this.lerpRotate,
      );
      this._spherical.radius = math.lerpFPS(
        this._spherical.radius,
        this._sphericalTarget.radius,
        this.lerpZoom,
      );
      this.baseTarget.lerp(this._panTarget, math.lerpCoefFPS(this.lerpPan));
      rs.setFromSpherical(this._spherical);
      this.basePosition.copy(this.baseTarget).add(rs);
      if (this.isOrthographicCamera) {
        this._zoomTarget *= this._zoomDelta;
        this._zoomDelta = 1;
        this._zoomTarget = math.clamp(this._zoomTarget, this.minZoom, this.maxZoom);
        this.zoom = math.lerpFPS(this.zoom, this._zoomTarget, this.lerpZoom);
        if (this.zoom !== this._zoomPrev) {
          this._zoomPrev = this.zoom;
          this.updateProjectionMatrix();
        }
      }
      super._update();
    }
    _handleRotateMove(e) {
      Yi.copy(e.delta).multiplyScalar(this.rotateSpeed);
      this._sphericalDelta.theta -= (2 * Math.PI * Yi.x) / environment.screen.h;
      this._sphericalDelta.phi -= (2 * Math.PI * Yi.y) / environment.screen.h;
    }
    _handleZoomMove(e) {
      const t = e.isPinching !== void 0;
      this._zoomCursorPosition.copy(
        e.isMultiTouchZoom ? this._multiTouchPosition : pointerInput.get(0).position,
      );
      let s = e.delta.y;
      if (t) s *= dx * this.zoomSpeedWheel * (e.isPinching ? 10 : 1);
      else s /= dx * environment.screen.h;
      const n = Math.pow(0.95, this.zoomSpeed * Math.abs(s));
      if (this.isPerspectiveCamera) {
        if (s < 0) this._sphericalDelta.radius *= n;
        else if (s > 0) this._sphericalDelta.radius /= n;
      } else if (s < 0) this._zoomDelta /= n;
      else if (s > 0) this._zoomDelta *= n;
    }
    _handlePanMove(e) {
      if ((Yi.copy(e.delta).multiplyScalar(this.panSpeed), this.isPerspectiveCamera)) {
        rs.copy(this.basePosition).sub(this.baseTarget);
        let t = rs.length();
        t *= Math.tan(((this.fov / 2) * Math.PI) / 180);
        this._panLeft((2 * Yi.x * t) / environment.screen.h, this.matrix);
        this._panUp((2 * Yi.y * t) / environment.screen.h, this.matrix);
      } else {
        this._panLeft(
          (Yi.x * (this.right - this.left)) / this.zoom / environment.screen.w,
          this.matrix,
        );
        this._panUp(
          (Yi.y * (this.top - this.bottom)) / this.zoom / environment.screen.h,
          this.matrix,
        );
      }
    }
    _panLeft(e, t) {
      rs.setFromMatrixColumn(t, 0);
      rs.multiplyScalar(-e);
      this._panDelta.add(rs);
    }
    _panUp(e, t) {
      rs.setFromMatrixColumn(t, 1);
      rs.multiplyScalar(e);
      this._panDelta.add(rs);
    }
    _getTouchesDistance() {
      return Yi.subVectors(pointerInput.get(0).position, pointerInput.get(1).position).length();
    }
    _getTouchesMiddle() {
      return Yi.addVectors(
        pointerInput.get(0).position,
        pointerInput.get(1).position,
      ).multiplyScalar(0.5);
    }
    _handleMultitouchMove() {
      if (!(pointerInput.getActive().length < 2)) {
        if (
          (Vf.copy(this._multiTouchPosition),
          this._multiTouchPosition.copy(this._getTouchesMiddle()),
          this.enableZoom)
        ) {
          const e = this._multiTouchDistance;
          this._multiTouchDistance = this._getTouchesDistance();
          this._handleZoomMove({
            delta: {
              y: e - this._multiTouchDistance,
            },
            isMultiTouchZoom: true,
          });
        }
        if (this.enablePan && this._state === jt.ZOOM_PAN)
          this._handlePanMove({
            delta: Yi.subVectors(this._multiTouchPosition, Vf),
          });
        else if (this.enableRotate && this._state === jt.ZOOM_ROTATE)
          this._handleRotateMove({
            delta: Yi.subVectors(this._multiTouchPosition, Vf),
          });
      }
    }
    _wheel(e) {
      if (this.enableZoom)
        if (!(this._state !== jt.NONE && this._state !== jt.ROTATE)) this._handleZoomMove(e);
    }
    _touchStart(e) {
      if (e.currentInput === 'mouse')
        switch (e.button) {
          case this.buttons.ROTATE:
            if (!this.enableRotate) return;
            this._state = jt.ROTATE;
            break;
          case this.buttons.ZOOM:
          case this.buttons.PAN:
            if (!this.enablePan) return;
            this._state = jt.PAN;
            break;
        }
      else
        switch (pointerInput.getActive().length) {
          case 1:
            switch (this.touches.ONE) {
              case Ha.ROTATE:
                if (!this.enableRotate) return;
                this._state = jt.ROTATE;
                break;
              case Ha.PAN:
                if (!this.enablePan) return;
                this._state = jt.PAN;
                break;
              default:
                this._state = jt.NONE;
            }
            break;
          case 2:
            switch (this.touches.TWO) {
              case Ha.ZOOM_PAN:
                if (!this.enableZoom && !this.enablePan) return;
                this._state = jt.ZOOM_PAN;
                this._multiTouchDistance = this._getTouchesDistance();
                this._multiTouchPosition.copy(this._getTouchesMiddle());
                break;
              case Ha.ZOOM_ROTATE:
                if (!this.enableZoom && !this.enableRotate) return;
                this._state = jt.ZOOM_ROTATE;
                this._multiTouchDistance = this._getTouchesDistance();
                this._multiTouchPosition.copy(this._getTouchesMiddle());
                break;
              default:
                this._state = jt.NONE;
            }
            break;
          default:
            this._state = jt.NONE;
        }
    }
    _touchDrag(e) {
      switch (this._state) {
        case jt.ROTATE:
          if (!this.enableRotate) return;
          this._handleRotateMove(e);
          break;
        case jt.ZOOM:
          if (!this.enableZoom) return;
          this._handleZoomMove(e);
          break;
        case jt.PAN:
          if (!this.enablePan) return;
          this._handlePanMove(e);
          break;
        case jt.ZOOM_PAN:
          if (!this.enableZoom && !this.enablePan) return;
          this._handleMultitouchMove();
          break;
        case jt.ZOOM_ROTATE:
          if (!this.enableZoom && !this.enableRotate) return;
          this._handleMultitouchMove();
          break;
      }
    }
    _touchEnd(e) {
      if (this.touchResetPan) this._state = jt.NONE;
      else if (e.currentInput === 'mouse') this._state = jt.NONE;
      else this._touchStart(e);
    }
    snap() {
      rs.copy(this.basePosition).sub(this.baseTarget);
      this._spherical.setFromVector3(rs);
      this._sphericalTarget.copy(this._spherical);
      this._sphericalDelta.set(1, 0, 0);
      this._panTarget.copy(this.baseTarget);
      this._panDelta.setScalar(0);
      this._zoomTarget = this.zoom;
      this._zoomDelta = 1;
    }
    enable() {
      if (!this._enabled) {
        this._enabled = true;
        events.on('touch_start', this._touchStart, this);
        events.on('touch_drag', this._touchDrag, this);
        events.on('touch_end', this._touchEnd, this);
        events.on('touch2_start', this._touchStart, this);
        events.on('touch2_drag', this._touchDrag, this);
        events.on('touch2_end', this._touchEnd, this);
        events.on('wheel', this._wheel, this);
      }
    }
    disable() {
      if (this._enabled) {
        this._enabled = false;
        this._state = jt.NONE;
        events.off('touch_start', this._touchStart, this);
        events.off('touch_drag', this._touchDrag, this);
        events.off('touch_end', this._touchEnd, this);
        events.off('touch2_start', this._touchStart, this);
        events.off('touch2_drag', this._touchDrag, this);
        events.off('touch2_end', this._touchEnd, this);
        events.off('wheel', this._wheel, this);
      }
    }
    dispose() {
      this.disable();
    }
  };
}
function createOrbitCamera(i = 'perspective') {
  const e = createBaseCameraClass(i),
    t = withOrbitControls(e);
  return new t();
}
export { withOrbitControls, createOrbitCamera };
