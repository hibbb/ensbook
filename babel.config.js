module.exports = function (api) {
  // api.cache(false);
  api.cache.forever();
  return {
    plugins: ['macros'],
  };
};
