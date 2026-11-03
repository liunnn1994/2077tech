// Reconstructed application source. Third-party implementations are npm imports.
import CloseProjectvertexShader1 from '../../shaders/ui/webgl/CloseProject/CloseProject-vertexShader-1.glsl?raw';
import CloseProjectfragmentShader2 from '../../shaders/ui/webgl/CloseProject/CloseProject-fragmentShader-2.glsl?raw';
import CloseProjectvertexShader3 from '../../shaders/ui/webgl/CloseProject/CloseProject-vertexShader-3.glsl?raw';
import CloseProjectfragmentShader4 from '../../shaders/ui/webgl/CloseProject/CloseProject-fragmentShader-4.glsl?raw';
import matrixFunctions from '../../shaders/chunks/matrix.glsl?raw';
import msdfFunctions from '../../shaders/chunks/msdfFunctions.glsl?raw';
import imageFitUv from '../../shaders/chunks/image-fit.glsl?raw';
import falloffFunctions from '../../shaders/chunks/falloffFunctions.glsl?raw';
import fitFunctions from '../../shaders/chunks/fit.glsl?raw';
import { composeShader } from '../../engine/shaders/compose-shader.ts';
import { PlaneGeometry, Mesh, ShaderMaterial, Color } from 'three';
import { textures } from '../../engine/loaders/textures.js';
import { siteConfig } from '../../config/site-config.js';
import { MsdfText } from '../../engine/text/msdf-text.js';
import { environment } from '../../engine/core/environment.ts';
import { MeshInteraction_Er } from '../../engine/input/mesh-interaction.js';
import { events } from '../../engine/core/events.ts';
import { gsap } from 'gsap';
class CloseProject {
  constructor(scene) {
    this.scene = scene;
    this.ready = new Promise((isReady) => {
      this.isReady = isReady;
    });
    this.options = {
      width: 1,
      align: 'center',
      lineHeight: 0.8,
      size: 0.09,
    };
    this.init();
  }
  async init() {
    const e = new PlaneGeometry();
    e.translate(-0.5, -0.5, 0);
    this.mesh = new Mesh(
      e,
      new ShaderMaterial({
        uniforms: {
          tMap: {
            value: textures.load('ui/close-datatexture.ktx2', 'datatexture'),
          },
          tBlocks: {
            value: textures.load('scroll-datatexture.ktx2', 'datatexture-repeat'),
          },
          uColor: {
            value: new Color(siteConfig.colorLogo),
          },
          uColor2: {
            value: new Color('#ffffff'),
          },
          uShow: {
            value: 1,
          },
          uRand: {
            value: Math.random(),
          },
        },
        vertexShader: composeShader(CloseProjectvertexShader1, {
          matrixFunctions: matrixFunctions,
        }),
        fragmentShader: composeShader(CloseProjectfragmentShader2, {
          msdfFunctions: msdfFunctions,
          imageFitUv: imageFitUv,
        }),
        depthWrite: false,
        depthTest: false,
        transparent: true,
      }),
    );
    this.mesh.name = 'close';
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 10;
    this.mesh.visible = false;
    this.scene.add(this.mesh);
    this.message = new MsdfText(
      {
        font: 'IBMPlexMono-Medium',
        text: siteConfig.close,
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
        vertexShader: composeShader(CloseProjectvertexShader3, {
          matrixFunctions: matrixFunctions,
          falloffFunctions: falloffFunctions,
        }),
        fragmentShader: composeShader(CloseProjectfragmentShader4, {
          msdfFunctions: msdfFunctions,
          fitFunctions: fitFunctions,
          falloffFunctions: falloffFunctions,
        }),
        depthWrite: false,
        depthTest: false,
      },
    );
    this.message.name = 'close message';
    this.message.frustumCulled = false;
    this.message.renderOrder = 999;
    this.message.visible = false;
    this.scene.add(this.message);
    await this.message.ready;
    this.interaction = new MeshInteraction_Er({
      meshes: [this.mesh],
      camera: this.scene.camera,
      hoverCursor: true,
      onHover: (t) => {
        if (t.action === 'hover_in') {
          this.show(0.25, 0);
          events.emit('webgl_play_audio', 'ui-long');
        }
      },
      onClick: () => {
        events.emit('webgl_switch_scene', '');
      },
    });
    events.on('webgl_project_show', this.enable, this);
    events.on('webgl_project_hide', this.disable, this);
    if (environment.devScene) this.enable();
    this.isReady();
  }
  show(e = 0.5, t = 0.2) {
    this.mesh.visible = true;
    this.mesh.material.uniforms.uRand.value = Math.random();
    gsap.fromTo(
      this.mesh.material.uniforms.uShow,
      {
        value: 0,
      },
      {
        delay: t,
        value: 1,
        duration: e,
        ease: 'none',
        overwrite: true,
      },
    );
    this.message.visible = true;
    gsap.fromTo(
      this.message.material.uniforms.uShow1,
      {
        value: 0,
      },
      {
        delay: t,
        value: 1,
        duration: 0.2,
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
        duration: 0.4,
        ease: 'sine.out',
        overwrite: true,
      },
    );
  }
  enable() {
    this.show();
    this.interaction.enable();
    events.on('keyup', this.onKey, this);
  }
  disable() {
    this.mesh.visible = false;
    this.message.visible = false;
    this.interaction.disable();
    events.off('keyup', this.onKey, this);
  }
  onKey(e) {
    if (e.key === 'Escape') events.emit('webgl_switch_scene', '');
  }
  resize() {
    const e = this.scene.mobile ? 85 : this.scene.small ? 95 : 120,
      t = e * 0.45;
    this.mesh.scale.set(e, t, 1);
    this.mesh.position.set(
      environment.screen.width - this.scene.meshMarginLeft,
      -this.scene.meshMarginTop + t * 0.12,
      0,
    );
    this.message.scale.set(e * 2.15, e * 2.15, 1);
    this.message.position.set(
      this.mesh.position.x - e * 0.5,
      this.mesh.position.y - t * 0.5 - this.message.size.y * 0.21 * this.message.scale.y,
      0,
    );
  }
}
export { CloseProject };
