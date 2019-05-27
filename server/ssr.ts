/* eslint import/no-dynamic-require: 0 */
/* eslint global-require: 0 */
import * as fs from 'fs';
import * as Router from 'koa-router';
import { createBundleRenderer } from 'vue-server-renderer';
import { Context } from 'koa';
import config from './config';
import setupDevServer from './scripts/dev-server';

const router = new Router();

function renderToString(context: Context, runner: any): Promise<string> {
  return new Promise((resolve, reject) => {
    runner.renderToString(context, (err: any, html: string) => {
      if (err) {
        console.error(err);
        reject(err);
      }
      resolve(html);
    });
  });
}

export default function createRouter(app) {
  const isProd = process.env.NODE_ENV === 'production';

  try {
    let renderer;
    let readyPromise;

    if (isProd) {
      const template = fs.readFileSync(config.ssr.template, 'utf-8');
      const serverBundle = require(config.ssr.server);
      const clientManifest = require(config.ssr.client);

      renderer = createBundleRenderer(serverBundle, {
        template,
        clientManifest
      });
    } else {
      readyPromise = setupDevServer({
        server: app,
        templatePath: config.ssr.template,
        onUpdate: ({ serverBundle, options }) => {
          renderer = createBundleRenderer(serverBundle, options);
        }
      });
    }

    const renderApp = async (ctx: Context) => {
      const html = await renderToString(ctx, renderer).catch((err) => {
        ctx.throw(500);
        console.error('Render page error: ');
        console.error(err);
      });

      ctx.set('Content-Type', 'text/html; charset=utf-8');
      ctx.body = html;
    };

    let ssr;
    if (isProd) {
      ssr = renderApp;
    } else {
      ssr = async (ctx: Context) => {
        await readyPromise;
        return renderApp(ctx);
      };
    }

    router.get('/app/', async (ctx: Context) => {
      await ssr(ctx);
    });

    return router;
  } catch (err) {
    console.warn('Create router error');
    console.warn(err);
    return router;
  }
}
