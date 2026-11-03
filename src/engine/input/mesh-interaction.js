// Reconstructed application source. Third-party implementations are npm imports.
import { Sphere, Box3, Raycaster, Vector3, Matrix4, Color } from 'three';
import { readPrivateField, initializePrivateField } from '../core/private-fields.js';
import { runtime } from '../rendering/runtime.ts';
import { pointerInput } from './pointer-input.js';
import { events } from '../core/events.ts';
const e3 = new Sphere();
const t3 = new Box3();
var as;
var vd;
const MeshInteraction = class qi {
  constructor({
    meshes: e = [],
    camera: _camera = null,
    onHover: _onHover = null,
    onTouch: _onTouch = null,
    onMove: _onMove = null,
    onDrag: _onDrag = null,
    onClick: _onClick = null,
    ctx: _ctx = null,
    performant: _performant = false,
    performantMode: h = 'bounding_sphere',
    finger: _finger = 0,
    interactWhileTouching: _interactWhileTouching = false,
    hoverCursor: _hoverCursor = false,
    grabCursor: p = false,
  } = {}) {
    if (!_camera) throw new Error('mesh interaction needs a camera');
    this._meshes = Array.isArray(e) ? e : [e];
    this._camera = _camera;
    this._onHover = _onHover;
    this._onTouch = _onTouch;
    this._onMove = _onMove;
    this._onDrag = _onDrag;
    this._onClick = _onClick;
    this._ctx = _ctx;
    this._performant = _performant;
    this._performantMode = readPrivateField(qi, vd)[h.toUpperCase()];
    this._finger = _finger;
    this._eventsID = this._finger === 0 ? 'touch' : `touch${this._finger + 1}`;
    this._interactWhileTouching = _interactWhileTouching;
    this._touchPressed = false;
    this._hoverCursor = _hoverCursor;
    this._grabCursor = p && !_hoverCursor;
    this._raycaster = new Raycaster();
    this._enabled = false;
    this.hovering = false;
    this.hoveringElement = -1;
    this.hoveringInstance = -1;
    this.touching = false;
    this.touchingElement = -1;
    this.touchingInstance = -1;
    this.dragging = false;
  }
  _castRay(e, t) {
    if ((this._raycaster.setFromCamera(e.position11, this._camera), !this._performant))
      return this._checkIntersections(t, this._raycaster.intersectObjects(this._meshes, false));
    const s = [],
      n = this._performantMode === readPrivateField(qi, vd).BOUNDING_SPHERE,
      r = n ? e3 : t3,
      a = n ? 'Sphere' : 'Box',
      o = `bounding${a}`,
      l = `computeBounding${a}`,
      c = `intersects${a}`;
    this._meshes.forEach((h) => {
      if ((!h.isMesh && !h.isSpecialCaseemptyMesh) || !h.layers.test(this._raycaster.layers))
        return;
      const d = h[o] !== void 0 ? h : h.geometry;
      if (d[o] === null) d[l]();
      if (this._raycaster.ray[c](r.copy(d[o]).applyMatrix4(h.matrixWorld)))
        s.push({
          object: h,
        });
    });
    this._checkIntersections(t, s);
  }
  _performHover(e = [], t = 'hover_out', hoveringElement = null, hoveringInstance = -1) {
    this.hovering = t === 'hover_in';
    this.hoveringElement = hoveringElement;
    this.hoveringInstance = hoveringInstance;
    this._callBack(this._onHover, t, e);
    if (this._hoverCursor) runtime.interactionNode.style.cursor = this.hovering ? 'pointer' : '';
    if (this._grabCursor && !this.dragging)
      runtime.interactionNode.style.cursor = this.hovering ? 'grab' : '';
  }
  _performTouch(e = [], t = 'touch_end', touchingElement = null, touchingInstance = -1) {
    this.touching = t === 'touch_start';
    this.touchingElement = touchingElement;
    this.touchingInstance = touchingInstance;
    this._callBack(this._onTouch, t, e);
    if (this._grabCursor)
      runtime.interactionNode.style.cursor = this.touching
        ? 'grabbing'
        : this.hovering
          ? 'grab'
          : '';
  }
  _checkIntersections(e, t) {
    if (t.length > 0) {
      if (e === readPrivateField(qi, as).TOUCH_START || e === readPrivateField(qi, as).TOUCH_MOVE) {
        const s = this._meshes.indexOf(t[0].object),
          n = typeof t[0].instanceId == 'number' ? t[0].instanceId : -1;
        if (this.hovering && (this.hoveringElement !== s || this.hoveringInstance !== n))
          this._performHover();
        if (!this.hovering && (this._interactWhileTouching || !this._touchPressed))
          this._performHover(t, 'hover_in', s, n);
        if (e === readPrivateField(qi, as).TOUCH_START) {
          if (this.touching && (this.touchingElement !== s || this.touchingInstance !== n))
            this._performTouch();
          if (!this.touching && (this._interactWhileTouching || !this._touchPressed)) {
            this._performTouch(t, 'touch_start', s, n);
            this.dragging = true;
          }
        } else this._callBack(this._onMove, 'move', t);
      } else if (e === readPrivateField(qi, as).CLICK) this._callBack(this._onClick, 'click', t);
    } else if (this.hovering) this._performHover();
    if (e === readPrivateField(qi, as).TOUCH_END) {
      if (this.hovering && pointerInput.get(this._finger).currentInput === 'touch')
        this._performHover();
      if (this.touching) this._performTouch();
      this.dragging = false;
    }
    if (e === readPrivateField(qi, as).TOUCH_MOVE && this.dragging)
      this._callBack(this._onDrag, 'drag', t);
  }
  _callBack(e, t, s) {
    if (e)
      e.call(this._ctx, {
        action: t,
        finger: this._finger,
        interactions: s,
        event: pointerInput.get(this._finger),
      });
  }
  _onTouchStart(e) {
    this._castRay(e, readPrivateField(qi, as).TOUCH_START);
    this._touchPressed = true;
  }
  _onTouchMove(e) {
    this._castRay(e, readPrivateField(qi, as).TOUCH_MOVE);
  }
  _onTouchEnd(e) {
    this._touchPressed = false;
    this._castRay(e, readPrivateField(qi, as).TOUCH_END);
  }
  _onTouchClick(e) {
    this._castRay(e, readPrivateField(qi, as).CLICK);
  }
  enable() {
    if (!this._enabled) {
      this._enabled = true;
      if (this._onTouch || this._onHover || this._onDrag)
        events.on(`${this._eventsID}_start`, this._onTouchStart, this);
      if (this._onHover || this._onMove || this._onDrag)
        events.on(`${this._eventsID}_move`, this._onTouchMove, this);
      if (this._onTouch || this._onHover || this._onDrag)
        events.on(`${this._eventsID}_end`, this._onTouchEnd, this);
      if (this._onClick) events.on(`${this._eventsID}_click`, this._onTouchClick, this);
      this._onTouchMove(pointerInput.get(this._finger));
    }
  }
  disable() {
    if (this._enabled) {
      this._enabled = false;
      this._touchPressed = false;
      events.off(`${this._eventsID}_start`, this._onTouchStart, this);
      events.off(`${this._eventsID}_move`, this._onTouchMove, this);
      events.off(`${this._eventsID}_end`, this._onTouchEnd, this);
      events.off(`${this._eventsID}_click`, this._onTouchClick, this);
      this._checkIntersections(readPrivateField(qi, as).TOUCH_END, []);
    }
  }
  dispose() {
    this.disable();
  }
};
{
  as = new WeakMap();
  vd = new WeakMap();
  initializePrivateField(MeshInteraction, as, {
    TOUCH_START: 1,
    TOUCH_MOVE: 2,
    TOUCH_END: 3,
    CLICK: 4,
  });
  initializePrivateField(MeshInteraction, vd, {
    BOUNDING_SPHERE: 1,
    BOUNDING_BOX: 2,
  });
}
let MeshInteraction_Er = MeshInteraction;
new Vector3();
new Vector3();
new Matrix4();
new Matrix4();
new Color();
new Color('#000000');
export { e3, t3, as, vd, MeshInteraction, MeshInteraction_Er };
