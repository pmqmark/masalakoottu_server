const express = require("express");
const { discountValidatorCreate, discountValidatorUpdate } = require("../validators/discount.validator");
const discountController = require("../controllers/discount.controller")
const { authMiddleware } = require("../middlewares/auth.middleware");
const { roleChecker } = require("../middlewares/roleChecker.middleware");
const discountRouter = express.Router();

discountRouter.get("/", discountController.getDiscountsCtrl);

discountRouter.post("/fetch-coupon-value", authMiddleware, discountController.fetchCouponValue);
discountRouter.get("/available-coupons", authMiddleware, discountController.fetchAvailableCouponsCtrl);

discountRouter.get("/:id", discountController.getDiscountByIdCtrl);

discountRouter.use(authMiddleware)
discountRouter.use(roleChecker(['admin']))

discountRouter.post("/", discountValidatorCreate, discountController.createDiscountCtrl);
discountRouter.put("/:id", discountValidatorUpdate, discountController.updateDiscountCtrl);
discountRouter.delete("/:id", discountController.deleteDiscountCtrl);

module.exports = { discountRouter };
