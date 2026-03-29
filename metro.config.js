const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Allow Metro to bundle .txt files as assets
config.resolver.assetExts.push('txt');

module.exports = config;
