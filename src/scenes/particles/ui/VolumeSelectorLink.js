// Reconstructed application source. Third-party implementations are npm imports.
import VolumeSelectorLinkvertexShader1 from '../../../shaders/scenes/particles/ui/VolumeSelectorLink/VolumeSelectorLink-vertexShader-1.glsl?raw';
import VolumeSelectorLinkfragmentShader2 from '../../../shaders/scenes/particles/ui/VolumeSelectorLink/VolumeSelectorLink-fragmentShader-2.glsl?raw';
import matrixFunctions from '../../../shaders/chunks/matrix.glsl?raw';
import msdfFunctions from '../../../shaders/chunks/msdfFunctions.glsl?raw';
import imageFitUv from '../../../shaders/chunks/image-fit.glsl?raw';
import { composeShader } from '../../../engine/shaders/compose-shader.ts';
import { PlaneGeometry, Mesh, ShaderMaterial, Color, AdditiveBlending } from 'three';
import { textures } from '../../../engine/loaders/textures.js';
import { MeshInteraction_Er } from '../../../engine/input/mesh-interaction.js';
import { events } from '../../../engine/core/events.ts';
import { siteConfig } from '../../../config/site-config.js';
import { VolumeSelectorLabels } from './VolumeSelectorLabels.js';
import { gsap } from 'gsap';
import { environment } from '../../../engine/core/environment.ts';
import { geometryUtils } from '../../../engine/geometry/shared.js';
class VolumeSelectorLink {
  constructor(parent) {
    this.parent = parent;
    this.ready = new Promise((isReady) => {
      this.isReady = isReady;
    });
    this.small = false;
    this.mobile = false;
    this.meshMarginTop = 0;
    this.bottomPosition = 0;
    this.init();
  }
  async init() {
    const e = new PlaneGeometry();
    this.box = new Mesh(
      e,
      new ShaderMaterial({
        uniforms: {
          tMap: {
            value: textures.load('ui/visit-datatexture.ktx2', 'data'),
          },
          tBlocks: {
            value: textures.load('scroll-datatexture.ktx2', 'data-repeat'),
          },
          uColor: {
            value: new Color('#ffffff'),
          },
          uShow: {
            value: 1,
          },
          uRand: {
            value: Math.random(),
          },
        },
        vertexShader: composeShader(VolumeSelectorLinkvertexShader1, {
          matrixFunctions: matrixFunctions,
        }),
        fragmentShader: composeShader(VolumeSelectorLinkfragmentShader2, {
          msdfFunctions: msdfFunctions,
          imageFitUv: imageFitUv,
        }),
        depthWrite: false,
        depthTest: false,
        transparent: true,
        blending: AdditiveBlending,
      }),
    );
    this.box.name = 'box';
    this.box.frustumCulled = false;
    this.box.renderOrder = 999;
    this.box.visible = false;
    this.parent.parent.scene.add(this.box);
    this.interaction = new MeshInteraction_Er({
      meshes: [this.box],
      camera: this.parent.parent.scene.camera,
      hoverCursor: true,
      onHover: (t) => {
        if (t.action === 'hover_in') {
          this.show(0.75, true);
          events.emit('webgl_play_audio', 'ui-long');
        }
      },
      onClick: (_t) => {
        events.emit('webgl_ui_particles_clicked');
        window.open(siteConfig.links[this.parent.parent.currentLink].url, '_blank').focus();
      },
    });
    this.texts = new VolumeSelectorLabels(this);
    await this.texts.ready;
    this.isReady();
  }
  show(e = 1, t = false, s = true) {
    var r;
    if (s) {
      this.box.visible = true;
      this.box.material.uniforms.uRand.value = Math.random();
      gsap.fromTo(
        this.box.material.uniforms.uShow,
        {
          value: 0,
        },
        {
          value: 1,
          duration: 0.3 * e,
          ease: 'none',
          overwrite: true,
        },
      );
    }
    this.interaction.enable();
    const n = t ? this.parent.parent.currentLink : 'all';
    if (!((r = this.texts) == null)) r.show(n, 0, n !== 'all' ? 0.7 : 1);
  }
  hide() {
    var e;
    gsap.fromTo(
      this.box.material.uniforms.uShow,
      {
        value: 1,
      },
      {
        value: 0,
        duration: 0.15,
        ease: 'power2.out',
        overwrite: true,
        onComplete: () => {
          this.box.visible = false;
        },
      },
    );
    this.interaction.disable();
    if (!((e = this.texts) == null)) e.hide('all');
  }
  update() {
    var s;
    this.small =
      environment.screen.width < siteConfig.breakpointW ||
      environment.screen.height < siteConfig.breakpointH;
    this.mobile =
      environment.screen.width < siteConfig.breakPointMobile ||
      environment.screen.height < siteConfig.breakPointMobile;
    this.meshMarginTop = this.mobile
      ? siteConfig.topMarginMobile
      : this.small
        ? siteConfig.topMarginLow
        : siteConfig.topMargin;
    this.bottomPosition = environment.screen.height - this.meshMarginTop - (this.mobile ? 80 : 20);
    const e = this.mobile ? 150 : this.small ? 180 : 220,
      t = e / 3.125;
    geometryUtils.positionUI({
      camera: this.parent.parent.scene.camera,
      mesh: this.box,
      x: environment.screen.width * 0.5,
      y: this.bottomPosition,
      width: e,
      height: t,
    });
    if (!((s = this.texts) == null)) s.update();
  }
}
export { VolumeSelectorLink };
