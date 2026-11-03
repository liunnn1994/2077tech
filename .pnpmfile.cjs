// svelte-check uses the TS6 JavaScript API while --tsgo delegates diagnostics
// to the project's TS7 compiler. Keep that compatibility API private to it.
module.exports = {
  hooks: {
    readPackage(pkg) {
      if (pkg.name === 'svelte-check' && pkg.version === '4.7.8') {
        pkg.dependencies = { ...pkg.dependencies, typescript: '6.0.3' };
        delete pkg.peerDependencies.typescript;
      }
      return pkg;
    },
  },
};
