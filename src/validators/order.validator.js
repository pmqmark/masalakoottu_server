const { body } = require("express-validator");
const mongoose = require("mongoose");
const { payModeList, payStatusList, orderStatusList, deliveryTypeList } = require("../config/data");

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const orderValidator = {
    create: [
        body("payMode")
            .isString()
            .isIn(payModeList)
            .withMessage(`payMode must be one of: ${payModeList.join(", ")}`)
            .notEmpty()
            .withMessage("payMode is required"),

        body("expectedDelivery")
            .optional()
            .isISO8601()
            .withMessage("expected Delivery must be a valid date"),

        body("discount")
            .optional()
            .isNumeric()
            .withMessage("discount must be a number"),

        body("deliveryType")
            .optional()
            .isIn(deliveryTypeList)
            .withMessage(`delivery Type must be one of: ${deliveryTypeList.join(", ")}`),

        body("deliveryCharge")
            .optional()
            .isNumeric()
            .withMessage("delivery Charge must be a number"),

        body("couponCode")
            .optional()
            .isString()
            .withMessage("coupon Code must be a string"),

        body("shipAddress")
            .custom(isValidObjectId)
            .withMessage("Invalid Shipping Address"),

    ],

    update: [
        body("payMode")
            .optional()
            .isString()
            .isIn(payModeList)
            .withMessage(`payMode must be one of: ${payModeList.join(", ")}`),

        body("transactionId")
            .optional()
            .isString()
            .withMessage("transaction Id must be a string"),

        body("payStatus")
            .optional()
            .isIn(payStatusList)
            .withMessage(`pay Status must be one of: ${payStatusList.join(", ")}`),

        body("status")
            .optional()
            .isIn(orderStatusList)
            .withMessage(`status must be one of: ${orderStatusList.join(", ")}`),

        body("amount")
            .optional()
            .isNumeric()
            .withMessage("amount must be a number"),

        body("orderDate")
            .optional()
            .isISO8601()
            .withMessage("order Date must be a valid date"),

        body("expectedDelivery")
            .optional()
            .isISO8601()
            .withMessage("expected Delivery must be a valid date"),

        body("items")
            .optional()
            .isArray({ min: 1 })
            .withMessage("items must be an array with at least one item"),

        body("items.*.productId")
            .optional()
            .custom(isValidObjectId)
            .withMessage("Each item must have a valid productId"),

        body("items.*.quantity")
            .optional()
            .isInt({ min: 1 })
            .withMessage("Each item must have a quantity of at least 1"),

        body("items.*.price")
            .optional()
            .isNumeric()
            .withMessage("Each item must have a valid price"),

        body("items.*.variations")
            .optional()
            .isArray()
            .withMessage("Variations must be an array"),

        body("billAddress")
            .optional()
            .custom(isValidObjectId)
            .withMessage("bill Address must be a valid ObjectId"),

        body("shipAddress")
            .optional()
            .custom(isValidObjectId)
            .withMessage("ship Address must be a valid ObjectId"),

        body("discount")
            .optional()
            .isNumeric()
            .withMessage("discount must be a number"),

        body("deliveryType")
            .optional()
            .isIn(deliveryTypeList)
            .withMessage(`delivery Type must be one of: ${deliveryTypeList.join(", ")}`),

        body("deliveryCharge")
            .optional()
            .isNumeric()
            .withMessage("delivery Charge must be a number"),

        body("couponId")
            .optional()
            .custom(isValidObjectId)
            .withMessage("couponId must be a valid ObjectId"),

        body("waybill")
            .optional()
            .isString()
            .withMessage("waybill must be a string"),

        body("deliveryPartner")
            .optional()
            .isString()
            .withMessage("delivery Partner must be a string"),

    ]
}

module.exports = { orderValidator }