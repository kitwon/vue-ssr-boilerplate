import Vue from 'vue';
import App from './App.vue';
import createRouter from './router';

Vue.config.productionTip = false;

export default function createApp() {
  const router = createRouter();
  const app = new Vue({
    router,
    render: h => h(App)
  }).$mount('#app');

  return { app, router };
}
