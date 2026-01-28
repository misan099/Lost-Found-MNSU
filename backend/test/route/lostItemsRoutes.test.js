
"use strict";

const { getRouteDefinitions } = require("./routeHelpers");
const lostItemsRoutes = require("../../routes/lostItems.routes");

describe("lostItems routes definitions", () => {
  const routePayloads = getRouteDefinitions(lostItemsRoutes);
  const expectedRoutes = [
    { path: "/", methods: ["get"] },
    { path: "/my", methods: ["get"] },
    { path: "/:id", methods: ["patch"] },
    { path: "/:id", methods: ["delete"] },
    { path: "/", methods: ["post"] },
  ];

  test("exposes public, dashboard, and admin endpoints", () => {
    expectedRoutes.forEach((route) =>
      expect(routePayloads).toContainEqual(route)
    );
  });
});

