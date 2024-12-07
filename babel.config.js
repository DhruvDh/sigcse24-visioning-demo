const ReactCompilerConfig = {
  target: '18' // '17' | '18' | '19'
};

module.exports = function (api) {
  // Enable caching for faster transforms
  api.cache(true);

  return {
    presets: [
      ['@babel/preset-env'],
      ['@babel/preset-react', { runtime: 'automatic' }],
      ['@babel/preset-typescript']
    ],
    plugins: [
      ['babel-plugin-react-compiler', ReactCompilerConfig],
    ],
  };
};