// Reconstructed application source. Third-party implementations are npm imports.
import ProjectTextvertexShader1 from '../../shaders/ui/webgl/ProjectText/ProjectText-vertexShader-1.glsl?raw';
import ProjectTextfragmentShader2 from '../../shaders/ui/webgl/ProjectText/ProjectText-fragmentShader-2.glsl?raw';
import matrixFunctions from '../../shaders/chunks/matrix.glsl?raw';
import falloffFunctions from '../../shaders/chunks/falloffFunctions.glsl?raw';
import globalUniformsGLSL from '../../shaders/chunks/globalUniformsGLSL.glsl?raw';
import fitFunctions from '../../shaders/chunks/fit.glsl?raw';
import msdfFunctions from '../../shaders/chunks/msdfFunctions.glsl?raw';
import { composeShader } from '../../engine/shaders/compose-shader.ts';
import { MsdfText } from '../../engine/text/msdf-text.js';
import { runtime } from '../../engine/rendering/runtime.ts';
import { textures } from '../../engine/loaders/textures.js';
import { Color } from 'three';
import { gsap } from 'gsap';
class ProjectText {
  constructor({ parent = null, text = '', options = {} } = {}) {
    this.parent = parent;
    this.text = text;
    this.options = options;
    this.ready = new Promise((isReady) => {
      this.isReady = isReady;
    });
    this.init();
  }
  async init() {
    this.mesh = new MsdfText(
      {
        text: this.text,
        ...this.options,
      },
      {
        uniformsGroups: [runtime.UBO],
        uniforms: {
          tMap: {
            value: textures.load('../fonts/IBMPlexMono-Medium-datatexture.ktx2', 'data'),
          },
          uColor: {
            value: new Color(this.options.color),
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
            value: this.parent.scrollMargin,
          },
          uHighlights: {
            value: true,
          },
          tSim: {
            value: null,
          },
        },
        vertexShader: composeShader(ProjectTextvertexShader1, {
          matrixFunctions: matrixFunctions,
          falloffFunctions: falloffFunctions,
          globalUniformsGLSL: globalUniformsGLSL,
          fitFunctions: fitFunctions,
        }),
        fragmentShader: composeShader(ProjectTextfragmentShader2, {
          msdfFunctions: msdfFunctions,
          fitFunctions: fitFunctions,
          falloffFunctions: falloffFunctions,
          globalUniformsGLSL: globalUniformsGLSL,
        }),
        depthWrite: false,
        depthTest: false,
      },
    );
    await this.mesh.ready;
    this.isReady();
  }
  hide() {
    return gsap.to(this.mesh.material.uniforms.uOpacity, {
      value: 0,
      duration: 0.15,
      ease: 'power2.out',
      overwrite: true,
    });
  }
  show(e = 0, t = 0) {
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
        duration: e,
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
        duration: e + 0.1,
        ease: 'sine.out',
        overwrite: true,
      },
    );
  }
  resize(e = {}) {
    return this.mesh.update(e);
  }
}
export { ProjectText };
