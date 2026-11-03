// Reconstructed application source. Third-party implementations are npm imports.
import PortfolioCubevertexShader1 from '../../shaders/scenes/portfolio/PortfolioCube/PortfolioCube-vertexShader-1.glsl?raw';
import PortfolioCubefragmentShader2 from '../../shaders/scenes/portfolio/PortfolioCube/PortfolioCube-fragmentShader-2.glsl?raw';
import matrixFunctions from '../../shaders/chunks/matrix.glsl?raw';
import globalUniformsGLSL from '../../shaders/chunks/globalUniformsGLSL.glsl?raw';
import { composeShader } from '../../engine/shaders/compose-shader.ts';
import {
  Group,
  Mesh,
  MeshBasicMaterial,
  FrontSide,
  PlaneGeometry,
  ShaderMaterial,
  Color,
} from 'three';
import { geometries } from '../../engine/loaders/geometries.js';
import { InteractiveIceMesh } from './InteractiveIceMesh.js';
import { IceTransmissionMaterial } from './IceTransmissionMaterial.js';
import { MeshBVH } from 'three-mesh-bvh';
import { textures } from '../../engine/loaders/textures.js';
import { FrostFeedback } from './frost/FrostFeedback.js';
import { runtime } from '../../engine/rendering/runtime.ts';
import { CubePlexus } from './plexus/CubePlexus.js';
import { CubeAnnotations } from './annotations/CubeAnnotations.js';
import { math } from '../../engine/core/math.js';
import { frameClock } from '../../engine/core/frame-clock.ts';
class PortfolioCube extends Group {
  constructor(scene, t) {
    super();
    this.scene = scene;
    this.options = {
      index: 0,
      obj: 'cube3',
      innerobject: 'pudgy',
      centeredProgress: 0,
      scrollPosition: 0,
      rand: Math.random(),
      ...t,
    };
    this.name = `group${this.options.index} `;
    this.position.y = this.options.scrollPosition;
    this.additionalRotationAmount = {
      value: 1,
    };
    this.ready = new Promise((isReady) => {
      this.isReady = isReady;
    });
    this.init();
  }
  async init() {
    const [e, t] = await Promise.all([
      geometries.load(`cubes/${this.options.obj}.drc`),
      geometries.load(`${this.options.innerobject}.drc`),
    ]);
    this.mesh = new InteractiveIceMesh(e, new IceTransmissionMaterial(3));
    this.mesh.name = `cube${this.options.index} `;
    this.mesh.renderOrder = 3;
    this.mesh.geometry.computeBoundingBox();
    this.mesh.geometry.computeBoundingSphere();
    this.mesh.geometry.boundsTree = new MeshBVH(this.mesh.geometry);
    this.add(this.mesh);
    [this.mesh].forEach((s) => {
      s.material.color.setStyle('#e0e8ef');
      s.material.roughnessMap = textures.load(`cubes/${this.options.obj}_roughness.ktx2`);
      s.material.roughness = 0.65;
      s.material.envMap = this.scene.envmap;
      s.material.envMapIntensity = 0.91;
      s.material.envMapRotation.y = Math.PI;
      s.material.normalMap = textures.load(`cubes/${this.options.obj}_normal.ktx2`);
      s.material.normalScale.set(1, 1);
      s.material.ior = 1.18;
      s.material.reflectivity = 0.3;
      s.material.transmission = 0;
    });
    this.mouseFrost = new FrostFeedback(this, {});
    this.mesh3 = new Mesh(
      t,
      new MeshBasicMaterial({
        map: textures.load(`cubes/${this.options.innerobject}_color.ktx2`),
      }),
    );
    this.mesh3.name = `${this.options.innerobject + this.options.index} `;
    this.mesh3.renderOrder = 10;
    this.add(this.mesh3);
    this.mesh.onBeforeRender = () => {
      if (this.mesh.material.side === FrontSide) {
        this.mouseFrost.update();
        this.mesh.material.uniforms.tMouseFrost.value = this.mouseFrost.finalRT.texture;
      }
    };
    this.mesh2 = new Mesh(
      new PlaneGeometry(2.5, 3.5),
      new ShaderMaterial({
        uniformsGroups: [runtime.UBO],
        uniforms: {
          tTexture1: {
            value: textures.load('wind_noise.ktx2', 'srgb-repeat'),
          },
          uColor1: {
            value: new Color('#886a3d'),
          },
          uProgress: {
            value: 100,
          },
        },
        vertexShader: composeShader(PortfolioCubevertexShader1, {
          matrixFunctions: matrixFunctions,
        }),
        fragmentShader: composeShader(PortfolioCubefragmentShader2, {
          globalUniformsGLSL: globalUniformsGLSL,
        }),
        transparent: true,
        depthTest: false,
        depthWrite: false,
      }),
    );
    this.mesh2.name = `smoke${this.options.index}`;
    this.mesh2.renderOrder = 15;
    this.mesh2.position.y = -0.35;
    this.add(this.mesh2);
    this.plexus = new CubePlexus(this);
    this.texts = new CubeAnnotations(this);
    await Promise.all([this.texts.ready, this.plexus.ready]);
    this.scene.add(this);
    this.isReady();
  }
  update(e, t, s) {
    var w;
    this.mesh.material.uniforms.uBlueOffset.value.set(Math.random(), Math.random());
    this.mesh.material.uniforms.uResolution.value.copy(runtime.uniforms.resolution.value);
    const n = this.options.centeredProgress - e,
      r = this.options.scrollPosition - t,
      a = n,
      o = ((s + this.scene.cubes[0].options.rand) * 242.45353) % 1 < 0.5 ? -1 : 1,
      l = o,
      c = -o,
      h = o,
      d = math.fit((this.options.rand * 12.3423) % 1, 0, 1, 0.1, 0.2),
      u = math.fit((this.options.rand * 123.5343) % 1, 0, 1, 0.1, 0.3),
      f = math.fit((this.options.rand * 54.654) % 1, 0, 1, 0.1, 0.25),
      p = 11 * l * (1 - d),
      A = 14 * c * (1 - u),
      m = 6 * h * (1 - f),
      g = 0.3,
      x = 0.1 * this.additionalRotationAmount.value,
      v =
        Math.sin(frameClock.time * g + this.options.rand * 12.423) *
        x *
        Math.sign(this.options.rand - 0.5),
      y =
        Math.sin(frameClock.time * g + this.options.rand * 42.987) *
        x *
        Math.sign(this.options.rand - 0.5),
      S =
        Math.sin(frameClock.time * g + this.options.rand * 2.53) *
        x *
        Math.sign(this.options.rand - 0.5);
    this.rotation.y = p * a + v;
    this.rotation.x = A * a + y;
    this.rotation.z = m * a + S;
    this.mesh2.material.uniforms.uProgress.value = a;
    this.texts.update(s, n, r);
    this.plexus.update(s, n, r);
    if ((w = this.scene.controller) != null && w.isDetailOpen)
      this.mouseFrost.interaction.disable();
    else if (Math.abs(r) < 2) this.mouseFrost.interaction.enable();
    else this.mouseFrost.interaction.disable();
  }
}
export { PortfolioCube };
