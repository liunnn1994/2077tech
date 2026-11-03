// Reconstructed application source. Third-party implementations are npm imports.
import CubePlexusPointsvertexShader1 from '../../../shaders/scenes/portfolio/plexus/CubePlexusPoints/CubePlexusPoints-vertexShader-1.glsl?raw';
import CubePlexusPointsfragmentShader2 from '../../../shaders/scenes/portfolio/plexus/CubePlexusPoints/CubePlexusPoints-fragmentShader-2.glsl?raw';
import globalUniformsGLSL from '../../../shaders/chunks/globalUniformsGLSL.glsl?raw';
import easingFunctions_Rc from '../../../shaders/chunks/easing.glsl?raw';
import antialiasedStep from '../../../shaders/chunks/antialiased-step.glsl?raw';
import rotateUv from '../../../shaders/chunks/rotate-uv.glsl?raw';
import { composeShader } from '../../../engine/shaders/compose-shader.ts';
import {
  Vector3,
  BufferGeometry,
  Float32BufferAttribute,
  ShaderMaterial,
  Color,
  AdditiveBlending,
  Points,
} from 'three';
import { runtime } from '../../../engine/rendering/runtime.ts';
import { gsap } from 'gsap';
const Mp = new Vector3();
class CubePlexusPoints {
  constructor(parent) {
    this.parent = parent;
    this.scene = this.parent.scene;
    this.ready = new Promise((isReady) => {
      this.isReady = isReady;
    });
    this.init();
  }
  init() {
    const e = new BufferGeometry();
    e.setAttribute(
      'position',
      new Float32BufferAttribute(new Float32Array(this.parent.maxPlexusPoints * 3), 3),
    );
    e.setAttribute(
      'progress',
      new Float32BufferAttribute(new Float32Array(this.parent.maxPlexusPoints), 1),
    );
    const t = new ShaderMaterial({
      uniformsGroups: [runtime.UBO],
      uniforms: {
        uColor: {
          value: new Color('#666666'),
        },
        uSize: {
          value: 50,
        },
        uHover: {
          value: 0,
        },
      },
      vertexShader: composeShader(CubePlexusPointsvertexShader1, {
        globalUniformsGLSL: globalUniformsGLSL,
        easingFunctions_Rc: easingFunctions_Rc,
      }),
      fragmentShader: composeShader(CubePlexusPointsfragmentShader2, {
        globalUniformsGLSL: globalUniformsGLSL,
        antialiasedStep: antialiasedStep,
        rotateUv: rotateUv,
      }),
      depthWrite: false,
      depthTest: true,
      transparent: false,
      blending: AdditiveBlending,
    });
    this.mesh = new Points(e, t);
    this.mesh.frustumCulled = false;
    this.mesh.name = 'plexus points';
    this.mesh.renderOrder = 20;
    this.parent.group.add(this.mesh);
    this.hoverTimeline = gsap.timeline({
      paused: true,
    });
    this.hoverTimeline.fromTo(
      t.uniforms.uHover,
      {
        value: 1,
      },
      {
        value: 0,
        duration: 0.35,
      },
    );
    this.isReady();
  }
  update() {
    let e = 0;
    for (let t = 0; t < this.mesh.geometry.attributes.position.count; t++) {
      const s = this.parent.currentPoints[t];
      Mp.set(0, 0, 0);
      let n = 0;
      if (s) {
        Mp.copy(s.position);
        n = s._displayVar;
      }
      this.mesh.geometry.attributes.position.set(Mp.toArray(), t * 3);
      this.mesh.geometry.attributes.progress.array[t] = n;
      e = Math.max(e, n);
    }
    if (e > 0) {
      this.mesh.visible = true;
      ['position', 'progress'].forEach((t) => {
        this.mesh.geometry.attributes[t].needsUpdate = true;
      });
    } else this.mesh.visible = false;
  }
  click() {
    this.hoverTimeline.play(0);
  }
  resetClick() {
    this.hoverTimeline.pause().progress(0);
  }
}
export { Mp, CubePlexusPoints };
