// Reconstructed application source. Third-party implementations are npm imports.
import FluidClearMaterialvertexShader1 from '../../shaders/engine/fluid/materials/FluidClearMaterial-vertexShader-1.glsl?raw';
import FluidClearMaterialfragmentShader2 from '../../shaders/engine/fluid/materials/FluidClearMaterial-fragmentShader-2.glsl?raw';
import FluidSplatMaterialvertexShader1 from '../../shaders/engine/fluid/materials/FluidSplatMaterial-vertexShader-1.glsl?raw';
import FluidSplatMaterialfragmentShader2 from '../../shaders/engine/fluid/materials/FluidSplatMaterial-fragmentShader-2.glsl?raw';
import FluidCurlMaterialvertexShader1 from '../../shaders/engine/fluid/materials/FluidCurlMaterial-vertexShader-1.glsl?raw';
import FluidCurlMaterialfragmentShader2 from '../../shaders/engine/fluid/materials/FluidCurlMaterial-fragmentShader-2.glsl?raw';
import FluidVorticityMaterialvertexShader1 from '../../shaders/engine/fluid/materials/FluidVorticityMaterial-vertexShader-1.glsl?raw';
import FluidVorticityMaterialfragmentShader2 from '../../shaders/engine/fluid/materials/FluidVorticityMaterial-fragmentShader-2.glsl?raw';
import FluidDivergenceMaterialvertexShader1 from '../../shaders/engine/fluid/materials/FluidDivergenceMaterial-vertexShader-1.glsl?raw';
import FluidDivergenceMaterialfragmentShader2 from '../../shaders/engine/fluid/materials/FluidDivergenceMaterial-fragmentShader-2.glsl?raw';
import FluidPressureMaterialvertexShader1 from '../../shaders/engine/fluid/materials/FluidPressureMaterial-vertexShader-1.glsl?raw';
import FluidPressureMaterialfragmentShader2 from '../../shaders/engine/fluid/materials/FluidPressureMaterial-fragmentShader-2.glsl?raw';
import FluidGradientMaterialvertexShader1 from '../../shaders/engine/fluid/materials/FluidGradientMaterial-vertexShader-1.glsl?raw';
import FluidGradientMaterialfragmentShader2 from '../../shaders/engine/fluid/materials/FluidGradientMaterial-fragmentShader-2.glsl?raw';
import FluidAdvectionMaterialvertexShader1 from '../../shaders/engine/fluid/materials/FluidAdvectionMaterial-vertexShader-1.glsl?raw';
import FluidAdvectionMaterialfragmentShader2 from '../../shaders/engine/fluid/materials/FluidAdvectionMaterial-fragmentShader-2.glsl?raw';
import { composeShader } from '../shaders/compose-shader.ts';
import { RawShaderMaterial, Vector2, Vector3 } from 'three';
class FluidClearMaterial extends RawShaderMaterial {
  constructor(e = {}) {
    super({
      name: 'FLUID_CLEAR',
      uniforms: {
        texelSize: {
          value: new Vector2(),
        },
        uTexture: {
          value: null,
        },
        value: {
          value: e.pressureDissipation,
        },
      },
      vertexShader: composeShader(FluidClearMaterialvertexShader1, {
        baseShader0: e.highPrecision,
      }),
      fragmentShader: composeShader(FluidClearMaterialfragmentShader2, {
        baseShader0: e.mediumPrecision,
        baseShader1: e.mediumPrecision,
      }),
      depthTest: false,
      depthWrite: false,
    });
  }
}
class FluidSplatMaterial extends RawShaderMaterial {
  constructor(e = {}) {
    super({
      name: 'FLUID_SPLAT',
      uniforms: {
        texelSize: {
          value: new Vector2(),
        },
        uTarget: {
          value: null,
        },
        aspectRatio: {
          value: 1,
        },
        color: {
          value: new Vector3(),
        },
        point: {
          value: new Vector2(),
        },
        prevPoint: {
          value: new Vector2(),
        },
        radius: {
          value: 1,
        },
        isDye: {
          value: false,
        },
      },
      vertexShader: composeShader(FluidSplatMaterialvertexShader1, {
        baseShader0: e.highPrecision,
      }),
      fragmentShader: composeShader(FluidSplatMaterialfragmentShader2, {
        baseShader0: e.highPrecision,
        baseShader1: e.highPrecision,
        baseShader2: e.splatMode === 1 ? '#define SPLAT_DOT' : '',
      }),
      depthTest: false,
      depthWrite: false,
    });
  }
}
class FluidCurlMaterial extends RawShaderMaterial {
  constructor(e = {}) {
    super({
      name: 'FLUID_CURL',
      uniforms: {
        texelSize: {
          value: new Vector2(),
        },
        uVelocity: {
          value: null,
        },
      },
      vertexShader: composeShader(FluidCurlMaterialvertexShader1, {
        baseShader0: e.highPrecision,
      }),
      fragmentShader: composeShader(FluidCurlMaterialfragmentShader2, {
        baseShader0: e.mediumPrecision,
        baseShader1: e.mediumPrecision,
      }),
      depthTest: false,
      depthWrite: false,
    });
  }
}
class FluidVorticityMaterial extends RawShaderMaterial {
  constructor(e = {}) {
    super({
      name: 'FLUID_VORTICITY',
      uniforms: {
        texelSize: {
          value: new Vector2(),
        },
        uVelocity: {
          value: null,
        },
        uCurl: {
          value: null,
        },
        curl: {
          value: e.curlStrength,
        },
        dt: {
          value: 1 / 60,
        },
      },
      vertexShader: composeShader(FluidVorticityMaterialvertexShader1, {
        baseShader0: e.highPrecision,
      }),
      fragmentShader: composeShader(FluidVorticityMaterialfragmentShader2, {
        baseShader0: e.highPrecision,
        baseShader1: e.highPrecision,
      }),
      depthTest: false,
      depthWrite: false,
    });
  }
}
class FluidDivergenceMaterial extends RawShaderMaterial {
  constructor(e = {}) {
    super({
      name: 'FLUID_DIVERGENCE',
      uniforms: {
        texelSize: {
          value: new Vector2(),
        },
        uVelocity: {
          value: null,
        },
      },
      vertexShader: composeShader(FluidDivergenceMaterialvertexShader1, {
        baseShader0: e.highPrecision,
      }),
      fragmentShader: composeShader(FluidDivergenceMaterialfragmentShader2, {
        baseShader0: e.mediumPrecision,
        baseShader1: e.mediumPrecision,
        baseShader2: e.borders ? '#define LIMIT_BORDERS' : '',
      }),
      depthTest: false,
      depthWrite: false,
    });
  }
}
class FluidPressureMaterial extends RawShaderMaterial {
  constructor(e = {}) {
    super({
      name: 'FLUID_PRESSURE',
      uniforms: {
        texelSize: {
          value: new Vector2(),
        },
        uPressure: {
          value: null,
        },
        uDivergence: {
          value: null,
        },
      },
      vertexShader: composeShader(FluidPressureMaterialvertexShader1, {
        baseShader0: e.highPrecision,
      }),
      fragmentShader: composeShader(FluidPressureMaterialfragmentShader2, {
        baseShader0: e.mediumPrecision,
        baseShader1: e.mediumPrecision,
      }),
      depthTest: false,
      depthWrite: false,
    });
  }
}
class FluidGradientMaterial extends RawShaderMaterial {
  constructor(e = {}) {
    super({
      name: 'FLUID_GRADIENT_SUBSTRACT',
      uniforms: {
        texelSize: {
          value: new Vector2(),
        },
        uPressure: {
          value: null,
        },
        uVelocity: {
          value: null,
        },
      },
      vertexShader: composeShader(FluidGradientMaterialvertexShader1, {
        baseShader0: e.highPrecision,
      }),
      fragmentShader: composeShader(FluidGradientMaterialfragmentShader2, {
        baseShader0: e.mediumPrecision,
        baseShader1: e.mediumPrecision,
      }),
      depthTest: false,
      depthWrite: false,
    });
  }
}
class FluidAdvectionMaterial extends RawShaderMaterial {
  constructor(e = {}) {
    super({
      name: 'FLUID_ADVECTION',
      uniforms: {
        texelSize: {
          value: new Vector2(),
        },
        dyeTexelSize: {
          value: new Vector2().setScalar(1 / e.dyeRes),
        },
        uVelocity: {
          value: null,
        },
        uSource: {
          value: null,
        },
        dt: {
          value: 1 / 60,
        },
        dissipation: {
          value: 1,
        },
      },
      vertexShader: composeShader(FluidAdvectionMaterialvertexShader1, {
        baseShader0: e.highPrecision,
      }),
      fragmentShader: composeShader(FluidAdvectionMaterialfragmentShader2, {
        baseShader0: e.highPrecision,
        baseShader1: e.highPrecision,
        baseShader2: e.linearFilteringSupported ? '' : '#define MANUAL_FILTERING',
      }),
      depthTest: false,
      depthWrite: false,
    });
  }
}
export {
  FluidClearMaterial,
  FluidSplatMaterial,
  FluidCurlMaterial,
  FluidVorticityMaterial,
  FluidDivergenceMaterial,
  FluidPressureMaterial,
  FluidGradientMaterial,
  FluidAdvectionMaterial,
};
