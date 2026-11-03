// Reconstructed application source. Third-party implementations are npm imports.
import CubePlexusLinesvertexShader1 from '../../../shaders/scenes/portfolio/plexus/CubePlexusLines/CubePlexusLines-vertexShader-1.glsl?raw';
import CubePlexusLinesfragmentShader2 from '../../../shaders/scenes/portfolio/plexus/CubePlexusLines/CubePlexusLines-fragmentShader-2.glsl?raw';
import globalUniformsGLSL from '../../../shaders/chunks/globalUniformsGLSL.glsl?raw';
import falloffFunctions from '../../../shaders/chunks/falloffFunctions.glsl?raw';
import curveFunctions from '../../../shaders/chunks/curveFunctions.glsl?raw';
import sineNoise from '../../../shaders/chunks/sine-noise.glsl?raw';
import { composeShader } from '../../../engine/shaders/compose-shader.ts';
import {
  Vector3,
  BufferGeometry,
  Float32BufferAttribute,
  ShaderMaterial,
  Color,
  AdditiveBlending,
  LineSegments,
} from 'three';
import { runtime } from '../../../engine/rendering/runtime.ts';
import { gsap } from 'gsap';
const Sl = new Vector3();
const Ml = new Vector3();
class CubePlexusLines {
  constructor(parent) {
    this.parent = parent;
    this.scene = this.parent.scene;
    this.maxLines = this.parent.maxPlexusPoints * this.parent.maxConnectionsPerPoint;
    this.ready = new Promise((isReady) => {
      this.isReady = isReady;
    });
    this.init();
  }
  init() {
    const e = new BufferGeometry();
    e.setAttribute(
      'position',
      new Float32BufferAttribute(new Float32Array(this.maxLines * 2 * 3), 3),
    );
    const t = new ShaderMaterial({
      uniformsGroups: [runtime.UBO],
      uniforms: {
        uColor: {
          value: new Color('#7f7f7f'),
        },
        uHoverAnimation: {
          value: false,
        },
        uHoverMix: {
          value: 0,
        },
      },
      vertexShader: CubePlexusLinesvertexShader1,
      fragmentShader: composeShader(CubePlexusLinesfragmentShader2, {
        globalUniformsGLSL: globalUniformsGLSL,
        falloffFunctions: falloffFunctions,
        curveFunctions: curveFunctions,
        sineNoise: sineNoise,
      }),
      depthWrite: false,
      depthTest: true,
      blending: AdditiveBlending,
    });
    this.mesh = new LineSegments(e, t);
    this.mesh.frustumCulled = false;
    this.mesh.name = 'plexus lines';
    this.mesh.renderOrder = 20;
    this.parent.group.add(this.mesh);
    this.hoverTimeline = gsap.timeline({
      paused: true,
    });
    this.hoverTimeline.fromTo(
      t.uniforms.uHoverMix,
      {
        value: 0,
      },
      {
        value: 1,
        duration: 0.075,
        ease: 'none',
      },
    );
    this.hoverTimeline.fromTo(
      t.uniforms.uHoverMix,
      {
        value: -1,
      },
      {
        value: 1,
        duration: 0.075,
        ease: 'none',
      },
    );
    this.hoverTimeline.fromTo(
      t.uniforms.uHoverMix,
      {
        value: -1,
      },
      {
        value: 1,
        duration: 0.075,
        ease: 'none',
      },
    );
    this.hoverTimeline.fromTo(
      t.uniforms.uHoverMix,
      {
        value: 1,
      },
      {
        value: -1,
        duration: 0.25,
        ease: 'power2.out',
      },
    );
    this.isReady();
  }
  update() {
    let e = 0;
    for (let t = 0; t < this.maxLines; t++) {
      Sl.set(0, 0, 0);
      Ml.set(0, 0, 0);
      const s = this.parent.connections[t];
      if (s) {
        Sl.copy(s.pt1.position);
        Ml.lerpVectors(s.pt1.position, s.pt2.position, s.progress);
        e = Math.max(e, s.progress);
      }
      this.mesh.geometry.attributes.position.setXYZ(t * 2, Sl.x, Sl.y, Sl.z);
      this.mesh.geometry.attributes.position.setXYZ(t * 2 + 1, Ml.x, Ml.y, Ml.z);
    }
    if (e > 0) {
      this.mesh.visible = true;
      this.mesh.geometry.attributes.position.needsUpdate = true;
    } else this.mesh.visible = false;
  }
  click() {
    this.mesh.material.uniforms.uHoverAnimation.value = true;
    this.hoverTimeline.play(0);
  }
  resetClick() {
    this.mesh.material.uniforms.uHoverAnimation.value = false;
  }
}
export { Sl, Ml, CubePlexusLines };
