/* eslint import/no-extraneous-dependencies: 0 */
import { join } from 'path';

/**
 * Refer to the source code from cli-service
 * https://github.com/vuejs/vue-cli/blob/dev/packages/%40vue/cli-service/lib/PluginAPI.js#L137
 */
const Service = require('@vue/cli-service/lib/Service');

const service = new Service(join(__dirname, '../..'));
service.init(process.env.NODE_ENV || 'development');

process.env.SSR_TARGET = 'client';
const clientConfig = service.resolveWebpackConfig();
process.env.SSR_TARGET = 'server';
const serverConfig = service.resolveWebpackConfig();

export {
  clientConfig,
  serverConfig
};
