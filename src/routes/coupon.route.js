const { calculateCouponCtrl, fetchAvailableCouponsCtrl, fetchAllCouponsCtrl, fetchCouponByIdCtrl, createCouponCtrl, updateCouponCtrl } = require("../controllers/coupon.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { roleChecker } = require("../middlewares/roleChecker.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { couponValidator } = require("../validators/coupon.validator");

const couponRouter = require("express").Router();

couponRouter.use(authMiddleware)

couponRouter.post("/calculate", calculateCouponCtrl);
couponRouter.get("/available", roleChecker(['user']), fetchAvailableCouponsCtrl);

couponRouter.get("/all", roleChecker(['admin']), fetchAllCouponsCtrl);
couponRouter.get("/:id", fetchCouponByIdCtrl);

couponRouter.use(roleChecker(['admin']))
couponRouter.post("", couponValidator.create, validate, createCouponCtrl);
couponRouter.put("/:id", couponValidator.update, validate, updateCouponCtrl);

module.exports = { couponRouter }
