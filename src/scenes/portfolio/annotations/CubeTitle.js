// Reconstructed application source. Third-party implementations are npm imports.
import CubeTitlevertexShader1 from '../../../shaders/scenes/portfolio/annotations/CubeTitle/CubeTitle-vertexShader-1.glsl?raw';
import CubeTitlefragmentShader2 from '../../../shaders/scenes/portfolio/annotations/CubeTitle/CubeTitle-fragmentShader-2.glsl?raw';
import matrixFunctions from '../../../shaders/chunks/matrix.glsl?raw';
import falloffFunctions from '../../../shaders/chunks/falloffFunctions.glsl?raw';
import msdfFunctions from '../../../shaders/chunks/msdfFunctions.glsl?raw';
import fitFunctions from '../../../shaders/chunks/fit.glsl?raw';
import { composeShader } from '../../../engine/shaders/compose-shader.ts';
import {
  Vector3,
  BufferGeometry,
  LineBasicMaterial,
  AdditiveBlending,
  LineSegments,
  Color,
  Float32BufferAttribute,
} from 'three';
import { MsdfText } from '../../../engine/text/msdf-text.js';
import { textures } from '../../../engine/loaders/textures.js';
import { math } from '../../../engine/core/math.js';
import { gsap } from 'gsap';
import { environment } from '../../../engine/core/environment.ts';
const El = new Vector3();
const wp = new Vector3();
const Ep = new Vector3();
const Wh = new Vector3();
const Jx = new Vector3();
class CubeTitle {
  constructor(parent) {
    this.parent = parent;
    this.ready = new Promise((isReady) => {
      this.isReady = isReady;
    });
    this.animationProgress = {
      value: 0,
    };
    this.isHiding = false;
    this.init();
  }
  async init() {
    const e = new BufferGeometry(),
      t = new LineBasicMaterial({
        color: '#ffffff',
        opacity: 1,
        transparent: true,
      });
    t.depthTest = false;
    t.depthWrite = false;
    t.blending = AdditiveBlending;
    this.lineMesh = new LineSegments(e, t);
    this.lineMesh.frustumCulled = false;
    this.lineMesh.visible = false;
    this.lineMesh.name = 'title lines';
    this.lineMesh.renderOrder = 999;
    this.parent.scene.textsGroup.add(this.lineMesh);
    this.text = new MsdfText(
      {
        font: 'IBMPlexMono-Medium',
        text: this.parent.options.title.toUpperCase(),
        width: 1,
        align: 'left',
        lineHeight: 0.8,
        size: 0.13,
      },
      {
        uniforms: {
          tMap: {
            value: textures.load('../fonts/IBMPlexMono-Medium-datatexture.ktx2', 'data'),
          },
          uColor: {
            value: new Color('#ffffff'),
          },
          uShow1: {
            value: 0,
          },
          uShow2: {
            value: 0,
          },
        },
        vertexShader: composeShader(CubeTitlevertexShader1, {
          matrixFunctions: matrixFunctions,
          falloffFunctions: falloffFunctions,
        }),
        fragmentShader: composeShader(CubeTitlefragmentShader2, {
          msdfFunctions: msdfFunctions,
          fitFunctions: fitFunctions,
          falloffFunctions: falloffFunctions,
        }),
        depthWrite: false,
        depthTest: false,
        blending: AdditiveBlending,
      },
    );
    this.text.name = 'title text';
    this.text.frustumCulled = false;
    this.text.visible = false;
    this.text.renderOrder = 999;
    this.parent.scene.textsGroup.add(this.text);
    await this.text.ready;
    this.isReady();
  }
  update(e, t) {
    if (
      (1 - Math.abs(math.fit(t, -1.6, 0.5, -1, 1)) === 0
        ? this.lineMesh.visible &&
          !this.isHiding &&
          ((this.isHiding = true),
          gsap.to(this.animationProgress, {
            value: 0,
            duration: 0.2,
            ease: 'none',
            overwrite: true,
            onComplete: () => {
              this.lineMesh.visible = false;
              this.isHiding = false;
            },
          }),
          gsap.to(this.text.material.uniforms.uShow1, {
            value: 0,
            duration: 0.2,
            ease: 'none',
            overwrite: true,
            onComplete: () => {
              this.text.visible = false;
            },
          }))
        : this.lineMesh.visible ||
          ((this.lineMesh.visible = true),
          (this.text.visible = true),
          (this.isHiding = false),
          gsap.to(this.animationProgress, {
            value: 1,
            duration: 0.2,
            ease: 'none',
            overwrite: true,
          }),
          gsap.to(this.text.material.uniforms.uShow1, {
            value: 1,
            duration: 0.4,
            ease: 'none',
            overwrite: true,
          }),
          gsap.fromTo(
            this.text.material.uniforms.uShow2,
            {
              value: 0,
            },
            {
              value: 1,
              duration: 0.75,
              ease: 'none',
              overwrite: true,
            },
          ),
          this.parent.texts.playBeep()),
      !this.lineMesh.visible)
    )
      return;
    const n = this.parent.mesh.geometry.boundingBox;
    El.set(
      math.mix(n.min.x, n.max.x, 0.35),
      math.mix(n.max.y, n.min.y, 0.15),
      math.mix(n.min.z, n.max.z, 0.93),
    );
    El.applyMatrix4(this.parent.mesh.matrixWorld);
    const r = this.parent.scene._LEFT,
      a = this.parent.scene._UP;
    wp.copy(El).addScaledVector(r, -0.3).addScaledVector(a, 0.3);
    Ep.copy(wp).addScaledVector(r, -0.5);
    Wh.copy(El).lerp(wp, math.fit(this.animationProgress.value, 0, 0.5, 0, 1));
    Jx.copy(Wh).lerp(Ep, math.fit(this.animationProgress.value, 0.5, 1, 0, 1));
    this.lineMesh.geometry.setAttribute(
      'position',
      new Float32BufferAttribute([...El, ...Wh, ...Wh, ...Jx], 3),
    );
    this.lineMesh.geometry.needsUpdate = true;
    this.text.scale.setScalar(Math.min(0.8, 0.5 / (environment.screen.h / 1300)));
    this.text.position
      .copy(Ep)
      .addScaledVector(a, this.text.size.y * 0.5 * this.text.scale.y + 0.05);
  }
}
export { El, wp, Ep, Wh, Jx, CubeTitle };
