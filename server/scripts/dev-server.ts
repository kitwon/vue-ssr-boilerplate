import * as Koa from 'koa';
import chalk from 'chalk';
import * as webpack from 'webpack';
// import * as webpackDevMiddleware from 'webpack-dev-middleware';
import * as koaWebpack from 'koa-webpack';
import * as webpackHotMiddleware from 'webpack-hot-middleware';
import * as path from 'path';
import config from '../config';
import { clientConfig, serverConfig } from './webpack';

const MFS = require('memory-fs');
const e2k = require('express-to-koa');

interface DevOptions {
  server: Koa,
  templatePath: string,
  onUpdate: updateCallback
}

interface updateCallback {
  (args: OnUpdateArgs): void
}

interface OnUpdateArgs {
  serverBundle: any;
  options: {
    template: string;
    clientManifest: JSON
  }
}


export default function setupDevServer(
  { server, templatePath, onUpdate }: DevOptions
): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const readFile = (fs: any, file: string) => {
      try {
        return fs.readFileSync(path.join(clientConfig.output.path, file), 'utf-8');
      } catch (e) {
        console.error(e);
        return e;
      }
    };

    let serverBundle;
    let template;
    let clientManifest;

    const url = `http://localhost:${config.serve.port}${clientConfig.output.publicPath}`;

    // HMR update callback
    const update = () => {
      if (serverBundle && clientManifest) {
        resolve();
        onUpdate({
          serverBundle,
          options: {
            template,
            clientManifest
          }
        });
      }
    };

    function onCompilationCompleted() {
      console.log();
      console.log('   🚀 App running at:');
      console.log(`   - Local: ${chalk.cyan(url)}`);
    }

    // modify client config to work with hot middleware
    clientConfig.entry.app = ['webpack-hot-middleware/client', ...clientConfig.entry.app];

    // Dev middleware
    // Regist client middleware
    const clientCompiler = webpack(clientConfig);
    const middleware = await koaWebpack({
      compiler: clientCompiler,
      devMiddleware: {
        publicPath: clientConfig.output.publicPath,
        stats: 'none',
        logLevel: 'error',
        index: false
      }
    });
    server.use(middleware);

    // Set webpack hook
    clientCompiler.hooks.done.tap('SSR', async (stats: webpack.Stats) => {
      const jsonStat = stats.toJson();
      if (stats.hasErrors()) {
        console.log(chalk.red('Client errors'));
        jsonStat.errors.forEach(err => console.error(err));
      }
      if (stats.hasWarnings()) {
        console.log(chalk.yellow('Client warnings'));
        jsonStat.errors.forEach(err => console.warn(err));
      }
      if (stats.hasErrors()) return;

      clientManifest = JSON.parse(readFile(
        middleware.devMiddleware.fileSystem,
        'vue-ssr-client-manifest.json'
      ));

      // HTML Template
      template = middleware.devMiddleware.fileSystem.readFileSync(templatePath, 'utf-8');

      update();
      onCompilationCompleted();
    });

    clientCompiler.hooks.failed.tap('SSR', (error) => {
      console.log(chalk.red('Client compilation failed'));
      console.log(error);
    });

    // HMR middleware
    server.use(e2k(webpackHotMiddleware(clientCompiler, { heartbeat: 5000 })));

    // Server render HMR
    const serverCompiler = webpack(serverConfig);
    const serverMfs = new MFS();
    serverCompiler.outputFileSystem = serverMfs;
    serverCompiler.watch({}, (error, stats: webpack.Stats) => {
      if (error) {
        console.log(chalk.red('Server critical error'));
        throw error;
      }

      const jsonStat = stats.toJson();
      if (stats.hasErrors()) {
        console.log(chalk.red('Client errors'));
        jsonStat.errors.forEach(err => console.error(err));
      }
      if (stats.hasWarnings()) {
        console.log(chalk.yellow('Client warnings'));
        jsonStat.errors.forEach(err => console.warn(err));
      }
      if (stats.hasErrors()) return;

      serverBundle = JSON.parse(readFile(serverMfs, 'vue-ssr-server-bundle.json'));
      update();
      onCompilationCompleted();
    });
  });
}
