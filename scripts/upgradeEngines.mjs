import { writeFileSync, readFileSync } from 'node:fs';
import axios from 'axios';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));

const pnpmVersion = pkg.packageManager?.split('@')[1];
const nodeVersion = await getNodeLtsVersion();

if (!pnpmVersion) {
  throw new Error('packageManager not found in package.json');
}

if (!nodeVersion) {
  throw new Error('node version not found');
}

if (!pkg.engines) {
  pkg.engines = {};
}

pkg.engines.node = nodeVersion;
pkg.volta = { node: nodeVersion, pnpm: pnpmVersion };
writeFileSync('package.json', JSON.stringify(pkg, null, 2));

async function getNodeLtsVersion() {
  return (await axios.get('https://cdn.npmmirror.com/binaries/node/index.json')).data
    .find((v) => v.lts)
    .version.replace('v', '');
}
