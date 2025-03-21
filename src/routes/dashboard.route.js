const { dashboardMetricsCtrl, orderStatusesAndCountsCtrl, getRecentOrders, getUserAddedCount, getBestSellingProducts, getSaleAnalytics } = require("../controllers/dashboard.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { roleChecker } = require("../middlewares/roleChecker.middleware");
const dashboardRouter = require("express").Router();

dashboardRouter.use(authMiddleware)
dashboardRouter.use(roleChecker(['admin']))

dashboardRouter.get("/metrics", dashboardMetricsCtrl)
dashboardRouter.get("/order-status-count", orderStatusesAndCountsCtrl)
dashboardRouter.get("/recent-orders", getRecentOrders)

dashboardRouter.get("/recent-users", getUserAddedCount)

dashboardRouter.get("/best-selling-products", getBestSellingProducts)

dashboardRouter.get("/sale-analytics", getSaleAnalytics)

module.exports = { dashboardRouter }