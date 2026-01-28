"use strict";

const getRouteDefinitions = (router) =>
  router.stack
    .filter((layer) => layer.route)
    .map((layer) => ({
      path: layer.route.path,
      methods: Object.keys(layer.route.methods).sort(),
    }));

module.exports = {
  getRouteDefinitions,
};
