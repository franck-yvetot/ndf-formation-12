module.exports = {
  plugins: [
    // Transform import.meta for Jest/Node.js CommonJS environment.
    // Without this, import.meta.env.VITE_* causes SyntaxError at runtime.
    function importMetaPlugin() {
      return {
        visitor: {
          MetaProperty(path) {
            if (
              path.node.meta.name === 'import' &&
              path.node.property.name === 'meta'
            ) {
              // Replace import.meta with { env: {} } so import.meta.env.VITE_API_URL
              // evaluates to undefined, then ?? falls back to the default value.
              path.replaceWithSourceString('({"env": {}})');
            }
          },
        },
      };
    },
  ],
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
    '@babel/preset-typescript',
  ],
};
