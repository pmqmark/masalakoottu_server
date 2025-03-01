const express = require("express");
const { discountValidator } = require("../validators/discount.validator");
const discountController = require("../controllers/discount.controller")
const { authMiddleware } = require("../middlewares/auth.middleware");
const { roleChecker } = require("../middlewares/roleChecker.middleware");
const discountRouter = express.Router();

discountRouter.use(authMiddleware)
discountRouter.use(roleChecker(['admin']))

discountRouter.post("/", discountValidator, discountController.createDiscountCtrl);
discountRouter.get("/", discountController.getDiscountsCtrl);
discountRouter.get("/available-coupons", discountController.fetchAvailableCouponsCtrl);
discountRouter.get("/:id", discountController.getDiscountByIdCtrl);
discountRouter.put("/:id", discountValidator, discountController.updateDiscountCtrl);
discountRouter.delete("/:id", discountController.deleteDiscountCtrl);

module.exports = { discountRouter };
