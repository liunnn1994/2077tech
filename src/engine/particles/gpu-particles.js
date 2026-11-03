// Reconstructed application source. Third-party implementations are npm imports.
import createGpuParticleClasschunk1 from '../../shaders/engine/particles/gpu-particles/createGpuParticleClass-chunk-1.glsl?raw';
import createGpuParticleClasschunk2 from '../../shaders/engine/particles/gpu-particles/createGpuParticleClass-chunk-2.glsl?raw';
import createGpuParticleClasschunk3 from '../../shaders/engine/particles/gpu-particles/createGpuParticleClass-chunk-3.glsl?raw';
import createGpuParticleClasschunk4 from '../../shaders/engine/particles/gpu-particles/createGpuParticleClass-chunk-4.glsl?raw';
import createGpuParticleClassvertexShader5 from '../../shaders/engine/particles/gpu-particles/createGpuParticleClass-vertexShader-5.glsl?raw';
import { composeShader } from '../shaders/compose-shader.ts';
import {
  Color,
  BufferGeometry,
  BufferAttribute,
  InstancedBufferGeometry,
  InstancedBufferAttribute,
  Points,
  InstancedMesh,
  FloatType,
  HalfFloatType,
  WebGLRenderTarget,
  ClampToEdgeWrapping,
  NearestFilter,
  RGBAFormat,
  ShaderMaterial,
} from 'three';
import { math } from '../core/math.js';
import { rendererService } from '../rendering/webgl-renderer.js';
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
const Lx = new Color();
const s3 = new Color('#000000');
function createParticleGeometry(i, e) {
  const t = i === 'points';
  let s = null;
  if (t) {
    s = new BufferGeometry();
    s.setAttribute('position', new BufferAttribute(new Float32Array(e * 3), 3));
  } else {
    const c = i.clone();
    s = new InstancedBufferGeometry();
    s.instanceCount = e;
    if (c.index) s.setIndex(c.index);
    for (const h in c.attributes) s.setAttribute(h, c.attributes[h]);
  }
  const n = [],
    r = [],
    a = math.getTextureSizeParticles(e),
    o = (1 / a) * 0.5;
  for (let c = 0; c < e; c++) {
    n.push(Math.random(), Math.random(), Math.random(), Math.random());
    const h = (c % a) / a + o,
      d = Math.floor(c / a) / a + o;
    r.push(h, d);
  }
  const l = t ? BufferAttribute : InstancedBufferAttribute;
  s.setAttribute('rand', new l(new Float32Array(n), 4));
  s.setAttribute('texuv', new l(new Float32Array(r), 2));
  return s;
}
function createGpuParticleClass(i) {
  const e = i === 'points' ? Points : InstancedMesh;
  return class extends e {
    constructor(t = {}, s = {}) {
      super(t.geometry, t.material, t.count);
      this.isParticlesGPU = true;
      this.name = 'GPU Particles';
      this.particlesCount = t.count;
      this.frustumCulled = false;
      const n = rendererService.webgl.capabilities.floatRenderTarget ? FloatType : HalfFloatType,
        r = math.getTextureSizeParticles(this.particlesCount);
      if (
        ((this.rt1 = new WebGLRenderTarget(r, r, {
          count: s.textures || 1,
          wrapS: ClampToEdgeWrapping,
          wrapT: ClampToEdgeWrapping,
          minFilter: NearestFilter,
          magFilter: NearestFilter,
          format: RGBAFormat,
          type: n,
          depthBuffer: false,
        })),
        (this.rt2 = this.rt1.clone()),
        (this.rtCurrent = 0),
        (this.fsQuad = new FullScreenQuad(null)),
        s.initialTextures && s.initialTextures.length > 0)
      ) {
        const a = {};
        s.initialTextures.forEach((d, u) => {
          a[`tTexture${u + 1}`] = {
            value: d,
          };
        });
        const o = () => {
            let d = createGpuParticleClasschunk1;
            Object.keys(a).forEach((u, f) => {
              if (f === 0) d += createGpuParticleClasschunk2;
              else
                d += `layout(location = ${f}) out highp vec4 outTex${f + 1};
`;
              d += composeShader(createGpuParticleClasschunk3, {
                u: u,
              });
            });
            d += createGpuParticleClasschunk4;
            Object.keys(a).forEach((u, f) => {
              d += `outTex${f + 1} = texture2D(${u}, vUv);
`;
            });
            d += '}';
            return d;
          },
          l = new ShaderMaterial({
            uniforms: a,
            vertexShader: createGpuParticleClassvertexShader5,
            fragmentShader: o(),
          });
        this.fsQuad.material = l;
        const c = rendererService.webgl.autoClear,
          h = rendererService.webgl.getRenderTarget();
        rendererService.webgl.autoClear = false;
        rendererService.webgl.setRenderTarget(this.rt1);
        this.fsQuad.render(rendererService.webgl);
        rendererService.webgl.setRenderTarget(this.rt2);
        this.fsQuad.render(rendererService.webgl);
        rendererService.webgl.autoClear = c;
        rendererService.webgl.setRenderTarget(h);
        l.dispose();
      }
      this.computationMaterial = s.material;
      this.fsQuad.material = this.computationMaterial;
      if (s.afterCompute) this.afterCompute = s.afterCompute;
      if (s.autoCompute !== false) this.onBeforeRender = this.compute.bind(this);
    }
    compute(t = rendererService.webgl, s, n) {
      const r = this.computationMaterial.uniforms.uModelMatrix,
        a = this.computationMaterial.uniforms.uViewMatrix,
        o = this.computationMaterial.uniforms.uProjMatrix;
      if (r) r.value.copy(this.matrixWorld);
      if (a) a.value.copy(n.matrixWorldInverse);
      if (o) o.value.copy(n.projectionMatrix);
      const l = this.rtCurrent === 0 ? this.rt1 : this.rt2,
        c = this.rtCurrent === 0 ? this.rt2 : this.rt1;
      this.rtCurrent = (this.rtCurrent + 1) % 2;
      for (let f = 0; f < c.textures.length; f++) {
        const p = this.computationMaterial.uniforms[`tTexture${f + 1}`];
        if (p) p.value = c.textures[f];
      }
      const h = t.autoClear;
      t.autoClear = false;
      const d = t.getRenderTarget();
      t.setRenderTarget(l);
      t.getClearColor(Lx);
      const u = t.getClearAlpha();
      t.setClearColor(s3, 0);
      t.clear(true, false, false);
      this.fsQuad.render(t);
      t.autoClear = h;
      t.setRenderTarget(d);
      t.setClearColor(Lx, u);
      for (let f = 0; f < l.textures.length; f++) {
        const p = this.material.uniforms[`tTexture${f + 1}`];
        if (p) p.value = l.textures[f];
        const A = this.material.uniforms[`tTexture${f + 1}Prev`];
        if (A) A.value = c.textures[f];
      }
      if (this.afterCompute) this.afterCompute(t, s, n);
    }
    dispose() {
      var t;
      this.fsQuad.dispose();
      this.computationMaterial.dispose();
      this.rt1.dispose();
      this.rt2.dispose();
      if (!((t = super.dispose) == null)) t.call(this);
    }
  };
}
function createGpuParticles(i = {}, e = {}) {
  const t = i.geometry,
    s = i.material,
    n = i.count || 1024,
    r = createParticleGeometry(t, n),
    a = createGpuParticleClass(t);
  return new a(
    {
      geometry: r,
      material: s,
      count: n,
    },
    e,
  );
}
export { Lx, s3, createParticleGeometry, createGpuParticleClass, createGpuParticles };
