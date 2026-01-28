"use strict";

const { getRouteDefinitions } = require("./routeHelpers");
const claimRoutes = require("../../routes/claimRoutes");

describe("claimRoutes definitions", () => {
  const routePayloads = getRouteDefinitions(claimRoutes);
  const expectedRoutes = [
    { path: "/", methods: ["post"] },
    { path: "/with-messages", methods: ["get"] },
    { path: "/:claimId/messages", methods: ["get"] },
    { path: "/:claimId/messages", methods: ["post"] },
    { path: "/:claimId/messages/:messageId", methods: ["delete"] },
    { path: "/:claimId/thread", methods: ["delete"] },
    { path: "/:claimId/confirm-owner", methods: ["patch"] },
    { path: "/:claimId/confirm-finder", methods: ["patch"] },
  ];

  test("routes cover all claim-related endpoints", () => {
    expectedRoutes.forEach((route) =>
      expect(routePayloads).toContainEqual(route)
    );
  });
});
