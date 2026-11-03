// Reconstructed application source. Third-party implementations are npm imports.
import SoundTogglevertexShader1 from '../../shaders/ui/webgl/SoundToggle/SoundToggle-vertexShader-1.glsl?raw';
import SoundTogglefragmentShader2 from '../../shaders/ui/webgl/SoundToggle/SoundToggle-fragmentShader-2.glsl?raw';
import SoundTogglevertexShader3 from '../../shaders/ui/webgl/SoundToggle/SoundToggle-vertexShader-3.glsl?raw';
import SoundTogglefragmentShader4 from '../../shaders/ui/webgl/SoundToggle/SoundToggle-fragmentShader-4.glsl?raw';
import SoundTogglevertexShader5 from '../../shaders/ui/webgl/SoundToggle/SoundToggle-vertexShader-5.glsl?raw';
import SoundTogglefragmentShader6 from '../../shaders/ui/webgl/SoundToggle/SoundToggle-fragmentShader-6.glsl?raw';
import SoundTogglevertexShader7 from '../../shaders/ui/webgl/SoundToggle/SoundToggle-vertexShader-7.glsl?raw';
import SoundTogglefragmentShader8 from '../../shaders/ui/webgl/SoundToggle/SoundToggle-fragmentShader-8.glsl?raw';
import matrixFunctions from '../../shaders/chunks/matrix.glsl?raw';
import falloffFunctions from '../../shaders/chunks/falloffFunctions.glsl?raw';
import msdfFunctions from '../../shaders/chunks/msdfFunctions.glsl?raw';
import fitFunctions from '../../shaders/chunks/fit.glsl?raw';
import globalUniformsGLSL from '../../shaders/chunks/globalUniformsGLSL.glsl?raw';
import imageFitUv from '../../shaders/chunks/image-fit.glsl?raw';
import { composeShader } from '../../engine/shaders/compose-shader.ts';
import { MsdfText } from '../../engine/text/msdf-text.js';
import { textures } from '../../engine/loaders/textures.js';
import { Color, PlaneGeometry, Mesh, ShaderMaterial } from 'three';
import { siteConfig } from '../../config/site-config.js';
import { environment } from '../../engine/core/environment.ts';
import { runtime } from '../../engine/rendering/runtime.ts';
import { MeshInteraction_Er } from '../../engine/input/mesh-interaction.js';
import { events } from '../../engine/core/events.ts';
import { gsap } from 'gsap';
class SoundToggle {
  constructor(scene) {
    this.scene = scene;
    this.ready = new Promise((isReady) => {
      this.isReady = isReady;
    });
    this.options = {
      width: 1,
      align: 'left',
      lineHeight: 0.8,
      size: 0.09,
    };
    this.init();
  }
  async init() {
    this.sound = new MsdfText(
      {
        font: 'IBMPlexMono-Medium',
        text: 'Sound:',
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
        vertexShader: composeShader(SoundTogglevertexShader1, {
          matrixFunctions: matrixFunctions,
          falloffFunctions: falloffFunctions,
        }),
        fragmentShader: composeShader(SoundTogglefragmentShader2, {
          msdfFunctions: msdfFunctions,
          fitFunctions: fitFunctions,
          falloffFunctions: falloffFunctions,
        }),
        depthWrite: false,
        depthTest: false,
      },
    );
    this.sound.name = 'sound';
    this.sound.frustumCulled = false;
    this.sound.renderOrder = 999;
    this.scene.add(this.sound);
    this.on = new MsdfText(
      {
        font: 'IBMPlexMono-Medium',
        text: 'On',
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
        vertexShader: composeShader(SoundTogglevertexShader3, {
          matrixFunctions: matrixFunctions,
          falloffFunctions: falloffFunctions,
        }),
        fragmentShader: composeShader(SoundTogglefragmentShader4, {
          msdfFunctions: msdfFunctions,
          fitFunctions: fitFunctions,
          falloffFunctions: falloffFunctions,
        }),
        depthWrite: false,
        depthTest: false,
      },
    );
    this.on.name = 'on';
    this.on.frustumCulled = false;
    this.on.renderOrder = 999;
    this.on.visible = false;
    this.scene.add(this.on);
    this.off = new MsdfText(
      {
        font: 'IBMPlexMono-Medium',
        text: 'Off',
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
        vertexShader: composeShader(SoundTogglevertexShader5, {
          matrixFunctions: matrixFunctions,
          falloffFunctions: falloffFunctions,
        }),
        fragmentShader: composeShader(SoundTogglefragmentShader6, {
          msdfFunctions: msdfFunctions,
          fitFunctions: fitFunctions,
          falloffFunctions: falloffFunctions,
        }),
        depthWrite: false,
        depthTest: false,
      },
    );
    this.off.name = 'off';
    this.off.frustumCulled = false;
    this.off.renderOrder = 999;
    this.scene.add(this.off);
    const e = new PlaneGeometry();
    e.translate(0.5, 0, 0);
    this.icon = new Mesh(
      e,
      new ShaderMaterial({
        uniformsGroups: [runtime.UBO],
        uniforms: {
          tMap: {
            value: textures.load('ui/sound-datatexture.ktx2', 'datatexture-repeat'),
          },
          uColor: {
            value: new Color(siteConfig.colorText),
          },
          uShow: {
            value: environment.devScene ? 1 : 0,
          },
          uActive: {
            value: 0,
          },
          uRand: {
            value: Math.random(),
          },
        },
        vertexShader: composeShader(SoundTogglevertexShader7, {
          matrixFunctions: matrixFunctions,
        }),
        fragmentShader: composeShader(SoundTogglefragmentShader8, {
          globalUniformsGLSL: globalUniformsGLSL,
          msdfFunctions: msdfFunctions,
          imageFitUv: imageFitUv,
        }),
        depthWrite: false,
        depthTest: false,
        transparent: true,
      }),
    );
    this.icon.name = 'soundIcon';
    this.icon.frustumCulled = false;
    this.icon.renderOrder = 999;
    this.scene.add(this.icon);
    const t = new PlaneGeometry();
    t.translate(0.5, 0, 0);
    this.interactionGeo = new Mesh(t);
    this.interactionGeo.name = 'soundInteraction';
    await Promise.all([this.sound.ready, this.on.ready, this.off.ready]);
    this.interaction = new MeshInteraction_Er({
      meshes: [this.interactionGeo],
      camera: this.scene.camera,
      hoverCursor: true,
      onHover: (s) => {
        if (s.action === 'hover_in') {
          this.show(0.5, 0);
          events.emit('webgl_play_audio', 'ui-long');
        }
      },
      onClick: (_s) => {
        events.emit('webgl_ui_particles_clicked');
        events.emit('webgl_audio_mute_toggle');
        this.show(0.2, 0);
      },
    });
    events.once('webgl_show_ui_intro', () => {
      this.show();
      this.interaction.enable();
    });
    events.on('webgl_audio_mute_toggle', this.onMute, this);
    this.onMute();
    this.isReady();
  }
  show(e = 1, t = 1) {
    gsap.fromTo(
      this.sound.material.uniforms.uShow1,
      {
        value: 0,
      },
      {
        delay: t,
        value: 1,
        duration: 0.4 * e,
        ease: 'sine.out',
        overwrite: true,
      },
    );
    gsap.fromTo(
      this.sound.material.uniforms.uShow2,
      {
        value: 0,
      },
      {
        delay: t,
        value: 1,
        duration: 0.75 * e,
        ease: 'sine.out',
        overwrite: true,
      },
    );
    gsap.fromTo(
      this.on.material.uniforms.uShow1,
      {
        value: 0,
      },
      {
        delay: t + 0.1,
        value: 1,
        duration: 0.4 * e,
        ease: 'sine.out',
        overwrite: true,
      },
    );
    gsap.fromTo(
      this.on.material.uniforms.uShow2,
      {
        value: 0,
      },
      {
        delay: t + 0.1,
        value: 1,
        duration: 0.75 * e,
        ease: 'sine.out',
        overwrite: true,
      },
    );
    gsap.fromTo(
      this.off.material.uniforms.uShow1,
      {
        value: 0,
      },
      {
        delay: t + 0.1,
        value: 1,
        duration: 0.4 * e,
        ease: 'sine.out',
        overwrite: true,
      },
    );
    gsap.fromTo(
      this.off.material.uniforms.uShow2,
      {
        value: 0,
      },
      {
        delay: t + 0.1,
        value: 1,
        duration: 0.75 * e,
        ease: 'sine.out',
        overwrite: true,
      },
    );
    this.icon.material.uniforms.uRand.value = Math.random();
    gsap.fromTo(
      this.icon.material.uniforms.uShow,
      {
        value: 0,
      },
      {
        delay: t,
        value: 1,
        duration: 0.5 * e,
        ease: 'none',
        overwrite: true,
      },
    );
  }
  onMute(_e) {
    var t;
    if ((t = this.scene.controller) != null && t.audioController)
      Promise.resolve().then(() => {
        if (this.scene.controller.audioController._controller.muted) {
          this.on.visible = false;
          this.off.visible = true;
          this.icon.material.uniforms.uActive.value = 0;
        } else {
          this.on.visible = true;
          this.off.visible = false;
          this.icon.material.uniforms.uActive.value = 1;
        }
      });
  }
  resize() {
    const e = this.scene.small ? 18 : 22;
    this.icon.scale.set(e, e, 1);
    this.icon.position.set(
      this.scene.meshMarginLeft,
      -environment.screen.height + this.scene.meshMarginTop + e * 0.7,
      0,
    );
    const t = this.scene.small ? 180 : 230,
      s = t;
    this.sound.scale.set(t, s, 1);
    this.sound.position.set(
      this.scene.meshMarginLeft + e * 1.4,
      -environment.screen.height + this.scene.meshMarginTop + this.sound.size.y * 0.45 * s,
      0,
    );
    this.on.scale.set(t, s, 1);
    this.on.position.set(
      this.scene.meshMarginLeft + e * 1.4 + this.sound.size.y * t * 2.6,
      -environment.screen.height + this.scene.meshMarginTop + this.sound.size.y * 0.45 * s,
      0,
    );
    this.off.scale.set(t, s, 1);
    this.off.position.set(
      this.scene.meshMarginLeft + e * 1.4 + this.sound.size.y * t * 2.6,
      -environment.screen.height + this.scene.meshMarginTop + this.sound.size.y * 0.45 * s,
      0,
    );
    this.interactionGeo.scale.set(t * this.options.size * 7.1, s * this.options.size * 1.7, 1);
    this.interactionGeo.position.set(
      this.scene.meshMarginLeft - t * 0.025,
      -environment.screen.height + this.scene.meshMarginTop + e * 0.7,
      0,
    );
    this.interactionGeo.updateMatrixWorld();
  }
}
export { SoundToggle };
