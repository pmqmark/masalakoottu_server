const { body } = require("express-validator");
const mongoose = require("mongoose");
const { payModeList, payStatusList, orderStatusList, deliveryTypeList } = require("../config/data");

// Helper function to check valid MongoDB ObjectId
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
            .withMessage("expectedDelivery must be a valid date"),

        body("userId")
            .custom(isValidObjectId)
            .withMessage("userId must be a valid ObjectId")
            .notEmpty()
            .withMessage("userId is required"),

        body("billAddress")
            .optional()
            .custom(isValidObjectId)
            .withMessage("billAddress must be a valid ObjectId"),

        body("shipAddress")
            .custom(isValidObjectId)
            .withMessage("shipAddress must be a valid ObjectId")
            .notEmpty()
            .withMessage("shipAddress is required"),

        body("discount")
            .optional()
            .isNumeric()
            .withMessage("discount must be a number"),

        body("deliveryType")
            .optional()
            .isIn(deliveryTypeList)
            .withMessage(`deliveryType must be one of: ${deliveryTypeList.join(", ")}`),

        body("deliveryCharge")
            .optional()
            .isNumeric()
            .withMessage("deliveryCharge must be a number"),

        body("couponCode")
            .optional()
            .isString()
            .withMessage("couponCode must be a string"),
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
            .withMessage("transactionId must be a string"),

        body("payStatus")
            .optional()
            .isIn(payStatusList)
            .withMessage(`payStatus must be one of: ${payStatusList.join(", ")}`),

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
            .withMessage("orderDate must be a valid date"),

        body("expectedDelivery")
            .optional()
            .isISO8601()
            .withMessage("expectedDelivery must be a valid date"),

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

        body("userId")
            .optional()
            .custom(isValidObjectId)
            .withMessage("userId must be a valid ObjectId"),

        body("billAddress")
            .optional()
            .custom(isValidObjectId)
            .withMessage("billAddress must be a valid ObjectId"),

        body("shipAddress")
            .optional()
            .custom(isValidObjectId)
            .withMessage("shipAddress must be a valid ObjectId"),

        body("discount")
            .optional()
            .isNumeric()
            .withMessage("discount must be a number"),

        body("deliveryType")
            .optional()
            .isIn(deliveryTypeList)
            .withMessage(`deliveryType must be one of: ${deliveryTypeList.join(", ")}`),

        body("deliveryCharge")
            .optional()
            .isNumeric()
            .withMessage("deliveryCharge must be a number"),

        body("couponId")
            .optional()
            .custom(isValidObjectId)
            .withMessage("couponId must be a valid ObjectId"),
    ]

}

module.exports = { orderValidator }