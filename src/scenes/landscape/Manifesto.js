// Reconstructed application source. Third-party implementations are npm imports.
import ManifestovertexShader1 from '../../shaders/scenes/landscape/Manifesto/Manifesto-vertexShader-1.glsl?raw';
import ManifestofragmentShader2 from '../../shaders/scenes/landscape/Manifesto/Manifesto-fragmentShader-2.glsl?raw';
import ManifestovertexShader3 from '../../shaders/scenes/landscape/Manifesto/Manifesto-vertexShader-3.glsl?raw';
import ManifestofragmentShader4 from '../../shaders/scenes/landscape/Manifesto/Manifesto-fragmentShader-4.glsl?raw';
import ManifestovertexShader5 from '../../shaders/scenes/landscape/Manifesto/Manifesto-vertexShader-5.glsl?raw';
import ManifestofragmentShader6 from '../../shaders/scenes/landscape/Manifesto/Manifesto-fragmentShader-6.glsl?raw';
import ManifestovertexShader7 from '../../shaders/scenes/landscape/Manifesto/Manifesto-vertexShader-7.glsl?raw';
import ManifestofragmentShader8 from '../../shaders/scenes/landscape/Manifesto/Manifesto-fragmentShader-8.glsl?raw';
import matrixFunctions from '../../shaders/chunks/matrix.glsl?raw';
import falloffFunctions from '../../shaders/chunks/falloffFunctions.glsl?raw';
import msdfFunctions from '../../shaders/chunks/msdfFunctions.glsl?raw';
import fitFunctions from '../../shaders/chunks/fit.glsl?raw';
import { composeShader } from '../../engine/shaders/compose-shader.ts';
import { MsdfText } from '../../engine/text/msdf-text.js';
import { siteConfig } from '../../config/site-config.js';
import { textures } from '../../engine/loaders/textures.js';
import { Color } from 'three';
import { events } from '../../engine/core/events.ts';
import { environment } from '../../engine/core/environment.ts';
import { geometryUtils } from '../../engine/geometry/shared.js';
import { gsap } from 'gsap';
class Manifesto {
  constructor(scene) {
    this.scene = scene;
    this.ready = new Promise((isReady) => {
      this.isReady = isReady;
    });
    this.options = {
      manifestoWidth: 0.75,
      copyrightWidth: 0.9,
      align: 'right',
      lineHeight: 0.8,
      size: 0.09,
    };
    this.canBeShown = false;
    this.visible = false;
    this.hasBeenShownOnce = false;
    this.init();
  }
  async init() {
    this.title = new MsdfText(
      {
        font: 'IBMPlexMono-Medium',
        text: siteConfig.manifesto.title,
        width: this.options.manifestoWidth,
        align: this.options.align,
        lineHeight: this.options.lineHeight,
        size: this.options.size,
      },
      {
        uniforms: {
          tMap: {
            value: textures.load('../fonts/IBMPlexMono-Medium-datatexture.ktx2', 'data'),
          },
          uColor: {
            value: new Color(siteConfig.colorTitle),
          },
          uShow1: {
            value: 0,
          },
          uShow2: {
            value: 0,
          },
          uBlink: {
            value: 1,
          },
        },
        vertexShader: composeShader(ManifestovertexShader1, {
          matrixFunctions: matrixFunctions,
          falloffFunctions: falloffFunctions,
        }),
        fragmentShader: composeShader(ManifestofragmentShader2, {
          msdfFunctions: msdfFunctions,
          fitFunctions: fitFunctions,
          falloffFunctions: falloffFunctions,
        }),
        depthWrite: false,
        depthTest: false,
      },
    );
    this.title.name = 'title';
    this.title.frustumCulled = false;
    this.title.renderOrder = 999;
    this.scene.add(this.title);
    this.text = new MsdfText(
      {
        font: 'IBMPlexMono-Medium',
        text: siteConfig.manifesto.text,
        width: this.options.manifestoWidth,
        align: this.options.align,
        lineHeight: this.options.lineHeight,
        size: this.options.size,
      },
      {
        uniforms: {
          tMap: {
            value: textures.load('../fonts/IBMPlexMono-Medium-datatexture.ktx2', 'data'),
          },
          uColor: {
            value: new Color(siteConfig.colorText),
          },
          uShow1: {
            value: 0,
          },
          uShow2: {
            value: 0,
          },
          uBlink: {
            value: 1,
          },
        },
        vertexShader: composeShader(ManifestovertexShader3, {
          matrixFunctions: matrixFunctions,
          falloffFunctions: falloffFunctions,
        }),
        fragmentShader: composeShader(ManifestofragmentShader4, {
          msdfFunctions: msdfFunctions,
          fitFunctions: fitFunctions,
          falloffFunctions: falloffFunctions,
        }),
        depthWrite: false,
        depthTest: false,
      },
    );
    this.text.name = 'title';
    this.text.frustumCulled = false;
    this.text.renderOrder = 999;
    this.scene.add(this.text);
    this.copyright = new MsdfText(
      {
        font: 'IBMPlexMono-Medium',
        text: siteConfig.copyright,
        width: this.options.copyrightWidth,
        align: 'left',
        lineHeight: this.options.lineHeight,
        size: this.options.size,
      },
      {
        uniforms: {
          tMap: {
            value: textures.load('../fonts/IBMPlexMono-Medium-datatexture.ktx2', 'data'),
          },
          uColor: {
            value: new Color(siteConfig.colorTitle),
          },
          uShow1: {
            value: 0,
          },
          uShow2: {
            value: 0,
          },
          uBlink: {
            value: 1,
          },
        },
        vertexShader: composeShader(ManifestovertexShader5, {
          matrixFunctions: matrixFunctions,
          falloffFunctions: falloffFunctions,
        }),
        fragmentShader: composeShader(ManifestofragmentShader6, {
          msdfFunctions: msdfFunctions,
          fitFunctions: fitFunctions,
          falloffFunctions: falloffFunctions,
        }),
        depthWrite: false,
        depthTest: false,
      },
    );
    this.copyright.name = 'copyright';
    this.copyright.frustumCulled = false;
    this.copyright.renderOrder = 999;
    this.scene.add(this.copyright);
    this.rights = new MsdfText(
      {
        font: 'IBMPlexMono-Medium',
        text: siteConfig.rights,
        width: this.options.copyrightWidth,
        align: 'left',
        lineHeight: this.options.lineHeight + 0.15,
        size: this.options.size,
      },
      {
        uniforms: {
          tMap: {
            value: textures.load('../fonts/IBMPlexMono-Medium-datatexture.ktx2', 'data'),
          },
          uColor: {
            value: new Color(siteConfig.colorText),
          },
          uShow1: {
            value: 0,
          },
          uShow2: {
            value: 0,
          },
          uBlink: {
            value: 1,
          },
        },
        vertexShader: composeShader(ManifestovertexShader7, {
          matrixFunctions: matrixFunctions,
          falloffFunctions: falloffFunctions,
        }),
        fragmentShader: composeShader(ManifestofragmentShader8, {
          msdfFunctions: msdfFunctions,
          fitFunctions: fitFunctions,
          falloffFunctions: falloffFunctions,
        }),
        depthWrite: false,
        depthTest: false,
      },
    );
    this.rights.name = 'rights';
    this.rights.frustumCulled = false;
    this.rights.renderOrder = 999;
    this.scene.add(this.rights);
    await Promise.all([this.title.ready, this.text.ready, this.copyright.ready, this.rights.ready]);
    events.on('webgl_hover_logo', this.blinkAnimation, this);
    events.once('webgl_show_ui_intro', () => {
      this.canBeShown = true;
    });
    this.scene.beforeRenderCbs.push(this.render.bind(this));
    this.isReady();
  }
  render() {
    const e =
        environment.screen.width < siteConfig.breakpointW ||
        environment.screen.height < siteConfig.breakpointH,
      t =
        environment.screen.width < siteConfig.breakPointMobile ||
        environment.screen.height < siteConfig.breakPointMobile,
      s = t ? 175 : e ? 200 : 250,
      n = s,
      r = t ? siteConfig.gridSizeMobile : e ? siteConfig.gridSizeLow : siteConfig.gridSize,
      a = t ? siteConfig.topMarginMobile : e ? siteConfig.topMarginLow : siteConfig.topMargin;
    geometryUtils.positionUI({
      camera: this.scene.camera,
      mesh: this.title,
      x: environment.screen.width - r,
      y: a + this.title.size.y * 0.75 * n,
      width: s,
      height: n,
    });
    geometryUtils.positionUI({
      camera: this.scene.camera,
      mesh: this.text,
      x: environment.screen.width - r,
      y: a + this.title.size.y * 2.25 * n,
      width: s,
      height: n,
    });
    const l = (e ? 160 : 200) * 0.21,
      c = a + l + this.copyright.size.y * 1.25 * s;
    geometryUtils.positionUI({
      camera: this.scene.camera,
      mesh: this.copyright,
      x: r,
      y: c,
      width: s,
      height: s,
    });
    geometryUtils.positionUI({
      camera: this.scene.camera,
      mesh: this.rights,
      x: r,
      y: c + this.copyright.size.y * 1.5 * s,
      width: s,
      height: s,
    });
  }
  hide() {
    if (this.visible) {
      this.visible = false;
      [this.title, this.text, this.copyright, this.rights].forEach((e) => {
        gsap.set(e.material.uniforms.uShow1, {
          value: 0,
          overwrite: true,
        });
        gsap.set(e.material.uniforms.uShow2, {
          value: 0,
          overwrite: true,
        });
      });
    }
  }
  show() {
    if (!this.visible) {
      this.visible = true;
      [this.copyright, this.rights, this.title, this.text].forEach((e, t) => {
        let s = 0;
        if (this.hasBeenShownOnce) s = t * 0.15;
        else s = t < 2 ? 0.75 + t * 0.2 : (t - 1) * 0.2;
        const n = t > 0 ? 1.75 : 1;
        gsap.fromTo(
          e.material.uniforms.uShow1,
          {
            value: 0,
          },
          {
            delay: s,
            value: 1,
            duration: 0.4 * n,
            ease: 'sine.out',
            overwrite: true,
            onStart: () => {
              if (t % 2 === 0) events.emit('webgl_play_audio', 'manifesto');
            },
          },
        );
        gsap.fromTo(
          e.material.uniforms.uShow2,
          {
            value: 0,
          },
          {
            delay: s,
            value: 1,
            duration: 0.75 * n,
            ease: 'sine.out',
            overwrite: true,
          },
        );
      });
      this.hasBeenShownOnce = true;
    }
  }
  blinkAnimation() {
    [this.copyright, this.rights].forEach((e, t) => {
      gsap.fromTo(
        e.material.uniforms.uBlink,
        {
          value: 0,
        },
        {
          value: 1,
          delay: t * 0.1,
          duration: 0.1,
          ease: 'none',
          overwrite: true,
        },
      );
    });
  }
  update(e, t) {
    if (t || e < 0.15) this.hide();
    if (this.canBeShown && e > 0.25 && e < 0.8) this.show();
  }
}
export { Manifesto };
