import * as Koa from 'koa';
import * as serve from 'koa-static';
import { join } from 'path';
import config from './config';
import router from './ssr';

const app = new Koa();

app.use(router.routes()).use(router.allowedMethods());
app.use(serve(join(__dirname, '..', 'static')));

app.listen(config.serve.port, () => {
  console.log(`🚀 Server ready at http://localhost:${config.serve.port}`);
});
