import { join } from 'path';
import { publicPath } from '../../vue.config';
import { IConfigOptions } from '../types/index';

const resolvePath = (p: string) => join(__dirname, '../..', p);

const config: IConfigOptions = {
  serve: {
    port: 8089
  },
  ssr: {
    template: resolvePath('static/index.html'),
    server: resolvePath('static/vue-ssr-server-bundle.json'),
    client: resolvePath('static/vue-ssr-client-manifest.json'),
    baseURL: publicPath
  }
};

export default config;
