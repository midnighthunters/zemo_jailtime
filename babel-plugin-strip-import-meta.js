module.exports = function stripImportMeta({ types: t }) {
  return {
    name: 'strip-import-meta-for-expo-classic-web-script',
    visitor: {
      MetaProperty(path) {
        if (path.node.meta.name === 'import' && path.node.property.name === 'meta') {
          path.replaceWith(t.objectExpression([]));
        }
      },
    },
  };
};
