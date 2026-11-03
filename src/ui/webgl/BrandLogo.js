// Reconstructed application source. Third-party implementations are npm imports.
import BrandLogovertexShader1 from '../../shaders/ui/webgl/BrandLogo/BrandLogo-vertexShader-1.glsl?raw';
import BrandLogofragmentShader2 from '../../shaders/ui/webgl/BrandLogo/BrandLogo-fragmentShader-2.glsl?raw';
import matrixFunctions from '../../shaders/chunks/matrix.glsl?raw';
import imageFitUv from '../../shaders/chunks/image-fit.glsl?raw';
import { composeShader } from '../../engine/shaders/compose-shader.ts';
import { PlaneGeometry, Mesh, ShaderMaterial, Color, CanvasTexture } from 'three';
import { textures } from '../../engine/loaders/textures.js';
import { siteConfig } from '../../config/site-config.js';
import { environment } from '../../engine/core/environment.ts';
import { MeshInteraction_Er } from '../../engine/input/mesh-interaction.js';
import { events } from '../../engine/core/events.ts';
import { gsap } from 'gsap';
class BrandLogo {
  constructor(scene) {
    this.scene = scene;
    this.ready = new Promise((isReady) => {
      this.isReady = isReady;
    });
    this.init();
  }
  init() {
    const label = document.createElement('canvas');
    label.width = 512;
    label.height = 108;
    const context = label.getContext('2d');
    context.font = '900 100px sans-serif';
    context.fillStyle = '#ffffff';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('DEMO', label.width / 2, label.height / 2);
    const e = new PlaneGeometry();
    e.translate(0.5, -0.5, 0);
    this.mesh = new Mesh(
      e,
      new ShaderMaterial({
        uniforms: {
          tMap: {
            value: new CanvasTexture(label),
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
            value: environment.devScene ? 1 : 0,
          },
          uRand: {
            value: Math.random(),
          },
        },
        vertexShader: composeShader(BrandLogovertexShader1, {
          matrixFunctions: matrixFunctions,
        }),
        fragmentShader: composeShader(BrandLogofragmentShader2, {
          imageFitUv: imageFitUv,
        }),
        depthWrite: false,
        depthTest: false,
        transparent: true,
      }),
    );
    this.mesh.name = 'logo';
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 10;
    this.scene.add(this.mesh);
    this.interaction = new MeshInteraction_Er({
      meshes: [this.mesh],
      camera: this.scene.camera,
      onHover: (t) => {
        if (t.action === 'hover_in') {
          this.show(0.25, 0);
          events.emit('webgl_hover_logo');
          events.emit('webgl_play_audio', 'logo');
        }
      },
    });
    events.once('webgl_show_ui_intro', () => {
      this.interaction.enable();
      this.show();
      events.emit('webgl_play_audio', 'logo');
    });
    if (environment.devScene) this.interaction.enable();
    this.isReady();
  }
  show(e = 0.5, t = 0.75) {
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
  }
  resize() {
    const e = this.scene.mobile ? 140 : this.scene.small ? 160 : 200,
      t = e * 0.21;
    this.mesh.scale.set(e, t, 1);
    this.mesh.position.set(this.scene.meshMarginLeft, -this.scene.meshMarginTop, 0);
  }
}
export { BrandLogo };
