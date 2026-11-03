// Reconstructed application source. Third-party implementations are npm imports.
import CubeDatevertexShader1 from '../../../shaders/scenes/portfolio/annotations/CubeDate/CubeDate-vertexShader-1.glsl?raw';
import CubeDatefragmentShader2 from '../../../shaders/scenes/portfolio/annotations/CubeDate/CubeDate-fragmentShader-2.glsl?raw';
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
import { siteConfig } from '../../../config/site-config.js';
import { textures } from '../../../engine/loaders/textures.js';
import { math } from '../../../engine/core/math.js';
import { gsap } from 'gsap';
import { environment } from '../../../engine/core/environment.ts';
const Cl = new Vector3();
const Cp = new Vector3();
const jx = new Vector3();
class CubeDate {
  constructor(parent) {
    this.parent = parent;
    this.ready = new Promise((isReady) => {
      this.isReady = isReady;
    });
    this.animationProgress = {
      value: 0,
    };
    this.animating = false;
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
    const s = this.parent.options.interior.enabled;
    this.text = new MsdfText(
      {
        font: 'IBMPlexMono-Medium',
        text: `D ${this.parent.options.date.replaceAll('/', '.')}
${(s ? siteConfig.click : siteConfig.clickDisabled).toUpperCase()}`,
        width: 1,
        align: 'right',
        lineHeight: 0.8,
        size: 0.115,
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
        vertexShader: composeShader(CubeDatevertexShader1, {
          matrixFunctions: matrixFunctions,
          falloffFunctions: falloffFunctions,
        }),
        fragmentShader: composeShader(CubeDatefragmentShader2, {
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
      (1 - Math.abs(math.fit(t, -0.6, 1.25, -1, 1)) === 0
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
    Cl.set(
      math.mix(n.min.x, n.max.x, 0.7),
      math.mix(n.max.y, n.min.y, 0.75),
      math.mix(n.min.z, n.max.z, 0.95),
    );
    Cl.applyMatrix4(this.parent.mesh.matrixWorld);
    const r = this.parent.scene._LEFT,
      a = this.parent.scene._UP;
    Cp.copy(Cl).addScaledVector(r, 0.7);
    jx.copy(Cl).lerp(Cp, math.fit(this.animationProgress.value, 0, 0.5, 0, 1));
    this.lineMesh.geometry.setAttribute('position', new Float32BufferAttribute([...Cl, ...jx], 3));
    this.lineMesh.geometry.needsUpdate = true;
    this.text.scale.setScalar(Math.min(0.8, 0.5 / (environment.screen.h / 1300)));
    this.text.position
      .copy(Cp)
      .addScaledVector(a, this.text.size.y * 0.5 * this.text.scale.y + 0.05);
  }
}
export { Cl, Cp, jx, CubeDate };
