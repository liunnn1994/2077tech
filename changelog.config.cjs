/* eslint-disable */
module.exports = {
  list: [
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
  types: {
    build: {
      description: '修改项目构建系统，例如修改依赖库、外部接口或者升级 Node 版本等',
      emoji: '🏗️',
      value: 'build',
    },
    chore: {
      description: '构建流程或辅助工具变更',
      emoji: '🤖',
      value: 'chore',
    },
    ci: {
      description: '与 CI 有关的更改',
      emoji: '🎡',
      value: 'ci',
    },
    docs: {
      description: '仅更改文档',
      emoji: '✏️',
      value: 'docs',
    },
    feat: {
      description: '新功能',
      emoji: '🎸',
      value: 'feat',
    },
    fix: {
      description: 'Bug 修复',
      emoji: '🐛',
      value: 'fix',
    },
    perf: {
      description: '改进性能的代码变更',
      emoji: '⚡️',
      value: 'perf',
    },
    refactor: {
      description: '既不修复错误也不增加功能的代码更改',
      emoji: '💡',
      value: 'refactor',
    },
    release: {
      description: '创建版本提交',
      emoji: '🏹',
      value: 'release',
    },
    style: {
      description: '标记、空格、格式化、分号丢失等...',
      emoji: '💄',
      value: 'style',
    },
    test: {
      description: '添加缺少的测试',
      emoji: '💍',
      value: 'test',
    },
    wip: {
      description: 'Work in progress',
      emoji: '👷',
      value: 'wip',
    },
    revert: {
      description: '撤回之前的 commit',
      emoji: '🔙',
      value: 'revert',
    },
    messages: {
      type: '选择要提交的更改类型：',
      customScope: '选择此组件影响的范围：',
      subject: '写一段简短的、命令式的情绪描述，说明这一变化：\n',
      body: '提供更详细的变更说明：\n ',
      breaking: '列出破坏性的改动：\n',
      footer: '该提交关闭的问题，例如 #123：',
      confirmCommit: '此提交影响的软件包\n',
    },
  },
};
