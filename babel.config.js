module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['./babel-plugin-strip-import-meta', 'react-native-reanimated/plugin'],
  };
};
