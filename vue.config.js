module.exports = {
  configureWebpack: {
    entry: {
      app: './src/main.js',
    },
  },
  lintOnSave: true,
  transpileDependencies: [
    'vuetify'
  ],
};
