#!/usr/bin/env zx

const { REGISTRY } = process.env;
const { version } = argv;

await main();

async function main() {
  await buildAndArchive();
  await deploy();
}

async function deploy() {
  console.log(
    '------------------------------->',
    new Date().toLocaleString(),
    `${REGISTRY}/2077tech/homepage:${version} is deploying...`,
    '<-------------------------------',
  );
  await $`docker build --build-arg VERSION=${version} --build-arg CREATED=${rfc3339()} -f Dockerfile -t ${version} .`;
  await $`docker tag ${version} ${REGISTRY}/2077tech/homepage:${version}`;
  await $`docker tag ${version} ${REGISTRY}/2077tech/homepage:latest`;
  await $`docker push ${REGISTRY}/2077tech/homepage:${version}`;
  await $`docker push ${REGISTRY}/2077tech/homepage:latest`;
}

async function buildAndArchive() {
  console.log(new Date().toLocaleString(), `homepage v${version} is building...`);
  await $`pnpm run build`.verbose();
  console.log(new Date().toLocaleString(), `homepage v${version} is finished building`);
}

/**
 * rfc3339 时间格式化
 * @param {Date} d Date
 * @returns {string} rfc3339 时间格式
 */
function rfc3339(d = new Date()) {
  function pad(n) {
    return n < 10 ? '0' + n : n;
  }

  function timezoneOffset(offset) {
    let sign;
    if (offset === 0) {
      return 'Z';
    }
    sign = offset > 0 ? '-' : '+';
    offset = Math.abs(offset);
    return sign + pad(Math.floor(offset / 60)) + ':' + pad(offset % 60);
  }

  return (
    d.getFullYear() +
    '-' +
    pad(d.getMonth() + 1) +
    '-' +
    pad(d.getDate()) +
    'T' +
    pad(d.getHours()) +
    ':' +
    pad(d.getMinutes()) +
    ':' +
    pad(d.getSeconds()) +
    timezoneOffset(d.getTimezoneOffset())
  );
}
