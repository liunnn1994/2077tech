// Reconstructed application source. Third-party implementations are npm imports.
import ProjectLinkvertexShader1 from '../../shaders/ui/webgl/ProjectLink/ProjectLink-vertexShader-1.glsl?raw';
import ProjectLinkfragmentShader2 from '../../shaders/ui/webgl/ProjectLink/ProjectLink-fragmentShader-2.glsl?raw';
import ProjectLinkvertexShader3 from '../../shaders/ui/webgl/ProjectLink/ProjectLink-vertexShader-3.glsl?raw';
import ProjectLinkfragmentShader4 from '../../shaders/ui/webgl/ProjectLink/ProjectLink-fragmentShader-4.glsl?raw';
import matrixFunctions from '../../shaders/chunks/matrix.glsl?raw';
import falloffFunctions from '../../shaders/chunks/falloffFunctions.glsl?raw';
import globalUniformsGLSL from '../../shaders/chunks/globalUniformsGLSL.glsl?raw';
import fitFunctions from '../../shaders/chunks/fit.glsl?raw';
import msdfFunctions from '../../shaders/chunks/msdfFunctions.glsl?raw';
import imageFitUv from '../../shaders/chunks/image-fit.glsl?raw';
import { composeShader } from '../../engine/shaders/compose-shader.ts';
import { MsdfText } from '../../engine/text/msdf-text.js';
import { runtime } from '../../engine/rendering/runtime.ts';
import { textures } from '../../engine/loaders/textures.js';
import { Color, PlaneGeometry, Mesh, ShaderMaterial } from 'three';
import { gsap } from 'gsap';
class ProjectLink {
  constructor(data = {}, parent = null, index = 0) {
    this.data = data;
    this.parent = parent;
    this.index = index;
    this.ready = new Promise((isReady) => {
      this.isReady = isReady;
    });
    this.init();
  }
  async init() {
    this.mesh = new MsdfText(
      {
        text: `[${this.data.name}]`,
        ...this.parent.options,
      },
      {
        uniformsGroups: [runtime.UBO],
        uniforms: {
          tMap: {
            value: textures.load('../fonts/IBMPlexMono-Medium-datatexture.ktx2', 'data'),
          },
          uColor: {
            value: new Color(this.parent.options.color),
          },
          uShow1: {
            value: 0,
          },
          uShow2: {
            value: 0,
          },
          uOpacity: {
            value: 0,
          },
          uFadeMargin: {
            value: this.parent.parent.scrollMargin,
          },
          uHighlights: {
            value: true,
          },
          tSim: {
            value: null,
          },
        },
        vertexShader: composeShader(ProjectLinkvertexShader1, {
          matrixFunctions: matrixFunctions,
          falloffFunctions: falloffFunctions,
          globalUniformsGLSL: globalUniformsGLSL,
          fitFunctions: fitFunctions,
        }),
        fragmentShader: composeShader(ProjectLinkfragmentShader2, {
          msdfFunctions: msdfFunctions,
          fitFunctions: fitFunctions,
          falloffFunctions: falloffFunctions,
          globalUniformsGLSL: globalUniformsGLSL,
        }),
        depthWrite: false,
        depthTest: false,
      },
    );
    this.parent.mesh.add(this.mesh);
    const e = new PlaneGeometry();
    e.translate(0.5, -0.5, 0);
    this.icon = new Mesh(
      e,
      new ShaderMaterial({
        uniformsGroups: [runtime.UBO],
        uniforms: {
          tMap: {
            value: textures.load('ui/arrow-datatexture.ktx2', 'datatexture-repeat'),
          },
          uColor: {
            value: new Color(this.parent.options.color),
          },
          uShow: {
            value: 0,
          },
          uRand: {
            value: Math.random(),
          },
          uOpacity: {
            value: 1,
          },
          uFadeMargin: {
            value: this.parent.parent.scrollMargin,
          },
          uHighlights: {
            value: true,
          },
          tSim: {
            value: null,
          },
        },
        vertexShader: composeShader(ProjectLinkvertexShader3, {
          matrixFunctions: matrixFunctions,
          falloffFunctions: falloffFunctions,
          globalUniformsGLSL: globalUniformsGLSL,
          fitFunctions: fitFunctions,
        }),
        fragmentShader: composeShader(ProjectLinkfragmentShader4, {
          globalUniformsGLSL: globalUniformsGLSL,
          msdfFunctions: msdfFunctions,
          imageFitUv: imageFitUv,
          fitFunctions: fitFunctions,
        }),
        depthWrite: false,
        depthTest: false,
        transparent: true,
      }),
    );
    this.icon.name = 'arrow';
    this.mesh.add(this.icon);
    const t = new PlaneGeometry();
    t.translate(0.5, -0.25, 0);
    this.interactionMesh = new Mesh(t);
    this.interactionMesh.name = 'icon interaction';
    this.interactionMesh._index = this.index;
    await this.mesh.ready;
    this.isReady();
  }
  show(e = 1, t = 0) {
    this.icon.material.uniforms.uRand.value = Math.random();
    gsap.fromTo(
      this.icon.material.uniforms.uOpacity,
      {
        value: 0,
      },
      {
        value: 1,
        delay: t,
        duration: 0,
        overwrite: true,
      },
    );
    gsap.fromTo(
      this.icon.material.uniforms.uShow,
      {
        value: 0,
      },
      {
        delay: t * 1.25,
        value: 1,
        duration: 0.5 * e,
        ease: 'none',
        overwrite: true,
      },
    );
    gsap.fromTo(
      this.mesh.material.uniforms.uOpacity,
      {
        value: 0,
      },
      {
        value: 1,
        delay: t,
        duration: 0,
        overwrite: true,
      },
    );
    gsap.fromTo(
      this.mesh.material.uniforms.uShow1,
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
    return gsap.fromTo(
      this.mesh.material.uniforms.uShow2,
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
  }
  hide() {
    gsap.to(this.icon.material.uniforms.uOpacity, {
      value: 0,
      duration: 0.15,
      ease: 'power2.out',
      overwrite: true,
    });
    return gsap.to(this.mesh.material.uniforms.uOpacity, {
      value: 0,
      duration: 0.15,
      ease: 'power2.out',
      overwrite: true,
    });
  }
  resize(e = {}) {
    return this.mesh.update(e);
  }
}
export { ProjectLink };
