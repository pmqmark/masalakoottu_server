const express = require("express");
const { discountValidator } = require("../validators/discount.validator");
const discountController = require("../controllers/discount.controller")

const discountRouter = express.Router();

discountRouter.post("/", discountValidator, discountController.createDiscountCtrl);
discountRouter.post("/calculate", discountController.calculateDiscountCtrl);
discountRouter.get("/", discountController.getDiscountsCtrl);
discountRouter.get("/available-coupons", discountController.fetchAvailableCouponsCtrl);
discountRouter.get("/:id", discountController.getDiscountByIdCtrl);
discountRouter.put("/:id", discountValidator, discountController.updateDiscountCtrl);
discountRouter.delete("/:id", discountController.deleteDiscountCtrl);

module.exports = { discountRouter };
