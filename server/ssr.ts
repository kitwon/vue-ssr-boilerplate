import * as fs from 'fs';
import * as path from 'path';
import * as Router from 'koa-router';
import { createBundleRenderer } from 'vue-server-renderer';
import { Context } from 'koa';

const template = fs.readFileSync(path.join(__dirname, '..', 'static/index.html'), 'utf-8');
const serverBundle = require('../static/vue-ssr-server-bundle.json');
const clientManifest = require('../static/vue-ssr-client-manifest.json');

const router = new Router();

const renderer = createBundleRenderer(serverBundle, {
  template,
  clientManifest
});

function renderToString(context: Context, runner: any) {
  return new Promise((resolve, reject) => {
    runner.renderToString(context, (err: any, html: string) => {
      if (err) {
        console.log(err);
        reject(html);
      }
      resolve(html);
    });
  });
}

router.get('/', async (ctx: Context) => {
  try {
    const html = await renderToString(ctx, renderer);
    ctx.body = html;
  } catch (err) {
    console.log(err);
    ctx.throw(500);
  }
});

export default router;
