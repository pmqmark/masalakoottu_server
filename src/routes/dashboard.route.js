const { dashboardMetricsCtrl, orderStatusesAndCountsCtrl } = require("../controllers/dashboard.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { roleChecker } = require("../middlewares/roleChecker.middleware");
const dashboardRouter = require("express").Router();

dashboardRouter.use(authMiddleware)
dashboardRouter.use(roleChecker(['admin']))

dashboardRouter.get("/metrics", dashboardMetricsCtrl)
dashboardRouter.get("/order-status-count", orderStatusesAndCountsCtrl)

module.exports = { dashboardRouter }