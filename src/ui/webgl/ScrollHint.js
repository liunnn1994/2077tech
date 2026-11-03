// Reconstructed application source. Third-party implementations are npm imports.
import ScrollHintvertexShader1 from '../../shaders/ui/webgl/ScrollHint/ScrollHint-vertexShader-1.glsl?raw';
import ScrollHintfragmentShader2 from '../../shaders/ui/webgl/ScrollHint/ScrollHint-fragmentShader-2.glsl?raw';
import matrixFunctions from '../../shaders/chunks/matrix.glsl?raw';
import falloffFunctions from '../../shaders/chunks/falloffFunctions.glsl?raw';
import msdfFunctions from '../../shaders/chunks/msdfFunctions.glsl?raw';
import fitFunctions from '../../shaders/chunks/fit.glsl?raw';
import { composeShader } from '../../engine/shaders/compose-shader.ts';
import { MsdfText } from '../../engine/text/msdf-text.js';
import { siteConfig } from '../../config/site-config.js';
import { textures } from '../../engine/loaders/textures.js';
import { Color } from 'three';
import { environment } from '../../engine/core/environment.ts';
import { events } from '../../engine/core/events.ts';
import { gsap } from 'gsap';
class ScrollHint {
  constructor(scene) {
    this.scene = scene;
    this.ready = new Promise((isReady) => {
      this.isReady = isReady;
    });
    this.options = {
      width: 0.6,
      align: 'left',
      lineHeight: 0.8,
      size: 0.09,
    };
    this.init();
  }
  async init() {
    this.message = new MsdfText(
      {
        font: 'IBMPlexMono-Medium',
        text: siteConfig.scroll,
        width: this.options.width,
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
            value: environment.devScene ? 1 : 0,
          },
          uShow2: {
            value: environment.devScene ? 1 : 0,
          },
        },
        vertexShader: composeShader(ScrollHintvertexShader1, {
          matrixFunctions: matrixFunctions,
          falloffFunctions: falloffFunctions,
        }),
        fragmentShader: composeShader(ScrollHintfragmentShader2, {
          msdfFunctions: msdfFunctions,
          fitFunctions: fitFunctions,
          falloffFunctions: falloffFunctions,
        }),
        depthWrite: false,
        depthTest: false,
      },
    );
    this.message.name = 'message';
    this.message.frustumCulled = false;
    this.message.renderOrder = 999;
    this.scene.add(this.message);
    await this.message.ready;
    events.once('webgl_show_ui_intro', () => {
      this.show();
    });
    this.isReady();
  }
  show(e = 0.5, t = 1) {
    gsap.fromTo(
      this.message.material.uniforms.uShow1,
      {
        value: 0,
      },
      {
        delay: t,
        value: 1,
        duration: 0.4,
        ease: 'sine.out',
        overwrite: true,
      },
    );
    gsap.fromTo(
      this.message.material.uniforms.uShow2,
      {
        value: 0,
      },
      {
        delay: t,
        value: 1,
        duration: 0.75,
        ease: 'sine.out',
        overwrite: true,
      },
    );
  }
  hide() {
    gsap.to(this.message.material.uniforms.uShow1, {
      value: 0,
      duration: 0.5,
      ease: 'sine.out',
      overwrite: true,
      onComplete: () => {
        this.message.visible = false;
      },
    });
    gsap.to(
      this.message.material.uniforms.uShow2,
      {
        value: 1,
      },
      {
        value: 0,
        duration: 0.4,
        ease: 'sine.out',
        overwrite: true,
      },
    );
    if (this.message.material.uniforms.uShow1.value > 0)
      events.emit('webgl_play_audio', 'ui-short');
  }
  resize() {
    const e = this.scene.small ? 180 : 230,
      t = e;
    this.message.scale.set(e, t, 1);
    this.message.position.set(
      this.scene.meshMarginLeft,
      -environment.screen.height + this.scene.meshMarginTop + this.message.size.y * 1.75 * t,
      0,
    );
  }
}
export { ScrollHint };
