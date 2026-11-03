// Reconstructed application source. Third-party implementations are npm imports.
import VolumeSelectorArrowsvertexShader1 from '../../../shaders/scenes/particles/ui/VolumeSelectorArrows/VolumeSelectorArrows-vertexShader-1.glsl?raw';
import VolumeSelectorArrowsfragmentShader2 from '../../../shaders/scenes/particles/ui/VolumeSelectorArrows/VolumeSelectorArrows-fragmentShader-2.glsl?raw';
import {
  Vector3,
  BufferGeometry,
  Float32BufferAttribute,
  ShaderMaterial,
  Color,
  AdditiveBlending,
  LineSegments,
  PlaneGeometry,
  Mesh,
} from 'three';
import { MeshInteraction_Er } from '../../../engine/input/mesh-interaction.js';
import { events } from '../../../engine/core/events.ts';
import { gsap } from 'gsap';
import { environment } from '../../../engine/core/environment.ts';
const Zn = new Vector3();
class VolumeSelectorArrows {
  constructor(parent) {
    this.parent = parent;
    this.ready = new Promise((isReady) => {
      this.isReady = isReady;
    });
    this.init();
  }
  init() {
    const e = new BufferGeometry(),
      t = [],
      s = 0.065;
    t.push(
      ...Zn.set(0, 0, 0).toArray(),
      ...Zn.set(-s, 0, 0).toArray(),
      ...Zn.set(-s, 0, 0).toArray(),
      ...Zn.set(-s * 0.8, s * 0.2, 0).toArray(),
    );
    t.push(
      ...Zn.set(0, 0, 0).toArray(),
      ...Zn.set(s, 0, 0).toArray(),
      ...Zn.set(s, 0, 0).toArray(),
      ...Zn.set(s * 0.8, s * 0.2, 0).toArray(),
    );
    e.setAttribute('position', new Float32BufferAttribute(t, 3));
    const n = [];
    n.push(-1, -1, -1, -1);
    n.push(1, 1, 1, 1);
    e.setAttribute('side', new Float32BufferAttribute(n, 1));
    const r = new ShaderMaterial({
      uniforms: {
        uColor: {
          value: new Color('#ffffff'),
        },
        uWidth: {
          value: 0.3,
        },
        uScale: {
          value: 1,
        },
        uOpacity1: {
          value: 0,
        },
        uOpacity2: {
          value: 0,
        },
      },
      vertexShader: VolumeSelectorArrowsvertexShader1,
      fragmentShader: VolumeSelectorArrowsfragmentShader2,
      blending: AdditiveBlending,
      depthTest: false,
      transparent: true,
    });
    this.mesh = new LineSegments(e, r);
    this.mesh.name = 'arrows';
    this.mesh.renderOrder = 999;
    this.mesh.frustumCulled = false;
    this.parent.group.add(this.mesh);
    const a = new PlaneGeometry(s, s).rotateY(Math.PI),
      o = a.clone().translate(-s * 0.5, 0, 0),
      l = a.clone().translate(s * 0.5, 0, 0);
    this.planeRight = new Mesh(o);
    this.planeRight._arrow = 'right';
    this.planeRight.visible = false;
    this.planeLeft = new Mesh(l);
    this.planeLeft._arrow = 'left';
    this.planeLeft.visible = false;
    this.planeLeft.frustumCulled = false;
    this.planeRight.frustumCulled = false;
    this.interaction = new MeshInteraction_Er({
      meshes: [this.planeLeft, this.planeRight],
      camera: this.parent.parent.scene.camera,
      hoverCursor: true,
      onHover: (c) => {
        if (c.action === 'hover_in') {
          this.show(c.interactions[0].object._arrow, 0.75);
          events.emit('webgl_play_audio', 'logo');
        }
      },
    });
    this.parent.group.add(this.planeLeft);
    this.parent.group.add(this.planeRight);
    this.isReady();
  }
  show(e = 'both', t = 1) {
    if (e === 'right' || e === 'both')
      gsap.fromTo(
        this.mesh.material.uniforms.uOpacity1,
        {
          value: 0,
        },
        {
          value: 1,
          duration: 0.2 * t,
          ease: 'none',
          overwrite: true,
        },
      );
    if (e === 'left' || e === 'both')
      gsap.fromTo(
        this.mesh.material.uniforms.uOpacity2,
        {
          value: 0,
        },
        {
          value: 1,
          duration: 0.2 * t,
          ease: 'none',
          overwrite: true,
        },
      );
    this.interaction.enable();
  }
  hide(e = 'both') {
    if (e === 'right' || e === 'both')
      gsap.fromTo(
        this.mesh.material.uniforms.uOpacity1,
        {
          value: 1,
        },
        {
          value: 0,
          duration: 0.1,
          ease: 'none',
          overwrite: true,
        },
      );
    if (e === 'left' || e === 'both')
      gsap.fromTo(
        this.mesh.material.uniforms.uOpacity2,
        {
          value: 1,
        },
        {
          value: 0,
          duration: 0.1,
          ease: 'none',
          overwrite: true,
        },
      );
    this.interaction.disable();
  }
  update() {
    if (environment.screen.w < environment.screen.h) {
      this.mesh.material.uniforms.uWidth.value = 0.175;
      this.mesh.material.uniforms.uScale.value = 0.75;
      [this.planeLeft, this.planeRight].forEach((e, t) =>
        e.position.set(0.185 * (t === 0 ? 1 : -1), 0, 0),
      );
    } else {
      this.mesh.material.uniforms.uWidth.value = 0.3;
      this.mesh.material.uniforms.uScale.value = 1;
      [this.planeLeft, this.planeRight].forEach((e, t) =>
        e.position.set(0.3 * (t === 0 ? 1 : -1), 0, 0),
      );
    }
  }
}
export { Zn, VolumeSelectorArrows };
