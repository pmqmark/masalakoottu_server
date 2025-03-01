const express = require("express");
const { discountValidatorCreate, discountValidatorUpdate } = require("../validators/discount.validator");
const discountController = require("../controllers/discount.controller")
const { authMiddleware } = require("../middlewares/auth.middleware");
const { roleChecker } = require("../middlewares/roleChecker.middleware");
const discountRouter = express.Router();

discountRouter.use(authMiddleware)
discountRouter.get("/available-coupons", discountController.fetchAvailableCouponsCtrl);

discountRouter.use(roleChecker(['admin']))

discountRouter.post("/", discountValidatorCreate, discountController.createDiscountCtrl);
discountRouter.get("/", discountController.getDiscountsCtrl);
discountRouter.get("/:id", discountController.getDiscountByIdCtrl);
discountRouter.put("/:id", discountValidatorUpdate, discountController.updateDiscountCtrl);
discountRouter.delete("/:id", discountController.deleteDiscountCtrl);

module.exports = { discountRouter };
