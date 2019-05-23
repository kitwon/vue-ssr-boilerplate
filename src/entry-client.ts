import createApp from './main';
import './registerServiceWorker';

const { app } = createApp();

app.$mount('#app');
