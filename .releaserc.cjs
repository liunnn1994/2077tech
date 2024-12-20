/**
 * @type {import('semantic-release').GlobalConfig}
 */

const config = {
  branches: ['main'],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/changelog',
      {
        changelogFile: 'CHANGELOG.md',
      },
    ],
    [
      '@semantic-release/npm',
      {
        npmPublish: false,
      },
    ],
    [
      '@semantic-release/exec',
      {
        prepareCmd: 'scripts/deploy.js --branch ${branch.name} --version ${nextRelease.version}',
      },
    ],
    [
      '@semantic-release/git',
      {
        message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
        assets: ['package.json', 'CHANGELOG.md'],
      },
    ],
    ['@semantic-release/github'],
  ],
};

module.exports = config;
