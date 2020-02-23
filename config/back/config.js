module.exports = function({ envIsTest }) {
  let config = {
    isNode: true,
    isLibrary: true,
    id: "back",
    useHot: true,
    devServerPort: 8080
  };

  config.useWorkBox = !config.isLibrary;
  config.useHtmlCreation = !config.isLibrary;
  config.useCodeSplitting = !config.isLibrary;
  config.useStats = !config.isLibrary;

  return config;
};
