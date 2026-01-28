"use strict";

const { getRouteDefinitions } = require("./routeHelpers");
const foundItemsRoutes = require("../../routes/foundItems.routes");

describe("foundItems routes definitions", () => {
  const routePayloads = getRouteDefinitions(foundItemsRoutes);
  const expectedRoutes = [
    { path: "/", methods: ["post"] },
    { path: "/", methods: ["get"] },
    { path: "/:id", methods: ["patch"] },
    { path: "/:id", methods: ["delete"] },
    { path: "/recent", methods: ["get"] },
  ];

  test("registers the find and admin endpoints", () => {
    expectedRoutes.forEach((route) =>
      expect(routePayloads).toContainEqual(route)
    );
  });
});
