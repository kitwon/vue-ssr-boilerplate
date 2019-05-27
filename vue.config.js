/* eslint-disable no-param-reassign */
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin');
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin');
const nodeExternals = require('webpack-node-externals');
const WebpackBar = require('webpackbar');

const vueConfig = {
  outputDir: 'static',
  css: {
    extract: process.env.NODE_ENV === 'production'
  }
};

const chainWebpack = (config) => {
  const target = process.env.SSR_TARGET;
  const isProd = process.env.NODE_ENV === 'production';
  const isServer = target === 'server';

  config.entry('app').clear()
    .add(`./src/entry-${target}.ts`).end();

  config.plugins.delete('hmr');
  config.plugins.delete('preload');
  config.plugins.delete('prefetch');
  config.plugins.delete('progress');
  if (!isProd) config.plugins.delete('no-emit-on-errors');
  // HTML
  if (isProd) {
    config.plugin('html').tap((args) => {
      args[0].minify.removeComments = false;
      return args;
    });
  }

  config.stats(isProd ? 'normal' : 'none');
  config.devServer.stats('errors-only').quiet(true).noInfo(true);

  if (isServer) {
    config.output.libraryTarget('commonjs2');
    config.node.clear();
    config.externals(nodeExternals({ whitelist: [/\.css$/, /\?vue&type=style/] }));
    config.target('node');
    config.optimization.splitChunks(false).minimize(false);
    config.plugins.delete('friendly-errors');
    config.plugin('ssr-server').use(VueSSRServerPlugin);
    config.plugin('loader').use(WebpackBar, [{ name: 'Server', color: 'orange' }]);

    // Change cache directory for server-side
    config.module.rule('vue').use('cache-loader').tap((options) => {
      options.cacheIdentifier += '-server';
      options.cacheDirectory += '-server';
      return options;
    });

    config.module.rule('vue').use('vue-loader').tap((options) => {
      options.cacheIdentifier += '-server';
      options.cacheDirectory += '-server';
      options.optimizeSSR = isServer;
      return options;
    });
  } else {
    config.plugin('ssr-client').use(VueSSRClientPlugin);
    config.plugin('loader').use(WebpackBar, [{ name: 'Client', color: 'green' }]);
    config.devtool(!isProd ? '#cheap-module-source-map' : undefined);

    config.module.rule('vue').use('vue-loader').tap((options) => {
      options.optimizeSSR = false;
      return options;
    });
  }
};

module.exports = { ...vueConfig, chainWebpack };
