const { dashboardMetricsCtrl, orderStatusesAndCountsCtrl } = require("../controllers/dashboard.controller");

const dashboardRouter = require("express").Router();

dashboardRouter.get("/metrics", dashboardMetricsCtrl)
dashboardRouter.get("/order-status-count", orderStatusesAndCountsCtrl)

module.exports = { dashboardRouter }