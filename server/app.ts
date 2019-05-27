import * as Koa from 'koa';
import * as serve from 'koa-static';
import { join } from 'path';
import config from './config';
import createRouter from './ssr';

const app = new Koa();
const router = createRouter(app);

app.use(serve(join(__dirname, '..', 'static')));
app.use(router.routes()).use(router.allowedMethods());

app.listen(config.serve.port, () => {
  console.log(`🚀 Server ready at http://localhost:${config.serve.port}`);
});
