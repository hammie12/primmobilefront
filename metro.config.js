const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = {
  ...config,
  resolver: {
    ...config.resolver,
    sourceExts: [...config.resolver.sourceExts, 'jsx', 'js', 'ts', 'tsx', 'json'],
    extraNodeModules: {
      ...config.resolver.extraNodeModules,
      'url': require.resolve('react-native-url-polyfill'),
      'react-native-url-polyfill': require.resolve('react-native-url-polyfill'),
    },
  },
  transformer: {
    ...config.transformer,
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
}; 