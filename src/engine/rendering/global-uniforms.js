// Reconstructed application source. Third-party implementations are npm imports.
import { Vector2, UniformsGroup } from 'three';
const globalUniforms = {
  resolution: {
    value: new Vector2(2, 2),
    global: true,
  },
  resolutionUI: {
    value: new Vector2(2, 2),
    global: true,
  },
  aspect: {
    value: 1,
    global: true,
  },
  time: {
    value: 0,
    global: true,
  },
  dtRatio: {
    value: 1,
    global: true,
  },
};
const globalUniformGroup = new UniformsGroup();
globalUniformGroup.setName('Global');
globalUniformGroup.add(globalUniforms.resolution);
globalUniformGroup.add(globalUniforms.resolutionUI);
globalUniformGroup.add(globalUniforms.aspect);
globalUniformGroup.add(globalUniforms.time);
globalUniformGroup.add(globalUniforms.dtRatio);
export { globalUniforms, globalUniformGroup };
