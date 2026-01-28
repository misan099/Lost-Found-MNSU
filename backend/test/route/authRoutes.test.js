"use strict";

const { getRouteDefinitions } = require("./routeHelpers");
const authRoutes = require("../../routes/authRoutes");

describe("authRoutes definitions", () => {
  const routePayloads = getRouteDefinitions(authRoutes);
  const publicEndpoints = [
    { path: "/login", methods: ["post"] },
    { path: "/signup", methods: ["post"] },
    { path: "/forgot-password/email", methods: ["post"] },
    { path: "/forgot-password/verify", methods: ["post"] },
    { path: "/forgot-password/update-username", methods: ["post"] },
    { path: "/forgot-password/reset", methods: ["post"] },
    { path: "/status", methods: ["get"] },
  ];

  test("exposes all auth and forgot-password endpoints", () => {
    publicEndpoints.forEach((expected) =>
      expect(routePayloads).toContainEqual(expected)
    );
  });
});
