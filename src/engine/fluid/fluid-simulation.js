// Reconstructed application source. Third-party implementations are npm imports.
import {
  WebGLRenderTarget,
  HalfFloatType,
  Vector2,
  RGBAFormat,
  LinearFilter,
  NearestFilter,
  Scene,
  OrthographicCamera,
  Mesh,
} from 'three';
import { runtime } from '../rendering/runtime.ts';
import { rendererService } from '../rendering/webgl-renderer.js';
import {
  FluidClearMaterial,
  FluidSplatMaterial,
  FluidCurlMaterial,
  FluidVorticityMaterial,
  FluidDivergenceMaterial,
  FluidPressureMaterial,
  FluidGradientMaterial,
  FluidAdvectionMaterial,
} from './materials.js';
import { geometryUtils } from '../geometry/shared.js';
import { bh } from '../fluid.js';
import { math } from '../core/math.js';
import { events } from '../core/events.ts';
const fluidDefaults = {
  SIMULATION_RESOLUTION: 128,
  DYE_RESOLUTION: 512,
  DENSITY_DISSIPATION: 0.97,
  VELOCITY_DISSIPATION: 0.98,
  PRESSURE_DISSIPATION: 0.8,
  PRESSURE_ITERATIONS: 3,
  CURL_STRENGTH: 10,
  SPLAT_RADIUS: 0.12,
  SPLAT_RADIUS_VELOCITY: true,
  SPLAT_FORCE: 50,
  BORDERS: false,
};
const FluidSizing = {
  SCREEN: 1,
  CUSTOM: 2,
};
const FluidSplatMode = {
  DOT: 1,
  LINE: 2,
};
function createPingPongTarget(i, e, t) {
  const s = new WebGLRenderTarget(i, i, {
      format: e,
      type: HalfFloatType,
      magFilter: t,
      minFilter: t,
      depthBuffer: false,
    }),
    n = s.clone(),
    r = {
      read: s,
      write: n,
      swap: () => {
        const a = r.read;
        r.read = r.write;
        r.write = a;
      },
    };
  return r;
}
class FluidSimulation {
  constructor({
    simRes: _simRes = fluidDefaults.SIMULATION_RESOLUTION,
    dyeRes: _dyeRes = fluidDefaults.DYE_RESOLUTION,
    pressureIteration: _pressureIterations = fluidDefaults.PRESSURE_ITERATIONS,
    densityDissipation: _densityDissipation = fluidDefaults.DENSITY_DISSIPATION,
    velocityDissipation: _velocityDissipation = fluidDefaults.VELOCITY_DISSIPATION,
    pressureDissipation: _pressureDissipation = fluidDefaults.PRESSURE_DISSIPATION,
    curlStrength: _curlStrength = fluidDefaults.CURL_STRENGTH,
    splatRadius: _splatRadius = fluidDefaults.SPLAT_RADIUS,
    splatRadiusVelocity: _splatRadiusVelocity = fluidDefaults.SPLAT_RADIUS_VELOCITY,
    splatForce: _splatForce = fluidDefaults.SPLAT_FORCE,
    splatMode: d = 'line',
    borders: _borders = fluidDefaults.BORDERS,
    mode: f = 'screen',
    fingers: p = runtime.fingers,
  } = {}) {
    this.isFluid = true;
    this._linearFilteringSupported = rendererService.webgl.capabilities.floatLinearFiltering;
    this._simRes = _simRes;
    this._dyeRes = _dyeRes;
    this._simTexelSize = 1 / this._simRes;
    this._dyeTexelSize = 1 / this._dyeRes;
    this._pressureIterations = _pressureIterations;
    this._densityDissipation = _densityDissipation;
    this._velocityDissipation = _velocityDissipation;
    this._pressureDissipation = _pressureDissipation;
    this._curlStrength = _curlStrength;
    this._splatRadius = _splatRadius;
    this._splatRadiusVelocity = _splatRadiusVelocity;
    this._splatForce = _splatForce;
    this._splatMode = FluidSplatMode[d.toUpperCase()];
    this._borders = _borders;
    this._mode = FluidSizing[f.toUpperCase()];
    this._aspect = 1;
    this._fingers = Math.min(p, this._mode === FluidSizing.SCREEN ? runtime.fingers : 1 / 0);
    this._enabled = false;
    this.points = Array.from(Array(this._fingers), () => ({
      position: new Vector2(0.5, 0.5),
      prevPosition: new Vector2(0.5, 0.5),
      lastUpdate: 0,
      lastSplat: 0,
      velocity: 0,
    }));
    this._createRTs();
    this._createMaterials();
    this._createScene();
    this.dyeUniform = {
      value: null,
    };
    this.velUniform = {
      value: null,
    };
    this.enable();
  }
  _createRTs() {
    this._density = createPingPongTarget(
      this._dyeRes,
      RGBAFormat,
      this._linearFilteringSupported ? LinearFilter : NearestFilter,
    );
    this._velocity = createPingPongTarget(
      this._simRes,
      RGBAFormat,
      this._linearFilteringSupported ? LinearFilter : NearestFilter,
    );
    this._pressure = createPingPongTarget(this._simRes, RGBAFormat, NearestFilter);
    const e = {
      type: HalfFloatType,
      magFilter: NearestFilter,
      minFilter: NearestFilter,
      depthBuffer: false,
    };
    this._divergence = new WebGLRenderTarget(this._simRes, this._simRes, e);
    this._curl = new WebGLRenderTarget(this._simRes, this._simRes, e);
  }
  _createMaterials() {
    const e = rendererService.webgl.capabilities,
      t = e.getMaxPrecision('highp'),
      s = e.getMaxPrecision('mediump');
    this._materialClear = new FluidClearMaterial({
      highPrecision: t,
      mediumPrecision: s,
      pressureDissipation: this._pressureDissipation,
    });
    this._materialSplat = new FluidSplatMaterial({
      highPrecision: t,
      mediumPrecision: s,
      splatMode: this._splatMode,
    });
    this._materialCurl = new FluidCurlMaterial({
      highPrecision: t,
      mediumPrecision: s,
    });
    this._materialVorticity = new FluidVorticityMaterial({
      highPrecision: t,
      mediumPrecision: s,
      curlStrength: this._curlStrength,
    });
    this._materialDivergence = new FluidDivergenceMaterial({
      highPrecision: t,
      mediumPrecision: s,
      borders: this._borders,
    });
    this._materialPressure = new FluidPressureMaterial({
      highPrecision: t,
      mediumPrecision: s,
    });
    this._materialGradientSubstract = new FluidGradientMaterial({
      highPrecision: t,
      mediumPrecision: s,
    });
    this._materialAdvection = new FluidAdvectionMaterial({
      highPrecision: t,
      mediumPrecision: s,
      dyeRes: this._dyeRes,
      linearFilteringSupported: this._linearFilteringSupported,
    });
  }
  _createScene() {
    this._scene = new Scene();
    this._camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this._mesh = new Mesh(geometryUtils.triangle, this._materialClear);
    this._mesh.frustumCulled = false;
    this._scene.add(this._mesh);
  }
  _update(e, _t) {
    if (this._mode === FluidSizing.SCREEN)
      this._aspect = runtime.uniforms.resolution.value.x / runtime.uniforms.resolution.value.y;
    const s = rendererService.webgl.autoClear,
      n = rendererService.webgl.getRenderTarget();
    rendererService.webgl.autoClear = false;
    this.points.forEach((a) => {
      if (e - a.lastUpdate < 0.016) return;
      bh.subVectors(a.position, a.prevPosition);
      const o = bh.length();
      if (((a.velocity += o * 2), o > 0)) {
        const l = e - a.lastSplat > 0.15;
        this._mesh.material = this._materialSplat;
        this._materialSplat.uniforms.isDye.value = false;
        this._materialSplat.uniforms.uTarget.value = this._velocity.read.texture;
        this._materialSplat.uniforms.aspectRatio.value = this._aspect;
        this._materialSplat.uniforms.point.value.copy(a.position);
        this._materialSplat.uniforms.prevPoint.value.copy(l ? a.position : a.prevPosition);
        this._materialSplat.uniforms.color.value
          .set(bh.x * this._aspect, bh.y, 0)
          .multiplyScalar(this._splatForce)
          .multiplyScalar(l ? 0 : 1);
        this._materialSplat.uniforms.radius.value =
          this._splatRadius * (this._splatRadiusVelocity ? a.velocity : 1);
        rendererService.webgl.setRenderTarget(this._velocity.write);
        rendererService.webgl.render(this._scene, this._camera);
        this._velocity.swap();
        this._materialSplat.uniforms.isDye.value = true;
        this._materialSplat.uniforms.uTarget.value = this._density.read.texture;
        this._materialSplat.uniforms.color.value.setScalar(1);
        rendererService.webgl.setRenderTarget(this._density.write);
        rendererService.webgl.render(this._scene, this._camera);
        this._density.swap();
        a.lastSplat = e;
      }
      a.lastUpdate = e;
      a.prevPosition.copy(a.position);
      a.velocity *= 0.9;
      a.velocity = Math.min(1, a.velocity);
    });
    const r = math.deltaRatio();
    this._mesh.material = this._materialCurl;
    this._materialCurl.uniforms.texelSize.value.setScalar(this._simTexelSize);
    this._materialCurl.uniforms.uVelocity.value = this._velocity.read.texture;
    rendererService.webgl.setRenderTarget(this._curl);
    rendererService.webgl.render(this._scene, this._camera);
    this._mesh.material = this._materialVorticity;
    this._materialVorticity.uniforms.texelSize.value.setScalar(this._simTexelSize);
    this._materialVorticity.uniforms.uVelocity.value = this._velocity.read.texture;
    this._materialVorticity.uniforms.uCurl.value = this._curl.texture;
    this._materialVorticity.uniforms.curl.value = this._curlStrength;
    this._materialVorticity.uniforms.dt.value = r;
    rendererService.webgl.setRenderTarget(this._velocity.write);
    rendererService.webgl.render(this._scene, this._camera);
    this._velocity.swap();
    this._mesh.material = this._materialDivergence;
    this._materialDivergence.uniforms.texelSize.value.setScalar(this._simTexelSize);
    this._materialDivergence.uniforms.uVelocity.value = this._velocity.read.texture;
    rendererService.webgl.setRenderTarget(this._divergence);
    rendererService.webgl.render(this._scene, this._camera);
    this._mesh.material = this._materialClear;
    this._materialClear.uniforms.uTexture.value = this._pressure.read.texture;
    this._materialClear.uniforms.value.value = math.frictionFPS(this._pressureDissipation);
    rendererService.webgl.setRenderTarget(this._pressure.write);
    rendererService.webgl.render(this._scene, this._camera);
    this._pressure.swap();
    this._mesh.material = this._materialPressure;
    this._materialPressure.uniforms.texelSize.value.setScalar(this._simTexelSize);
    this._materialPressure.uniforms.uDivergence.value = this._divergence.texture;
    for (let a = 0; a < this._pressureIterations; a++) {
      this._materialPressure.uniforms.uPressure.value = this._pressure.read.texture;
      rendererService.webgl.setRenderTarget(this._pressure.write);
      rendererService.webgl.render(this._scene, this._camera);
      this._pressure.swap();
    }
    this._mesh.material = this._materialGradientSubstract;
    this._materialGradientSubstract.uniforms.texelSize.value.setScalar(this._simTexelSize);
    this._materialGradientSubstract.uniforms.uPressure.value = this._pressure.read.texture;
    this._materialGradientSubstract.uniforms.uVelocity.value = this._velocity.read.texture;
    rendererService.webgl.setRenderTarget(this._velocity.write);
    rendererService.webgl.render(this._scene, this._camera);
    this._velocity.swap();
    this._mesh.material = this._materialAdvection;
    this._materialAdvection.uniforms.texelSize.value.setScalar(this._simTexelSize);
    this._materialAdvection.uniforms.dyeTexelSize.value.setScalar(this._simTexelSize);
    this._materialAdvection.uniforms.uVelocity.value = this._velocity.read.texture;
    this._materialAdvection.uniforms.uSource.value = this._velocity.read.texture;
    this._materialAdvection.uniforms.dt.value = r;
    this._materialAdvection.uniforms.dissipation.value = math.frictionFPS(
      this._velocityDissipation,
    );
    rendererService.webgl.setRenderTarget(this._velocity.write);
    rendererService.webgl.render(this._scene, this._camera);
    this._velocity.swap();
    this._materialAdvection.uniforms.dyeTexelSize.value.setScalar(this._dyeTexelSize);
    this._materialAdvection.uniforms.uVelocity.value = this._velocity.read.texture;
    this._materialAdvection.uniforms.uSource.value = this._density.read.texture;
    this._materialAdvection.uniforms.dissipation.value = math.frictionFPS(this._densityDissipation);
    rendererService.webgl.setRenderTarget(this._density.write);
    rendererService.webgl.render(this._scene, this._camera);
    this._density.swap();
    rendererService.webgl.autoClear = s;
    rendererService.webgl.setRenderTarget(n);
    this.dyeUniform.value = this._density.read.texture;
    this.velUniform.value = this._velocity.read.texture;
  }
  _moveFinger(e) {
    this.points[e.finger].position.copy(e.position01);
  }
  enable() {
    if (
      !this._enabled &&
      ((this._enabled = true),
      events.on('webgl_prerender', this._update, this),
      this._mode === FluidSizing.SCREEN)
    )
      for (let e = 0; e < this._fingers; e++) {
        events.on(`touch${e === 0 ? '' : e + 1}_start`, this._moveFinger, this);
        events.on(`touch${e === 0 ? '' : e + 1}_move`, this._moveFinger, this);
      }
  }
  disable() {
    if (
      this._enabled &&
      ((this._enabled = false),
      events.off('webgl_prerender', this._update, this),
      this._mode === FluidSizing.SCREEN)
    )
      for (let e = 0; e < this._fingers; e++) {
        events.off(`touch${e === 0 ? '' : e + 1}_start`, this._moveFinger, this);
        events.off(`touch${e === 0 ? '' : e + 1}_move`, this._moveFinger, this);
      }
  }
  debug() {}
  dispose() {
    this.disable();
    this._materialClear.dispose();
    this._materialSplat.dispose();
    this._materialCurl.dispose();
    this._materialVorticity.dispose();
    this._materialDivergence.dispose();
    this._materialPressure.dispose();
    this._materialGradientSubstract.dispose();
    this._materialAdvection.dispose();
    [this._density, this._velocity, this._pressure].forEach(
      (e) => e.read.dispose() && e.write.dispose(),
    );
    this._divergence.dispose();
    this._curl.dipose();
  }
}
export { fluidDefaults, FluidSizing, FluidSplatMode, createPingPongTarget, FluidSimulation };
