// Reconstructed application source. Third-party implementations are npm imports.
import CubeTemperaturevertexShader1 from '../../../shaders/scenes/portfolio/annotations/CubeTemperature/CubeTemperature-vertexShader-1.glsl?raw';
import CubeTemperaturefragmentShader2 from '../../../shaders/scenes/portfolio/annotations/CubeTemperature/CubeTemperature-fragmentShader-2.glsl?raw';
import globalUniformsGLSL from '../../../shaders/chunks/globalUniformsGLSL.glsl?raw';
import matrixFunctions from '../../../shaders/chunks/matrix.glsl?raw';
import falloffFunctions from '../../../shaders/chunks/falloffFunctions.glsl?raw';
import msdfFunctions from '../../../shaders/chunks/msdfFunctions.glsl?raw';
import antialiasedStep from '../../../shaders/chunks/antialiased-step.glsl?raw';
import { composeShader } from '../../../engine/shaders/compose-shader.ts';
import {
  Vector3,
  Int32BufferAttribute,
  PlaneGeometry,
  Float32BufferAttribute,
  ShaderMaterial,
  Color,
  AdditiveBlending,
  Mesh,
} from 'three';
import { MsdfText } from '../../../engine/text/msdf-text.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { runtime } from '../../../engine/rendering/runtime.ts';
import { textures } from '../../../engine/loaders/textures.js';
import { math } from '../../../engine/core/math.js';
import { gsap } from 'gsap';
import { environment } from '../../../engine/core/environment.ts';
import { frameClock } from '../../../engine/core/frame-clock.ts';
const Sp = new Vector3();
const Zx = new Vector3();
class CubeTemperature {
  constructor(parent) {
    this.parent = parent;
    this.ready = new Promise((isReady) => {
      this.isReady = isReady;
    });
    this.isHiding = false;
    this.targetTemp = parent.options.temp;
    this.temp = this.targetTemp;
    this.random1 = Math.random();
    this.random2 = Math.random();
    this.init();
  }
  async init() {
    const e = new MsdfText({
        font: 'IBMPlexMono-Medium',
        text: 'TEMP',
        width: 0.75,
        align: 'left',
        lineHeight: 0.8,
        size: 0.1,
      }),
      t = new MsdfText({
        font: 'IBMPlexMono-Medium',
        text: '.',
        width: 0.75,
        align: 'left',
        lineHeight: 0.8,
        size: 0.1,
      });
    await Promise.all([e.ready, t.ready]);
    const s = e.geometry.clone(),
      n = t.geometry.clone();
    [s, n].forEach((f) => {
      f.deleteAttribute('centr');
      f.deleteAttribute('lineWeights');
      f.deleteAttribute('textWeights');
      f.deleteAttribute('uvMask');
      f.setAttribute(
        'isNum',
        new Int32BufferAttribute(new Int32Array(f.attributes.position.count).fill(-1), 1),
      );
    });
    const r = [s],
      a = 0.045,
      o = new PlaneGeometry(0.06, 0.06);
    o.deleteAttribute('normal');
    o.setAttribute(
      'isNum',
      new Int32BufferAttribute(new Int32Array(o.attributes.position.count).fill(1), 1),
    );
    o.scale(0.77777, 1, 1);
    let l = 0.3,
      c = 0;
    for (let f = 0; f < 8; f++) {
      const p = o.clone();
      if (((l += a), p.translate(l, 0.024 + c, 0), r.push(p), f === 1 || f === 5)) {
        l += 0.025;
        const A = n.clone();
        A.translate(l, c, 0);
        r.push(A);
        l += 0.025;
      }
      if (f === 3) {
        c = -0.1;
        l = 0.3;
        const A = o.clone();
        A.attributes.isNum.array.fill(-2);
        A.translate(l - 0.015, 0.024 + c, 0);
        r.push(A);
      }
    }
    const h = mergeGeometries(r),
      d = [];
    for (let f = 0; f < h.attributes.position.count; f += 4) {
      const p = f / (h.attributes.position.count - 1);
      d.push(p, p, p, p);
    }
    h.setAttribute('textWeight', new Float32BufferAttribute(d, 1));
    const u = new ShaderMaterial({
      uniformsGroups: [runtime.UBO],
      uniforms: {
        tNums: {
          value: textures.load('numbers-datatexture.ktx2', 'data'),
        },
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
      vertexShader: composeShader(CubeTemperaturevertexShader1, {
        globalUniformsGLSL: globalUniformsGLSL,
        matrixFunctions: matrixFunctions,
        falloffFunctions: falloffFunctions,
      }),
      fragmentShader: composeShader(CubeTemperaturefragmentShader2, {
        globalUniformsGLSL: globalUniformsGLSL,
        msdfFunctions: msdfFunctions,
        antialiasedStep: antialiasedStep,
      }),
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: AdditiveBlending,
    });
    this.mesh = new Mesh(h, u);
    this.mesh.name = 'temp numbers';
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 999;
    this.mesh.visible = false;
    this.parent.scene.textsGroup.add(this.mesh);
    this.isReady();
  }
  update(e, t) {
    if (
      (1 - Math.abs(math.fit(t, -1.2, 0.5, -1, 1)) === 0
        ? this.mesh.visible &&
          !this.isHiding &&
          ((this.isHiding = true),
          gsap.to(this.mesh.material.uniforms.uShow1, {
            value: 0,
            duration: 0.2,
            ease: 'none',
            overwrite: true,
            onComplete: () => {
              this.mesh.visible = false;
            },
          }))
        : this.mesh.visible ||
          ((this.mesh.visible = true),
          (this.isHiding = false),
          gsap.to(this.mesh.material.uniforms.uShow1, {
            value: 1,
            duration: 0.4,
            ease: 'none',
            overwrite: true,
          }),
          gsap.fromTo(
            this.mesh.material.uniforms.uShow2,
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
      !this.mesh.visible)
    )
      return;
    const n = this.parent.mesh.geometry.boundingBox;
    Sp.set(
      math.mix(n.min.x, n.max.x, 0.7),
      math.mix(n.max.y, n.min.y, 0.15),
      math.mix(n.min.z, n.max.z, 0.93),
    );
    Sp.applyMatrix4(this.parent.mesh.matrixWorld);
    const r = this.parent.scene._LEFT;
    Zx.copy(Sp).addScaledVector(r, 0.3);
    this.mesh.scale.setScalar(Math.min(0.8, 0.5 / (environment.screen.h / 1300)));
    this.mesh.position.copy(Zx);
    this.temp = this.targetTemp + Math.sin(frameClock.time * 0.05 + this.random1) * 2;
    const a = this.temp.toFixed(2).split('.');
    if (this.temp >= 0) a[0] = `+${a[0]}`;
    if (a[0].length === 2) a[0] = `${a[0][0]}0${a[0][1]}`;
    const o = [...a[0], ...a[1]],
      c = (this.temp * 1.8 + 32).toFixed(2).split('.');
    if (c[0].length === 1) a[0] = `0${c[0]}`;
    const h = [...c[0], ...c[1]],
      d = this.mesh.geometry.attributes.isNum.array;
    [4, 5, 7, 8].forEach((u, f) => {
      const p = Number(h[f]);
      for (let A = 0; A < 4; A++) d[u * 4 + A] = p;
    });
    [10, 11, 13, 14].forEach((u, f) => {
      const p = Number(o[f + 1]);
      for (let A = 0; A < 4; A++) d[u * 4 + A] = p;
    });
    [9].forEach((u, _f) => {
      const p = this.temp < 0 ? -2 : -3;
      for (let A = 0; A < 4; A++) d[u * 4 + A] = p;
    });
    this.mesh.geometry.attributes.isNum.needsUpdate = true;
  }
}
export { Sp, Zx, CubeTemperature };
