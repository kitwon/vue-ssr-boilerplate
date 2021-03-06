import Vue from 'vue';
import Router, { RouteConfig, RouterOptions } from 'vue-router';
import Home from './views/Home.vue';

Vue.use(Router);

const routes: RouteConfig[] = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ './views/About.vue')
  },
  {
    path: '*',
    redirect: { name: 'home' }
  }
];

export default function createRouter() {
  const routerOptions: RouterOptions = {
    mode: 'history',
    base: process.env.BASE_URL,
    // base: 'app',
    routes
  };
  const router = new Router(routerOptions);

  return router;
}
