module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'header-max-length': [1, 'always', 128],
    'body-max-length': [1, 'always', 1000],
    'footer-max-length': [1, 'always', 1000],
    'body-max-line-length': [1, 'always', 1000],
    'footer-max-line-length': [1, 'always', 1000],
    'type-enum': [
      1,
      'always',
      [
        'build',
        'chore',
        'ci',
        'docs',
        'feat',
        'fix',
        'perf',
        'refactor',
        'revert',
        'style',
        'test',
        'wip',
        'release',
      ],
    ],
  },
};
