import createApp from './main';

export default (context: any) => new Promise((resolve, reject) => {
  const { app, router } = createApp();
  router.push(context.url);

  // eslint-disable-next-line
  router.onReady(() => {
    const matchedComponents = router.getMatchedComponents();
    if (!matchedComponents.length) {
      // eslint-disable-next-line
      return reject({ code: 404 });
    }

    resolve(app);
  }, reject);
});
