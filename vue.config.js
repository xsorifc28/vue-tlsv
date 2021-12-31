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
  publicPath: process.env.NODE_ENV === 'production' ? '/vue-tlsv/' : '/'
};
