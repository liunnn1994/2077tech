// Reconstructed application source. Third-party implementations are npm imports.
import VolumeSelectorLabelsvertexShader1 from '../../../shaders/scenes/particles/ui/VolumeSelectorLabels/VolumeSelectorLabels-vertexShader-1.glsl?raw';
import VolumeSelectorLabelsfragmentShader2 from '../../../shaders/scenes/particles/ui/VolumeSelectorLabels/VolumeSelectorLabels-fragmentShader-2.glsl?raw';
import matrixFunctions from '../../../shaders/chunks/matrix.glsl?raw';
import falloffFunctions from '../../../shaders/chunks/falloffFunctions.glsl?raw';
import msdfFunctions from '../../../shaders/chunks/msdfFunctions.glsl?raw';
import fitFunctions from '../../../shaders/chunks/fit.glsl?raw';
import globalUniformsGLSL from '../../../shaders/chunks/globalUniformsGLSL.glsl?raw';
import { composeShader } from '../../../engine/shaders/compose-shader.ts';
import { Group, Color, AdditiveBlending } from 'three';
import { siteConfig } from '../../../config/site-config.js';
import { MsdfText } from '../../../engine/text/msdf-text.js';
import { runtime } from '../../../engine/rendering/runtime.ts';
import { textures } from '../../../engine/loaders/textures.js';
import { environment } from '../../../engine/core/environment.ts';
import { gsap } from 'gsap';
import { geometryUtils } from '../../../engine/geometry/shared.js';
class VolumeSelectorLabels {
  constructor(parent) {
    this.parent = parent;
    this.ready = new Promise((isReady) => {
      this.isReady = isReady;
    });
    this.group = new Group();
    this.group.name = 'texts';
    this.group.visible = false;
    this.parent.parent.parent.scene.add(this.group);
    this.init();
  }
  async init() {
    await Promise.all(
      siteConfig.links.map((e, t) => {
        const s = new MsdfText(
          {
            font: 'IBMPlexMono-Medium',
            text: e.title,
            width: 10,
            align: 'center',
            lineHeight: 1,
            size: 1,
            baseOffset: -0.25,
          },
          {
            uniformsGroups: [runtime.UBO],
            uniforms: {
              tMap: {
                value: textures.load('../fonts/IBMPlexMono-Medium-datatexture.ktx2', 'data'),
              },
              uColor: {
                value: new Color(siteConfig.colorText),
              },
              uShow1: {
                value: environment.devScene ? 1 : 0,
              },
              uShow2: {
                value: environment.devScene ? 1 : 0,
              },
              uAlpha: {
                value: 1,
              },
              uFadePosition: {
                value: 100,
              },
              uFadeMargin: {
                value: 100,
              },
            },
            vertexShader: composeShader(VolumeSelectorLabelsvertexShader1, {
              matrixFunctions: matrixFunctions,
              falloffFunctions: falloffFunctions,
            }),
            fragmentShader: composeShader(VolumeSelectorLabelsfragmentShader2, {
              msdfFunctions: msdfFunctions,
              fitFunctions: fitFunctions,
              falloffFunctions: falloffFunctions,
              globalUniformsGLSL: globalUniformsGLSL,
            }),
            depthWrite: false,
            depthTest: false,
            blending: AdditiveBlending,
          },
        );
        s._textIndex = t;
        s.name = 'text';
        s.frustumCulled = false;
        s.renderOrder = 9999;
        this.group.add(s);
        return s.ready;
      }),
    );
    this.isReady();
  }
  show(e = 'all', t = 0, s = 1) {
    this.group.visible = true;
    this.group.children.forEach((n, r) => {
      if (e === 'all' || e === r) {
        gsap.set(n.material.uniforms.uAlpha, {
          value: 1,
          overwrite: true,
        });
        gsap.fromTo(
          n.material.uniforms.uShow1,
          {
            value: 0,
          },
          {
            delay: t,
            value: 1,
            duration: 0.4 * s,
            ease: 'sine.out',
            overwrite: true,
          },
        );
        gsap.fromTo(
          n.material.uniforms.uShow2,
          {
            value: 0,
          },
          {
            delay: t,
            value: 1,
            duration: 0.75 * s,
            ease: 'sine.out',
            overwrite: true,
          },
        );
      }
    });
  }
  hide(e = 'all', t = 0, s = 1) {
    this.group.children.forEach((n, r) => {
      if (e === 'all' || e === r) {
        gsap.to(n.material.uniforms.uShow2, {
          delay: t,
          value: 0,
          duration: 0.15 * s,
          ease: 'none',
          overwrite: true,
        });
        gsap.to(n.material.uniforms.uAlpha, {
          delay: t * 1.5,
          value: 0,
          duration: 0.15 * s,
          overwrite: true,
          ease: 'power2.out',
          onComplete: () => {
            this.group.visible = false;
          },
        });
      }
    });
  }
  update() {
    geometryUtils.positionUI({
      camera: this.parent.parent.parent.scene.camera,
      mesh: this.group,
      x: environment.screen.width * 0.5,
      y: this.parent.bottomPosition,
      width: 25,
      height: 25,
    });
    const e = this.parent.mobile ? 6 : this.parent.small ? 7 : 10,
      t = this.group.children.length,
      s = this.parent.parent.parent.currentLink,
      n = (s + 1) % t,
      r = s - 1 < 0 ? t - 1 : s - 1,
      a = this.parent.mobile ? 0.75 : this.parent.small ? 0.8 : 1,
      o = this.parent.mobile ? 50 : this.parent.small ? 70 : 100,
      l = this.parent.mobile ? 110 : this.parent.small ? 140 : 200,
      c = (runtime.uniforms.resolution.value.x * o) / runtime.uniforms.resolutionUI.value.x,
      h = (runtime.uniforms.resolution.value.x * l) / runtime.uniforms.resolutionUI.value.x;
    this.group.children.forEach((d, u) => {
      const f = u === s || u === n || u === r;
      d.visible = f;
      d.scale.setScalar(a);
      if (u === s) d.position.set(0, 0, 0);
      else if (u === n) d.position.set(e, 0, 0);
      else if (u === r) d.position.set(-e, 0, 0);
      d.material.uniforms.uFadePosition.value = c;
      d.material.uniforms.uFadeMargin.value = h;
    });
  }
}
export { VolumeSelectorLabels };
