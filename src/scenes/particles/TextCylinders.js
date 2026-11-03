// Reconstructed application source. Third-party implementations are npm imports.
import TextCylindersvertexShader1 from '../../shaders/scenes/particles/TextCylinders/TextCylinders-vertexShader-1.glsl?raw';
import TextCylindersfragmentShader2 from '../../shaders/scenes/particles/TextCylinders/TextCylinders-fragmentShader-2.glsl?raw';
import TextCylindersvertexShader3 from '../../shaders/scenes/particles/TextCylinders/TextCylinders-vertexShader-3.glsl?raw';
import TextCylindersfragmentShader4 from '../../shaders/scenes/particles/TextCylinders/TextCylinders-fragmentShader-4.glsl?raw';
import globalUniformsGLSL from '../../shaders/chunks/globalUniformsGLSL.glsl?raw';
import falloffFunctions from '../../shaders/chunks/falloffFunctions.glsl?raw';
import { composeShader } from '../../engine/shaders/compose-shader.ts';
import { geometries } from '../../engine/loaders/geometries.js';
import { ShaderMaterial, AdditiveBlending, Mesh } from 'three';
import { runtime } from '../../engine/rendering/runtime.ts';
import { textures } from '../../engine/loaders/textures.js';
class TextCylinders {
  constructor(scene) {
    this.scene = scene;
    this.ready = new Promise((isReady) => {
      this.isReady = isReady;
    });
    this.init();
  }
  async init() {
    const e = await geometries.load('blurrytext_cylinder.drc'),
      t = new ShaderMaterial({
        uniformsGroups: [runtime.UBO],
        uniforms: {
          uAlpha: {
            value: 0,
          },
          tMap: {
            value: textures.load('cubes/blurrytext_atlas.ktx2', 'srgb-repeat'),
          },
        },
        vertexShader: composeShader(TextCylindersvertexShader1, {
          globalUniformsGLSL: globalUniformsGLSL,
        }),
        fragmentShader: composeShader(TextCylindersfragmentShader2, {
          globalUniformsGLSL: globalUniformsGLSL,
          falloffFunctions: falloffFunctions,
        }),
        transparent: true,
        blending: AdditiveBlending,
      });
    this.mesh = new Mesh(e, t);
    this.mesh.position.y = -10.33;
    this.mesh.scale.setScalar(1.75);
    this.mesh.name = 'textcylinder';
    this.mesh.renderOrder = 1;
    this.mesh.updateMatrixWorld(true);
    this.mesh.receiveShadow = false;
    this.mesh.castShadow = false;
    this.scene.add(this.mesh);
    this.mesh2 = new Mesh(e, t);
    this.mesh2.position.y = -10.33;
    this.mesh2.scale.setScalar(3.5);
    this.mesh2.rotation.y = 3.14159 * 0.5;
    this.mesh2.name = 'textcylinder2';
    this.mesh2.renderOrder = 0;
    this.mesh2.updateMatrixWorld(true);
    this.scene.add(this.mesh2);
    const s = new ShaderMaterial({
      uniformsGroups: [runtime.UBO],
      uniforms: {
        uAlpha: {
          value: 1,
        },
        tMap: {
          value: textures.load('cubes/blurrytext_atlas.ktx2', 'srgb-repeat'),
        },
      },
      vertexShader: composeShader(TextCylindersvertexShader3, {
        globalUniformsGLSL: globalUniformsGLSL,
      }),
      fragmentShader: composeShader(TextCylindersfragmentShader4, {
        globalUniformsGLSL: globalUniformsGLSL,
        falloffFunctions: falloffFunctions,
      }),
      transparent: true,
      blending: AdditiveBlending,
    });
    this.mesh3 = new Mesh(e, s);
    this.mesh3.position.y = -9.5;
    this.mesh3.scale.set(2, 9, 2);
    this.mesh3.rotation.y = 3.14159;
    this.mesh3.name = 'textcylinder3';
    this.mesh3.renderOrder = 0;
    this.scene.add(this.mesh3);
    this.mesh4 = new Mesh(e, s);
    this.mesh4.position.y = -9.5;
    this.mesh4.scale.set(3.3, 8, 3.3);
    this.mesh4.name = 'textcylinder4';
    this.mesh4.renderOrder = -1;
    this.scene.add(this.mesh4);
    this.isReady();
  }
  update() {
    const e = this.scene.timelineAdditional.upRotation * 0.65;
    this.mesh4.rotation.y = e;
    this.mesh3.rotation.y = e + 2;
  }
}
export { TextCylinders };
