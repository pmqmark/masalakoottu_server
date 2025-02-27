const { calculateCouponCtrl, fetchAvailableCouponsCtrl, fetchAllCouponsCtrl, fetchCouponByIdCtrl, createCouponCtrl, updateCouponCtrl } = require("../controllers/coupon.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { roleChecker } = require("../middlewares/roleChecker.middleware");
const { validate } = require("../middlewares/validate.middleware");

const couponRouter = require("express").Router();

couponRouter.use(authMiddleware)

couponRouter.post("/calculate", calculateCouponCtrl);
couponRouter.get("/available", roleChecker(['user']), fetchAvailableCouponsCtrl);

couponRouter.get("/all", roleChecker(['admin']), fetchAllCouponsCtrl);
couponRouter.get("/:id", fetchCouponByIdCtrl );

couponRouter.use(roleChecker(['admin']))
couponRouter.post("", createCouponCtrl);
couponRouter.put("/:id", updateCouponCtrl);

module.exports = { couponRouter }
