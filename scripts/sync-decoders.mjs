import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const threeRoot = path.resolve(path.dirname(require.resolve('three')), '..');
for (const file of [
  'basis/basis_transcoder.js',
  'basis/basis_transcoder.wasm',
  'draco/draco_wasm_wrapper.js',
  'draco/draco_decoder.wasm',
  'draco/draco_decoder.js',
]) {
  const destination = `public/assets/libs/${file}`;
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.copyFile(path.join(threeRoot, 'examples/jsm/libs', file), destination);
}
console.log('Local Draco/Basis assets synchronized from installed Three.js.');
