"use strict";

const { protect, adminOnly } = require("../middlewares/authMiddleware");
const claimRoutes = require("../routes/claimRoutes");
const lostItemsRoutes = require("../routes/lostItems.routes");
const foundItemsRoutes = require("../routes/foundItems.routes");
const userPostsRoutes = require("../routes/userPosts.routes");
const userResolvedItemsRoutes = require("../routes/user-resolved-items/userResolvedItems.routes");
const userProfileRoutes = require("../routes/user-profile/userProfile.routes");
const adminUsersRoutes = require("../routes/adminUsers.routes");
const adminClaimsRoutes = require("../routes/adminClaims.routes");
const adminReportsRoutes = require("../routes/admin-reports/adminReports.routes");
const adminDashboardRoutes = require("../routes/admin-dashboard/adminDashboard.routes");
const adminNotificationsRoutes = require("../routes/admin-notifications/adminNotifications.routes");

const getRouteLayers = (router) =>
  router.stack.filter((layer) => layer.route && layer.route.path);

const routeUsesMiddleware = (layer, middleware) =>
  layer.route.stack.some((routeLayer) => routeLayer.handle === middleware);

const findRouteLayer = (router, path, method) => {
  const methodKey = method.toLowerCase();
  return router.stack.find(
    (layer) =>
      layer.route &&
      layer.route.path === path &&
      Boolean(layer.route.methods[methodKey])
  );
};

const assertRoute = (router, descriptor) => {
  const layer = findRouteLayer(router, descriptor.path, descriptor.method);
  expect(layer).toBeDefined();

  if (descriptor.protect) {
    expect(routeUsesMiddleware(layer, protect)).toBe(true);
  }

  if (descriptor.adminOnly) {
    expect(routeUsesMiddleware(layer, adminOnly)).toBe(true);
  }
};

describe("security middleware coverage", () => {
  test("core vehicle routes always attach the protect middleware", () => {
    const protectedRouters = [
      { name: "claimRoutes", router: claimRoutes },
      { name: "userPostsRoutes", router: userPostsRoutes },
      { name: "userResolvedItemsRoutes", router: userResolvedItemsRoutes },
      { name: "userProfileRoutes", router: userProfileRoutes },
    ];

    protectedRouters.forEach(({ name, router }) => {
      getRouteLayers(router).forEach((layer) => {
        expect(
          routeUsesMiddleware(layer, protect)
        ).toBe(true);
      });
    });
  });

  test("admin routes apply protect and adminOnly middleware", () => {
    const adminRouters = [
      { name: "adminUsersRoutes", router: adminUsersRoutes },
      { name: "adminClaimsRoutes", router: adminClaimsRoutes },
      { name: "adminReportsRoutes", router: adminReportsRoutes },
      { name: "adminDashboardRoutes", router: adminDashboardRoutes },
      { name: "adminNotificationsRoutes", router: adminNotificationsRoutes },
    ];

    adminRouters.forEach(({ router }) => {
      getRouteLayers(router).forEach((layer) => {
        expect(routeUsesMiddleware(layer, protect)).toBe(true);
        expect(routeUsesMiddleware(layer, adminOnly)).toBe(true);
      });
    });
  });

  test("lost-items routes enforce their security contracts", () => {
    const requiredRoutes = [
      { path: "/my", method: "get", protect: true },
      { path: "/:id", method: "patch", protect: true, adminOnly: true },
      { path: "/:id", method: "delete", protect: true, adminOnly: true },
      { path: "/", method: "post", protect: true },
    ];

    requiredRoutes.forEach((descriptor) => assertRoute(lostItemsRoutes, descriptor));
  });

  test("found-items routes enforce their security contracts", () => {
    const requiredRoutes = [
      { path: "/", method: "post", protect: true },
      { path: "/:id", method: "patch", protect: true, adminOnly: true },
      { path: "/:id", method: "delete", protect: true, adminOnly: true },
    ];

    requiredRoutes.forEach((descriptor) => assertRoute(foundItemsRoutes, descriptor));
  });
});
